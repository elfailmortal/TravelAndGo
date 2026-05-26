import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { HotelOffer } from '@travel-go/shared';

interface MakcorpsCityResult {
  city_id: string;
  name: string;
}

interface MakcorpsHotel {
  hotelId: string;
  name: string;
  rating?: number;
  geocode?: { latitude: number; longitude: number };
  reviews?: { rating: number; count: number };
  vendor1?: string; price1?: string;
  vendor2?: string; price2?: string;
  vendor3?: string; price3?: string;
  vendor4?: string; price4?: string;
}

@Injectable()
export class MakcorpsProvider {
  private readonly logger = new Logger(MakcorpsProvider.name);
  private readonly baseUrl = 'https://api.makcorps.com';

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private get apiKey() {
    return this.config.get<string>('rapidapi.key') ?? '';
  }

  async getCityId(cityName: string): Promise<string> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<MakcorpsCityResult[]>(`${this.baseUrl}/mapping`, {
          params: { api_key: this.apiKey, name: cityName },
        }),
      );
      const city = data[0];
      if (!city) throw new NotFoundException(`City not found: ${cityName}`);
      return city.city_id;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error(`City mapping failed for "${cityName}": ${err}`);
      throw new InternalServerErrorException('Could not resolve city for hotel search.');
    }
  }

  async searchHotels(params: {
    cityCode: string;
    checkin: string;
    checkout: string;
    adults: number;
    rooms?: number;
  }): Promise<HotelOffer[]> {
    const cityId = await this.getCityId(params.cityCode);
    try {
      const { data } = await firstValueFrom(
        this.http.get<MakcorpsHotel[]>(`${this.baseUrl}/city`, {
          params: {
            api_key: this.apiKey,
            cityid: cityId,
            checkin: params.checkin,
            checkout: params.checkout,
            rooms: params.rooms ?? 1,
            adults: params.adults,
            cur: 'USD',
            pagination: 0,
          },
        }),
      );

      return data.map((hotel) => ({
        hotelId: hotel.hotelId,
        name: hotel.name,
        rating: hotel.rating,
        cityCode: params.cityCode,
        geocode: hotel.geocode,
        reviews: hotel.reviews ? { score: hotel.reviews.rating, count: hotel.reviews.count } : undefined,
        prices: [
          { vendor: hotel.vendor1, price: hotel.price1 },
          { vendor: hotel.vendor2, price: hotel.price2 },
          { vendor: hotel.vendor3, price: hotel.price3 },
          { vendor: hotel.vendor4, price: hotel.price4 },
        ]
          .filter((v) => v.vendor && v.price)
          .map((v) => ({ vendor: v.vendor!, price: v.price!, currency: 'USD' })),
        checkin: params.checkin,
        checkout: params.checkout,
      }));
    } catch (err) {
      this.logger.error(`Hotel search failed for ${params.cityCode}: ${err}`);
      throw new InternalServerErrorException('Hotel search failed. Please try again.');
    }
  }
}
