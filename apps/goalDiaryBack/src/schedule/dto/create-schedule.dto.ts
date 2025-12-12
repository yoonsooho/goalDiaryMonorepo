import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  startDate: string; // Date를 직접 받기보단 string으로 받아서 변환하는 게 일반적

  @IsOptional()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  teamId?: number; // 팀 일정으로 생성할 경우 팀 ID
}
export type CreateScheduleInput = CreateScheduleDto & { usersId: string };
