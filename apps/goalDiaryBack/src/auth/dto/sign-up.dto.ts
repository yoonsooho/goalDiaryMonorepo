import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class SignUpDto extends CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password: string;
}
