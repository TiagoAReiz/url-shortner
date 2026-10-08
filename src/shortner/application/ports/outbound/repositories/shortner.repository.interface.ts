import { Shortner } from '../../../../domain/entities/shortner.entity';


export interface ShortnerRepository {
  save(url: Shortner): Promise<Shortner>


  getById(id: string): Promise<Shortner | null>
}
