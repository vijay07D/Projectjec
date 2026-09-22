import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { History, X, Calendar, TrendingUp } from 'lucide-react';
import { useWaterStore } from '../store/useWaterStore';
import { translations } from '../translations';

export const HistoryModal: React.FC = () => {
  const {
    language,
    selectedZoneForDetail,
    metrics,
    setActiveModal,
  } = useWaterStore();
  const t = translations[language];

  if (!selectedZoneForDetail) return null;

  const zone = selectedZoneForDetail;
  const metric = metrics[zone.id];
  const baseDemand = metric?.demand_m3_day || 350;
  const baseSupply = metric?.supply_m3_day || 280;

  // Generate 7-day past history + 7-day projection
  const historyData = [
    { day: 'Day -6', demand: Math.round(baseDemand * 0.96), supply: Math.round(baseSupply * 0.94), type: 'Actual' },
    { day: 'Day -5', demand: Math.round(baseDemand * 0.98), supply: Math.round(baseSupply * 0.97), type: 'Actual' },
    { day: 'Day -4', demand: Math.round(baseDemand * 0.99), supply: Math.round(baseSupply * 0.95), type: 'Actual' },
    { day: 'Day -3', demand: Math.round(baseDemand * 1.01), supply: Math.round(baseSupply * 0.98), type: 'Actual' },
    { day: 'Day -2', demand: Math.round(baseDemand * 1.02), supply: Math.round(baseSupply * 0.99), type: 'Actual' },
    { day: 'Day -1', demand: Math.round(baseDemand * 1.01), supply: Math.round(baseSupply * 1.0), type: 'Actual' },
    { day: 'Today', demand: baseDemand, supply: baseSupply, type: 'Today' },
    { day: '+1 Day', demand: Math.round(baseDemand * 1.03), supply: Math.round(baseSupply * 1.01), type: 'Projected' },
    { day: '+2 Day', demand: Math.round(baseDemand * 1.05), supply: Math.round(baseSupply * 1.02), type: 'Projected' },
    { day: '+3 Day', demand: Math.round(baseDemand * 1.08), supply: Math.round(baseSupply * 0.95), type: 'Projected' },
    { day: '+4 Day', demand: Math.round(baseDemand * 1.10), supply: Math.round(baseSupply * 0.96), type: 'Projected' },
    { day: '+5 Day', demand: Math.round(baseDemand * 1.12), supply: Math.round(baseSupply * 0.97), type: 'Projected' },
    { day: '+6 Day', demand: Math.round(baseDemand * 1.15), supply: Math.round(baseSupply * 0.98), type: 'Projected' },
    { day: '+7 Day', demand: Math.round(baseDemand * 1.18), supply: Math.round(baseSupply * 0.98), type: 'Projected' },
  ];

  return (
    <div
      id="history-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.historyTitle}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0A4D8C] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#00B4D8]" />
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                {t.historyTitle}
              </h2>
              <p className="text-xs text-blue-200">
                {language === 'hi' ? zone.name_hi : zone.name}
              </p>
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

        {/* Content & Chart */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
            <span>{t.historyDesc}</span>
            <span className="font-semibold text-[#0A4D8C]">Units: m³/day</span>
          </div>

          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00B4D8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="demand"
                  name="Water Demand (m³/day)"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#demandGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="supply"
                  name="Actual/Scheduled Supply (m³/day)"
                  stroke="#0A4D8C"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#supplyGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4 text-[#0A4D8C]" />
              7-Day Predictive Deficit Risk:
            </span>
            <span className="font-bold text-red-700">
              {metric?.status === 'deficit' ? 'HIGH DEFICIT (Tanker Required)' : 'MODERATE (Adequate Reservoir)'}
            </span>
          </div>

          <button
            onClick={() => setActiveModal('bottomSheet')}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer min-h-[44px]"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
