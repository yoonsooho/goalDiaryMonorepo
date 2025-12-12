import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from 'src/users/users.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 알람 생성
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    metadata?: any,
  ): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const notification = this.notificationRepository.create({
      user,
      type,
      message,
      metadata,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  /**
   * 사용자의 알람 목록 조회 (페이지네이션)
   */
  async getNotifications(
    userId: string,
    page: number = 0,
    limit: number = 20,
  ): Promise<{
    notifications: Notification[];
    hasMore: boolean;
    total: number;
  }> {
    const skip = page * limit;

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

    const hasMore = skip + notifications.length < total;

    return {
      notifications,
      hasMore,
      total,
    };
  }

  /**
   * 읽지 않은 알람 개수 조회
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { user: { id: userId }, isRead: false },
    });
  }

  /**
   * 알람 읽음 처리
   */
  async markAsRead(
    notificationId: number,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  /**
   * 모든 알람 읽음 처리
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
  }
}
