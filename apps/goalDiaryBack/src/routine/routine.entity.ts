import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/users.entity';
import { RoutineCompletion } from './routine-completion.entity';

// Frequency enum을 제거하고 schedule_date로 대체

@Entity('routines')
export class Routine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  schedule_date: string; // YYYY-MM-DD 형식

  @Column({ type: 'time', nullable: true })
  time: string;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'simple-array', nullable: true })
  category: string[];

  @Column({ type: 'int', default: 0 })
  streak: number; // 연속 달성 일수

  @Column({ type: 'date', nullable: true })
  last_completed_date: string; // 최근 완료일

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.routines, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToMany(() => RoutineCompletion, (completion) => completion.routine)
  completions: RoutineCompletion[];
}
