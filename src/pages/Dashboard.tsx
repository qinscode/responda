import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MapContainer } from '@/components/maps/MapContainer';
import { WeatherStationList } from '@/components/weather/WeatherStationList';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WeatherStation } from '@/types/weather';

export const Dashboard = () => {
  const [selectedStation, setSelectedStation] = useState<WeatherStation | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  // Available content height inside main: adjust the constant if needed  
  // Emergency Banner (32px) + Header (64px) + Footer (24px) + Main padding (48px) + Buffer (32px) = 200px
  const sectionHeightClass = 'h-[calc(100vh-200px)]';

  return (
    <AppShell onSearchChange={setSearchQuery}>
      <div className={`animate-fade-in ${sectionHeightClass} max-w-6xl mx-auto`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left sidebar - Weather Station List */}
          <div className="lg:col-span-4 h-full animate-slide-in-right animate-delay-100">
            <WeatherStationList
              searchQuery={searchQuery}
              selectedStationId={selectedStation?.id}
              onStationSelect={setSelectedStation}
            />
          </div>

          {/* Right side - Map */}
          <div className="lg:col-span-8 h-full animate-fade-in-up animate-delay-200">
            <Card className="card-modern-v2 border-0 shadow-none rounded-2xl py-0 h-full max-h-[calc(100vh-200px)] overflow-hidden">
              <CardContent className="p-0 h-full">
                <div className="map-container h-full rounded-2xl overflow-hidden">
                  <MapContainer 
                    selectedStation={selectedStation} 
                    onStationSelect={setSelectedStation} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Selected Station Details */}
      {selectedStation && (
        <div className="mt-6 animate-scale-in">
          <Card className="card-modern-v2 overflow-hidden animate-card-hover">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`status-indicator-modern status-pulse ${
                      selectedStation.closeDate && selectedStation.closeDate !== 'Active' 
                        ? 'text-red-500' 
                        : 'text-green-500'
                    }`}></div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedStation.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Station ID:</span>
                        <span className="font-medium">#{selectedStation.stationNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">State:</span>
                        <span className="font-medium">{selectedStation.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Height:</span>
                        <span className="font-medium">{selectedStation.height}m</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Coordinates:</span>
                        <span className="font-medium font-mono text-xs">
                          {selectedStation.latitude.toFixed(4)}°, {selectedStation.longitude.toFixed(4)}°
                        </span>
                      </div>
                      {selectedStation.openDate && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Opened:</span>
                          <span className="font-medium">{selectedStation.openDate}</span>
                        </div>
                      )}
                      {selectedStation.closeDate && selectedStation.closeDate !== 'Active' && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Closed:</span>
                          <span className="font-medium text-red-600">{selectedStation.closeDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap lg:flex-col gap-2 lg:items-end">
                  <Badge 
                    variant="outline"
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    {selectedStation.state}
                  </Badge>
                  <Badge 
                    variant={selectedStation.closeDate && selectedStation.closeDate !== 'Active' ? 'destructive' : 'default'}
                    className={selectedStation.closeDate && selectedStation.closeDate !== 'Active' 
                      ? "bg-red-50 border-red-200 text-red-700" 
                      : "bg-green-50 border-green-200 text-green-700"
                    }
                  >
                    {selectedStation.closeDate && selectedStation.closeDate !== 'Active' ? 'Closed' : 'Active'}
                  </Badge>
                  <Badge 
                    variant="secondary"
                    className="bg-gray-50 border-gray-200 text-gray-700"
                  >
                    District {selectedStation.district}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}; 