import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { CurrencyInfo } from '@travel-go/shared';

const COUNTRY_CURRENCY: Record<string, { code: string; symbol: string }> = {
  FR: { code: 'EUR', symbol: '€' }, ES: { code: 'EUR', symbol: '€' },
  DE: { code: 'EUR', symbol: '€' }, IT: { code: 'EUR', symbol: '€' },
  PT: { code: 'EUR', symbol: '€' }, MX: { code: 'MXN', symbol: '$' },
  US: { code: 'USD', symbol: '$' }, GB: { code: 'GBP', symbol: '£' },
  JP: { code: 'JPY', symbol: '¥' }, CA: { code: 'CAD', symbol: 'CA$' },
  AU: { code: 'AUD', symbol: 'A$' }, BR: { code: 'BRL', symbol: 'R$' },
  AR: { code: 'ARS', symbol: '$' }, CO: { code: 'COP', symbol: '$' },
  CL: { code: 'CLP', symbol: '$' }, PE: { code: 'PEN', symbol: 'S/' },
  TH: { code: 'THB', symbol: '฿' }, TR: { code: 'TRY', symbol: '₺' },
  IN: { code: 'INR', symbol: '₹' }, CN: { code: 'CNY', symbol: '¥' },
};

@Injectable()
export class CurrencyProvider {
  private readonly logger = new Logger(CurrencyProvider.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getCurrencyInfo(countryCode: string): Promise<CurrencyInfo> {
    const meta = COUNTRY_CURRENCY[countryCode.toUpperCase()];
    const currencyCode = meta?.code ?? 'USD';
    const symbol = meta?.symbol ?? '$';
    const appId = this.config.get<string>('openExchangeRates.appId');
    const baseUrl = this.config.get<string>('openExchangeRates.baseUrl');

    try {
      const { data } = await firstValueFrom(
        this.http.get<{ rates: Record<string, number> }>(`${baseUrl}/latest.json`, {
          params: { app_id: appId, symbols: `${currencyCode},MXN` },
        }),
      );
      const rateFromUSD = data.rates[currencyCode] ?? 1;
      const mxnRate = data.rates['MXN'] ?? 17;
      return {
        local: currencyCode, symbol,
        rateFromUSD: Number(rateFromUSD.toFixed(4)),
        rateFromMXN: Number((rateFromUSD / mxnRate).toFixed(4)),
      };
    } catch (err) {
      this.logger.warn(`Currency fetch failed for ${countryCode}: ${err}`);
      return { local: currencyCode, symbol, rateFromUSD: 1, rateFromMXN: 0.05 };
    }
  }
}
