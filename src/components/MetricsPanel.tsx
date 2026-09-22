import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Droplets, Filter, RotateCcw } from 'lucide-react';
import { useWaterStore, StatusFilter } from '../store/useWaterStore';
import { translations } from '../translations';

export const MetricsPanel: React.FC = () => {
  const {
    language,
    zones,
    metrics,
    statusFilter,
    setStatusFilter,
  } = useWaterStore();
  const t = translations[language];

  // Compute aggregate statistics
  let deficitCount = 0;
  let tightCount = 0;
  let surplusCount = 0;
  let totalPopulation = 0;
  let totalDemand = 0;
  let totalSupply = 0;
  let totalDeficit = 0;
  let totalSurplus = 0;

  zones.forEach((z) => {
    totalPopulation += z.population;
    const m = metrics[z.id];
    if (m) {
      totalDemand += m.demand_m3_day;
      totalSupply += m.supply_m3_day;
      totalDeficit += m.deficit_m3_day;
      totalSurplus += m.surplus_m3_day;

      if (m.status === 'deficit') deficitCount++;
      else if (m.status === 'tight') tightCount++;
      else surplusCount++;
    }
  });

  const overallSupplyMetPercent =
    totalDemand > 0 ? Math.round((totalSupply / totalDemand) * 100) : 100;

  const handleCardClick = (targetStatus: StatusFilter) => {
    if (statusFilter === targetStatus) {
      setStatusFilter('all'); // toggle off
    } else {
      setStatusFilter(targetStatus);
    }
  };

  return (
    <section id="metrics-panel-section" className="w-full py-3" aria-label="Metrics Panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base sm:text-lg font-bold text-[#1E293B] flex items-center gap-2">
            <span>{t.metricsTitle}</span>
            {statusFilter !== 'all' && (
              <span className="text-xs bg-blue-100 text-[#0A4D8C] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                <Filter className="w-3 h-3" />
                {statusFilter.toUpperCase()}
              </span>
            )}
          </h2>

          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-xs font-semibold text-[#0A4D8C] hover:underline flex items-center gap-1 cursor-pointer focus:outline-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.clearFilter}</span>
            </button>
          )}
        </div>

        {/* 4 Stat Cards in Grid (2x2 on mobile, 4x1 on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Deficit Zones (Red) */}
          <button
            id="metric-card-deficit"
            type="button"
            onClick={() => handleCardClick('deficit')}
            className={`text-left p-4 rounded-lg bg-white border-l-4 border-l-[#EF4444] border-t border-r border-b border-slate-200 shadow-xs transition-all duration-200 hover:shadow-sm cursor-pointer min-h-[96px] ${
              statusFilter === 'deficit' ? 'ring-2 ring-[#EF4444] bg-red-50/50' : ''
            }`}
            aria-label={`${deficitCount} Deficit Zones. Tap to filter map.`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-[32px] font-bold text-[#EF4444] leading-none">
                🔴 {deficitCount}
              </span>
              <AlertCircle className="w-5 h-5 text-[#EF4444] opacity-80" />
            </div>
            <p className="text-sm font-medium text-slate-600 mt-2">
              {t.deficitZones}
            </p>
            <span className="text-[11px] text-red-600 font-semibold block mt-0.5">
              {statusFilter === 'deficit' ? '✓ Filter Active' : 'Tap to filter map'}
            </span>
          </button>

          {/* Card 2: Tight Zones (Amber) */}
          <button
            id="metric-card-tight"
            type="button"
            onClick={() => handleCardClick('tight')}
            className={`text-left p-4 rounded-lg bg-white border-l-4 border-l-[#F59E0B] border-t border-r border-b border-slate-200 shadow-xs transition-all duration-200 hover:shadow-sm cursor-pointer min-h-[96px] ${
              statusFilter === 'tight' ? 'ring-2 ring-[#F59E0B] bg-amber-50/50' : ''
            }`}
            aria-label={`${tightCount} Tight Zones. Tap to filter map.`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-[32px] font-bold text-[#D97706] leading-none">
                🟡 {tightCount}
              </span>
              <AlertTriangle className="w-5 h-5 text-[#F59E0B] opacity-80" />
            </div>
            <p className="text-sm font-medium text-slate-600 mt-2">
              {t.tightZones}
            </p>
            <span className="text-[11px] text-amber-600 font-semibold block mt-0.5">
              {statusFilter === 'tight' ? '✓ Filter Active' : 'Tap to filter map'}
            </span>
          </button>

          {/* Card 3: Surplus Zones (Green) */}
          <button
            id="metric-card-surplus"
            type="button"
            onClick={() => handleCardClick('surplus')}
            className={`text-left p-4 rounded-lg bg-white border-l-4 border-l-[#22C55E] border-t border-r border-b border-slate-200 shadow-xs transition-all duration-200 hover:shadow-sm cursor-pointer min-h-[96px] ${
              statusFilter === 'surplus' ? 'ring-2 ring-[#22C55E] bg-emerald-50/50' : ''
            }`}
            aria-label={`${surplusCount} Surplus Zones. Tap to filter map.`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-[32px] font-bold text-[#16A34A] leading-none">
                🟢 {surplusCount}
              </span>
              <CheckCircle className="w-5 h-5 text-[#22C55E] opacity-80" />
            </div>
            <p className="text-sm font-medium text-slate-600 mt-2">
              {t.surplusZones}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
              {statusFilter === 'surplus' ? '✓ Filter Active' : 'Tap to filter map'}
            </span>
          </button>

          {/* Card 4: Supply Met % (Cyan / Deep Blue) */}
          <div
            id="metric-card-supply-met"
            className="p-4 rounded-lg bg-white border-l-4 border-l-[#00B4D8] border-t border-r border-b border-slate-200 shadow-xs min-h-[96px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-[32px] font-bold text-[#0A4D8C] leading-none">
                💧 {overallSupplyMetPercent}%
              </span>
              <Droplets className="w-5 h-5 text-[#00B4D8] opacity-80" />
            </div>
            <p className="text-sm font-medium text-slate-600 mt-2">
              {t.supplyMet}
            </p>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              District Aggregate
            </span>
          </div>
        </div>

        {/* Totals Summary Strip Below Stat Cards (Exact metrics from prompt) */}
        <div
          id="district-totals-strip"
          className="mt-3.5 p-3 sm:p-4 bg-white rounded-lg border border-slate-200 shadow-xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200"
        >
          <div className="pt-2 sm:pt-0">
            <span className="text-xs text-slate-500 font-medium block">
              {t.totalPopulation}
            </span>
            <span className="text-base sm:text-lg font-bold text-[#1E293B] mt-0.5 block">
              {totalPopulation.toLocaleString()}
            </span>
          </div>

          <div className="pt-2 sm:pt-0">
            <span className="text-xs text-slate-500 font-medium block">
              {t.totalDemand}
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-800 mt-0.5 block">
              {totalDemand.toLocaleString()} m³/day
            </span>
          </div>

          <div className="pt-2 sm:pt-0">
            <span className="text-xs text-slate-500 font-medium block">
              {t.totalSupply}
            </span>
            <span className="text-base sm:text-lg font-bold text-[#0A4D8C] mt-0.5 block">
              {totalSupply.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³/day
            </span>
          </div>

          <div className="pt-2 sm:pt-0">
            <span className="text-xs text-slate-500 font-medium block">
              {t.totalDeficit}
            </span>
            <span className="text-base sm:text-lg font-bold text-[#EF4444] mt-0.5 block">
              {totalDeficit.toLocaleString()} m³/day
            </span>
          </div>

          <div className="pt-2 sm:pt-0">
            <span className="text-xs text-slate-500 font-medium block">
              {t.totalSurplus}
            </span>
            <span className="text-base sm:text-lg font-bold text-[#16A34A] mt-0.5 block">
              {totalSurplus.toLocaleString()} m³/day
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
