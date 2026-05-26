export interface HotelVendorPrice {
  vendor: string;
  price: string;
  currency: string;
}

export interface HotelOffer {
  hotelId: string;
  name: string;
  rating?: number;
  cityCode: string;
  geocode?: { latitude: number; longitude: number };
  reviews?: { score: number; count: number };
  prices: HotelVendorPrice[];
  checkin: string;
  checkout: string;
}
