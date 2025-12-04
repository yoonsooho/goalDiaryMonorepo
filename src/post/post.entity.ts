import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Schedule } from 'src/schedule/schedule.entity';
import { ContentItem } from 'src/content-item/content-item.entity';

@Entity('posts')
export class Post {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'int' })
  seq: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @ManyToOne(() => Schedule, (schedule) => schedule.posts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  schedule: Schedule;

  @OneToMany(() => ContentItem, (contentItem) => contentItem.post)
  contentItems: ContentItem[];
}
