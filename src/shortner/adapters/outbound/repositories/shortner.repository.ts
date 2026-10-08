import { Shortner } from '../../../domain/entities/shortner.entity';
import { db } from '../../../../prisma/db';

export class ShortnerRepository {
  async save(url: Shortner): Promise<Shortner> {
    try{
      return await db.orm.public.Shortner.create(url);
    }
    catch (error){
      throw error
    }

  }

  async getById (id: string): Promise<Shortner|null>{
      return await db.orm.public.Shortner.first({id})

  }
}