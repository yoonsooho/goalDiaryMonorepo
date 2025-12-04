import { ScheduleUser } from 'src/schedule-user/entities/schedule-user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Routine } from 'src/routine/routine.entity';
import { Diary } from 'src/diary/entities/diary.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; //유저 고유의 식별을 위한 아이디

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  userId: string; //유저의 로그인 아이디

  @Column({
    type: 'varchar',
    length: 255,

    nullable: false,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  refreshToken?: string;

  @Column({ nullable: true })
  socialId?: string;

  @Column({ nullable: true })
  social?: string;

  @OneToMany(() => ScheduleUser, (scheduleUser) => scheduleUser.user)
  scheduleUsers: ScheduleUser[];

  @OneToMany(() => Routine, (routine) => routine.user)
  routines: Routine[];

  @OneToMany(() => Diary, (diary) => diary.user)
  diarys: Diary[];
}
