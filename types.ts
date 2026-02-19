
export enum HazardType {
  FLOOD = 'Flood',
  HEAT = 'Heat Stress',
  AQI = 'Air Quality',
  STORM = 'Storm Surge'
}

export enum City {
  SINGAPORE = 'Singapore',
  HONG_KONG = 'Hong Kong'
}

export enum DashboardModule {
  OVERVIEW = 'Urban Overview',
  TRANSPORT = 'Transport & Mobility',
  HEALTH = 'Public Health & Vulnerability'
}

export interface ClimateMetric {
  label: string;
  value: string | number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
}

export interface RiskZone {
  id: string;
  name: string;
  level: number; // 0-100
  coordinates: [number, number];
  type: HazardType;
}

export interface AIInsight {
  summary: string;
  recommendations: string[];
  confidence: number;
}

export interface IoTStream {
  id: string;
  type: 'Water' | 'Temp' | 'AQI';
  value: number;
  location: string;
  timestamp: string;
}
