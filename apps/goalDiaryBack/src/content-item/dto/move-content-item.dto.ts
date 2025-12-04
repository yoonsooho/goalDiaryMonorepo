import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ContentItemSeqUpdate {
  @IsNumber()
  id: number;

  @IsNumber()
  seq: number;
}

export class MoveContentItemDto {
  @IsNumber()
  contentItemId: number;

  @IsString()
  fromPostId: string;

  @IsString()
  toPostId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentItemSeqUpdate)
  toPostContentItems: ContentItemSeqUpdate[];
}
