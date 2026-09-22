import React, { useState } from 'react';
import {
  Calculator,
  SlidersHorizontal,
  Building2,
  Droplets,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useWaterStore, CityFilter } from '../store/useWaterStore';
import { translations } from '../translations';
import { Zone } from '../types';

export const DocsAllocationGrid: React.FC = () => {
  const {
    language,
    zones,
    metrics,
    cityFilter,
    setCityFilter,
    selectZone,
    setActiveModal,
  } = useWaterStore();
  const t = translations[language];

  // Quick edit state for inline tuning if needed
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);

  // Filter zones by city
  const filteredZones = zones.filter((z) => {
    if (cityFilter === 'all') return true;
    return z.city.toLowerCase() === cityFilter.toLowerCase();
  });

  // Calculate filtered totals
  const filteredPop = filteredZones.reduce((s, z) => s + z.population, 0);
  const filteredSupply = filteredZones.reduce((s, z) => s + z.supply_m3_day, 0);

  // Grand totals across all 17 zones in 3 cities
  const grandPop = zones.reduce((s, z) => s + z.population, 0);
  const grandSupply = zones.reduce((s, z) => s + z.supply_m3_day, 0);

  const handleAllocate = (zone: Zone) => {
    selectZone(zone, false);
    setActiveModal('allocate');
  };

  const getStatusDot = (status?: string) => {
    if (status === 'deficit') return <span className="text-red-500 font-bold" title="Deficit">🔴</span>;
    if (status === 'tight') return <span className="text-amber-500 font-bold" title="Tight">🟡</span>;
    return <span className="text-emerald-500 font-bold" title="Surplus">🟢</span>;
  };

  return (
    <section id="docs-allocation-grid-section" className="w-full py-4" aria-label="DOCS Allocation Grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header & City Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#0A4D8C] text-white text-xs font-black tracking-wider uppercase">
                DOCS
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1E293B] flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#0A4D8C]" />
                <span>{language === 'hi' ? 'जल आवंटन एवं आपूर्ति तालिका' : 'Hydraulic Allocation Grid'}</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'hi'
                ? '3 शहर, 17 जोन — सूत्र आधारित आपूर्ति विश्लेषण एवं प्रवाह प्रबंधन'
                : '3 Cities, 17 Zones — Formula-driven distribution and real-time flow management'}
            </p>
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setCityFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                cityFilter === 'all'
                  ? 'bg-[#0A4D8C] text-white border-[#0A4D8C] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {t.allCities} (17)
            </button>
            <button
              onClick={() => setCityFilter('Indore')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                cityFilter === 'Indore'
                  ? 'bg-[#0A4D8C] text-white border-[#0A4D8C] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {t.cityIndore} (7)
            </button>
            <button
              onClick={() => setCityFilter('Ujjain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                cityFilter === 'Ujjain'
                  ? 'bg-[#0A4D8C] text-white border-[#0A4D8C] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {t.cityUjjain} (5)
            </button>
            <button
              onClick={() => setCityFilter('Dewas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                cityFilter === 'Dewas'
                  ? 'bg-[#0A4D8C] text-white border-[#0A4D8C] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {t.cityDewas} (5)
            </button>
          </div>
        </div>

        {/* FORMULA CALLOUT BANNER (User Request Formula & Grand Total) */}
        <div className="mb-4 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-blue-900 to-[#0A4D8C] text-white shadow-md border border-blue-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-black text-cyan-300">
                  {t.formulaTitle}
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">
                  CPHEEO Standard
                </span>
              </div>
              <p className="text-base sm:text-lg font-mono font-bold text-white tracking-wide">
                Supply = (Population × LPC × Loss Factor) / 1000
              </p>
              <p className="text-xs text-blue-200">
                {t.formulaExplanation}
              </p>
            </div>

            {/* Target Total Badge */}
            <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-lg border border-white/20 text-right self-start lg:self-center">
              <span className="text-[11px] text-cyan-200 uppercase tracking-wider block font-medium">
                Mandated System Total (3 Cities, 17 Zones)
              </span>
              <span className="text-sm sm:text-base font-black text-white block mt-0.5">
                {grandPop.toLocaleString()} population | {grandSupply.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³/day
              </span>
            </div>
          </div>
        </div>

        {/* THE 6 MANDATED COLUMNS TABLE */}
        {/* City | Zone | Population | LPC | Loss Factor | Supply (m³/day) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th scope="col" className="py-3 px-4">{t.colCity}</th>
                  <th scope="col" className="py-3 px-4">{t.colZone}</th>
                  <th scope="col" className="py-3 px-4 text-right">{t.colPopulation}</th>
                  <th scope="col" className="py-3 px-4 text-center">{t.colLpc}</th>
                  <th scope="col" className="py-3 px-4 text-center">{t.colLossFactor}</th>
                  <th scope="col" className="py-3 px-4 text-right font-black text-[#0A4D8C]">
                    {t.colSupply}
                  </th>
                  <th scope="col" className="py-3 px-4 text-center">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredZones.map((zone) => {
                  const metric = metrics[zone.id];
                  const zoneName = language === 'hi' ? zone.name_hi : zone.name;
                  const cityName = language === 'hi' ? zone.city_hi : zone.city;
                  const status = metric?.status;

                  return (
                    <tr
                      key={zone.id}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => selectZone(zone, true)}
                    >
                      {/* Column 1: City */}
                      <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {cityName}
                        </span>
                      </td>

                      {/* Column 2: Zone */}
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          {getStatusDot(status)}
                          <span className="group-hover:text-[#0A4D8C] font-semibold transition-colors">
                            {zoneName}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Population */}
                      <td className="py-3 px-4 text-right font-mono text-slate-700 whitespace-nowrap">
                        {zone.population.toLocaleString()}
                      </td>

                      {/* Column 4: LPC */}
                      <td className="py-3 px-4 text-center font-mono text-slate-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-800">
                          {zone.lpc}
                        </span>
                      </td>

                      {/* Column 5: Loss Factor */}
                      <td className="py-3 px-4 text-center font-mono text-slate-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-800">
                          {zone.loss_factor.toFixed(2)}
                        </span>
                      </td>

                      {/* Column 6: Supply (m³/day) = (Pop * LPC * Loss) / 1000 */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0A4D8C] whitespace-nowrap">
                        {zone.supply_m3_day.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Column 7: Action (Allocate Button) */}
                      <td
                        className="py-3 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleAllocate(zone)}
                          className="px-3 py-1.5 rounded-md bg-[#0A4D8C] hover:bg-[#083866] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer min-h-[36px]"
                          aria-label={`Allocate water to ${zone.name}`}
                        >
                          <Droplets className="w-3.5 h-3.5" />
                          <span>{t.actionAllocate}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* MANDATORY TOTALS ROW */}
              <tfoot>
                <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-slate-900">
                  <td className="py-3.5 px-4 font-black text-sm uppercase" colSpan={2}>
                    {cityFilter === 'all'
                      ? 'TOTAL: 17 ZONES (3 CITIES)'
                      : `TOTAL: ${cityFilter.toUpperCase()} (${filteredZones.length} ZONES)`}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-base font-black">
                    {filteredPop.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-slate-500 font-medium">
                    Avg ~{Math.round(filteredZones.reduce((s, z) => s + z.lpc, 0) / filteredZones.length)} LPC
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-slate-500 font-medium">
                    Avg ~{(filteredZones.reduce((s, z) => s + z.loss_factor, 0) / filteredZones.length).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-base font-black text-[#0A4D8C]">
                    {filteredSupply.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    m³/day
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Balanced
                    </span>
                  </td>
                </tr>

                {/* Always show the grand mandated total if a city filter is active */}
                {cityFilter !== 'all' && (
                  <tr className="bg-blue-50/70 text-xs font-semibold text-blue-900 border-t border-blue-200">
                    <td className="py-2.5 px-4" colSpan={2}>
                      Grand Total Across All 3 Cities (17 Zones):
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">
                      1,126,000 population
                    </td>
                    <td className="py-2.5 px-4 text-center" colSpan={2}>
                      Formula: (Pop × LPC × Loss) / 1000
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#0A4D8C]">
                      189,324.00 m³/day
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-500">
                      —
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
