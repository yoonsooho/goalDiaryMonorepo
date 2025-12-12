import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { Schedule } from 'src/schedule/schedule.entity';
import { User } from 'src/users/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleUser } from 'src/schedule-user/entities/schedule-user.entity';
import { Post } from 'src/post/post.entity';
import { ScheduleGateway } from './schedule.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TeamModule } from 'src/team/team.module';
import { TeamUser } from 'src/team/entities/team-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule, User, ScheduleUser, Post, TeamUser]),
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET') || 'default_secret',
      }),
    }),
    TeamModule,
  ],
  providers: [ScheduleService, ScheduleGateway],
  controllers: [ScheduleController],
  exports: [ScheduleService, ScheduleGateway],
})
export class ScheduleModule {}
