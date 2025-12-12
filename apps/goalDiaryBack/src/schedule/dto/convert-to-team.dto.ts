import { IsNotEmpty, IsString } from 'class-validator';

export class ConvertToTeamDto {
  @IsString()
  @IsNotEmpty()
  teamName: string;
}
