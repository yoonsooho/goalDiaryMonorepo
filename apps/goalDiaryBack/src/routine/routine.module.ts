import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineService } from './routine.service';
import { RoutineController } from './routine.controller';
import { Routine } from './routine.entity';
import { RoutineCompletion } from './routine-completion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Routine, RoutineCompletion])],
  controllers: [RoutineController],
  providers: [RoutineService],
  exports: [RoutineService],
})
export class RoutineModule {}
