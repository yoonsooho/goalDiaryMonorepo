import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // 인증된 사용자에서 가져오되, 테스트/백워드 호환을 위해 optional 허용
  @IsString()
  @IsOptional()
  ownerId?: string;
}
