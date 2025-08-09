import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DangerGauge } from '@/components/charts/DangerGauge';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Wind, CloudRain } from 'lucide-react';

interface AnalyticsPanelProps {
  bushfireData: Array<{ level: string; count: number; color: string }>;
  floodData: Array<{ level: string; count: number; color: string }>;
}

export function AnalyticsPanel({ bushfireData, floodData }: AnalyticsPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-orange-500" />
            Bushfire Risk Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DangerGauge data={bushfireData} type="bushfire" />
        </CardContent>
      </Card>

      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-blue-500" />
            Flood Warning Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DangerGauge data={floodData} type="flood" />
        </CardContent>
      </Card>

      <Card className="card-modern lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-gray-500" />
            Current Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Temperature</span>
            <Badge variant="outline">32°C</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Wind Speed</span>
            <Badge variant="outline">15 km/h</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Humidity</span>
            <Badge variant="outline">45%</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 