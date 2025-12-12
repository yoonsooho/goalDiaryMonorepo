import { Post } from 'src/post/post.entity';
import { ScheduleUser } from 'src/schedule-user/entities/schedule-user.entity';
import { Team } from 'src/team/entities/team.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'schedules',
})
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  title: string;

  @OneToMany(() => Post, (post) => post.schedule)
  posts: Post[];

  @ManyToOne(() => Team, (team) => team.schedules, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  team?: Team;

  @Column({ type: 'date', nullable: false })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ScheduleUser, (scheduleUser) => scheduleUser.schedule)
  scheduleUsers: ScheduleUser[];
}
