import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { FlightOffer } from '@travel-go/shared';

interface AirportResult {
  skyId: string;
  entityId: string;
  presentation: { title: string; subtitle: string };
}

interface AirportSearchResponse {
  data: AirportResult[];
}

interface FlightLeg {
  origin: { displayCode: string };
  destination: { displayCode: string };
  departure: string;
  arrival: string;
  durationInMinutes: number;
  stopCount: number;
  carriers: {
    marketing: Array<{ alternateId: string }>;
  };
  segments: Array<{
    origin: { displayCode: string };
    destination: { displayCode: string };
    departure: string;
    arrival: string;
    durationInMinutes: number;
    flightNumber: string;
    marketingCarrier: { alternateId: string };
  }>;
}

interface FlightItinerary {
  id: string;
  price: { raw: number; formatted: string };
  legs: FlightLeg[];
}

interface FlightSearchResponse {
  data: {
    itineraries: FlightItinerary[];
  };
}

@Injectable()
export class SkyScrapper {
  private readonly logger = new Logger(SkyScrapper.name);
  private readonly baseUrl = 'https://sky-scrapper.p.rapidapi.com';

  // Cache airport lookups to avoid repeated calls
  private readonly airportCache = new Map<string, AirportResult>();

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private get headers() {
    return {
      'X-RapidAPI-Key': this.config.get<string>('rapidapi.key') ?? '',
      'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com',
    };
  }

  private async resolveAirport(query: string): Promise<AirportResult> {
    const cached = this.airportCache.get(query.toUpperCase());
    if (cached) return cached;

    this.logger.log(`Resolving airport: ${query}`);
    const { data } = await firstValueFrom(
      this.http.get<AirportSearchResponse>(`${this.baseUrl}/api/v1/flights/searchAirport`, {
        headers: this.headers,
        params: { query, locale: 'en-US' },
      }),
    );

    this.logger.log(`Airport response for "${query}": ${JSON.stringify(data).slice(0, 300)}`);
    const result = data.data[0];
    if (!result) throw new InternalServerErrorException(`Airport not found: ${query}`);

    this.airportCache.set(query.toUpperCase(), result);
    return result;
  }

  async searchFlights(params: {
    origin: string;
    destination: string;
    date: string;
    adults: number;
    returnDate?: string;
    cabinClass?: string;
    max?: number;
  }): Promise<FlightOffer[]> {
    try {
      // Step 1: Resolve airports in parallel
      const [originAirport, destinationAirport] = await Promise.all([
        this.resolveAirport(params.origin),
        this.resolveAirport(params.destination),
      ]);

      this.logger.log(`Airports resolved — origin: ${JSON.stringify(originAirport)} destination: ${JSON.stringify(destinationAirport)}`);

      // Step 2: Search flights
      const { data } = await firstValueFrom(
        this.http.get<FlightSearchResponse>(`${this.baseUrl}/api/v1/flights/searchFlights`, {
          headers: this.headers,
          params: {
            originSkyId: originAirport.skyId,
            destinationSkyId: destinationAirport.skyId,
            originEntityId: originAirport.entityId,
            destinationEntityId: destinationAirport.entityId,
            date: params.date,
            returnDate: params.returnDate ?? '',
            cabinClass: params.cabinClass ?? 'economy',
            adults: params.adults,
            sortBy: 'best',
            currency: 'USD',
            market: 'en-US',
            countryCode: 'US',
          },
        }),
      );

      const itineraries = data.data?.itineraries ?? [];
      return itineraries.slice(0, params.max ?? 10).map((it) => this.mapItinerary(it));
    } catch (err: any) {
      const status = err?.response?.status;
      const body = JSON.stringify(err?.response?.data ?? err?.message ?? err);
      this.logger.error(`Sky Scrapper failed [${status}]: ${body}`);
      throw new InternalServerErrorException(
        `Flight search failed [${status ?? 'unknown'}]: ${body.slice(0, 200)}`,
      );
    }
  }

  private minutesToISO(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `PT${h}H${m}M`;
  }

  private mapItinerary(it: FlightItinerary): FlightOffer {
    return {
      id: it.id,
      price: {
        total: it.price.raw.toString(),
        currency: 'USD',
      },
      numberOfBookableSeats: 1,
      itineraries: it.legs.map((leg) => ({
        duration: this.minutesToISO(leg.durationInMinutes),
        segments: leg.segments.map((seg) => ({
          departure: { iataCode: seg.origin.displayCode, at: seg.departure },
          arrival: { iataCode: seg.destination.displayCode, at: seg.arrival },
          carrierCode: seg.marketingCarrier.alternateId,
          flightNumber: seg.flightNumber,
          duration: this.minutesToISO(seg.durationInMinutes),
        })),
      })),
    };
  }
}
