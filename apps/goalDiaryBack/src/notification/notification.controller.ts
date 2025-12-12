import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { GetNotificationsDto } from './dto/get-notifications.dto';

@UseGuards(AccessTokenGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Req() req: any, @Query() query: GetNotificationsDto) {
    const userId = req.user?.sub || req.user?.id;
    const page = query.page ?? 0;
    const limit = query.limit ?? 10; // 기본값 10으로 변경
    return this.notificationService.getNotifications(userId, page, limit);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.notificationService.markAsRead(id, userId);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    await this.notificationService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }
}
