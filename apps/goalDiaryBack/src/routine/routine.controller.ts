import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
  Query,
} from '@nestjs/common';
import { RoutineService } from './routine.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { CompleteRoutineDto } from './dto/complete-routine.dto';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';

@Controller('routines')
@UseGuards(AccessTokenGuard)
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  // 사용자의 모든 루틴 조회
  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user['sub'];
    const routines = await this.routineService.findAll(userId);

    return routines;
  }

  // 새 루틴 생성
  @Post()
  async create(@Body() createRoutineDto: CreateRoutineDto, @Req() req: any) {
    const userId = req.user['sub'];
    const routine = await this.routineService.create(createRoutineDto, userId);

    return routine;
  }

  // 오늘의 루틴 완료 상태 조회
  @Get('today')
  async getTodayRoutines(
    @Query('local_date') local_date: string,
    @Req() req: any,
  ) {
    const userId = req.user['sub'];
    const result = await this.routineService.getTodayRoutines(
      userId,
      local_date,
    );

    return result;
  }

  // 루틴 통계 조회
  @Get('stats')
  async getRoutineStats(@Req() req: any) {
    const userId = req.user['sub'];
    const stats = await this.routineService.getRoutineStats(userId);

    return stats;
  }

  // 특정 루틴 조회
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user['sub'];
    const routine = await this.routineService.findOne(id, userId);

    return routine;
  }

  // 루틴 수정
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoutineDto: UpdateRoutineDto,
    @Req() req: any,
  ) {
    const userId = req.user['sub'];
    const routine = await this.routineService.update(
      id,
      updateRoutineDto,
      userId,
    );

    return routine;
  }

  // 루틴 삭제
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user['sub'];
    await this.routineService.remove(id, userId);

    return 'Routine deleted successfully';
  }

  // 루틴 완료 처리
  @Post(':id/complete')
  async completeRoutine(
    @Param('id', ParseIntPipe) id: number,
    @Body() completeRoutineDto: CompleteRoutineDto,
    @Req() req: any,
  ) {
    const userId = req.user['sub'];
    const result = await this.routineService.completeRoutine(
      id,
      userId,
      completeRoutineDto,
    );

    return result;
  }

  // 루틴 완료 취소
  @Delete(':id/complete')
  async uncompleteRoutine(
    @Param('id', ParseIntPipe) id: number,
    @Body() completeRoutineDto: CompleteRoutineDto,
    @Req() req: any,
  ) {
    const userId = req.user['sub'];
    await this.routineService.uncompleteRoutine(id, userId, completeRoutineDto);

    return 'Routine completion cancelled';
  }
}
