import { CreateShortnerDto } from '../../../../adapters/inbound/controllers/dto/create-shortner.dto.js';

import type { VisitorContext } from '../../../../domain/entities/visitor-context.js';

export interface ShortnerServiceInterface{
   create(createShortnerDto: CreateShortnerDto, userId?: string): Promise<string>;
   findOne(id: string, visitor?: VisitorContext): Promise<string>;
}