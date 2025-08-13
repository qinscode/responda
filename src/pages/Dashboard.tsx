import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
// import { OverviewStats } from '@/components/dashboard/OverviewStats';
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

  // Available content height inside main: adjust the constant if needed
  const sectionHeightClass = 'min-h-[calc(100vh-160px)]';

  return (
    <AppShell onSearchChange={setSearchQuery}>
      {showOverview && (
        <CriticalAlerts regions={criticalRegions} onSelect={setSelectedRegion} />
      )}

      {viewMode === 'both' ? (
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${sectionHeightClass}`}>
          <div className="lg:col-span-4 h-full">
            <Card className="card-modern h-full">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="flex-1 overflow-auto">
                  <EmergencyList
                    showHeader
                    externalViewMode={viewMode}
                    initialView="compact"
                    searchQuery={searchQuery}
                    selectedRegionId={selectedRegion?.id}
                    onExternalViewModeChange={setViewMode}
                    onRegionSelect={setSelectedRegion}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 h-full">
            <Card className="bg-transparent border-0 shadow-none rounded-xl py-0 h-full">
              <CardContent className="p-0 h-full">
                <div className="map-container h-full">
                  <MapContainer selectedRegion={selectedRegion} onRegionSelect={setSelectedRegion} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : viewMode === 'map' ? (
        <Card className="bg-transparent border-0 shadow-none rounded-xl py-0">
          <CardContent className="p-0">
            <div className={`map-container h-[calc(100vh-160px)]`}>
              <MapContainer selectedRegion={selectedRegion} onRegionSelect={setSelectedRegion} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-modern">
          <CardContent className={`p-0 h-[calc(100vh-160px)]`}> 
            <div className="h-full overflow-auto">
              <EmergencyList showHeader externalViewMode={viewMode} initialView="compact" searchQuery={searchQuery} selectedRegionId={selectedRegion?.id} onExternalViewModeChange={setViewMode} onRegionSelect={setSelectedRegion} />
            </div>
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