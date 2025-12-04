import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PostService } from './post.service';
import { Post } from './post.entity';
import { Schedule } from 'src/schedule/schedule.entity';
import { CreatePostInputClass } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostService', () => {
  let service: PostService;

  const mockPost = {
    id: 1,
    title: 'Test Post',
    seq: 1,
    schedule: { id: 1, title: 'Test Schedule' },
    contentItems: [],
  };

  const mockSchedule = {
    id: 1,
    title: 'Test Schedule',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  };

  const mockPostRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };

  const mockScheduleRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
        {
          provide: getRepositoryToken(Schedule),
          useValue: mockScheduleRepository,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);

    // No need to get postRepository and scheduleRepository from module,
    // as we are using mockPostRepository and mockScheduleRepository directly.
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post successfully', async () => {
      const createPostDto: CreatePostInputClass = {
        title: 'Test Post',
        schedule_id: 1,
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ maxSeq: 3 }), // 기존 최대 seq가 3
      };

      mockScheduleRepository.findOne.mockResolvedValue(mockSchedule);
      mockPostRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockPostRepository.create.mockReturnValue(mockPost);
      mockPostRepository.save.mockResolvedValue(mockPost);

      const result = await service.create({
        ...createPostDto,
        schedule_id: createPostDto.schedule_id,
      });

      expect(mockScheduleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPostRepository.createQueryBuilder).toHaveBeenCalledWith(
        'post',
      );
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'MAX(post.seq)',
        'maxSeq',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'post.schedule.id = :scheduleId',
        { scheduleId: 1 },
      );
      expect(mockPostRepository.create).toHaveBeenCalledWith({
        title: 'Test Post',
        seq: 4, // 기존 최대 seq(3) + 1
        schedule: mockSchedule,
      });
      expect(mockPostRepository.save).toHaveBeenCalledWith(mockPost);
      expect(result).toEqual(mockPost);
    });

    it('should create first post with seq 1 when no posts exist', async () => {
      const createPostDto: CreatePostInputClass = {
        title: 'First Post',
        schedule_id: 1,
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ maxSeq: null }), // 기존 posts 없음
      };

      mockScheduleRepository.findOne.mockResolvedValue(mockSchedule);
      mockPostRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockPostRepository.create.mockReturnValue({ ...mockPost, seq: 1 });
      mockPostRepository.save.mockResolvedValue({ ...mockPost, seq: 1 });

      await service.create(createPostDto);

      expect(mockPostRepository.create).toHaveBeenCalledWith({
        title: 'First Post',
        seq: 1, // null || 0 + 1 = 1
        schedule: mockSchedule,
      });
    });

    it('should throw NotFoundException if schedule not found', async () => {
      const createPostDto: CreatePostInputClass = {
        title: 'Test Post',
        schedule_id: 999,
      };

      mockScheduleRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createPostDto)).rejects.toThrow(
        new NotFoundException('Schedule with ID 999 not found'),
      );
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const posts = [mockPost];
      mockPostRepository.find.mockResolvedValue(posts);

      const result = await service.findAll();

      expect(mockPostRepository.find).toHaveBeenCalledWith({
        relations: ['schedule', 'contentItems'],
      });
      expect(result).toEqual(posts);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne(1);

      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['schedule', 'contentItems'],
      });
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Post with ID 999 not found'),
      );
    });
  });

  describe('update', () => {
    it('should update a post successfully', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Post',
      };

      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.save.mockResolvedValue({
        ...mockPost,
        title: 'Updated Post',
      });

      const result = await service.update(1, updatePostDto);

      expect(result.title).toBe('Updated Post');
    });
  });

  describe('remove', () => {
    it('should remove a post successfully', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.remove.mockResolvedValue(mockPost);

      await service.remove(1);

      expect(mockPostRepository.remove).toHaveBeenCalledWith(mockPost);
    });
  });

  describe('updateSequence', () => {
    it('should update post sequence successfully', async () => {
      const postSeqUpdates = [
        { id: 1, seq: 2 },
        { id: 2, seq: 1 },
      ];
      const mockManager = {
        update: jest.fn(),
      };

      mockPostRepository.manager.transaction.mockImplementation(
        async (callback) => {
          return await callback(mockManager);
        },
      );

      await service.updateSequence(1, postSeqUpdates);

      expect(mockPostRepository.manager.transaction).toHaveBeenCalled();
      expect(mockManager.update).toHaveBeenCalledTimes(2);
      expect(mockManager.update).toHaveBeenCalledWith(Post, 1, { seq: 2 });
      expect(mockManager.update).toHaveBeenCalledWith(Post, 2, { seq: 1 });
    });
  });

  describe('findByScheduleOrderedBySeq', () => {
    it('should return posts ordered by seq', async () => {
      const orderedPosts = [
        { ...mockPost, seq: 1 },
        { ...mockPost, id: 2, seq: 2 },
      ];
      mockPostRepository.find.mockResolvedValue(orderedPosts);

      const result = await service.findByScheduleOrderedBySeq(1);

      expect(mockPostRepository.find).toHaveBeenCalledWith({
        where: { schedule: { id: 1 } },
        relations: ['schedule', 'contentItems'],
        order: { seq: 'ASC' },
      });
      expect(result).toEqual(orderedPosts);
    });
  });
});
