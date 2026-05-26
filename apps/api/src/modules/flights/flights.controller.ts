import { Controller, Get, Query } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightSearchDto } from './dto/flight-search.dto';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get('search')
  searchFlights(@Query() query: FlightSearchDto) {
    return this.flightsService.searchFlights(query);
  }
}
