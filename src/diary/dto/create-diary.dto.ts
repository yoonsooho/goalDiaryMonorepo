import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateDiaryDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date는 YYYY-MM-DD 형식이어야 합니다. (예: 2024-01-15)',
  })
  @IsNotEmpty()
  date: string; // YYYY-MM-DD 형식

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time은 HH:mm 형식이어야 합니다. (예: 09:30, 23:45)',
  })
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
