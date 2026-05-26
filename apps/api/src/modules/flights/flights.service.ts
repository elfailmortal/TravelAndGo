import { Injectable } from '@nestjs/common';
import type { FlightOffer } from '@travel-go/shared';
import { MockFlightsProvider } from './providers/mock-flights.provider';
// TODO: swap MockFlightsProvider for a real provider (Kiwi Tequila, Duffel, etc.)
// import { SkyScrapper } from './providers/sky-scrapper.provider';
import type { FlightSearchDto } from './dto/flight-search.dto';

@Injectable()
export class FlightsService {
  constructor(private readonly flightsProvider: MockFlightsProvider) {}

  async searchFlights(params: FlightSearchDto): Promise<FlightOffer[]> {
    return this.flightsProvider.searchFlights({
      origin: params.origin,
      destination: params.destination,
      date: params.date,
      adults: params.adults,
      returnDate: params.returnDate,
      cabinClass: params.travelClass?.toLowerCase(),
      max: params.max,
    });
  }
}
