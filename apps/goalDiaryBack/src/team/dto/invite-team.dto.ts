import { IsNotEmpty, IsString } from 'class-validator';

export class InviteTeamDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
