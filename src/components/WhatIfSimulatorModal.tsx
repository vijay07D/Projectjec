import React, { useState } from 'react';
import { Sliders, X, AlertTriangle, CheckCircle, Info, ArrowRight, Droplets } from 'lucide-react';
import { useWaterStore } from '../store/useWaterStore';
import { translations } from '../translations';

export const WhatIfSimulatorModal: React.FC = () => {
  const {
    language,
    zones,
    metrics,
    selectedZoneForDetail,
    reallocateWater,
    setActiveModal,
    surplusReallocationWarning,
    clearWarning,
  } = useWaterStore();
  const t = translations[language];

  // Target zone default
  const [targetZoneId, setTargetZoneId] = useState<string>(
    selectedZoneForDetail?.id || zones[0]?.id || 'zone-5'
  );

  // Find surplus zones to use as candidate sources
  const surplusZones = zones.filter((z) => {
    const m = metrics[z.id];
    return m && m.surplus_m3_day > 0;
  });

  const [sourceZoneId, setSourceZoneId] = useState<string>(
    surplusZones[0]?.id || 'zone-3'
  );

  const [transferVolume, setTransferVolume] = useState<number>(40);
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const targetZone = zones.find((z) => z.id === targetZoneId);
  const sourceZone = zones.find((z) => z.id === sourceZoneId);
  const targetMetric = metrics[targetZoneId];
  const sourceMetric = metrics[sourceZoneId];

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    clearWarning();

    const result = reallocateWater({
      source_zone_id: sourceZoneId,
      target_zone_id: targetZoneId,
      transfer_m3_day: transferVolume,
    });

    setSimulationResult(result);
  };

  return (
    <div
      id="what-if-simulator-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.whatIfTitle}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0A4D8C] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#00B4D8]" />
            <h2 className="text-base sm:text-lg font-bold">
              {t.whatIfTitle}
            </h2>
          </div>
          <button
            onClick={() => {
              clearWarning();
              setActiveModal('bottomSheet');
            }}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors focus:outline-none"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner if Surplus Allocation Attempted (RULE #3) */}
        {surplusReallocationWarning && (
          <div className="p-4 bg-blue-50 border-l-4 border-l-[#0A4D8C] text-blue-900 flex items-start gap-2.5">
            <Info className="w-5 h-5 text-[#0A4D8C] flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm font-semibold">
              {surplusReallocationWarning}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSimulate} className="p-4 sm:p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Simulate valve modulation and hydraulic feeder redirection from surplus reservoirs to deficit wards.
          </p>

          {/* Source Zone Selector */}
          <div>
            <label htmlFor="source-zone-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t.selectSourceZone}
            </label>
            <select
              id="source-zone-select"
              value={sourceZoneId}
              onChange={(e) => setSourceZoneId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A4D8C]"
            >
              {surplusZones.map((z) => {
                const m = metrics[z.id];
                return (
                  <option key={z.id} value={z.id}>
                    {language === 'hi' ? z.name_hi : z.name} (Surplus: +{m?.surplus_m3_day || 0} m³/day)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Target Zone Selector */}
          <div>
            <label htmlFor="target-zone-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Hydraulic Zone
            </label>
            <select
              id="target-zone-select"
              value={targetZoneId}
              onChange={(e) => {
                setTargetZoneId(e.target.value);
                clearWarning();
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A4D8C]"
            >
              {zones.map((z) => {
                const m = metrics[z.id];
                const statusStr =
                  m?.status === 'deficit'
                    ? `🔴 Deficit: ${m.deficit_m3_day} m³`
                    : m?.status === 'tight'
                    ? `🟡 Tight: ${m?.deficit_m3_day || 0} m³`
                    : `🟢 Surplus: +${m?.surplus_m3_day || 0} m³`;
                return (
                  <option key={z.id} value={z.id}>
                    {language === 'hi' ? z.name_hi : z.name} — [{statusStr}]
                  </option>
                );
              })}
            </select>
          </div>

          {/* Transfer Flow Volume Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="transfer-volume-range" className="text-xs font-bold text-slate-700">
                {t.transferAmount}
              </label>
              <span className="text-sm font-bold text-[#0A4D8C]">
                {transferVolume} m³/day ({(transferVolume * 1000).toLocaleString()} L/day)
              </span>
            </div>
            <input
              id="transfer-volume-range"
              type="range"
              min="10"
              max={Math.min(120, sourceMetric?.surplus_m3_day || 100)}
              step="5"
              value={transferVolume}
              onChange={(e) => setTransferVolume(Number(e.target.value))}
              className="w-full accent-[#0A4D8C] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>10 m³</span>
              <span>Max Safe: {sourceMetric?.surplus_m3_day || 60} m³</span>
            </div>
          </div>

          {/* Flow Preview Card */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <div className="text-left">
              <span className="text-slate-500 block">Source Surplus</span>
              <span className="font-bold text-emerald-700">
                {sourceMetric?.surplus_m3_day || 0} → {Math.max(0, (sourceMetric?.surplus_m3_day || 0) - transferVolume)} m³
              </span>
            </div>
            <div className="p-2 rounded-full bg-blue-100 text-[#0A4D8C]">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Target Balance</span>
              <span className="font-bold text-slate-800">
                {targetMetric?.status === 'deficit'
                  ? `Deficit -${targetMetric.deficit_m3_day} → -${Math.max(0, targetMetric.deficit_m3_day - transferVolume)} m³`
                  : `Surplus +${targetMetric?.surplus_m3_day || 0} m³`}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                clearWarning();
                setActiveModal('bottomSheet');
              }}
              className="flex-1 py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-colors cursor-pointer min-h-[44px]"
            >
              {t.close}
            </button>
            <button
              id="execute-reallocation-btn"
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#0A4D8C] hover:bg-[#083866] text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Droplets className="w-4 h-4" />
              <span>{t.simulateTransfer}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
