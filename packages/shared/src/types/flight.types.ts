export interface FlightSegment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  flightNumber: string;
  duration: string;
}

export interface FlightOffer {
  id: string;
  price: { total: string; currency: string };
  numberOfBookableSeats: number;
  itineraries: Array<{
    duration: string;
    segments: FlightSegment[];
  }>;
}
