import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentItemService } from './content-item.service';
import { ContentItemController } from './content-item.controller';
import { ContentItem } from './content-item.entity';
import { Post } from 'src/post/post.entity';
import { ScheduleModule } from 'src/schedule/schedule.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContentItem, Post]), ScheduleModule],
  providers: [ContentItemService],
  controllers: [ContentItemController],
  exports: [ContentItemService],
})
export class ContentItemModule {}
