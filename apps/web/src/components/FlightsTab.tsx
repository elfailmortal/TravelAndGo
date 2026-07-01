'use client';

import { useState, useEffect } from 'react';
import type { FlightOffer } from '@travel-go/shared';

const API_BASE = 'http://localhost:3001';

function formatDateTime(at?: string) {
  if (!at) return '—';
  const d = new Date(at);
  return d.toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function formatTimeOnly(at?: string) {
  if (!at) return '—';
  const d = new Date(at);
  return d.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDateOnly(at?: string) {
  if (!at) return '—';
  const d = new Date(at);
  return d.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatDuration(dur?: string) {
  if (!dur) return '—';
  return dur.replace('PT', '').replace('H', 'h ').replace('M', 'min').trim();
}

export default function FlightsTab() {
  const [form, setForm] = useState({
    origin: 'MEX',
    destination: 'CDG',
    date: '', // Initialize empty to avoid hydration mismatch
    returnDate: '',
    adults: '1',
    travelClass: 'ECONOMY',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FlightOffer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);


  // Set default date on mount to prevent Next.js hydration mismatch
  useEffect(() => {
    setForm((f) => ({
      ...f,
      date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    }));
  }, []);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const params = new URLSearchParams({
        origin: form.origin,
        destination: form.destination,
        date: form.date,
        adults: form.adults,
        travelClass: form.travelClass,
        max: '8',
      });
      if (form.returnDate) params.set('returnDate', form.returnDate);

      const res = await fetch(`${API_BASE}/flights/search?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error al consultar la API');
      
      // The API wraps responses in { data, meta }
      setResult(json.data ?? json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  const flights = result ?? [];

  // Find the cheapest flight to tag it in the UI
  const cheapestPrice = flights.length > 0
    ? Math.min(...flights.map(f => parseFloat(f.price?.total ?? '999999')))
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
        <div className="flex flex-col gap-1.5 w-24">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Origen</label>
          <input
            value={form.origin}
            onChange={(e) => set('origin', e.target.value.toUpperCase())}
            placeholder="MEX"
            maxLength={3}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2.5 text-sm text-center text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
          />
        </div>
        <div className="flex flex-col gap-1.5 w-24">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Destino</label>
          <input
            value={form.destination}
            onChange={(e) => set('destination', e.target.value.toUpperCase())}
            placeholder="CDG"
            maxLength={3}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2.5 text-sm text-center text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
          />
        </div>
        <div className="flex flex-col gap-1.5 min-w-[140px] flex-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fecha Ida</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5 min-w-[140px] flex-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vuelta (Opcional)</label>
          <input
            type="date"
            value={form.returnDate}
            onChange={(e) => set('returnDate', e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5 w-20">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pasajeros</label>
          <input
            type="number"
            value={form.adults}
            min={1}
            max={9}
            onChange={(e) => set('adults', e.target.value)}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-center text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5 min-w-[140px] flex-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Clase</label>
          <select
            value={form.travelClass}
            onChange={(e) => set('travelClass', e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
          >
            <option value="ECONOMY">Económica</option>
            <option value="PREMIUM_ECONOMY">Premium</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">Primera Clase</option>
          </select>
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:shadow-sky-500/30 disabled:opacity-50 flex items-center justify-center gap-2 h-[42px]"
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
              'Buscar Vuelos'
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

      {flights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-medium text-slate-400">{flights.length} opciones de vuelo encontradas</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {flights.map((flight, i) => {
              const outbound = flight.itineraries?.[0];
              const inbound = flight.itineraries?.[1];
              const seg = outbound?.segments ?? [];
              const first = seg[0];
              const last = seg[seg.length - 1];
              const stops = seg.length - 1;

              const isCheapest = cheapestPrice > 0 && parseFloat(flight.price?.total ?? '0') === cheapestPrice;
              const isSelected = selectedFlightId === flight.id;
              return (
                <div
                  key={flight.id ?? i}
                  onClick={() => {
                    console.log("Card clicked: Flight ID: ", flight.id);
                    setSelectedFlightId(flight.id);
                  }}
                  className={`group relative flex flex-col overflow-hidden rounded-[2rem] border p-6 transition-all duration-300 cursor-pointer ${
                   isSelected ? 'border-sky-400 ring-4 ring-sky-500/20 bg-gradient-to-br from-sky-900/40 to-slate-900/40 shadow-[0_0_40px_-10px_rgba(14,165,233,0.4)] scale-[1.02]'
                   : isCheapest ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-slate-900/40 shadow-xl shadow-amber-900/20 hover:border-amber-400 hover:shadow-amber-500/20 hover:-translate-y-1' 
        : 'border-white/5 bg-white/[0.02] backdrop-blur-2xl shadow-lg hover:border-white/20 hover:bg-white/[0.06] hover:shadow-2xl hover:-translate-y-1'
                  }`}
                >
                  {/* Subtle Top Glow for Premium Feel */}
                  <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {isCheapest && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-400 px-4 py-1.5 rounded-bl-2xl text-[10px] font-extrabold uppercase tracking-widest text-amber-950 shadow-md z-10">
                      ✨ Mejor Precio
                    </div>
                  )}

                  <div className="flex flex-col justify-between flex-1 gap-6 relative z-0">
                    <div className="space-y-6">
                      {/* Outbound */}
                      <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-sm font-bold text-sky-400 border border-slate-700/50 shadow-inner font-mono">
                            {first?.carrierCode ?? '✈️'}
                          </div>
                          <div className="flex-1">
                            <span className="inline-block px-2 py-1 text-[10px] font-bold text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg font-mono tracking-wider">
                              {first?.carrierCode} {first?.flightNumber}
                            </span>
                            <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-widest">{form.travelClass === 'ECONOMY' ? 'Clase Turista' : 'Clase Ejecutiva'}</p>
                          </div>
                        </div>

                        <div className="flex w-full items-center justify-between">
                          <div className="text-left w-24">
                            <p className="text-3xl font-black text-white leading-none tracking-tighter drop-shadow-sm">
                              {first?.departure?.iataCode}
                            </p>
                            <p className="text-sm font-bold text-sky-200 mt-2 leading-none">
                              {formatTimeOnly(first?.departure?.at)}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 leading-none truncate uppercase tracking-wider">
                              {formatDateOnly(first?.departure?.at)}
                            </p>
                          </div>

                          <div className="flex flex-col items-center flex-1 mx-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-900/50 px-2 py-0.5 rounded-full border border-white/5">
                              {formatDuration(outbound?.duration)}
                            </p>
                            <div className="relative w-full my-3 flex items-center justify-center">
                              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                              <div className="absolute w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                                <span className="text-[10px] text-sky-400 transform rotate-90 leading-none ml-0.5">✈</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                              stops === 0
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                            }`}>
                              {stops === 0
                                ? 'Directo'
                                : `${stops} escala${stops > 1 ? 's' : ''}`}
                            </span>
                          </div>

                          <div className="text-right w-24">
                            <p className="text-3xl font-black text-white leading-none tracking-tighter drop-shadow-sm">
                              {last?.arrival?.iataCode}
                            </p>
                            <p className="text-sm font-bold text-sky-200 mt-2 leading-none">
                              {formatTimeOnly(last?.arrival?.at)}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 leading-none truncate uppercase tracking-wider">
                              {formatDateOnly(last?.arrival?.at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Inbound */}
                      {inbound && (() => {
                        const inSeg = inbound.segments ?? [];
                        const inFirst = inSeg[0];
                        const inLast = inSeg[inSeg.length - 1];
                        const inStops = inSeg.length - 1;

                        return (
                          <div className="border-t border-dashed border-white/10 pt-6 flex flex-col gap-5 relative">
                            <div className="absolute -top-[1.6rem] left-6 h-6 w-px border-l-2 border-dotted border-slate-700" />
                            
                            <div className="flex items-center gap-3 w-full">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-sm font-bold text-indigo-400 border border-slate-700/50 shadow-inner font-mono">
                                {inFirst?.carrierCode ?? '✈️'}
                              </div>
                              <div className="flex-1">
                                <span className="inline-block px-2 py-1 text-[10px] font-bold text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg font-mono tracking-wider">
                                  {inFirst?.carrierCode} {inFirst?.flightNumber}
                                </span>
                                <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-widest">Vuelo de Retorno</p>
                              </div>
                            </div>

                            <div className="flex w-full items-center justify-between">
                              <div className="text-left w-24">
                                <p className="text-3xl font-black text-white leading-none tracking-tighter drop-shadow-sm">
                                  {inFirst?.departure?.iataCode}
                                </p>
                                <p className="text-sm font-bold text-indigo-200 mt-2 leading-none">
                                  {formatTimeOnly(inFirst?.departure?.at)}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 leading-none truncate uppercase tracking-wider">
                                  {formatDateOnly(inFirst?.departure?.at)}
                                </p>
                              </div>

                              <div className="flex flex-col items-center flex-1 mx-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-900/50 px-2 py-0.5 rounded-full border border-white/5">
                                  {formatDuration(inbound.duration)}
                                </p>
                                <div className="relative w-full my-3 flex items-center justify-center">
                                  <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                                  <div className="absolute w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                                    <span className="text-[10px] text-indigo-400 transform rotate-[270deg] leading-none mr-0.5">✈</span>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                                  inStops === 0
                                    ? 'text-emerald-400'
                                    : 'text-amber-400'
                                }`}>
                                  {inStops === 0
                                    ? 'Directo'
                                    : `${inStops} escala${inStops > 1 ? 's' : ''}`}
                                </span>
                              </div>

                              <div className="text-right w-24">
                                <p className="text-3xl font-black text-white leading-none tracking-tighter drop-shadow-sm">
                                  {inLast?.arrival?.iataCode}
                                </p>
                                <p className="text-sm font-bold text-indigo-200 mt-2 leading-none">
                                  {formatTimeOnly(inLast?.arrival?.at)}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 leading-none truncate uppercase tracking-wider">
                                  {formatDateOnly(inLast?.arrival?.at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="mt-auto pt-6">
                      <div className="h-px w-full border-t-2 border-dashed border-white/10 mb-5 relative">
                        {/* Cutout circles for ticket effect */}
                        <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#030712] border-r border-white/10 shadow-inner" />
                        <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#030712] border-l border-white/10 shadow-inner" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Precio Total</p>
                          <p className="text-2xl font-black text-white leading-none">
                            <span className="text-base text-slate-400 font-bold mr-1">{flight.price?.currency === 'USD' ? '$' : flight.price?.currency}</span>
                            {parseFloat(flight.price?.total ?? '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        
                        <button className={`rounded-xl text-sm font-bold text-white px-6 py-2.5 shadow-lg transition-all ${
                          isSelected 
                            ? 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/25 ring-2 ring-sky-300 ring-offset-2 ring-offset-[#030712]' 
                            : 'bg-white/10 hover:bg-white/20 border border-white/10'
                        }`}>
                          {isSelected ? 'Elegido' : 'Elegir'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- This is the new Details Card that shows up on click --- */}
          {selectedFlightId && (
            <div className="mt-8 animate-fade-in p-6 rounded-2xl bg-gradient-to-br from-sky-900/40 to-indigo-900/40 border border-sky-500/30 shadow-2xl shadow-sky-900/20 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Detalles del Vuelo Seleccionado</h3>
                <button 
                  onClick={() => setSelectedFlightId(null)}
                  className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-slate-300">
                <p>¡Has seleccionado el vuelo con ID: <span className="font-mono text-sky-400">{selectedFlightId}</span>!</p>
                <p className="mt-2 text-sm text-slate-400">Aquí es donde puedes agregar más información específica, mostrar un desglose del precio, o poner un formulario de reserva.</p>
                
                <button className="mt-6 w-full md:w-auto rounded-xl bg-sky-500 hover:bg-sky-400 text-white px-8 py-3 font-bold shadow-lg shadow-sky-500/30 transition-all">
                  Continuar con la Reserva →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {result && flights.length === 0 && !error && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
          <p className="text-sm text-slate-400">No se encontraron vuelos para esa ruta y fechas.</p>
        </div>
      )}
    </div>
  );
}
