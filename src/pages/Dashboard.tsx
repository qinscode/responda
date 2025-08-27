import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MapContainer } from '@/components/maps/MapContainer';
import { WeatherStationList } from '@/components/weather/WeatherStationList';
import { RiverStationList } from '@/components/river/RiverStationList';
import { StationTypeSwitcher } from '@/components/ui/station-type-switcher';
import { Card, CardContent } from '@/components/ui/card';
import type { WeatherStation } from '@/types/weather';
import type { RiverStation, StationType } from '@/types/river';

export const Dashboard = () => {
  const [selectedStation, setSelectedStation] = useState<WeatherStation | RiverStation | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [stationType, setStationType] = useState<StationType>('weather');

  // Available content height inside main: adjust the constant if needed  
  // Emergency Banner (32px) + Header (64px) + Footer (24px) + Main padding (48px) + Buffer (32px) = 200px
  const sectionHeightClass = 'h-[calc(100vh-200px)]';

  return (
    <AppShell onSearchChange={setSearchQuery}>
      <div className={`animate-fade-in ${sectionHeightClass} max-w-6xl mx-auto`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left sidebar - Station List */}
          <div className="lg:col-span-4 h-full animate-slide-in-right animate-delay-100 space-y-4">
            <StationTypeSwitcher 
              selectedType={stationType}
              onTypeChange={(type) => {
                setStationType(type);
                setSelectedStation(undefined); // Clear selection when switching types
              }}
            />
            
            {stationType === 'weather' ? (
              <WeatherStationList
                searchQuery={searchQuery}
                selectedStationId={selectedStation?.id}
                onStationSelect={setSelectedStation}
              />
            ) : (
              <RiverStationList
                searchQuery={searchQuery}
                selectedStationId={selectedStation?.id}
                onStationSelect={setSelectedStation}
              />
            )}
          </div>

          {/* Right side - Map */}
          <div className="lg:col-span-8 h-full animate-fade-in-up animate-delay-200">
            <Card className="card-modern-v2 border-0 shadow-none rounded-2xl py-0 h-full max-h-[calc(100vh-200px)] overflow-hidden">
              <CardContent className="p-0 h-full">
                <div className="map-container h-full rounded-2xl overflow-hidden">
                  <MapContainer 
                    selectedStation={selectedStation} 
                    onStationSelect={setSelectedStation}
                    stationType={stationType}
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