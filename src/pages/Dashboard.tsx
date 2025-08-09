import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { MapContainer } from '@/components/maps/MapContainer';
import { EmergencyList } from '@/components/emergency/EmergencyList';
import { DangerGauge } from '@/components/charts/DangerGauge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Map, 
  List, 
  LayoutGrid,
  TrendingUp,
  AlertTriangle,
  Clock,
  Users
} from 'lucide-react';
import type { RegionWithEmergency } from '@/types/emergency';
import { getAllMockRegions, BUSHFIRE_RATINGS, FLOOD_RATINGS } from '@/data/mockEmergencyData';

export const Dashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionWithEmergency | undefined>();
  const [viewMode, setViewMode] = useState<'both' | 'map' | 'list'>('both');
  
  const regions = getAllMockRegions();

  // Calculate stats
  const highRiskRegions = regions.filter(region => 
    region.emergencyData.bushfire.severity >= 3 || region.emergencyData.flood.severity >= 2
  ).length;

  const totalPopulationAtRisk = regions
    .filter(region => region.emergencyData.bushfire.severity >= 3 || region.emergencyData.flood.severity >= 2)
    .reduce((sum, region) => sum + (region.population || 0), 0);

  const activeIncidents = regions.filter(region => 
    region.emergencyData.bushfire.level !== 'no-rating' || region.emergencyData.flood.level !== 'no-warning'
  ).length;

  const handleRegionSelect = (region: RegionWithEmergency | undefined) => {
    setSelectedRegion(region);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Stats Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="text-sm font-medium">{highRiskRegions} High Risk Regions</div>
                  <div className="text-xs text-gray-500">Current alerts</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">{totalPopulationAtRisk.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Population at risk</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-sm font-medium">{activeIncidents} Active</div>
                  <div className="text-xs text-gray-500">Total incidents</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-sm font-medium">15 min ago</div>
                  <div className="text-xs text-gray-500">Last updated</div>
                </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'both' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('both')}
                  className="h-8"
                >
                  <LayoutGrid className="mr-1 h-3 w-3" />
                  Both
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="h-8"
                >
                  <Map className="mr-1 h-3 w-3" />
                  Map
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8"
                >
                  <List className="mr-1 h-3 w-3" />
                  List
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-180px)]">
          {/* Emergency List */}
          {(viewMode === 'both' || viewMode === 'list') && (
            <div className={`${viewMode === 'both' ? 'lg:col-span-4' : 'lg:col-span-12'} bg-white rounded-lg shadow`}>
              <EmergencyList 
                onRegionSelect={handleRegionSelect}
                selectedRegionId={selectedRegion?.id}
              />
            </div>
          )}

          {/* Map Container */}
          {(viewMode === 'both' || viewMode === 'map') && (
            <div className={`${viewMode === 'both' ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-lg shadow overflow-hidden`}>
              <MapContainer 
                selectedRegion={selectedRegion}
                onRegionSelect={handleRegionSelect}
              />
            </div>
          )}
        </div>

        {/* Additional Info Cards (when region is selected) */}
        {selectedRegion && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Current Conditions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bushfire Risk:</span>
                    <Badge 
                      variant="outline"
                      className="text-xs"
                    >
                      {selectedRegion.emergencyData.bushfire.level.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Flood Risk:</span>
                    <Badge 
                      variant="outline"
                      className="text-xs"
                    >
                      {selectedRegion.emergencyData.flood.level.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Recommendations</h3>
                <div className="text-sm text-gray-600">
                  {selectedRegion.emergencyData.bushfire.severity > selectedRegion.emergencyData.flood.severity
                    ? selectedRegion.emergencyData.bushfire.recommendations[0]
                    : selectedRegion.emergencyData.flood.recommendations[0]
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Region Info</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Population: {selectedRegion.population?.toLocaleString() || 'N/A'}</div>
                  <div>Area: {selectedRegion.area?.toLocaleString() || 'N/A'} km²</div>
                  <div>LGAs: {selectedRegion.localGovernmentAreas.length}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}; 