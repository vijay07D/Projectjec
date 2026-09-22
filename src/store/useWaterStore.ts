import { create } from 'zustand';
import {
  Zone,
  WaterMetrics,
  WaterSource,
  AlertItem,
  PriorityScore,
  HeatmapLayerMode,
  ZoneStatus,
  WaterAllocationPayload,
  ReallocationPayload,
  PageId,
  DockDemandZone,
} from '../types';
import { initialZones, initialMetrics, initialSources, initialAlerts } from '../data/mockData';
import {
  initialDockZones,
  calculateDomesticDemand,
  calculateCommercialDemand,
  calculateTotalDemand,
} from '../data/dockDemandData';
import { Language } from '../translations';

export type StatusFilter = 'all' | 'deficit' | 'tight' | 'surplus';
export type TypeFilter = 'all' | 'urban' | 'rural' | 'industrial';
export type CityFilter = 'all' | 'Chennai' | 'Tambaram' | 'Guduvancherry' | 'Indore' | 'Ujjain' | 'Dewas';
export type SortOption = 'priority' | 'deficit' | 'population' | 'type';

interface WaterStoreState {
  language: Language;
  zones: Zone[];
  metrics: Record<string, WaterMetrics>;
  sources: WaterSource[];
  alerts: AlertItem[];
  priorityScores: Record<string, PriorityScore>;
  
  // Navigation page
  currentPage: PageId;

  // Layer & UI filters
  layerMode: HeatmapLayerMode;
  statusFilter: StatusFilter;
  typeFilter: TypeFilter;
  cityFilter: CityFilter;
  sortBy: SortOption;
  
  // Search state
  searchQuery: string;
  recentSearches: string[];
  focusedZoneId: string | null;
  
  // Modals & sheets
  selectedZoneForDetail: Zone | null;
  activeModal: 'none' | 'bottomSheet' | 'allocate' | 'whatIf' | 'history' | 'profile' | 'allAlerts';
  
  // Offline & sync
  isOffline: boolean;
  lastUpdatedMinutesAgo: number;
  surplusReallocationWarning: string | null;
  successNotification: string | null;

  // DOCK Demand Calculator state
  dockZones: DockDemandZone[];
  selectedDockZone: DockDemandZone | null;
  editingDockZone: DockDemandZone | null;

  // Actions
  setCurrentPage: (page: PageId) => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  setLayerMode: (mode: HeatmapLayerMode) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  setTypeFilter: (filter: TypeFilter) => void;
  setCityFilter: (city: CityFilter) => void;
  setSortBy: (sort: SortOption) => void;
  setSearchQuery: (query: string) => void;
  addRecentSearch: (term: string) => void;
  selectZone: (zone: Zone | null, openBottomSheet?: boolean) => void;
  focusZoneById: (zoneId: string) => void;
  setActiveModal: (modal: 'none' | 'bottomSheet' | 'allocate' | 'whatIf' | 'history' | 'profile' | 'allAlerts') => void;
  dismissAlert: (id: string) => void;
  addAlert: (alert: Omit<AlertItem, 'id' | 'created_at' | 'dismissed'>) => void;
  allocateWater: (payload: WaterAllocationPayload) => void;
  updateZoneFormula: (zoneId: string, lpc: number, lossFactor: number) => void;
  reallocateWater: (payload: ReallocationPayload) => { success: boolean; message: string };
  toggleOffline: () => void;
  clearNotification: () => void;
  clearWarning: () => void;

  // DOCK Demand Calculator actions
  setSelectedDockZone: (zone: DockDemandZone | null) => void;
  setEditingDockZone: (zone: DockDemandZone | null) => void;
  saveEditingDockZone: (updated: DockDemandZone) => void;
  resetDockZones: () => void;
}

