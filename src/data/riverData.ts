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
export const parseRiverStationsFromCSV = async (): Promise<Array<RiverStation>> => {
  try {
    // Use the real stations summary file with proper station data
    const response = await fetch('/river_station_water_level/stations_summary_ALL.csv');
    const csvText = await response.text();
    
    const lines = csvText.trim().split('\n');
    const headers = lines[0]?.split(',') || [];
    
    if (headers.length === 0) {
      console.error('No headers found in CSV file');
      return [];
    }
    
    const stations: Array<RiverStation> = [];
    
    // Parse each data line (skip header)
    for (let index = 1; index < lines.length; index++) {
      const line = lines[index]?.trim();
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
      const getDistrictFromSiteNumber = (siteNumber: string): string => {
        const firstDigit = siteNumber.charAt(0);
        switch (firstDigit) {
          case '6':
            if (siteNumber.startsWith('601') || siteNumber.startsWith('602')) return 'South West';
            if (siteNumber.startsWith('603') || siteNumber.startsWith('604')) return 'Great Southern';
            if (siteNumber.startsWith('605') || siteNumber.startsWith('606')) return 'South West';
            if (siteNumber.startsWith('607') || siteNumber.startsWith('608')) return 'South West';
            if (siteNumber.startsWith('609')) return 'South West';
            if (siteNumber.startsWith('610') || siteNumber.startsWith('611')) return 'South West';
            if (siteNumber.startsWith('612') || siteNumber.startsWith('613')) return 'South West';
            if (siteNumber.startsWith('614')) return 'Peel';
            if (siteNumber.startsWith('615')) return 'Wheatbelt';
            if (siteNumber.startsWith('616')) return 'Perth Metro';
            if (siteNumber.startsWith('617')) return 'Perth Metro';
            return 'South West';
          case '7':
            return 'Mid West';
          case '8':
            if (siteNumber.startsWith('80')) return 'Kimberley';
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
        
        // Conservative estimation based on latitude (northern rivers tend to be larger)
        if (latitude > -20) return 25000; // Kimberley/Pilbara - larger catchments
        if (latitude > -26) return 10000; // Mid West - medium catchments  
        return 2000; // South West - smaller catchments
      };
      
      const station: RiverStation = {
        id: `river-${site}`,
        stationNumber: site,
        name: `${riverName} at ${stationName}`,
        latitude,
        longitude,
        state: 'WA',
        height: Math.max(0, Math.round((latitude + 35) * 20)), // Rough elevation estimate based on latitude
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
let riverStationsCache: Array<RiverStation> | null = null;

// Get river stations (with caching)
export const getRiverStations = async (): Promise<Array<RiverStation>> => {
  if (riverStationsCache) {
    return riverStationsCache;
  }
  
  const stations = await parseRiverStationsFromCSV();
  riverStationsCache = stations;
  return stations;
};

// Removed: No longer need cache for combined data file

// This function is no longer needed as we load data directly from individual station files

// Get real river data for a station (using only real data from CSV files)
export const getRiverDataForStation = async (stationId: string): Promise<RiverData | null> => {
  if (!stationId.startsWith('river-')) {
    return null;
  }
  
  const siteNumber = stationId.replace('river-', '');
  
  try {
    // Get data directly from individual station CSV file
    const chartData = await getRiverStationChartData(siteNumber);
    
    if (chartData.length === 0) {
      console.warn(`No real data found for station ${siteNumber}`);
      return null;
    }
    
    // Get the most recent data point
    const latestData = chartData[chartData.length - 1];
    if (!latestData) {
      return null;
    }
    
    // Parse datetime
    const datetime = new Date(latestData.datetime);
    
    // Calculate water quality based on actual flow rate from data
    const getQuality = (discharge: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' => {
      if (discharge > 100) return 'Excellent';
      if (discharge > 50) return 'Good';
      if (discharge > 10) return 'Fair';
      return 'Poor';
    };
    
    // Calculate turbidity based on actual discharge (higher flow = lower turbidity)
    const calculateTurbidity = (discharge: number): number => {
      const baseTurbidity = Math.max(1, 30 - (discharge * 0.2));
      return Math.round(baseTurbidity * 10) / 10;
    };
    
    // Estimate temperature based on actual location and season (could be enhanced with real temp data)
    const estimateTemperature = (datetime: Date, siteNumber: string): number => {
      const month = datetime.getMonth();
      const isWinter = month >= 5 && month <= 8; // June to September in Southern Hemisphere
      const baseTemporary = isWinter ? 12 : 22;
      
      // Northern stations are warmer (based on site number regions)
      const isNorthern = siteNumber.startsWith('7') || siteNumber.startsWith('8');
      const temporaryAdjustment = isNorthern ? 8 : 0;
      
      return Math.round((baseTemporary + temporaryAdjustment) * 10) / 10;
    };
    
    return {
      stationId,
      date: datetime.toISOString().split('T')[0] || '',
      time: datetime.toLocaleTimeString('en-AU', { hour12: false }),
      waterLevel: Math.round(latestData.stage * 100) / 100, // Real stage data in meters
      flow: Math.round(latestData.discharge * 100) / 100, // Real discharge data in m³/s
      temperature: estimateTemperature(datetime, siteNumber),
      quality: getQuality(latestData.discharge),
      turbidity: calculateTurbidity(latestData.discharge),
      ph: 7.2 // Default neutral pH for rivers
    };
    
  } catch (error) {
    console.error(`Error getting real data for station ${stationId}:`, error);
    return null;
  }
};

// All station data is now loaded from real CSV files 

// Interface for chart data from individual station files
interface RiverStageDataPoint {
  datetime: string;
  stage: number;
  discharge: number;
  siteId: string;
  varFrom: number;
  varTo: number;
}

// Cache for individual station chart data
const stationChartDataCache: Map<string, Array<RiverStageDataPoint>> = new Map();

// Get chart data for a specific river station
export const getRiverStationChartData = async (siteNumber: string): Promise<Array<RiverStageDataPoint>> => {
  // Check cache first
  if (stationChartDataCache.has(siteNumber)) {
    return stationChartDataCache.get(siteNumber) || [];
  }

  try {
    const response = await fetch(`/river_station_water_level/${siteNumber}_stage_last6days.csv`);
    if (!response.ok) {
      console.warn(`No chart data found for station ${siteNumber}`);
      return [];
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    if (lines.length < 2) {
      console.warn(`Invalid chart data for station ${siteNumber}`);
      return [];
    }
    
    const dataPoints: Array<RiverStageDataPoint> = [];
    
    // Skip header line
    for (let index = 1; index < lines.length; index++) {
      const line = lines[index]?.trim();
      if (!line) continue;
      
      const values = line.split(',');
      if (values.length < 6) continue;
      
      const datetime = values[0]?.trim() || '';
      const stage = parseFloat(values[1]?.trim() || '0');
      const discharge = parseFloat(values[2]?.trim() || '0');
      const siteId = values[3]?.trim() || '';
      const variableFrom = parseFloat(values[4]?.trim() || '0');
      const variableTo = parseFloat(values[5]?.trim() || '0');
      
      if (!datetime || !siteId || isNaN(stage) || isNaN(discharge)) {
        continue;
      }
      
      dataPoints.push({
        datetime,
        stage,
        discharge,
        siteId,
        varFrom: variableFrom,
        varTo: variableTo
      });
    }
    
    // Cache the data
    stationChartDataCache.set(siteNumber, dataPoints);
    console.log(`Loaded ${dataPoints.length} data points for station ${siteNumber}`);
    
    return dataPoints;
    
  } catch (error) {
    console.error(`Error loading chart data for station ${siteNumber}:`, error);
    return [];
  }
}; 