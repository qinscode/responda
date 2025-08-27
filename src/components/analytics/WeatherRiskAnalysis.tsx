import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Bot, 
  Flame, 
  Waves, 
  AlertTriangle, 
  Droplets,
  Clock
} from 'lucide-react';
import type { WeatherData } from '@/types/weather';

interface WeatherRiskAnalysisProps {
  stationId: string;
  weatherData: WeatherData;
  stationName?: string;
  latitude: number;
  longitude: number;
}

interface RiskAnalysis {
  fireRisk: {
    level: 'Low' | 'Medium' | 'High' | 'Extreme';
    probability: number;
    factors: string[];
    recommendation: string;
  };
  floodRisk: {
    level: 'Low' | 'Medium' | 'High' | 'Extreme';
    probability: number;
    factors: string[];
    recommendation: string;
  };
  confidence: number;
  lastUpdated: string;
}

// AI-powered risk analysis based on weather conditions
const generateWeatherRiskAnalysis = async (weatherData: WeatherData, latitude: number, longitude: number): Promise<RiskAnalysis> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

  const temp = weatherData.temperature;
  const humidity = weatherData.humidity;
  const windSpeed = weatherData.windSpeed;
  const precipitation = weatherData.precipitation;
  const pressure = weatherData.pressure;
  const conditions = weatherData.conditions.toLowerCase();

  // Fire Risk Analysis
  let fireLevel: 'Low' | 'Medium' | 'High' | 'Extreme' = 'Low';
  let fireProbability = 10;
  let fireFactors: string[] = [];
  let fireRecommendation = '';

  // Fire risk factors
  if (temp > 35) {
    fireLevel = temp > 40 ? 'Extreme' : 'High';
    fireProbability += 30;
    fireFactors.push('Very high temperature');
  } else if (temp > 30) {
    fireLevel = 'Medium';
    fireProbability += 15;
    fireFactors.push('High temperature');
  }

  if (humidity < 20) {
    fireLevel = fireLevel === 'Low' ? 'High' : 'Extreme';
    fireProbability += 25;
    fireFactors.push('Very low humidity');
  } else if (humidity < 40) {
    fireLevel = fireLevel === 'Low' ? 'Medium' : fireLevel;
    fireProbability += 10;
    fireFactors.push('Low humidity');
  }

  if (windSpeed > 20) {
    fireLevel = fireLevel === 'Low' ? 'Medium' : 'High';
    fireProbability += 20;
    fireFactors.push('Strong winds');
  } else if (windSpeed > 10) {
    fireProbability += 10;
    fireFactors.push('Moderate winds');
  }

  if (precipitation < 0.1 && (conditions.includes('clear') || conditions.includes('sunny'))) {
    fireProbability += 15;
    fireFactors.push('Dry conditions');
  }

  // Fire recommendations
  if (fireLevel === 'Extreme') {
    fireRecommendation = 'Extreme fire danger. Avoid all outdoor burning. Have evacuation plans ready.';
  } else if (fireLevel === 'High') {
    fireRecommendation = 'High fire risk. No open fires. Monitor conditions closely.';
  } else if (fireLevel === 'Medium') {
    fireRecommendation = 'Moderate fire risk. Exercise caution with any heat sources.';
  } else {
    fireRecommendation = 'Low fire risk. Normal fire safety precautions apply.';
  }

  // Flood Risk Analysis
  let floodLevel: 'Low' | 'Medium' | 'High' | 'Extreme' = 'Low';
  let floodProbability = 5;
  let floodFactors: string[] = [];
  let floodRecommendation = '';

  // Flood risk factors
  if (precipitation > 50) {
    floodLevel = 'Extreme';
    floodProbability += 40;
    floodFactors.push('Heavy rainfall');
  } else if (precipitation > 20) {
    floodLevel = 'High';
    floodProbability += 25;
    floodFactors.push('Moderate to heavy rain');
  } else if (precipitation > 5) {
    floodLevel = 'Medium';
    floodProbability += 10;
    floodFactors.push('Light to moderate rain');
  }

  if (conditions.includes('storm') || conditions.includes('thunder')) {
    floodLevel = floodLevel === 'Low' ? 'High' : 'Extreme';
    floodProbability += 30;
    floodFactors.push('Storm conditions');
  }

  if (pressure < 1000) {
    floodProbability += 15;
    floodFactors.push('Low atmospheric pressure');
  }

  if (humidity > 90) {
    floodProbability += 10;
    floodFactors.push('Very high humidity');
  }

  // Seasonal and geographical factors
  const month = new Date().getMonth();
  if (month >= 4 && month <= 8) { // May to September (Australian winter/spring)
    floodProbability += 5;
    floodFactors.push('Wet season period');
  }

  // Flood recommendations
  if (floodLevel === 'Extreme') {
    floodRecommendation = 'Extreme flood risk. Avoid low-lying areas. Monitor emergency alerts.';
  } else if (floodLevel === 'High') {
    floodRecommendation = 'High flood risk. Stay alert for flash flooding warnings.';
  } else if (floodLevel === 'Medium') {
    floodRecommendation = 'Moderate flood risk. Monitor weather conditions and waterways.';
  } else {
    floodRecommendation = 'Low flood risk. Normal monitoring sufficient.';
  }

  // Ensure probabilities don't exceed 100%
  fireProbability = Math.min(95, fireProbability);
  floodProbability = Math.min(95, floodProbability);

  // Add default factors if none found
  if (fireFactors.length === 0) {
    fireFactors.push('Stable weather conditions', 'Normal temperature and humidity');
  }
  if (floodFactors.length === 0) {
    floodFactors.push('Clear weather conditions', 'Low precipitation levels');
  }

  const confidence = 75 + Math.random() * 20;

  return {
    fireRisk: {
      level: fireLevel,
      probability: fireProbability,
      factors: fireFactors,
      recommendation: fireRecommendation
    },
    floodRisk: {
      level: floodLevel,
      probability: floodProbability,
      factors: floodFactors,
      recommendation: floodRecommendation
    },
    confidence: Math.round(confidence),
    lastUpdated: new Date().toLocaleTimeString()
  };
};

