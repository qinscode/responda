import { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart,
  ReferenceLine,
  Brush
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Activity,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import type { TimeSeriesAnalysis, TrendAnalysis } from '@/types/analytics';
import type { EmergencyType } from '@/types/emergency';

interface TrendChartProps {
  data: TimeSeriesAnalysis;
  type: EmergencyType;
  title: string;
  showForecast?: boolean;
  showAnomalies?: boolean;
  height?: number;
  className?: string;
}

export const TrendChart = ({ 
  data, 
  type, 
  title, 
  showForecast = true, 
  showAnomalies = true,
  height = 300,
  className 
}: TrendChartProps) => {
  const [viewMode, setViewMode] = useState<'line' | 'area'>('line');
  const [showConfidence, setShowConfidence] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | '7d' | '30d' | '90d'>('30d');

  // Process data for visualization
  const processedData = useMemo(() => {
    const historical = data.data.map(point => ({
      ...point,
      timestamp: new Date(point.timestamp).getTime(),
      date: new Date(point.timestamp).toLocaleDateString(),
      type: 'historical'
    }));

    const forecast = showForecast ? data.forecast.map(point => ({
      ...point,
      timestamp: new Date(point.timestamp).getTime(),
      date: new Date(point.timestamp).toLocaleDateString(),
      type: 'forecast'
    })) : [];

    return [...historical, ...forecast].sort((a, b) => a.timestamp - b.timestamp);
  }, [data, showForecast]);

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    const now = new Date().getTime();
    const ranges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };

    const cutoff = now - ranges[selectedTimeRange];
    return processedData.filter(point => point.timestamp >= cutoff);
  }, [processedData, selectedTimeRange]);

  // Get trend icon and color
  const getTrendInfo = (trend: TrendAnalysis) => {
    switch (trend.trend) {
      case 'increasing':
        return { 
          icon: TrendingUp, 
          color: 'text-red-500', 
          bgColor: 'bg-red-50 border-red-200',
          label: 'Increasing' 
        };
      case 'decreasing':
        return { 
          icon: TrendingDown, 
          color: 'text-green-500', 
          bgColor: 'bg-green-50 border-green-200',
          label: 'Decreasing' 
        };
      default:
        return { 
          icon: Minus, 
          color: 'text-gray-500', 
          bgColor: 'bg-gray-50 border-gray-200',
          label: 'Stable' 
        };
    }
  };

  const trendInfo = getTrendInfo(data.trend);
  const TrendIcon = trendInfo.icon;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isAnomaly = showAnomalies && data.anomalyScore > 0.5;
      
      return (
        <div className="glass rounded-lg shadow-lg p-4 border border-white/20 min-w-48">
          <div className="mb-2">
            <div className="font-medium text-sm">{data.date}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {data.type === 'forecast' && <Badge className="text-xs" variant="outline">Forecast</Badge>}
              {isAnomaly && <Badge className="text-xs" variant="destructive">Anomaly</Badge>}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Risk Level:</span>
              <span className="font-medium text-sm">{data.value.toFixed(1)}</span>
            </div>
            
            {data.confidence && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Confidence:</span>
                <span className="font-medium text-sm">{(data.confidence * 100).toFixed(0)}%</span>
              </div>
            )}
            
            {isAnomaly && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Anomaly Score:</span>
                <span className="font-medium text-sm text-red-500">
                  {(data.anomalyScore * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Anomaly markers
  const anomalyMarkers = showAnomalies ? data.anomalies.map(anomaly => ({
    timestamp: new Date(anomaly.timestamp).getTime(),
    value: anomaly.value,
    anomalyScore: anomaly.anomalyScore
  })) : [];

  return (
    <Card className={`card-modern-v2 animate-card-hover ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className={`h-5 w-5 animate-pulse-gentle ${type === 'bushfire' ? 'text-orange-500' : 'text-blue-500'}`} />
            {title}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Time range selector */}
            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
              {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                <Button
                  key={range}
                  className="h-6 px-2 text-xs btn-spring"
                  size="sm"
                  variant={selectedTimeRange === range ? 'default' : 'ghost'}
                  onClick={() => { setSelectedTimeRange(range); }}
                >
                  {range}
                </Button>
              ))}
            </div>
            
            {/* View controls */}
            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
              <Button
                className="h-6 w-6 p-0 btn-spring"
                size="sm"
                variant={viewMode === 'line' ? 'default' : 'ghost'}
                onClick={() => { setViewMode('line'); }}
              >
                <Activity className="h-3 w-3" />
              </Button>
              <Button
                className="h-6 w-6 p-0 btn-spring"
                size="sm"
                variant={viewMode === 'area' ? 'default' : 'ghost'}
                onClick={() => { setViewMode('area'); }}
              >
                <BarChart3 className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Toggle confidence bands */}
            <Button
              className="h-6 w-6 p-0 btn-spring"
              size="sm"
              variant={showConfidence ? 'default' : 'ghost'}
              onClick={() => { setShowConfidence(!showConfidence); }}
            >
              {showConfidence ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        {/* Trend summary */}
        <div className="flex items-center gap-4 text-sm">
          <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${trendInfo.bgColor}`}>
            <TrendIcon className={`h-3 w-3 ${trendInfo.color}`} />
            <span className="font-medium">{trendInfo.label}</span>
            <span className="text-muted-foreground">
              {Math.abs(data.trend.changeRate).toFixed(1)}%
            </span>
          </div>
          
          <Badge className="text-xs" variant="outline">
            {data.trend.period} analysis
          </Badge>
          
          <div className="text-muted-foreground">
            Confidence: {(data.trend.confidence * 100).toFixed(0)}%
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="h-80 w-full">
          <ResponsiveContainer height="100%" width="100%">
            {viewMode === 'area' ? (
              <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id={`colorGradient-${type}`} x1="0" x2="0" y1="0" y2="1">
                    <stop 
                      offset="5%" 
                      stopColor={type === 'bushfire' ? '#f97316' : '#3b82f6'} 
                      stopOpacity={0.8}
                    />
                    <stop 
                      offset="95%" 
                      stopColor={type === 'bushfire' ? '#f97316' : '#3b82f6'} 
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                
                <CartesianGrid stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  domain={[0, 6]}
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                <Area
                  connectNulls={false}
                  dataKey="value"
                  fill={`url(#colorGradient-${type})`}
                  stroke={type === 'bushfire' ? '#f97316' : '#3b82f6'}
                  strokeWidth={2}
                  type="monotone"
                />
                
                {/* Forecast indicator line */}
                {showForecast && (
                  <ReferenceLine 
                    label={{ value: "Now", position: "top" }} 
                    stroke="#64748b" 
                    strokeDasharray="5 5"
                    x={new Date().toLocaleDateString()}
                  />
                )}
                
                <Brush 
                  dataKey="date" 
                  height={30} 
                  stroke={type === 'bushfire' ? '#f97316' : '#3b82f6'}
                />
              </AreaChart>
            ) : (
              <LineChart data={filteredData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  domain={[0, 6]}
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Historical data line */}
                <Line
                  activeDot={{ r: 4, stroke: type === 'bushfire' ? '#f97316' : '#3b82f6' }}
                  connectNulls={false}
                  dataKey="value"
                  dot={false}
                  stroke={type === 'bushfire' ? '#f97316' : '#3b82f6'}
                  strokeWidth={2}
                  type="monotone"
                />
                
                {/* Confidence bands */}
                {showConfidence && (
                  <>
                    <Area
                      dataKey="confidence"
                      fill={type === 'bushfire' ? '#f97316' : '#3b82f6'}
                      fillOpacity={0.1}
                      stroke="none"
                      type="monotone"
                    />
                  </>
                )}
                
                {/* Forecast indicator line */}
                {showForecast && (
                  <ReferenceLine 
                    label={{ value: "Now", position: "top" }} 
                    stroke="#64748b" 
                    strokeDasharray="5 5"
                    x={new Date().toLocaleDateString()}
                  />
                )}
                
                <Brush 
                  dataKey="date" 
                  height={30} 
                  stroke={type === 'bushfire' ? '#f97316' : '#3b82f6'}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Anomalies list */}
        {showAnomalies && anomalyMarkers.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Detected Anomalies</span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {data.anomalies.slice(0, 3).map((anomaly, index) => (
                <div key={index} className="flex items-center justify-between text-xs bg-amber-50 border border-amber-200 rounded p-2">
                  <span>{new Date(anomaly.timestamp).toLocaleDateString()}</span>
                  <Badge className="text-xs" variant="outline">
                    {(anomaly.anomalyScore * 100).toFixed(0)}% anomaly
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Seasonality info */}
        {data.seasonality.detected && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Seasonal Pattern Detected</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Period: {data.seasonality.period} days, 
              Strength: {(data.seasonality.strength * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 