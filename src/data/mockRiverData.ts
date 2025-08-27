import type { RiverStation, RiverData } from '@/types/weather';

// Real river data structure from CSV
interface RealRiverDataRow {
  datetime: string;
  stage: number;
  discharge: number;
  siteId: string;
  varFrom: number;
  varTo: number;
}

// CSV parsing function for river stations
export const parseRiverStationsFromCSV = async (): Promise<RiverStation[]> => {
  try {
    const response = await fetch('/river_station.csv');
    const csvText = await response.text();
    
    const lines = csvText.trim().split('\n');
    const headers = lines[0]?.split(',') || [];
    
    if (headers.length === 0) {
      console.error('No headers found in CSV file');
      return [];
    }
    
    const stations: RiverStation[] = [];
    
    // Parse each data line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;
      
      const values = line.split(',');
      
      // Skip lines that don't have enough data
      if (values.length < 5) continue;
      
      const site = values[0]?.trim();
      const riverName = values[1]?.trim();
      const stationName = values[2]?.trim();
      const latitude = parseFloat(values[3]?.trim() || '0');
      const longitude = parseFloat(values[4]?.trim() || '0');
      
      // Skip if essential data is missing
      if (!site || !riverName || !stationName || isNaN(latitude) || isNaN(longitude)) {
        continue;
      }
      
      // Determine district based on station number (first digit indicates region)
      const getDistrictFromSiteNumber = (siteNum: string): string => {
        const firstDigit = siteNum.charAt(0);
        switch (firstDigit) {
          case '6':
            if (siteNum.startsWith('601') || siteNum.startsWith('602')) return 'South West';
            if (siteNum.startsWith('603') || siteNum.startsWith('604')) return 'Great Southern';
            if (siteNum.startsWith('605') || siteNum.startsWith('606')) return 'South West';
            if (siteNum.startsWith('607') || siteNum.startsWith('608')) return 'South West';
            if (siteNum.startsWith('609')) return 'South West';
            if (siteNum.startsWith('610') || siteNum.startsWith('611')) return 'South West';
            if (siteNum.startsWith('612') || siteNum.startsWith('613')) return 'South West';
            if (siteNum.startsWith('614')) return 'Peel';
            if (siteNum.startsWith('615')) return 'Wheatbelt';
            if (siteNum.startsWith('616')) return 'Perth Metro';
            if (siteNum.startsWith('617')) return 'Perth Metro';
            return 'South West';
          case '7':
            return 'Mid West';
          case '8':
            if (siteNum.startsWith('80')) return 'Kimberley';
            return 'Pilbara';
          default:
            return 'Unknown';
        }
      };
      
      // Estimate catchment area based on river size (simplified approach)
      const estimateCatchmentArea = (riverName: string, latitude: number): number => {
        const river = riverName.toLowerCase();
        if (river.includes('swan') || river.includes('canning')) return 2000;
        if (river.includes('murray')) return 6000;
        if (river.includes('blackwood')) return 1500;
        if (river.includes('fitzroy')) return 90000;
        if (river.includes('ord')) return 45000;
        if (river.includes('gascoyne')) return 68000;
        if (river.includes('murchison')) return 82000;
        if (river.includes('avon')) return 4000;
        if (river.includes('collie')) return 2500;
        
        // Default estimation based on latitude (northern rivers tend to be larger)
        if (latitude > -20) return Math.random() * 50000 + 10000; // Kimberley/Pilbara
        if (latitude > -26) return Math.random() * 20000 + 5000;  // Mid West
        return Math.random() * 5000 + 500; // South West
      };
      
      const station: RiverStation = {
        id: `river-${site}`,
        stationNumber: site,
        name: `${riverName} at ${stationName}`,
        latitude,
        longitude,
        state: 'WA',
        height: Math.max(0, Math.round((latitude + 35) * 20 + Math.random() * 100)), // Rough elevation estimate
        openDate: '1/1990', // Default for historical stations
        closeDate: 'Active',
        district: getDistrictFromSiteNumber(site),
        riverName,
        catchmentArea: Math.round(estimateCatchmentArea(riverName, latitude) * 100) / 100
      };
      
      stations.push(station);
    }
    
    console.log(`Loaded ${stations.length} river stations from CSV`);
    return stations;
    
  } catch (error) {
    console.error('Error parsing river stations CSV:', error);
    return [];
  }
};

// Cache for river stations to avoid repeated CSV parsing
let riverStationsCache: RiverStation[] | null = null;

