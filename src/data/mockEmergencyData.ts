// Mock emergency data for WA Emergency Dashboard
// This simulates QGIS data output for development and testing

import type { RegionWithEmergency, EmergencyRating, BushfireRating, FloodRating } from '../types/emergency';
import { BUSHFIRE_RATINGS, FLOOD_RATINGS } from '../types/emergency';

// Re-export the rating constants for use in components
export { BUSHFIRE_RATINGS, FLOOD_RATINGS };

// Western Australia region boundaries (simplified coordinates)
const WA_REGIONS_GEOMETRY = {
  'perth-metro': {
    type: 'Polygon' as const,
    coordinates: [[[115.7, -32.1], [116.1, -32.1], [116.1, -31.7], [115.7, -31.7], [115.7, -32.1]]]
  },
  'pilbara': {
    type: 'Polygon' as const,
    coordinates: [[[117.0, -23.5], [121.0, -23.5], [121.0, -20.0], [117.0, -20.0], [117.0, -23.5]]]
  },
  'kimberley': {
    type: 'Polygon' as const,
    coordinates: [[[123.0, -18.5], [129.0, -18.5], [129.0, -14.0], [123.0, -14.0], [123.0, -18.5]]]
  },
  'goldfields-esperance': {
    type: 'Polygon' as const,
    coordinates: [[[119.0, -34.0], [125.0, -34.0], [125.0, -28.5], [119.0, -28.5], [119.0, -34.0]]]
  },
  'great-southern': {
    type: 'Polygon' as const,
    coordinates: [[[116.5, -35.0], [119.5, -35.0], [119.5, -33.0], [116.5, -33.0], [116.5, -35.0]]]
  },
  'mid-west': {
    type: 'Polygon' as const,
    coordinates: [[[114.0, -29.5], [118.0, -29.5], [118.0, -26.0], [114.0, -26.0], [114.0, -29.5]]]
  },
  'south-west': {
    type: 'Polygon' as const,
    coordinates: [[[115.0, -34.5], [116.5, -34.5], [116.5, -33.0], [115.0, -33.0], [115.0, -34.5]]]
  },
  'wheatbelt': {
    type: 'Polygon' as const,
    coordinates: [[[116.5, -32.0], [119.0, -32.0], [119.0, -29.0], [116.5, -29.0], [116.5, -32.0]]]
  },
  'gascoyne': {
    type: 'Polygon' as const,
    coordinates: [[[113.5, -26.5], [117.0, -26.5], [117.0, -23.5], [113.5, -23.5], [113.5, -26.5]]]
  },
  'peel': {
    type: 'Polygon' as const,
    coordinates: [[[115.5, -33.0], [116.2, -33.0], [116.2, -32.2], [115.5, -32.2], [115.5, -33.0]]]
  }
};

// Helper function to generate random emergency rating
const getRandomBushfireRating = (): EmergencyRating => {
  const ratings: Array<BushfireRating> = ['no-rating', 'low-moderate', 'high', 'very-high', 'severe', 'extreme'];
  const randomIndex = Math.floor(Math.random() * ratings.length);
  const randomRating = ratings[randomIndex]!;
  const ratingInfo = BUSHFIRE_RATINGS[randomRating];
  
  return {
    level: randomRating,
    description: `Current bushfire danger rating is ${ratingInfo.label.toLowerCase()}`,
    color: ratingInfo.color,
    severity: ratingInfo.severity,
    recommendations: getBushfireRecommendations(randomRating),
    lastUpdated: new Date().toISOString(),
  };
};

const getRandomFloodRating = (): EmergencyRating => {
  const ratings: Array<FloodRating> = ['no-warning', 'minor', 'moderate', 'major'];
  const randomIndex = Math.floor(Math.random() * ratings.length);
  const randomRating = ratings[randomIndex]!;
  const ratingInfo = FLOOD_RATINGS[randomRating];
  
  return {
    level: randomRating,
    description: `Current flood warning level is ${ratingInfo.label.toLowerCase()}`,
    color: ratingInfo.color,
    severity: ratingInfo.severity,
    recommendations: getFloodRecommendations(randomRating),
    lastUpdated: new Date().toISOString(),
  };
};

