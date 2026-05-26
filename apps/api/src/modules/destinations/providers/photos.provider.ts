import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { DestinationPhoto } from '@travel-go/shared';

interface UnsplashSearchResponse {
  results: Array<{
    urls: { regular: string; thumb: string };
    user: { name: string; links: { html: string } };
  }>;
}

@Injectable()
export class PhotosProvider {
  private readonly logger = new Logger(PhotosProvider.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getDestinationPhoto(city: string, country?: string): Promise<DestinationPhoto | null> {
    const accessKey = this.config.get<string>('unsplash.accessKey');
    const baseUrl = this.config.get<string>('unsplash.baseUrl');
    const query = country ? `${city} ${country} travel` : `${city} travel`;

    try {
      const { data } = await firstValueFrom(
        this.http.get<UnsplashSearchResponse>(`${baseUrl}/search/photos`, {
          headers: { Authorization: `Client-ID ${accessKey}` },
          params: { query, per_page: 1, orientation: 'landscape' },
        }),
      );
      const photo = data.results[0];
      if (!photo) return null;
      return {
        url: photo.urls.regular,
        thumbUrl: photo.urls.thumb,
        credit: { name: photo.user.name, link: photo.user.links.html },
      };
    } catch (err) {
      this.logger.warn(`Photo fetch failed for ${city}: ${err}`);
      return null;
    }
  }
}
