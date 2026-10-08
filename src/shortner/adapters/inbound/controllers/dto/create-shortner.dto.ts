import { IsUrl } from 'class-validator';

export class CreateShortnerDto {
  @IsUrl({require_protocol: true})
  destination_url:string;
}
