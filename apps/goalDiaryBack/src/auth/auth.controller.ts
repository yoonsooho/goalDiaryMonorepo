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
  async googleAuth() {
    // Google OAuth 시작 - Passport가 자동으로 Google로 리다이렉트
    // mobile=true 쿼리 파라미터는 Guard에서 쿠키로 저장됨
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const tokens = await this.authService.googleLogin(req);
      const isProduction = process.env.NODE_ENV === 'production';

      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error('토큰 생성에 실패했습니다.');
      }

      const requestMobileFlag = (req as any)._isMobileOAuth === true;
      const mobileCookie = req.cookies?.google_oauth_mobile === 'true';
      const state = req.query?.state as string;
      const mobileQuery = req.query?.mobile;
      const userAgent = req.headers['user-agent'] || '';
      const referer = req.headers['referer'] || '';

      const hasMobileFlag =
        requestMobileFlag ||
        mobileCookie ||
        req.user?.isMobile === true ||
        state === 'mobile' ||
        mobileQuery === 'true' ||
        userAgent.includes('Expo') ||
        userAgent.includes('ReactNative');

      const isDefinitelyWebRequest =
        referer &&
        !referer.includes('accounts.google.com') &&
        !referer.includes('google.com') &&
        !referer.includes('localhost:3001') &&
        !referer.includes('onrender.com') &&
        (referer.includes('goaldiary.vercel.app') ||
          referer.includes('localhost:3000')) &&
        userAgent.includes('Mozilla') &&
        !userAgent.includes('Expo') &&
        !userAgent.includes('ReactNative') &&
        !userAgent.includes('Mobile');

      let isMobile =
        state === 'mobile' || hasMobileFlag || !isDefinitelyWebRequest;

      if (
        !isMobile &&
        (!referer ||
          referer.includes('google.com') ||
          referer.includes('onrender.com'))
      ) {
        isMobile = true;
      }

      if (mobileCookie) {
        res.clearCookie('google_oauth_mobile');
      }

      if (!isMobile && requestMobileFlag) {
        return this.sendMobileRedirect(res, tokens);
      }

      if (
        !isMobile &&
        !isDefinitelyWebRequest &&
        (!referer ||
          referer.includes('google.com') ||
          referer.includes('onrender.com'))
      ) {
        return this.sendMobileRedirect(res, tokens);
      }

      if (isMobile) {
        return this.sendMobileRedirect(res, tokens);
      }

      return this.sendWebRedirect(res, tokens, isProduction);
    } catch (error) {
      console.error('Google callback error:', error);
      throw error;
    }
  }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const tokens = await this.authService.signUp(signUpDto);
    return {
      message: '회원가입 성공',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Post('signin')
  async login(
    @Body() data: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signIn(data);
    const isProduction = process.env.NODE_ENV === 'production';

    const accessCookieOptions = {
      maxAge: 1000 * 60 * 15,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
    };

    const refreshCookieOptions = {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      httpOnly: true,
      path: '/',
    };

    res.cookie('access_token', tokens.accessToken, accessCookieOptions);
    res.cookie('refresh_token', tokens.refreshToken, refreshCookieOptions);

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

    const accessCookieOptions = {
      maxAge: 1000 * 60 * 15,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
    };

    const refreshCookieOptions = {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      httpOnly: true,
      path: '/',
    };

    res.cookie('access_token', tokens.accessToken, accessCookieOptions);
    res.cookie('refresh_token', tokens.refreshToken, refreshCookieOptions);

    return {
      message: '토큰 갱신 성공',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private clearCookies(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const clearCookieOptions = {
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
      maxAge: 0,
    };

    res.cookie('access_token', '', clearCookieOptions);
    res.cookie('refresh_token', '', {
      ...clearCookieOptions,
      httpOnly: true,
    });
  }

  private sendMobileRedirect(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const mobileRedirectUrl = `goaldiary://auth/callback?accessToken=${encodeURIComponent(
      tokens.accessToken,
    )}&refreshToken=${encodeURIComponent(tokens.refreshToken)}`;

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>로그인 완료</title>
        </head>
        <body>
          <p>로그인 중...</p>
          <script>
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'GOOGLE_LOGIN_SUCCESS',
                accessToken: "${tokens.accessToken}",
                refreshToken: "${tokens.refreshToken}",
                redirectUrl: "${mobileRedirectUrl}"
              }));
              setTimeout(function() {
                window.location.href = "${mobileRedirectUrl}";
              }, 500);
            } else {
              window.location.href = "${mobileRedirectUrl}";
            }
          </script>
        </body>
      </html>
    `);
  }

  private sendWebRedirect(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
    isProduction: boolean,
  ) {
    const accessCookieOptions = {
      maxAge: 1000 * 60 * 15,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
    };

    const refreshCookieOptions = {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      httpOnly: true,
      path: '/',
    };

    res.cookie('access_token', tokens.accessToken, accessCookieOptions);
    res.cookie('refresh_token', tokens.refreshToken, refreshCookieOptions);

    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
}
