import React, { useState, useMemo } from 'react';
import {
  Calculator,
  SlidersHorizontal,
  Building2,
  Droplets,
  Filter,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Search,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  Info,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useWaterStore, CityFilter } from '../store/useWaterStore';
import { translations } from '../translations';
import { Zone } from '../types';

export const AllocationGridPage: React.FC = () => {
  const {
    language,
    zones,
    metrics,
    cityFilter,
    setCityFilter,
    selectZone,
    setActiveModal,
    updateZoneFormula,
    setCurrentPage,
  } = useWaterStore();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'deficit' | 'tight' | 'surplus'>('all');
  const [sortField, setSortField] = useState<'city' | 'name' | 'population' | 'lpc' | 'loss_factor' | 'supply_m3_day' | 'deficit'>('city');
  const [sortAsc, setSortAsc] = useState(true);
  const [showFormulaDetails, setShowFormulaDetails] = useState(true);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filter zones by city, search, and status
  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      // City filter
      if (cityFilter !== 'all' && z.city.toLowerCase() !== cityFilter.toLowerCase()) {
        return false;
      }
      // Status filter
      const m = metrics[z.id];
      const status = m?.status || 'surplus';
      if (statusFilter !== 'all' && status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = z.name.toLowerCase().includes(q) || z.name_hi.toLowerCase().includes(q);
        const matchCity = z.city.toLowerCase().includes(q) || z.city_hi.toLowerCase().includes(q);
        const matchWard = `ward ${z.ward_number}`.includes(q);
        if (!matchName && !matchCity && !matchWard) return false;
      }
      return true;
    });
  }, [zones, cityFilter, statusFilter, searchQuery, metrics]);

  // Sort zones
  const sortedZones = useMemo(() => {
    return [...filteredZones].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'city') {
        valA = a.city;
        valB = b.city;
      } else if (sortField === 'name') {
        valA = a.ward_number;
        valB = b.ward_number;
      } else if (sortField === 'population') {
        valA = a.population;
        valB = b.population;
      } else if (sortField === 'lpc') {
        valA = a.lpc;
        valB = b.lpc;
      } else if (sortField === 'loss_factor') {
        valA = a.loss_factor;
        valB = b.loss_factor;
      } else if (sortField === 'supply_m3_day') {
        valA = a.supply_m3_day;
        valB = b.supply_m3_day;
      } else if (sortField === 'deficit') {
        const defA = metrics[a.id]?.deficit_m3_day || 0;
        const defB = metrics[b.id]?.deficit_m3_day || 0;
        valA = defA;
        valB = defB;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredZones, sortField, sortAsc, metrics]);

  // City-specific statistics
  const indoreZones = zones.filter((z) => z.city === 'Indore');
  const ujjainZones = zones.filter((z) => z.city === 'Ujjain');
  const dewasZones = zones.filter((z) => z.city === 'Dewas');

  const indorePop = indoreZones.reduce((s, z) => s + z.population, 0);
  const indoreSupply = indoreZones.reduce((s, z) => s + z.supply_m3_day, 0);

  const ujjainPop = ujjainZones.reduce((s, z) => s + z.population, 0);
  const ujjainSupply = ujjainZones.reduce((s, z) => s + z.supply_m3_day, 0);

  const dewasPop = dewasZones.reduce((s, z) => s + z.population, 0);
  const dewasSupply = dewasZones.reduce((s, z) => s + z.supply_m3_day, 0);

  // Grand totals across all 17 zones
  const grandPop = zones.reduce((s, z) => s + z.population, 0);
  const grandSupply = zones.reduce((s, z) => s + z.supply_m3_day, 0);

  // Filtered view totals
  const filteredPop = filteredZones.reduce((s, z) => s + z.population, 0);
  const filteredSupply = filteredZones.reduce((s, z) => s + z.supply_m3_day, 0);

  const handleAllocate = (zone: Zone) => {
    selectZone(zone, false);
    setActiveModal('allocate');
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default descending for numbers
    }
  };

  const exportTableCSV = () => {
    const headers = ['City', 'Zone Name', 'Ward', 'Population', 'LPC (L/cap/day)', 'Loss Factor', 'Calculated Supply (m3/day)', 'Demand (m3/day)', 'Status', 'Deficit/Surplus (m3/day)'];
    const rows = sortedZones.map((z) => {
      const m = metrics[z.id];
      return [
        `"${z.city}"`,
        `"${z.name}"`,
        z.ward_number,
        z.population,
        z.lpc,
        z.loss_factor,
        z.supply_m3_day.toFixed(2),
        m ? m.demand_m3_day.toFixed(2) : 'N/A',
        m ? m.status : 'N/A',
        m ? (m.deficit_m3_day > 0 ? `-${m.deficit_m3_day}` : `+${m.surplus_m3_day}`) : '0',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DOCS_Hydraulic_Allocation_${cityFilter}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(language === 'hi' ? 'CSV रिपोर्ट सफलतापूर्वक डाउनलोड की गई।' : 'CSV allocation sheet exported successfully.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="w-full flex flex-col space-y-5 pb-12 animate-in fade-in duration-150">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="text-[#0A4D8C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t.navDashboard}</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-800 font-bold">{t.navAllocationGrid}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#0A4D8C] text-white">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {language === 'hi' ? 'जल आवंटन एवं आपूर्ति तालिका' : 'Hydraulic Allocation Grid'}
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {language === 'hi'
                      ? '3 शहर (इंदौर, उज्जैन, देवास), 17 हाइड्रोलिक जोन — सूत्र आधारित आपूर्ति विश्लेषण एवं प्रवाह नियंत्रण'
                      : '3 Cities (Indore, Ujjain, Dewas), 17 Hydraulic Zones — Formula-driven distribution & feeder management'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportTableCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Download CSV report"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>{language === 'hi' ? 'CSV निर्यात' : 'Export CSV'}</span>
              </button>
              <button
                onClick={() => setActiveModal('whatIf')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0A4D8C] hover:bg-[#083866] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{t.whatIfBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-5">
        {exportNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{exportNotice}</span>
            </div>
            <button onClick={() => setExportNotice(null)} className="text-emerald-700 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* 4 REGIONAL STAT SUMMARY CARDS (Grand Total + 3 Cities) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: System Grand Total */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0A4D8C] to-[#073866] text-white shadow-sm border border-blue-900">
            <div className="flex items-center justify-between text-xs text-blue-200">
              <span className="font-bold uppercase tracking-wide">{language === 'hi' ? 'कुल प्रणाली' : 'System Total (3 Cities)'}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-400/30 text-white text-[11px] font-bold">17 Zones</span>
            </div>
            <p className="text-2xl font-black mt-2 tracking-tight">
              {grandSupply.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-normal opacity-85">m³/day</span>
            </p>
            <div className="mt-2 text-xs text-blue-100 flex items-center justify-between border-t border-blue-400/20 pt-2">
              <span>{t.totalPopulation}:</span>
              <span className="font-bold">{grandPop.toLocaleString()}</span>
            </div>
          </div>

          {/* Card 2: Indore */}
          <div
            onClick={() => setCityFilter('Indore')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              cityFilter === 'Indore'
                ? 'bg-blue-50/90 border-[#0A4D8C] shadow-md ring-2 ring-[#0A4D8C]/20'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                Indore (इंदौर)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[11px]">
                7 Zones
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900 mt-2">
              {indoreSupply.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">m³/day</span>
            </p>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
              <span>Population:</span>
              <span className="font-bold text-slate-700">{indorePop.toLocaleString()}</span>
            </div>
          </div>

          {/* Card 3: Ujjain */}
          <div
            onClick={() => setCityFilter('Ujjain')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              cityFilter === 'Ujjain'
                ? 'bg-purple-50/90 border-purple-600 shadow-md ring-2 ring-purple-600/20'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                Ujjain (उज्जैन)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[11px]">
                5 Zones
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900 mt-2">
              {ujjainSupply.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">m³/day</span>
            </p>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
              <span>Population:</span>
              <span className="font-bold text-slate-700">{ujjainPop.toLocaleString()}</span>
            </div>
          </div>

          {/* Card 4: Dewas */}
          <div
            onClick={() => setCityFilter('Dewas')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              cityFilter === 'Dewas'
                ? 'bg-teal-50/90 border-teal-600 shadow-md ring-2 ring-teal-600/20'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                Dewas (देवास)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold text-[11px]">
                5 Zones
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900 mt-2">
              {dewasSupply.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">m³/day</span>
            </p>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
              <span>Population:</span>
              <span className="font-bold text-slate-700">{dewasPop.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* MANDATED FORMULA EXPLAINER BANNER */}
        <div className="p-4 rounded-xl bg-[#0A4D8C]/5 border-2 border-[#0A4D8C]/20 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0A4D8C] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0A4D8C] uppercase tracking-wider">
                    {t.formulaTitle}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 text-[#0A4D8C] font-semibold">
                    Core Standard
                  </span>
                </div>
                <div className="mt-1 font-mono text-sm sm:text-base font-extrabold text-[#0A4D8C] bg-white px-3 py-1.5 rounded-md border border-blue-200 inline-block">
                  {t.formulaExpression}
                </div>
                <p className="text-xs text-slate-600 mt-1.5 max-w-3xl">
                  {t.formulaExplanation}. Each cubic meter ($m^3$) equals 1,000 Liters. Calculations are verified continuously against regional hydraulic flow sensors.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="text-xs text-[#0A4D8C] font-bold hover:underline self-start md:self-center flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showFormulaDetails ? 'Hide Variable Notes' : 'Show Variable Notes'}</span>
            </button>
          </div>

          {showFormulaDetails && (
            <div className="mt-3 pt-3 border-t border-blue-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
              <div className="p-2.5 rounded-lg bg-white/80 border border-blue-100">
                <span className="font-bold text-slate-900 block mb-0.5">1. Population ($P$)</span>
                <p className="text-slate-600 text-[11px]">
                  Verified ward demographics updated quarterly across all 17 administrative zones.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 border border-blue-100">
                <span className="font-bold text-slate-900 block mb-0.5">2. LPC (Liters/Capita/Day)</span>
                <p className="text-slate-600 text-[11px]">
                  Normative target: 135–150 LPC for core urban; 120–135 LPC for rural/industrial sectors.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 border border-blue-100">
                <span className="font-bold text-slate-900 block mb-0.5">3. Loss Factor ($LF$)</span>
                <p className="text-slate-600 text-[11px]">
                  Multiplier (1.10–1.28) modeling transmission losses, terrain pressure drops, and non-revenue water.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* TOOLBAR: City Filter, Status Filter, Search, Sort */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              City:
            </span>
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

          {/* Search & Status Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'hi' ? 'जोन या वार्ड खोजें...' : 'Search zone or ward...'}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4D8C] focus:bg-white"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0A4D8C]"
              aria-label="Filter by Status"
            >
              <option value="all">All Statuses (सभी स्थिति)</option>
              <option value="deficit">🔴 Deficit only (कमी)</option>
              <option value="tight">🟡 Tight only (सीमांत)</option>
              <option value="surplus">🟢 Surplus only (अधिशेष)</option>
            </select>
          </div>
        </div>

        {/* 6-COLUMN MANDATED ALLOCATION TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-label="Hydraulic Allocation Grid">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                  {/* Column 1: City */}
                  <th
                    onClick={() => handleSort('city')}
                    className="py-3 px-4 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>{t.colCity}</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  {/* Column 2: Zone */}
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-4 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>{t.colZone}</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  {/* Column 3: Population */}
                  <th
                    onClick={() => handleSort('population')}
                    className="py-3 px-4 uppercase tracking-wider text-right cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{t.colPopulation}</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  {/* Column 4: LPC */}
                  <th
                    onClick={() => handleSort('lpc')}
                    className="py-3 px-4 uppercase tracking-wider text-right cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{t.colLpc}</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  {/* Column 5: Loss Factor */}
                  <th
                    onClick={() => handleSort('loss_factor')}
                    className="py-3 px-4 uppercase tracking-wider text-right cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{t.colLossFactor}</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  {/* Column 6: Supply (m³/day) */}
                  <th
                    onClick={() => handleSort('supply_m3_day')}
                    className="py-3 px-4 uppercase tracking-wider text-right bg-blue-50/50 text-[#0A4D8C] cursor-pointer hover:bg-blue-100/50 transition-colors select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{t.colSupply}</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#0A4D8C]" />
                    </div>
                  </th>

                  {/* Action Column */}
                  <th className="py-3 px-4 uppercase tracking-wider text-center">
                    <span>{t.colActions}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
                {sortedZones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <p className="font-semibold text-sm">No zones match your current search and filter.</p>
                      <button
                        onClick={() => {
                          setCityFilter('all');
                          setStatusFilter('all');
                          setSearchQuery('');
                        }}
                        className="mt-2 text-[#0A4D8C] font-bold underline cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  sortedZones.map((zone) => {
                    const metric = metrics[zone.id];
                    const status = metric?.status || 'surplus';
                    const isDeficit = status === 'deficit';
                    const isTight = status === 'tight';

                    const zoneName = language === 'hi' ? zone.name_hi : zone.name;
                    const cityName = language === 'hi' ? zone.city_hi : zone.city;

                    return (
                      <tr
                        key={zone.id}
                        className={`hover:bg-blue-50/40 transition-colors ${
                          isDeficit ? 'bg-red-50/30' : isTight ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* 1. City */}
                        <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              zone.city === 'Indore'
                                ? 'bg-blue-100 text-blue-800'
                                : zone.city === 'Ujjain'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {cityName}
                          </span>
                        </td>

                        {/* 2. Zone */}
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs" title={`Status: ${status}`}>
                              {isDeficit ? '🔴' : isTight ? '🟡' : '🟢'}
                            </span>
                            <span className="font-bold text-slate-900">{zoneName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>Ward {zone.ward_number}</span>
                            <span>•</span>
                            <span className="capitalize">{zone.type}</span>
                            {metric && isDeficit && (
                              <span className="font-bold text-red-600 bg-red-100 px-1.5 py-0.2 rounded">
                                -{metric.deficit_m3_day} m³/d
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. Population */}
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700 whitespace-nowrap">
                          {zone.population.toLocaleString('en-IN')}
                        </td>

                        {/* 4. LPC */}
                        <td className="py-3 px-4 text-right font-mono text-slate-800 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold">
                            {zone.lpc}
                          </span>
                        </td>

                        {/* 5. Loss Factor */}
                        <td className="py-3 px-4 text-right font-mono text-slate-800 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold">
                            {zone.loss_factor.toFixed(2)}
                          </span>
                        </td>

                        {/* 6. Calculated Supply (m³/day) */}
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-[#0A4D8C] bg-blue-50/30 whitespace-nowrap">
                          <span className="text-sm">
                            {zone.supply_m3_day.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </td>

                        {/* 7. Action: Allocate */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleAllocate(zone)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                              isDeficit
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-[#0A4D8C] hover:bg-[#083866] text-white'
                            }`}
                            aria-label={`Allocate water for ${zone.name}`}
                          >
                            <Droplets className="w-3.5 h-3.5 text-cyan-200" />
                            <span>{t.actionAllocate}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* TABLE FOOTER SUMMARY */}
              <tfoot>
                <tr className="bg-slate-100 font-bold text-xs text-slate-900 border-t-2 border-slate-300">
                  <td className="py-3.5 px-4 font-black">
                    {cityFilter === 'all'
                      ? 'TOTAL (All 3 Cities)'
                      : `TOTAL (${cityFilter})`}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {sortedZones.length} of {zones.length} Zones
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                    {filteredPop.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500 font-mono">
                    avg {(filteredZones.reduce((s, z) => s + z.lpc, 0) / (filteredZones.length || 1)).toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500 font-mono">
                    avg {(filteredZones.reduce((s, z) => s + z.loss_factor, 0) / (filteredZones.length || 1)).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-[#0A4D8C] bg-blue-100/50 text-sm">
                    {filteredSupply.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} m³/d
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setActiveModal('whatIf')}
                      className="text-xs text-[#0A4D8C] underline font-bold hover:text-[#083866] cursor-pointer"
                    >
                      Simulate
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* BOTTOM QUICK ACTIONS & NAVIGATION CARD */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-600">
            <span className="font-bold text-slate-900">Next Actions:</span>
            <span>Jump to operational view or check upstream network sources</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              ← {language === 'hi' ? 'संचालन मानचित्र' : 'Operations Map'}
            </button>
            <button
              onClick={() => setCurrentPage('find-supply')}
              className="px-3.5 py-2 rounded-lg bg-[#0A4D8C] hover:bg-[#083866] text-white font-bold transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'जल स्रोत देखें →' : 'View Network Sources →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
