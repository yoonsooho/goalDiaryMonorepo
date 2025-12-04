import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Routine } from './routine.entity';

@Entity('routine_completions')
@Unique(['routine', 'date'])
export class RoutineCompletion {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  completed_at: Date;

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => Routine, (routine) => routine.completions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  routine: Routine;
}
