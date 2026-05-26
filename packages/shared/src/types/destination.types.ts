export interface DestinationPhoto {
  url: string;
  thumbUrl: string;
  credit: { name: string; link: string };
}

export interface WeatherCondition {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export interface WeatherForecastDay {
  date: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
}

export interface CurrencyInfo {
  local: string;
  symbol: string;
  rateFromUSD: number;
  rateFromMXN: number;
}

export interface TimezoneInfo {
  zone: string;
  utcOffset: string;
  localTime: string;
  abbreviation: string;
}

export interface DestinationInfo {
  destination: {
    name: string;
    country: string;
    countryCode: string;
    photo: DestinationPhoto | null;
  };
  weather: {
    current: WeatherCondition;
    forecast: WeatherForecastDay[];
  };
  currency: CurrencyInfo;
  timezone: TimezoneInfo;
}
