import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateScheduleDto } from 'src/schedule/dto/update-schedule.dto';
import { CreateScheduleInput } from 'src/schedule/dto/create-schedule.dto';
import { Schedule } from 'src/schedule/schedule.entity';
import { User } from 'src/users/users.entity';
import { ScheduleUser } from 'src/schedule-user/entities/schedule-user.entity';
import { Post } from 'src/post/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ScheduleUser)
    private scheduleUserRepository: Repository<ScheduleUser>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  /**
   * 스케줄 생성
   * - Schedule 생성 후
   * - ScheduleUser에 연결 (생성자는 canEdit: true)
   * - 트랜잭션으로 처리하여 하나라도 실패하면 전체 롤백
   */
  async create(createScheduleDto: CreateScheduleInput): Promise<Schedule> {
    // repository.manager.transaction() 사용 - DataSource 주입 없이 트랜잭션 사용 가능
    // 어떤 repository의 manager든 같은 EntityManager이므로 모든 엔티티를 저장할 수 있습니다
    return await this.scheduleRepository.manager.transaction(
      async (manager) => {
        // 1. 유저 조회
        const user = await manager.findOne(User, {
          where: { id: createScheduleDto.usersId },
        });
        if (!user) throw new Error('User not found');

        // 2. 스케줄 생성
        const createdSchedule = manager.create(Schedule, {
          title: createScheduleDto.title,
          startDate: createScheduleDto.startDate,
          endDate:
            createScheduleDto.endDate === '' ? null : createScheduleDto.endDate,
        });
        const savedSchedule = await manager.save(Schedule, createdSchedule);

        // 3. 스케줄-유저 연결
        const scheduleUser = manager.create(ScheduleUser, {
          user,
          schedule: savedSchedule,
          canEdit: true, // 생성자는 수정권한 있음
        });
        await manager.save(ScheduleUser, scheduleUser);

        // 4. 기본 Post 2개 생성
        const timestamp = Date.now();
        const post1 = manager.create(Post, {
          id: `post-${timestamp}-1`,
          title: '일정',
          seq: 1,
          schedule: savedSchedule,
        });

        const post2 = manager.create(Post, {
          id: `post-${timestamp + 1}-2`,
          title: 'BIG3일정',
          seq: 2,
          schedule: savedSchedule,
        });
        console.log('post1', post1);
        console.log('post2', post2);

        await Promise.all([
          manager.save(Post, post1),
          manager.save(Post, post2),
        ]);

        return savedSchedule;
      },
    );
  }

  /**
   * 내가 속한 스케줄 조회
   */
  async findAllByUserId(userId: string): Promise<Schedule[]> {
    const scheduleUsers = await this.scheduleUserRepository.find({
      where: { user: { id: userId } },
      relations: ['schedule'],
    });

    return scheduleUsers.map((su) => su.schedule);
  }

  /**
   * 스케줄 수정
   * - 권한 체크 (canEdit = true 인 경우만)
   */
  async updateByScheduleId(
    scheduleId: number,
    userId: string,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    // 1. ScheduleUser에서 권한 확인
    const scheduleUser = await this.scheduleUserRepository.findOne({
      where: { user: { id: userId }, schedule: { id: scheduleId } },
      relations: ['schedule'],
    });

    if (!scheduleUser) throw new Error('공유된 스케줄이 아닙니다.');
    if (!scheduleUser.canEdit) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    // 2. 스케줄 업데이트
    const schedule = scheduleUser.schedule;
    if (updateScheduleDto.title) {
      schedule.title = updateScheduleDto.title;
    }
    if (updateScheduleDto.startDate) {
      schedule.startDate = updateScheduleDto.startDate;
    }
    if (updateScheduleDto.endDate || updateScheduleDto.endDate === '') {
      schedule.endDate =
        updateScheduleDto.endDate === '' ? null : updateScheduleDto.endDate;
    }

    return this.scheduleRepository.save(schedule);
  }

  /**
   * 스케줄 삭제
   * - 권한 체크 (canEdit = true 인 경우만)
   */
  async deleteByScheduleId(
    scheduleId: number,
    userId: string,
  ): Promise<boolean> {
    const scheduleUser = await this.scheduleUserRepository.findOne({
      where: { user: { id: userId }, schedule: { id: scheduleId } },
      relations: ['schedule', 'schedule.posts'],
    });

    if (!scheduleUser) throw new Error('공유된 스케줄이 아닙니다.');
    if (!scheduleUser.canEdit) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    const result = await this.scheduleRepository.delete(scheduleId);
    return result.affected !== 0;
  }
}
