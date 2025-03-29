import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

describe('Bootstrap', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should bootstrap the application', async () => {
    await app.init();
    expect(app).toBeDefined();
  });
});
