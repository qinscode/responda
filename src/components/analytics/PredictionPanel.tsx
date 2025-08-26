import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  AlertCircle,
  ChevronRight,
  Activity,
  Zap,
  Eye,
  Calendar
} from 'lucide-react';
import type { AdvancedForecast, PredictiveAlert, PredictionModel } from '@/types/analytics';
import type { EmergencyType } from '@/types/emergency';

interface PredictionPanelProps {
  forecasts: Array<AdvancedForecast>;
  alerts: Array<PredictiveAlert>;
  models: Array<PredictionModel>;
  className?: string;
}

export const PredictionPanel = ({ 
  forecasts, 
  alerts, 
  models, 
  className 
}: PredictionPanelProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '3d' | '7d' | '14d'>('7d');
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<EmergencyType | 'all'>('all');

  // Filter forecasts based on selected timeframe and emergency type
  const filteredForecasts = forecasts.filter(forecast => {
    const forecastDate = new Date(forecast.date);
    const now = new Date();
    const timeDiff = forecastDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const timeframeDays = {
      '24h': 1,
      '3d': 3,
      '7d': 7,
      '14d': 14
    };

    return daysDiff <= timeframeDays[selectedTimeframe] && daysDiff >= 0;
  });

  // Get active alerts
  const activeAlerts = alerts.filter(alert => alert.isActive);

  // Get best performing model
  const bestModel = models.length > 0 ? models.reduce((best, model) => 
    model.accuracy > best.accuracy ? model : best, models[0]!) : null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <h2 className="text-lg font-semibold">Predictive Analytics</h2>
          <Badge className="text-xs" variant="outline">
            AI-Powered
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
            {(['24h', '3d', '7d', '14d'] as const).map((timeframe) => (
              <Button
                key={timeframe}
                className="h-6 px-2 text-xs"
                size="sm"
                variant={selectedTimeframe === timeframe ? 'default' : 'ghost'}
                onClick={() => { setSelectedTimeframe(timeframe); }}
              >
                {timeframe}
              </Button>
            ))}
          </div>
          
          {/* Emergency type filter */}
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
            {(['all', 'bushfire', 'flood'] as const).map((type) => (
              <Button
                key={type}
                className="h-6 px-2 text-xs capitalize"
                size="sm"
                variant={selectedEmergencyType === type ? 'default' : 'ghost'}
                onClick={() => { setSelectedEmergencyType(type); }}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="card-modern border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Active Predictive Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {activeAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="bg-white border border-orange-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                        <span className="font-medium text-sm">{alert.title}</span>
                        <Badge className="text-xs" variant="outline">
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Expected: {new Date(alert.expectedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>Probability: {(alert.probability * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(alert.confidence)}`}>
                      {(alert.confidence * 100).toFixed(0)}% confident
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs className="space-y-4" defaultValue="forecasts">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="forecasts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredForecasts.map((forecast) => (
              <Card key={`${forecast.regionId}-${forecast.date}`} className="card-modern">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Region {forecast.regionId}
                    </CardTitle>
                    <Badge className="text-xs" variant="outline">
                      {new Date(forecast.date).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* Bushfire prediction */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full" />
                        <span className="text-sm font-medium">Bushfire</span>
                      </div>
                      <Badge className="text-xs" variant="outline">
                        {forecast.emergencyData.bushfire.level}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Probability</span>
                        <span>{(forecast.emergencyData.bushfire.probability * 100).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        className="h-2" 
                        value={forecast.emergencyData.bushfire.probability * 100}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {forecast.emergencyData.bushfire.factors.slice(0, 2).map((factor, index) => (
                        <Badge key={index} className="text-xs" variant="secondary">
                          {factor.name}: {factor.value.toFixed(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Flood prediction */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm font-medium">Flood</span>
                      </div>
                      <Badge className="text-xs" variant="outline">
                        {forecast.emergencyData.flood.level}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Probability</span>
                        <span>{(forecast.emergencyData.flood.probability * 100).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        className="h-2" 
                        value={forecast.emergencyData.flood.probability * 100}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {forecast.emergencyData.flood.factors.slice(0, 2).map((factor, index) => (
                        <Badge key={index} className="text-xs" variant="secondary">
                          {factor.name}: {factor.value.toFixed(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Model info and confidence */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Brain className="h-3 w-3" />
                      <span>{forecast.modelUsed}</span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(forecast.confidence)}`}>
                      {(forecast.confidence * 100).toFixed(0)}% confident
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent className="space-y-4" value="models">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {models.map((model) => (
              <Card key={model.id} className="card-modern">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
                                          <Badge 
                        className="text-xs" 
                        variant={bestModel && model.id === bestModel.id ? 'default' : 'outline'}
                      >
                        {bestModel && model.id === bestModel.id ? 'Best' : model.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span className="font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <Progress className="h-2" value={model.accuracy * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>Features ({model.features.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {model.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} className="text-xs" variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                      {model.features.length > 3 && (
                        <Badge className="text-xs" variant="outline">
                          +{model.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Last trained: {new Date(model.lastTrained).toLocaleDateString()}</span>
                    </div>
                    <Button className="h-6 px-2" size="sm" variant="ghost">
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent className="space-y-4" value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="card-modern">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Zap className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm text-green-800">
                        Improved Prediction Accuracy
                      </div>
                      <div className="text-xs text-green-700 mt-1">
                        Weather-based models show 15% better accuracy for flood predictions this season.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Activity className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm text-blue-800">
                        Seasonal Pattern Detected
                      </div>
                      <div className="text-xs text-blue-700 mt-1">
                        Strong correlation between rainfall patterns and flood risk in coastal regions.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm text-amber-800">
                        Model Recommendation
                      </div>
                      <div className="text-xs text-amber-700 mt-1">
                        Consider ensemble methods for better bushfire predictions in arid regions.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-5 w-5 text-purple-500" />
                  Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {models.slice(0, 3).map((model, index) => (
                    <div key={model.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-green-500' : 
                          index === 1 ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-sm font-medium">{model.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{(model.accuracy * 100).toFixed(1)}%</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 