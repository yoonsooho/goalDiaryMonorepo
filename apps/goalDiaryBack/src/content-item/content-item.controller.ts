import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ContentItemService } from './content-item.service';
import { CreateContentItemDto } from './dto/create-content-item.dto';
import {
  UpdateContentItemSequenceDto,
  UpdateContentItemTextDto,
} from './dto/update-content-item.dto';
import { MoveContentItemDto } from './dto/move-content-item.dto';
import { ContentItem } from './content-item.entity';

@Controller('content-items')
export class ContentItemController {
  constructor(private readonly contentItemService: ContentItemService) {}

  @Post()
  async create(
    @Body() createContentItemDto: CreateContentItemDto,
  ): Promise<ContentItem> {
    return this.contentItemService.create(createContentItemDto);
  }

  @Get()
  async findAll(@Query('postId') postId?: string): Promise<ContentItem[]> {
    if (postId) {
      // postId가 있으면 seq 순서로 정렬된 content-items 조회
      return this.contentItemService.findByPostOrderedBySeq(postId);
    }
    return this.contentItemService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ContentItem> {
    return this.contentItemService.findOne(id);
  }

  @Patch(':contentItemId')
  async update(
    @Param('contentItemId', ParseIntPipe) contentItemId: number,
    @Body() updateContentItemTextDto: UpdateContentItemTextDto,
  ): Promise<ContentItem> {
    return this.contentItemService.update(
      contentItemId,
      updateContentItemTextDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.contentItemService.remove(id);
  }

  // 순서 변경 API (드래그 앤 드롭)
  @Patch(':postId/seq')
  async updateSequence(
    @Param('postId') postId: string,
    @Body() updateSequenceDto: UpdateContentItemSequenceDto,
  ): Promise<{ message: string }> {
    await this.contentItemService.updateSequence(
      postId,
      updateSequenceDto.contentItemSeqUpdates,
    );
    return { message: 'Content items 순서가 업데이트되었습니다.' };
  }

  // ContentItem을 다른 Post로 이동
  @Put('move')
  async moveContentItem(
    @Body() moveContentItemDto: MoveContentItemDto,
  ): Promise<{ message: string }> {
    await this.contentItemService.moveContentItem(moveContentItemDto);
    return { message: 'Content item이 성공적으로 이동되었습니다.' };
  }
}
