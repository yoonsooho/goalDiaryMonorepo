import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from './quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

@Injectable()
export class QuoteService {
  constructor(
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
  ) {}

  async create(userId: string, createQuoteDto: CreateQuoteDto): Promise<Quote> {
    // 명언 개수 제한 (3개)
    const count = await this.quoteRepository.count({ where: { userId } });
    if (count >= 3) {
      throw new BadRequestException(
        '명언은 최대 3개까지만 등록할 수 있습니다.',
      );
    }

    const quote = this.quoteRepository.create({
      ...createQuoteDto,
      userId,
    });
    return await this.quoteRepository.save(quote);
  }

  async findAll(userId: string): Promise<Quote[]> {
    return await this.quoteRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number, userId: string): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({ where: { id, userId } });
    if (!quote) {
      throw new NotFoundException('명언을 찾을 수 없습니다.');
    }
    return quote;
  }

  async update(
    id: number,
    userId: string,
    updateQuoteDto: UpdateQuoteDto,
  ): Promise<Quote> {
    const quote = await this.findOne(id, userId);
    Object.assign(quote, updateQuoteDto);
    return await this.quoteRepository.save(quote);
  }

  async remove(id: number, userId: string): Promise<void> {
    const result = await this.quoteRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('명언을 찾을 수 없습니다.');
    }
  }
}
