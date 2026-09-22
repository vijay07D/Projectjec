import React, { useState, useEffect } from 'react';
import { Droplets, X, Check, Calculator, AlertCircle, Building2, Sliders } from 'lucide-react';
import { useWaterStore } from '../store/useWaterStore';
import { translations } from '../translations';

export const WaterAllocationModal: React.FC = () => {
  const {
    language,
    selectedZoneForDetail,
    metrics,
    allocateWater,
    setActiveModal,
  } = useWaterStore();
  const t = translations[language];

  if (!selectedZoneForDetail) return null;

  const zone = selectedZoneForDetail;
  const metric = metrics[zone.id];

  const [lpc, setLpc] = useState<number>(zone.lpc);
  const [lossFactor, setLossFactor] = useState<number>(zone.loss_factor);
  const [extraFlow, setExtraFlow] = useState<number>(0);
  const [feederSource, setFeederSource] = useState('Narmada Feeder Grid #4');
  const [officerName, setOfficerName] = useState('Er. Vijay Sharma (Executive Engineer)');
  const [notes, setNotes] = useState('Hydraulic flow rebalancing under DOCS grid protocol');

  // Reset inputs when selected zone changes
  useEffect(() => {
    setLpc(zone.lpc);
    setLossFactor(zone.loss_factor);
  }, [zone.id, zone.lpc, zone.loss_factor]);

  // Compute live supply based on formula: (Population * LPC * Loss Factor) / 1000
  const computedSupply = Math.round(((zone.population * lpc * lossFactor) / 1000 + extraFlow) * 100) / 100;
  const demand = metric?.demand_m3_day || 15000;
  const netDiff = Math.round((computedSupply - demand) * 100) / 100;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    allocateWater({
      zone_id: zone.id,
      allocated_m3_day: extraFlow,
      updated_lpc: lpc,
      updated_loss_factor: lossFactor,
      source_feeder_id: feederSource,
      allocated_by: officerName,
      notes,
    });
  };

  return (
    <div
      id="water-allocation-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.allocateTitle}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0A4D8C] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-[#00B4D8]" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {t.allocateTitle}
              </h2>
              <span className="text-xs text-blue-200">
                Formula: Supply = (Pop × LPC × Loss) / 1000
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('bottomSheet')}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors focus:outline-none cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-4 sm:p-6 space-y-4">
          {/* Target Zone Banner */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-2.5">
            <Building2 className="w-5 h-5 text-[#0A4D8C] mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="text-sm font-bold text-[#0A4D8C]">
                {language === 'hi' ? zone.name_hi : zone.name} ({language === 'hi' ? zone.city_hi : zone.city})
              </p>
              <p className="text-slate-600 mt-0.5">
                Population: <span className="font-bold text-slate-900">{zone.population.toLocaleString()}</span> • Daily Demand: <span className="font-bold text-slate-900">{demand.toLocaleString()} m³/day</span>
              </p>
            </div>
          </div>

          {/* Formula Parameters Tuning: LPC & Loss Factor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="lpc-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.lpcAdjustment}
              </label>
              <div className="relative">
                <input
                  id="lpc-input"
                  type="number"
                  min="100"
                  max="220"
                  step="1"
                  value={lpc}
                  onChange={(e) => setLpc(Number(e.target.value))}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#0A4D8C]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">LPC</span>
              </div>
            </div>

            <div>
              <label htmlFor="loss-factor-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.lossAdjustment}
              </label>
              <input
                id="loss-factor-input"
                type="number"
                min="1.00"
                max="1.50"
                step="0.01"
                value={lossFactor}
                onChange={(e) => setLossFactor(Number(e.target.value))}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#0A4D8C]"
              />
            </div>
          </div>

          {/* Additional Flow Allocation (m³/day) */}
          <div>
            <label htmlFor="extra-flow-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t.allocateAmount}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setExtraFlow(amt)}
                  className={`py-1.5 px-2 rounded-md border text-xs font-bold transition-all cursor-pointer ${
                    extraFlow === amt
                      ? 'bg-[#0A4D8C] text-white border-[#0A4D8C]'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  +{amt} m³
                </button>
              ))}
            </div>
          </div>

          {/* Live Formula Preview Box */}
          <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Formula Calculated Supply:</span>
              <span className="text-sm font-black text-[#0A4D8C]">
                {computedSupply.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³/day
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>({zone.population.toLocaleString()} × {lpc} × {lossFactor.toFixed(2)}) / 1000 {extraFlow > 0 ? `+ ${extraFlow}` : ''}</span>
              <span className={`font-bold ${netDiff >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {netDiff >= 0 ? `Surplus: +${netDiff} m³` : `Deficit: ${netDiff} m³`}
              </span>
            </div>
          </div>

          {/* Feeder Source Selector */}
          <div>
            <label htmlFor="feeder-select" className="block text-xs font-bold text-slate-700 mb-1">
              {t.feederSource}
            </label>
            <select
              id="feeder-select"
              value={feederSource}
              onChange={(e) => setFeederSource(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A4D8C]"
            >
              <option value="Narmada Main Trunk Feeder #1">Narmada Main Trunk Feeder #1</option>
              <option value="Yashwant Sagar Treatment Works">Yashwant Sagar Treatment Works</option>
              <option value="Gambhir Dam Filtration Grid">Gambhir Dam Filtration Grid (Ujjain)</option>
              <option value="Kshipra River Intake Booster #1">Kshipra River Intake Booster #1 (Dewas)</option>
            </select>
          </div>

          {/* Officer & Order Notes */}
          <div>
            <label htmlFor="officer-notes-input" className="block text-xs font-bold text-slate-700 mb-1">
              {t.allocationNotes}
            </label>
            <input
              id="officer-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A4D8C]"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal('bottomSheet')}
              className="flex-1 py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-colors cursor-pointer min-h-[44px]"
            >
              {t.close}
            </button>
            <button
              id="confirm-allocation-btn"
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#0A4D8C] hover:bg-[#083866] text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Check className="w-4 h-4" />
              <span>{t.confirmAllocation}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
