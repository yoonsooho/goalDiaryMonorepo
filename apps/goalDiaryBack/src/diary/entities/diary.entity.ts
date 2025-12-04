import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';
import { User } from 'src/users/users.entity';

// HH:mm 형식으로 변환하는 transformer
const timeTransformer: ValueTransformer = {
  // DB에서 조회할 때: HH:mm:ss -> HH:mm
  from: (value: string | null): string | null => {
    if (!value) return null;
    // HH:mm:ss 형식을 HH:mm으로 변환
    return value.substring(0, 5);
  },
  // DB에 저장할 때: HH:mm 형식 그대로 전달 (PostgreSQL이 자동으로 HH:mm:00으로 변환)
  to: (value: string | null): string | null => {
    return value; // DTO/프론트에서 받은 HH:mm 형식 그대로 저장
  },
};

@Entity('diarys')
export class Diary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: false })
  date: string; // YYYY-MM-DD 형식

  @Column({
    type: 'time',
    nullable: false,
    transformer: timeTransformer,
  })
  time: string; // DB에는 HH:mm:ss로 저장, 조회 시 HH:mm으로 변환

  @Column({ type: 'text', nullable: false })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.diarys, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
