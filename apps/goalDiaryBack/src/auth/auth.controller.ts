import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { Request } from 'express';

import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req, @Res({ passthrough: true }) res: Response) {
    return res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.googleLogin(req);
    const isProduction = process.env.NODE_ENV === 'production';

    // Cross-origin 배포 환경을 위한 쿠키 설정
    const accessCookieOptions = {
      maxAge: 1000 * 60 * 15, // 15분
      secure: isProduction, // HTTPS에서만
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax', // Cross-origin 허용
      path: '/',
    };

    const refreshCookieOptions = {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      httpOnly: true, // XSS 방지
      path: '/',
    };

    res.cookie('access_token', tokens.accessToken, accessCookieOptions);
    res.cookie('refresh_token', tokens.refreshToken, refreshCookieOptions);

    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  async login(
    @Body() data: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signIn(data);
    const isProduction = process.env.NODE_ENV === 'production';

    // Cross-origin 배포 환경을 위한 쿠키 설정
    const accessCookieOptions = {
      maxAge: 1000 * 60 * 15, // 15분
      secure: isProduction, // HTTPS에서만
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax', // Cross-origin 허용
      path: '/',
    };

    const refreshCookieOptions = {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      httpOnly: true, // XSS 방지
      path: '/',
    };

    res.cookie('access_token', tokens.accessToken, accessCookieOptions);
    res.cookie('refresh_token', tokens.refreshToken, refreshCookieOptions);

    // 모바일 앱을 위해 JSON으로도 토큰 반환
    return {
      message: '로그인 성공',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @UseGuards(AccessTokenGuard)
  @Post('signout')
  signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = req.user['sub'];
    this.authService.signOut(userId);
    const isProduction = process.env.NODE_ENV === 'production';

    // // 쿠키 설정은 컨트롤러에서!
    res.cookie('access_token', '', {
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 0,
      path: '/',
    });

    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 0,
      path: '/',
    });

    return {
      message: '로그아웃 성공',
    };
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshAllTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      return await this.refreshTokens(req, res);
    } catch (error) {
      this.clearCookies(res);
      throw error;
    }
  }

  private async refreshTokens(req: Request, res: Response) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    const tokens = await this.authService.refreshAllTokens(
      userId,
      refreshToken,
    );

    const isProduction = process.env.NODE_ENV === 'production';

    // Cross-origin 배포 환경을 위한 쿠키 설정
    const accessCookieOptions = {
      maxAge: 1000 * 60 * 15, // 15분
      secure: isProduction, // HTTPS에서만
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax', // Cross-origin 허용
      path: '/',
    };

    const refreshCookieOptions = {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      httpOnly: true, // XSS 방지
      path: '/',
    };

    res.cookie('access_token', tokens.accessToken, accessCookieOptions);
    res.cookie('refresh_token', tokens.refreshToken, refreshCookieOptions);

    return {
      message: '토큰 갱신 성공',
    };
  }

  private clearCookies(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';

    // 여러 옵션으로 쿠키 삭제 시도
    const clearCookieOptions = {
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
    };

    // 방법 1: 기본 옵션으로 삭제
    res.cookie('access_token', '', {
      ...clearCookieOptions,
      maxAge: 0,
    });
    res.cookie('refresh_token', '', {
      ...clearCookieOptions,
      httpOnly: true,
      maxAge: 0,
    });
  }
}