// Recommendations based on rating levels
const getBushfireRecommendations = (rating: BushfireRating): Array<string> => {
  const recommendations: Record<BushfireRating, Array<string>> = {
    'no-rating': ['Stay informed about weather conditions', 'Maintain defensible space around property'],
    'low-moderate': ['Plan and prepare', 'Stay informed', 'Maintain your bushfire survival plan'],
    'high': ['Be alert for fires in your area', 'Decide what you will do if a fire starts', 'Prepare your property'],
    'very-high': ['Take action now to protect your life and property', 'Monitor conditions', 'Enact your bushfire survival plan'],
    'severe': ['Take immediate action to survive', 'Monitor emergency broadcasts', 'Leave early or prepare to actively defend'],
    'extreme': ['For your survival, leave bushfire risk areas', 'Do not delay leaving', 'Emergency services may not be able to help'],
    'catastrophic': ['For your survival, leave bushfire risk areas immediately', 'Do not wait and see', 'These are the most dangerous conditions']
  };
  return recommendations[rating];
};

const getFloodRecommendations = (rating: FloodRating): Array<string> => {
  const recommendations: Record<FloodRating, Array<string>> = {
    'no-warning': ['Stay informed about weather conditions', 'Know your flood risk'],
    'minor': ['Be aware of potential flooding', 'Avoid unnecessary travel in affected areas', 'Monitor conditions'],
    'moderate': ['Prepare for isolation', 'Move to higher ground if necessary', 'Avoid flood waters'],
    'major': ['Major flooding expected', 'Evacuate if advised', 'Do not enter flood waters']
  };
  return recommendations[rating];
};

// Mock forecast data
const generateMockForecasts = () => {
  const forecasts = [];
  for (let index = 1; index <= 7; index++) {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const confidenceOptions = ['low', 'medium', 'high'] as const;
    const confidenceIndex = Math.floor(Math.random() * confidenceOptions.length);
    
    forecasts.push({
      date: date.toISOString().split('T')[0]!,
      emergencyData: {
        bushfire: getRandomBushfireRating(),
        flood: getRandomFloodRating(),
      },
      confidence: confidenceOptions[confidenceIndex]!
    });
  }
  return forecasts;
};

// Calculate polygon center (simplified)
const calculateCenter = (geometry: any): [number, number] => {
  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates[0];
    const lngs = coords.map((coord: Array<number>) => coord[0]);
    const lats = coords.map((coord: Array<number>) => coord[1]);
    return [
      lngs.reduce((a: number, b: number) => a + b) / lngs.length,
      lats.reduce((a: number, b: number) => a + b) / lats.length
    ];
  }
  return [115.8605, -31.9505]; // Default to Perth center
};

// Calculate polygon bounds (simplified)
const calculateBounds = (geometry: any): [[number, number], [number, number]] => {
  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates[0];
    const lngs = coords.map((coord: Array<number>) => coord[0]);
    const lats = coords.map((coord: Array<number>) => coord[1]);
    return [
      [Math.min(...lngs), Math.min(...lats)], // Southwest
      [Math.max(...lngs), Math.max(...lats)]  // Northeast
    ];
  }
  return [[115.0, -35.0], [129.0, -14.0]]; // Default WA bounds
};

