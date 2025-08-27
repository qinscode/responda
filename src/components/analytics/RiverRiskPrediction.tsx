import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface RiskPredictionProps {
  siteNumber: string;
  currentStage: number;
  stationName?: string;
}

interface RiskPrediction {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: number;
  timeframe: string;
  factors: Array<string>;
  recommendation: string;
  confidence: number;
}

// Mock AI prediction API
const generateRiskPrediction = async (siteNumber: string, currentStage: number): Promise<RiskPrediction> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
  
  // Mock prediction logic based on station and current stage
  const predictions = [
    {
      riskLevel: 'Low' as const,
      probability: 15 + Math.random() * 10,
      timeframe: '24 hours',
      factors: ['Stable weather patterns', 'Normal rainfall upstream', 'Historical low flood season'],
      recommendation: 'Continue regular monitoring. Water levels are within normal parameters.',
      confidence: 85 + Math.random() * 10
    },
    {
      riskLevel: 'Medium' as const,
      probability: 35 + Math.random() * 20,
      timeframe: '12-24 hours',
      factors: ['Moderate rainfall forecast', 'Seasonal water level increase', 'Upstream dam release scheduled'],
      recommendation: 'Increased monitoring recommended. Prepare early warning systems.',
      confidence: 75 + Math.random() * 15
    },
    {
      riskLevel: 'High' as const,
      probability: 65 + Math.random() * 20,
      timeframe: '6-12 hours',
      factors: ['Heavy rainfall warning', 'Rising trend in upstream stations', 'Saturated ground conditions'],
      recommendation: 'Activate flood preparedness protocols. Consider evacuation planning.',
      confidence: 80 + Math.random() * 15
    }
  ];
  
  // Select prediction based on current stage and some randomness
  const baseIndex = currentStage > 10 ? (currentStage > 15 ? 2 : 1) : 0;
  const randomFactor = Math.random();
  const index = randomFactor > 0.7 ? Math.min(2, baseIndex + 1) : baseIndex;
  
  return predictions[index] ?? predictions[0]!;
};

export const RiverRiskPrediction = ({ siteNumber, currentStage, stationName }: RiskPredictionProps) => {
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await generateRiskPrediction(siteNumber, currentStage);
        setPrediction(result);
      } catch (err) {
        setError('Failed to generate risk prediction');
        console.error('Error generating prediction:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchPrediction();
  }, [siteNumber, currentStage]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800">🤖 AI Risk Analysis</h4>
            <p className="text-xs text-gray-600">Analyzing flood risk patterns...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !prediction) {
    return (
      <Card className="p-4 bg-red-50 border-red-200">
        <div className="flex items-center space-x-2">
          <span className="text-red-500">⚠️</span>
          <div>
            <h4 className="text-sm font-semibold text-red-800">AI Analysis Unavailable</h4>
            <p className="text-xs text-red-600">{error || 'Unable to generate prediction'}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center">
            <span className="mr-2">🤖</span>
            AI Flood Risk Prediction
          </h4>
          <span className={`text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
            {prediction.confidence.toFixed(0)}% confidence
          </span>
        </div>

        {/* Risk Level */}
        <div className="flex items-center justify-between">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(prediction.riskLevel)}`}>
            {prediction.riskLevel} Risk
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-800">
              {prediction.probability.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">in next {prediction.timeframe}</div>
          </div>
        </div>

        {/* Key Factors */}
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Key Factors:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {prediction.factors.map((factor, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 text-blue-500">•</span>
                {factor}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendation */}
        <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-blue-200">
          <p className="text-xs font-medium text-gray-700 mb-1">🎯 Recommendation:</p>
          <p className="text-xs text-gray-700">{prediction.recommendation}</p>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 text-center border-t border-blue-200 pt-2">
          Analysis powered by AI • Updated in real-time
        </div>
      </div>
    </Card>
  );
}; 