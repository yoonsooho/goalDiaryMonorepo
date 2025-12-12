import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentItem } from './content-item.entity';
import { CreateContentItemDto } from './dto/create-content-item.dto';
import { UpdateContentItemTextDto } from './dto/update-content-item.dto';
import { Post } from 'src/post/post.entity';
import { ScheduleGateway } from 'src/schedule/schedule.gateway';

@Injectable()
export class ContentItemService {
  constructor(
    @InjectRepository(ContentItem)
    private readonly contentItemRepository: Repository<ContentItem>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @Inject(forwardRef(() => ScheduleGateway))
    private readonly scheduleGateway: ScheduleGateway,
  ) {}

  async create(
    createContentItemDto: CreateContentItemDto,
  ): Promise<ContentItem> {
    // Post 존재 여부 확인
    const post = await this.postRepository.findOne({
      where: { id: createContentItemDto.post_id },
    });

    if (!post) {
      throw new NotFoundException(
        `Post with ID ${createContentItemDto.post_id} not found`,
      );
    }
    // 해당 post의 가장 큰 seq 값 조회하여 +1로 설정 (seq 중복 방지)
    const maxSeqResult = await this.contentItemRepository
      .createQueryBuilder('contentItem')
      .select('MAX(contentItem.seq)', 'maxSeq')
      .where('contentItem.post.id = :postId', {
        postId: createContentItemDto.post_id,
      })
      .getRawOne();

    const newSeq = (maxSeqResult?.maxSeq || 0) + 1;

    const contentItem = this.contentItemRepository.create({
      text: createContentItemDto.text,
      seq: newSeq,
      post: post,
    });

    const saved = await this.contentItemRepository.save(contentItem);

    // Post를 통해 scheduleId 찾아서 WebSocket 브로드캐스트
    const postWithSchedule = await this.postRepository.findOne({
      where: { id: createContentItemDto.post_id },
      relations: ['schedule'],
    });
    if (postWithSchedule?.schedule?.id) {
      this.scheduleGateway.emitScheduleUpdated(postWithSchedule.schedule.id, {
        type: 'contentItems.updated',
        scheduleId: postWithSchedule.schedule.id,
      });
    }

    return saved;
  }

  async findAll(): Promise<ContentItem[]> {
    return this.contentItemRepository.find({
      relations: ['post'],
    });
  }

  async findOne(id: number): Promise<ContentItem> {
    const contentItem = await this.contentItemRepository.findOne({
      where: { id },
      relations: ['post'],
    });

    if (!contentItem) {
      throw new NotFoundException(`ContentItem with ID ${id} not found`);
    }

    return contentItem;
  }

  async findByPostId(postId: string): Promise<ContentItem[]> {
    return this.contentItemRepository.find({
      where: { post: { id: postId } },
      relations: ['post'],
    });
  }

  async update(
    contentItemId: number,
    updateContentItemTextDto: UpdateContentItemTextDto,
  ): Promise<ContentItem> {
    const contentItem = await this.findOne(contentItemId);

    contentItem.text = updateContentItemTextDto.text;

    if (updateContentItemTextDto.startTime !== undefined) {
      contentItem.startTime = updateContentItemTextDto.startTime;
    }
    if (updateContentItemTextDto.endTime !== undefined) {
      contentItem.endTime = updateContentItemTextDto.endTime;
    }
    if (updateContentItemTextDto.isCompleted !== undefined) {
      contentItem.isCompleted = updateContentItemTextDto.isCompleted;
    }

    const saved = await this.contentItemRepository.save(contentItem);

    // Post를 통해 scheduleId 찾아서 WebSocket 브로드캐스트
    const post = await this.postRepository.findOne({
      where: { id: contentItem.post.id },
      relations: ['schedule'],
    });
    if (post?.schedule?.id) {
      this.scheduleGateway.emitScheduleUpdated(post.schedule.id, {
        type: 'contentItems.updated',
        scheduleId: post.schedule.id,
      });
    }

    return saved;
  }

