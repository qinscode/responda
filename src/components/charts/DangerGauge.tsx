import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Droplets, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useState } from 'react';
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
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie');
  
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const icon = type === 'bushfire' ? Flame : Droplets;
  const IconComponent = icon;
  
  const formatLabel = (level: string) => {
    return level.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getGradientColor = (color: string) => {
    // Create gradient variations of the base color
    const colorMap: Record<string, string> = {
      '#6b7280': 'from-gray-400 to-gray-600',
      '#10b981': 'from-emerald-400 to-emerald-600', 
      '#f59e0b': 'from-amber-400 to-amber-600',
      '#f97316': 'from-orange-400 to-orange-600',
      '#ef4444': 'from-red-400 to-red-600',
      '#dc2626': 'from-red-500 to-red-700',
      '#7f1d1d': 'from-red-800 to-red-900',
      '#3b82f6': 'from-blue-400 to-blue-600',
    };
    return colorMap[color] || 'from-gray-400 to-gray-600';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="glass rounded-lg shadow-lg p-3 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.payload.color }}
            />
            <span className="font-medium text-sm">{formatLabel(data.payload.level)}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <div>Count: <span className="font-medium text-foreground">{data.value}</span></div>
            <div>Percentage: <span className="font-medium text-foreground">{((data.value / total) * 100).toFixed(1)}%</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  // const CustomLegend = ({ payload }: any) => {
  //   return (
  //     <div className="flex flex-wrap justify-center gap-2 mt-4">
  //       {payload?.map((entry: any, index: number) => (
  //         <div key={index} className="flex items-center gap-2 text-xs">
  //           <div
  //             className="w-3 h-3 rounded-full"
  //             style={{ backgroundColor: entry.color }}
  //           />
  //           <span className="text-muted-foreground">
  //             {formatLabel(entry.payload.level)} ({entry.payload.count})
  //           </span>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // };

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for very small segments
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        className="text-xs font-medium" 
        dominantBaseline="central" 
        fill="white" 
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }} 
        textAnchor={x > cx ? 'start' : 'end'}
        x={x}
        y={y}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <Card className={`card-modern ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <IconComponent className={`h-5 w-5 ${type === 'bushfire' ? 'text-orange-500' : 'text-blue-500'}`} />
            {type === 'bushfire' ? 'Bushfire Risk' : 'Flood Warning'} Distribution
          </CardTitle>
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
            <Button
              className="h-7 w-7 p-0"
              size="sm"
              variant={viewType === 'pie' ? 'default' : 'ghost'}
              onClick={() => { setViewType('pie'); }}
            >
              <PieChartIcon className="h-3 w-3" />
            </Button>
            <Button
              className="h-7 w-7 p-0"
              size="sm"
              variant={viewType === 'bar' ? 'default' : 'ghost'}
              onClick={() => { setViewType('bar'); }}
            >
              <BarChart3 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Total Regions: {total}</span>
          </div>
          <Badge className="text-xs" variant="outline">
            Live Data
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <IconComponent className="h-12 w-12 mb-3 opacity-30" />
            <div className="text-center">
              <h3 className="font-medium mb-1">No Data Available</h3>
              <p className="text-sm">No {type} alerts to display</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer height="100%" width="100%">
                {viewType === 'pie' ? (
                  <PieChart>
                    <Pie
                      animationBegin={0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      cx="50%"
                      cy="50%"
                      data={data}
                      dataKey="count"
                      fill="#8884d8"
                      innerRadius={30}
                      label={CustomPieLabel}
                      labelLine={false}
                      outerRadius={80}
                    >
                      {data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                ) : (
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      angle={-45} 
                      dataKey="level"
                      height={60}
                      textAnchor="end"
                      tick={{ fontSize: 10 }}
                      tickFormatter={formatLabel}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      animationBegin={0} 
                      animationDuration={1000}
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                    >
                      {data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Statistics Summary */}
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Highest Count</div>
                  <div className="font-semibold">
                    {data.find(d => d.count === maxCount)?.count || 0} regions
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatLabel(data.find(d => d.count === maxCount)?.level || '')}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Coverage</div>
                  <div className="font-semibold">{data.length} levels</div>
                  <div className="text-xs text-muted-foreground">
                    Active categories
                  </div>
                </div>
              </div>

              {/* Risk Level Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">Risk Level Breakdown</div>
                {data.map((item, index) => {
                  const percentage = ((item.count / total) * 100);
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{formatLabel(item.level)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{item.count}</span>
                          <Badge className="text-xs" variant="outline">
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full bg-gradient-to-r ${getGradientColor(item.color)} transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}; 