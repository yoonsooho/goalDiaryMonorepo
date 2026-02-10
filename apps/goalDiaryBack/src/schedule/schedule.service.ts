import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateScheduleDto } from 'src/schedule/dto/update-schedule.dto';
import { CreateScheduleInput } from 'src/schedule/dto/create-schedule.dto';
import { Schedule } from 'src/schedule/schedule.entity';
import { User } from 'src/users/users.entity';
import { ScheduleUser } from 'src/schedule-user/entities/schedule-user.entity';
import { Post } from 'src/post/post.entity';
import { Repository, In } from 'typeorm';
import { ScheduleGateway } from './schedule.gateway';
import { TeamService } from 'src/team/team.service';
import { TeamUser } from 'src/team/entities/team-user.entity';
import { Team } from 'src/team/entities/team.entity';

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
    @InjectRepository(TeamUser)
    private teamUserRepository: Repository<TeamUser>,
    private readonly scheduleGateway: ScheduleGateway,
    private readonly teamService: TeamService,
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

        // 2. teamId가 있으면 팀 멤버 권한 확인
        let team = null;
        if (createScheduleDto.teamId) {
          team = await manager.findOne(Team, {
            where: { id: createScheduleDto.teamId },
          });
          if (!team) throw new Error('Team not found');

          // 팀 멤버인지 확인 (ACTIVE 상태만) - 트랜잭션 내에서 조회
          const teamUser = await manager.findOne(TeamUser, {
            where: {
              team: { id: createScheduleDto.teamId },
              user: { id: createScheduleDto.usersId },
              status: 'ACTIVE',
            },
          });
          if (!teamUser) {
            throw new ForbiddenException('You are not a member of this team');
          }
        }

        // 3. 스케줄 생성 (개인 일정 또는 팀 일정)
        const createdSchedule = manager.create(Schedule, {
          title: createScheduleDto.title,
          startDate: createScheduleDto.startDate,
          endDate:
            createScheduleDto.endDate === '' ? null : createScheduleDto.endDate,
          team: team || undefined,
        });
        const savedSchedule = await manager.save(Schedule, createdSchedule);

        // 4. 스케줄-유저 연결
        const scheduleUser = manager.create(ScheduleUser, {
          user,
          schedule: savedSchedule,
          canEdit: true, // 생성자는 수정권한 있음
        });
        await manager.save(ScheduleUser, scheduleUser);

        // 5. 기본 Post 생성 (초기 보드 1개만 생성)
        const timestamp = Date.now();
        const post1 = manager.create(Post, {
          id: `post-${timestamp}-1`,
          title: '일정',
          seq: 1,
          schedule: savedSchedule,
        });

        await manager.save(Post, post1);

        // 브로드캐스트 (생성 이벤트)
        this.scheduleGateway.emitScheduleUpdated(savedSchedule.id, {
          type: 'created',
          scheduleId: savedSchedule.id,
        });

        return savedSchedule;
      },
    );
  }

  /**
   * 내가 속한 스케줄 조회
   * - ScheduleUser로 직접 공유된 일정
   * - 팀 멤버인 경우 해당 팀의 모든 일정
   */
  async findAllByUserId(userId: string): Promise<Schedule[]> {
    // 1. ScheduleUser로 직접 공유된 일정 조회
    const scheduleUsers = await this.scheduleUserRepository.find({
      where: { user: { id: userId } },
      relations: ['schedule', 'schedule.team'],
    });
    const directSchedules = scheduleUsers.map((su) => su.schedule);

    // 2. 사용자가 속한 팀 목록 조회 (ACTIVE 상태만)
    const teamMemberships = await this.teamUserRepository.find({
      where: { user: { id: userId }, status: 'ACTIVE' },
      relations: ['team'],
    });
    const teamIds = teamMemberships.map((tm) => tm.team.id);

    // 3. 팀 일정 조회 (teamId가 있고, 해당 팀에 속한 일정)
    let teamSchedules: Schedule[] = [];
    if (teamIds.length > 0) {
      teamSchedules = await this.scheduleRepository.find({
        where: { team: { id: In(teamIds) } },
        relations: ['team'],
      });
    }

    // 4. 두 결과를 합치고 중복 제거 (id 기준)
    const allSchedules = [...directSchedules, ...teamSchedules];
    const uniqueSchedules = Array.from(
      new Map(allSchedules.map((schedule) => [schedule.id, schedule])).values(),
    );

    // 5. 최근 등록순 정렬 (createdAt 내림차순)
    uniqueSchedules.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return uniqueSchedules;
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
      relations: ['schedule', 'schedule.team'],
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

    const saved = await this.scheduleRepository.save(schedule);

    // team 관계를 다시 로드
    const scheduleWithTeam = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['team'],
    });

    // 브로드캐스트 (수정 이벤트)
    this.scheduleGateway.emitScheduleUpdated(scheduleId, {
      type: 'updated',
      scheduleId,
    });

    return scheduleWithTeam || saved;
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

    // 브로드캐스트 (삭제 이벤트)
    if (result.affected) {
      this.scheduleGateway.emitScheduleUpdated(scheduleId, {
        type: 'deleted',
        scheduleId,
      });
    }

    return result.affected !== 0;
  }

  /**
   * 스케줄을 팀 일정으로 전환
   * - 권한 체크 (canEdit = true 인 경우만)
   * - 팀 이름으로 팀 찾기, 없으면 생성
   */
  async convertToTeam(
    scheduleId: number,
    userId: string,
    teamName: string,
  ): Promise<Schedule> {
    // 1. 권한 확인
    const scheduleUser = await this.scheduleUserRepository.findOne({
      where: { user: { id: userId }, schedule: { id: scheduleId } },
      relations: ['schedule', 'schedule.team'],
    });

    if (!scheduleUser) throw new Error('공유된 스케줄이 아닙니다.');
    if (!scheduleUser.canEdit) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    // 2. 팀 찾기 또는 생성
    const team = await this.teamService.findOrCreateTeamByName(
      teamName,
      userId,
    );

    // 3. 스케줄에 팀 할당
    const schedule = scheduleUser.schedule;
    schedule.team = team;
    await this.scheduleRepository.save(schedule);

    // team 관계를 다시 로드하여 반환
    const scheduleWithTeam = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['team'],
    });

    // 브로드캐스트 (수정 이벤트)
    this.scheduleGateway.emitScheduleUpdated(scheduleId, {
      type: 'updated',
      scheduleId,
    });

    if (!scheduleWithTeam) {
      throw new Error('Schedule not found after update');
    }

    return scheduleWithTeam;
  }
}
