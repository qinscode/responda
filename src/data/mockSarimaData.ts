// Mock SARIMA data for the flood risk prediction chart
import { RiverStation, generateSeedFromCoordinates, SeededRandom } from './riverStations';

export interface SarimaDataPoint {
  date: string;
  day: number;
  discharge: number;
  type: 'train' | 'test' | 'forecast';
}

// Create river discharge data showing clear seasonal patterns with long-term trend
export const generateSarimaFloodData = (station?: RiverStation): SarimaDataPoint[] => {
  const data: SarimaDataPoint[] = [];
  
  // Generate seed from station coordinates if provided, otherwise use default
  const seed = station ? generateSeedFromCoordinates(station.latitude, station.longitude) : 12345;
  const rng = new SeededRandom(seed);
  
  // Station-specific parameters
  const baseDischarge = rng.nextInRange(80, 150); // Base discharge varies by station
  const amplitude = rng.nextInRange(40, 80); // Wave amplitude varies by station
  const trendStrength = rng.nextInRange(15, 35); // Trend strength varies by station
  const noiseLevel = rng.nextInRange(5, 15); // Noise level varies by station
  
  // Training data (Day 25-28) - Historical data showing clear seasonal cycles
  const trainData = [];
  
  for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
    const currentDay = 25 + dayOffset;
    const dayBaseLevel = baseDischarge + (dayOffset * trendStrength);
    
    // Generate 10 points per day for smooth curves
    for (let pointInDay = 0; pointInDay < 10; pointInDay++) {
      const timeInDay = pointInDay / 10;
      const absoluteTime = dayOffset + timeInDay;
      
      // Seasonal pattern with some randomness
      const seasonalValue = amplitude * Math.sin(2 * Math.PI * absoluteTime + rng.nextInRange(0, 0.5));
      const trendValue = dayBaseLevel + (absoluteTime * trendStrength * 0.3);
      const noise = rng.nextInRange(-noiseLevel, noiseLevel);
      
      const discharge = Math.max(50, trendValue + seasonalValue + noise);
      
      trainData.push({
        day: currentDay + timeInDay,
        discharge: Math.round(discharge)
      });
    }
  }

  // Add training data
  trainData.forEach(point => {
    data.push({
      date: `Day ${Math.floor(point.day)}`,
      day: point.day,
      discharge: point.discharge,
      type: 'train'
    });
  });

  // Test data (Day 28.8-30) - Validation data continuing the seasonal pattern
  const testData = [];
  
  for (let dayOffset = 3.8; dayOffset < 6; dayOffset += 0.1) {
    const currentDay = 25 + dayOffset;
    const dayBaseLevel = baseDischarge + (dayOffset * trendStrength);
    
    // Continue the seasonal pattern
    const seasonalValue = amplitude * Math.sin(2 * Math.PI * dayOffset + rng.nextInRange(0, 0.3));
    const trendValue = dayBaseLevel + (dayOffset * trendStrength * 0.4);
    const noise = rng.nextInRange(-noiseLevel * 0.8, noiseLevel * 0.8);
    
    const discharge = Math.max(100, trendValue + seasonalValue + noise);
    
    testData.push({
      day: currentDay,
      discharge: Math.round(discharge)
    });
  }

  testData.forEach(point => {
    data.push({
      date: `Day ${Math.floor(point.day)}`,
      day: point.day,
      discharge: point.discharge,
      type: 'test'
    });
  });

  // Forecast data (Day 30.5-32) - SARIMA prediction showing continued seasonal pattern
  const forecastData = [];
  
  for (let dayOffset = 5.5; dayOffset < 7.5; dayOffset += 0.1) {
    const currentDay = 25 + dayOffset;
    const dayBaseLevel = baseDischarge + (dayOffset * trendStrength);
    
    // Forecast pattern with dampening and uncertainty
    const dampening = Math.exp(-(dayOffset - 5.5) * 0.2); // Gradual dampening
    const seasonalValue = amplitude * Math.sin(2 * Math.PI * dayOffset + rng.nextInRange(0, 0.4)) * dampening;
    const trendValue = dayBaseLevel + (dayOffset * trendStrength * 0.5);
    const uncertainty = rng.nextInRange(-noiseLevel * 1.2, noiseLevel * 1.2);
    
    const discharge = Math.max(150, trendValue + seasonalValue + uncertainty);
    
    forecastData.push({
      day: currentDay,
      discharge: Math.round(discharge)
    });
  }

  forecastData.forEach(point => {
    data.push({
      date: `Day ${Math.floor(point.day)}`,
      day: point.day,
      discharge: point.discharge,
      type: 'forecast'
    });
  });

  return data.sort((a, b) => a.day - b.day);
};

// Default export for backward compatibility
export const mockSarimaFloodData = generateSarimaFloodData(); 