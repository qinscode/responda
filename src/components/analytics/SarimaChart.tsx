import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Activity,
  Eye,
  EyeOff,
  Settings,
  MapPin
} from 'lucide-react';
import { generateSarimaFloodData } from '@/data/mockSarimaData';
import { riverStations, type RiverStation } from '@/data/riverStations';

interface SarimaDataPoint {
  date: string;
  day: number;
  discharge: number;
  type: 'train' | 'test' | 'forecast';
}

interface SarimaChartProps {
  title: string;
  height?: number;
  className?: string;
}

export const SarimaChart = ({ 
  title, 
  height = 400,
  className 
}: SarimaChartProps) => {
  const [showTrain, setShowTrain] = useState(true);
  const [showTest, setShowTest] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [selectedStation, setSelectedStation] = useState<RiverStation>(riverStations[0]!);
  const [data, setData] = useState<SarimaDataPoint[]>([]);

  // Generate data when station changes
  useEffect(() => {
    const newData = generateSarimaFloodData(selectedStation);
    setData(newData);
  }, [selectedStation]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.date}</p>
          <div className="space-y-1 mt-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-700">
                  {entry.name}: {entry.value?.toFixed(0)} m³/s
                </span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2 capitalize">
            Data Type: {data.type}
          </div>
        </div>
      );
    }
    return null;
  };

  // Separate data by type for different line colors
  const trainData = data.filter(d => d.type === 'train');
  const testData = data.filter(d => d.type === 'test');
  const forecastData = data.filter(d => d.type === 'forecast');

  // Create combined data for chart with separate fields
  const chartData = data.map(point => ({
    ...point,
    trainValue: point.type === 'train' ? point.discharge : null,
    testValue: point.type === 'test' ? point.discharge : null,
    forecastValue: point.type === 'forecast' ? point.discharge : null
  }));

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
      
      <CardHeader className="relative pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-md">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {title}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  6-Day River Discharge Analysis & Forecasting (Day 25-31)
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3"
                onClick={() => setShowTrain(!showTrain)}
              >
                {showTrain ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                <span className="ml-1 text-xs">Train</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3"
                onClick={() => setShowTest(!showTest)}
              >
                {showTest ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                <span className="ml-1 text-xs">Test</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3"
                onClick={() => setShowForecast(!showForecast)}
              >
                {showForecast ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                <span className="ml-1 text-xs">Forecast</span>
              </Button>
            </div>
          </div>

          {/* River Station Selection */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">River Station:</span>
            </div>
            <div className="flex-1 min-w-0">
              <select
                value={selectedStation.site}
                onChange={(e) => {
                  const station = riverStations.find(s => s.site === e.target.value);
                  if (station) setSelectedStation(station);
                }}
                className="w-full sm:w-auto min-w-[300px] px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {riverStations.map((station) => (
                  <option key={station.site} value={station.site}>
                    {station.site} - {station.river} ({station.stationName})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-500">
              Lat: {selectedStation.latitude.toFixed(3)}, Lng: {selectedStation.longitude.toFixed(3)}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span className="text-sm text-gray-600">Train</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-orange-500"></div>
              <span className="text-sm text-gray-600">Test</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500"></div>
              <span className="text-sm text-gray-600">Forecast</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100">
              <div className="text-lg font-bold text-blue-600">{trainData.length}</div>
              <div className="text-xs text-gray-600">Historical Data</div>
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100">
              <div className="text-lg font-bold text-orange-600">{testData.length}</div>
              <div className="text-xs text-gray-600">Validation Data</div>
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100">
              <div className="text-lg font-bold text-green-600">{forecastData.length}</div>
              <div className="text-xs text-gray-600">Predicted Data</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative pt-0">
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 20, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                dataKey="day"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `Day ${Math.floor(value)}`}
                domain={[25, 32.5]}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                label={{ value: 'River Discharge (m³/s)', angle: -90, position: 'insideLeft' }}
                domain={[0, 600]}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Train data */}
              {showTrain && (
                <Line
                  type="monotone"
                  dataKey="trainValue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  name="Train"
                />
              )}
              
              {/* Test data */}
              {showTest && (
                <Line
                  type="monotone"
                  dataKey="testValue"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  name="Test"
                />
              )}
              
              {/* Forecast data */}
              {showForecast && (
                <Line
                  type="monotone"
                  dataKey="forecastValue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  name="Forecast"
                />
              )}
              
              {/* Reference lines to separate sections */}
              <ReferenceLine 
                x={28.5} 
                stroke="#94a3b8" 
                strokeDasharray="2 2" 
                strokeOpacity={0.5}
              />
              <ReferenceLine 
                x={30.5} 
                stroke="#94a3b8" 
                strokeDasharray="2 2" 
                strokeOpacity={0.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 