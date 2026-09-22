import React from 'react';
import {
  X,
  Edit3,
  MapPin,
  TrendingUp,
  Building,
  Home,
  Droplets,
  Layers,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { useWaterStore } from '../store/useWaterStore';
import { translations } from '../translations';
import { DockDemandZone } from '../types';

interface DockRowDetailModalProps {
  zone: DockDemandZone | null;
  onClose: () => void;
  onEdit: (zone: DockDemandZone) => void;
}

export const DockRowDetailModal: React.FC<DockRowDetailModalProps> = ({
  zone,
  onClose,
  onEdit,
}) => {
  const { language, setCurrentPage } = useWaterStore();
  const t = translations[language];

  if (!zone) return null;

  const isEn = language === 'en';
  const cityName = isEn ? zone.city : zone.city_hi;
  const zoneName = isEn ? zone.zone : zone.zone_hi;

  const getBadgeStyle = () => {
    switch (zone.zone_type) {
      case 'Highly Residential':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          icon: <Home className="w-4 h-4 text-emerald-600" />,
          label: isEn ? 'Highly Residential' : 'सघन आवासीय',
          range: 'c = 0.10–0.15',
        };
      case 'Mixed':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500',
          icon: <Layers className="w-4 h-4 text-amber-600" />,
          label: isEn ? 'Mixed (Com + Res)' : 'मिश्रित (आवासीय + वाणिज्यिक)',
          range: 'c = 0.25–0.40',
        };
      case 'Fully Commercial':
        return {
          bg: 'bg-red-100 text-red-900 border-red-300',
          dot: 'bg-red-500',
          icon: <Building className="w-4 h-4 text-red-600" />,
          label: isEn ? 'Fully Commercial' : 'पूर्ण वाणिज्यिक',
          range: 'c ≥ 0.50',
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[92vh] animate-in slide-in-from-bottom-8 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Handle / Header */}
        <div className="p-4 sm:p-5 bg-[#0A4D8C] text-white flex items-start justify-between">
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/20 text-blue-100">
                {cityName}
              </span>
              <span className="text-xs text-blue-200 font-semibold">• Zone ID: {zone.id}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#00B4D8]" />
              <span>{zoneName}</span>
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
                <span className="font-mono text-[11px] opacity-90">(c = {zone.c.toFixed(2)})</span>
              </span>
              <span className="text-xs text-blue-200 hidden sm:inline">
                {badge.range}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Breakdown Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Base Parameters Grid */}
          <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Population
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {zone.population.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                LPCD
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {zone.lpcd} <span className="text-xs font-normal text-slate-500">L/cap/d</span>
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Loss Factor
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {zone.loss_factor.toFixed(2)}
              </p>
            </div>
          </div>

          {/* STEP 1: DOMESTIC DEMAND */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-[#0A4D8C]" />
                {t.formulaDomesticTitle}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">Step 1</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg text-xs font-mono text-slate-700">
              ({zone.population.toLocaleString()} × {zone.lpcd} × {zone.loss_factor}) / 1000
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-slate-500">{isEn ? 'Domestic Demand:' : 'घरेलू मांग:'}</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                = {zone.domestic_demand_m3_day.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">m³/day</span>
              </span>
            </div>
          </div>

          {/* STEP 2: COMMERCIAL DEMAND */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-amber-600" />
                {t.formulaCommercialTitle}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">Step 2</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg text-xs font-mono text-slate-700">
              {zone.domestic_demand_m3_day.toLocaleString(undefined, { minimumFractionDigits: 2 })} × {zone.c.toFixed(2)}
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-slate-500">{isEn ? 'Commercial Demand:' : 'वाणिज्यिक मांग:'}</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                = {zone.commercial_demand_m3_day.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">m³/day</span>
              </span>
            </div>
          </div>

          {/* STEP 3: TOTAL DEMAND */}
          <div className="p-4 rounded-xl border-2 border-[#0A4D8C] bg-blue-50/70 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#0A4D8C] flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#0A4D8C]" />
                {t.formulaTotalTitle}
              </span>
              <span className="text-xs font-bold text-[#0A4D8C]">Domestic + Commercial</span>
            </div>
            <div className="p-2.5 bg-white rounded-lg text-xs font-mono text-slate-800 border border-blue-200">
              {zone.domestic_demand_m3_day.toLocaleString(undefined, { minimumFractionDigits: 2 })} + {zone.commercial_demand_m3_day.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-sm font-bold text-slate-800">{isEn ? 'Total Daily Demand:' : 'कुल दैनिक मांग:'}</span>
              <span className="text-2xl font-black text-[#0A4D8C] font-mono">
                = {zone.total_demand_m3_day.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-semibold text-slate-600">m³/day</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              setCurrentPage('map');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer min-h-[44px]"
          >
            <TrendingUp className="w-4 h-4 text-[#0A4D8C]" />
            <span>{t.viewOnMapBtn}</span>
          </button>

          <button
            onClick={() => onEdit(zone)}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A4D8C] hover:bg-[#083866] text-white text-xs font-bold shadow-md transition-colors cursor-pointer min-h-[44px]"
          >
            <Edit3 className="w-4 h-4" />
            <span>{t.editValuesBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