// Calculate priority scores based on weights:
// score = (deficit_norm × 0.40) + (pop_norm × 0.25) + (urban_density_norm × 0.20) + (duration_norm × 0.10) + (infra_norm × 0.05)
function calculateAllPriorityScores(zones: Zone[], metrics: Record<string, WaterMetrics>): Record<string, PriorityScore> {
  const scores: Record<string, PriorityScore> = {};

  let maxDeficit = 1;
  let maxPop = 1;
  let maxDensity = 1;
  let maxDuration = 1;

  zones.forEach((z) => {
    const m = metrics[z.id];
    if (m && m.deficit_m3_day > maxDeficit) maxDeficit = m.deficit_m3_day;
    if (z.population > maxPop) maxPop = z.population;
    if (z.urban_density > maxDensity) maxDensity = z.urban_density;
    if (z.deficit_duration_days > maxDuration) maxDuration = z.deficit_duration_days;
  });

  zones.forEach((z) => {
    const m = metrics[z.id];
    const deficit = m ? m.deficit_m3_day : 0;
    
    // Normalized 0 to 100
    const deficitNorm = deficit > 0 ? (deficit / maxDeficit) * 100 : 0;
    const popNorm = (z.population / maxPop) * 100;
    const densityNorm = (z.urban_density / maxDensity) * 100;
    const durationNorm = z.deficit_duration_days > 0 ? (z.deficit_duration_days / maxDuration) * 100 : 0;
    const infraNorm = z.critical_infra ? 100 : 0;

    let computed =
      deficitNorm * 0.40 +
      popNorm * 0.25 +
      densityNorm * 0.20 +
      durationNorm * 0.10 +
      infraNorm * 0.05;

    // Deficit zones receive baseline urgency
    if (deficit > 0 && computed < 40) {
      computed = 40 + computed * 0.5;
    }

    const rounded = Math.min(100, Math.max(5, Math.round(computed)));

    scores[z.id] = {
      zone_id: z.id,
      score: rounded,
      deficit_weight: 0.4,
      population_weight: 0.25,
      urban_weight: 0.2,
      duration_weight: 0.1,
      infra_weight: 0.05,
      calculated_at: new Date().toISOString(),
    };
  });

  return scores;
}

