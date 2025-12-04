import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routine } from './routine.entity';
import { RoutineCompletion } from './routine-completion.entity';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CompleteRoutineDto } from 'src/routine/dto/complete-routine.dto';

@Injectable()
export class RoutineService {
  constructor(
    @InjectRepository(Routine)
    private routineRepository: Repository<Routine>,
    @InjectRepository(RoutineCompletion)
    private routineCompletionRepository: Repository<RoutineCompletion>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 사용자의 모든 루틴 조회
  async findAll(userId: string): Promise<Routine[]> {
    const routines = await this.routineRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });

    return routines;
  }

  // 특정 루틴 조회
  async findOne(id: number, userId: string): Promise<Routine> {
    const routine = await this.routineRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!routine) {
      throw new NotFoundException(`Routine with ID ${id} not found`);
    }

    return routine;
  }

  // 새 루틴 생성
  async create(
    createRoutineDto: CreateRoutineDto,
    userId: string,
  ): Promise<Routine> {
    const routine = this.routineRepository.create({
      ...createRoutineDto,
      user: { id: userId },
    });

    const savedRoutine = await this.routineRepository.save(routine);

    // 캐시 무효화
    await this.invalidateUserCache(userId);

    return savedRoutine;
  }

  // 루틴 수정
  async update(
    id: number,
    updateRoutineDto: UpdateRoutineDto,
    userId: string,
  ): Promise<Routine> {
    const routine = await this.findOne(id, userId);

    // isActive가 false인 경우, isActive만 수정 가능
    if (!routine.isActive) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isActive, ...otherFields } = updateRoutineDto;
      if (Object.keys(otherFields).length > 0) {
        throw new BadRequestException(
          'Cannot update inactive routine. Only isActive can be modified.',
        );
      }
    }

    Object.assign(routine, updateRoutineDto);

    const savedRoutine = await this.routineRepository.save(routine);

    // 캐시 무효화
    await this.invalidateUserCache(userId);

    return savedRoutine;
  }

  // 루틴 삭제
  async remove(id: number, userId: string): Promise<void> {
    const routine = await this.findOne(id, userId);
    await this.routineRepository.remove(routine);

    // 캐시 무효화
    await this.invalidateUserCache(userId);
  }

  // 오늘의 루틴 조회
  async getTodayRoutines(userId: string, local_date: string): Promise<any> {
    const today = local_date || new Date().toISOString().split('T')[0];

    const routines = await this.routineRepository.find({
      where: { user: { id: userId }, isActive: true },
      order: { created_at: 'DESC' },
    });

    const routinesWithStatus = await Promise.all(
      routines.map(async (routine) => {
        const completedToday = routine.last_completed_date === today;
        const streak = await this.calculateStreak(routine.id, userId);

        return {
          ...routine,
          completedToday,
          streak,
        };
      }),
    );

    const completedRoutines = routinesWithStatus.filter(
      (r) => r.completedToday,
    ).length;
    const totalCount = routinesWithStatus.length;
    const completionRate =
      totalCount > 0 ? Math.round((completedRoutines / totalCount) * 100) : 0;

    const totalRoutines = await this.routineRepository.count({
      where: { user: { id: userId }, isActive: true },
    });

    return {
      progress: {
        completedRoutines,
        completionRate,
        totalRoutines,
      },
      routines: routinesWithStatus,
    };
  }

  // 루틴 통계 조회
  async getRoutineStats(userId: string): Promise<any> {
    const totalRoutines = await this.routineRepository.count({
      where: { user: { id: userId } },
    });

    const activeRoutines = await this.routineRepository.count({
      where: { user: { id: userId }, isActive: true },
    });

    const today = new Date().toISOString().split('T')[0];
    const completedToday = await this.routineCompletionRepository.count({
      where: {
        routine: { user: { id: userId } },
        date: today,
      },
    });

    return {
      totalRoutines,
      activeRoutines,
      completedToday,
    };
  }

  // 오늘 완료 상태 확인
  async getTodayCompletionStatus(
    routineId: number | null,
    userId: string,
  ): Promise<number[]> {
    const today = new Date().toISOString().split('T')[0];

    const query = this.routineCompletionRepository
      .createQueryBuilder('completion')
      .select('completion.routine.id', 'routine_id')
      .innerJoin('completion.routine', 'routine')
      .where('completion.date = :today', { today })
      .andWhere('routine.user.id = :userId', { userId });

    if (routineId) {
      query.andWhere('completion.routine.id = :routineId', { routineId });
    }

    const completions = await query.getRawMany();

    return completions.map((c) => c.routine_id);
  }

  // 루틴 완료 처리
  async completeRoutine(
    routineId: number,
    userId: string,
    completeRoutineDto: CompleteRoutineDto,
  ): Promise<{
    routine_id: number;
    completed_at: Date;
    date: string;
    streak: number;
  }> {
    const completionDate =
      completeRoutineDto.local_date || new Date().toISOString().split('T')[0];

    // 이미 완료된 루틴인지 확인
    const existingCompletion = await this.routineCompletionRepository.findOne({
      where: {
        routine: { id: routineId },
        date: completionDate,
      },
    });

    if (existingCompletion) {
      throw new BadRequestException('Routine already completed for this date');
    }

    // 루틴 조회
    const routine = await this.routineRepository.findOne({
      where: { id: routineId, user: { id: userId } },
    });

    if (!routine) {
      throw new NotFoundException('루틴을 찾을 수 없습니다.');
    }

    // 비활성화된 루틴은 완료할 수 없음
    if (!routine.isActive) {
      throw new BadRequestException(
        '활성화된 루틴이 아닙니다. 루틴을 활성화 하신 후 다시 시도해주세요.',
      );
    }

    // 연속성 체크
    let newStreak = 1; // 기본값은 1
    if (routine.last_completed_date) {
      const lastCompletedDate = new Date(routine.last_completed_date);
      const currentCompletionDate = new Date(completionDate);

      // 하루 차이인지 확인 (연속성 체크)
      const diffTime =
        currentCompletionDate.getTime() - lastCompletedDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1 || diffDays === 0) {
        // 연속된 경우: 기존 streak + 1
        newStreak = routine.streak + 1;
      } else {
        // 연속되지 않은 경우: streak 초기화
        newStreak = 1;
      }
    }

    // 완료 기록 생성
    const completion = this.routineCompletionRepository.create({
      routine: { id: routineId },
      date: completionDate,
    });

    await this.routineCompletionRepository.save(completion);

    // 루틴의 last_completed_date와 streak 업데이트
    await this.routineRepository.update(routineId, {
      last_completed_date: completionDate,
      streak: newStreak,
    });

    // 캐시 무효화
    await this.invalidateUserCache(userId);

    return {
      routine_id: routineId,
      completed_at: completion.completed_at,
      date: completionDate,
      streak: newStreak,
    };
  }

  // 루틴 완료 취소
  async uncompleteRoutine(
    routineId: number,
    userId: string,
    completeRoutineDto: CompleteRoutineDto,
  ): Promise<void> {
    const targetDate =
      completeRoutineDto.local_date || new Date().toISOString().split('T')[0];

    const routine = await this.routineRepository.findOne({
      where: { id: routineId, user: { id: userId } },
    });

    if (!routine) {
      throw new NotFoundException('루틴을 찾을 수 없습니다.');
    }

    if (!routine.isActive) {
      throw new BadRequestException(
        '활성화된 루틴이 아닙니다. 루틴을 활성화 하신 후 다시 시도해주세요.',
      );
    }

    const completion = await this.routineCompletionRepository.findOne({
      where: {
        routine: { id: routineId, user: { id: userId } },
        date: targetDate,
      },
    });

    if (!completion) {
      throw new NotFoundException('해당 날짜에 완료된 루틴이 없습니다.');
    }

    await this.routineCompletionRepository.remove(completion);

    // 루틴의 last_completed_date 업데이트
    await this.routineRepository.update(routineId, {
      streak: routine.streak - 1,
      last_completed_date: null,
    });

    // 캐시 무효화
    await this.invalidateUserCache(userId);
  }

  // 연속 달성 일수 계산
  private async calculateStreak(
    routineId: number,
    userId: string,
  ): Promise<number> {
    const completions = await this.routineCompletionRepository.find({
      where: { routine: { id: routineId, user: { id: userId } } },
      order: { date: 'DESC' },
    });

    if (completions.length === 0) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date();

    for (const completion of completions) {
      const completionDate = new Date(completion.date);
      const daysDiff = Math.floor(
        (currentDate.getTime() - completionDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysDiff === streak) {
        streak++;
        currentDate = completionDate;
      } else {
        break;
      }
    }

    return streak;
  }

  // 사용자 캐시 무효화
  private async invalidateUserCache(userId: string): Promise<void> {
    const cacheKeys = [
      `routines:${userId}`,
      `today:${userId}`,
      `stats:${userId}`,
    ];

    for (const key of cacheKeys) {
      await this.cacheManager.del(key);
    }
  }
}
