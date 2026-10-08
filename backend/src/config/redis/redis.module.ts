import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
export const REDIS = Symbol('REDIS');
export type RedisClientInstance = ReturnType<typeof createClient>;

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: async () => {
        const client = createClient({ url: 'redis://localhost:6379' });
        client.on('error', (err) => console.error('Redis', err));
        await client.connect();
        return client;
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
