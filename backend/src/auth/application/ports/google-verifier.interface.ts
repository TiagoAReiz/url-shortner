import type { GoogleProfile } from '../../domain/user.entity.js';

export interface GoogleVerifier {
  /** Valida o ID token do Google e devolve o perfil. Lança se for inválido. */
  verify(idToken: string): Promise<GoogleProfile>;
}

export const GOOGLE_VERIFIER = Symbol('GOOGLE_VERIFIER');
