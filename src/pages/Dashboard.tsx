import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
// import { OverviewStats } from '@/components/dashboard/OverviewStats';
import { ControlBar } from '@/components/dashboard/ControlBar';
import { CriticalAlerts } from '@/components/dashboard/CriticalAlerts';
import { AnalyticsPanel } from '@/components/dashboard/AnalyticsPanel';
import { MapContainer } from '@/components/maps/MapContainer';
import { EmergencyList } from '@/components/emergency/EmergencyList';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RegionWithEmergency } from '@/types/emergency';
import { BUSHFIRE_RATINGS, FLOOD_RATINGS } from '@/types/emergency';
import { getAllMockRegions } from '@/data/mockEmergencyData';

export const Dashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionWithEmergency | undefined>();
  const [viewMode, setViewMode] = useState<'both' | 'map' | 'list'>('both');
  const [searchQuery, setSearchQuery] = useState('');
  const regions = getAllMockRegions();

  const totalRegions = regions.length;
  const activeAlerts = regions.filter(r => r.emergencyData.bushfire.severity > 2 || r.emergencyData.flood.severity > 1).length;
  const highRiskRegions = regions.filter(r => r.emergencyData.bushfire.severity >= 4 || r.emergencyData.flood.severity >= 3).length;
  const totalPopulation = regions.reduce((sum, r) => sum + (r.population || 0), 0);

  const bushfireData = Object.entries(BUSHFIRE_RATINGS).map(([level, info]) => ({
    level,
    count: regions.filter(r => r.emergencyData.bushfire.level === level).length,
    color: info.color,
  })).filter(item => item.count > 0);

  const floodData = Object.entries(FLOOD_RATINGS).map(([level, info]) => ({
    level,
    count: regions.filter(r => r.emergencyData.flood.level === level).length,
    color: info.color,
  })).filter(item => item.count > 0);

  const criticalRegions = regions
    .filter(r => r.emergencyData.bushfire.severity >= 5 || r.emergencyData.flood.severity >= 3)
    .slice(0, 3);

  const showOverview = false; // Always hide top statistics

  return (
    <AppShell onSearchChange={setSearchQuery}>
      {/* Top statistics removed per request */}

      <ControlBar viewMode={viewMode} onChange={setViewMode} />

      {showOverview && (
        <CriticalAlerts regions={criticalRegions} onSelect={setSelectedRegion} />
      )}

      {viewMode === 'both' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card className="card-modern h-full">
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-auto">
                  <EmergencyList
                    onRegionSelect={setSelectedRegion}
                    selectedRegionId={selectedRegion?.id}
                    searchQuery={searchQuery}
                    showHeader={true}
                    initialView="compact"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="card-modern h-full">
              <CardContent className="p-0">
                <div className="map-container h-[600px]">
                  <MapContainer selectedRegion={selectedRegion} onRegionSelect={setSelectedRegion} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : viewMode === 'map' ? (
        <Card className="card-modern">
          <CardContent className="p-0">
            <div className="map-container h-[600px]">
              <MapContainer selectedRegion={selectedRegion} onRegionSelect={setSelectedRegion} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-modern">
          <CardContent className="p-0">
            <EmergencyList onRegionSelect={setSelectedRegion} selectedRegionId={selectedRegion?.id} searchQuery={searchQuery} showHeader={true} initialView="compact" />
          </CardContent>
        </Card>
      )}

      {showOverview && (
        <AnalyticsPanel bushfireData={bushfireData} floodData={floodData} />
      )}

      {selectedRegion && (
        <Card className="card-modern">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold heading-modern">{selectedRegion.name}</h3>
              <p className="text-sm text-muted-foreground">Population: {selectedRegion.population?.toLocaleString() || 'Unknown'}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`emergency-${selectedRegion.emergencyData.bushfire.level}`}>{selectedRegion.emergencyData.bushfire.description}</Badge>
              <Badge className={`flood-${selectedRegion.emergencyData.flood.level}`}>{selectedRegion.emergencyData.flood.description}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}; 