import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ContentItemService } from './content-item.service';
import { ContentItem } from './content-item.entity';
import { Post } from 'src/post/post.entity';
import { CreateContentItemDto } from './dto/create-content-item.dto';
import { UpdateContentItemDto } from './dto/update-content-item.dto';

describe('ContentItemService', () => {
  let service: ContentItemService;
  let contentItemRepository: Repository<ContentItem>;
  let postRepository: Repository<Post>;

  const mockContentItem = {
    id: 1,
    text: 'Test content item text',
    post: { id: 1, title: 'Test Post' },
  };

  const mockPost = {
    id: 1,
    title: 'Test Post',
    schedule: { id: 1, title: 'Test Schedule' },
    contentItems: [],
  };

  const mockContentItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockPostRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentItemService,
        {
          provide: getRepositoryToken(ContentItem),
          useValue: mockContentItemRepository,
        },
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    service = module.get<ContentItemService>(ContentItemService);
    contentItemRepository = module.get<Repository<ContentItem>>(getRepositoryToken(ContentItem));
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a content item successfully', async () => {
      const createContentItemDto: CreateContentItemDto = {
        text: 'Test content item text',
        post_id: 1,
      };

      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockContentItemRepository.create.mockReturnValue(mockContentItem);
      mockContentItemRepository.save.mockResolvedValue(mockContentItem);

      const result = await service.create(createContentItemDto);

      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockContentItemRepository.create).toHaveBeenCalledWith({
        text: 'Test content item text',
        post: mockPost,
      });
      expect(mockContentItemRepository.save).toHaveBeenCalledWith(mockContentItem);
      expect(result).toEqual(mockContentItem);
    });

    it('should throw NotFoundException if post not found', async () => {
      const createContentItemDto: CreateContentItemDto = {
        text: 'Test content item text',
        post_id: 999,
      };

      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createContentItemDto)).rejects.toThrow(
        new NotFoundException('Post with ID 999 not found'),
      );
    });
  });

  describe('findAll', () => {
    it('should return all content items', async () => {
      const contentItems = [mockContentItem];
      mockContentItemRepository.find.mockResolvedValue(contentItems);

      const result = await service.findAll();

      expect(mockContentItemRepository.find).toHaveBeenCalledWith({
        relations: ['post'],
      });
      expect(result).toEqual(contentItems);
    });
  });

  describe('findOne', () => {
    it('should return a content item by id', async () => {
      mockContentItemRepository.findOne.mockResolvedValue(mockContentItem);

      const result = await service.findOne(1);

      expect(mockContentItemRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['post'],
      });
      expect(result).toEqual(mockContentItem);
    });

    it('should throw NotFoundException if content item not found', async () => {
      mockContentItemRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('ContentItem with ID 999 not found'),
      );
    });
  });

  describe('remove', () => {
    it('should remove a content item successfully', async () => {
      mockContentItemRepository.findOne.mockResolvedValue(mockContentItem);
      mockContentItemRepository.remove.mockResolvedValue(mockContentItem);

      await service.remove(1);

      expect(mockContentItemRepository.remove).toHaveBeenCalledWith(mockContentItem);
    });
  });
});