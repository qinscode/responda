// Mock analytics data for testing and development
import type { 
  TimeSeriesAnalysis, 
  AdvancedForecast, 
  PredictiveAlert, 
  PredictionModel,
  RegionalRiskProfile,
  CorrelationAnalysis,
  AnalyticsDashboardData
} from '@/types/analytics';
import type { BushfireRating, FloodRating } from '@/types/emergency';
import { getAllMockRegions } from './mockEmergencyData';

// Generate mock time series data
const generateTimeSeriesData = (days: number = 30, startValue: number = 2) => {
  const data = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add some randomness and trend
    const trend = Math.sin(i * 0.1) * 0.5;
    const noise = (Math.random() - 0.5) * 1;
    const value = Math.max(0, Math.min(6, startValue + trend + noise));
    
    data.push({
      timestamp: date.toISOString(),
      value,
      confidence: 0.7 + Math.random() * 0.3,
      metadata: {
        temperature: 20 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
        windSpeed: Math.random() * 25
      }
    });
  }
  
  return data;
};

// Generate forecast data
const generateForecastData = (days: number = 7, lastValue: number = 2) => {
  const data = [];
  const today = new Date();
  
  for (let i = 1; i <= days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Forecast tends to be less certain further out
    const uncertainty = i * 0.1;
    const trend = Math.sin(i * 0.2) * 0.3;
    const value = Math.max(0, Math.min(6, lastValue + trend + (Math.random() - 0.5) * uncertainty));
    
    data.push({
      timestamp: date.toISOString(),
      value,
      confidence: Math.max(0.3, 0.9 - uncertainty),
      metadata: {}
    });
  }
  
  return data;
};

// Generate anomalies
const generateAnomalies = (timeSeriesData: Array<any>) => {
  const anomalies = [];
  
  // Randomly select some points as anomalies
  for (let i = 0; i < timeSeriesData.length; i++) {
    if (Math.random() < 0.1) { // 10% chance of anomaly
      anomalies.push({
        timestamp: timeSeriesData[i].timestamp,
        value: timeSeriesData[i].value,
        anomalyScore: 0.6 + Math.random() * 0.4,
        type: ['point', 'contextual', 'collective'][Math.floor(Math.random() * 3)] as any
      });
    }
  }
  
  return anomalies;
};

// Mock time series analysis data
export const mockBushfireTimeSeriesAnalysis: TimeSeriesAnalysis = {
  data: generateTimeSeriesData(60, 2.5),
  trend: {
    period: 'month',
    trend: 'increasing',
    changeRate: 15.3,
    confidence: 0.82,
    significantEvents: [
      {
        date: '2024-01-15',
        description: 'Extreme heat wave event',
        impact: 1.2
      },
      {
        date: '2024-01-22',
        description: 'High wind conditions',
        impact: 0.8
      }
    ]
  },
  seasonality: {
    detected: true,
    period: 365,
    strength: 0.75
  },
  anomalies: [],
  forecast: generateForecastData(14, 2.5)
};

// Initialize anomalies after data is created
mockBushfireTimeSeriesAnalysis.anomalies = generateAnomalies(mockBushfireTimeSeriesAnalysis.data);

export const mockFloodTimeSeriesAnalysis: TimeSeriesAnalysis = {
  data: generateTimeSeriesData(60, 1.5),
  trend: {
    period: 'month',
    trend: 'stable',
    changeRate: -2.1,
    confidence: 0.91,
    significantEvents: [
      {
        date: '2024-01-10',
        description: 'Heavy rainfall period',
        impact: 1.5
      }
    ]
  },
  seasonality: {
    detected: true,
    period: 180,
    strength: 0.65
  },
  anomalies: [],
  forecast: generateForecastData(14, 1.5)
};

mockFloodTimeSeriesAnalysis.anomalies = generateAnomalies(mockFloodTimeSeriesAnalysis.data);

