import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCache', () => {
    it('should return cached data if available', async () => {
      const mockData = { test: 'data' };
      jest.spyOn(cacheManager, 'get').mockResolvedValue(mockData);

      const result = await service.getCache('test-key', async () => ({
        test: 'new-data',
      }));
      expect(result).toEqual(mockData);
    });

    it('should call function and cache result if no cached data', async () => {
      const mockData = { test: 'new-data' };
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

      const result = await service.getCache('test-key', async () => mockData);
      expect(result).toEqual(mockData);
      expect(cacheManager.set).toHaveBeenCalledWith('test-key', mockData);
    });
  });
});
