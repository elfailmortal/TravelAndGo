'use client';

import { useState, useEffect } from 'react';
import type { HotelOffer, HotelVendorPrice } from '@travel-go/shared';

const API_BASE = 'http://localhost:3001';

export default function HotelsTab() {
  const [form, setForm] = useState({
    cityCode: 'PAR',
    checkin: '', // Defer to prevent hydration mismatch
    checkout: '', // Defer to prevent hydration mismatch
    adults: '1',
    rooms: '1',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HotelOffer[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal State for Booking flow
  const [bookingHotel, setBookingHotel] = useState<HotelOffer | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<HotelVendorPrice | null>(null);

  useEffect(() => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    setForm((f) => ({
      ...f,
      checkin: tomorrow,
      checkout: dayAfter,
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
        cityCode: form.cityCode,
        checkin: form.checkin,
        checkout: form.checkout,
        adults: form.adults,
        rooms: form.rooms,
      });
      const res = await fetch(`${API_BASE}/hotels/search?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error al consultar la API');
      
      // The API response is wrapped in { data, meta }
      setResult(json.data ?? json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  const hotels = result ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
        <div className="flex flex-col gap-1.5 w-28">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ciudad (IATA)</label>
          <input
            value={form.cityCode}
            onChange={(e) => set('cityCode', e.target.value.toUpperCase())}
            placeholder="PAR"
            maxLength={3}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2.5 text-sm text-center text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
          />
        </div>
        <div className="flex flex-col gap-1.5 min-w-[140px] flex-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Check-in</label>
          <input
            type="date"
            value={form.checkin}
            onChange={(e) => set('checkin', e.target.value)}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5 min-w-[140px] flex-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Check-out</label>
          <input
            type="date"
            value={form.checkout}
            onChange={(e) => set('checkout', e.target.value)}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5 w-20">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Adultos</label>
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
        <div className="flex flex-col gap-1.5 w-24">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Habitaciones</label>
          <input
            type="number"
            value={form.rooms}
            min={1}
            max={9}
            onChange={(e) => set('rooms', e.target.value)}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2.5 text-sm text-center text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
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
              'Buscar Hoteles'
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

      {hotels.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-medium text-slate-400">{hotels.length} hoteles disponibles encontrados</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {hotels.map((item, i) => {
              // Find the lowest price among vendors
              const cheapestVendorPrice = item.prices.length > 0
                ? item.prices.reduce((min, p) => parseFloat(p.price) < parseFloat(min.price) ? p : min, item.prices[0])
                : null;

              const nights = (() => {
                if (!item.checkin || !item.checkout) return null;
                const diff = new Date(item.checkout).getTime() - new Date(item.checkin).getTime();
                return Math.round(diff / 86400000);
              })();

              return (
                <div
                  key={item.hotelId ?? i}
                  className="group relative rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-2xl p-6 flex flex-col justify-between hover:border-white/20 hover:bg-white/[0.06] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Subtle Top Glow for Premium Feel */}
                  <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-xl text-white leading-tight drop-shadow-sm">
                          {item.name}
                        </h3>
                        <p className="text-xs font-bold text-sky-400 mt-1.5 uppercase tracking-wider">
                          📍 {item.cityCode} {item.rating ? ` · ${item.rating}★` : ''}
                        </p>
                      </div>
                      
                      {item.reviews?.score !== undefined && (
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl px-3 py-1.5 text-center shrink-0 shadow-inner">
                          <span className="text-sm font-black text-white">⭐ {item.reviews.score.toFixed(1)}</span>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.reviews.count} Reseñas</span>
                        </div>
                      )}
                    </div>

                    {/* Geocode */}
                    {item.geocode && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        {item.geocode.latitude.toFixed(4)}, {item.geocode.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>

                  {/* Comparative Rates section */}
                  <div className="mt-6 border-t-2 border-dashed border-white/10 pt-5 space-y-4 relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Comparación de Tarifas (Por noche)</p>
                    
                    {item.prices && item.prices.length > 0 ? (
                      <div className="rounded-2xl overflow-hidden border border-white/5 bg-slate-950/40">
                        {item.prices.map((p, idx) => {
                          const isCheapest = cheapestVendorPrice && p.vendor === cheapestVendorPrice.vendor && p.price === cheapestVendorPrice.price;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center justify-between px-4 py-2.5 text-xs border-b border-white/5 last:border-0 transition-colors ${
                                isCheapest ? 'bg-emerald-950/20' : 'hover:bg-slate-900/40'
                              }`}
                            >
                              <span className="font-bold text-slate-300 capitalize">{p.vendor}</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-black ${isCheapest ? 'text-emerald-400' : 'text-white'}`}>
                                  {p.currency} ${parseFloat(p.price).toFixed(2)}
                                </span>
                                {isCheapest && (
                                  <span className="bg-emerald-950/80 text-[8px] font-black text-emerald-400 border border-emerald-900/60 rounded px-1.5 py-0.5 uppercase tracking-wider">
                                    Mejor Precio
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No hay tarifas disponibles.</p>
                    )}

                    {/* Night summary and Reservation CTA */}
                    {cheapestVendorPrice && (
                      <div className="mt-5 flex items-center justify-between gap-4 bg-gradient-to-r from-slate-900/60 to-slate-800/40 rounded-2xl p-4 border border-white/10 shadow-inner">
                        <div className="text-left">
                          <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1">Total Hospedaje</p>
                          <p className="text-2xl font-black text-white leading-none">
                            <span className="text-sm text-slate-400 font-bold mr-1">{cheapestVendorPrice.currency}</span>
                            {nights ? (parseFloat(cheapestVendorPrice.price) * nights).toFixed(2) : parseFloat(cheapestVendorPrice.price).toFixed(2)}
                          </p>
                          {nights && (
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">
                              {nights} noche{nights > 1 ? 's' : ''} a ${parseFloat(cheapestVendorPrice.price).toFixed(2)} /noche
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => {
                            setBookingHotel(item);
                            setSelectedVendor(cheapestVendorPrice);
                          }}
                          className="rounded-xl bg-sky-600 hover:bg-sky-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 ring-2 ring-transparent hover:ring-sky-300 ring-offset-2 ring-offset-[#030712] transition-all shrink-0"
                        >
                          Reservar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result && hotels.length === 0 && !error && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
          <p className="text-sm text-slate-400">No se encontraron hoteles para esa ruta y fechas.</p>
        </div>
      )}

      {/* Booking Success Confirmation Modal */}
      {bookingHotel && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl relative animate-scale-in">
            {/* Absolute blur background inside modal */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            <div className="text-center relative">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/50 border border-emerald-900 text-3xl mb-4 text-emerald-400">
                ✓
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">¡Reserva Completada!</h2>
              <p className="text-xs text-slate-400 mt-1">Tu hospedaje ha quedado agendado satisfactoriamente.</p>
              
              <div className="mt-6 space-y-3.5 bg-slate-950/40 border border-white/5 rounded-2xl p-4 text-left text-sm">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hospedaje</span>
                  <span className="font-extrabold text-white">{bookingHotel.name}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Check-in</span>
                    <span className="font-semibold text-slate-200">{bookingHotel.checkin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Check-out</span>
                    <span className="font-semibold text-slate-200">{bookingHotel.checkout}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Proveedor</span>
                    <span className="font-semibold text-slate-300 capitalize">{selectedVendor.vendor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tarifa final</span>
                    <span className="font-bold text-emerald-400">{selectedVendor.currency} ${parseFloat(selectedVendor.price).toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Clave de Confirmación:</span>
                  <span className="font-mono font-bold text-slate-300 tracking-wider">TG-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    setBookingHotel(null);
                    setSelectedVendor(null);
                  }}
                  className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/20 transition-all"
                >
                  Entendido / Buen Viaje ✈️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