// Get river stations (with caching)
export const getRiverStations = async (): Promise<RiverStation[]> => {
  if (riverStationsCache) {
    return riverStationsCache;
  }
  
  riverStationsCache = await parseRiverStationsFromCSV();
  return riverStationsCache;
};

// Cache for real river data
let realRiverDataCache: Map<string, RealRiverDataRow[]> | null = null;

// Parse real river data from the CSV file
export const parseRealRiverData = async (): Promise<Map<string, RealRiverDataRow[]>> => {
  if (realRiverDataCache) {
    return realRiverDataCache;
  }

  try {
    const response = await fetch('/all_stations_last6days.csv');
    const csvText = await response.text();
    
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
      console.error('No data found in river data CSV file');
      return new Map();
    }
    
    // Skip header
    const dataByStation = new Map<string, RealRiverDataRow[]>();
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;
      
      const values = line.split(',');
      if (values.length < 6) continue;
      
      const datetime = values[0]?.trim();
      const stage = parseFloat(values[1]?.trim() || '0');
      const discharge = parseFloat(values[2]?.trim() || '0');
      const siteId = values[3]?.trim();
      const varFrom = parseFloat(values[4]?.trim() || '0');
      const varTo = parseFloat(values[5]?.trim() || '0');
      
      if (!datetime || !siteId || isNaN(stage) || isNaN(discharge)) {
        continue;
      }
      
      const rowData: RealRiverDataRow = {
        datetime,
        stage,
        discharge,
        siteId,
        varFrom,
        varTo
      };
      
      if (!dataByStation.has(siteId)) {
        dataByStation.set(siteId, []);
      }
      dataByStation.get(siteId)?.push(rowData);
    }
    
    console.log(`Loaded real river data for ${dataByStation.size} stations`);
    realRiverDataCache = dataByStation;
    return dataByStation;
    
  } catch (error) {
    console.error('Error parsing real river data CSV:', error);
    return new Map();
  }
};

// Get real river data for a station
export const getRiverDataForStation = async (stationId: string): Promise<RiverData | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  if (!stationId.startsWith('river-')) {
    return null;
  }
  
  const siteNumber = stationId.replace('river-', '');
  
  try {
    const realData = await parseRealRiverData();
    const stationData = realData.get(siteNumber);
    
    if (!stationData || stationData.length === 0) {
      console.warn(`No real data found for station ${siteNumber}, station may not have recent data`);
      return null;
    }
    
    // Get the most recent data point
    const latestData = stationData[stationData.length - 1];
    if (!latestData) {
      return null;
    }
    
    // Parse datetime
    const datetime = new Date(latestData.datetime);
    
    // Calculate water quality based on flow rate
    const getQuality = (discharge: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' => {
      if (discharge > 100) return 'Excellent';
      if (discharge > 50) return 'Good';
      if (discharge > 10) return 'Fair';
      return 'Poor';
    };
    
    // Estimate turbidity based on discharge (higher flow = lower turbidity)
    const estimateTurbidity = (discharge: number): number => {
      const baseTurbidity = Math.max(1, 30 - (discharge * 0.2));
      return Math.round(baseTurbidity * 10) / 10;
    };
    
    // Estimate temperature based on season and location
    const estimateTemperature = (datetime: Date, siteNumber: string): number => {
      const month = datetime.getMonth();
      const isWinter = month >= 5 && month <= 8; // June to September in Southern Hemisphere
      const baseTemp = isWinter ? 12 : 22;
      
      // Northern stations are warmer
      const isNorthern = siteNumber.startsWith('7') || siteNumber.startsWith('8');
      const tempAdjustment = isNorthern ? 8 : 0;
      
      return baseTemp + tempAdjustment + (Math.random() * 4 - 2); // ±2 degrees variation
    };
    
    return {
      stationId,
      date: datetime.toISOString().split('T')[0] || '',
      time: datetime.toLocaleTimeString('en-AU', { hour12: false }),
      waterLevel: Math.round(latestData.stage * 100) / 100, // Stage in meters
      flow: Math.round(latestData.discharge * 100) / 100, // Discharge in m³/s
      temperature: Math.round(estimateTemperature(datetime, siteNumber) * 10) / 10,
      quality: getQuality(latestData.discharge),
      turbidity: estimateTurbidity(latestData.discharge),
      ph: Math.round((7.0 + Math.random() * 1.5) * 10) / 10 // pH between 7.0-8.5
    };
    
  } catch (error) {
    console.error(`Error getting real data for station ${stationId}:`, error);
    return null;
  }
};

// Legacy export for backward compatibility (will be empty initially)
export let mockRiverStations: RiverStation[] = []; 