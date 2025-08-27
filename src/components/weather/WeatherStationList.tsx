import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { WeatherStation, WeatherData } from '@/types/weather';
import { parseWeatherStationsFromCSV, getWeatherDataForStation } from '@/data/weatherStationParser';

interface WeatherStationListProps {
  selectedStationId?: string;
  onStationSelect?: (station: WeatherStation) => void;
  searchQuery?: string;
}

const ITEMS_PER_PAGE = 30;

export const WeatherStationList = ({ selectedStationId, onStationSelect, searchQuery = '' }: WeatherStationListProps) => {
  const [stations, setStations] = useState<Array<WeatherStation>>([]);
  const [weatherData, setWeatherData] = useState<Map<string, WeatherData>>(new Map());
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [sortBy, setSortBy] = useState<'name' | 'number' | 'height'>('name');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Load weather stations on component mount
  useEffect(() => {
    void parseWeatherStationsFromCSV().then(async (stations) => {
      setStations(stations);
      
      // Load weather data for first few stations
      const weatherMap = new Map<string, WeatherData>();
      for (const station of stations.slice(0, 10)) { // Load first 10 for performance
        try {
          const data = await getWeatherDataForStation(station.id);
          if (data) {
            weatherMap.set(station.id, data);
          }
        } catch (error) {
          console.error(`Failed to load weather data for station ${station.id}:`, error);
        }
      }
      setWeatherData(weatherMap);
      setLoading(false);
    });
  }, []);

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
    setCurrentPage(1); // Reset page when search changes
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, filterStatus, localSearchQuery]);

  // Filter and sort stations
  const filteredStations = useMemo(() => {
    const filtered = stations.filter(station => {
      if (!station.name || !station.stationNumber) return false;
      
      const matchesSearch = station.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                           station.stationNumber.includes(localSearchQuery);
      
      let matchesStatus = true;
      if (filterStatus === 'active') {
        matchesStatus = !station.closeDate || station.closeDate === 'Active';
      } else if (filterStatus === 'closed') {
        matchesStatus = Boolean(station.closeDate && station.closeDate !== 'Active');
      }

      return matchesSearch && matchesStatus;
    });

    // Sort stations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'number':
          return a.stationNumber.localeCompare(b.stationNumber);
        case 'height':
          return a.height - b.height;
        default:
          return 0;
      }
    });

    return filtered;
  }, [stations, localSearchQuery, sortBy, filterStatus]);

  // Paginated stations
  const paginatedStations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStations, currentPage]);

  const totalPages = Math.ceil(filteredStations.length / ITEMS_PER_PAGE);

  const handleStationClick = (station: WeatherStation) => {
    if (onStationSelect) {
      onStationSelect(station);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <Card className="h-full max-h-[calc(100vh-200px)]">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Loading weather station data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern-v2 h-full max-h-[calc(100vh-200px)] flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="text-xl font-semibold text-gray-900 mb-4">Weather Stations (WA)</CardTitle>
        <div className="space-y-4">
          <Input
            className="input-modern text-sm placeholder:text-gray-400"
            placeholder="Search station name or number..."
            value={localSearchQuery}
            onChange={(e) => { setLocalSearchQuery(e.target.value); }}
          />
          <div className="flex gap-3">
            <Select value={sortBy} onValueChange={(value: 'name' | 'number' | 'height') => { setSortBy(value); }}>
              <SelectTrigger className="input-modern text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="card-modern-v2 border-0">
                <SelectItem value="name" className="hover:bg-blue-50">Sort by Name</SelectItem>
                <SelectItem value="number" className="hover:bg-blue-50">Sort by Number</SelectItem>
                <SelectItem value="height" className="hover:bg-blue-50">Sort by Height</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'closed') => { setFilterStatus(value); }}>
              <SelectTrigger className="input-modern text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="card-modern-v2 border-0">
                <SelectItem value="all" className="hover:bg-blue-50">All Status</SelectItem>
                <SelectItem value="active" className="hover:bg-blue-50">Active</SelectItem>
                <SelectItem value="closed" className="hover:bg-blue-50">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 overflow-hidden p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 p-4 pt-0">
            {paginatedStations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No matching weather stations found
              </div>
            ) : (
              paginatedStations.map((station, index) => (
                <div
                  key={station.id}
                  className={`p-3 rounded-lg border cursor-pointer animate-card-hover backdrop-blur-sm card-entry ${
                    selectedStationId === station.id
                      ? 'border-blue-200 bg-blue-50/80 shadow-md'
                      : 'border-gray-200 bg-white/60 hover:border-gray-300'
                  } ${index < 4 ? `animate-delay-${index * 100 + 100}` : ''}`}
                  onClick={() => { handleStationClick(station); }}
                >
                  {/* Header row with name and status */}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-gray-900 truncate flex-1 mr-2">{station.name}</h4>
                    <Badge 
                      className={`text-xs font-medium shrink-0 ${
                        (!station.closeDate || station.closeDate === 'Active') 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                      variant="outline"
                    >
                      {(!station.closeDate || station.closeDate === 'Active') ? 'Active' : 'Closed'}
                    </Badge>
                  </div>
                  
                  {/* Compact info grid */}
                  <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                    <div>
                      <span className="text-gray-500">Station:</span>
                      <span className="font-medium text-gray-700 ml-1">#{station.stationNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Height:</span>
                      <span className="font-medium text-gray-700 ml-1">{station.height}m</span>
                    </div>
                  </div>
                  
                  {/* Coordinates */}
                  <div className="text-xs text-gray-500 mb-1">
                    {station.latitude.toFixed(2)}°, {station.longitude.toFixed(2)}°
                  </div>
                  
                  {/* Weather data - only if available */}
                  {weatherData.has(station.id) && (
                    <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded border border-blue-100">
                      <div className="flex justify-between items-center text-xs">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">{weatherData.get(station.id)!.temperature}°C</div>
                          <div className="text-blue-500">Temp</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-cyan-600">{weatherData.get(station.id)!.humidity}%</div>
                          <div className="text-cyan-500">Humidity</div>
                        </div>
                        <div className="text-center flex-1 ml-2">
                          <div className="text-gray-600 text-xs truncate">{weatherData.get(station.id)!.conditions}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-1">
                <Button
                  className="h-8 px-3 text-xs rounded-lg btn-spring"
                  disabled={currentPage <= 1}
                  size="sm"
                  variant="outline"
                  onClick={() => { handlePageChange(currentPage - 1); }}
                >
                  ←
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                  return (
                    <Button
                      key={page}
                      className={`h-8 px-3 text-xs min-w-8 rounded-lg btn-spring ${
                        page === currentPage 
                          ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md' 
                          : 'hover:bg-blue-50'
                      }`}
                      size="sm"
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => { handlePageChange(page); }}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  className="h-8 px-3 text-xs rounded-lg btn-spring"
                  disabled={currentPage >= totalPages}
                  size="sm"
                  variant="outline"
                  onClick={() => { handlePageChange(currentPage + 1); }}
                >
                  →
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 text-xs font-medium text-gray-600 flex-shrink-0 backdrop-blur-sm">
        Showing {Math.min(filteredStations.length, ITEMS_PER_PAGE)} of {filteredStations.length} weather stations
      </div>
    </Card>
  );
}; 