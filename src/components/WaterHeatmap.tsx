import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Droplets,
  AlertOctagon,
  Users,
  TrendingDown,
  Info,
  Sparkles,
  ExternalLink,
  MapPin,
  Waves,
  Globe,
  Compass,
} from 'lucide-react';
import { useWaterStore } from '../store/useWaterStore';
import { translations } from '../translations';
import { HeatmapLayerMode, Zone, ZoneStatus } from '../types';
import { realWaterBodies, RealWaterBody } from '../data/realWaterBodiesData';
import { GeminiMapIntelPanel } from './GeminiMapIntelPanel';

export type MapTileStyle = 'hybrid' | 'satellite' | 'streets' | 'topo' | 'light';

export const WaterHeatmap: React.FC = () => {
  const {
    language,
    zones,
    metrics,
    layerMode,
    setLayerMode,
    statusFilter,
    cityFilter,
    setCityFilter,
    selectZone,
    focusedZoneId,
    selectedZoneForDetail,
  } = useWaterStore();
  const t = translations[language];

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const polygonsGroupRef = useRef<L.LayerGroup | null>(null);
  const heatCirclesGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const waterBodiesGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapStyle, setMapStyle] = useState<MapTileStyle>('hybrid');
  const [showWaterBodies, setShowWaterBodies] = useState(true);
  const [hoveredZone, setHoveredZone] = useState<Zone | null>(null);
  const [hoveredPos, setHoveredPos] = useState<{ x: number; y: number } | null>(null);
  const [showGeminiPanel, setShowGeminiPanel] = useState(false);
  const [activeZoneForAI, setActiveZoneForAI] = useState<Zone | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center spanning Tamil Nadu and Central India regions
    const map = L.map(mapContainerRef.current, {
      center: [13.0418, 80.2341], // Default to Chennai / DOCK center
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
    });

    tileLayerGroupRef.current = L.layerGroup().addTo(map);
    polygonsGroupRef.current = L.layerGroup().addTo(map);
    heatCirclesGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);
    waterBodiesGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer dynamically based on mapStyle
  useEffect(() => {
    if (!tileLayerGroupRef.current) return;
    tileLayerGroupRef.current.clearLayers();

    if (mapStyle === 'satellite') {
      // High-resolution Esri Photographic Satellite Imagery
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri',
        }
      ).addTo(tileLayerGroupRef.current);
    } else if (mapStyle === 'hybrid') {
      // Real Satellite + Transparent Vector Street & Landmark Labels
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri',
        }
      ).addTo(tileLayerGroupRef.current);
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(tileLayerGroupRef.current);
    } else if (mapStyle === 'streets') {
      // OpenStreetMap Real Streets & Infrastructure
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(tileLayerGroupRef.current);
    } else if (mapStyle === 'topo') {
      // Topographic & Elevation Contours
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '&copy; OpenTopoMap',
      }).addTo(tileLayerGroupRef.current);
    } else {
      // Clean Light Carto GIS
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution: '&copy; CartoDB',
        }
      ).addTo(tileLayerGroupRef.current);
    }
  }, [mapStyle]);

  // Pan to city when cityFilter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (cityFilter === 'Chennai') {
      map.flyTo([13.0418, 80.2341], 12, { duration: 1.0 });
    } else if (cityFilter === 'Tambaram') {
      map.flyTo([12.9249, 80.1180], 13, { duration: 1.0 });
    } else if (cityFilter === 'Guduvancherry') {
      map.flyTo([12.8465, 80.0617], 13, { duration: 1.0 });
    } else if (cityFilter === 'Indore') {
      map.flyTo([22.7196, 75.8577], 12, { duration: 1.0 });
    } else if (cityFilter === 'Ujjain') {
      map.flyTo([23.1765, 75.7885], 12, { duration: 1.0 });
    } else if (cityFilter === 'Dewas') {
      map.flyTo([22.9676, 76.0534], 12, { duration: 1.0 });
    } else {
      // Default to Chennai overview if nothing selected
      map.flyTo([13.0200, 80.1800], 11, { duration: 1.0 });
    }
  }, [cityFilter]);

  // Render Real Water Bodies Layer
  useEffect(() => {
    const group = waterBodiesGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (!showWaterBodies) return;

    realWaterBodies.forEach((wb) => {
      const isTamilNadu = ['Chennai', 'Tambaram', 'Guduvancherry'].includes(wb.city);
      const isMP = ['Indore', 'Ujjain', 'Dewas'].includes(wb.city);

      if (cityFilter !== 'all') {
        if (wb.city !== cityFilter) return;
      }

      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#0077B6] border-2 border-white shadow-xl text-white hover:scale-115 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
          <span class="absolute -top-1 -right-1 flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'water-body-custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(wb.center, { icon });

      marker.bindPopup(`
        <div class="p-2 max-w-xs font-sans text-xs">
          <div class="flex items-center gap-1.5 text-[#0077B6] font-bold text-sm">
            <span>💧</span>
            <span>${language === 'hi' ? wb.name_hi : wb.name}</span>
          </div>
          <p class="text-[11px] text-slate-500 mt-0.5">${wb.city} • ${wb.type.toUpperCase()}</p>
          <div class="mt-2 p-2 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-between text-[11px]">
            <div>
              <span class="text-slate-500 block">Capacity</span>
              <span class="font-bold text-slate-900">${wb.fullCapacity_mcft.toLocaleString()} mcft</span>
            </div>
            <div class="text-right">
              <span class="text-slate-500 block">Storage</span>
              <span class="font-black text-emerald-600">${wb.currentLevel_percent}% Full</span>
            </div>
          </div>
          <p class="text-slate-600 text-[11px] mt-1.5 leading-tight">${language === 'hi' ? wb.description_hi : wb.description}</p>
          <div class="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
            <a href="${wb.satelliteUrl}" target="_blank" rel="noreferrer" class="text-[11px] font-bold text-[#0A4D8C] hover:underline flex items-center gap-1">
              <span>🛰️ Satellite View ↗</span>
            </a>
            <a href="${wb.googleMapsUrl}" target="_blank" rel="noreferrer" class="text-[11px] text-slate-600 hover:underline">
              Google Maps ↗
            </a>
          </div>
        </div>
      `);

      group.addLayer(marker);
    });
  }, [showWaterBodies, cityFilter, language]);

  // Update Layers when layerMode, statusFilter, or data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !polygonsGroupRef.current || !heatCirclesGroupRef.current || !markersGroupRef.current) return;

    polygonsGroupRef.current.clearLayers();
    heatCirclesGroupRef.current.clearLayers();
    markersGroupRef.current.clearLayers();

    // Filter zones if a status category is selected
    const visibleZones = zones.filter((z) => {
      if (cityFilter !== 'all' && z.city !== cityFilter) return false;
      if (statusFilter === 'all') return true;
      const m = metrics[z.id];
      if (!m) return true;
      return m.status === statusFilter;
    });

    visibleZones.forEach((zone) => {
      const metric = metrics[zone.id];
      if (!metric) return;

      const isFocused = focusedZoneId === zone.id || selectedZoneForDetail?.id === zone.id;

      // Determine Polygon Color based on layer mode & magnitude
      let fillColor = '#00B4D8';
      let fillOpacity = 0.5;
      let strokeColor = '#0A4D8C';
      let weight = isFocused ? 3.5 : 2.0;

      if (layerMode === 'combined') {
        if (metric.status === 'deficit') {
          fillColor = metric.deficit_m3_day > 60 ? '#EF4444' : '#F87171';
          strokeColor = '#B91C1C';
          fillOpacity = 0.65;
        } else if (metric.status === 'tight') {
          fillColor = '#F59E0B';
          strokeColor = '#D97706';
          fillOpacity = 0.6;
        } else {
          fillColor = '#10B981';
          strokeColor = '#047857';
          fillOpacity = 0.55;
        }
      } else if (layerMode === 'deficit') {
        if (metric.status === 'deficit') {
          fillColor = '#EF4444';
          fillOpacity = 0.75;
          strokeColor = '#991B1B';
        } else {
          fillColor = '#E2E8F0';
          fillOpacity = 0.25;
          strokeColor = '#94A3B8';
        }
      } else if (layerMode === 'supply') {
        const intensity = Math.min(1, metric.supply_m3_day / 25000);
        fillColor = intensity > 0.6 ? '#10B981' : '#34D399';
        fillOpacity = 0.4 + intensity * 0.4;
        strokeColor = '#047857';
      } else if (layerMode === 'demand') {
        const intensity = Math.min(1, metric.demand_m3_day / 25000);
        fillColor = intensity > 0.6 ? '#EF4444' : '#FB923C';
        fillOpacity = 0.4 + intensity * 0.4;
        strokeColor = '#B91C1C';
      } else if (layerMode === 'population') {
        const intensity = Math.min(1, zone.population / 120000);
        fillColor = intensity > 0.6 ? '#2563EB' : '#60A5FA';
        fillOpacity = 0.4 + intensity * 0.4;
        strokeColor = '#1D4ED8';
      }

      // Draw Polygon
      const polygon = L.polygon(zone.geometry.coordinates, {
        color: strokeColor,
        weight: weight,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        className: 'transition-all duration-300 cursor-pointer',
      });

      polygon.on('click', () => {
        selectZone(zone, true);
        setActiveZoneForAI(zone);
      });

      polygon.on('mouseover', (e: L.LeafletMouseEvent) => {
        setHoveredZone(zone);
        setHoveredPos({ x: e.containerPoint.x, y: e.containerPoint.y });
        polygon.setStyle({
          weight: 3.5,
          fillOpacity: 0.8,
        });
      });

      polygon.on('mouseout', () => {
        setHoveredZone(null);
        setHoveredPos(null);
        polygon.setStyle({
          weight: isFocused ? 3.5 : 2.0,
          fillOpacity: fillOpacity,
        });
      });

      polygonsGroupRef.current?.addLayer(polygon);

      // Label Marker at Polygon Center
      const zoneNameDisplay = language === 'hi' ? zone.name_hi : zone.name;
      const markerHtml = `
        <div class="px-1.5 py-0.5 rounded bg-slate-950/85 backdrop-blur-md text-white font-bold text-[10px] border border-white/40 shadow-lg whitespace-nowrap pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full ${
            metric.status === 'deficit' ? 'bg-red-500' : metric.status === 'tight' ? 'bg-amber-400' : 'bg-emerald-400'
          }"></span>
          <span>${zoneNameDisplay}</span>
        </div>
      `;

      const textMarker = L.marker(zone.geometry.center, {
        icon: L.divIcon({
          html: markerHtml,
          className: 'zone-label-marker',
          iconSize: [0, 0],
        }),
      });

      markersGroupRef.current?.addLayer(textMarker);
    });
  }, [zones, metrics, layerMode, statusFilter, focusedZoneId, selectedZoneForDetail, selectZone, cityFilter, language]);

  // Zoom to focused zone if search or row clicked
  useEffect(() => {
    if (!focusedZoneId || !mapInstanceRef.current) return;
    const target = zones.find((z) => z.id === focusedZoneId);
    if (target) {
      mapInstanceRef.current.flyTo(target.geometry.center, 14, {
        duration: 1.0,
      });
      setActiveZoneForAI(target);
    }
  }, [focusedZoneId, zones]);

  const handleResetZoom = () => {
    if (mapInstanceRef.current) {
      if (cityFilter === 'Indore' || cityFilter === 'Ujjain' || cityFilter === 'Dewas') {
        mapInstanceRef.current.flyTo([22.7196, 75.8577], 12);
      } else {
        mapInstanceRef.current.flyTo([13.0418, 80.2341], 12);
      }
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const layerOptions: { mode: HeatmapLayerMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'combined', label: t.combinedMode, icon: <Layers className="w-3.5 h-3.5" /> },
    { mode: 'supply', label: t.supplyLayer, icon: <Droplets className="w-3.5 h-3.5 text-emerald-500" /> },
    { mode: 'demand', label: t.demandLayer, icon: <TrendingDown className="w-3.5 h-3.5 text-orange-500" /> },
    { mode: 'population', label: t.populationLayer, icon: <Users className="w-3.5 h-3.5 text-blue-500" /> },
    { mode: 'deficit', label: t.deficitLayer, icon: <AlertOctagon className="w-3.5 h-3.5 text-red-500" /> },
  ];

  return (
    <section id="heatmap-section" className="w-full py-2" aria-label="District Heatmap">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* City Filter & Quick Fly-to Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
              <Compass className="w-3.5 h-3.5 text-[#0A4D8C]" />
              City Grid:
            </span>
            {[
              { id: 'all', label: 'All Regions' },
              { id: 'Chennai', label: 'Chennai' },
              { id: 'Tambaram', label: 'Tambaram' },
              { id: 'Guduvancherry', label: 'Guduvancherry' },
              { id: 'Indore', label: 'Indore' },
              { id: 'Ujjain', label: 'Ujjain' },
              { id: 'Dewas', label: 'Dewas' },
            ].map((cityItem) => (
              <button
                key={cityItem.id}
                onClick={() => setCityFilter(cityItem.id as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  cityFilter === cityItem.id
                    ? 'bg-[#0A4D8C] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cityItem.label}
              </button>
            ))}
          </div>

          {/* Gemini AI Map Copilot Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowGeminiPanel(!showGeminiPanel);
                if (!activeZoneForAI && zones.length > 0) {
                  setActiveZoneForAI(selectedZoneForDetail || zones[0]);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0A4D8C] to-[#0077B6] hover:from-[#083866] hover:to-[#005f92] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00B4D8] animate-pulse" />
              <span>🛰️ Gemini Real Map AI</span>
            </button>
          </div>
        </div>

        {/* Layer Mode & Map Tile Switcher Bar (Above Map) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
          {/* Hydraulic Layer Mode Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto bg-slate-100/90 p-1 rounded-lg border border-slate-200">
            {layerOptions.map((opt) => (
              <button
                key={opt.mode}
                onClick={() => setLayerMode(opt.mode)}
                role="tab"
                aria-selected={layerMode === opt.mode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all whitespace-nowrap min-h-[36px] cursor-pointer touch-manipulation ${
                  layerMode === opt.mode
                    ? 'bg-[#0A4D8C] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200 hover:text-[#0A4D8C]'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* REAL MAP TILE SWITCHER (Satellite, Hybrid, Streets, Topo, Light) */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 px-1.5 flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#0A4D8C]" />
              Base:
            </span>
            {[
              { id: 'hybrid', label: '🛰️ Hybrid' },
              { id: 'satellite', label: 'Photographic' },
              { id: 'streets', label: '🗺️ Streets' },
              { id: 'topo', label: '⛰️ Topo' },
              { id: 'light', label: 'Vector' },
            ].map((styleItem) => (
              <button
                key={styleItem.id}
                onClick={() => setMapStyle(styleItem.id as MapTileStyle)}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  mapStyle === styleItem.id
                    ? 'bg-[#0A4D8C] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {styleItem.label}
              </button>
            ))}

            <button
              onClick={() => setShowWaterBodies(!showWaterBodies)}
              className={`ml-1 px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer border ${
                showWaterBodies
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
              }`}
              title="Toggle real lakes & dams"
            >
              💧 Reservoirs
            </button>
          </div>
        </div>

        {/* Hero Map Container with Gemini Panel Dock */}
        <div className="relative w-full h-[65vh] min-h-[460px] max-h-[760px] rounded-xl border-2 border-slate-300 overflow-hidden shadow-md bg-slate-900">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Map Controls: Zoom & Reset */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-md border border-slate-200">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded hover:bg-slate-100 text-slate-700 focus:outline-none min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              aria-label="Zoom In"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded hover:bg-slate-100 text-slate-700 focus:outline-none min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              aria-label="Zoom Out"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 rounded hover:bg-slate-100 text-slate-700 border-t border-slate-200 focus:outline-none min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              aria-label="Fit View"
              title="Fit View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Real Satellite Mode Watermark Badge */}
          <div className="absolute top-3 left-16 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/60 backdrop-blur-md text-white border border-white/20 text-xs font-medium shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real Aerial Satellite (Esri GIS)</span>
          </div>

          {/* Quick Notice Banner on Map */}
          <div className="absolute top-3 right-3 z-20 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/95 backdrop-blur-xs border border-slate-200 text-xs text-slate-700 shadow-xs">
            <Info className="w-3.5 h-3.5 text-[#0A4D8C]" />
            <span>Click any zone or reservoir to trigger Gemini GIS Intel</span>
          </div>

          {/* FLOATING / SLIDING GEMINI MAP INTEL PANEL */}
          {showGeminiPanel && (
            <div className="absolute top-14 right-3 bottom-3 z-30 w-full max-w-md shadow-2xl transition-all">
              <GeminiMapIntelPanel
                selectedZone={activeZoneForAI || selectedZoneForDetail}
                activeCity={cityFilter === 'all' ? 'Chennai' : cityFilter}
                onClose={() => setShowGeminiPanel(false)}
              />
            </div>
          )}

          {/* LEGEND AT BOTTOM-RIGHT */}
          <div
            id="heatmap-legend-card"
            className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs rounded-lg p-2.5 shadow-md border border-slate-200 text-xs font-medium max-w-[210px]"
          >
            <p className="font-bold text-slate-800 text-[11px] mb-1.5 pb-1 border-b border-slate-200 flex items-center justify-between">
              <span>{t.mapLegend}</span>
              <span className="text-[10px] text-slate-400">DOCK GIS</span>
            </p>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#10B981]"></span>
                <span className="text-slate-700">🟢 Surplus / Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#F59E0B]"></span>
                <span className="text-slate-700">🟡 Tight Flow</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#EF4444]"></span>
                <span className="text-slate-700">🔴 Critical Deficit</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <span className="w-3 h-3 rounded-full bg-[#0077B6] flex items-center justify-center text-[9px] text-white">💧</span>
                <span className="text-slate-700">Natural Reservoirs</span>
              </div>
            </div>
          </div>

          {/* Hover Tooltip */}
          {hoveredZone && hoveredPos && (
            <div
              className="absolute z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-lg shadow-2xl text-xs max-w-xs transition-opacity duration-150 -translate-x-1/2 -translate-y-full mb-3 border border-slate-700"
              style={{
                left: `${hoveredPos.x}px`,
                top: `${hoveredPos.y - 12}px`,
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1 mb-1">
                <p className="font-bold text-sm text-white">
                  {language === 'hi' ? hoveredZone.name_hi : hoveredZone.name}
                </p>
                <span className="text-[10px] font-mono text-cyan-300">{hoveredZone.city}</span>
              </div>

              <div className="space-y-0.5 text-slate-200">
                <p>
                  {t.populationLabel}: {hoveredZone.population.toLocaleString()} residents
                </p>
                <p className="text-cyan-200 text-[11px] font-mono">
                  LPC: {hoveredZone.lpc} | Loss Factor: {hoveredZone.loss_factor.toFixed(2)}
                </p>
                {metrics[hoveredZone.id] && (
                  <>
                    <p>
                      {t.demandLabel}: {metrics[hoveredZone.id].demand_m3_day.toLocaleString()} m³/day
                    </p>
                    <p className="font-bold text-white">
                      {t.supplyLabel}: {metrics[hoveredZone.id].supply_m3_day.toLocaleString()} m³/day
                    </p>
                    <p
                      className={`font-semibold ${
                        metrics[hoveredZone.id].status === 'deficit'
                          ? 'text-red-300'
                          : metrics[hoveredZone.id].status === 'tight'
                          ? 'text-amber-300'
                          : 'text-emerald-300'
                      }`}
                    >
                      {t.supplyMet}: {metrics[hoveredZone.id].supply_met_percent}%
                    </p>
                  </>
                )}
                <div className="pt-1.5 mt-1 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-cyan-300">
                  <span>Click to inspect</span>
                  <span className="font-semibold flex items-center gap-0.5">
                    🛰️ Gemini AI Available
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
