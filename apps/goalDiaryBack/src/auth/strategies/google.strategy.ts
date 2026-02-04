import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      console.warn(
        'Google OAuth 환경 변수가 설정되지 않았습니다. 구글 로그인이 작동하지 않을 수 있습니다.',
      );
    }

    // Google OAuth는 IP 주소와 localhost를 허용하지 않으므로 유효한 도메인만 사용 가능
    // 로컬 개발 시 ngrok URL 사용 가능 (물리 기기에서 로컬 백엔드 테스트)
    // 환경 변수 우선순위: GOOGLE_CALLBACK_URL > BACKEND_URL > 기본값
    const defaultCallbackURL = process.env.GOOGLE_CALLBACK_URL
      ? process.env.GOOGLE_CALLBACK_URL
      : process.env.BACKEND_URL
        ? `${process.env.BACKEND_URL}/auth/google/callback`
        : process.env.NODE_ENV === 'production'
          ? 'https://tododndback.onrender.com/auth/google/callback'
          : 'https://tododndback.onrender.com/auth/google/callback'; // 개발 환경 기본값

    super({
      clientID: clientID || 'dummy', // 에러 방지를 위한 더미 값
      clientSecret: clientSecret || 'dummy',
      callbackURL: callbackURL || defaultCallbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true, // request 객체를 validate 메서드에 전달
    });

    console.log(
      'Google OAuth Strategy initialized with callback URL:',
      callbackURL || defaultCallbackURL,
    );
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, id, displayName } = profile;
    const user = {
      email: emails[0].value,
      username: displayName || `${name.givenName} ${name.familyName}`,
      socialId: id,
      social: 'google',
      accessToken,
      // 쿠키에서 모바일 여부 확인 (Guard에서 설정)
      isMobile: req.cookies?.google_oauth_mobile === 'true',
    };
    done(null, user);
  }
}
