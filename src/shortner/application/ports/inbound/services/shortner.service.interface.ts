import { CreateShortnerDto } from '../../../../adapters/inbound/controllers/dto/create-shortner.dto.js';

export interface ShortnerServiceInterface{
   create(createShortnerDto: CreateShortnerDto): Promise<string>;
   findOne(id: string): Promise<string>;
}