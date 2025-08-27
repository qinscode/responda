export interface RiverStation {
  id: string;
  stationNumber: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  river: string;
  catchment: string;
  openDate?: string;
  closeDate?: string;
  district: number;
  purpose: string[];
  height?: number;
}

export interface RiverData {
  waterLevel: number; // meters
  flow: number; // cumecs (cubic meters per second)
  temperature: number; // celsius
  turbidity: number; // NTU
  ph: number;
  conductivity: number; // µS/cm
  lastUpdated: string;
  qualityGrade: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export type StationType = 'weather' | 'river'; 