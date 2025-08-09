// Emergency type definitions for WA Emergency Dashboard

export type EmergencyType = 'bushfire' | 'flood';

export type BushfireRating = 
  | 'no-rating' 
  | 'low-moderate' 
  | 'high' 
  | 'very-high' 
  | 'severe' 
  | 'extreme' 
  | 'catastrophic';

export type FloodRating = 
  | 'no-warning' 
  | 'minor' 
  | 'moderate' 
  | 'major';

export interface EmergencyRating {
  level: BushfireRating | FloodRating;
  description: string;
  color: string;
  severity: number; // 0-6 for sorting
  recommendations: Array<string>;
  lastUpdated: string;
}

export interface EmergencyData {
  bushfire: EmergencyRating;
  flood: EmergencyRating;
}

export interface EmergencyForecast {
  date: string;
  emergencyData: EmergencyData;
  confidence: 'low' | 'medium' | 'high';
}

export interface Region {
  id: string;
  name: string;
  slug: string;
  geometry: any; // GeoJSON Polygon or MultiPolygon
  center: [number, number]; // [longitude, latitude]
  bounds: [[number, number], [number, number]]; // [[sw], [ne]]
  localGovernmentAreas: Array<string>;
  population?: number;
  area?: number; // square kilometers
}

export interface RegionWithEmergency extends Region {
  emergencyData: EmergencyData;
  forecasts: Array<EmergencyForecast>;
  lastUpdated: string;
}

// API Response types
export interface QGISResponse {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: {
      region_id: string;
      region_name: string;
      bushfire_rating: string;
      flood_rating: string;
      last_updated: string;
      local_govt_areas: string;
      population?: number;
      area?: number;
      [key: string]: any;
    };
    geometry: any; // GeoJSON Polygon or MultiPolygon
  }>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
}

// Constants for emergency ratings
export const BUSHFIRE_RATINGS: Record<BushfireRating, { color: string; severity: number; label: string }> = {
  'no-rating': { color: '#9ca3af', severity: 0, label: 'No Rating' },
  'low-moderate': { color: '#10b981', severity: 1, label: 'Low-Moderate' },
  'high': { color: '#f59e0b', severity: 2, label: 'High' },
  'very-high': { color: '#ea580c', severity: 3, label: 'Very High' },
  'severe': { color: '#dc2626', severity: 4, label: 'Severe' },
  'extreme': { color: '#991b1b', severity: 5, label: 'Extreme' },
  'catastrophic': { color: '#7f1d1d', severity: 6, label: 'Catastrophic' },
};

export const FLOOD_RATINGS: Record<FloodRating, { color: string; severity: number; label: string }> = {
  'no-warning': { color: '#9ca3af', severity: 0, label: 'No Warning' },
  'minor': { color: '#3b82f6', severity: 1, label: 'Minor Flooding' },
  'moderate': { color: '#1d4ed8', severity: 2, label: 'Moderate Flooding' },
  'major': { color: '#1e40af', severity: 3, label: 'Major Flooding' },
}; 