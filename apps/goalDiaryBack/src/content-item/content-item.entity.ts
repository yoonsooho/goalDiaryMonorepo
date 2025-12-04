// src/content/content-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ValueTransformer,
} from 'typeorm';
import { Post } from 'src/post/post.entity';

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

@Entity('content_items')
export class ContentItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  text: string;

  @Column({ type: 'int' })
  seq: number;

  @ManyToOne(() => Post, (post) => post.contentItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  post: Post;

  @Column({
    type: 'time',
    nullable: true,
    default: null,
    transformer: timeTransformer,
  })
  startTime?: string; // DB에는 HH:mm:ss로 저장, 조회 시 HH:mm으로 변환

  @Column({
    type: 'time',
    nullable: true,
    default: null,
    transformer: timeTransformer,
  })
  endTime?: string; // DB에는 HH:mm:ss로 저장, 조회 시 HH:mm으로 변환
}