// Main mock data
export const MOCK_WA_REGIONS: Array<RegionWithEmergency> = [
  {
    id: 'wa-perth-metro',
    name: 'Perth Metro',
    slug: 'perth-metro',
    geometry: WA_REGIONS_GEOMETRY['perth-metro'],
    center: calculateCenter(WA_REGIONS_GEOMETRY['perth-metro']),
    bounds: calculateBounds(WA_REGIONS_GEOMETRY['perth-metro']),
    localGovernmentAreas: ['City of Perth', 'City of Fremantle', 'City of Joondalup', 'City of Wanneroo'],
    population: 2100000,
    area: 6417,
    emergencyData: {
      bushfire: {
        level: 'high',
        description: 'Current bushfire danger rating is high',
        color: BUSHFIRE_RATINGS.high.color,
        severity: BUSHFIRE_RATINGS.high.severity,
        recommendations: getBushfireRecommendations('high'),
        lastUpdated: new Date().toISOString(),
      },
      flood: {
        level: 'no-warning',
        description: 'No current flood warnings',
        color: FLOOD_RATINGS['no-warning'].color,
        severity: FLOOD_RATINGS['no-warning'].severity,
        recommendations: getFloodRecommendations('no-warning'),
        lastUpdated: new Date().toISOString(),
      }
    },
    forecasts: generateMockForecasts(),
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'wa-pilbara',
    name: 'Pilbara',
    slug: 'pilbara',
    geometry: WA_REGIONS_GEOMETRY['pilbara'],
    center: calculateCenter(WA_REGIONS_GEOMETRY['pilbara']),
    bounds: calculateBounds(WA_REGIONS_GEOMETRY['pilbara']),
    localGovernmentAreas: ['City of Karratha', 'Town of Port Hedland', 'Shire of East Pilbara'],
    population: 65000,
    area: 507896,
    emergencyData: {
      bushfire: {
        level: 'severe',
        description: 'Current bushfire danger rating is severe',
        color: BUSHFIRE_RATINGS.severe.color,
        severity: BUSHFIRE_RATINGS.severe.severity,
        recommendations: getBushfireRecommendations('severe'),
        lastUpdated: new Date().toISOString(),
      },
      flood: {
        level: 'minor',
        description: 'Minor flooding possible in low-lying areas',
        color: FLOOD_RATINGS.minor.color,
        severity: FLOOD_RATINGS.minor.severity,
        recommendations: getFloodRecommendations('minor'),
        lastUpdated: new Date().toISOString(),
      }
    },
    forecasts: generateMockForecasts(),
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'wa-kimberley',
    name: 'Kimberley',
    slug: 'kimberley',
    geometry: WA_REGIONS_GEOMETRY['kimberley'],
    center: calculateCenter(WA_REGIONS_GEOMETRY['kimberley']),
    bounds: calculateBounds(WA_REGIONS_GEOMETRY['kimberley']),
    localGovernmentAreas: ['Shire of Broome', 'Shire of Derby-West Kimberley', 'Shire of Halls Creek'],
    population: 40000,
    area: 423517,
    emergencyData: {
      bushfire: {
        level: 'low-moderate',
        description: 'Current bushfire danger rating is low to moderate',
        color: BUSHFIRE_RATINGS['low-moderate'].color,
        severity: BUSHFIRE_RATINGS['low-moderate'].severity,
        recommendations: getBushfireRecommendations('low-moderate'),
        lastUpdated: new Date().toISOString(),
      },
      flood: {
        level: 'major',
        description: 'Major flooding expected in river areas',
        color: FLOOD_RATINGS.major.color,
        severity: FLOOD_RATINGS.major.severity,
        recommendations: getFloodRecommendations('major'),
        lastUpdated: new Date().toISOString(),
      }
    },
    forecasts: generateMockForecasts(),
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'wa-goldfields-esperance',
    name: 'Goldfields-Esperance',
    slug: 'goldfields-esperance',
    geometry: WA_REGIONS_GEOMETRY['goldfields-esperance'],
    center: calculateCenter(WA_REGIONS_GEOMETRY['goldfields-esperance']),
    bounds: calculateBounds(WA_REGIONS_GEOMETRY['goldfields-esperance']),
    localGovernmentAreas: ['City of Kalgoorlie-Boulder', 'Shire of Esperance', 'Shire of Coolgardie'],
    population: 60000,
    area: 771276,
    emergencyData: {
      bushfire: {
        level: 'very-high',
        description: 'Current bushfire danger rating is very high',
        color: BUSHFIRE_RATINGS['very-high'].color,
        severity: BUSHFIRE_RATINGS['very-high'].severity,
        recommendations: getBushfireRecommendations('very-high'),
        lastUpdated: new Date().toISOString(),
      },
      flood: {
        level: 'no-warning',
        description: 'No current flood warnings',
        color: FLOOD_RATINGS['no-warning'].color,
        severity: FLOOD_RATINGS['no-warning'].severity,
        recommendations: getFloodRecommendations('no-warning'),
        lastUpdated: new Date().toISOString(),
      }
    },
    forecasts: generateMockForecasts(),
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'wa-great-southern',
    name: 'Great Southern',
    slug: 'great-southern',
    geometry: WA_REGIONS_GEOMETRY['great-southern'],
    center: calculateCenter(WA_REGIONS_GEOMETRY['great-southern']),
    bounds: calculateBounds(WA_REGIONS_GEOMETRY['great-southern']),
    localGovernmentAreas: ['City of Albany', 'Shire of Katanning', 'Shire of Denmark'],
    population: 68000,
    area: 39007,
    emergencyData: {
      bushfire: {
        level: 'extreme',
        description: 'Current bushfire danger rating is extreme',
        color: BUSHFIRE_RATINGS.extreme.color,
        severity: BUSHFIRE_RATINGS.extreme.severity,
        recommendations: getBushfireRecommendations('extreme'),
        lastUpdated: new Date().toISOString(),
      },
      flood: {
        level: 'moderate',
        description: 'Moderate flooding expected in some areas',
        color: FLOOD_RATINGS.moderate.color,
        severity: FLOOD_RATINGS.moderate.severity,
        recommendations: getFloodRecommendations('moderate'),
        lastUpdated: new Date().toISOString(),
      }
    },
    forecasts: generateMockForecasts(),
    lastUpdated: new Date().toISOString(),
  }
];

