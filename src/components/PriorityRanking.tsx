import React from 'react';
import {
  ArrowUpDown,
  Droplets,
  Eye,
  Sliders,
  Users,
  Building,
  TreePine,
  Factory,
  ShieldAlert,
  Calculator,
} from 'lucide-react';
import { useWaterStore, SortOption } from '../store/useWaterStore';
import { translations } from '../translations';
import { Zone } from '../types';

export const PriorityRanking: React.FC = () => {
  const {
    language,
    zones,
    metrics,
    priorityScores,
    sortBy,
    setSortBy,
    typeFilter,
    setTypeFilter,
    selectZone,
    setActiveModal,
  } = useWaterStore();
  const t = translations[language];

  // Filters state
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'deficit' | 'surplus' | 'urban' | 'rural'>('all');

  // Filter zones
  const filteredZones = zones.filter((z) => {
    const m = metrics[z.id];
    if (activeFilter === 'deficit') return m && m.status === 'deficit';
    if (activeFilter === 'surplus') return m && m.status === 'surplus';
    if (activeFilter === 'urban') return z.type === 'urban';
    if (activeFilter === 'rural') return z.type === 'rural';
    return true;
  });

  // Sort zones
  const sortedZones = [...filteredZones].sort((a, b) => {
    const scoreA = priorityScores[a.id]?.score ?? 0;
    const scoreB = priorityScores[b.id]?.score ?? 0;
    const deficitA = metrics[a.id]?.deficit_m3_day ?? 0;
    const deficitB = metrics[b.id]?.deficit_m3_day ?? 0;

    if (sortBy === 'priority') return scoreB - scoreA;
    if (sortBy === 'deficit') return deficitB - deficitA;
    if (sortBy === 'population') return b.population - a.population;
    if (sortBy === 'type') return a.type.localeCompare(b.type);
    return 0;
  });

  const handleAction = (zone: Zone, actionType: 'allocate' | 'monitor' | 'plan') => {
    selectZone(zone, false);
    if (actionType === 'allocate') {
      setActiveModal('allocate');
    } else if (actionType === 'plan') {
      setActiveModal('whatIf');
    } else {
      setActiveModal('bottomSheet');
    }
  };

  const getTypeIcon = (type: Zone['type']) => {
    switch (type) {
      case 'urban':
        return <Building className="w-3.5 h-3.5 text-blue-600" />;
      case 'rural':
        return <TreePine className="w-3.5 h-3.5 text-emerald-600" />;
      case 'industrial':
        return <Factory className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: 'deficit' | 'tight' | 'surplus') => {
    if (status === 'deficit') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          <span>🔴 {language === 'hi' ? 'संकट' : 'Deficit'}</span>
        </span>
      );
    }
    if (status === 'tight') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>🟡 {language === 'hi' ? 'नाजुक' : 'Tight'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>🟢 {language === 'hi' ? 'अधिशेष' : 'Surplus'}</span>
      </span>
    );
  };

  return (
    <section id="priority-ranking-section" className="w-full py-4 pb-12" aria-label="Priority Ranking">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header with Title and Sorting Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#0A4D8C]" />
              <span>{t.priorityTitle}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              {t.prioritySub}
            </p>
          </div>

          {/* Sort Dropdown & Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <label htmlFor="priority-sort-select" className="sr-only">
                {t.sortBy}
              </label>
              <select
                id="priority-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent focus:outline-none cursor-pointer pr-2 text-slate-800 font-medium"
              >
                <option value="priority">{t.sortPriorityScore}</option>
                <option value="deficit">{t.sortDeficit}</option>
                <option value="population">{t.sortPopulation}</option>
                <option value="type">{t.sortType}</option>
              </select>
            </div>

            <button
              onClick={() => useWaterStore.getState().setCurrentPage('allocation-grid')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A4D8C] hover:bg-[#083866] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'पूर्ण आवंटन तालिका (17 जोन) →' : 'Full Allocation Grid (17 Zones) →'}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
          {[
            { id: 'all', label: t.filterAll },
            { id: 'deficit', label: t.filterDeficit },
            { id: 'surplus', label: t.filterSurplus },
            { id: 'urban', label: t.filterUrban },
            { id: 'rural', label: t.filterRural },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as typeof activeFilter)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-[#0A4D8C] text-white border-[#0A4D8C]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Priority Ranked List */}
        <div className="space-y-2.5">
          {sortedZones.map((zone, index) => {
            const metric = metrics[zone.id];
            const scoreObj = priorityScores[zone.id];
            const score = scoreObj?.score ?? 50;
            const zoneName = language === 'hi' ? zone.name_hi : zone.name;
            const isDeficit = metric && metric.status === 'deficit';
            const isTight = metric && metric.status === 'tight';

            // High priority score (>80) gets red/alert border
            const scoreColor =
              score >= 80
                ? 'text-[#EF4444] bg-red-50 border-red-200'
                : score >= 60
                ? 'text-[#F59E0B] bg-amber-50 border-amber-200'
                : 'text-[#22C55E] bg-emerald-50 border-emerald-200';

            return (
              <div
                key={zone.id}
                id={`priority-row-${zone.id}`}
                className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left: Rank, Name, Badges, Stats */}
                <div className="flex items-start sm:items-center gap-3">
                  {/* Rank number */}
                  <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center border border-slate-300 flex-shrink-0">
                    {index + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {metric && getStatusBadge(metric.status)}
                      <h3
                        onClick={() => selectZone(zone, true)}
                        className="text-base font-bold text-[#1E293B] hover:text-[#0A4D8C] cursor-pointer"
                      >
                        {zoneName}
                      </h3>
                      {zone.critical_infra && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                          Infra: {language === 'hi' ? zone.critical_infra_desc_hi : zone.critical_infra_desc}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                      <span className="font-semibold text-[#EF4444]">
                        {isDeficit
                          ? `Deficit ${metric.deficit_m3_day} m³/day`
                          : isTight
                          ? `Deficit ${metric?.deficit_m3_day || 0} m³/day (Tight)`
                          : `Surplus ${metric?.surplus_m3_day || 0} m³/day`}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {zone.population.toLocaleString()} {t.people}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 capitalize">
                        {getTypeIcon(zone.type)}
                        {zone.type === 'urban' ? t.urban : zone.type === 'rural' ? t.rural : t.industrial}
                      </span>
                      {zone.consumption_pattern === 'very_high' && (
                        <>
                          <span>•</span>
                          <span className="text-amber-700 font-medium">High Consumption</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Priority Score & Action Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  {/* Score pill */}
                  <div className={`px-3 py-1.5 rounded-lg border font-bold text-center ${scoreColor}`}>
                    <span className="text-xs block font-normal text-slate-500">{t.scoreLabel}</span>
                    <span className="text-lg leading-tight">{score}</span>
                  </div>

                  {/* Action Button: Allocate Now (Red for deficit), Monitor (Amber for tight), Inspect (Others) */}
                  {isDeficit ? (
                    <button
                      onClick={() => handleAction(zone, 'allocate')}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-md text-xs sm:text-sm font-semibold shadow-xs transition-colors min-h-[44px] touch-manipulation cursor-pointer"
                      aria-label={`Allocate Water for ${zone.name}`}
                    >
                      <Droplets className="w-4 h-4" />
                      <span>{t.actionDispatchNow}</span>
                    </button>
                  ) : isTight ? (
                    <button
                      onClick={() => handleAction(zone, 'monitor')}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 rounded-md text-xs sm:text-sm font-semibold shadow-xs transition-colors min-h-[44px] touch-manipulation cursor-pointer"
                      aria-label={`Monitor ${zone.name}`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>{t.actionMonitor}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(zone, 'plan')}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0A4D8C] hover:bg-[#083866] text-white rounded-md text-xs sm:text-sm font-semibold shadow-xs transition-colors min-h-[44px] touch-manipulation cursor-pointer"
                      aria-label={`Inspect ${zone.name}`}
                    >
                      <Sliders className="w-4 h-4" />
                      <span>{t.actionPlan}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
