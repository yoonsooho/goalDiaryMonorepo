import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateContentItemDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsString()
  post_id: string;
}

export class CreateContentItemSequenceDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsString()
  post_id: string;

  @IsNotEmpty()
  @IsNumber()
  seq: number;
}
