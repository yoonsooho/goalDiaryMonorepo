import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentItemService } from './content-item.service';
import { ContentItemController } from './content-item.controller';
import { ContentItem } from './content-item.entity';
import { Post } from 'src/post/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentItem, Post])],
  providers: [ContentItemService],
  controllers: [ContentItemController],
  exports: [ContentItemService],
})
export class ContentItemModule {}
