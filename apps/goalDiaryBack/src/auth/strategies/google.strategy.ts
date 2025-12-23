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

    super({
      clientID: clientID || 'dummy', // 에러 방지를 위한 더미 값
      clientSecret: clientSecret || 'dummy',
      callbackURL: callbackURL || 'http://localhost:3000',
      scope: ['email', 'profile'],
    });
  }

  async validate(
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
    };
    done(null, user);
  }
}
