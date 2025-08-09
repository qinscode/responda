import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Navigation, 
  Layers,
  X,
  Flame,
  Droplets,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { getAllMockRegions } from '@/data/mockEmergencyData';
import type { RegionWithEmergency } from '@/types/emergency';

interface MapContainerProps {
  selectedRegion?: RegionWithEmergency;
  onRegionSelect?: (region: RegionWithEmergency | undefined) => void;
}

export const MapContainer = ({ selectedRegion, onRegionSelect }: MapContainerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [showRegionPopup, setShowRegionPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  
  const regions = getAllMockRegions();

  // Simulate clicking on a region
  const handleRegionClick = (region: RegionWithEmergency, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
    onRegionSelect?.(region);
    setShowRegionPopup(true);
  };

  const closePopup = () => {
    setShowRegionPopup(false);
    onRegionSelect?.(undefined);
  };

  const getBushfireColor = (level: string) => {
    const colors = {
      'no-rating': '#9ca3af',
      'low-moderate': '#10b981',
      'high': '#f59e0b',
      'very-high': '#ea580c',
      'severe': '#dc2626',
      'extreme': '#991b1b',
      'catastrophic': '#7f1d1d'
    };
    return colors[level as keyof typeof colors] || '#9ca3af';
  };

  const getFloodColor = (level: string) => {
    const colors = {
      'no-warning': '#9ca3af',
      'minor': '#3b82f6',
      'moderate': '#1d4ed8',
      'major': '#1e40af'
    };
    return colors[level as keyof typeof colors] || '#9ca3af';
  };

  const formatRatingLabel = (level: string) => {
    return level.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="relative h-full bg-blue-50 rounded-lg overflow-hidden">
      {/* Map Placeholder */}
      <div 
        ref={mapRef}
        className="w-full h-full relative bg-gradient-to-br from-blue-100 to-green-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%23cbd5e1' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`,
        }}
      >
        {/* Western Australia Outline Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            width="600" 
            height="400" 
            viewBox="0 0 600 400" 
            className="opacity-20"
          >
            <path 
              d="M50 50 L550 50 L550 350 L200 350 L50 200 Z" 
              fill="none" 
              stroke="#374151" 
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <text x="300" y="200" textAnchor="middle" className="fill-gray-600 text-lg font-medium">
              Western Australia Map
            </text>
            <text x="300" y="220" textAnchor="middle" className="fill-gray-500 text-sm">
              (Mapbox integration placeholder)
            </text>
          </svg>
        </div>

        {/* Simulated Region Markers */}
        <div className="absolute inset-0">
          {regions.slice(0, 6).map((region, index) => {
            const positions = [
              { x: '25%', y: '30%' }, // Perth Metro
              { x: '45%', y: '15%' }, // Pilbara
              { x: '75%', y: '10%' }, // Kimberley
              { x: '70%', y: '60%' }, // Goldfields-Esperance
              { x: '20%', y: '70%' }, // Great Southern
              { x: '35%', y: '45%' }, // Mid West
            ];
            
            const position = positions[index] || { x: '50%', y: '50%' };
            const isSelected = selectedRegion?.id === region.id;
            
            return (
              <div
                key={region.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                  isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                }`}
                style={{ left: position.x, top: position.y }}
                onClick={(e) => handleRegionClick(region, e)}
              >
                <div 
                  className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                    isSelected ? 'ring-4 ring-blue-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: region.emergencyData.bushfire.severity > region.emergencyData.flood.severity 
                      ? getBushfireColor(region.emergencyData.bushfire.level)
                      : getFloodColor(region.emergencyData.flood.level)
                  }}
                >
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {region.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Region Popup */}
        {showRegionPopup && selectedRegion && (
          <div 
            className="absolute z-30 bg-white rounded-lg shadow-xl border max-w-sm"
            style={{
              left: Math.min(popupPosition.x, (mapRef.current?.clientWidth || 400) - 300),
              top: Math.max(10, popupPosition.y - 200),
            }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: selectedRegion.emergencyData.bushfire.severity > selectedRegion.emergencyData.flood.severity 
                          ? getBushfireColor(selectedRegion.emergencyData.bushfire.level)
                          : getFloodColor(selectedRegion.emergencyData.flood.level)
                      }}
                    />
                    <h3 className="font-semibold text-lg">{selectedRegion.name}</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={closePopup}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Danger Ratings */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Danger Rating: Today</div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Flame className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Bushfire</span>
                        </div>
                        <Badge 
                          style={{ backgroundColor: getBushfireColor(selectedRegion.emergencyData.bushfire.level) }}
                          className="text-white"
                        >
                          {formatRatingLabel(selectedRegion.emergencyData.bushfire.level)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Flood</span>
                        </div>
                        <Badge 
                          style={{ backgroundColor: getFloodColor(selectedRegion.emergencyData.flood.level) }}
                          className="text-white"
                        >
                          {formatRatingLabel(selectedRegion.emergencyData.flood.level)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Local Government Areas */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Local government areas affected</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedRegion.localGovernmentAreas.slice(0, 3).map((area, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <span>•</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      Zoom map
                    </Button>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View more
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button variant="outline" size="icon" className="bg-white">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-white">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-white">
          <Maximize className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-white">
          <Navigation className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-white">
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Style Toggle */}
      <div className="absolute bottom-4 left-4">
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow">
          {(['streets', 'satellite', 'terrain'] as const).map((style) => (
            <Button
              key={style}
              variant={mapStyle === style ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMapStyle(style)}
              className="capitalize"
            >
              {style}
            </Button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow max-w-xs">
        <div className="text-sm font-medium mb-2">Emergency Levels</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Low-Moderate</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Severe+</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 