import { Controller, Get, Query } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { HotelSearchDto } from './dto/hotel-search.dto';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get('search')
  searchHotels(@Query() query: HotelSearchDto) {
    return this.hotelsService.searchHotels(query);
  }
}
