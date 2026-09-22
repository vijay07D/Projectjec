import React from 'react';
import { User, X, Shield, Smartphone, Eye, Wifi, WifiOff, CheckCircle2 } from 'lucide-react';
import { useWaterStore } from '../store/useWaterStore';
import { translations } from '../translations';

export const OfficerProfileModal: React.FC = () => {
  const {
    language,
    isOffline,
    toggleOffline,
    lastUpdatedMinutesAgo,
    setActiveModal,
  } = useWaterStore();
  const t = translations[language];

  return (
    <div
      id="officer-profile-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Officer Profile & Settings"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0A4D8C] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#00B4D8]" />
            <h2 className="text-base sm:text-lg font-bold">
              {t.officerRole}
            </h2>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors focus:outline-none cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* User Profile Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-[#0A4D8C] text-white flex items-center justify-center font-bold text-lg">
              VS
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Er. Vijay Sharma</h3>
              <p className="text-xs text-slate-500 font-medium">
                {t.officerLocation}
              </p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Authorized Field Dispatcher
              </span>
            </div>
          </div>

          {/* Network & Offline Mode Settings */}
          <div className="p-3.5 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                {isOffline ? <WifiOff className="w-4 h-4 text-amber-500" /> : <Wifi className="w-4 h-4 text-emerald-500" />}
                Network Connectivity
              </span>
              <button
                onClick={toggleOffline}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  isOffline
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {isOffline ? t.offlineStatus : t.liveStatus}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {isOffline
                ? `Currently operating with local cached snapshot (${t.lastUpdated}: ${lastUpdatedMinutesAgo} ${t.minsAgo}). Actions will queue and sync when network returns.`
                : 'Connected to live IMC telemetry WebSocket. All flow sensor updates stream in real-time.'}
            </p>
          </div>

          {/* Accessibility & Color-blind safety info */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#00B4D8]" />
              Color-Blind Safe Compliance
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.colorBlindSafeNotice}
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-bold pt-1">
              <span className="p-1 rounded bg-red-100 text-red-800 border border-red-200">🔴 Deficit</span>
              <span className="p-1 rounded bg-amber-100 text-amber-800 border border-amber-200">🟡 Tight</span>
              <span className="p-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">🟢 Surplus</span>
            </div>
          </div>

          {/* ₹5,000 Phone Optimization notice */}
          <div className="flex items-start gap-2 text-xs text-slate-500 pt-1">
            <Smartphone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <span>
              Optimized for budget Android smartphones (2G/3G networks, 48px touch targets, low memory footprint).
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={() => setActiveModal('none')}
            className="w-full py-2.5 px-4 rounded-lg bg-[#0A4D8C] hover:bg-[#083866] text-white font-semibold text-sm transition-colors cursor-pointer min-h-[44px]"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
