import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuoteDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  // @IsUrl()
  link?: string;
}
