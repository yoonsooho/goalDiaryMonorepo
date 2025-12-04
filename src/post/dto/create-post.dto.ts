import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;
}

// Service에서 쓸 클래스
export class CreatePostInputClass extends CreatePostDto {
  @IsNotEmpty()
  @IsNumber()
  schedule_id: number;
}
