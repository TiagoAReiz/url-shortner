import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './adapters/inbound/auth.controller.js';
import {
  AdminGuard,
  AuthGuard,
  OptionalAuthGuard,
} from './adapters/inbound/guards/auth.guards.js';
import { GoogleVerifierImpl } from './adapters/outbound/google.verifier.js';
import { UserRepositoryImpl } from './adapters/outbound/user.repository.js';
import { GOOGLE_VERIFIER } from './application/ports/google-verifier.interface.js';
import { USER_REPOSITORY } from './application/ports/user.repository.interface.js';
import { AuthService } from './application/services/auth.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env['JWT_SECRET'];
        if (!secret) throw new Error('JWT_SECRET não configurada');
        return { secret, signOptions: { expiresIn: '7d' } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    OptionalAuthGuard,
    AdminGuard,
    { provide: USER_REPOSITORY, useClass: UserRepositoryImpl },
    { provide: GOOGLE_VERIFIER, useClass: GoogleVerifierImpl },
  ],
  exports: [AuthService, AuthGuard, OptionalAuthGuard, AdminGuard],
})
export class AuthModule {}