// Mock prediction models
export const mockPredictionModels: Array<PredictionModel> = [
  {
    id: 'ensemble-v2',
    name: 'Ensemble Weather Model v2',
    type: 'hybrid',
    accuracy: 0.89,
    lastTrained: '2024-01-20T00:00:00Z',
    features: ['temperature', 'humidity', 'wind_speed', 'rainfall', 'soil_moisture', 'vegetation_index']
  },
  {
    id: 'lstm-temporal',
    name: 'LSTM Temporal Predictor',
    type: 'machine_learning',
    accuracy: 0.85,
    lastTrained: '2024-01-18T00:00:00Z',
    features: ['historical_patterns', 'seasonal_trends', 'weather_forecasts', 'geographic_factors']
  },
  {
    id: 'statistical-baseline',
    name: 'Statistical Baseline Model',
    type: 'statistical',
    accuracy: 0.76,
    lastTrained: '2024-01-15T00:00:00Z',
    features: ['historical_average', 'seasonal_adjustment', 'trend_component']
  }
];

// Mock advanced forecasts
export const mockAdvancedForecasts: Array<AdvancedForecast> = getAllMockRegions().slice(0, 5).flatMap(region => {
  const forecasts = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const bushfireLevel: BushfireRating = ['no-rating', 'low-moderate', 'high', 'very-high', 'severe'][
      Math.floor(Math.random() * 5)
    ] as BushfireRating;
    
    const floodLevel: FloodRating = ['no-warning', 'minor', 'moderate', 'major'][
      Math.floor(Math.random() * 4)
    ] as FloodRating;
    
    forecasts.push({
      date: date.toISOString().split('T')[0]!,
      regionId: region.id,
      emergencyData: {
        bushfire: {
          level: bushfireLevel,
          severity: Math.floor(Math.random() * 6),
          probability: 0.3 + Math.random() * 0.6,
          factors: [
            { name: 'Temperature', weight: 0.3, value: 25 + Math.random() * 15 },
            { name: 'Wind Speed', weight: 0.25, value: Math.random() * 30 },
            { name: 'Humidity', weight: 0.2, value: 30 + Math.random() * 40 },
            { name: 'Fuel Load', weight: 0.25, value: Math.random() * 100 }
          ]
        },
        flood: {
          level: floodLevel,
          severity: Math.floor(Math.random() * 4),
          probability: 0.2 + Math.random() * 0.5,
          factors: [
            { name: 'Rainfall', weight: 0.4, value: Math.random() * 50 },
            { name: 'River Level', weight: 0.3, value: Math.random() * 10 },
            { name: 'Soil Saturation', weight: 0.2, value: Math.random() * 100 },
            { name: 'Drainage Capacity', weight: 0.1, value: 50 + Math.random() * 50 }
          ]
        }
      },
      confidence: 0.6 + Math.random() * 0.3,
      modelUsed: mockPredictionModels[Math.floor(Math.random() * mockPredictionModels.length)]!.id,
      uncertaintyRange: {
        min: Math.random() * 2,
        max: 4 + Math.random() * 2
      }
    });
  }
  return forecasts;
});

