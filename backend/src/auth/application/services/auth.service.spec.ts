import { AuthService } from './auth.service.js';
import { InvalidCredentials } from '../../domain/invalid-credentials.js';

describe('AuthService', () => {
  const users = { upsertFromGoogle: vi.fn(), getById: vi.fn() };
  const google = { verify: vi.fn() };
  const jwt = { signAsync: vi.fn(), verifyAsync: vi.fn() };
  let service: AuthService;
  const original = process.env['ADMIN_EMAILS'];

  beforeEach(() => {
    vi.resetAllMocks();
    service = new AuthService(users as never, google as never, jwt as never);
  });

  afterEach(() => {
    if (original === undefined) delete process.env['ADMIN_EMAILS'];
    else process.env['ADMIN_EMAILS'] = original;
  });

  describe('loginWithGoogle', () => {
    it('valida o token, cria/atualiza o usuário e assina o JWT', async () => {
      const profile = { sub: 'g1', email: 'a@x.com', name: 'A' };
      const user = { id: 'u1', email: 'a@x.com' };
      google.verify.mockResolvedValue(profile);
      users.upsertFromGoogle.mockResolvedValue(user);
      jwt.signAsync.mockResolvedValue('jwt-token');

      const result = await service.loginWithGoogle('id-token');

      expect(google.verify).toHaveBeenCalledWith('id-token');
      expect(users.upsertFromGoogle).toHaveBeenCalledWith(profile);
      expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1', email: 'a@x.com' });
      expect(result).toEqual({ user, token: 'jwt-token' });
    });

    it('lança InvalidCredentials se o Google rejeitar o token', async () => {
      google.verify.mockRejectedValue(new Error('bad token'));

      await expect(service.loginWithGoogle('x')).rejects.toBeInstanceOf(
        InvalidCredentials,
      );
      expect(users.upsertFromGoogle).not.toHaveBeenCalled();
    });
  });

  describe('authenticate', () => {
    it('devolve o usuário do JWT válido', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: 'u1', email: 'a@x.com' });
      users.getById.mockResolvedValue({ id: 'u1' });

      await expect(service.authenticate('t')).resolves.toEqual({ id: 'u1' });
      expect(users.getById).toHaveBeenCalledWith('u1');
    });

    it('devolve null para JWT inválido ou expirado', async () => {
      jwt.verifyAsync.mockRejectedValue(new Error('expired'));

      await expect(service.authenticate('t')).resolves.toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('compara com ADMIN_EMAILS sem diferenciar maiúsculas', () => {
      process.env['ADMIN_EMAILS'] = 'Dono@x.com, outro@x.com';

      expect(service.isAdmin({ email: 'dono@x.com' })).toBe(true);
      expect(service.isAdmin({ email: 'OUTRO@x.com' })).toBe(true);
      expect(service.isAdmin({ email: 'intruso@x.com' })).toBe(false);
    });

    it('ninguém é admin se ADMIN_EMAILS estiver vazia', () => {
      delete process.env['ADMIN_EMAILS'];

      expect(service.isAdmin({ email: 'a@x.com' })).toBe(false);
    });
  });
});
