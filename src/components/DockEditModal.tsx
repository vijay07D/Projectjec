import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Calculator,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Home,
  Layers,
  Building,
} from 'lucide-react';
import { useWaterStore } from '../store/useWaterStore';
import { translations } from '../translations';
import { DockDemandZone, DockZoneType } from '../types';
import {
  calculateDomesticDemand,
  calculateCommercialDemand,
  calculateTotalDemand,
  getZoneTypeDefaults,
} from '../data/dockDemandData';

interface DockEditModalProps {
  zone: DockDemandZone | null;
  onClose: () => void;
  onSave: (updated: DockDemandZone) => void;
}

export const DockEditModal: React.FC<DockEditModalProps> = ({
  zone,
  onClose,
  onSave,
}) => {
  const { language } = useWaterStore();
  const t = translations[language];

  if (!zone) return null;

  // Local state for live recalculation
  const [population, setPopulation] = useState<number>(zone.population);
  const [lpcd, setLpcd] = useState<number>(zone.lpcd);
  const [lossFactor, setLossFactor] = useState<number>(zone.loss_factor);
  const [zoneType, setZoneType] = useState<DockZoneType>(zone.zone_type);
  const [cMultiplier, setCMultiplier] = useState<number>(zone.c);

  // When zoneType changes, update default c range
  const handleZoneTypeChange = (newType: DockZoneType) => {
    setZoneType(newType);
    const defaults = getZoneTypeDefaults(newType);
    setCMultiplier(defaults.defaultC);
  };

  // Recalculate live
  const domesticDemand = calculateDomesticDemand(
    Math.max(0, population || 0),
    Math.max(0, lpcd || 0),
    Math.max(0.5, lossFactor || 1)
  );
  const commercialDemand = calculateCommercialDemand(domesticDemand, Math.max(0, cMultiplier || 0));
  const totalDemand = calculateTotalDemand(domesticDemand, commercialDemand);

  const typeMeta = getZoneTypeDefaults(zoneType);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedZone: DockDemandZone = {
      ...zone,
      population: Math.max(0, population),
      lpcd: Math.max(0, lpcd),
      loss_factor: Math.round(lossFactor * 100) / 100,
      zone_type: zoneType,
      c: Math.round(cMultiplier * 100) / 100,
      domestic_demand_m3_day: Math.round(domesticDemand * 100) / 100,
      commercial_demand_m3_day: Math.round(commercialDemand * 100) / 100,
      total_demand_m3_day: Math.round(totalDemand * 100) / 100,
    };
    onSave(updatedZone);
    onClose();
  };

  const handleResetToInitial = () => {
    setPopulation(zone.population);
    setLpcd(zone.lpcd);
    setLossFactor(zone.loss_factor);
    setZoneType(zone.zone_type);
    setCMultiplier(zone.c);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0A4D8C] text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/20 text-blue-100">
              {zone.city} • ID: {zone.id}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              {language === 'hi' ? `${zone.zone_hi} के मान संपादित करें` : `Edit Values: ${zone.zone}`}
            </h2>
            <p className="text-xs text-blue-200">
              {language === 'hi'
                ? 'पैरामीटर समायोजित करें — घरेलू एवं वाणिज्यिक मांग तुरंत पुनः परिकलित होगी'
                : 'Adjust parameters — Domestic and commercial demand recalculate live'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            aria-label={t.cancelBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Population Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.colPopulation}
              </label>
              <input
                type="number"
                min="1000"
                max="5000000"
                step="500"
                value={population}
                onChange={(e) => setPopulation(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0A4D8C] focus:outline-none"
                required
              />
              <span className="text-[11px] text-slate-500">Human census count in zone</span>
            </div>

            {/* LPCD Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                LPCD (Litres/Capita/Day)
              </label>
              <input
                type="number"
                min="50"
                max="300"
                step="1"
                value={lpcd}
                onChange={(e) => setLpcd(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0A4D8C] focus:outline-none"
                required
              />
              <span className="text-[11px] text-slate-500">Domestic standard norm (typically 135)</span>
            </div>

            {/* Loss Factor Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.colLossFactor} (1.10 – 1.50)
              </label>
              <input
                type="number"
                min="1.0"
                max="2.0"
                step="0.01"
                value={lossFactor}
                onChange={(e) => setLossFactor(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0A4D8C] focus:outline-none"
                required
              />
              <span className="text-[11px] text-slate-500">Sent water − billed (average 1.20)</span>
            </div>

            {/* Zone Type Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.zoneTypeFilterLabel}
              </label>
              <select
                value={zoneType}
                onChange={(e) => handleZoneTypeChange(e.target.value as DockZoneType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0A4D8C] focus:outline-none bg-white"
              >
                <option value="Highly Residential">Highly Residential (c: 0.10–0.15)</option>
                <option value="Mixed">Mixed (Com + Res) (c: 0.25–0.40)</option>
                <option value="Fully Commercial">Fully Commercial (c: ≥ 0.50)</option>
              </select>
              <span className="text-[11px] text-slate-500">Auto-sets recommended multiplier c</span>
            </div>
          </div>

          {/* Multiplier c Fine-Tuning */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#0A4D8C]" />
                  Commercial Multiplier (c):
                </span>
                <p className="text-[11px] text-slate-500">
                  Recommended range: {typeMeta.minC.toFixed(2)} to {typeMeta.maxC.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0.05"
                  max="1.50"
                  step="0.01"
                  value={cMultiplier}
                  onChange={(e) => setCMultiplier(Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-center text-sm bg-white"
                />
              </div>
            </div>

            <input
              type="range"
              min={typeMeta.minC}
              max={typeMeta.maxC}
              step="0.01"
              value={cMultiplier}
              onChange={(e) => setCMultiplier(Number(e.target.value))}
              className="w-full accent-[#0A4D8C] cursor-pointer"
            />
          </div>

          {/* LIVE RECALCULATED PREVIEW */}
          <div className="p-4 rounded-xl border-2 border-dashed border-[#0A4D8C]/50 bg-blue-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0A4D8C] flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5" />
                Live Recalculation Preview
              </span>
              <span className="text-[11px] text-slate-500">Real-Time Reactive</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Domestic</span>
                <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                  {domesticDemand.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </p>
                <span className="text-[9px] text-slate-400">m³/day</span>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Commercial (×{cMultiplier.toFixed(2)})</span>
                <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                  {commercialDemand.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </p>
                <span className="text-[9px] text-slate-400">m³/day</span>
              </div>

              <div className="p-2 bg-white rounded-lg border-2 border-[#0A4D8C] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#0A4D8C]">Total Demand</span>
                <p className="text-base font-black text-[#0A4D8C] font-mono mt-0.5">
                  {totalDemand.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </p>
                <span className="text-[9px] text-slate-500">m³/day</span>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToInitial}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Values</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-[#0A4D8C] hover:bg-[#083866] text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveBtn}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
