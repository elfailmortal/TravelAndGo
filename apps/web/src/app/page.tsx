'use client';

import { useState } from 'react';
import DestinationTab from '@/components/DestinationTab';
import FlightsTab from '@/components/FlightsTab';
import HotelsTab from '@/components/HotelsTab';

const TABS = [
  { id: 'destinations', label: '🌍 Destinos', desc: 'Explora clima, tipo de cambio y fotos' },
  { id: 'flights', label: '✈️ Vuelos', desc: 'Compara trayectos, horarios y tarifas' },
  { id: 'hotels', label: '🏨 Hoteles', desc: 'Compara precios por proveedor y reserva' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>('destinations');

  return (
    <div className="min-h-screen relative bg-[#030712] text-slate-100 bg-grid-pattern">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[-5%] right-[-10%] w-[45%] h-[55%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[25%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Sticky Premium Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#030712]/75 border-b border-white/5 px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Styled Logo Icon */}
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-lg font-black text-white shadow-lg shadow-sky-500/20">
              TG
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Travel<span className="text-sky-400">&amp;</span>Go</span>
              <span className="h-4 w-px bg-slate-800 hidden sm:inline" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest hidden sm:inline">Portal Viajero</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-950/40 text-sky-400 border border-sky-900/40">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              API Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-6 py-10 relative z-10 space-y-8">
        
        {/* Pitch Hero Text */}
        <div className="text-center sm:text-left space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
            Tu próximo destino, <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">planeado al instante</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Compara vuelos, busca disponibilidad hotelera con tarifas reales y explora datos climáticos o financieros del destino que elijas.
          </p>
        </div>

        {/* Glassmorphic Tab Container (Capsule style) */}
        <div className="p-1.5 bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col sm:flex-row gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 text-left px-5 py-4 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/30 text-white shadow-md'
                    : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-indigo-500" />
                )}
                <p className="font-bold text-sm leading-none flex items-center gap-1.5">
                  {tab.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 leading-none">
                  {tab.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display Area */}
        <div className="mt-8">
          {activeTab === 'destinations' && <DestinationTab />}
          {activeTab === 'flights' && <FlightsTab />}
          {activeTab === 'hotels' && <HotelsTab />}
        </div>
      </main>

      {/* Styled Footer */}
      <footer className="mx-auto max-w-5xl px-6 py-12 mt-12 border-t border-white/5 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 Travel&Go. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-300 transition-colors">Términos de servicio</a>
          <span className="text-slate-800">·</span>
          <a href="#" className="hover:text-slate-300 transition-colors">Privacidad</a>
        </div>
      </footer>
    </div>
  );
}
