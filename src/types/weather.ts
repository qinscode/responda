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