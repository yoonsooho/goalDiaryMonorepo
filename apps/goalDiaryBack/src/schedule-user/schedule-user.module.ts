import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleUser } from './entities/schedule-user.entity';
import { User } from 'src/users/users.entity';
import { Schedule } from 'src/schedule/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleUser, User, Schedule])],
})
export class ScheduleUserModule {}
