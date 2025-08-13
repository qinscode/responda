import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutGrid, Map, List, Clock } from 'lucide-react';

interface ControlBarProps {
  viewMode: 'both' | 'map' | 'list';
  onChange: (mode: 'both' | 'map' | 'list') => void;
  showToggle?: boolean;
}

export function ControlBar({ viewMode, onChange, showToggle = true }: ControlBarProps) {
  return (
    <Card className="card-modern">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
        {showToggle && (
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
            <Button size="sm" variant={viewMode === 'both' ? 'default' : 'ghost'} onClick={() => { onChange('both'); }}>
              <LayoutGrid className="h-4 w-4 mr-2" /> Both
            </Button>
            <Button size="sm" variant={viewMode === 'map' ? 'default' : 'ghost'} onClick={() => { onChange('map'); }}>
              <Map className="h-4 w-4 mr-2" /> Map
            </Button>
            <Button size="sm" variant={viewMode === 'list' ? 'default' : 'ghost'} onClick={() => { onChange('list'); }}>
              <List className="h-4 w-4 mr-2" /> List
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 