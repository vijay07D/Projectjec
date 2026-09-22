import { DockDemandZone, DockZoneType } from '../types';

export function calculateDomesticDemand(population: number, lpcd: number, lossFactor: number): number {
  return (population * lpcd * lossFactor) / 1000;
}

export function calculateCommercialDemand(domesticDemand: number, c: number): number {
  return domesticDemand * c;
}

export function calculateTotalDemand(domesticDemand: number, commercialDemand: number): number {
  return domesticDemand + commercialDemand;
}

export function getZoneTypeDefaults(type: DockZoneType): { defaultC: number; minC: number; maxC: number; label: string; label_hi: string } {
  switch (type) {
    case 'Highly Residential':
      return { defaultC: 0.12, minC: 0.10, maxC: 0.15, label: 'Highly Residential', label_hi: 'सघन आवासीय' };
    case 'Mixed':
      return { defaultC: 0.30, minC: 0.25, maxC: 0.40, label: 'Mixed (Res + Com)', label_hi: 'मिश्रित (आवासीय + वाणिज्यिक)' };
    case 'Fully Commercial':
      return { defaultC: 0.50, minC: 0.50, maxC: 1.00, label: 'Fully Commercial', label_hi: 'पूर्ण वाणिज्यिक' };
  }
}

interface RawDockInput {
  id: string;
  city: 'Chennai' | 'Guduvancherry' | 'Tambaram';
  city_hi: string;
  zone: string;
  zone_hi: string;
  population: number;
  lpcd: number;
  loss_factor: number;
  zone_type: DockZoneType;
  c: number;
}

