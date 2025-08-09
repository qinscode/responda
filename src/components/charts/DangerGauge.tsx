import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Droplets } from 'lucide-react';
import type { EmergencyType } from '@/types/emergency';

interface DangerGaugeProps {
  data: Array<{
    level: string;
    count: number;
    color: string;
  }>;
  type: EmergencyType;
  className?: string;
}

export const DangerGauge = ({ data, type, className }: DangerGaugeProps) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        dominantBaseline="central" 
        fill="white" 
        fontSize="12" 
        fontWeight="bold" 
        textAnchor={x > cx ? 'start' : 'end'}
        x={x}
        y={y}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-lg">
          <p className="font-medium">{data.level}</p>
          <p className="text-sm text-gray-600">
            {data.count} region{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center space-x-2 text-base">
          {type === 'bushfire' ? (
            <Flame className="h-4 w-4 text-red-500" />
          ) : (
            <Droplets className="h-4 w-4 text-blue-500" />
          )}
          <span className="capitalize">{type} Risk Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={data}
                dataKey="count"
                fill="#8884d8"
                label={renderCustomLabel}
                labelLine={false}
                outerRadius={70}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-2 space-y-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="capitalize">{item.level.replace('-', ' ')}</span>
              </div>
              <span className="font-medium">{item.count}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-2 border-t text-center">
          <div className="text-sm text-gray-600">
            Total: <span className="font-medium">{total} regions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 