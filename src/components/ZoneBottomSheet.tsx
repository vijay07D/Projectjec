import React from 'react';
import {
  X,
  Droplets,
  Sliders,
  History,
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Activity,
  Layers,
  Calculator,
} from 'lucide-react';
import { useWaterStore } from '../store/useWaterStore';
import { translations } from '../translations';

export const ZoneBottomSheet: React.FC = () => {
  const {
    language,
    selectedZoneForDetail,
    metrics,
    sources,
    selectZone,
    setActiveModal,
  } = useWaterStore();
  const t = translations[language];

  if (!selectedZoneForDetail) return null;

  const zone = selectedZoneForDetail;
  const metric = metrics[zone.id];
  const zoneSources = sources.filter((s) => s.zone_id === zone.id);
  const zoneName = language === 'hi' ? zone.name_hi : zone.name;
  const cityName = language === 'hi' ? zone.city_hi : zone.city;

  const isDeficit = metric && metric.status === 'deficit';
  const isTight = metric && metric.status === 'tight';

  return (
    <div
      id="zone-detail-bottom-sheet"
      className="fixed inset-x-0 bottom-0 z-40 bg-white rounded-t-2xl shadow-2xl border-t border-slate-200 max-h-[85vh] overflow-y-auto transform transition-transform duration-300 ease-in-out"
      role="dialog"
      aria-modal="true"
      aria-label={t.zoneDetailTitle}
    >
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Drag handle / top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0A4D8C] text-white flex items-center justify-center font-bold">
              W{zone.ward_number}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1E293B] leading-tight">
                {zoneName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-[#0A4D8C]" />
                  {cityName}
                </span>
                <span>•</span>
                <span className="capitalize">{zone.type}</span>
                {zone.critical_infra && (
                  <>
                    <span>•</span>
                    <span className="text-blue-700 font-medium">
                      {language === 'hi' ? zone.critical_infra_desc_hi : zone.critical_infra_desc}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => selectZone(null, false)}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Primary Hydraulic Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">{t.populationLabel}</span>
            <span className="text-lg font-bold text-slate-800 mt-0.5 block flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              {zone.population.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block">
              {zone.urban_density.toLocaleString()} {t.perSqKm}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">{t.demandLabel}</span>
            <span className="text-lg font-bold text-slate-800 mt-0.5 block">
              {metric ? metric.demand_m3_day : 0} m³/day
            </span>
            <span className="text-[11px] text-slate-400 block">Required flow</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">{t.supplyLabel}</span>
            <span className="text-lg font-bold text-[#0A4D8C] mt-0.5 block">
              {metric ? metric.supply_m3_day : 0} m³/day
            </span>
            <span className="text-[11px] font-semibold text-blue-600 block">
              {metric ? `${metric.supply_met_percent}% Met` : ''}
            </span>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              isDeficit
                ? 'bg-red-50 border-red-200 text-red-900'
                : isTight
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <span className="text-xs font-medium block">{t.netBalanceLabel}</span>
            <span className="text-lg font-bold mt-0.5 block flex items-center gap-1">
              {isDeficit ? (
                <>
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  - {metric.deficit_m3_day} m³
                </>
              ) : isTight ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  - {metric?.deficit_m3_day || 0} m³
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  + {metric?.surplus_m3_day || 0} m³
                </>
              )}
            </span>
            <span className="text-[11px] font-bold block uppercase tracking-wider">
              {isDeficit ? t.deficit : isTight ? t.tight : t.surplus}
            </span>
          </div>
        </div>

        {/* Formula breakdown card */}
        <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#0A4D8C]" />
            <div>
              <p className="font-bold text-[#0A4D8C] text-sm">
                Supply = (Population × LPC × Loss Factor) / 1000
              </p>
              <p className="text-slate-600 mt-0.5 font-mono text-[11px]">
                ({zone.population.toLocaleString()} × {zone.lpc} LPC × {zone.loss_factor.toFixed(2)}) / 1000 = <span className="font-bold text-[#0A4D8C]">{zone.supply_m3_day.toLocaleString()} m³/day</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('allocate')}
            className="px-3 py-1.5 rounded-md bg-[#0A4D8C] hover:bg-[#083866] text-white font-semibold text-xs shadow-xs transition-colors self-start sm:self-center cursor-pointer"
          >
            Adjust Formula / Flow
          </button>
        </div>

        {/* Action Buttons: [Allocate Water] [What If?] [View History] */}
        {/* Quick Actions Row with Satellite Link */}
        <div className="flex flex-wrap gap-2.5 my-4 pb-4 border-b border-slate-200">
          <button
            id="bottom-sheet-allocate-water-btn"
            onClick={() => setActiveModal('allocate')}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A4D8C] hover:bg-[#083866] text-white rounded-lg font-semibold text-sm shadow-xs transition-colors min-h-[44px] touch-manipulation cursor-pointer"
          >
            <Droplets className="w-4 h-4 text-cyan-300" />
            <span>{t.allocateWaterBtn}</span>
          </button>

          <a
            href={`https://www.google.com/maps/@${zone.geometry.center[0]},${zone.geometry.center[1]},15z/data=!3m1!1e3`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded-lg font-semibold text-sm shadow-xs transition-colors min-h-[44px] touch-manipulation cursor-pointer"
          >
            <span>🛰️ Real Satellite ↗</span>
          </a>

          <button
            id="bottom-sheet-what-if-btn"
            onClick={() => setActiveModal('whatIf')}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-[#0A4D8C] border border-[#0A4D8C] rounded-lg font-semibold text-sm shadow-xs transition-colors min-h-[44px] touch-manipulation cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>{t.whatIfBtn}</span>
          </button>

          <button
            id="bottom-sheet-history-btn"
            onClick={() => setActiveModal('history')}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold text-sm shadow-xs transition-colors min-h-[44px] touch-manipulation cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span>{t.viewHistoryBtn}</span>
          </button>
        </div>

        {/* Sources List for This Zone */}
        <div className="mt-4">
          <h3 className="text-sm font-bold text-[#1E293B] mb-2 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#00B4D8]" />
            <span>{t.sourcesTitle} ({zoneSources.length})</span>
          </h3>

          {zoneSources.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
              Main Trunk Line distribution with local network feeder pumps.
            </p>
          ) : (
            <div className="space-y-2">
              {zoneSources.map((src) => (
                <div
                  key={src.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-blue-100 text-[#0A4D8C] flex items-center justify-center mt-0.5">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{src.name}</p>
                      <p className="text-slate-500 mt-0.5">{src.location} • Type: <span className="capitalize">{src.type}</span></p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-800 block">
                      {src.current_output_m3_day} / {src.capacity_m3_day} m³
                    </span>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                        src.status === 'operational'
                          ? 'bg-emerald-100 text-emerald-800'
                          : src.status === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {src.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
