import type { WeatherStation } from '@/types/weather';

export async function parseWeatherStationsFromCSV(): Promise<Array<WeatherStation>> {
  try {
    // console.log('Starting to fetch CSV file...');
    // Fetch the clean weather stations CSV file
    const response = await fetch('/weather_stations.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }
    
    const csvText = await response.text();
    // console.log('CSV file fetched, length:', csvText.length);
    const lines = csvText.split('\n');
    // console.log('Total lines:', lines.length);
    
    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty or invalid');
    }

    const stations: Array<WeatherStation> = [];

    // Process each data line (skip header)
    for (let index = 1; index < lines.length; index++) {
      const line = lines[index]?.trim();
      if (!line) continue;

      const values = line.split(',');
      
      // Parse values from clean CSV format
      // station_id,station_number,name,latitude,longitude,state,height,district,opened_date,closed_date,status
      const stationId = values[0]?.trim();
      const stationNumber = values[1]?.trim();
      const stationName = values[2]?.trim();
      const latitudeString = values[3]?.trim();
      const longitudeString = values[4]?.trim();
      const state = values[5]?.trim();
      const heightString = values[6]?.trim();
      const district = values[7]?.trim();
      const openDate = values[8]?.trim();
      const closeDate = values[9]?.trim();
      const status = values[10]?.trim();

      // Parse coordinates
      const latitude = parseFloat(latitudeString || '0');
      const longitude = parseFloat(longitudeString || '0');
      const height = parseFloat(heightString || '0');

      // Skip invalid entries
      if (!stationId || !stationNumber || !stationName || 
          isNaN(latitude) || isNaN(longitude) || 
          latitude === 0 || longitude === 0 ||
          !state || state === '') {
        continue;
      }

      // All entries in this file are already WA stations
      stations.push({
        id: stationId,
        stationNumber,
        name: stationName,
        latitude,
        longitude,
        state,
        height: isNaN(height) ? 0 : height,
        openDate: openDate && openDate !== '' ? openDate : undefined,
        closeDate: closeDate && closeDate !== '' ? closeDate : status === 'closed' ? 'Closed' : undefined,
        district: district || '0'
      });
    }

    console.log(`Loaded ${stations.length} weather stations from clean CSV`);
    return stations;
  } catch (error) {
    console.error('Error parsing weather stations CSV:', error);
    return [];
  }
}

// Function to fetch weather data for a specific station
export async function getWeatherDataForStation(stationId: string): Promise<any> {
  try {
    const response = await fetch('/weather_data.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    if (lines.length < 2) {
      return null;
    }

    // Find data for the specific station
    for (let index = 1; index < lines.length; index++) {
      const line = lines[index]?.trim();
      if (!line) continue;

      const values = line.split(',');
      const csvStationId = values[0]?.trim();
      
      if (csvStationId === stationId) {
        return {
          stationId: csvStationId,
          date: values[1]?.trim(),
          time: values[2]?.trim(),
          temperature: parseFloat(values[3]?.trim() || '0'),
          humidity: parseFloat(values[4]?.trim() || '0'),
          pressure: parseFloat(values[5]?.trim() || '0'),
          windSpeed: parseFloat(values[6]?.trim() || '0'),
          windDirection: values[7]?.trim(),
          precipitation: parseFloat(values[8]?.trim() || '0'),
          visibility: parseFloat(values[9]?.trim() || '0'),
          conditions: values[10]?.trim()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
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