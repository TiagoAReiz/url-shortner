import { Inject, Injectable } from '@nestjs/common';
import { CacheInterface } from '../../../application/ports/outbound/cache/cache.interface';

import {
  REDIS,
  type RedisClientInstance,
} from '../../../../config/redis/redis.module';

const EXP_TIME_IN_SEC = 60 * 60 * 12; //12hrs

@Injectable()
export class RedisClient implements CacheInterface {

  constructor(@Inject(REDIS) private readonly redis: RedisClientInstance) {}
  async getByKey(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }
  async createCache(url: string, shortned_url: string): Promise<void> {
    await this.redis.set(url, shortned_url, { EX: EXP_TIME_IN_SEC });
  }
}
