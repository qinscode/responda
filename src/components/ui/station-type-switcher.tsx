import { Button } from '@/components/ui/button';
import type { StationType } from '@/types/river';

interface StationTypeSwitcherProps {
  selectedType: StationType;
  onTypeChange: (type: StationType) => void;
}

export const StationTypeSwitcher = ({ selectedType, onTypeChange }: StationTypeSwitcherProps) => {
  return (
    <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
      <Button
        variant={selectedType === 'weather' ? 'default' : 'ghost'}
        size="sm"
        className={`flex-1 ${
          selectedType === 'weather' 
            ? 'bg-white shadow-sm text-gray-900' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
        }`}
        onClick={() => onTypeChange('weather')}
      >
        🌤️ Weather Stations
      </Button>
      <Button
        variant={selectedType === 'river' ? 'default' : 'ghost'}
        size="sm"
        className={`flex-1 ${
          selectedType === 'river' 
            ? 'bg-white shadow-sm text-gray-900' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
        }`}
        onClick={() => onTypeChange('river')}
      >
        🌊 River Stations
      </Button>
    </div>
  );
}; 