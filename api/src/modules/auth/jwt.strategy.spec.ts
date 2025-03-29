import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user payload', async () => {
    const payload = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
    };

    const result = await strategy.validate(payload);
    expect(result).toEqual(payload);
  });
});
