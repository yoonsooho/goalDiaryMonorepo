import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { Diary } from 'src/diary/entities/diary.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(Diary)
    private diaryRepository: Repository<Diary>,
  ) {}

  async create(createDiaryDto: CreateDiaryDto, userId: string): Promise<Diary> {
    const diary = this.diaryRepository.create({
      ...createDiaryDto,
      user: { id: userId } as any,
    });
    return this.diaryRepository.save(diary);
  }

  async findAll(userId: string): Promise<Diary[]> {
    return this.diaryRepository.find({
      where: { user: { id: userId } },
      order: {
        createdAt: 'DESC',
      },
      select: {
        id: true,
        date: true,
        time: true,
        content: true,
      },
    });
  }

  async findOne(id: number, userId: string): Promise<Diary> {
    const diary = await this.diaryRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!diary) {
      throw new NotFoundException('Diary not found');
    }
    return diary;
  }

  async update(
    id: number,
    updateDiaryDto: UpdateDiaryDto,
    userId: string,
  ): Promise<Diary> {
    // 권한 체크: 해당 diary가 해당 userId의 것인지 확인
    const diary = await this.findOne(id, userId);

    if (updateDiaryDto.date) {
      diary.date = updateDiaryDto.date;
    }
    if (updateDiaryDto.time) {
      diary.time = updateDiaryDto.time;
    }
    if (updateDiaryDto.content) {
      diary.content = updateDiaryDto.content;
    }
    return this.diaryRepository.save(diary);
  }

  async remove(id: number, userId: string): Promise<boolean> {
    // 권한 체크: 해당 diary가 해당 userId의 것인지 확인
    await this.findOne(id, userId);
    await this.diaryRepository.delete(id);
    return true;
  }
}
