export default () => ({
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',

  // RapidAPI — un solo key para Sky Scrapper (vuelos) y Makcorps (hoteles)
  rapidapi: {
    key: process.env['RAPIDAPI_KEY'] ?? '',
  },

  openWeather: {
    apiKey: process.env['OPENWEATHER_API_KEY'] ?? '',
    baseUrl: process.env['OPENWEATHER_BASE_URL'] ?? 'https://api.openweathermap.org/data/2.5',
  },

  openExchangeRates: {
    appId: process.env['OPEN_EXCHANGE_RATES_APP_ID'] ?? '',
    baseUrl: process.env['OPEN_EXCHANGE_RATES_BASE_URL'] ?? 'https://openexchangerates.org/api',
  },

  timezonedb: {
    apiKey: process.env['TIMEZONEDB_API_KEY'] ?? '',
    baseUrl: process.env['TIMEZONEDB_BASE_URL'] ?? 'http://api.timezonedb.com/v2.1',
  },

  unsplash: {
    accessKey: process.env['UNSPLASH_ACCESS_KEY'] ?? '',
    baseUrl: process.env['UNSPLASH_BASE_URL'] ?? 'https://api.unsplash.com',
  },
});
