import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MapContainer } from '@/components/maps/MapContainer';
import { WeatherStationList } from '@/components/weather/WeatherStationList';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Station, RiverStation } from '@/types/weather';

export const Dashboard = () => {
  const [selectedStation, setSelectedStation] = useState<Station | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [stationTypeFilter, setStationTypeFilter] = useState<'all' | 'weather' | 'river'>('all');

  // Available content height inside main: adjust the constant if needed  
  // Emergency Banner (32px) + Header (64px) + Footer (24px) + Main padding (48px) + Buffer (32px) = 200px
  const sectionHeightClass = 'h-[calc(100vh-200px)]';

  return (
    <AppShell onSearchChange={setSearchQuery}>
      <div className={`animate-fade-in ${sectionHeightClass} max-w-none mx-auto px-2`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
          {/* Left sidebar - Weather Station List */}
          <div className="lg:col-span-3 h-full animate-slide-in-right animate-delay-100">
            <WeatherStationList
              searchQuery={searchQuery}
              selectedStationId={selectedStation?.id}
              onFilterTypeChange={setStationTypeFilter}
              onStationSelect={setSelectedStation}
            />
          </div>

          {/* Right side - Map */}
          <div className="lg:col-span-9 h-full animate-fade-in-up animate-delay-200">
            <Card className="card-modern-v2 border-0 shadow-none rounded-2xl py-0 h-full max-h-[calc(100vh-200px)] overflow-hidden">
              <CardContent className="p-0 h-full">
                <div className="map-container h-full rounded-2xl overflow-hidden">
                  <MapContainer 
                    selectedStation={selectedStation} 
                    stationTypeFilter={stationTypeFilter}
                    onStationSelect={setSelectedStation}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>


    </AppShell>
  );
}; 