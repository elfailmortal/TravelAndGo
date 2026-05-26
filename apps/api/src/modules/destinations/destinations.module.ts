import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';
import { WeatherProvider } from './providers/weather.provider';
import { CurrencyProvider } from './providers/currency.provider';
import { TimezoneProvider } from './providers/timezone.provider';
import { PhotosProvider } from './providers/photos.provider';

@Module({
  imports: [HttpModule],
  controllers: [DestinationsController],
  providers: [DestinationsService, WeatherProvider, CurrencyProvider, TimezoneProvider, PhotosProvider],
})
export class DestinationsModule {}
