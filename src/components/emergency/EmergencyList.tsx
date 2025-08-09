import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Flame, 
  Droplets, 
  AlertTriangle, 
  Clock,
  Users,
  Info,
  ChevronRight,
  Eye,
  LayoutGrid,
  Map as MapIcon,
  List as ListIcon
} from 'lucide-react';
import { getAllMockRegions } from '@/data/mockEmergencyData';
import type { RegionWithEmergency, EmergencyType } from '@/types/emergency';
import { format, addDays } from 'date-fns';

interface EmergencyListProps {
  onRegionSelect?: (region: RegionWithEmergency) => void;
  selectedRegionId?: string;
  searchQuery?: string;
  showHeader?: boolean;
  initialView?: 'card' | 'compact';
  externalViewMode?: 'both' | 'map' | 'list';
  onExternalViewModeChange?: (mode: 'both' | 'map' | 'list') => void;
}

type SortOption = 'name' | 'risk-level' | 'population' | 'last-updated';
type ViewMode = 'card' | 'compact';

export const EmergencyList = ({ onRegionSelect, selectedRegionId, searchQuery = '', showHeader = false, initialView = 'compact', externalViewMode, onExternalViewModeChange }: EmergencyListProps) => {
  const [emergencyFilter, setEmergencyFilter] = useState<EmergencyType | 'both'>('both');
  const [sortBy, setSortBy] = useState<SortOption>('risk-level');
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [dayOffset, setDayOffset] = useState<number>(0);

  const regions = getAllMockRegions();
  const effectiveSearchQuery = searchQuery || localSearchQuery;

  const filteredAndSortedRegions = useMemo(() => {
    let filtered = regions;
    if (emergencyFilter !== 'both') {
      filtered = filtered.filter(region => {
        const { bushfire, flood } = region.emergencyData;
        if (emergencyFilter === 'bushfire') return bushfire.level !== 'no-rating';
        return flood.level !== 'no-warning';
      });
    }
    if (effectiveSearchQuery) {
      const query = effectiveSearchQuery.toLowerCase();
      filtered = filtered.filter(region =>
        region.name.toLowerCase().includes(query) ||
        region.localGovernmentAreas.some(area => area.toLowerCase().includes(query))
      );
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'risk-level':
          return Math.max(b.emergencyData.bushfire.severity, b.emergencyData.flood.severity) -
                 Math.max(a.emergencyData.bushfire.severity, a.emergencyData.flood.severity);
        case 'population':
          return (b.population || 0) - (a.population || 0);
        case 'last-updated':
          return new Date(b.emergencyData.bushfire.lastUpdated).getTime() -
                 new Date(a.emergencyData.bushfire.lastUpdated).getTime();
        default:
          return 0;
      }
    });
    return filtered;
  }, [regions, emergencyFilter, effectiveSearchQuery, sortBy]);

  const getEmergencyBadgeClass = (type: EmergencyType, level: string) => {
    const baseClass = "status-indicator text-xs font-medium";
    if (type === 'bushfire') {
      switch (level) {
        case 'no-rating': return `${baseClass} emergency-no-rating`;
        case 'low-moderate': return `${baseClass} emergency-low-moderate`;
        case 'high': return `${baseClass} emergency-high`;
        case 'very-high': return `${baseClass} emergency-very-high`;
        case 'severe': return `${baseClass} emergency-severe`;
        case 'extreme': return `${baseClass} emergency-extreme`;
        case 'catastrophic': return `${baseClass} emergency-catastrophic`;
        default: return `${baseClass} emergency-no-rating`;
      }
    } else {
      switch (level) {
        case 'no-warning': return `${baseClass} flood-no-warning`;
        case 'minor': return `${baseClass} flood-minor`;
        case 'moderate': return `${baseClass} flood-moderate`;
        case 'major': return `${baseClass} flood-major`;
        default: return `${baseClass} flood-no-warning`;
      }
    }
  };

  const getHighestRisk = (region: RegionWithEmergency) => {
    const { bushfire, flood } = region.emergencyData;
    return bushfire.severity >= flood.severity ? bushfire : flood;
  };

  const getRiskDotClass = (severity: number) => {
    if (severity >= 5) return 'bg-red-700';
    if (severity >= 4) return 'bg-red-600';
    if (severity >= 3) return 'bg-orange-500';
    if (severity >= 2) return 'bg-yellow-500';
    if (severity >= 1) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const RegionRow = ({ region }: { region: RegionWithEmergency }) => {
    const isSelected = selectedRegionId === region.id;
    const highest = getHighestRisk(region);

    return (
      <button
        onClick={() => onRegionSelect?.(region)}
        className={`w-full text-left rounded-lg border px-3 py-3 transition-colors flex items-start justify-between ${
          isSelected ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-muted/50 border-border'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 h-6 w-6 rounded-full ${getRiskDotClass(highest.severity)} ring-2 ${isSelected ? 'ring-white/40' : 'ring-white'}`} />
          <div>
            <div className="font-medium leading-5">{region.name}</div>
            <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>{highest.description}</div>
          </div>
        </div>
        <div className={`flex items-center gap-2 text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
          <span>Today</span>
          <Info className="h-4 w-4" />
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col">
      {showHeader && (
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold heading-modern">Fire Danger Ratings</h2>
              <p className="text-xs text-muted-foreground">{filteredAndSortedRegions.length} of {regions.length} regions</p>
            </div>
            {/* Move Both / Map / List toggle into the left header when controlled props provided */}
            {externalViewMode && onExternalViewModeChange && (
              <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                <Button variant={externalViewMode === 'both' ? 'default' : 'ghost'} size="sm" onClick={() => onExternalViewModeChange('both')}>
                  <LayoutGrid className="h-4 w-4 mr-2" /> Both
                </Button>
                <Button variant={externalViewMode === 'map' ? 'default' : 'ghost'} size="sm" onClick={() => onExternalViewModeChange('map')}>
                  <MapIcon className="h-4 w-4 mr-2" /> Map
                </Button>
                <Button variant={externalViewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => onExternalViewModeChange('list')}>
                  <ListIcon className="h-4 w-4 mr-2" /> List
                </Button>
              </div>
            )}
          </div>

          <div className="mt-3">
            <Tabs value={String(dayOffset)} onValueChange={(v) => setDayOffset(Number(v))}>
              <TabsList className="grid w-full grid-cols-4">
                {[0,1,2,3].map((i) => (
                  <TabsTrigger key={i} value={String(i)} className="text-xs">
                    {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(addDays(new Date(), i), 'dd MMM')}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {!searchQuery && (
            <div className="relative mt-3">
              <Input placeholder="Search regions..." value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} />
            </div>
          )}

          <div className="mt-3 grid grid-cols-3 gap-3">
            <Tabs value={emergencyFilter} onValueChange={(value) => setEmergencyFilter(value as EmergencyType | 'both')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="both" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="bushfire" className="text-xs">Fire</TabsTrigger>
                <TabsTrigger value="flood" className="text-xs">Flood</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger><SelectValue placeholder="Sort by..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="risk-level">Risk Level</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="population">Population</SelectItem>
                <SelectItem value="last-updated">Last Updated</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="compact" className="text-xs">List</TabsTrigger>
                <TabsTrigger value="card" className="text-xs">Cards</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}

      <div className="p-3 space-y-2">
        {filteredAndSortedRegions.length === 0 ? (
          <Card className="card-modern">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No regions found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        ) : viewMode === 'compact' ? (
          <div className="space-y-2">
            {filteredAndSortedRegions.map((region) => (
              <RegionRow key={region.id} region={region} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
            {filteredAndSortedRegions.map((region) => (
              <Card key={region.id} className="card-modern">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${getRiskDotClass(getHighestRisk(region).severity)}`} />
                      <div className="font-medium">{region.name}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onRegionSelect?.(region)}>
                      <Eye className="h-3 w-3 mr-2" /> View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 