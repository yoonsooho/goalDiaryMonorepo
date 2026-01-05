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
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';

@Controller('quotes')
@UseGuards(AccessTokenGuard)
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  create(@Req() req, @Body() createQuoteDto: CreateQuoteDto) {
    return this.quoteService.create(req.user.sub, createQuoteDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.quoteService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.quoteService.findOne(+id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quoteService.update(+id, req.user.sub, updateQuoteDto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.quoteService.remove(+id, req.user.sub);
  }
}
