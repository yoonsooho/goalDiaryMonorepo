import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    googleLogin: jest.fn(),
    refreshAllTokens: jest.fn(),
  };

  const mockRes = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    redirect: jest.fn(),
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signOut', () => {
    it('body.refreshToken이 있으면 signOut(userId, body.refreshToken)을 호출한다', async () => {
      const req = { user: { sub: 'user-uuid-1' }, cookies: {} };
      mockAuthService.signOut.mockResolvedValue(undefined);

      await controller.signOut(req as any, mockRes as any, {
        refreshToken: 'my-refresh-token',
      });

      expect(authService.signOut).toHaveBeenCalledWith(
        'user-uuid-1',
        'my-refresh-token',
      );
    });

    it('body에 refreshToken이 없고 쿠키에 있으면 쿠키 값을 넘긴다', async () => {
      const req = {
        user: { sub: 'user-uuid-1' },
        cookies: { refresh_token: 'cookie-refresh-token' },
      };
      mockAuthService.signOut.mockResolvedValue(undefined);

      await controller.signOut(req as any, mockRes as any, {});

      expect(authService.signOut).toHaveBeenCalledWith(
        'user-uuid-1',
        'cookie-refresh-token',
      );
    });

    it('refreshToken이 없으면 signOut(userId, undefined)을 호출한다 (백엔드는 아무것도 안 함)', async () => {
      const req = { user: { sub: 'user-uuid-1' }, cookies: {} };

      await controller.signOut(req as any, mockRes as any, undefined);

      expect(authService.signOut).toHaveBeenCalledWith(
        'user-uuid-1',
        undefined,
      );
    });

    it('응답으로 message를 반환하고 쿠키를 비운다', async () => {
      const req = { user: { sub: 'user-uuid-1' }, cookies: {} };

      const result = await controller.signOut(req as any, mockRes as any, {});

      expect(result).toEqual({ message: '로그아웃 성공' });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        '',
        expect.any(Object),
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        '',
        expect.any(Object),
      );
    });
  });

  describe('signUp', () => {
    it('signUp 성공 시 토큰과 메시지를 반환한다', async () => {
      const dto: SignUpDto = {
        userId: 'new@test.com',
        username: 'New User',
        password: 'password123',
      } as SignUpDto;
      mockAuthService.signUp.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      const result = await controller.signUp(dto);

      expect(authService.signUp).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        message: '회원가입 성공',
        accessToken: 'access',
        refreshToken: 'refresh',
      });
    });
  });

  describe('login (signIn)', () => {
    it('signIn 성공 시 토큰을 쿠키에 설정하고 토큰과 메시지를 반환한다', async () => {
      const dto: SignInDto = {
        userId: 'test@test.com',
        password: 'password',
      };
      mockAuthService.signIn.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      const result = await controller.login(dto, mockRes as any);

      expect(authService.signIn).toHaveBeenCalledWith(dto);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'access',
        expect.any(Object),
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh',
        expect.any(Object),
      );
      expect(result).toEqual({
        message: '로그인 성공',
        accessToken: 'access',
        refreshToken: 'refresh',
      });
    });
  });
});
