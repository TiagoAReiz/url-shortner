import type { GoogleProfile, User } from '../../domain/user.entity.js';

export interface UserRepository {
  /** Cria o usuário no primeiro login ou atualiza email/nome/foto nos seguintes. */
  upsertFromGoogle(profile: GoogleProfile): Promise<User>;
  getById(id: string): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
