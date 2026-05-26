import { Injectable } from '@nestjs/common';
import type { FlightOffer } from '@travel-go/shared';

/**
 * Mock provider for flight search.
 * Returns realistic data for development and testing.
 * Replace with a real provider (Kiwi Tequila, Duffel, etc.) when ready.
 */
@Injectable()
export class MockFlightsProvider {
  async searchFlights(params: {
    origin: string;
    destination: string;
    date: string;
    adults: number;
    returnDate?: string;
    cabinClass?: string;
    max?: number;
  }): Promise<FlightOffer[]> {
    const { origin, destination, date, adults, max = 10 } = params;

    // Simulate realistic prices and durations per route
    const baseOffers = this.generateOffers(origin, destination, date, adults);
    return baseOffers.slice(0, max);
  }

  private generateOffers(
    origin: string,
    destination: string,
    date: string,
    adults: number,
  ): FlightOffer[] {
    const carriers = [
      { code: 'AM', name: 'Aeromexico' },
      { code: 'AA', name: 'American Airlines' },
      { code: 'UA', name: 'United Airlines' },
      { code: 'IB', name: 'Iberia' },
      { code: 'AF', name: 'Air France' },
      { code: 'KL', name: 'KLM' },
    ];

    const basePrices = [420, 510, 595, 680, 745, 890];
    const departureTimes = ['06:10', '08:45', '11:20', '14:00', '17:30', '21:15'];
    const durations = ['PT9H50M', 'PT11H30M', 'PT10H20M', 'PT13H45M', 'PT12H10M', 'PT10H55M'];

    return carriers.map((carrier, i) => {
      const departureAt = `${date}T${departureTimes[i]}:00`;
      const durationMinutes = this.parseDuration(durations[i] ?? 'PT10H00M');
      const arrivalAt = new Date(
        new Date(departureAt).getTime() + durationMinutes * 60000,
      ).toISOString();

      const hasStop = i % 2 === 1;
      const totalPrice = ((basePrices[i] ?? 500) * adults).toString();

      return {
        id: `mock-${origin}-${destination}-${i}`,
        price: { total: totalPrice, currency: 'USD' },
        numberOfBookableSeats: Math.floor(Math.random() * 8) + 1,
        itineraries: [
          {
            duration: durations[i] ?? 'PT10H00M',
            segments: hasStop
              ? [
                  {
                    departure: { iataCode: origin.toUpperCase(), at: departureAt },
                    arrival: { iataCode: 'MAD', at: new Date(new Date(departureAt).getTime() + 7 * 3600000).toISOString() },
                    carrierCode: carrier.code,
                    flightNumber: `${carrier.code}${100 + i * 11}`,
                    duration: 'PT7H00M',
                  },
                  {
                    departure: { iataCode: 'MAD', at: new Date(new Date(departureAt).getTime() + 9 * 3600000).toISOString() },
                    arrival: { iataCode: destination.toUpperCase(), at: arrivalAt },
                    carrierCode: carrier.code,
                    flightNumber: `${carrier.code}${200 + i * 7}`,
                    duration: 'PT2H30M',
                  },
                ]
              : [
                  {
                    departure: { iataCode: origin.toUpperCase(), at: departureAt },
                    arrival: { iataCode: destination.toUpperCase(), at: arrivalAt },
                    carrierCode: carrier.code,
                    flightNumber: `${carrier.code}${300 + i * 13}`,
                    duration: durations[i] ?? 'PT10H00M',
                  },
                ],
          },
        ],
      };
    });
  }

  private parseDuration(iso: string): number {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    const hours = parseInt(match?.[1] ?? '0');
    const minutes = parseInt(match?.[2] ?? '0');
    return hours * 60 + minutes;
  }
}
