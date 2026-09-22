export type ZoneType = 'urban' | 'rural' | 'industrial';

export type ZoneStatus = 'deficit' | 'tight' | 'surplus';

export type AlertSeverity = 'red' | 'amber' | 'blue';

export type AlertType = 'deficit' | 'scarcity' | 'surplus' | 'reallocation';

export type HeatmapLayerMode = 'combined' | 'supply' | 'demand' | 'population' | 'deficit';

export type SourceType = 'borewell' | 'pipeline' | 'plant' | 'reservoir' | 'feeder';

export type SourceStatus = 'operational' | 'partial' | 'maintenance';

export interface WaterSource {
  id: string;
  zone_id: string;
  name: string;
  type: SourceType;
  capacity_m3_day: number;
  current_output_m3_day: number;
  location: string;
  status: SourceStatus;
}

export interface ZoneGeometry {
  type: 'Polygon';
  coordinates: [number, number][]; // [lat, lng] array
  center: [number, number]; // [lat, lng]
}

export interface Zone {
  id: string;
  name: string;
  name_hi: string;
  ward_number: number;
  city: string;
  city_hi: string;
  type: ZoneType;
  geometry: ZoneGeometry;
  population: number;
  lpc: number; // Liters Per Capita per day
  loss_factor: number; // Transmission & Distribution Loss Factor
  supply_m3_day: number; // Computed: (population * lpc * loss_factor) / 1000
  urban_density: number; // people per sq km
  consumption_pattern: 'very_high' | 'high' | 'medium' | 'low';
  critical_infra: boolean;
  critical_infra_desc?: string;
  critical_infra_desc_hi?: string;
  deficit_duration_days: number;
}

export interface WaterMetrics {
  zone_id: string;
  date: string;
  demand_m3_day: number;
  supply_m3_day: number;
  deficit_m3_day: number;
  surplus_m3_day: number;
  population_served: number;
  supply_met_percent: number;
  status: ZoneStatus;
  projected_deficit_days?: number; // e.g. 3, 5, 7 days
}

export interface AlertItem {
  id: string;
  zone_id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  message_hi: string;
  created_at: string;
  dismissed: boolean;
  action_label: string;
  action_label_hi: string;
  action_type: 'allocate_water' | 'view_details' | 'view_source' | 'plan_now';
}

export interface PriorityScore {
  zone_id: string;
  score: number; // 0 to 100
  deficit_weight: number;
  population_weight: number;
  urban_weight: number;
  duration_weight: number;
  infra_weight: number;
  calculated_at: string;
}

export interface WaterAllocationPayload {
  zone_id: string;
  allocated_m3_day: number;
  updated_lpc?: number;
  updated_loss_factor?: number;
  source_feeder_id: string;
  allocated_by: string;
  notes?: string;
}

export interface ReallocationPayload {
  source_zone_id: string;
  target_zone_id: string;
  transfer_m3_day: number;
}

export type ModalType = 'none' | 'bottomSheet' | 'allocate' | 'whatIf' | 'history' | 'profile';

export type PageId = 'dashboard' | 'find-supply' | 'dock' | 'map' | 'allocation-grid';

export type DockZoneType = 'Highly Residential' | 'Mixed' | 'Fully Commercial';

export interface DockDemandZone {
  id: string;
  city: 'Chennai' | 'Guduvancherry' | 'Tambaram';
  city_hi: string;
  zone: string;
  zone_hi: string;
  population: number;
  lpcd: number;
  loss_factor: number;
  zone_type: DockZoneType;
  c: number; // Commercial multiplier
  domestic_demand_m3_day: number;
  commercial_demand_m3_day: number;
  total_demand_m3_day: number;
}
