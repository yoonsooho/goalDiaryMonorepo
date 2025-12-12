import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from 'src/users/users.entity';

export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type TeamStatus = 'ACTIVE' | 'PENDING' | 'REJECTED';

@Entity({ name: 'team_users' })
export class TeamUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Team, (team) => team.teamUsers, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  team: Team;

  @ManyToOne(() => User, (user) => user.teamUsers, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @Column({ type: 'varchar', length: 20, default: 'MEMBER' })
  role: TeamRole;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: TeamStatus;

  @CreateDateColumn()
  createdAt: Date;
}
