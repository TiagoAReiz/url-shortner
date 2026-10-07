import { CreateShortnerDto } from '../../../../adapters/inbound/controllers/dto/create-shortner.dto';

export interface ShortnerServiceInterface{
   create(createShortnerDto: CreateShortnerDto):string ;
   findOne(id: string):string ;
}