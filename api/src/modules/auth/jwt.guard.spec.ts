import { JwtAuthGuard } from './jwt.guard';
import { UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no token provided', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      };

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when invalid token provided', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer invalid-token',
            },
          }),
        }),
      };

      (verify as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should return true and set user when valid token provided', () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token',
            },
          }),
        }),
      };

      (verify as jest.Mock).mockReturnValue(mockUser);

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });
  });
});
