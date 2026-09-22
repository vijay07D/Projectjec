import React from 'react';
import { Header } from './components/Header';
import { AlertsSection } from './components/AlertsSection';
import { SearchBar } from './components/SearchBar';
import { WaterHeatmap } from './components/WaterHeatmap';
import { MetricsPanel } from './components/MetricsPanel';
import { PriorityRanking } from './components/PriorityRanking';
import { AllocationGridPage } from './pages/AllocationGridPage';
import { SourcesPage } from './pages/SourcesPage';
import { DemandCalculatorPage } from './pages/DemandCalculatorPage';
import { ZoneBottomSheet } from './components/ZoneBottomSheet';
import { WaterAllocationModal } from './components/WaterAllocationModal';
import { WhatIfSimulatorModal } from './components/WhatIfSimulatorModal';
import { HistoryModal } from './components/HistoryModal';
import { OfficerProfileModal } from './components/OfficerProfileModal';
import { useWaterStore } from './store/useWaterStore';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  const {
    activeModal,
    successNotification,
    clearNotification,
    currentPage,
  } = useWaterStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#1E293B] font-sans">
      {/* Toast Notification for Real-Time Actions */}
      {successNotification && (
        <div className="fixed top-16 right-4 z-50 max-w-md bg-emerald-700 text-white px-4 py-3 rounded-lg shadow-xl border border-emerald-500 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 flex-shrink-0" />
            <span>{successNotification}</span>
          </div>
          <button
            onClick={clearNotification}
            className="p-1 rounded hover:bg-white/20 text-white focus:outline-none cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER: Brand (DOCK), Top Navigation Bar & Mobile Hamburger Menu */}
      <Header />

      {/* MAIN CONTAINER: ROUTE-BASED MULTI-PAGE VIEWS */}
      <main className="flex-1 w-full flex flex-col">
        {/* 1. DASHBOARD VIEW: ALERTS, SEARCH, HEATMAP, METRICS, PRIORITY RANKING */}
        {currentPage === 'dashboard' && (
          <div className="flex flex-col space-y-2">
            {/* SECTION 1: ALERTS (FIRST) */}
            <AlertsSection />

            {/* SECTION 2: SEARCH BAR */}
            <SearchBar />

            {/* SECTION 3: HEATMAP (3 CITIES, 17 ZONES) */}
            <WaterHeatmap />

            {/* SECTION 4: METRICS PANEL (4 STAT CARDS + DISTRICT TOTALS) */}
            <MetricsPanel />

            {/* SECTION 5: PRIORITY RANKING (RANKED ZONES WITH ALLOCATE ACTION) */}
            <PriorityRanking />
          </div>
        )}

        {/* 2. FIND SUPPLY (SOURCES) VIEW: NATURAL & MAN-MADE SUPPLY PLANTS */}
        {currentPage === 'find-supply' && <SourcesPage />}

        {/* 3. DOCK DEMAND CALCULATOR VIEW: 10-COLUMN DOMESTIC + COMMERCIAL TABLE */}
        {currentPage === 'dock' && <DemandCalculatorPage />}

        {/* 4. MAP VIEW: FOCUSED HYDRAULIC DISTRIBUTION HEATMAP & LAYERS */}
        {currentPage === 'map' && (
          <div className="flex flex-col space-y-3 p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <SearchBar />
            <WaterHeatmap />
            <MetricsPanel />
          </div>
        )}

        {/* 5. ALLOCATION GRID VIEW: HYDRAULIC ALLOCATION FORMULA (DOCS) */}
        {currentPage === 'allocation-grid' && <AllocationGridPage />}
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>
            © 2026 DOCK — Domestic + Commercial Water Distribution Optimizer.
          </p>
          <div className="flex items-center gap-3">
            <span>Chennai, Guduvancherry, Tambaram</span>
            <span>•</span>
            <span>Formulas: Domestic = (Pop × LPCD × Loss)/1000 | Commercial = Domestic × c</span>
          </div>
        </div>
      </footer>

      {/* INTERACTIVE ACTION BOTTOM SHEETS & MODALS */}
      {activeModal === 'bottomSheet' && <ZoneBottomSheet />}
      {activeModal === 'allocate' && <WaterAllocationModal />}
      {activeModal === 'whatIf' && <WhatIfSimulatorModal />}
      {activeModal === 'history' && <HistoryModal />}
      {activeModal === 'profile' && <OfficerProfileModal />}
    </div>
  );
}
