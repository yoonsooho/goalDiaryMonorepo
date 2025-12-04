import { IsDateString, IsOptional } from 'class-validator';

export class CompleteRoutineDto {
  @IsOptional()
  @IsDateString()
  local_date?: string;
}
