import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockRiverStations } from '@/data/mockRiverData';
import type { RiverStation } from '@/types/river';

interface RiverStationListProps {
  selectedStationId?: string;
  onStationSelect?: (station: RiverStation) => void;
  searchQuery?: string;
}

const ITEMS_PER_PAGE = 30;

export const RiverStationList = ({ selectedStationId, onStationSelect, searchQuery = '' }: RiverStationListProps) => {
  const [stations, setStations] = useState<Array<RiverStation>>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setStations(mockRiverStations);
  }, []);

  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return stations;
    
    const query = searchQuery.toLowerCase();
    return stations.filter(station => 
      station.name.toLowerCase().includes(query) ||
      station.river.toLowerCase().includes(query) ||
      station.catchment.toLowerCase().includes(query) ||
      station.stationNumber.includes(query) ||
      station.purpose.some(p => p.toLowerCase().includes(query))
    );
  }, [stations, searchQuery]);

  const totalPages = Math.ceil(filteredStations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStations = filteredStations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredStations.length, currentPage, totalPages]);

  const handleStationClick = (station: RiverStation) => {
    onStationSelect?.(station);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <Card className="card-modern-v2 h-full flex flex-col shadow-none border-0">
      <CardHeader className="pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h2 className="text-lg font-semibold text-gray-900">River Stations</h2>
            </div>
            <Badge variant="secondary" className="bg-blue-50 border-blue-200 text-blue-700">
              {filteredStations.length} stations
            </Badge>
          </div>
        </div>

        {filteredStations.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">{currentPage}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground border-t pt-3">
          <div className="flex items-center justify-center gap-4 text-xs">
            <span>Showing {paginatedStations.length} of {filteredStations.length} river stations</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 overflow-hidden p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 p-4 pt-0">
            {paginatedStations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No matching river stations found
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
                  
                  {/* River and Station info */}
                  <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                    <div className="text-muted-foreground">
                      <span className="font-medium">River:</span> {station.river}
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-medium">Station #:</span> {station.stationNumber}
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-medium">Catchment:</span> {station.catchment}
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-medium">District:</span> {station.district}
                    </div>
                  </div>

                  {/* Purpose tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {station.purpose.slice(0, 2).map((purpose, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                        {purpose}
                      </Badge>
                    ))}
                    {station.purpose.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{station.purpose.length - 2} more
                      </Badge>
                    )}
                  </div>
                  
                  {/* Location */}
                  <div className="text-xs text-muted-foreground font-mono">
                    {station.latitude.toFixed(4)}°, {station.longitude.toFixed(4)}°
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 