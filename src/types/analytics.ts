// Analytics and prediction type definitions for WA Emergency Dashboard

import type { EmergencyType, BushfireRating, FloodRating, RegionWithEmergency } from './emergency';

// Historical data types
export interface HistoricalRecord {
  date: string;
  emergencyData: {
    bushfire: {
      level: BushfireRating;
      severity: number;
    };
    flood: {
      level: FloodRating;
      severity: number;
    };
  };
  weatherData?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    rainfall: number;
  };
  confidence: number; // 0-1
}

export interface TrendAnalysis {
  period: 'week' | 'month' | 'season' | 'year';
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number; // percentage change
  confidence: number; // 0-1
  significantEvents: Array<{
    date: string;
    description: string;
    impact: number;
  }>;
}

// Prediction types
export interface PredictionModel {
  id: string;
  name: string;
  type: 'statistical' | 'machine_learning' | 'hybrid';
  accuracy: number; // 0-1
  lastTrained: string;
  features: Array<string>;
}

export interface AdvancedForecast {
  date: string;
  regionId: string;
  emergencyData: {
    bushfire: {
      level: BushfireRating;
      severity: number;
      probability: number; // 0-1
      factors: Array<{
        name: string;
        weight: number;
        value: number;
      }>;
    };
    flood: {
      level: FloodRating;
      severity: number;
      probability: number; // 0-1
      factors: Array<{
        name: string;
        weight: number;
        value: number;
      }>;
    };
  };
  confidence: number; // 0-1
  modelUsed: string;
  uncertaintyRange: {
    min: number;
    max: number;
  };
}

// Risk analysis types
export interface RiskFactor {
  id: string;
  name: string;
  category: 'weather' | 'geographic' | 'seasonal' | 'human';
  weight: number; // 0-1
  currentValue: number;
  historicalAverage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface RegionalRiskProfile {
  regionId: string;
  overallRiskScore: number; // 0-100
  riskFactors: Array<RiskFactor>;
  vulnerabilityIndex: number; // 0-1
  adaptationCapacity: number; // 0-1
  lastUpdated: string;
}

// Correlation analysis
export interface CorrelationAnalysis {
  variables: Array<string>;
  correlationMatrix: Array<Array<number>>;
  significantCorrelations: Array<{
    variable1: string;
    variable2: string;
    correlation: number;
    pValue: number;
    significance: 'low' | 'medium' | 'high';
  }>;
  insights: Array<string>;
}

// Alert system
export interface PredictiveAlert {
  id: string;
  regionId: string;
  type: EmergencyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  probability: number; // 0-1
  expectedDate: string;
  confidence: number; // 0-1
  recommendations: Array<string>;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}

// Analytics dashboard data
export interface AnalyticsDashboardData {
  summary: {
    totalRegions: number;
    activeAlerts: number;
    highRiskRegions: number;
    averageRiskScore: number;
    predictionAccuracy: number;
  };
  trends: {
    bushfireTrend: TrendAnalysis;
    floodTrend: TrendAnalysis;
    overallRiskTrend: TrendAnalysis;
  };
  predictions: Array<AdvancedForecast>;
  alerts: Array<PredictiveAlert>;
  correlations: CorrelationAnalysis;
  modelPerformance: Array<{
    modelId: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  }>;
}

// Time series data
export interface TimeSeriesData {
  timestamp: string;
  value: number;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface TimeSeriesAnalysis {
  data: Array<TimeSeriesData>;
  trend: TrendAnalysis;
  seasonality: {
    detected: boolean;
    period: number; // in days
    strength: number; // 0-1
  };
  anomalies: Array<{
    timestamp: string;
    value: number;
    anomalyScore: number;
    type: 'point' | 'contextual' | 'collective';
  }>;
  forecast: Array<TimeSeriesData>;
}

// Model evaluation
export interface ModelEvaluation {
  modelId: string;
  evaluationDate: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
    mse: number;
    mae: number;
  };
  confusionMatrix: Array<Array<number>>;
  featureImportance: Array<{
    feature: string;
    importance: number;
  }>;
  crossValidationResults: Array<{
    fold: number;
    accuracy: number;
    variance: number;
  }>;
}

// Export interfaces for analytics data processing
export interface AnalyticsQuery {
  regions?: Array<string>;
  dateRange: {
    start: string;
    end: string;
  };
  emergencyTypes?: Array<EmergencyType>;
  aggregationLevel: 'daily' | 'weekly' | 'monthly';
  includeForecasts?: boolean;
  includeCorrelations?: boolean;
}

export interface AnalyticsResponse<T> {
  data: T;
  query: AnalyticsQuery;
  computedAt: string;
  cacheExpiry?: string;
  metadata: {
    recordCount: number;
    processingTime: number;
    dataQuality: number; // 0-1
  };
} 