export const useWaterStore = create<WaterStoreState>((set, get) => {
  const initialPriorityScores = calculateAllPriorityScores(initialZones, initialMetrics);

  return {
    language: 'en',
    zones: initialZones,
    metrics: initialMetrics,
    sources: initialSources,
    alerts: initialAlerts,
    priorityScores: initialPriorityScores,
    currentPage: 'dock',
    
    layerMode: 'combined',
    statusFilter: 'all',
    typeFilter: 'all',
    cityFilter: 'all',
    sortBy: 'priority',
    
    searchQuery: '',
    recentSearches: ['Indore — Zone 5 Khajrana', 'Ujjain — Mahakal Corridor', 'Dewas — Station Road'],
    focusedZoneId: null,
    
    selectedZoneForDetail: null,
    activeModal: 'none',
    
    isOffline: false,
    lastUpdatedMinutesAgo: 2,
    surplusReallocationWarning: null,
    successNotification: null,

    // DOCK Demand Calculator initial state
    dockZones: initialDockZones,
    selectedDockZone: null,
    editingDockZone: null,

    setCurrentPage: (currentPage) => set({ currentPage }),
    setLanguage: (language) => set({ language }),
    toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'hi' : 'en' })),

    setLayerMode: (layerMode) => set({ layerMode }),
    setStatusFilter: (statusFilter) => set({ statusFilter }),
    setTypeFilter: (typeFilter) => set({ typeFilter }),
    setCityFilter: (cityFilter) => set({ cityFilter }),
    setSortBy: (sortBy) => set({ sortBy }),

    setSearchQuery: (searchQuery) => set({ searchQuery }),
    addRecentSearch: (term) =>
      set((state) => {
        const filtered = state.recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase());
        return { recentSearches: [term, ...filtered].slice(0, 5) };
      }),

    selectZone: (zone, openBottomSheet = true) =>
      set({
        selectedZoneForDetail: zone,
        focusedZoneId: zone ? zone.id : null,
        activeModal: openBottomSheet && zone ? 'bottomSheet' : 'none',
      }),

    focusZoneById: (zoneId) => {
      const state = get();
      const match = state.zones.find((z) => z.id === zoneId);
      if (match) {
        set({
          focusedZoneId: zoneId,
          selectedZoneForDetail: match,
          activeModal: 'bottomSheet',
        });
      }
    },

    setActiveModal: (activeModal) => set({ activeModal }),

    dismissAlert: (id) =>
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? { ...a, dismissed: true } : a)),
      })),

    addAlert: (newAlert) =>
      set((state) => ({
        alerts: [
          {
            ...newAlert,
            id: `alert-${Date.now()}`,
            created_at: 'Just now',
            dismissed: false,
          },
          ...state.alerts,
        ],
      })),

    // Allocate water flow / adjust LPC & Loss Factor
    allocateWater: (payload: WaterAllocationPayload) => {
      const state = get();
      const currentMetric = state.metrics[payload.zone_id];
      const targetZone = state.zones.find((z) => z.id === payload.zone_id);
      if (!currentMetric || !targetZone) return;

      let newLpc = targetZone.lpc;
      let newLoss = targetZone.loss_factor;

      if (payload.updated_lpc) newLpc = payload.updated_lpc;
      if (payload.updated_loss_factor) newLoss = payload.updated_loss_factor;

      // Calculate new base supply from formula: (Pop * LPC * Loss) / 1000
      let computedSupply = (targetZone.population * newLpc * newLoss) / 1000;
      if (payload.allocated_m3_day) {
        computedSupply += payload.allocated_m3_day;
      }
      computedSupply = Math.round(computedSupply * 100) / 100;

      const demand = currentMetric.demand_m3_day;
      let newStatus: ZoneStatus = 'surplus';
      let newDeficit = 0;
      let newSurplus = 0;

      if (computedSupply < demand * 0.98) {
        newStatus = 'deficit';
        newDeficit = Math.round((demand - computedSupply) * 10) / 10;
      } else if (computedSupply < demand * 1.02) {
        newStatus = 'tight';
        newDeficit = Math.round(Math.max(0, demand - computedSupply) * 10) / 10;
      } else {
        newStatus = 'surplus';
        newSurplus = Math.round((computedSupply - demand) * 10) / 10;
      }

      const supplyMetPercent = Math.round((computedSupply / demand) * 100);

      // Update zone
      const updatedZones = state.zones.map((z) => {
        if (z.id === payload.zone_id) {
          return {
            ...z,
            lpc: newLpc,
            loss_factor: newLoss,
            supply_m3_day: computedSupply,
            deficit_duration_days: newDeficit === 0 ? 0 : z.deficit_duration_days,
          };
        }
        return z;
      });

      const updatedMetrics = {
        ...state.metrics,
        [payload.zone_id]: {
          ...currentMetric,
          supply_m3_day: computedSupply,
          deficit_m3_day: newDeficit,
          surplus_m3_day: newSurplus,
          supply_met_percent: supplyMetPercent,
          status: newStatus,
        },
      };

      // Add feeder allocation into sources
      const newSource: WaterSource = {
        id: `alloc-${Date.now()}`,
        zone_id: payload.zone_id,
        name: `Dedicated Feeder Allocation (${payload.source_feeder_id})`,
        type: 'pipeline',
        capacity_m3_day: computedSupply,
        current_output_m3_day: computedSupply,
        location: `Allocated by ${payload.allocated_by}`,
        status: 'operational',
      };

      // Auto dismiss deficit alert for this zone if deficit resolved
      const updatedAlerts = state.alerts.map((a) => {
        if (a.zone_id === payload.zone_id && a.type === 'deficit' && newDeficit === 0) {
          return { ...a, dismissed: true };
        }
        return a;
      });

      const updatedScores = calculateAllPriorityScores(updatedZones, updatedMetrics);
      const zoneName = state.language === 'hi' ? targetZone.name_hi : targetZone.name;

      set({
        zones: updatedZones,
        metrics: updatedMetrics,
        sources: [newSource, ...state.sources],
        alerts: updatedAlerts,
        priorityScores: updatedScores,
        selectedZoneForDetail: updatedZones.find((z) => z.id === payload.zone_id) || null,
        activeModal: 'bottomSheet',
        successNotification:
          state.language === 'hi'
            ? `${zoneName} को जल सफलतापूर्वक आवंटित किया गया! आपूर्ति अब ${computedSupply} m³/दिन है।`
            : `Water allocated to ${zoneName}! Supply updated to ${computedSupply.toLocaleString()} m³/day.`,
      });
    },

    // Direct formula parameters update: LPC and Loss Factor
    updateZoneFormula: (zoneId: string, lpc: number, lossFactor: number) => {
      const state = get();
      const zone = state.zones.find((z) => z.id === zoneId);
      const metric = state.metrics[zoneId];
      if (!zone || !metric) return;

      // Formula: Supply = (Population * LPC * Loss Factor) / 1000
      const newSupply = Math.round(((zone.population * lpc * lossFactor) / 1000) * 100) / 100;
      const demand = metric.demand_m3_day;

      let newStatus: ZoneStatus = 'surplus';
      let newDeficit = 0;
      let newSurplus = 0;

      if (newSupply < demand * 0.98) {
        newStatus = 'deficit';
        newDeficit = Math.round((demand - newSupply) * 10) / 10;
      } else if (newSupply < demand * 1.02) {
        newStatus = 'tight';
        newDeficit = Math.round(Math.max(0, demand - newSupply) * 10) / 10;
      } else {
        newStatus = 'surplus';
        newSurplus = Math.round((newSupply - demand) * 10) / 10;
      }

      const supplyMetPercent = Math.round((newSupply / demand) * 100);

      const updatedZones = state.zones.map((z) => {
        if (z.id === zoneId) {
          return {
            ...z,
            lpc,
            loss_factor: lossFactor,
            supply_m3_day: newSupply,
          };
        }
        return z;
      });

      const updatedMetrics = {
        ...state.metrics,
        [zoneId]: {
          ...metric,
          supply_m3_day: newSupply,
          deficit_m3_day: newDeficit,
          surplus_m3_day: newSurplus,
          supply_met_percent: supplyMetPercent,
          status: newStatus,
        },
      };

      const updatedScores = calculateAllPriorityScores(updatedZones, updatedMetrics);

      set({
        zones: updatedZones,
        metrics: updatedMetrics,
        priorityScores: updatedScores,
        successNotification: `Formula updated: Supply = (${zone.population.toLocaleString()} × ${lpc} × ${lossFactor}) / 1000 = ${newSupply.toLocaleString()} m³/day`,
      });
    },

    // What-If Reallocation with Rule 3 check
    reallocateWater: (payload) => {
      const state = get();
      const sourceMetric = state.metrics[payload.source_zone_id];
      const targetMetric = state.metrics[payload.target_zone_id];
      const targetZone = state.zones.find((z) => z.id === payload.target_zone_id);
      const sourceZone = state.zones.find((z) => z.id === payload.source_zone_id);

      if (!sourceMetric || !targetMetric || !targetZone || !sourceZone) {
        return { success: false, message: 'Invalid zones selected' };
      }

      // RULE #3: "If a zone has surplus and user tries to allocate more water, show alert: 'This zone already has surplus. Allocation unnecessary.'"
      if (targetMetric.status === 'surplus') {
        const warningMsg =
          state.language === 'hi'
            ? `इस क्षेत्र (${targetZone.name_hi}) में पहले से ही अधिशेष (${targetMetric.surplus_m3_day} m³/दिन) है। अतिरिक्त जल आवंटित करना अनावश्यक है।`
            : `This zone (${targetZone.name}) already has surplus (${targetMetric.surplus_m3_day} m³/day). Allocation unnecessary.`;

        set({ surplusReallocationWarning: warningMsg });
        return { success: false, message: warningMsg };
      }

      // Safe transfer calculation
      const transferAmount = Math.min(payload.transfer_m3_day, sourceMetric.surplus_m3_day || payload.transfer_m3_day);

      const newSourceSupply = Math.max(0, sourceMetric.supply_m3_day - transferAmount);
      const newSourceSurplus = Math.max(0, sourceMetric.surplus_m3_day - transferAmount);

      const newTargetSupply = targetMetric.supply_m3_day + transferAmount;
      const targetDemand = targetMetric.demand_m3_day;
      const newTargetDeficit = Math.max(0, targetDemand - newTargetSupply);
      const newTargetSurplus = Math.max(0, newTargetSupply - targetDemand);
      const newTargetStatus: ZoneStatus =
        newTargetDeficit > 0 ? (newTargetDeficit < targetDemand * 0.05 ? 'tight' : 'deficit') : 'surplus';

      const updatedMetrics = {
        ...state.metrics,
        [sourceZone.id]: {
          ...sourceMetric,
          supply_m3_day: newSourceSupply,
          surplus_m3_day: newSourceSurplus,
          status: newSourceSurplus > 0 ? ('surplus' as ZoneStatus) : ('tight' as ZoneStatus),
        },
        [targetZone.id]: {
          ...targetMetric,
          supply_m3_day: newTargetSupply,
          deficit_m3_day: newTargetDeficit,
          surplus_m3_day: newTargetSurplus,
          status: newTargetStatus,
          supply_met_percent: Math.round((newTargetSupply / targetDemand) * 100),
        },
      };

      const updatedZones = state.zones.map((z) => {
        if (z.id === targetZone.id) {
          return { ...z, supply_m3_day: newTargetSupply, deficit_duration_days: newTargetDeficit === 0 ? 0 : z.deficit_duration_days };
        }
        if (z.id === sourceZone.id) {
          return { ...z, supply_m3_day: newSourceSupply };
        }
        return z;
      });

      const updatedScores = calculateAllPriorityScores(updatedZones, updatedMetrics);

      const successMsg =
        state.language === 'hi'
          ? `${sourceZone.name_hi} से ${targetZone.name_hi} में ${transferAmount} m³/दिन जल सफलतापूर्वक स्थानांतरित किया गया।`
          : `Re-allocated ${transferAmount} m³/day from ${sourceZone.name} to ${targetZone.name}.`;

      set({
        zones: updatedZones,
        metrics: updatedMetrics,
        priorityScores: updatedScores,
        surplusReallocationWarning: null,
        successNotification: successMsg,
        activeModal: 'bottomSheet',
      });

      return { success: true, message: successMsg };
    },

    toggleOffline: () =>
      set((state) => ({
        isOffline: !state.isOffline,
        lastUpdatedMinutesAgo: !state.isOffline ? 1 : 0,
      })),

    clearNotification: () => set({ successNotification: null }),
    clearWarning: () => set({ surplusReallocationWarning: null }),

    // DOCK Demand Calculator actions
    setSelectedDockZone: (selectedDockZone) => set({ selectedDockZone }),
    setEditingDockZone: (editingDockZone) => set({ editingDockZone }),
    saveEditingDockZone: (updated) => {
      set((state) => {
        const updatedList = state.dockZones.map((z) => (z.id === updated.id ? updated : z));
        const isEn = state.language === 'en';
        return {
          dockZones: updatedList,
          selectedDockZone: updated,
          editingDockZone: null,
          successNotification: isEn
            ? `Demand values for ${updated.zone} (${updated.city}) updated and recalculated.`
            : `${updated.zone_hi} (${updated.city_hi}) के लिए मांग मान सफलतापूर्वक अपडेट किए गए।`,
        };
      });
    },
    resetDockZones: () => set({ dockZones: initialDockZones }),
  };
});
