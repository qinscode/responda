import type { WeatherStation, WeatherData } from '@/types/weather';

// Type definition for weather station info JSON structure
interface WeatherStationInfo {
  WeatherStation: string;
  Latitude: number;
  Longitude: number;
  Population: number | null;
  NearestFireStation: string;
  NearestHospital: string;
  HighwayEscape: string;
}

// Type definition for OpenWeatherMap API response
interface OpenWeatherMapResponse {
  main?: {
    temp?: number;
    humidity?: number;
    pressure?: number;
  };
  wind?: {
    speed?: number;
    deg?: number;
  };
  rain?: {
    '1h'?: number;
  };
  snow?: {
    '1h'?: number;
  };
  visibility?: number;
  weather?: Array<{
    description?: string;
  }>;
}

// Parse weather stations from JSON file instead of CSV
export async function parseWeatherStationsFromJSON(): Promise<Array<WeatherStation>> {
  try {
    const response = await fetch('/weather_station_info.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch weather station info: ${response.status}`);
    }
    
    const jsonData = await response.json() as WeatherStationInfo[];
    const stations: Array<WeatherStation> = [];

    for (let index = 0; index < jsonData.length; index++) {
      const stationData = jsonData[index];
      
      // Skip if stationData is undefined or has invalid entries
      if (!stationData || 
          !stationData.WeatherStation || 
          typeof stationData.Latitude !== 'number' || 
          typeof stationData.Longitude !== 'number' ||
          stationData.Latitude === 0 || stationData.Longitude === 0) {
        continue;
      }

      stations.push({
        id: `ws_${index + 1}`, // Generate unique ID
        name: stationData.WeatherStation,
        latitude: stationData.Latitude,
        longitude: stationData.Longitude,
        state: 'WA', // All stations in WA
        population: stationData.Population,
        nearestFireStation: stationData.NearestFireStation,
        nearestHospital: stationData.NearestHospital,
        highwayEscape: stationData.HighwayEscape,
        district: '0' // Default district
      });
    }

    console.log(`Loaded ${stations.length} weather stations from JSON`);
    return stations;
  } catch (error) {
    console.error('Error parsing weather stations JSON:', error);
    return [];
  }
}

// Legacy function for backward compatibility
export async function parseWeatherStationsFromCSV(): Promise<Array<WeatherStation>> {
  return parseWeatherStationsFromJSON();
}

// Weather API service using OpenWeatherMap
const OPENWEATHER_API_KEY = import.meta.env['VITE_OPENWEATHER_API_KEY'] || 'demo_key';

export async function getWeatherDataFromAPI(latitude: number, longitude: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status}`);
    }
    
    const data = await response.json() as OpenWeatherMapResponse;
    
    const currentDate = new Date().toISOString().split('T')[0] || new Date().toDateString();
    const currentTime = new Date().toTimeString().split(' ')[0] || new Date().toTimeString();
    
    return {
      stationId: `api_${latitude}_${longitude}`,
      date: currentDate,
      time: currentTime,
      temperature: data.main?.temp || 0,
      humidity: data.main?.humidity || 0,
      pressure: data.main?.pressure || 0,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg ? `${data.wind.deg}°` : 'N/A',
      precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
      visibility: data.visibility ? data.visibility / 1000 : 0, // Convert to km
      conditions: data.weather?.[0]?.description || 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching weather data from API:', error);
    return null;
  }
}

// Function to fetch weather data for a specific station (with API fallback)
export async function getWeatherDataForStation(stationId: string): Promise<WeatherData | null> {
  try {
    // First try to get data from CSV
    const response = await fetch('/weather_data.csv');
    if (response.ok) {
      const csvText = await response.text();
      const lines = csvText.split('\n');
      
      if (lines.length >= 2) {
        // Find data for the specific station
        for (let index = 1; index < lines.length; index++) {
          const line = lines[index]?.trim();
          if (!line) continue;

          const values = line.split(',');
          const csvStationId = values[0]?.trim();
          
          if (csvStationId === stationId) {
                         const defaultDate = new Date().toISOString().split('T')[0] || new Date().toDateString();
             const defaultTime = new Date().toTimeString().split(' ')[0] || new Date().toTimeString();
             
             return {
               stationId: csvStationId,
               date: values[1]?.trim() || defaultDate,
               time: values[2]?.trim() || defaultTime,
              temperature: parseFloat(values[3]?.trim() || '0'),
              humidity: parseFloat(values[4]?.trim() || '0'),
              pressure: parseFloat(values[5]?.trim() || '0'),
              windSpeed: parseFloat(values[6]?.trim() || '0'),
              windDirection: values[7]?.trim() || 'N/A',
              precipitation: parseFloat(values[8]?.trim() || '0'),
              visibility: parseFloat(values[9]?.trim() || '0'),
              conditions: values[10]?.trim() || 'Unknown'
            };
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

// Function to get weather data for station with coordinates (using API)
export async function getWeatherDataForStationWithCoords(stationId: string, latitude: number, longitude: number): Promise<WeatherData | null> {
  // First try CSV data
  const csvData = await getWeatherDataForStation(stationId);
  if (csvData) {
    return csvData;
  }
  
  // Fallback to API
  const apiData = await getWeatherDataFromAPI(latitude, longitude);
  if (apiData) {
    apiData.stationId = stationId; // Override with actual station ID
  }
  
  return apiData;
}

// Function to get stations in a specific region or all stations
export function getStationsInRegion(stations: Array<WeatherStation>, bounds?: {
  north: number;
  south: number;
  east: number;
  west: number;
}): Array<WeatherStation> {
  if (!bounds) return stations;

  return stations.filter(station => 
    station.latitude <= bounds.north &&
    station.latitude >= bounds.south &&
    station.longitude <= bounds.east &&
    station.longitude >= bounds.west
  );
} 