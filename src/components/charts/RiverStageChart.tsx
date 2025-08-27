import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { getRiverStationChartData } from '@/data/mockRiverData';

interface RiverStageChartProps {
  siteNumber: string;
  stationName?: string;
}

interface ChartDataPoint {
  datetime: string;
  stage: number;
  discharge: number;
  formattedTime: string;
}

// Risk level thresholds - these could be made configurable per station
const getRiskThresholds = (data: ChartDataPoint[]) => {
  if (data.length === 0) return { low: 0, high: 0, min: 0, max: 1 };
  
  const stages = data.map(d => d.stage);
  const min = Math.min(...stages);
  const max = Math.max(...stages);
  const range = max - min;
  
  // Set thresholds relative to the data range
  const low = min + range * 0.3;
  const high = min + range * 0.7;
  
  // Add some padding for the chart display
  const padding = range * 0.1;
  const chartMin = Math.max(0, min - padding);
  const chartMax = max + padding;
  
  return { low, high, min: chartMin, max: chartMax };
};

export const RiverStageChart = ({ siteNumber, stationName }: RiverStageChartProps) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const rawData = await getRiverStationChartData(siteNumber);
        
        if (rawData.length === 0) {
          setError('No chart data available for this station');
          return;
        }

        // Transform data for recharts
        const transformedData: ChartDataPoint[] = rawData.map(point => ({
          datetime: point.datetime,
          stage: point.stage,
          discharge: point.discharge,
          formattedTime: format(parseISO(point.datetime), 'MMM dd HH:mm')
        }));

        setChartData(transformedData);
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [siteNumber]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Loading chart data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  const thresholds = getRiskThresholds(chartData);

  return (
    <div className="w-full">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-800">
          River Stage - Last 6 Days {stationName && `(${stationName})`}
        </h3>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            
            {/* Risk level background areas */}
            <ReferenceArea
              y1={thresholds.min}
              y2={thresholds.low}
              fill="#6CCF6C"
              fillOpacity={0.15}
            />
            <ReferenceArea
              y1={thresholds.low}
              y2={thresholds.high}
              fill="#FFD27F"
              fillOpacity={0.15}
            />
            <ReferenceArea
              y1={thresholds.high}
              y2={thresholds.max}
              fill="#FF9A9A"
              fillOpacity={0.15}
            />
            
            {/* Threshold lines */}
            <ReferenceLine
              y={thresholds.low}
              stroke="#6CCF6C"
              strokeDasharray="5 5"
              strokeWidth={1}
            />
            <ReferenceLine
              y={thresholds.high}
              stroke="#FF9A9A"
              strokeDasharray="5 5"
              strokeWidth={1}
            />
            
            <XAxis
              dataKey="formattedTime"
              angle={-45}
              textAnchor="end"
              height={60}
              fontSize={10}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[thresholds.min, thresholds.max]}
              label={{ value: 'Stage (m)', angle: -90, position: 'insideLeft' }}
              fontSize={11}
            />
            
            <Tooltip
              labelFormatter={(value) => `Time: ${value}`}
              formatter={(value: number, name: string) => [
                `${value.toFixed(3)} m`,
                name === 'stage' ? 'Water Level' : name
              ]}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
            
            <Line
              type="monotone"
              dataKey="stage"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 text-xs text-gray-600 flex justify-between">
        <span>Low: &lt; {thresholds.low.toFixed(3)}m</span>
        <span>Medium: {thresholds.low.toFixed(3)}m - {thresholds.high.toFixed(3)}m</span>
        <span>High: &gt; {thresholds.high.toFixed(3)}m</span>
      </div>
    </div>
  );
}; 