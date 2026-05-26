import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DestinationsModule } from './modules/destinations/destinations.module';
import { FlightsModule } from './modules/flights/flights.module';
import { HotelsModule } from './modules/hotels/hotels.module';
import { AppController } from './app.controller';
import configuration from './config/configuration';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    HttpModule.register({ timeout: 10000, maxRedirects: 3 }),
    DestinationsModule,
    FlightsModule,
    HotelsModule,
  ],
})
export class AppModule {}
