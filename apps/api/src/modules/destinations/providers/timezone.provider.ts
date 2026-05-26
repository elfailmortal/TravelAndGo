import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { TimezoneInfo } from '@travel-go/shared';

interface TimezoneDbResponse {
  status: string;
  zoneName: string;
  abbreviation: string;
  gmtOffset: number;
  timestamp: number;
}

@Injectable()
export class TimezoneProvider {
  private readonly logger = new Logger(TimezoneProvider.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getTimezoneInfo(city: string, countryCode?: string): Promise<TimezoneInfo> {
    const apiKey = this.config.get<string>('timezonedb.apiKey');
    const baseUrl = this.config.get<string>('timezonedb.baseUrl');

    try {
      const { data } = await firstValueFrom(
        this.http.get<TimezoneDbResponse>(`${baseUrl}/get-time-zone`, {
          params: {
            key: apiKey,
            format: 'json',
            by: 'zone',
            zone: countryCode ? `${countryCode}/${city}` : city,
          },
        }),
      );

      if (data.status !== 'OK') throw new Error(`TimezoneDB status: ${data.status}`);

      const offsetH = data.gmtOffset / 3600;
      const sign = offsetH >= 0 ? '+' : '-';
      const absH = Math.floor(Math.abs(offsetH)).toString().padStart(2, '0');
      const absM = ((Math.abs(data.gmtOffset) % 3600) / 60).toString().padStart(2, '0');
      const utcOffset = `${sign}${absH}:${absM}`;
      const localTime = new Date((data.timestamp + data.gmtOffset) * 1000)
        .toISOString()
        .replace('Z', utcOffset);

      return { zone: data.zoneName, utcOffset, localTime, abbreviation: data.abbreviation };
    } catch (err) {
      this.logger.warn(`Timezone fetch failed for ${city}: ${err}`);
      return { zone: 'Unknown', utcOffset: '+00:00', localTime: new Date().toISOString(), abbreviation: 'UTC' };
    }
  }
}
