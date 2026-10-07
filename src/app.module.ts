import { Module } from '@nestjs/common';
import { ShortnerModule } from './shortner/shortner.module.js';


@Module({
  imports: [ShortnerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
