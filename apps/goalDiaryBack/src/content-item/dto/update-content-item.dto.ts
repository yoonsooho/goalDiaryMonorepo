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
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

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

  // BIG1, BIG2, BIG3 용 랭크 정보 (1,2,3). null이면 랭크 해제
  @IsOptional()
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ValidateIf((o) => o.bigRank !== null)
  @IsNumber({}, { message: 'bigRank는 숫자여야 합니다.' })
  @Min(1, { message: 'bigRank는 1 이상이어야 합니다.' })
  @Max(3, { message: 'bigRank는 3 이하여야 합니다.' })
  bigRank?: number | null;
}

export class SwapContentItemTimesDto {
  @IsNumber()
  firstContentItemId: number;

  @IsNumber()
  secondContentItemId: number;
}
