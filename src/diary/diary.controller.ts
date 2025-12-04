import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DiaryService } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { Request } from 'express';

@UseGuards(AccessTokenGuard)
@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Post()
  create(@Body() createDiaryDto: CreateDiaryDto, @Req() req: Request) {
    const userId = req.user['sub'];
    return this.diaryService.create(createDiaryDto, userId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = req.user['sub'];
    return this.diaryService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user['sub'];
    return this.diaryService.findOne(+id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDiaryDto: UpdateDiaryDto,
    @Req() req: Request,
  ) {
    const userId = req.user['sub'];
    return this.diaryService.update(+id, updateDiaryDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user['sub'];
    return this.diaryService.remove(+id, userId);
  }
}