// Mock predictive alerts
export const mockPredictiveAlerts: Array<PredictiveAlert> = [
  {
    id: 'alert-001',
    regionId: 'wa-pilbara',
    type: 'bushfire',
    severity: 'high',
    title: 'Elevated Bushfire Risk Predicted',
    description: 'Weather patterns indicate high bushfire risk developing over the next 3 days due to rising temperatures and low humidity.',
    probability: 0.78,
    expectedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    confidence: 0.85,
    recommendations: [
      'Monitor weather conditions closely',
      'Prepare fire suppression resources',
      'Issue public warnings if conditions deteriorate'
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'alert-002',
    regionId: 'wa-kimberley',
    type: 'flood',
    severity: 'medium',
    title: 'Potential Flooding in River Areas',
    description: 'Rainfall forecasts suggest possible minor to moderate flooding in low-lying areas within 24-48 hours.',
    probability: 0.65,
    expectedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    confidence: 0.72,
    recommendations: [
      'Monitor river levels',
      'Prepare evacuation routes',
      'Advise residents in flood-prone areas'
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock regional risk profiles
export const mockRegionalRiskProfiles: Array<RegionalRiskProfile> = getAllMockRegions().map(region => ({
  regionId: region.id,
  overallRiskScore: 30 + Math.random() * 60, // 30-90 range
  riskFactors: [
    {
      id: 'temp-factor',
      name: 'Temperature',
      category: 'weather',
      weight: 0.25,
      currentValue: 25 + Math.random() * 15,
      historicalAverage: 28,
      trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any
    },
    {
      id: 'humidity-factor',
      name: 'Humidity',
      category: 'weather',
      weight: 0.2,
      currentValue: 40 + Math.random() * 40,
      historicalAverage: 55,
      trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any
    },
    {
      id: 'elevation-factor',
      name: 'Elevation Risk',
      category: 'geographic',
      weight: 0.15,
      currentValue: Math.random() * 100,
      historicalAverage: 50,
      trend: 'stable'
    },
    {
      id: 'population-factor',
      name: 'Population Density',
      category: 'human',
      weight: 0.1,
      currentValue: Math.random() * 100,
      historicalAverage: 45,
      trend: 'increasing'
    },
    {
      id: 'seasonal-factor',
      name: 'Seasonal Risk',
      category: 'seasonal',
      weight: 0.3,
      currentValue: 60 + Math.random() * 30,
      historicalAverage: 65,
      trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any
    }
  ],
  vulnerabilityIndex: 0.3 + Math.random() * 0.6,
  adaptationCapacity: 0.2 + Math.random() * 0.7,
  lastUpdated: new Date().toISOString()
}));

// Mock correlation analysis
export const mockCorrelationAnalysis: CorrelationAnalysis = {
  variables: ['temperature', 'humidity', 'wind_speed', 'rainfall', 'bushfire_risk', 'flood_risk'],
  correlationMatrix: [
    [1.0, -0.65, 0.45, -0.23, 0.78, -0.12],
    [-0.65, 1.0, -0.32, 0.55, -0.58, 0.67],
    [0.45, -0.32, 1.0, -0.18, 0.62, -0.25],
    [-0.23, 0.55, -0.18, 1.0, -0.34, 0.89],
    [0.78, -0.58, 0.62, -0.34, 1.0, -0.45],
    [-0.12, 0.67, -0.25, 0.89, -0.45, 1.0]
  ],
  significantCorrelations: [
    {
      variable1: 'temperature',
      variable2: 'bushfire_risk',
      correlation: 0.78,
      pValue: 0.0001,
      significance: 'high'
    },
    {
      variable1: 'rainfall',
      variable2: 'flood_risk',
      correlation: 0.89,
      pValue: 0.0000,
      significance: 'high'
    },
    {
      variable1: 'temperature',
      variable2: 'humidity',
      correlation: -0.65,
      pValue: 0.002,
      significance: 'medium'
    },
    {
      variable1: 'humidity',
      variable2: 'flood_risk',
      correlation: 0.67,
      pValue: 0.001,
      significance: 'high'
    }
  ],
  insights: [
    'Strong positive correlation between temperature and bushfire risk (r=0.78)',
    'Rainfall is the strongest predictor of flood risk (r=0.89)',
    'Temperature and humidity show inverse relationship during summer months',
    'Wind speed moderately correlates with bushfire spread potential'
  ]
};

// Combined analytics dashboard data
export const mockAnalyticsDashboardData: AnalyticsDashboardData = {
  summary: {
    totalRegions: getAllMockRegions().length,
    activeAlerts: mockPredictiveAlerts.filter(alert => alert.isActive).length,
    highRiskRegions: mockRegionalRiskProfiles.filter(profile => profile.overallRiskScore > 70).length,
    averageRiskScore: mockRegionalRiskProfiles.reduce((sum, profile) => sum + profile.overallRiskScore, 0) / mockRegionalRiskProfiles.length,
    predictionAccuracy: 0.847
  },
  trends: {
    bushfireTrend: mockBushfireTimeSeriesAnalysis.trend,
    floodTrend: mockFloodTimeSeriesAnalysis.trend,
    overallRiskTrend: {
      period: 'month',
      trend: 'increasing',
      changeRate: 8.5,
      confidence: 0.79,
      significantEvents: [
        {
          date: '2024-01-15',
          description: 'Climate pattern shift detected',
          impact: 0.6
        }
      ]
    }
  },
  predictions: mockAdvancedForecasts,
  alerts: mockPredictiveAlerts,
  correlations: mockCorrelationAnalysis,
  modelPerformance: mockPredictionModels.map(model => ({
    modelId: model.id,
    accuracy: model.accuracy,
    precision: model.accuracy + (Math.random() - 0.5) * 0.1,
    recall: model.accuracy + (Math.random() - 0.5) * 0.1,
    f1Score: model.accuracy + (Math.random() - 0.5) * 0.05
  }))
};

// Note: All mock data exported at declaration points above 