// Generate additional mock regions with random data
const additionalRegions: Array<RegionWithEmergency> = [
  'Mid West', 'South West', 'Wheatbelt', 'Gascoyne', 'Peel'
].map((name) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const geometryKey = slug as keyof typeof WA_REGIONS_GEOMETRY;
  
  return {
    id: `wa-${slug}`,
    name,
    slug,
    geometry: WA_REGIONS_GEOMETRY[geometryKey],
    center: calculateCenter(WA_REGIONS_GEOMETRY[geometryKey]),
    bounds: calculateBounds(WA_REGIONS_GEOMETRY[geometryKey]),
    localGovernmentAreas: [`${name} Region`, `${name} Shire`],
    population: Math.floor(Math.random() * 100000) + 10000,
    area: Math.floor(Math.random() * 50000) + 1000,
    emergencyData: {
      bushfire: getRandomBushfireRating(),
      flood: getRandomFloodRating(),
    },
    forecasts: generateMockForecasts(),
    lastUpdated: new Date().toISOString(),
  };
});

export const getAllMockRegions = (): Array<RegionWithEmergency> => {
  return [...MOCK_WA_REGIONS, ...additionalRegions];
};

// Mock QGIS API response format
export const getMockQGISResponse = () => {
  const regions = getAllMockRegions();
  
  return {
    type: 'FeatureCollection' as const,
    features: regions.map(region => ({
      type: 'Feature' as const,
      properties: {
        region_id: region.id,
        region_name: region.name,
        bushfire_rating: region.emergencyData.bushfire.level,
        flood_rating: region.emergencyData.flood.level,
        last_updated: region.lastUpdated,
        local_govt_areas: region.localGovernmentAreas.join(','),
        population: region.population,
        area: region.area,
      },
      geometry: region.geometry,
    })),
  };
};

// Utility functions for testing and development
export const getRegionById = (id: string): RegionWithEmergency | undefined => {
  return getAllMockRegions().find(region => region.id === id);
};

export const getRegionsByEmergencyType = (type: 'bushfire' | 'flood', minSeverity = 0): Array<RegionWithEmergency> => {
  return getAllMockRegions().filter(region => 
    region.emergencyData[type].severity >= minSeverity
  );
};

export const updateRegionRating = (regionId: string, type: 'bushfire' | 'flood', newRating: any) => {
  // This would be used in a real implementation to update ratings
  console.log(`Updating ${regionId} ${type} rating to ${newRating}`);
}; 