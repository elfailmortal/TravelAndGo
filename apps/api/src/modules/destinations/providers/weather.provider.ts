import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { WeatherCondition, WeatherForecastDay } from '@travel-go/shared';

interface OWMCurrentResponse {
  main: { temp: number; feels_like: number; humidity: number };
  weather: Array<{ description: string; icon: string }>;
  wind: { speed: number };
}

interface OWMForecastItem {
  dt_txt: string;
  main: { temp_min: number; temp_max: number };
  weather: Array<{ description: string; icon: string }>;
}

interface OWMForecastResponse {
  list: OWMForecastItem[];
}

@Injectable()
export class WeatherProvider {
  private readonly logger = new Logger(WeatherProvider.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getCurrentWeather(city: string, countryCode?: string): Promise<WeatherCondition> {
    const apiKey = this.config.get<string>('openWeather.apiKey');
    const baseUrl = this.config.get<string>('openWeather.baseUrl');
    const query = countryCode ? `${city},${countryCode}` : city;

    try {
      const { data } = await firstValueFrom(
        this.http.get<OWMCurrentResponse>(`${baseUrl}/weather`, {
          params: { q: query, appid: apiKey, units: 'metric', lang: 'es' },
        }),
      );
      return {
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0]?.description ?? '',
        icon: `https://openweathermap.org/img/wn/${data.weather[0]?.icon}@2x.png`,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      };
    } catch (err) {
      this.logger.warn(`Weather fetch failed for ${city}: ${err}`);
      return { temp: 0, feelsLike: 0, description: 'Unavailable', icon: '', humidity: 0, windSpeed: 0 };
    }
  }

  async getForecast(city: string, countryCode?: string): Promise<WeatherForecastDay[]> {
    const apiKey = this.config.get<string>('openWeather.apiKey');
    const baseUrl = this.config.get<string>('openWeather.baseUrl');
    const query = countryCode ? `${city},${countryCode}` : city;

    try {
      const { data } = await firstValueFrom(
        this.http.get<OWMForecastResponse>(`${baseUrl}/forecast`, {
          params: { q: query, appid: apiKey, units: 'metric', lang: 'es', cnt: 24 },
        }),
      );

      const byDay = new Map<string, OWMForecastItem>();
      for (const item of data.list) {
        const day = item.dt_txt.split(' ')[0]!;
        if (!byDay.has(day) || item.dt_txt.includes('12:00:00')) byDay.set(day, item);
      }

      return Array.from(byDay.values()).slice(0, 5).map((item) => ({
        date: item.dt_txt.split(' ')[0]!,
        tempMin: Math.round(item.main.temp_min),
        tempMax: Math.round(item.main.temp_max),
        description: item.weather[0]?.description ?? '',
        icon: `https://openweathermap.org/img/wn/${item.weather[0]?.icon}@2x.png`,
      }));
    } catch (err) {
      this.logger.warn(`Forecast fetch failed for ${city}: ${err}`);
      return [];
    }
  }
}
