import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Calendar, MapPin, Flame, Droplets, AlertTriangle } from 'lucide-react';
import { getAllMockRegions } from '@/data/mockEmergencyData';
import type { RegionWithEmergency, EmergencyType } from '@/types/emergency';

interface EmergencyListProps {
  onRegionSelect?: (region: RegionWithEmergency) => void;
  selectedRegionId?: string;
}

export const EmergencyList = ({ onRegionSelect, selectedRegionId }: EmergencyListProps) => {
  const [selectedDate, setSelectedDate] = useState('today');
  const [showBothTypes, setShowBothTypes] = useState(true);
  const [emergencyFilter, setEmergencyFilter] = useState<EmergencyType | 'both'>('both');
  
  const regions = getAllMockRegions();

  const getBushfireColor = (level: string) => {
    const colors = {
      'no-rating': 'bg-gray-500',
      'low-moderate': 'bg-green-500',
      'high': 'bg-yellow-500',
      'very-high': 'bg-orange-500',
      'severe': 'bg-red-500',
      'extreme': 'bg-red-700',
      'catastrophic': 'bg-red-900'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  const getFloodColor = (level: string) => {
    const colors = {
      'no-warning': 'bg-gray-500',
      'minor': 'bg-blue-400',
      'moderate': 'bg-blue-600',
      'major': 'bg-blue-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  const formatRatingLabel = (level: string) => {
    return level.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredRegions = regions.filter(region => {
    if (emergencyFilter === 'bushfire') {
      return region.emergencyData.bushfire.severity > 0;
    }
    if (emergencyFilter === 'flood') {
      return region.emergencyData.flood.severity > 0;
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header Controls */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Emergency Ratings</h2>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Today</span>
          </div>
        </div>

        {/* Date Tabs */}
        <Tabs value={selectedDate} onValueChange={setSelectedDate} className="mb-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
            <TabsTrigger value="11-aug">11 Aug</TabsTrigger>
            <TabsTrigger value="12-aug">12 Aug</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Emergency Type Filter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant={emergencyFilter === 'both' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEmergencyFilter('both')}
            >
              Both
            </Button>
            <Button
              variant={emergencyFilter === 'bushfire' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEmergencyFilter('bushfire')}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Flame className="mr-1 h-3 w-3" />
              Bushfire
            </Button>
            <Button
              variant={emergencyFilter === 'flood' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEmergencyFilter('flood')}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Droplets className="mr-1 h-3 w-3" />
              Flood
            </Button>
          </div>
        </div>
      </div>

      {/* Regions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredRegions.map((region) => (
          <Card 
            key={region.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRegionId === region.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => onRegionSelect?.(region)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{region.name}</h3>
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>

              {/* Emergency Ratings */}
              <div className="space-y-2">
                {(emergencyFilter === 'both' || emergencyFilter === 'bushfire') && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Flame className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-600">Bushfire</span>
                    </div>
                    <Badge 
                      className={`${getBushfireColor(region.emergencyData.bushfire.level)} text-white`}
                    >
                      {formatRatingLabel(region.emergencyData.bushfire.level)}
                    </Badge>
                  </div>
                )}

                {(emergencyFilter === 'both' || emergencyFilter === 'flood') && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Flood</span>
                    </div>
                    <Badge 
                      className={`${getFloodColor(region.emergencyData.flood.level)} text-white`}
                    >
                      {formatRatingLabel(region.emergencyData.flood.level)}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Population Info */}
              {region.population && (
                <div className="mt-2 text-xs text-gray-500">
                  Population: {region.population.toLocaleString()}
                </div>
              )}

              {/* Highest Warning Indicator */}
              {(region.emergencyData.bushfire.severity >= 4 || region.emergencyData.flood.severity >= 3) && (
                <div className="mt-2 flex items-center space-x-1 text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-xs font-medium">High Alert</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 