import { Card, CardContent } from '@/components/ui/card';
import { Map, AlertTriangle, Users, TrendingUp, Activity, Eye, Shield } from 'lucide-react';

interface OverviewStatsProps {
  totalRegions: number;
  activeAlerts: number;
  highRiskRegions: number;
  totalPopulation: number;
}

export function OverviewStats({ totalRegions, activeAlerts, highRiskRegions, totalPopulation }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Regions</p>
              <p className="text-3xl font-bold text-gradient">{totalRegions}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Map className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Monitoring active</span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
              <p className="text-3xl font-bold text-orange-600">{activeAlerts}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">{((activeAlerts / Math.max(1,totalRegions)) * 100).toFixed(1)}% of regions</span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">High Risk</p>
              <p className="text-3xl font-bold text-red-600">{highRiskRegions}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Requires attention</span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Population</p>
              <p className="text-3xl font-bold text-blue-600">{(totalPopulation / 1_000_000).toFixed(1)}M</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 