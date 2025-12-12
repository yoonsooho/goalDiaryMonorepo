import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamUser, TeamRole, TeamStatus } from './entities/team-user.entity';
import { User } from 'src/users/users.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { InviteTeamDto } from './dto/invite-team.dto';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team) private readonly teams: Repository<Team>,
    @InjectRepository(TeamUser)
    private readonly teamUsers: Repository<TeamUser>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  async createTeam(dto: CreateTeamDto): Promise<Team> {
    const owner = await this.users.findOne({ where: { id: dto.ownerId } });
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    const team = this.teams.create({ name: dto.name, owner });
    const saved = await this.teams.save(team);

    const membership = this.teamUsers.create({
      team: saved,
      user: owner,
      role: 'OWNER' as TeamRole,
      status: 'ACTIVE' as TeamStatus,
    });
    await this.teamUsers.save(membership);

    return saved;
  }

  async inviteMember(teamId: number, dto: InviteTeamDto): Promise<TeamUser> {
    const team = await this.teams.findOne({
      where: { id: teamId },
      relations: ['owner'],
    });
    if (!team) throw new NotFoundException('Team not found');

    const user = await this.users.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.teamUsers.findOne({
      where: { team: { id: teamId }, user: { id: dto.userId } },
    });

    console.log(
      `[inviteMember] Existing membership check: teamId=${teamId}, userId=${dto.userId}, existing=${existing ? `id=${existing.id}, status=${existing.status}` : 'null'}`,
    );

    let saved: TeamUser;

    if (existing) {
      // 기존 멤버십이 있는 경우
      if (existing.status === 'ACTIVE') {
        // ACTIVE 상태인 경우 에러 (이미 멤버)
        throw new BadRequestException('Already invited or member');
      } else {
        // PENDING, REJECTED, 또는 기타 상태인 경우 모두 재초대 가능
        // 상태를 PENDING으로 변경하여 재초대
        console.log(
          `[inviteMember] Found existing membership with status=${existing.status}, changing to PENDING: id=${existing.id}`,
        );
        existing.status = 'PENDING' as TeamStatus;
        saved = await this.teamUsers.save(existing);
      }
    } else {
      // 기존 멤버십이 없는 경우 새로운 초대 생성
      const membership = this.teamUsers.create({
        team,
        user,
        role: 'MEMBER' as TeamRole,
        status: 'PENDING' as TeamStatus,
      });
      saved = await this.teamUsers.save(membership);
    }

    // 알람 생성 (실패해도 초대는 성공)
    try {
      await this.notificationService.createNotification(
        dto.userId,
        'TEAM_INVITATION',
        `${team.name} 팀 초대가 도착했습니다.`,
        {
          teamId: team.id,
          teamName: team.name,
          membershipId: saved.id,
          ownerUsername: team.owner?.username || '알 수 없음',
        },
      );
    } catch (error) {
      // 알람 생성 실패해도 초대는 성공으로 처리
      console.error(
        'Failed to create notification for team invitation:',
        error,
      );
    }

    return saved;
  }

  async updateInvitationStatus(
    membershipId: number,
    status: TeamStatus,
  ): Promise<TeamUser> {
    const membership = await this.teamUsers.findOne({
      where: { id: membershipId },
      relations: ['team', 'user'],
    });
    if (!membership) throw new NotFoundException('Invitation not found');

    membership.status = status;
    return this.teamUsers.save(membership);
  }

  async listMembers(teamId: number): Promise<TeamUser[]> {
    return this.teamUsers.find({
      where: { team: { id: teamId }, status: 'ACTIVE' },
      relations: ['user'],
    });
  }

  /**
   * 사용자가 받은 초대 목록 조회 (PENDING 상태)
   */
  async getMyInvitations(userId: string): Promise<TeamUser[]> {
    return this.teamUsers.find({
      where: { user: { id: userId }, status: 'PENDING' },
      relations: ['team', 'team.owner'],
    });
  }

  async getTeam(teamId: number): Promise<Team> {
    const team = await this.teams.findOne({
      where: { id: teamId },
      relations: ['owner'],
    });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  /**
   * 팀 이름으로 팀 찾기, 없으면 생성
   */
  async findOrCreateTeamByName(
    teamName: string,
    ownerId: string,
  ): Promise<Team> {
    let team = await this.teams.findOne({
      where: { name: teamName },
    });

    if (!team) {
      // 팀이 없으면 생성
      const owner = await this.users.findOne({ where: { id: ownerId } });
      if (!owner) {
        throw new NotFoundException('Owner not found');
      }

      team = this.teams.create({ name: teamName, owner });
      team = await this.teams.save(team);

      // owner를 팀 멤버로 추가
      const membership = this.teamUsers.create({
        team,
        user: owner,
        role: 'OWNER' as TeamRole,
        status: 'ACTIVE' as TeamStatus,
      });
      await this.teamUsers.save(membership);
    }

    return team;
  }

  /**
   * 사용자가 속한 팀 리스트 조회 (ACTIVE 상태)
   */
  async getMyTeams(userId: string): Promise<TeamUser[]> {
    return this.teamUsers.find({
      where: { user: { id: userId }, status: 'ACTIVE' },
      relations: ['team', 'team.owner'],
      select: {
        id: true,
        status: true,
        role: true,
        createdAt: true,
        team: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            id: true,
            userId: true, // 로그인 아이디
            username: true, // 사용자 이름
            // password, refreshToken, socialId, social 등 민감한 정보는 제외
          },
        },
      },
    });
  }

  /**
   * 팀 탈퇴
   */
  async leaveTeam(teamId: number, userId: string): Promise<void> {
    const membership = await this.teamUsers.findOne({
      where: { team: { id: teamId }, user: { id: userId } },
      relations: ['team', 'user'],
    });

    if (!membership) {
      throw new NotFoundException('Team membership not found');
    }

    // OWNER는 탈퇴할 수 없음
    if (membership.role === 'OWNER') {
      throw new BadRequestException('Team owner cannot leave the team');
    }

    // 멤버십을 REJECTED 상태로 변경 (삭제 대신 상태 변경으로 재초대 가능하게)
    membership.status = 'REJECTED' as TeamStatus;
    const saved = await this.teamUsers.save(membership);
    console.log(
      `[leaveTeam] Membership status changed to REJECTED: id=${saved.id}, status=${saved.status}`,
    );
  }

  /**
   * 팀 삭제 (소유자만 가능)
   */
  async deleteTeam(teamId: number, userId: string): Promise<void> {
    const team = await this.teams.findOne({
      where: { id: teamId },
      relations: ['owner'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // 소유자인지 확인
    if (team.owner.id !== userId) {
      throw new ForbiddenException('Only team owner can delete the team');
    }

    // 팀 삭제 (CASCADE로 team_users도 함께 삭제됨)
    await this.teams.remove(team);
  }

  /**
   * 팀원 강제 탈퇴 (소유자만 가능)
   */
  async removeMember(
    teamId: number,
    targetUserId: string,
    ownerId: string,
  ): Promise<void> {
    const team = await this.teams.findOne({
      where: { id: teamId },
      relations: ['owner'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // 소유자인지 확인
    if (team.owner.id !== ownerId) {
      throw new ForbiddenException('Only team owner can remove members');
    }

    // 탈퇴 대상이 소유자인지 확인
    if (team.owner.id === targetUserId) {
      throw new BadRequestException('Cannot remove team owner');
    }

    const membership = await this.teamUsers.findOne({
      where: { team: { id: teamId }, user: { id: targetUserId } },
      relations: ['user', 'team'],
    });

    if (!membership) {
      throw new NotFoundException('Team membership not found');
    }

    // 멤버십을 REJECTED 상태로 변경 (삭제 대신 상태 변경으로 재초대 가능하게)
    membership.status = 'REJECTED' as TeamStatus;
    const saved = await this.teamUsers.save(membership);
    console.log(
      `[removeMember] Membership status changed to REJECTED: id=${saved.id}, status=${saved.status}`,
    );

    // 알람 생성
    await this.notificationService.createNotification(
      targetUserId,
      'TEAM_REMOVED',
      `${team.name} 팀에서 탈퇴되었습니다.`,
      {
        teamId: team.id,
        teamName: team.name,
      },
    );
  }
}
