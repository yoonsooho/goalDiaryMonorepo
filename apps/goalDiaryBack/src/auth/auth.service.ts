import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import * as argon2 from 'argon2';
import { User } from 'src/users/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { UserRefreshToken } from './entities/user-refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(UserRefreshToken)
    private readonly refreshTokenRepo: Repository<UserRefreshToken>,
  ) {}

  // signUp
  async signUp(data: SignUpDto): Promise<any> {
    // user exists?
    const existUser = await this.usersService.findByUserId(data.userId);

    if (existUser) {
      throw new BadRequestException(
        `${data.userId}로 이미 가입된 계정이 있습니다.`,
      );
    }

    // password validation
    if (!data.password) {
      throw new BadRequestException('비밀번호를 입력해주세요.');
    }

    // password encryption
    const hashedPassword = await this.hashFn(data.password);
    const newUser = await this.usersService.create({
      ...data,
      password: hashedPassword,
    });

    // user대신 token을 반환
    const tokens = await this.getTokens(newUser);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    return tokens;
  }

  async googleLogin(req): Promise<any> {
    if (!req.user) {
      throw new BadRequestException('Google Authentication failed');
    }

    const { email, username, socialId, social } = req.user;

    let user = await this.usersService.findBySocialId(socialId, social);

    if (!user) {
      // 이메일로 이미 존재하는 유저인지 확인
      const userByEmail = await this.usersService.findByUserId(email);
      if (userByEmail) {
        // 이미 존재하는 유저라면 소셜 정보를 업데이트
        await this.usersService.update(userByEmail.id, { socialId, social });
        user = userByEmail;
      } else {
        // 새로운 유저 생성
        user = await this.usersService.create({
          userId: email,
          username: username,
          socialId,
          social,
          password: null,
        });
      }
    }

    const tokens = await this.getTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // signIn
  async signIn(data: SignInDto): Promise<any> {
    const user = await this.usersService.findByUserId(data.userId);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    if (!user.password) {
      throw new BadRequestException(
        '비밀번호가 설정되지 않은 계정입니다. 소셜 로그인을 이용해주세요.',
      );
    }

    const isPasswordMatched = await argon2.verify(user.password, data.password);
    if (!isPasswordMatched) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    const tokens = await this.getTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async signOut(userId: string, refreshToken?: string) {
    // refreshToken이 없으면 특정 기기를 식별할 수 없으므로 아무것도 하지 않음
    // (전체 기기 로그아웃 방지 - 클라이언트는 로컬 토큰만 삭제)
    if (!refreshToken) {
      return;
    }

    // 특정 기기만 로그아웃: 해당 refresh token과 일치하는 row만 삭제
    const now = new Date();
    const activeTokens = await this.refreshTokenRepo.find({
      where: {
        user: { id: userId } as User,
        expiresAt: MoreThan(now),
      },
    });

    for (const tokenEntity of activeTokens) {
      const isMatch = await argon2.verify(tokenEntity.tokenHash, refreshToken);
      if (isMatch) {
        await this.refreshTokenRepo.delete({ id: tokenEntity.id });
        return;
      }
    }

    // 일치하는 토큰이 없으면 이미 삭제되었거나 만료된 토큰이므로 정상 처리
    // (사용자가 이미 로그아웃된 상태일 수 있음)
  }

  async refreshAllTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException('사용자를 찾을 수 없습니다.');
    }

    // 1) 해당 유저의 활성화된(만료되지 않은) 토큰들 조회
    const now = new Date();
    const activeTokens = await this.refreshTokenRepo.find({
      where: {
        user: { id: userId } as User,
        expiresAt: MoreThan(now),
      },
      relations: ['user'],
    });

    if (!activeTokens || activeTokens.length === 0) {
      throw new ForbiddenException('refresh token이 존재하지 않습니다.');
    }

    // 2) 전달된 refreshToken과 해시가 일치하는 토큰 찾기
    let matchedToken: UserRefreshToken | null = null;
    for (const tokenEntity of activeTokens) {
      const isMatch = await argon2.verify(tokenEntity.tokenHash, refreshToken);
      if (isMatch) {
        matchedToken = tokenEntity;
        break;
      }
    }

    if (!matchedToken) {
      throw new ForbiddenException('refresh token이 일치하지 않습니다.');
    }

    // 3) 새 토큰 발급 (로테이션)
    const tokens = await this.getTokens(user);

    // 4) 기존 row에 새 refresh 토큰 해시와 만료 시간 업데이트 (기기별 1개 유지)
    const newHashed = await this.hashFn(tokens.refreshToken);
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7); // 7일 유효

    matchedToken.tokenHash = newHashed;
    matchedToken.expiresAt = newExpiresAt;
    await this.refreshTokenRepo.save(matchedToken);

    // 5) 만료된 토큰 정리 (백그라운드에서 실행, 에러가 나도 메인 플로우에 영향 없음)
    this.cleanupExpiredTokens().catch((error) => {
      console.error('만료된 토큰 정리 중 오류:', error);
    });

    return tokens;
  }

  private async hashFn(data: string): Promise<string> {
    return argon2.hash(data);
  }

  /**
   * 만료된 refresh token을 정리하는 메서드
   * refreshAllTokens 호출 시마다 백그라운드에서 실행
   */
  private async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.refreshTokenRepo.delete({
      expiresAt: LessThan(now),
    });
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashFn(refreshToken);

    const expiresAt = new Date();
    // refresh 토큰 만료 시간: 현재 + 7일
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenEntity = this.refreshTokenRepo.create({
      user: { id: userId } as User,
      tokenHash: hashedRefreshToken,
      expiresAt,
    });

    await this.refreshTokenRepo.save(tokenEntity);
  }

  private async getTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          userId: user.userId,
        },
        {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
          expiresIn: '20m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          userId: user.userId,
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
