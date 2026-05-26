import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { MockFlightsProvider } from './providers/mock-flights.provider';
// TODO: swap for real provider when API access is available
// import { SkyScrapper } from './providers/sky-scrapper.provider';

@Module({
  imports: [HttpModule],
  controllers: [FlightsController],
  providers: [FlightsService, MockFlightsProvider],
})
export class FlightsModule {}
