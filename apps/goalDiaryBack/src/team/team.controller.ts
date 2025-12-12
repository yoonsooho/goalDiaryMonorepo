import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { InviteTeamDto } from './dto/invite-team.dto';
import { TeamStatus } from './entities/team-user.entity';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';

@UseGuards(AccessTokenGuard)
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  async create(@Body() dto: CreateTeamDto, @Req() req: any) {
    const ownerId = dto.ownerId || req.user?.id;
    return this.teamService.createTeam({ ...dto, ownerId });
  }

  @Post(':teamId/invite')
  async invite(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Body() dto: InviteTeamDto,
  ) {
    return this.teamService.inviteMember(teamId, dto);
  }

  @Patch('invitations/:membershipId')
  async updateInvitation(
    @Param('membershipId', ParseIntPipe) membershipId: number,
    @Body('status') status: TeamStatus,
  ) {
    return this.teamService.updateInvitationStatus(membershipId, status);
  }

  // 구체적인 라우트를 동적 라우트보다 먼저 배치해야 함
  @Get('invitations/me')
  async getMyInvitations(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.teamService.getMyInvitations(userId);
  }

  @Get('me')
  async getMyTeams(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.teamService.getMyTeams(userId);
  }

  @Get(':teamId/members')
  async members(@Param('teamId', ParseIntPipe) teamId: number) {
    return this.teamService.listMembers(teamId);
  }

  @Get(':teamId')
  async getTeam(@Param('teamId', ParseIntPipe) teamId: number) {
    return this.teamService.getTeam(teamId);
  }

  @Delete(':teamId/leave')
  async leaveTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    await this.teamService.leaveTeam(teamId, userId);
    return { message: 'Successfully left the team' };
  }

  @Delete(':teamId')
  async deleteTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    await this.teamService.deleteTeam(teamId, userId);
    return { message: 'Team deleted successfully' };
  }

  @Delete(':teamId/members/:userId')
  async removeMember(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('userId') targetUserId: string,
    @Req() req: any,
  ) {
    const ownerId = req.user?.sub || req.user?.id;
    await this.teamService.removeMember(teamId, targetUserId, ownerId);
    return { message: 'Member removed successfully' };
  }
}
