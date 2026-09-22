import React, { useState } from 'react';
import {
  Droplets,
  Building2,
  Activity,
  Filter,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ChevronRight,
  Zap,
  Gauge,
  Layers,
  Sparkles,
  Waves,
  Factory,
  ArrowRight,
} from 'lucide-react';
import { useWaterStore, CityFilter } from '../store/useWaterStore';
import { translations } from '../translations';
import { WaterSource } from '../types';

export const SourcesPage: React.FC = () => {
  const { language, sources, zones, setCurrentPage, setActiveModal } = useWaterStore();
  const t = translations[language];

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'natural' | 'man-made'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<CityFilter>('all');

  // Enriched sources with category distinction: Natural vs Man-made
  const classifiedSources = sources.map((s) => {
    const isNatural =
      s.name.toLowerCase().includes('dam') ||
      s.name.toLowerCase().includes('river') ||
      s.name.toLowerCase().includes('lake') ||
      s.name.toLowerCase().includes('pond') ||
      s.type === 'reservoir';

    const category: 'natural' | 'man-made' = isNatural ? 'natural' : 'man-made';
    const subTypeDesc = isNatural
      ? s.name.toLowerCase().includes('dam')
        ? 'Natural Dam Intake'
        : s.name.toLowerCase().includes('river')
        ? 'River Basinal Source'
        : 'Natural Lake / Pond Reservoir'
      : s.name.toLowerCase().includes('treatment') || s.type === 'plant'
      ? 'RO Purified Distribution Plant'
      : s.type === 'borewell'
      ? 'Municipal Sub-Surface Grid'
      : 'Municipal Processed Water Plant';

    return {
      ...s,
      category,
      subTypeDesc,
    };
  });

  // Filter sources
  const filteredSources = classifiedSources.filter((s) => {
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    if (selectedType !== 'all' && s.type !== selectedType) return false;
    if (selectedCity !== 'all') {
      const z = zones.find((zn) => zn.id === s.zone_id);
      if (z && z.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    }
    return true;
  });

  const totalCapacity = sources.reduce((s, src) => s + src.capacity_m3_day, 0);
  const totalOutput = sources.reduce((s, src) => s + src.current_output_m3_day, 0);
  const utilization = Math.round((totalOutput / (totalCapacity || 1)) * 100);

  const naturalCount = classifiedSources.filter((s) => s.category === 'natural').length;
  const manMadeCount = classifiedSources.filter((s) => s.category === 'man-made').length;

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
                <span className="text-slate-800 font-bold">{t.navFindSupply}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#0A4D8C] text-white shadow-md">
                  <Waves className="w-6 h-6 text-[#00B4D8]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{language === 'hi' ? 'जल नेटवर्क एवं आपूर्ति स्रोत' : 'Water Network Sources & Intakes'}</span>
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {language === 'hi'
                      ? 'प्राकृतिक स्रोत (बांध, तालाब, झीलें) एवं मानव निर्मित स्रोत (आरओ शुद्धिकरण संयंत्र, नगरपालिका प्रसंस्कृत संयंत्र)'
                      : 'Natural sources (dams, ponds, lakes) and man-made systems (RO purified plants, municipal processed plants)'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage('dock')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0A4D8C] hover:bg-[#083866] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <span>{language === 'hi' ? 'DOCK मांग कैलकुलेटर →' : 'Calculate Zone Demand (DOCK) →'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-5">
        {/* KPI OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Card 1: Natural Sources */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-emerald-600" />
              Natural Sources
            </span>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {naturalCount} <span className="text-xs font-normal text-slate-500">active sites</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Dams, lakes, ponds & river intake</p>
          </div>

          {/* Card 2: Man-made Sources */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1.5">
              <Factory className="w-4 h-4 text-blue-600" />
              Man-Made Plants
            </span>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {manMadeCount} <span className="text-xs font-normal text-slate-500">production plants</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">RO purified & municipal works</p>
          </div>

          {/* Card 3: Total Feeder Capacity */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Intake Capacity
            </span>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {totalCapacity.toLocaleString()} <span className="text-xs font-normal text-slate-500">m³/day</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Peak transmission potential</p>
          </div>

          {/* Card 4: Aggregate Grid Utilization */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Production Output
            </span>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-2xl font-black text-[#0A4D8C]">{totalOutput.toLocaleString()}</p>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                {utilization}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-[#0A4D8C] rounded-full"
                style={{ width: `${Math.min(100, utilization)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* FILTERS BAR: CATEGORY (NATURAL VS MAN-MADE) & CITY */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Natural vs Man-made Category toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Source Class:
            </span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                categoryFilter === 'all'
                  ? 'bg-[#0A4D8C] text-white border-[#0A4D8C]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              All Sources ({classifiedSources.length})
            </button>
            <button
              onClick={() => setCategoryFilter('natural')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                categoryFilter === 'natural'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>Natural: Ponds, Dams, Lakes</span>
            </button>
            <button
              onClick={() => setCategoryFilter('man-made')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                categoryFilter === 'man-made'
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
              }`}
            >
              <Factory className="w-3.5 h-3.5" />
              <span>Man-Made: RO & Municipal</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">City Scope:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-[#0A4D8C] focus:outline-none"
            >
              <option value="all">All Regional Networks</option>
              <option value="Indore">Indore Network</option>
              <option value="Ujjain">Ujjain Network</option>
              <option value="Dewas">Dewas Network</option>
            </select>
          </div>
        </div>

        {/* SOURCE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((src) => {
            const z = zones.find((zn) => zn.id === src.zone_id);
            const percent = Math.round((src.current_output_m3_day / src.capacity_m3_day) * 100);

            return (
              <div
                key={src.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            src.category === 'natural'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {src.category === 'natural' ? <Waves className="w-3 h-3" /> : <Factory className="w-3 h-3" />}
                          <span>{src.category}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">• {src.type}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{src.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{src.location}</span>
                      </p>
                      <p className="text-[11px] text-slate-600 font-medium mt-1">
                        {src.subTypeDesc}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                        src.status === 'operational'
                          ? 'bg-emerald-100 text-emerald-800'
                          : src.status === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          src.status === 'operational'
                            ? 'bg-emerald-500'
                            : src.status === 'partial'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                      ></span>
                      {src.status}
                    </span>
                  </div>

                  {z && (
                    <div className="mt-3 p-2 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-slate-700 flex items-center justify-between">
                      <span className="text-slate-500">Connected Zone:</span>
                      <span className="font-bold text-[#0A4D8C]">
                        {z.name} ({z.city})
                      </span>
                    </div>
                  )}

                  <div className="mt-4 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Flow / Max Capacity:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {src.current_output_m3_day.toLocaleString()} / {src.capacity_m3_day.toLocaleString()} m³/d
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percent > 95 ? 'bg-amber-500' : 'bg-[#0A4D8C]'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>Load: {percent}%</span>
                      <span>Headroom: {(src.capacity_m3_day - src.current_output_m3_day).toLocaleString()} m³/d</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage('dock')}
                    className="text-xs font-bold text-[#0A4D8C] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View Zone Demand (DOCK) →
                  </button>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {src.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
