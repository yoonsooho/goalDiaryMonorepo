import { PartialType } from '@nestjs/mapped-types';
import { CreateContentItemDto } from './create-content-item.dto';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContentItemDto extends PartialType(CreateContentItemDto) {
  @IsOptional()
  @IsNumber()
  seq?: number;
}

export class ContentItemSeqUpdateDto {
  @IsNumber()
  id: number;

  @IsNumber()
  seq: number;
}

export class UpdateContentItemSequenceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentItemSeqUpdateDto)
  contentItemSeqUpdates: ContentItemSeqUpdateDto[];
}

export class UpdateContentItemTextDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime은 HH:mm 형식이어야 합니다. (예: 09:30, 23:45)',
  })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime은 HH:mm 형식이어야 합니다. (예: 09:30, 23:45)',
  })
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
