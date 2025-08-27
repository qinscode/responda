export interface WeatherStation {
  id: string;
  stationNumber: string;
  name: string;
  latitude: number;
  longitude: number;
  state: string;
  height: number;
  openDate?: string;
  closeDate?: string;
  district: string;
}

export interface WeatherData {
  stationId: string;
  date: string;
  time: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  visibility: number;
  conditions: string;
}

export interface WeatherStationData extends WeatherStation {
  currentWeather?: WeatherData;
}

// River Station Types
export interface RiverStation {
  id: string;
  stationNumber: string;
  name: string;
  latitude: number;
  longitude: number;
  state: string;
  height: number;
  openDate?: string;
  closeDate?: string;
  district: string;
  riverName: string;
  catchmentArea: number; // km²
}

export interface RiverData {
  stationId: string;
  date: string;
  time: string;
  waterLevel: number; // meters
  flow: number; // cubic meters per second
  temperature: number; // water temperature
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  turbidity: number; // NTU
  ph: number;
}

export interface RiverStationData extends RiverStation {
  currentRiverData?: RiverData;
}

// Unified Station type
export type Station = (WeatherStation & { type: 'weather' }) | (RiverStation & { type: 'river' });

export interface StationWithData {
  station: Station;
  data?: WeatherData | RiverData;
} 