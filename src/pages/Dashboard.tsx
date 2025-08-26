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
  const sectionHeightClass = 'min-h-[calc(100vh-160px)]';

  return (
    <AppShell onSearchChange={setSearchQuery}>
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${sectionHeightClass}`}>
        {/* Left sidebar - Weather Station List */}
        <div className="lg:col-span-4 h-full">
          <WeatherStationList
            selectedStationId={selectedStation?.id}
            onStationSelect={setSelectedStation}
            searchQuery={searchQuery}
          />
        </div>

        {/* Right side - Map */}
        <div className="lg:col-span-8 h-full">
          <Card className="bg-transparent border-0 shadow-none rounded-xl py-0 h-full">
            <CardContent className="p-0 h-full">
              <div className="map-container h-full">
                <MapContainer 
                  selectedStation={selectedStation} 
                  onStationSelect={setSelectedStation} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Station Details */}
      {selectedStation && (
        <Card className="card-modern">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold heading-modern">{selectedStation.name}</h3>
              <p className="text-sm text-muted-foreground">
                Station #{selectedStation.stationNumber} • {selectedStation.state} • Height: {selectedStation.height}m
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Coordinates: {selectedStation.latitude.toFixed(4)}°, {selectedStation.longitude.toFixed(4)}°
              </p>
              {selectedStation.openDate && (
                <p className="text-xs text-muted-foreground">
                  Opened: {selectedStation.openDate}
                  {selectedStation.closeDate && selectedStation.closeDate !== 'Active' && 
                    ` - Closed: ${selectedStation.closeDate}`
                  }
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selectedStation.state}</Badge>
              <Badge variant={selectedStation.closeDate && selectedStation.closeDate !== 'Active' ? 'destructive' : 'default'}>
                {selectedStation.closeDate && selectedStation.closeDate !== 'Active' ? 'Closed' : 'Active'}
              </Badge>
              <Badge variant="secondary">
                District {selectedStation.district}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}; 