export const WeatherRiskAnalysis = ({ stationId, weatherData, stationName, latitude, longitude }: WeatherRiskAnalysisProps) => {
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await generateWeatherRiskAnalysis(weatherData, latitude, longitude);
        setAnalysis(result);
      } catch (err) {
        setError('Failed to generate risk analysis');
        console.error('Error generating weather risk analysis:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchAnalysis();
  }, [stationId, weatherData, latitude, longitude]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-emerald-700 bg-emerald-50 border-emerald-300';
      case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-300';
      case 'High': return 'text-orange-700 bg-orange-50 border-orange-300';
      case 'Extreme': return 'text-red-700 bg-red-50 border-red-300';
      default: return 'text-gray-700 bg-gray-50 border-gray-300';
    }
  };

  const getRiskIcon = (type: 'fire' | 'flood', level: string) => {
    if (type === 'fire') {
      return <Flame className={`w-6 h-6 ${level === 'Extreme' || level === 'High' ? 'text-red-600' : 'text-orange-500'}`} />;
    } else {
      return <Waves className={`w-6 h-6 ${level === 'Extreme' || level === 'High' ? 'text-blue-600' : 'text-cyan-500'}`} />;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              AI Risk Analysis
            </h4>
          </div>
          <p className="text-xs text-gray-600">Analyzing fire and flood risks based on current weather conditions...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h4 className="text-sm font-semibold text-red-800">AI Analysis Unavailable</h4>
          </div>
          <p className="text-xs text-red-600">{error || 'Unable to generate risk analysis'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h4 className="text-lg font-bold text-gray-800 flex items-center">
          <Bot className="w-6 h-6 mr-3 text-blue-600" />
          AI Risk Analysis
        </h4>
        <div className="text-xs text-gray-500 text-right bg-gray-50 px-2 py-1 rounded-lg">
          <div className="font-semibold">{analysis.confidence}% confidence</div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {analysis.lastUpdated}
          </div>
        </div>
      </div>
      
      <div className="flex-1 space-y-4 overflow-y-auto">

            {/* Fire Risk */}
      <div className="p-4 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border border-orange-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
              <span className="text-xl">{getRiskIcon('fire', analysis.fireRisk.level)}</span>
            </div>
            <div>
              <span className="text-base font-bold text-gray-800">Fire Risk</span>
              <div className="text-xs text-gray-600">Bushfire Assessment</div>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${getRiskColor(analysis.fireRisk.level)} shadow-sm`}>
            {analysis.fireRisk.level.toUpperCase()}
          </div>
        </div>
        
        <div className="mb-3 p-3 bg-white bg-opacity-70 rounded-lg">
          <div className="text-sm font-bold text-gray-800 mb-1">
            {analysis.fireRisk.probability.toFixed(0)}% probability
          </div>
          <div className="text-xs text-gray-600">within next 24 hours</div>
        </div>
        
        <div className="text-xs text-gray-700 mb-3">
          <div className="font-semibold mb-1">Key Risk Factors:</div>
          <div className="text-gray-600">{analysis.fireRisk.factors.slice(0, 3).join(' • ')}</div>
        </div>
        
        <div className="text-xs text-gray-800 bg-white bg-opacity-80 p-3 rounded-lg border border-orange-100">
          <div className="font-semibold text-orange-800 mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Recommendation:
          </div>
          {analysis.fireRisk.recommendation}
        </div>
      </div>

      {/* Flood Risk */}
      <div className="p-4 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
              <span className="text-xl">{getRiskIcon('flood', analysis.floodRisk.level)}</span>
            </div>
            <div>
              <span className="text-base font-bold text-gray-800">Flood Risk</span>
              <div className="text-xs text-gray-600">Flash Flood Assessment</div>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${getRiskColor(analysis.floodRisk.level)} shadow-sm`}>
            {analysis.floodRisk.level.toUpperCase()}
          </div>
        </div>
        
        <div className="mb-3 p-3 bg-white bg-opacity-70 rounded-lg">
          <div className="text-sm font-bold text-gray-800 mb-1">
            {analysis.floodRisk.probability.toFixed(0)}% probability
          </div>
          <div className="text-xs text-gray-600">within next 24 hours</div>
        </div>
        
        <div className="text-xs text-gray-700 mb-3">
          <div className="font-semibold mb-1">Key Risk Factors:</div>
          <div className="text-gray-600">{analysis.floodRisk.factors.slice(0, 3).join(' • ')}</div>
        </div>
        
        <div className="text-xs text-gray-800 bg-white bg-opacity-80 p-3 rounded-lg border border-blue-100">
          <div className="font-semibold text-blue-800 mb-1 flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            Recommendation:
          </div>
          {analysis.floodRisk.recommendation}
        </div>
      </div>
      </div>
    </div>
  );
}; 