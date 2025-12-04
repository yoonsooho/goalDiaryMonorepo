import { Schedule } from 'src/schedule/schedule.entity';
import { User } from 'src/users/users.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';

@Entity()
export class ScheduleUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.scheduleUsers, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Schedule, (schedule) => schedule.scheduleUsers, {
    onDelete: 'CASCADE',
  })
  schedule: Schedule;

  @Column({ default: false })
  canEdit: boolean; // 공유 권한
}
