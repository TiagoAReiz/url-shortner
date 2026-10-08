import { randomInt } from 'node:crypto';
import { CreateShortnerDto } from '../../adapters/inbound/controllers/dto/create-shortner.dto.js';
import { Shortner } from '../../domain/entities/shortner.entity.js';

const DEFAULT_TTL_IN_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias
const BASE62 =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const ID_LENGTH = 7; // 62^7 ~ 3.5 trilhões de combinações

export class ShortnerMapper {
  private static generateId(): string {
    let id = '';
    for (let i = 0; i < ID_LENGTH; i++) {
      id += BASE62[randomInt(BASE62.length)];
    }
    return id;
  }

  static toEntity(dto: CreateShortnerDto): Shortner {
    const now = new Date();

    return Object.assign(new Shortner(), {
      id: ShortnerMapper.generateId(),
      destination_url: dto.destination_url,
      created_at: now,
      expires_at: new Date(now.getTime() + DEFAULT_TTL_IN_MS),
    });
  }
}