const rawDockList: RawDockInput[] = [
  // CITY: Chennai (7 zones)
  {
    id: 'chn-1',
    city: 'Chennai',
    city_hi: 'चेन्नई',
    zone: 'T. Nagar',
    zone_hi: 'टी. नगर',
    population: 125000,
    lpcd: 135,
    loss_factor: 1.25,
    zone_type: 'Mixed',
    c: 0.30,
  },
  {
    id: 'chn-2',
    city: 'Chennai',
    city_hi: 'चेन्नई',
    zone: 'Adyar',
    zone_hi: 'अड्यार',
    population: 98000,
    lpcd: 135,
    loss_factor: 1.20,
    zone_type: 'Highly Residential',
    c: 0.12,
  },
  {
    id: 'chn-3',
    city: 'Chennai',
    city_hi: 'चेन्नई',
    zone: 'Anna Nagar',
    zone_hi: 'अन्ना नगर',
    population: 145000,
    lpcd: 135,
    loss_factor: 1.30,
    zone_type: 'Mixed',
    c: 0.35,
  },
  {
    id: 'chn-4',
    city: 'Chennai',
    city_hi: 'चेन्नई',
    zone: 'Velachery',
    zone_hi: 'वेलाचेरी',
    population: 112000,
    lpcd: 135,
    loss_factor: 1.25,
    zone_type: 'Mixed',
    c: 0.28,
  },
  {
    id: 'chn-5',
    city: 'Chennai',
    city_hi: 'चेन्नई',
    zone: 'Tambaram',
    zone_hi: 'तांबरम (चेन्नई)',
    population: 87000,
    lpcd: 135,
    loss_factor: 1.20,
    zone_type: 'Highly Residential',
    c: 0.10,
  },
  {
    id: 'chn-6',
    city: 'Chennai',
    city_hi: 'चेन्नई',
    zone: 'Mylapore',
    zone_hi: 'मयिलापुर',
    population: 76000,
    lpcd: 135,
    loss_factor: 1.25,
    zone_type: 'Fully Commercial',
    c: 0.50,
  },
  {
    id: 'chn-7',
    city: 'Chennai',
    city_hi: 'चेन्नई',
    zone: 'Guindy',
    zone_hi: 'गिंडी',
    population: 54000,
    lpcd: 135,
    loss_factor: 1.30,
    zone_type: 'Fully Commercial',
    c: 0.55,
  },

  // CITY: Guduvancherry (6 zones)
  {
    id: 'gud-1',
    city: 'Guduvancherry',
    city_hi: 'गुडुवांचेरी',
    zone: 'Guduvancherry',
    zone_hi: 'गुडुवांचेरी सेंट्रल',
    population: 45000,
    lpcd: 135,
    loss_factor: 1.20,
    zone_type: 'Highly Residential',
    c: 0.12,
  },
  {
    id: 'gud-2',
    city: 'Guduvancherry',
    city_hi: 'गुडुवांचेरी',
    zone: 'Urapakkam',
    zone_hi: 'उरपक्कम',
    population: 32000,
    lpcd: 135,
    loss_factor: 1.25,
    zone_type: 'Mixed',
    c: 0.25,
  },
  {
    id: 'gud-3',
    city: 'Guduvancherry',
    city_hi: 'गुडुवांचेरी',
    zone: 'Vandalur',
    zone_hi: 'वंडालूर',
    population: 28000,
    lpcd: 135,
    loss_factor: 1.20,
    zone_type: 'Highly Residential',
    c: 0.10,
  },
  {
    id: 'gud-4',
    city: 'Guduvancherry',
    city_hi: 'गुडुवांचेरी',
    zone: 'Perungalathur',
    zone_hi: 'पेरुंगलाथुर',
    population: 38000,
    lpcd: 135,
    loss_factor: 1.30,
    zone_type: 'Mixed',
    c: 0.35,
  },
  {
    id: 'gud-5',
    city: 'Guduvancherry',
    city_hi: 'गुडुवांचेरी',
    zone: 'Chromepet',
    zone_hi: 'क्रोमपेट',
    population: 52000,
    lpcd: 135,
    loss_factor: 1.25,
    zone_type: 'Mixed',
    c: 0.30,
  },
  {
    id: 'gud-6',
    city: 'Guduvancherry',
    city_hi: 'गुडुवांचेरी',
    zone: 'Pallavaram',
    zone_hi: 'पल्लवरम',
    population: 41000,
    lpcd: 135,
    loss_factor: 1.20,
    zone_type: 'Highly Residential',
    c: 0.15,
  },

  // CITY: Tambaram (4 zones)
  {
    id: 'tam-1',
    city: 'Tambaram',
    city_hi: 'तांबरम',
    zone: 'Tambaram East',
    zone_hi: 'तांबरम पूर्व',
    population: 67000,
    lpcd: 135,
    loss_factor: 1.25,
    zone_type: 'Mixed',
    c: 0.30,
  },
  {
    id: 'tam-2',
    city: 'Tambaram',
    city_hi: 'तांबरम',
    zone: 'Tambaram West',
    zone_hi: 'तांबरम पश्चिम',
    population: 54000,
    lpcd: 135,
    loss_factor: 1.20,
    zone_type: 'Highly Residential',
    c: 0.12,
  },
  {
    id: 'tam-3',
    city: 'Tambaram',
    city_hi: 'तांबरम',
    zone: 'Sanatorium',
    zone_hi: 'सेनेस्टोरियम',
    population: 29000,
    lpcd: 135,
    loss_factor: 1.20,
    zone_type: 'Highly Residential',
    c: 0.10,
  },
  {
    id: 'tam-4',
    city: 'Tambaram',
    city_hi: 'तांबरम',
    zone: 'Selaiyur',
    zone_hi: 'सेलैयूर',
    population: 43000,
    lpcd: 135,
    loss_factor: 1.30,
    zone_type: 'Mixed',
    c: 0.32,
  },
];

export const initialDockZones: DockDemandZone[] = rawDockList.map((item) => {
  const domestic = calculateDomesticDemand(item.population, item.lpcd, item.loss_factor);
  const commercial = calculateCommercialDemand(domestic, item.c);
  const total = calculateTotalDemand(domestic, commercial);

  return {
    ...item,
    domestic_demand_m3_day: Math.round(domestic * 100) / 100,
    commercial_demand_m3_day: Math.round(commercial * 100) / 100,
    total_demand_m3_day: Math.round(total * 100) / 100,
  };
});
