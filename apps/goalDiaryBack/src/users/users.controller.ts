import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/users/users.entity';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET user info
  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = req.user['sub'];
    const user = await this.usersService.findById(userId);

    return this.shieldUserInformation(user);
  }

  // PUT user
  @UseGuards(AccessTokenGuard)
  @Put('me')
  async updateUser(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(req.user['sub'], updateUserDto);
    return this.shieldUserInformation(user);
  }

  // DELETE user
  @UseGuards(AccessTokenGuard)
  @Delete('me')
  async remove(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.usersService.remove(req.user['sub']);
    const isProduction = process.env.NODE_ENV === 'production';

    // // 쿠키 설정은 컨트롤러에서!
    res.cookie('access_token', '', {
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 0,
      path: '/',
    });

    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 0,
      path: '/',
    });

    return {
      message: '회원 탈퇴 성공',
    };
  }

  private shieldUserInformation(user: User) {
    return { ...user, password: undefined, refreshToken: undefined };
  }
  //   민감한 정보 삭제
}
