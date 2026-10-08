import { Shortner } from '../../../../domain/entities/shortner.entity.js';


export interface ShortnerRepository {
  save(url: Shortner): Promise<Shortner>


  getById(id: string): Promise<Shortner | null>
}

export const SHORTNER_REPOSITORY = Symbol('SHORTNER_REPOSITORY');
