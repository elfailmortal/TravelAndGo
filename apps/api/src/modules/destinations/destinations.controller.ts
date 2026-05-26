import { Controller, Get, Query } from '@nestjs/common';
import { DestinationsService } from './destinations.service';
import { DestinationQueryDto } from './dto/destination-query.dto';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get('info')
  getDestinationInfo(@Query() query: DestinationQueryDto) {
    return this.destinationsService.getDestinationInfo(query.city, query.country);
  }
}
