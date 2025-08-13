import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { RegionWithEmergency } from '@/types/emergency';

interface CriticalAlertsProps {
  regions: Array<RegionWithEmergency>;
  onSelect: (region: RegionWithEmergency) => void;
}

export function CriticalAlerts({ regions, onSelect }: CriticalAlertsProps) {
  if (regions.length === 0) return null;
  return (
    <Card className="border-red-200 bg-red-50/50 card-modern emergency-glow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 mb-2">Critical Emergency Alerts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {regions.map((region) => (
                <button key={region.id} className="bg-white/80 rounded-lg p-3 border border-red-200 cursor-pointer hover:bg-white transition-colors text-left" onClick={() => { onSelect(region); }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-red-900">{region.name}</span>
                    <Badge className="bg-red-600 text-white">CRITICAL</Badge>
                  </div>
                  <p className="text-sm text-red-700">
                    {region.emergencyData.bushfire.severity >= 5 ? 'Extreme Bushfire Risk' : 'Major Flood Warning'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 