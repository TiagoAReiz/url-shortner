import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import type { GoogleVerifier } from '../../application/ports/google-verifier.interface.js';
import type { GoogleProfile } from '../../domain/user.entity.js';

@Injectable()
export class GoogleVerifierImpl implements GoogleVerifier {
  private readonly client = new OAuth2Client();

  async verify(idToken: string): Promise<GoogleProfile> {
    const audience = process.env['GOOGLE_CLIENT_ID'];
    if (!audience) throw new Error('GOOGLE_CLIENT_ID não configurada');

    const ticket = await this.client.verifyIdToken({ idToken, audience });
    const p = ticket.getPayload();
    if (!p?.sub || !p.email || !p.email_verified) {
      throw new Error('Perfil do Google incompleto ou e-mail não verificado');
    }
    return { sub: p.sub, email: p.email, name: p.name, picture: p.picture };
  }
}
