import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // mobile=true 쿼리 파라미터가 있으면 request 객체에 저장 (콜백에서 확인)
    // 쿠키는 cross-origin 리다이렉트에서 사라질 수 있으므로 request 객체에도 저장
    const isMobile = request.query?.mobile === 'true';
    if (isMobile) {
      // request 객체에 모바일 정보 저장 (세션처럼 사용)
      request._isMobileOAuth = true;

      const isProduction = process.env.NODE_ENV === 'production';
      // Cross-origin 리다이렉트를 위해 sameSite: 'none'과 secure: true 필수
      response.cookie('google_oauth_mobile', 'true', {
        maxAge: 1000 * 60 * 5, // 5분 (OAuth 플로우 완료 시간)
        httpOnly: false, // JavaScript에서 읽을 수 있도록 (백업용)
        secure: true, // HTTPS에서만 (cross-origin 리다이렉트를 위해 필수)
        sameSite: 'none', // Cross-origin 허용 (Google OAuth 리다이렉트를 위해 필수)
        path: '/',
        domain: isProduction ? '.onrender.com' : undefined, // Render 도메인에서 쿠키 공유
      });
      console.log('Google OAuth - Mobile flag set:', {
        isMobile,
        isProduction,
        userAgent: request.headers['user-agent']?.substring(0, 100),
        requestFlag: request._isMobileOAuth,
      });
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
