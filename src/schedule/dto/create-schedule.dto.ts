import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  startDate: string; // Date를 직접 받기보단 string으로 받아서 변환하는 게 일반적

  @IsOptional()
  endDate?: string;
}
export type CreateScheduleInput = CreateScheduleDto & { usersId: string };
