import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { MakcorpsProvider } from './providers/makcorps.provider';

@Module({
  imports: [HttpModule],
  controllers: [HotelsController],
  providers: [HotelsService, MakcorpsProvider],
})
export class HotelsModule {}
