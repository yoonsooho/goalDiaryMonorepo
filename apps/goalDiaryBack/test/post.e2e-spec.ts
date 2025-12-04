import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../src/post/post.entity';
import { Schedule } from '../src/schedule/schedule.entity';
import { PostModule } from '../src/post/post.module';

describe('PostController (e2e)', () => {
  let app: INestApplication;
  let postRepository: Repository<Post>;
  let scheduleRepository: Repository<Schedule>;

  const mockPost = {
    id: 1,
    title: 'Test Post',
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
  };

  const mockScheduleRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PostModule],
    })
      .overrideProvider(getRepositoryToken(Post))
      .useValue(mockPostRepository)
      .overrideProvider(getRepositoryToken(Schedule))
      .useValue(mockScheduleRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    postRepository = moduleFixture.get<Repository<Post>>(getRepositoryToken(Post));
    scheduleRepository = moduleFixture.get<Repository<Schedule>>(getRepositoryToken(Schedule));
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('/posts (POST)', () => {
    it('should create a post', async () => {
      const createPostDto = {
        title: 'Test Post',
        schedule_id: 1,
      };

      mockScheduleRepository.findOne.mockResolvedValue(mockSchedule);
      mockPostRepository.create.mockReturnValue(mockPost);
      mockPostRepository.save.mockResolvedValue(mockPost);

      const response = await request(app.getHttpServer())
        .post('/posts')
        .send(createPostDto)
        .expect(201);

      expect(response.body).toEqual(mockPost);
    });

    it('should return 404 if schedule not found', async () => {
      const createPostDto = {
        title: 'Test Post',
        schedule_id: 999,
      };

      mockScheduleRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/posts')
        .send(createPostDto)
        .expect(404);
    });
  });

  describe('/posts (GET)', () => {
    it('should return all posts', async () => {
      const posts = [mockPost];
      mockPostRepository.find.mockResolvedValue(posts);

      const response = await request(app.getHttpServer())
        .get('/posts')
        .expect(200);

      expect(response.body).toEqual(posts);
    });

    it('should return posts filtered by scheduleId', async () => {
      const posts = [mockPost];
      mockPostRepository.find.mockResolvedValue(posts);

      const response = await request(app.getHttpServer())
        .get('/posts?scheduleId=1')
        .expect(200);

      expect(response.body).toEqual(posts);
    });
  });

  describe('/posts/:id (GET)', () => {
    it('should return a post by id', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);

      const response = await request(app.getHttpServer())
        .get('/posts/1')
        .expect(200);

      expect(response.body).toEqual(mockPost);
    });

    it('should return 404 if post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/posts/999')
        .expect(404);
    });
  });

  describe('/posts/:id (PATCH)', () => {
    it('should update a post', async () => {
      const updatePostDto = { title: 'Updated Post' };
      const updatedPost = { ...mockPost, title: 'Updated Post' };

      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.save.mockResolvedValue(updatedPost);

      const response = await request(app.getHttpServer())
        .patch('/posts/1')
        .send(updatePostDto)
        .expect(200);

      expect(response.body.title).toBe('Updated Post');
    });
  });

  describe('/posts/:id (DELETE)', () => {
    it('should delete a post', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.remove.mockResolvedValue(mockPost);

      await request(app.getHttpServer())
        .delete('/posts/1')
        .expect(200);
    });
  });
});
