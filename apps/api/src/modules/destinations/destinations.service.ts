import { Injectable } from '@nestjs/common';
import type { DestinationInfo } from '@travel-go/shared';
import { WeatherProvider } from './providers/weather.provider';
import { CurrencyProvider } from './providers/currency.provider';
import { TimezoneProvider } from './providers/timezone.provider';
import { PhotosProvider } from './providers/photos.provider';

@Injectable()
export class DestinationsService {
  constructor(
    private readonly weather: WeatherProvider,
    private readonly currency: CurrencyProvider,
    private readonly timezone: TimezoneProvider,
    private readonly photos: PhotosProvider,
  ) {}

  async getDestinationInfo(city: string, country?: string): Promise<DestinationInfo> {
    const [currentWeather, forecast, currencyInfo, timezoneInfo, photo] = await Promise.all([
      this.weather.getCurrentWeather(city, country),
      this.weather.getForecast(city, country),
      this.currency.getCurrencyInfo(country ?? 'US'),
      this.timezone.getTimezoneInfo(city, country),
      this.photos.getDestinationPhoto(city, country),
    ]);

    return {
      destination: { name: city, country: country ?? '', countryCode: country ?? '', photo },
      weather: { current: currentWeather, forecast },
      currency: currencyInfo,
      timezone: timezoneInfo,
    };
  }
}
