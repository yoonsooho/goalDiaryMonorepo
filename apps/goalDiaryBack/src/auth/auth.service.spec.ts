import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { UserRefreshToken } from './entities/user-refresh-token.entity';
import { User } from 'src/users/users.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import * as argon2 from 'argon2';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  verify: jest.fn(),
}));

const mockUser = {
  id: 'user-uuid-1',
  userId: 'test@test.com',
  username: 'Test User',
  password: 'hashedPassword',
  socialId: null,
  social: null,
} as User;

const mockTokenEntity = {
  id: 'token-uuid-1',
  user: mockUser,
  tokenHash: 'hashed',
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
} as UserRefreshToken;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenRepo: {
    find: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(async () => {
    const mockRefreshTokenRepo = {
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUserId: jest.fn(),
            findById: jest.fn(),
            findBySocialId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_ACCESS_SECRET') return 'access-secret';
              if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
              return undefined;
            }),
          },
        },
        {
          provide: getRepositoryToken(UserRefreshToken),
          useValue: mockRefreshTokenRepo,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    refreshTokenRepo = mockRefreshTokenRepo as any;

    jest.clearAllMocks();
    (argon2.verify as jest.Mock).mockReset();
    (argon2.hash as jest.Mock).mockResolvedValue('hashed');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signOut', () => {
    it('refreshToken이 없으면 DB를 수정하지 않는다 (전체 기기 로그아웃 방지)', async () => {
      await service.signOut('user-uuid-1', undefined);
      await service.signOut('user-uuid-1');

      expect(refreshTokenRepo.find).not.toHaveBeenCalled();
      expect(refreshTokenRepo.delete).not.toHaveBeenCalled();
    });

    it('refreshToken이 있으면 해당 토큰과 일치하는 row만 삭제한다', async () => {
      refreshTokenRepo.find.mockResolvedValue([mockTokenEntity]);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await service.signOut('user-uuid-1', 'my-refresh-token');

      expect(refreshTokenRepo.find).toHaveBeenCalled();
      expect(argon2.verify).toHaveBeenCalledWith('hashed', 'my-refresh-token');
      expect(refreshTokenRepo.delete).toHaveBeenCalledWith({
        id: 'token-uuid-1',
      });
    });

    it('일치하는 토큰이 없으면 delete를 호출하지 않는다', async () => {
      refreshTokenRepo.find.mockResolvedValue([mockTokenEntity]);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await service.signOut('user-uuid-1', 'wrong-token');

      expect(refreshTokenRepo.find).toHaveBeenCalled();
      expect(refreshTokenRepo.delete).not.toHaveBeenCalled();
    });

    it('활성 토큰이 없으면 find만 호출하고 delete는 호출하지 않는다', async () => {
      refreshTokenRepo.find.mockResolvedValue([]);

      await service.signOut('user-uuid-1', 'some-token');

      expect(refreshTokenRepo.find).toHaveBeenCalled();
      expect(refreshTokenRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('refreshAllTokens', () => {
    it('사용자가 없으면 ForbiddenException을 던진다', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.refreshAllTokens('user-uuid-1', 'refresh-token'),
      ).rejects.toThrow(ForbiddenException);

      expect(usersService.findById).toHaveBeenCalledWith('user-uuid-1');
    });

    it('활성 refresh token이 없으면 ForbiddenException을 던진다', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      refreshTokenRepo.find.mockResolvedValue([]);

      await expect(
        service.refreshAllTokens('user-uuid-1', 'refresh-token'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('전달된 refreshToken과 일치하는 토큰이 없으면 ForbiddenException을 던진다', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      refreshTokenRepo.find.mockResolvedValue([mockTokenEntity]);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.refreshAllTokens('user-uuid-1', 'wrong-token'),
      ).rejects.toThrow(ForbiddenException);

      expect(refreshTokenRepo.save).not.toHaveBeenCalled();
    });

    it('일치하는 토큰이 있으면 새 토큰을 발급하고 해당 row를 갱신한다 (로테이션)', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      refreshTokenRepo.find.mockResolvedValue([{ ...mockTokenEntity }]);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync
        .mockResolvedValueOnce('new-access')
        .mockResolvedValueOnce('new-refresh');

      const result = await service.refreshAllTokens(
        'user-uuid-1',
        'valid-refresh',
      );

      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
      expect(refreshTokenRepo.save).toHaveBeenCalled();
      const saved = refreshTokenRepo.save.mock.calls[0][0];
      expect(saved.tokenHash).toBe('hashed');
      expect(saved.expiresAt).toBeDefined();
    });
  });

  describe('signIn', () => {
    it('사용자가 없으면 BadRequestException을 던진다', async () => {
      usersService.findByUserId.mockResolvedValue(null);

      await expect(
        service.signIn({ userId: 'unknown', password: 'pw' } as SignInDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('비밀번호가 없는 계정(소셜 전용)이면 BadRequestException을 던진다', async () => {
      usersService.findByUserId.mockResolvedValue({
        ...mockUser,
        password: null,
      });

      await expect(
        service.signIn({
          userId: 'test@test.com',
          password: 'pw',
        } as SignInDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('비밀번호가 일치하지 않으면 BadRequestException을 던진다', async () => {
      usersService.findByUserId.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.signIn({
          userId: 'test@test.com',
          password: 'wrong',
        } as SignInDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('성공 시 토큰을 반환하고 updateRefreshToken을 호출한다', async () => {
      usersService.findByUserId.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      refreshTokenRepo.create.mockReturnValue({});
      refreshTokenRepo.save.mockResolvedValue({});

      const result = await service.signIn({
        userId: 'test@test.com',
        password: 'correct',
      } as SignInDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(refreshTokenRepo.save).toHaveBeenCalled();
    });
  });

  describe('signUp', () => {
    it('이미 존재하는 userId면 BadRequestException을 던진다', async () => {
      usersService.findByUserId.mockResolvedValue(mockUser);

      await expect(
        service.signUp({
          userId: 'test@test.com',
          username: 'Test',
          password: 'password123',
        } as SignUpDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('비밀번호가 없으면 BadRequestException을 던진다', async () => {
      usersService.findByUserId.mockResolvedValue(null);

      await expect(
        service.signUp({
          userId: 'new@test.com',
          username: 'New',
          password: '',
        } as SignUpDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('성공 시 새 유저 생성 후 토큰을 반환하고 refresh token row를 생성한다', async () => {
      usersService.findByUserId.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      refreshTokenRepo.create.mockReturnValue({});
      refreshTokenRepo.save.mockResolvedValue({});

      const result = await service.signUp({
        userId: 'new@test.com',
        username: 'New User',
        password: 'password123',
      } as SignUpDto);

      expect(usersService.create).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(refreshTokenRepo.save).toHaveBeenCalled();
    });
  });

  describe('googleLogin', () => {
    it('req.user가 없으면 BadRequestException을 던진다', async () => {
      await expect(service.googleLogin({})).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.googleLogin({ user: null })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('기존 소셜 유저가 있으면 토큰을 발급하고 refresh token row를 생성한다', async () => {
      const req = {
        user: {
          email: 'google@test.com',
          username: 'Google User',
          socialId: 'google-123',
          social: 'google',
        },
      };
      usersService.findBySocialId.mockResolvedValue(mockUser);
      refreshTokenRepo.create.mockReturnValue({});
      refreshTokenRepo.save.mockResolvedValue({});

      const result = await service.googleLogin(req);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(refreshTokenRepo.save).toHaveBeenCalled();
    });
  });
});
