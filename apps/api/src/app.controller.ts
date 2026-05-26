import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return {
      name: 'Travel&Go API',
      version: '0.1.0',
      status: 'ok',
      endpoints: [
        'GET /destinations/info?city=Paris&country=FR',
        'GET /flights/search?origin=MEX&destination=CDG&date=2026-08-01&adults=1',
        'GET /hotels/search?cityCode=Paris&checkin=2026-08-01&checkout=2026-08-07&adults=1',
      ],
    };
  }
}
