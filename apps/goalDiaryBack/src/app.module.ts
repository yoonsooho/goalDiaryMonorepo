import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from './schedule/schedule.module';
import { PostModule } from './post/post.module';
import { ContentItemModule } from './content-item/content-item.module';
import { ScheduleUserModule } from './schedule-user/schedule-user.module';
import { RoutineModule } from './routine/routine.module';
import { DiaryModule } from './diary/diary.module';
import typeorm from 'src/config/typeorm';
import { TeamModule } from './team/team.module';
import { NotificationModule } from './notification/notification.module';
import { QuoteModule } from './quote/quote.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
      envFilePath: '.env.local',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    CacheModule.register({
      ttl: 300, // 5분 캐시
      max: 1000, // 최대 1000개 항목
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    ScheduleModule,
    PostModule,
    ContentItemModule,
    ScheduleUserModule,
    RoutineModule,
    DiaryModule,
    TeamModule,
    NotificationModule,
    QuoteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
