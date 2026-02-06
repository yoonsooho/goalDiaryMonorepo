import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRefreshToken } from './entities/user-refresh-token.entity';

import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    TypeOrmModule.forFeature([UserRefreshToken]),
  ],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
