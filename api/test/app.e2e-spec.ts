import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('App e2e Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prismaService = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Delete all tasks for the test user
    await prismaService.task.deleteMany({
      where: {
        user: {
          email: 'test@example.com',
        },
      },
    });

    // Delete the test user
    await prismaService.user.deleteMany({
      where: {
        email: 'test@example.com',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    const user = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    };

    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/user')
        .send(user)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body.email).toBe(user.email);
        });
    });

    it('should login with valid credentials', async () => {
      await request(app.getHttpServer()).post('/user').send(user);

      return request(app.getHttpServer())
        .post('/user/login')
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
        });
    });
  });

  describe('Tasks', () => {
    let token: string;
    const user = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    };

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(user);
      token = response.body.token;
    });

    it('should create a task', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Task');
        });
    });

    it('should get tasks with pagination', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
        });

      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('tasks');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.tasks)).toBe(true);
        });
    });

    it('should update a task', async () => {
      const task = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
        });

      return request(app.getHttpServer())
        .put(`/tasks/${task.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Task',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Task');
        });
    });

    it('should toggle task completion', async () => {
      const task = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
        });

      return request(app.getHttpServer())
        .put(`/tasks/${task.body.id}/toggle`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.completed).toBe(true);
        });
    });

    it('should delete a task', async () => {
      const task = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
        });

      return request(app.getHttpServer())
        .delete(`/tasks/${task.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
