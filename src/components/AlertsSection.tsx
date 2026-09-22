import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Droplets,
  Eye,
  Sliders,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useWaterStore } from '../store/useWaterStore';
import { translations } from '../translations';
import { AlertItem, AlertSeverity } from '../types';

export const AlertsSection: React.FC = () => {
  const {
    language,
    alerts,
    dismissAlert,
    zones,
    selectZone,
    setActiveModal,
  } = useWaterStore();
  const t = translations[language];

  const [expanded, setExpanded] = useState(false);

  // Filter out dismissed alerts
  const activeAlerts = alerts.filter((a) => !a.dismissed);

  // Sort by severity: red first, then amber, then blue
  const severityWeight: Record<AlertSeverity, number> = {
    red: 1,
    amber: 2,
    blue: 3,
  };

  const sortedAlerts = [...activeAlerts].sort(
    (a, b) => severityWeight[a.severity] - severityWeight[b.severity]
  );

  const displayedAlerts = expanded ? sortedAlerts : sortedAlerts.slice(0, 5);

  const handleAlertAction = (alert: AlertItem) => {
    const targetZone = zones.find((z) => z.id === alert.zone_id) || zones[0];
    selectZone(targetZone, false);

    switch (alert.action_type) {
      case 'allocate_water':
        setActiveModal('allocate');
        break;
      case 'view_details':
        setActiveModal('bottomSheet');
        break;
      case 'view_source':
        setActiveModal('bottomSheet');
        break;
      case 'plan_now':
        setActiveModal('whatIf');
        break;
      default:
        setActiveModal('bottomSheet');
    }
  };

  const getAlertStyles = (severity: AlertSeverity) => {
    switch (severity) {
      case 'red':
        return {
          border: 'border-l-4 border-l-[#EF4444]',
          bg: 'bg-red-50/90',
          text: 'text-red-950',
          badgeBg: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertCircle className="w-6 h-6 text-[#EF4444] flex-shrink-0" aria-label="Deficit Alert" />,
          btn: 'bg-[#EF4444] hover:bg-[#DC2626] text-white focus:ring-red-400',
        };
      case 'amber':
        return {
          border: 'border-l-4 border-l-[#F59E0B]',
          bg: 'bg-amber-50/90',
          text: 'text-amber-950',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <AlertTriangle className="w-6 h-6 text-[#F59E0B] flex-shrink-0" aria-label="Scarcity Warning" />,
          btn: 'bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 font-semibold focus:ring-amber-400',
        };
      case 'blue':
        return {
          border: 'border-l-4 border-l-[#0A4D8C]',
          bg: 'bg-blue-50/90',
          text: 'text-blue-950',
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Info className="w-6 h-6 text-[#0A4D8C] flex-shrink-0" aria-label="Reallocation Notice" />,
          btn: 'bg-[#0A4D8C] hover:bg-[#083866] text-white focus:ring-blue-400',
        };
    }
  };

  const getActionIcon = (type: AlertItem['action_type']) => {
    switch (type) {
      case 'allocate_water':
        return <Droplets className="w-4 h-4 mr-1.5" />;
      case 'view_details':
        return <Eye className="w-4 h-4 mr-1.5" />;
      case 'view_source':
        return <Sliders className="w-4 h-4 mr-1.5" />;
      case 'plan_now':
        return <Calendar className="w-4 h-4 mr-1.5" />;
    }
  };

  return (
    <section id="alerts-section" className="w-full pt-4 pb-2" aria-label="Critical Alerts">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#1E293B] tracking-tight flex items-center gap-2">
              <span>{t.alertsSectionTitle}</span>
              {sortedAlerts.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold border border-red-200">
                  {sortedAlerts.length}
                </span>
              )}
            </h2>
          </div>
          {sortedAlerts.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs sm:text-sm font-semibold text-[#0A4D8C] hover:underline flex items-center gap-1 focus:outline-none"
            >
              {expanded ? (
                <>
                  <span>{t.collapseAlerts}</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>{t.viewAllAlerts} ({sortedAlerts.length})</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {/* If no alerts, show green banner */}
        {sortedAlerts.length === 0 ? (
          <div
            id="all-zones-normal-banner"
            className="flex items-center gap-3 p-4 bg-emerald-50 border-l-4 border-l-[#22C55E] rounded-md shadow-xs text-emerald-900"
          >
            <CheckCircle2 className="w-6 h-6 text-[#22C55E] flex-shrink-0" />
            <div className="flex-1 text-sm sm:text-base font-semibold">
              🟢 {t.allNormalBanner}
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedAlerts.map((alert) => {
              const styles = getAlertStyles(alert.severity);
              const messageText = language === 'hi' ? alert.message_hi : alert.message;
              const actionLabel = language === 'hi' ? alert.action_label_hi : alert.action_label;

              return (
                <div
                  key={alert.id}
                  id={`alert-card-${alert.id}`}
                  className={`w-full ${styles.border} ${styles.bg} rounded-r-lg p-3 sm:p-4 shadow-xs relative transition-all duration-200 hover:shadow-sm`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6 sm:pr-8">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{styles.icon}</div>
                      <div>
                        <p className={`text-base font-medium leading-snug ${styles.text}`}>
                          {messageText}
                        </p>
                        <span className="text-xs text-slate-500 font-normal mt-0.5 inline-block">
                          {alert.created_at}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <button
                        onClick={() => handleAlertAction(alert)}
                        className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 min-h-[44px] touch-manipulation cursor-pointer ${styles.btn}`}
                        aria-label={`${actionLabel} for alert`}
                      >
                        {getActionIcon(alert.action_type)}
                        <span>{actionLabel}</span>
                      </button>
                    </div>
                  </div>

                  {/* Dismiss Button */}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors focus:outline-none"
                    aria-label={`${t.dismissAlert} alert`}
                    title={t.dismissAlert}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
