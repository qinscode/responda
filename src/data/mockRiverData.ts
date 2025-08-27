import type { RiverStation, RiverData } from '@/types/weather';

// Mock river stations in Western Australia
export const mockRiverStations: RiverStation[] = [
  {
    id: 'river-001',
    stationNumber: '610001',
    name: 'Swan River at Perth',
    latitude: -31.9505,
    longitude: 115.8605,
    state: 'WA',
    height: 5,
    openDate: '1/1990',
    closeDate: 'Active',
    district: 'Perth Metro',
    riverName: 'Swan River',
    catchmentArea: 121.2
  },
  {
    id: 'river-002',
    stationNumber: '614001',
    name: 'Murray River at Pinjarra',
    latitude: -32.6269,
    longitude: 115.8692,
    state: 'WA',
    height: 15,
    openDate: '3/1985',
    closeDate: 'Active',
    district: 'Peel',
    riverName: 'Murray River',
    catchmentArea: 6062.0
  },
  {
    id: 'river-003',
    stationNumber: '616005',
    name: 'Collie River at Allanson',
    latitude: -33.3456,
    longitude: 116.1234,
    state: 'WA',
    height: 45,
    openDate: '7/1992',
    closeDate: 'Active',
    district: 'South West',
    riverName: 'Collie River',
    catchmentArea: 2456.8
  },
  {
    id: 'river-004',
    stationNumber: '609101',
    name: 'Avon River at Northam',
    latitude: -31.6539,
    longitude: 116.6681,
    state: 'WA',
    height: 165,
    openDate: '5/1988',
    closeDate: 'Active',
    district: 'Wheatbelt',
    riverName: 'Avon River',
    catchmentArea: 3892.5
  },
  {
    id: 'river-005',
    stationNumber: '703002',
    name: 'Murchison River at Kalbarri',
    latitude: -27.7089,
    longitude: 114.1661,
    state: 'WA',
    height: 8,
    openDate: '9/1995',
    closeDate: 'Active',
    district: 'Mid West',
    riverName: 'Murchison River',
    catchmentArea: 82000.0
  },
  {
    id: 'river-006',
    stationNumber: '610015',
    name: 'Canning River at Kent Street',
    latitude: -31.9833,
    longitude: 115.8833,
    state: 'WA',
    height: 3,
    openDate: '12/1991',
    closeDate: 'Active',
    district: 'Perth Metro',
    riverName: 'Canning River',
    catchmentArea: 1829.4
  },
  {
    id: 'river-007',
    stationNumber: '617201',
    name: 'Blackwood River at Bridgetown',
    latitude: -33.9556,
    longitude: 116.1347,
    state: 'WA',
    height: 195,
    openDate: '2/1987',
    closeDate: 'Active',
    district: 'South West',
    riverName: 'Blackwood River',
    catchmentArea: 1540.2
  },
  {
    id: 'river-008',
    stationNumber: '801005',
    name: 'Fitzroy River at Fitzroy Crossing',
    latitude: -18.1833,
    longitude: 125.5667,
    state: 'WA',
    height: 114,
    openDate: '6/1983',
    closeDate: 'Active',
    district: 'Kimberley',
    riverName: 'Fitzroy River',
    catchmentArea: 93829.0
  },
  {
    id: 'river-009',
    stationNumber: '802107',
    name: 'Ord River at Kununurra',
    latitude: -15.7781,
    longitude: 128.7422,
    state: 'WA',
    height: 48,
    openDate: '11/1986',
    closeDate: 'Active',
    district: 'Kimberley',
    riverName: 'Ord River',
    catchmentArea: 46130.0
  },
  {
    id: 'river-010',
    stationNumber: '604003',
    name: 'Gascoyne River at Carnarvon',
    latitude: -24.8833,
    longitude: 113.6667,
    state: 'WA',
    height: 6,
    openDate: '4/1994',
    closeDate: 'Active',
    district: 'Gascoyne',
    riverName: 'Gascoyne River',
    catchmentArea: 68000.0
  }
];

// Generate mock river data
export const generateMockRiverData = (stationId: string): RiverData => {
  const now = new Date();
  const baseValues = {
    'river-001': { waterLevel: 2.1, flow: 15.5, temp: 18.5 },
    'river-002': { waterLevel: 1.8, flow: 42.3, temp: 19.2 },
    'river-003': { waterLevel: 1.2, flow: 8.7, temp: 16.8 },
    'river-004': { waterLevel: 0.9, flow: 3.2, temp: 20.1 },
    'river-005': { waterLevel: 0.6, flow: 1.8, temp: 22.5 },
    'river-006': { waterLevel: 1.5, flow: 12.1, temp: 18.9 },
    'river-007': { waterLevel: 2.3, flow: 25.6, temp: 17.4 },
    'river-008': { waterLevel: 3.8, flow: 156.2, temp: 24.8 },
    'river-009': { waterLevel: 4.2, flow: 89.7, temp: 26.3 },
    'river-010': { waterLevel: 0.4, flow: 0.8, temp: 23.7 }
  };

  const base = baseValues[stationId as keyof typeof baseValues] || { waterLevel: 1.5, flow: 10.0, temp: 20.0 };
  
  // Add some random variation
  const variation = 0.1;
  const waterLevel = base.waterLevel + (Math.random() - 0.5) * variation;
  const flow = base.flow + (Math.random() - 0.5) * base.flow * 0.2;
  const temperature = base.temp + (Math.random() - 0.5) * 3;

  const qualities: Array<'Excellent' | 'Good' | 'Fair' | 'Poor'> = ['Excellent', 'Good', 'Fair', 'Poor'];
  const qualityIndex = Math.floor(Math.random() * 4);
  
  return {
    stationId,
    date: now.toISOString().split('T')[0] || '',
    time: now.toLocaleTimeString('en-AU', { hour12: false }),
    waterLevel: Math.max(0, waterLevel),
    flow: Math.max(0, flow),
    temperature: temperature,
    quality: qualities[qualityIndex] || 'Good',
    turbidity: Math.random() * 20 + 5, // 5-25 NTU
    ph: Math.random() * 2 + 6.5 // 6.5-8.5
  };
};

export const getRiverDataForStation = async (stationId: string): Promise<RiverData | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  // Return mock data for river stations
  if (stationId.startsWith('river-')) {
    return generateMockRiverData(stationId);
  }
  
  return null;
}; 