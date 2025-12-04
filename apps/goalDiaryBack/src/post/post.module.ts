// post.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post } from './post.entity';
import { ScheduleModule } from 'src/schedule/schedule.module'; // import 추가
import { Schedule } from 'src/schedule/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Schedule]), ScheduleModule],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
