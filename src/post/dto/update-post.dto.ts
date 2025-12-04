import { PartialType } from '@nestjs/mapped-types';
import { CreatePostInputClass } from './create-post.dto';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePostDto extends PartialType(CreatePostInputClass) {
  @IsOptional()
  @IsNumber()
  seq?: number;

  @IsOptional()
  @IsString()
  id?: string;
}

export class PostSeqUpdateDto {
  @IsString()
  id: string;

  @IsNumber()
  seq: number;
}

export class UpdatePostSequenceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostSeqUpdateDto)
  postSeqUpdates: PostSeqUpdateDto[];
}
