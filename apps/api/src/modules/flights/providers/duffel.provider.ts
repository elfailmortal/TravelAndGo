import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { FlightOffer } from '@travel-go/shared';

interface DuffelSegment {
  departure_at: string;
  arrival_at: string;
  duration: string;
  operating_carrier_flight_number: string;
  origin: { iata_code: string };
  destination: { iata_code: string };
  operating_carrier: { iata_code: string };
}

interface DuffelOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  passengers_count?: number;
  slices: Array<{
    duration: string;
    segments: DuffelSegment[];
  }>;
}

interface DuffelOfferRequestResponse {
  data: { offers: DuffelOffer[] };
}

@Injectable()
export class DuffelProvider {
  private readonly logger = new Logger(DuffelProvider.name);
  private readonly baseUrl = 'https://api.duffel.com';

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private get headers() {
    return {
      Authorization: `Bearer ${this.config.get<string>('duffel.accessToken')}`,
      'Duffel-Version': 'v2',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
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
    const passengers = Array.from({ length: params.adults }, () => ({ type: 'adult' }));
    const slices = [
      { origin: params.origin.toUpperCase(), destination: params.destination.toUpperCase(), departure_date: params.date },
      ...(params.returnDate
        ? [{ origin: params.destination.toUpperCase(), destination: params.origin.toUpperCase(), departure_date: params.returnDate }]
        : []),
    ];

    try {
      const { data } = await firstValueFrom(
        this.http.post<DuffelOfferRequestResponse>(
          `${this.baseUrl}/air/offer_requests`,
          { data: { passengers, slices, cabin_class: params.cabinClass ?? 'economy', return_offers: true } },
          { headers: this.headers },
        ),
      );

      return (data.data.offers ?? []).slice(0, params.max ?? 10).map((offer) => ({
        id: offer.id,
        price: { total: offer.total_amount, currency: offer.total_currency },
        numberOfBookableSeats: offer.passengers_count ?? 1,
        itineraries: offer.slices.map((slice) => ({
          duration: slice.duration,
          segments: slice.segments.map((seg) => ({
            departure: { iataCode: seg.origin.iata_code, at: seg.departure_at },
            arrival: { iataCode: seg.destination.iata_code, at: seg.arrival_at },
            carrierCode: seg.operating_carrier.iata_code,
            flightNumber: seg.operating_carrier_flight_number,
            duration: seg.duration,
          })),
        })),
      }));
    } catch (err) {
      this.logger.error(`Duffel flight search failed: ${err}`);
      throw new InternalServerErrorException('Flight search failed. Please try again.');
    }
  }
}
