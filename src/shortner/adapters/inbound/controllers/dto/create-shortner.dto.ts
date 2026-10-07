import { IsUrl } from 'class-validator';

export class CreateShortnerDto {
  @IsUrl({require_protocol: true})
  destinantion_url:string;
}
