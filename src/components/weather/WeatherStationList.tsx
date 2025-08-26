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

const ITEMS_PER_PAGE = 20;

export const WeatherStationList = ({ selectedStationId, onStationSelect, searchQuery = '' }: WeatherStationListProps) => {
  const [stations, setStations] = useState<WeatherStation[]>([]);
  const [weatherData, setWeatherData] = useState<Map<string, WeatherData>>(new Map());
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [sortBy, setSortBy] = useState<'name' | 'number' | 'height'>('name');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Load weather stations on component mount
  useEffect(() => {
    parseWeatherStationsFromCSV().then(async (stations) => {
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
    let filtered = stations.filter(station => {
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
      <Card className="h-full max-h-[calc(100vh-12rem)]">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Loading weather station data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full max-h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="text-lg font-semibold">Weather Stations (WA)</CardTitle>
        <div className="space-y-3">
          <Input
            placeholder="Search station name or number..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(value: 'name' | 'number' | 'height') => setSortBy(value)}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="number">Sort by Number</SelectItem>
                <SelectItem value="height">Sort by Height</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'closed') => setFilterStatus(value)}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
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
              paginatedStations.map((station) => (
                <div
                  key={station.id}
                  onClick={() => handleStationClick(station)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                    selectedStationId === station.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-muted-foreground/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm leading-none">{station.name}</h4>
                    <Badge 
                      variant={(!station.closeDate || station.closeDate === 'Active') ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {(!station.closeDate || station.closeDate === 'Active') ? 'Active' : 'Closed'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Station: {station.stationNumber}</span>
                      <span>Height: {station.height}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coordinates: {station.latitude.toFixed(2)}°, {station.longitude.toFixed(2)}°</span>
                    </div>
                    {station.openDate && (
                      <div className="text-xs">
                        Opened: {station.openDate}
                      </div>
                    )}
                    {weatherData.has(station.id) && (
                      <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                        <div className="flex justify-between">
                          <span>{weatherData.get(station.id)!.temperature}°C</span>
                          <span>{weatherData.get(station.id)!.humidity}% RH</span>
                        </div>
                        <div className="text-center mt-1 text-muted-foreground">
                          {weatherData.get(station.id)!.conditions}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 p-4 border-t bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="h-7 px-2 text-xs"
                >
                  ←
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={page}
                      size="sm"
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className="h-7 px-2 text-xs min-w-7"
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="h-7 px-2 text-xs"
                >
                  →
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <div className="px-4 py-3 border-t bg-muted/20 text-xs text-muted-foreground flex-shrink-0">
        Showing {Math.min(filteredStations.length, ITEMS_PER_PAGE)} of {filteredStations.length} weather stations
      </div>
    </Card>
  );
}; 