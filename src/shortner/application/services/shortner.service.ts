import { Injectable } from '@nestjs/common';
import { CreateShortnerDto } from '../../adapters/inbound/controllers/dto/create-shortner.dto.js';
import { ShortnerServiceInterface } from '../ports/inbound/services/shortner.service.interface';


@Injectable()
export class ShortnerService implements ShortnerServiceInterface {
  create(createShortnerDto: CreateShortnerDto): string {
    return 'This action adds a new shortner';
  }

  findOne(id: string): string {
    return `This action returns a #${id} shortner`;
  }
}
