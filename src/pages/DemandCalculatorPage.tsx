import React, { useState, useMemo } from 'react';
import {
  Droplets,
  Home,
  Building,
  Layers,
  Search,
  Filter,
  Download,
  Printer,
  MapPin,
  TrendingUp,
  Info,
  ChevronDown,
  RotateCcw,
  Edit3,
  HelpCircle,
  Calculator,
  CheckCircle2,
} from 'lucide-react';
import { useWaterStore } from '../store/useWaterStore';
import { translations } from '../translations';
import { DockDemandZone, DockZoneType } from '../types';
import { DockRowDetailModal } from '../components/DockRowDetailModal';
import { DockEditModal } from '../components/DockEditModal';

type SortOption = 'city-asc' | 'pop-desc' | 'total-demand-desc' | 'domestic-desc';

export const DemandCalculatorPage: React.FC = () => {
  const {
    language,
    dockZones,
    selectedDockZone,
    setSelectedDockZone,
    editingDockZone,
    setEditingDockZone,
    saveEditingDockZone,
    resetDockZones,
    setCurrentPage,
  } = useWaterStore();

  const t = translations[language];
  const isEn = language === 'en';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedZoneType, setSelectedZoneType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('city-asc');
  const [showFormulaExplanation, setShowFormulaExplanation] = useState(false);

  // Filter and sort data
  const filteredZones = useMemo(() => {
    return dockZones
      .filter((z) => {
        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchCity = z.city.toLowerCase().includes(q) || z.city_hi.toLowerCase().includes(q);
          const matchZone = z.zone.toLowerCase().includes(q) || z.zone_hi.toLowerCase().includes(q);
          if (!matchCity && !matchZone) return false;
        }

        // City filter
        if (selectedCity !== 'all' && z.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }

        // Zone Type filter
        if (selectedZoneType !== 'all' && z.zone_type !== selectedZoneType) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'city-asc') {
          const cityComp = a.city.localeCompare(b.city);
          if (cityComp !== 0) return cityComp;
          return a.zone.localeCompare(b.zone);
        }
        if (sortBy === 'pop-desc') {
          return b.population - a.population;
        }
        if (sortBy === 'total-demand-desc') {
          return b.total_demand_m3_day - a.total_demand_m3_day;
        }
        if (sortBy === 'domestic-desc') {
          return b.domestic_demand_m3_day - a.domestic_demand_m3_day;
        }
        return 0;
      });
  }, [dockZones, searchTerm, selectedCity, selectedZoneType, sortBy]);

  // Aggregate totals of filtered zones
  const summaryTotals = useMemo(() => {
    return filteredZones.reduce(
      (acc, z) => {
        acc.population += z.population;
        acc.domestic += z.domestic_demand_m3_day;
        acc.commercial += z.commercial_demand_m3_day;
        acc.total += z.total_demand_m3_day;
        return acc;
      },
      { population: 0, domestic: 0, commercial: 0, total: 0 }
    );
  }, [filteredZones]);

  // Overall dataset total for reference
  const grandTotals = useMemo(() => {
    return dockZones.reduce(
      (acc, z) => {
        acc.population += z.population;
        acc.domestic += z.domestic_demand_m3_day;
        acc.commercial += z.commercial_demand_m3_day;
        acc.total += z.total_demand_m3_day;
        return acc;
      },
      { population: 0, domestic: 0, commercial: 0, total: 0 }
    );
  }, [dockZones]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCity('all');
    setSelectedZoneType('all');
    setSortBy('city-asc');
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'City',
      'Zone',
      'Population',
      'LPCD',
      'Loss Factor',
      'Zone Type',
      'c Multiplier',
      'Domestic Demand (m3/day)',
      'Commercial Demand (m3/day)',
      'Total Demand (m3/day)',
    ];

    const rows = filteredZones.map((z) => [
      `"${z.city}"`,
      `"${z.zone}"`,
      z.population,
      z.lpcd,
      z.loss_factor.toFixed(2),
      `"${z.zone_type}"`,
      z.c.toFixed(2),
      z.domestic_demand_m3_day.toFixed(2),
      z.commercial_demand_m3_day.toFixed(2),
      z.total_demand_m3_day.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DOCK_Demand_Calculator_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  // Helper for Zone Type Badge
  const renderZoneTypeBadge = (type: DockZoneType, cVal: number) => {
    if (type === 'Highly Residential') {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap"
          title="Highly Residential (c = 0.10–0.15)"
        >
          <Home className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>{isEn ? 'HighR' : 'आवासीय'}</span>
          <span className="font-mono text-[10px] bg-emerald-200/70 px-1 rounded text-emerald-900">
            {cVal.toFixed(2)}
          </span>
        </span>
      );
    }
    if (type === 'Mixed') {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap"
          title="Mixed Commercial & Residential (c = 0.25–0.40)"
        >
          <Layers className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>{isEn ? 'Mixed' : 'मिश्रित'}</span>
          <span className="font-mono text-[10px] bg-amber-200/70 px-1 rounded text-amber-900">
            {cVal.toFixed(2)}
          </span>
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300 whitespace-nowrap"
        title="Fully Commercial (c ≥ 0.50)"
      >
        <Building className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
        <span>{isEn ? 'Commercial' : 'वाणिज्यिक'}</span>
        <span className="font-mono text-[10px] bg-red-200/70 px-1 rounded text-red-900">
          {cVal.toFixed(2)}
        </span>
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col space-y-4 pb-12 animate-in fade-in duration-150">
      {/* PAGE TITLE BAR */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0A4D8C] text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <Droplets className="w-6 h-6 text-[#00B4D8]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{t.dockPageTitle}</span>
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
                    {t.dockPageSub}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowFormulaExplanation(!showFormulaExplanation)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-[#0A4D8C]" />
                <span>{showFormulaExplanation ? 'Hide Formulas' : 'View Formulas & Rules'}</span>
              </button>

              <button
                onClick={() => setCurrentPage('map')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0A4D8C] hover:bg-[#083866] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-[#00B4D8]" />
                <span>{t.viewOnMapBtn}</span>
              </button>
            </div>
          </div>

          {/* EXPANDABLE FORMULAS & MULTIPLIERS ACCORDION */}
          {showFormulaExplanation && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-200">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <span className="text-[11px] font-bold text-[#0A4D8C] uppercase tracking-wide flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" />
                  1. Domestic Demand Formula
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                  (Population × LPCD × Loss Factor) / 1000
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  LPCD: standard domestic norm (135 L/cap/d). Loss Factor: sent − billed water (1.1–1.5).
                </p>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  2. Commercial Demand Formula
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                  Domestic Demand × c
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  c multiplier: 0.10–0.15 (Residential), 0.25–0.40 (Mixed), ≥0.50 (Commercial).
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" />
                  3. Total Demand Formula
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                  Domestic Demand + Commercial Demand
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Equivalent to: Domestic Demand × (1 + c). Computed in m³/day.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-4">
        {/* SEARCH + FILTER BAR */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.dockSearchPlaceholder}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#0A4D8C] focus:outline-none"
              aria-label={t.dockSearchPlaceholder}
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* City Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="dock-city-filter" className="text-xs font-bold text-slate-600">
                {t.cityFilterLabel}:
              </label>
              <select
                id="dock-city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="py-1.5 px-2.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0A4D8C]"
              >
                <option value="all">{isEn ? 'All Cities (3)' : 'सभी 3 शहर'}</option>
                <option value="Chennai">Chennai (7 Zones)</option>
                <option value="Guduvancherry">Guduvancherry (6 Zones)</option>
                <option value="Tambaram">Tambaram (4 Zones)</option>
              </select>
            </div>

            {/* Zone Type Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="dock-type-filter" className="text-xs font-bold text-slate-600">
                {t.zoneTypeFilterLabel}:
              </label>
              <select
                id="dock-type-filter"
                value={selectedZoneType}
                onChange={(e) => setSelectedZoneType(e.target.value)}
                className="py-1.5 px-2.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0A4D8C]"
              >
                <option value="all">{t.allZoneTypes}</option>
                <option value="Highly Residential">Highly Residential (c: 0.10–0.15)</option>
                <option value="Mixed">Mixed (Com + Res) (c: 0.25–0.40)</option>
                <option value="Fully Commercial">Fully Commercial (c: ≥ 0.50)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="dock-sort-filter" className="text-xs font-bold text-slate-600">
                {t.sortFilterLabel}:
              </label>
              <select
                id="dock-sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="py-1.5 px-2.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0A4D8C]"
              >
                <option value="city-asc">City A–Z / Grouped</option>
                <option value="pop-desc">Population (High–Low)</option>
                <option value="total-demand-desc">Total Demand (High–Low)</option>
                <option value="domestic-desc">Domestic Demand (High–Low)</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {(searchTerm || selectedCity !== 'all' || selectedZoneType !== 'all' || sortBy !== 'city-asc') && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.resetBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* DOCK TABLE (EXACT 10 COLUMNS IN MANDATED ORDER) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1040px]" aria-label="DOCK Demand Calculator Table">
              <thead>
                <tr className="bg-[#0A4D8C] text-white text-xs font-bold uppercase tracking-wider divide-x divide-blue-800">
                  <th scope="col" className="py-3 px-3 w-[120px] text-left">
                    #1 {t.colCity}
                  </th>
                  <th scope="col" className="py-3 px-3 w-[140px] text-left">
                    #2 {t.colZone}
                  </th>
                  <th scope="col" className="py-3 px-3 w-[110px] text-right">
                    #3 {t.colPopulation}
                  </th>
                  <th scope="col" className="py-3 px-3 w-[80px] text-right">
                    #4 LPCD
                  </th>
                  <th scope="col" className="py-3 px-3 w-[90px] text-right">
                    #5 {t.colLossFactor}
                  </th>
                  <th scope="col" className="py-3 px-3 w-[140px] text-center">
                    #6 {t.colZoneType}
                  </th>
                  <th scope="col" className="py-3 px-3 w-[80px] text-right">
                    #7 c
                  </th>
                  <th scope="col" className="py-3 px-3 w-[140px] text-right">
                    #8 {t.colDomesticDemand}
                  </th>
                  <th scope="col" className="py-3 px-3 w-[140px] text-right">
                    #9 {t.colCommercialDemand}
                  </th>
                  <th scope="col" className="py-3 px-4 w-[160px] text-right bg-[#073866] font-black">
                    #10 {t.colTotalDemand}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredZones.map((z, idx) => {
                  const cityName = isEn ? z.city : z.city_hi;
                  const zoneName = isEn ? z.zone : z.zone_hi;

                  return (
                    <tr
                      key={z.id}
                      onClick={() => setSelectedDockZone(z)}
                      className="hover:bg-blue-50/80 transition-colors cursor-pointer group divide-x divide-slate-100"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedDockZone(z);
                        }
                      }}
                      aria-label={`${cityName}, ${zoneName}, Total Demand ${z.total_demand_m3_day} cubic meters per day`}
                    >
                      {/* 1. City */}
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-800">
                          {cityName}
                        </span>
                      </td>

                      {/* 2. Zone */}
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <div className="flex items-center justify-between gap-1">
                          <span className="group-hover:text-[#0A4D8C] transition-colors">{zoneName}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingDockZone(z);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white text-slate-500 hover:text-[#0A4D8C] transition-opacity cursor-pointer"
                            title="Quick edit values"
                            aria-label={`Edit ${zoneName}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* 3. Population */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-800">
                        {z.population.toLocaleString()}
                      </td>

                      {/* 4. LPCD */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                        {z.lpcd}
                      </td>

                      {/* 5. Loss Factor */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                        {z.loss_factor.toFixed(2)}
                      </td>

                      {/* 6. Zone Type */}
                      <td className="py-3 px-3 text-center">
                        {renderZoneTypeBadge(z.zone_type, z.c)}
                      </td>

                      {/* 7. c multiplier */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {z.c.toFixed(2)}
                      </td>

                      {/* 8. Domestic Demand */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {z.domestic_demand_m3_day.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* 9. Commercial Demand */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {z.commercial_demand_m3_day.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* 10. Total Demand (BOLD, PRIMARY BLUE, LARGER FONT 18px) */}
                      <td className="py-3 px-4 text-right font-mono font-black text-[#0A4D8C] text-[18px] bg-blue-50/40">
                        {z.total_demand_m3_day.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* TOTAL ROW (BOLD, PRIMARY BLUE BACKGROUND, WHITE TEXT, STICKY BOTTOM) */}
              <tfoot>
                <tr className="bg-[#0A4D8C] text-white font-bold text-xs uppercase divide-x divide-blue-800">
                  <td colSpan={2} className="py-3.5 px-3 font-black text-sm tracking-wide">
                    TOTAL ({filteredZones.length} Zones)
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-sm font-bold">
                    {summaryTotals.population.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-xs opacity-80">
                    avg 135
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-xs opacity-80">
                    avg 1.23
                  </td>
                  <td className="py-3.5 px-3 text-center text-xs font-normal opacity-90">
                    All Sectors
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-xs opacity-80">
                    —
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-sm font-bold">
                    {summaryTotals.domestic.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-sm font-bold">
                    {summaryTotals.commercial.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-[18px] text-[#00B4D8] bg-[#073663]">
                    {summaryTotals.total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* SUMMARY CARDS (EXACT LAYOUT BELOW TABLE) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Card 1: Total Domestic Demand */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-[#0A4D8C]" />
                  {t.summaryTotalDomestic}
                </span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Residential Baseline
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2 tracking-tight">
                {summaryTotals.domestic.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Unit: m³/day</span>
              <span className="font-semibold text-slate-700">
                {Math.round((summaryTotals.domestic / (summaryTotals.total || 1)) * 100)}% of Total
              </span>
            </div>
          </div>

          {/* Card 2: Total Commercial Demand */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-amber-600" />
                  {t.summaryTotalCommercial}
                </span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Multiplier (c)
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-700 font-mono mt-2 tracking-tight">
                {summaryTotals.commercial.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Unit: m³/day</span>
              <span className="font-semibold text-amber-700">
                {Math.round((summaryTotals.commercial / (summaryTotals.total || 1)) * 100)}% of Total
              </span>
            </div>
          </div>

          {/* Card 3: Total Demand */}
          <div className="bg-white p-5 rounded-xl border-2 border-[#0A4D8C] shadow-sm flex flex-col justify-between bg-gradient-to-br from-white to-blue-50/50">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#0A4D8C] flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-[#00B4D8]" />
                  {t.summaryTotalDemand}
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-[#0A4D8C]">
                  Domestic + Commercial
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#0A4D8C] font-mono mt-2 tracking-tight">
                {summaryTotals.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-100 flex items-center justify-between text-xs text-slate-600">
              <span>Total m³/day</span>
              <span className="font-bold text-[#0A4D8C]">
                {summaryTotals.population.toLocaleString()} population served
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BAR (EXACT CONTROLS: EXPORT CSV, PRINT, VIEW ON MAP) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Showing {filteredZones.length} of {dockZones.length} zones across 3 cities (Chennai, Guduvancherry, Tambaram)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs transition-colors cursor-pointer min-h-[44px]"
              title="Download table data as CSV"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>{t.exportCsvBtn}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs transition-colors cursor-pointer min-h-[44px]"
              title="Print table"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>{t.printBtn}</span>
            </button>

            <button
              onClick={() => setCurrentPage('map')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0A4D8C] hover:bg-[#083866] text-white text-xs font-bold shadow-md transition-colors cursor-pointer min-h-[44px]"
              title="View on Map"
            >
              <TrendingUp className="w-4 h-4 text-[#00B4D8]" />
              <span>{t.viewOnMapBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ROW DETAIL BOTTOM SHEET MODAL */}
      {selectedDockZone && (
        <DockRowDetailModal
          zone={selectedDockZone}
          onClose={() => setSelectedDockZone(null)}
          onEdit={(z) => {
            setSelectedDockZone(null);
            setEditingDockZone(z);
          }}
        />
      )}

      {/* EDIT VALUES MODAL */}
      {editingDockZone && (
        <DockEditModal
          zone={editingDockZone}
          onClose={() => setEditingDockZone(null)}
          onSave={saveEditingDockZone}
        />
      )}
    </div>
  );
};
