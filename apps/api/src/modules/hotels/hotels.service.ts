import { Injectable } from '@nestjs/common';
import type { HotelOffer } from '@travel-go/shared';
import { MakcorpsProvider } from './providers/makcorps.provider';
import type { HotelSearchDto } from './dto/hotel-search.dto';

@Injectable()
export class HotelsService {
  constructor(private readonly makcorps: MakcorpsProvider) {}

  async searchHotels(params: HotelSearchDto): Promise<HotelOffer[]> {
    return this.makcorps.searchHotels(params);
  }
}
