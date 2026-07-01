'use client';

import { useState, useEffect } from 'react';
import type { DestinationInfo } from '@travel-go/shared';

const API_BASE = 'http://localhost:3001';

function formatDateString(dateStr: string) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]!, 10), parseInt(parts[1]!, 10) - 1, parseInt(parts[2]!, 10));
  return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function DestinationTab() {
  const [city, setCity] = useState('Paris');
  const [country, setCountry] = useState('FR');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DestinationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Widget States
  const [localTimeStr, setLocalTimeStr] = useState<string>('');
  const [calcAmount, setCalcAmount] = useState<string>('100');
  const [calcDirection, setCalcDirection] = useState<'USD_TO_LOCAL' | 'LOCAL_TO_USD' | 'MXN_TO_LOCAL' | 'LOCAL_TO_MXN'>('USD_TO_LOCAL');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `${API_BASE}/destinations/info?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error al consultar la API');
      setResult(json.data ?? json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  // Timezone ticking clock effect
  useEffect(() => {
    if (!result?.timezone?.zone) return;

    const updateClock = () => {
      try {
        const timeStr = new Date().toLocaleTimeString('es-MX', {
          timeZone: result.timezone.zone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
        setLocalTimeStr(timeStr);
      } catch (err) {
        setLocalTimeStr(new Date().toLocaleTimeString('es-MX'));
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [result?.timezone?.zone]);

  const photo = result?.destination?.photo;

  // Currency Converter calculation logic
  const getConvertedText = () => {
    if (!result?.currency) return '';
    const rateUSD = result.currency.rateFromUSD;
    const rateMXN = result.currency.rateFromMXN;
    const localSymbol = result.currency.symbol;
    const localCode = result.currency.local;

    const amt = parseFloat(calcAmount) || 0;

    if (calcDirection === 'USD_TO_LOCAL') {
      return `$${amt} USD = ${localSymbol}${(amt * rateUSD).toFixed(2)} ${localCode}`;
    } else if (calcDirection === 'LOCAL_TO_USD') {
      return `${localSymbol}${amt} ${localCode} = $${(amt / rateUSD).toFixed(2)} USD`;
    } else if (calcDirection === 'MXN_TO_LOCAL') {
      return `$${amt} MXN = ${localSymbol}${(amt * rateMXN).toFixed(2)} ${localCode}`;
    } else {
      return `${localSymbol}${amt} ${localCode} = $${(amt / rateMXN).toFixed(2)} MXN`;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ciudad</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ej. Paris, Tokyo, Roma"
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5 w-32">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">País (ISO)</label>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
            placeholder="FR"
            maxLength={2}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-center text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:shadow-sky-500/30 disabled:opacity-50 flex items-center gap-2 h-[42px]"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Buscando...
              </>
            ) : (
              'Buscar Destino'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/40 backdrop-blur-md px-5 py-4 text-sm text-red-300 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Destination Hero Postcard */}
          <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            {photo?.url ? (
              <img
                src={photo.url}
                alt={result.destination.name}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center relative p-6">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent" />
                <span className="text-5xl mb-2 opacity-80">✈️</span>
                <span className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Travel & Go Destination</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 mb-2 text-xs font-semibold uppercase tracking-wider text-sky-300 bg-sky-950/60 rounded-full border border-sky-800/40">
                  {result.destination.countryCode}
                </span>
                <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {result.destination.name}, {result.destination.country}
                </h2>
                {photo?.credit?.name && (
                  <p className="mt-1.5 text-xs text-slate-300 drop-shadow">
                    Foto por{' '}
                    <a
                      href={photo.credit.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-slate-400 hover:text-white transition-colors"
                    >
                      {photo.credit.name}
                    </a>{' '}
                    en Unsplash
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Weather Card */}
            {result.weather?.current && (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 flex flex-col justify-between hover:border-sky-500/30 transition-all hover:translate-y-[-2px] duration-300">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Clima Actual
                    </p>
                    {result.weather.current.icon && (
                      <img src={result.weather.current.icon} alt="Weather icon" className="h-10 w-10 -my-2" />
                    )}
                  </div>
                  <p className="text-4xl font-extrabold text-white tracking-tight">
                    {result.weather.current.temp !== undefined
                      ? `${result.weather.current.temp}°C`
                      : '—'}
                  </p>
                  <p className="mt-1 capitalize text-sm font-medium text-slate-200">
                    {result.weather.current.description ?? ''}
                  </p>
                </div>
                <div className="mt-5 space-y-1.5 text-xs text-slate-400 border-t border-white/5 pt-4">
                  <div className="flex justify-between">
                    <span>Sensación térmica:</span>
                    <span className="font-semibold text-slate-200">{result.weather.current.feelsLike}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Humedad:</span>
                    <span className="font-semibold text-slate-200">{result.weather.current.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Viento:</span>
                    <span className="font-semibold text-slate-200">{result.weather.current.windSpeed} m/s</span>
                  </div>
                </div>
              </div>
            )}

            {/* Currency Card with Converter */}
            {result.currency && (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 flex flex-col justify-between hover:border-indigo-500/30 transition-all hover:translate-y-[-2px] duration-300">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Moneda Local
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-extrabold text-white tracking-tight">
                      {result.currency.local ?? '—'}
                    </p>
                    <span className="text-xl font-bold text-slate-400">({result.currency.symbol})</span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-slate-400 pt-1">
                    <p>1 USD = {result.currency.rateFromUSD.toFixed(4)} {result.currency.local}</p>
                    <p>1 MXN = {result.currency.rateFromMXN.toFixed(4)} {result.currency.local}</p>
                  </div>
                </div>

                {/* Conversion Calculator Widget */}
                <div className="mt-5 border-t border-white/5 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Calculadora de Cambio</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(e.target.value)}
                        className="w-16 rounded-lg border border-slate-700 bg-slate-900/50 px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                      <select
                        value={calcDirection}
                        onChange={(e) => setCalcDirection(e.target.value as any)}
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-900/50 px-2 py-1 text-[11px] text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="USD_TO_LOCAL">USD a {result.currency.local}</option>
                        <option value="LOCAL_TO_USD">{result.currency.local} a USD</option>
                        <option value="MXN_TO_LOCAL">MXN a {result.currency.local}</option>
                        <option value="LOCAL_TO_MXN">{result.currency.local} a MXN</option>
                      </select>
                    </div>
                    <p className="text-xs font-semibold text-indigo-400 bg-indigo-950/20 rounded-lg px-2.5 py-1.5 border border-indigo-950/40 text-center truncate">
                      {getConvertedText()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Timezone Card with Live Clock */}
            {result.timezone && (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all hover:translate-y-[-2px] duration-300">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Zona Horaria
                  </p>
                  <p className="text-xl font-extrabold text-white tracking-tight truncate max-w-full">
                    {result.timezone.zone ?? '—'}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-400">
                    UTC {result.timezone.utcOffset} {result.timezone.abbreviation ? `(${result.timezone.abbreviation})` : ''}
                  </p>
                </div>
                
                {/* Live ticking clock widget */}
                <div className="mt-5 border-t border-white/5 pt-4 text-center bg-slate-950/30 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Hora Local Activa</p>
                  <p className="text-3xl font-mono font-bold text-emerald-300 tracking-widest">
                    {localTimeStr || '--:--:--'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">
                    Fecha local: {new Date(result.timezone.localTime).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 5-Day Weather Forecast */}
          {result.weather?.forecast && result.weather.forecast.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Pronóstico del Clima (Próximos días)
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {result.weather.forecast.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center rounded-xl bg-slate-950/40 border border-white/5 p-3.5 text-center">
                    <p className="text-xs font-semibold text-slate-400">
                      {formatDateString(day.date)}
                    </p>
                    {day.icon && (
                      <img src={day.icon} alt={day.description} className="h-10 w-10 my-1.5" />
                    )}
                    <p className="text-xs font-medium text-slate-200 capitalize truncate max-w-full mb-1">
                      {day.description}
                    </p>
                    <p className="text-xs font-bold text-white mt-auto pt-1">
                      {day.tempMax}° / <span className="text-slate-400 font-medium">{day.tempMin}°</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
