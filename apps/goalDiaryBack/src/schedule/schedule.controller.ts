import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { Request } from 'express';

@UseGuards(AccessTokenGuard)
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async findAll(@Req() req: Request) {
    return this.scheduleService.findAllByUserId(req.user['sub']);
  }

  @Post()
  async create(
    @Req() req: Request,
    @Body() createScheduleDto: CreateScheduleDto,
  ) {
    return this.scheduleService.create({
      ...createScheduleDto,
      usersId: req.user['sub'],
    });
  }

  @Patch(':scheduleId')
  async update(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Req() req: Request,
  ) {
    const usersId = req.user['sub']; // or req.user.id
    return this.scheduleService.updateByScheduleId(
      scheduleId,
      usersId,
      updateScheduleDto,
    );
  }

  @Delete(':scheduleId')
  async remove(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Req() req: Request,
  ) {
    const usersId = req.user['sub']; // or req.user.id
    return this.scheduleService.deleteByScheduleId(scheduleId, usersId);
  }
}