  async remove(id: number): Promise<void> {
    const contentItem = await this.findOne(id);
    const postId = contentItem.post.id;
    await this.contentItemRepository.remove(contentItem);

    // Post를 통해 scheduleId 찾아서 WebSocket 브로드캐스트
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['schedule'],
    });
    if (post?.schedule?.id) {
      this.scheduleGateway.emitScheduleUpdated(post.schedule.id, {
        type: 'contentItems.updated',
        scheduleId: post.schedule.id,
      });
    }
  }

  // 순서 변경 메서드 (드래그 앤 드롭용)
  async updateSequence(
    postId: string,
    contentItemSeqUpdates: { id: number; seq: number }[],
  ): Promise<void> {
    await this.contentItemRepository.manager.transaction(async (manager) => {
      for (const update of contentItemSeqUpdates) {
        await manager.update(ContentItem, update.id, { seq: update.seq });
      }
    });

    // Post를 통해 scheduleId 찾아서 WebSocket 브로드캐스트
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['schedule'],
    });
    if (post?.schedule?.id) {
      this.scheduleGateway.emitScheduleUpdated(post.schedule.id, {
        type: 'contentItems.updated',
        scheduleId: post.schedule.id,
      });
    }
  }

  // 특정 post의 content-items를 seq 순서로 조회
  async findByPostOrderedBySeq(postId: string): Promise<ContentItem[]> {
    return this.contentItemRepository.find({
      where: { post: { id: postId } },
      relations: ['post'],
      order: { seq: 'ASC' },
    });
  }

  // ContentItem을 다른 Post로 이동하고 두 Post의 seq 재정렬
  async moveContentItem(moveData: {
    contentItemId: number;
    fromPostId: string;
    toPostId: string;
    toPostContentItems: { id: number; seq: number }[];
  }): Promise<void> {
    await this.contentItemRepository.manager.transaction(async (manager) => {
      // 1. ContentItem이 존재하고 fromPost에 속하는지 확인
      const contentItem = await manager.findOne(ContentItem, {
        where: {
          id: moveData.contentItemId,
          post: { id: moveData.fromPostId },
        },
        relations: ['post'],
      });

      if (!contentItem) {
        throw new NotFoundException(
          `ContentItem with ID ${moveData.contentItemId} not found in post ${moveData.fromPostId}`,
        );
      }

      // 2. toPost가 존재하는지 확인
      const toPost = await manager.findOne(Post, {
        where: { id: moveData.toPostId },
      });

      if (!toPost) {
        throw new NotFoundException(
          `Post with ID ${moveData.toPostId} not found`,
        );
      }

      // 3. ContentItem의 post 변경
      await manager.update(ContentItem, moveData.contentItemId, {
        post: { id: moveData.toPostId },
      });

      // 4. fromPost의 나머지 contentItems seq 조정 (삭제된 item보다 큰 seq들을 -1)
      await manager
        .createQueryBuilder()
        .update(ContentItem)
        .set({ seq: () => 'seq - 1' })
        .where('post.id = :fromPostId', { fromPostId: moveData.fromPostId })
        .andWhere('seq > :deletedSeq', { deletedSeq: contentItem.seq })
        .execute();

      // 5. toPost의 contentItems seq 업데이트
      for (const update of moveData.toPostContentItems) {
        await manager.update(ContentItem, update.id, { seq: update.seq });
      }
    });

    // Post를 통해 scheduleId 찾아서 WebSocket 브로드캐스트
    const toPost = await this.postRepository.findOne({
      where: { id: moveData.toPostId },
      relations: ['schedule'],
    });
    if (toPost?.schedule?.id) {
      this.scheduleGateway.emitScheduleUpdated(toPost.schedule.id, {
        type: 'contentItems.updated',
        scheduleId: toPost.schedule.id,
      });
    }
  }
}
