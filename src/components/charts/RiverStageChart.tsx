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
import { getRiverStationChartData } from '@/data/riverData';
import { RiverRiskPrediction } from '@/components/analytics/RiverRiskPrediction';

interface RiverStageChartProps {
  siteNumber: string;
  stationName?: string;
  showAI?: boolean;
}

interface ChartDataPoint {
  datetime: string;
  stage: number;
  discharge: number;
  formattedTime: string;
}

// Risk level thresholds - dynamically calculated based on actual data range
const getRiskThresholds = (data: Array<ChartDataPoint>) => {
  if (data.length === 0) return { low: 0, high: 0, min: 0, max: 1 };
  
  const stages = data.map(d => d.stage);
  const dataMin = Math.min(...stages);
  const dataMax = Math.max(...stages);
  const range = dataMax - dataMin;
  
  // Create a tight range around the data to show changes clearly
  let chartMin, chartMax;
  if (range < 0.005) {
    // For very stable water levels, show a 1cm range around the data
    const center = (dataMin + dataMax) / 2;
    chartMin = center - 0.005;
    chartMax = center + 0.005;
  } else if (range < 0.02) {
    // For small changes, add minimal padding to focus on the variation
    const padding = Math.max(0.002, range * 0.1); // At least 2mm padding
    chartMin = dataMin - padding;
    chartMax = dataMax + padding;
  } else {
    // For larger changes, add 10% padding
    const padding = range * 0.1;
    chartMin = dataMin - padding;
    chartMax = dataMax + padding;
  }
  
  // Ensure we don't have negative water levels unless data actually contains them
  if (dataMin > 0 && chartMin < 0) {
    chartMin = Math.max(0, dataMin - 0.01); // Allow small negative for padding, but not too much
  }
  
  // Set risk thresholds relative to the visible range
  const visibleRange = chartMax - chartMin;
  const low = chartMin + visibleRange * 0.3;
  const high = chartMin + visibleRange * 0.7;
  
  return { low, high, min: chartMin, max: chartMax };
};

export const RiverStageChart = ({ siteNumber, stationName, showAI = true }: RiverStageChartProps) => {
  const [chartData, setChartData] = useState<Array<ChartDataPoint>>([]);
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

        // Transform data for recharts, filtering out invalid stage data (≤ 0)
        const transformedData: Array<ChartDataPoint> = rawData
          .filter(point => point.stage > 0) // Ignore data points with stage <= 0
          .map(point => ({
            datetime: point.datetime,
            stage: point.stage,
            discharge: point.discharge,
            formattedTime: format(parseISO(point.datetime), 'dd HH:mm')
          }));

        // Check if we have enough valid data points after filtering
        if (transformedData.length === 0) {
          setError('No valid chart data available (all stage values ≤ 0)');
          return;
        }

        setChartData(transformedData);
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    void loadChartData();
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
        <p className="text-xs text-gray-500">
          Range: {thresholds.min.toFixed(3)}m - {thresholds.max.toFixed(3)}m
        </p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
            <CartesianGrid opacity={0.3} strokeDasharray="3 3" />
            
            {/* Risk level background areas */}
            <ReferenceArea
              fill="#6CCF6C"
              fillOpacity={0.15}
              y1={thresholds.min}
              y2={thresholds.low}
            />
            <ReferenceArea
              fill="#FFD27F"
              fillOpacity={0.15}
              y1={thresholds.low}
              y2={thresholds.high}
            />
            <ReferenceArea
              fill="#FF9A9A"
              fillOpacity={0.15}
              y1={thresholds.high}
              y2={thresholds.max}
            />
            
            {/* Threshold lines */}
            <ReferenceLine
              stroke="#6CCF6C"
              strokeDasharray="5 5"
              strokeWidth={1}
              y={thresholds.low}
            />
            <ReferenceLine
              stroke="#FF9A9A"
              strokeDasharray="5 5"
              strokeWidth={1}
              y={thresholds.high}
            />
            
            <XAxis
              angle={-30}
              dataKey="formattedTime"
              fontSize={9}
              height={35}
              interval="preserveStartEnd"
              textAnchor="end"
            />
            <YAxis
              domain={[thresholds.min, thresholds.max]}
              fontSize={11}
              label={{ value: 'Stage (m)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => {
                if (typeof value === 'number') {
                  return value.toFixed(3);
                }
                return String(value);
              }}
            />
            
            <Tooltip
              labelFormatter={(value) => `Time: ${value}`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(3)} m`,
                name === 'stage' ? 'Water Level' : name
              ]}
            />
            
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
            
            <Line
              activeDot={{ r: 4 }}
              dataKey="stage"
              dot={{ r: 2 }}
              stroke="#2563eb"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-1 text-xs text-gray-600 flex justify-between">
        <span>Low: &lt; {thresholds.low.toFixed(3)}m</span>
        <span>Medium: {thresholds.low.toFixed(3)}m - {thresholds.high.toFixed(3)}m</span>
        <span>High: &gt; {thresholds.high.toFixed(3)}m</span>
      </div>
      
      {/* AI Risk Prediction - only show if showAI is true */}
      {showAI && (
        <div className="mt-3">
          <RiverRiskPrediction 
            siteNumber={siteNumber} 
            currentStage={chartData[chartData.length - 1]?.stage || 0}
            stationName={stationName}
          />
        </div>
      )}
    </div>
  );
}; 