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

      // 모바일 앱 요청인지 확인
      // 기본적으로 모든 요청을 모바일로 처리하고, 명확한 웹 요청만 제외
      const requestMobileFlag = (req as any)._isMobileOAuth === true;
      const mobileCookie = req.cookies?.google_oauth_mobile === 'true';
      const state = req.query?.state as string;
      const mobileQuery = req.query?.mobile;
      const userAgent = req.headers['user-agent'] || '';
      const referer = req.headers['referer'] || '';

      // 모바일 요청인지 확인
      // 기본적으로 모든 요청을 모바일로 처리하고, 명확한 웹 요청만 제외
      const hasMobileFlag =
        requestMobileFlag ||
        mobileCookie ||
        req.user?.isMobile === true ||
        state === 'mobile' ||
        mobileQuery === 'true' ||
        userAgent.includes('Expo') ||
        userAgent.includes('ReactNative');

      // 명확한 웹 요청인지 확인 (웹 브라우저에서 직접 온 요청만)
      // Referer가 프론트엔드 도메인이고, Google 도메인이 아니고, User-Agent가 일반 브라우저인 경우만 웹으로 처리
      // Google OAuth 콜백은 Referer가 Google 도메인이거나 없을 수 있으므로 기본적으로 모바일로 처리
      const isDefinitelyWebRequest =
        referer &&
        !referer.includes('accounts.google.com') && // Google OAuth 리다이렉트는 제외
        !referer.includes('google.com') && // Google 도메인은 제외
        !referer.includes('localhost:3001') && // 로컬 백엔드는 제외 (모바일에서 접근 불가)
        !referer.includes('onrender.com') && // Render 서버는 제외
        (referer.includes('goaldiary.vercel.app') ||
          referer.includes('localhost:3000')) &&
        userAgent.includes('Mozilla') &&
        !userAgent.includes('Expo') &&
        !userAgent.includes('ReactNative') &&
        !userAgent.includes('Mobile'); // Mobile User-Agent는 제외

      // 기본적으로 모든 요청을 모바일로 처리
      // 명확한 웹 요청이고 모바일 플래그가 없을 때만 웹으로 처리
      // Google OAuth 콜백은 기본적으로 모바일로 처리 (Referer가 Google이거나 없을 수 있음)
      // state 파라미터가 'mobile'이면 무조건 모바일로 처리
      let isMobile =
        state === 'mobile' || // state 파라미터가 가장 확실한 방법
        hasMobileFlag ||
        !isDefinitelyWebRequest; // 명확한 웹 요청이 아니면 모바일로 처리

      // 프로덕션 환경에서도 Referer가 없거나 Google/onrender.com이면 모바일로 처리
      if (
        !isMobile &&
        (!referer ||
          referer.includes('google.com') ||
          referer.includes('onrender.com'))
      ) {
        isMobile = true;
      }

      // 쿠키 삭제 (사용 후 정리)
      if (mobileCookie) {
        res.clearCookie('google_oauth_mobile');
      }

      console.log('Google callback - Mobile detection:', {
        requestMobileFlag,
        mobileCookie,
        mobileQuery,
        state,
        allQueryParams: req.query, // 모든 쿼리 파라미터 로깅
        userAgent: userAgent.substring(0, 100),
        reqUserIsMobile: req.user?.isMobile,
        hasMobileFlag,
        isDefinitelyWebRequest,
        isMobile,
        redirectTarget: isMobile
          ? 'MOBILE (goaldiary://)'
          : 'WEB (goaldiary.vercel.app)',
        allCookies: Object.keys(req.cookies || {}),
        cookieValue: req.cookies?.google_oauth_mobile,
        referer: req.headers['referer'],
      });

      // 모바일 감지가 실패했지만 request 객체에 플래그가 있으면 모바일로 처리
      if (!isMobile && requestMobileFlag) {
        console.warn('Request mobile flag detected - forcing mobile redirect');
        const mobileRedirectUrl = `goaldiary://auth/callback?accessToken=${encodeURIComponent(tokens.accessToken)}&refreshToken=${encodeURIComponent(tokens.refreshToken)}`;
        res.redirect(mobileRedirectUrl);
        return;
      }

      // 추가 안전장치: Referer가 없거나 Google/onrender.com이면 모바일로 처리
      // 단, 명확한 웹 요청(localhost:3000 또는 goaldiary.vercel.app)은 제외
      if (
        !isMobile &&
        !isDefinitelyWebRequest && // 명확한 웹 요청이 아닐 때만
        (!referer ||
          referer.includes('google.com') ||
          referer.includes('onrender.com'))
      ) {
        console.warn(
          'Referer indicates mobile request - forcing mobile redirect',
        );
        const mobileRedirectUrl = `goaldiary://auth/callback?accessToken=${encodeURIComponent(tokens.accessToken)}&refreshToken=${encodeURIComponent(tokens.refreshToken)}`;
        res.redirect(mobileRedirectUrl);
        return;
      }

      // 기본적으로 모바일로 처리하고, 명확한 웹 요청만 제외
      // Google OAuth 콜백은 Referer가 Google 도메인이거나 없을 수 있으므로 기본적으로 모바일로 처리
      if (isMobile) {
        // 모바일 앱의 경우 리다이렉트 URL에 토큰을 쿼리 파라미터로 포함
        // URL 인코딩을 통해 특수문자 처리
        if (!tokens.accessToken || !tokens.refreshToken) {
          console.error('Tokens are missing:', {
            hasAccessToken: !!tokens.accessToken,
            hasRefreshToken: !!tokens.refreshToken,
          });
          throw new Error('토큰 생성에 실패했습니다.');
        }

        const mobileRedirectUrl = `goaldiary://auth/callback?accessToken=${encodeURIComponent(tokens.accessToken)}&refreshToken=${encodeURIComponent(tokens.refreshToken)}`;
        console.log(
          'Mobile redirect URL:',
          mobileRedirectUrl
            .replace(/accessToken=[^&]+/, 'accessToken=***')
            .replace(/refreshToken=[^&]+/, 'refreshToken=***'),
        );

        // WebView에서 딥링크를 감지할 수 있도록 HTML 페이지로 리다이렉트
        // WebView는 HTTP 리다이렉트를 딥링크로 처리하지 못하므로 HTML로 감싸서 전달
        // ReactNativeWebView.postMessage를 사용하여 토큰 전달
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
                // ReactNativeWebView가 있는 경우 (WebView 내부)
                if (window.ReactNativeWebView) {
                  // 토큰을 메시지로 전달
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'GOOGLE_LOGIN_SUCCESS',
                    accessToken: "${tokens.accessToken}",
                    refreshToken: "${tokens.refreshToken}",
                    redirectUrl: "${mobileRedirectUrl}"
                  }));
                  
                  // 딥링크로도 리다이렉트 시도
                  setTimeout(function() {
                    window.location.href = "${mobileRedirectUrl}";
                  }, 500);
                } else {
                  // 일반 브라우저인 경우 딥링크로 리다이렉트
                  window.location.href = "${mobileRedirectUrl}";
                }
              </script>
            </body>
          </html>
        `);
        return;
      }

      // 명확한 웹 요청인 경우에만 웹으로 리다이렉트
      console.log('Web request detected - redirecting to frontend');
      // 웹의 경우 쿠키 설정 및 리다이렉트
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
    } catch (error) {
      console.error('Google callback error:', error);
      throw error;
    }
  }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      const tokens = await this.authService.signUp(signUpDto);

      // 모바일 앱을 위해 JSON으로도 토큰 반환 (회원가입 후 자동 로그인)
      return {
        message: '회원가입 성공',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw error;
    }
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

    // 모바일 앱을 위해 JSON으로도 토큰 반환
    return {
      message: '토큰 갱신 성공',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
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
