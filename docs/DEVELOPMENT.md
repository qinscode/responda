# Western Australia Emergency Dashboard - Development Documentation

## 1. Technical Architecture

### 1.1 System Overview
The WA Emergency Dashboard is built as a modern single-page application (SPA) using React and TypeScript, designed to provide real-time emergency information through an interactive map interface and comprehensive data visualization.

### 1.2 Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   QGIS Server   │    │  Emergency API  │    │   Backup Data   │
│   (GeoJSON)     │────│   (GraphQL)     │────│   Sources       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                          ┌───────▼───────┐
                          │  Data Service │
                          │   Layer       │
                          └───────┬───────┘
                                  │
                          ┌───────▼───────┐
                          │   Frontend    │
                          │  Application  │
                          └───────────────┘
                                  │
          ┌─────────────────┬─────┴─────┬─────────────────┐
          │                 │           │                 │
    ┌─────▼─────┐    ┌─────▼─────┐ ┌───▼────┐    ┌─────▼─────┐
    │   Map     │    │   State   │ │   UI   │    │  Data     │
    │ Component │    │ Management│ │ Layer  │    │ Services  │
    └───────────┘    └───────────┘ └────────┘    └───────────┘
```

### 1.3 Technology Stack

#### 1.3.1 Core Technologies
- **Frontend Framework**: React 18.2+
- **Language**: TypeScript 5.0+
- **Build Tool**: Vite 4.4+
- **Package Manager**: pnpm (existing in project)

#### 1.3.2 Map and Visualization
- **Mapping**: Mapbox GL JS v2.15+
- **Charts**: Recharts or Chart.js
- **Icons**: Lucide React or Heroicons

#### 1.3.3 State Management and Data
- **State Management**: Zustand 4.4+
- **Data Fetching**: TanStack Query (React Query) v4.29+
- **Date Handling**: date-fns 2.30+
- **Schema Validation**: Zod 3.21+

#### 1.3.4 UI and Styling
- **CSS Framework**: Tailwind CSS 3.3+ (already configured)
- **UI Components**: Headless UI or Radix UI
- **Animations**: Framer Motion (optional)

#### 1.3.5 Development and Testing
- **Testing**: Vitest + React Testing Library (already configured)
- **E2E Testing**: Playwright (already configured)
- **Code Quality**: ESLint + Prettier (already configured)
- **Git Hooks**: Husky + lint-staged

## 2. Project Structure

### 2.1 Folder Organization
```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── layout/                # Layout components (Header, Footer, etc.)
│   ├── maps/                  # Map-related components
│   │   ├── MapContainer.tsx
│   │   ├── RegionLayer.tsx
│   │   ├── MapControls.tsx
│   │   └── RegionPopup.tsx
│   ├── dashboard/             # Dashboard-specific components
│   │   ├── EmergencyList.tsx
│   │   ├── DateSelector.tsx
│   │   ├── FilterControls.tsx
│   │   └── SearchBar.tsx
│   └── charts/                # Chart components
│       ├── DangerGauge.tsx
│       └── EmergencyTimeline.tsx
├── hooks/                     # Custom React hooks
│   ├── useEmergencyData.ts
│   ├── useMapInteraction.ts
│   ├── useGeolocation.ts
│   └── useSearch.ts
├── services/                  # API and data services
│   ├── api/
│   │   ├── emergency.ts
│   │   ├── regions.ts
│   │   └── qgis.ts
│   ├── data/
│   │   ├── mockData.ts
│   │   ├── validation.ts
│   │   └── transformers.ts
│   └── map/
│       ├── mapbox.ts
│       └── layers.ts
├── store/                     # Zustand stores
│   ├── emergencyStore.ts
│   ├── mapStore.ts
│   ├── uiStore.ts
│   └── index.ts
├── types/                     # TypeScript type definitions
│   ├── emergency.ts
│   ├── geography.ts
│   ├── api.ts
│   └── index.ts
├── utils/                     # Utility functions
│   ├── constants.ts
│   ├── colors.ts
│   ├── formatters.ts
│   └── helpers.ts
├── data/                      # Static data and mock files
│   ├── mockRegions.json
│   ├── waRegions.geojson
│   └── emergencyRatings.json
└── styles/                    # Additional styling
    ├── components.css
    └── map.css
```

### 2.2 Component Architecture

#### 2.2.1 Component Hierarchy
```
App
├── Layout
│   ├── Header
│   │   ├── Navigation
│   │   ├── EmergencyContact
│   │   └── SearchBar
│   └── Footer
└── Dashboard
    ├── DashboardHeader
    │   ├── DateSelector
    │   └── FilterControls
    ├── DashboardContent
    │   ├── MapContainer
    │   │   ├── MapboxMap
    │   │   ├── RegionLayer
    │   │   ├── MapControls
    │   │   └── RegionPopup
    │   └── EmergencyList
    │       ├── ListFilters
    │       ├── ListItem
    │       └── ListPagination
    └── DashboardSidebar (optional)
```

## 3. Data Models and Types

### 3.1 Core Type Definitions

```typescript
// types/emergency.ts
export type EmergencyType = 'bushfire' | 'flood';

export type BushfireRating = 
  | 'no-rating' 
  | 'low-moderate' 
  | 'high' 
  | 'very-high' 
  | 'severe' 
  | 'extreme' 
  | 'catastrophic';

export type FloodRating = 
  | 'no-warning' 
  | 'minor' 
  | 'moderate' 
  | 'major';

export interface EmergencyRating {
  level: BushfireRating | FloodRating;
  description: string;
  color: string;
  severity: number; // 0-6 for sorting
  recommendations: string[];
  lastUpdated: string;
}

export interface EmergencyData {
  bushfire: EmergencyRating;
  flood: EmergencyRating;
}

export interface EmergencyForecast {
  date: string;
  emergencyData: EmergencyData;
  confidence: 'low' | 'medium' | 'high';
}

// types/geography.ts
export interface Region {
  id: string;
  name: string;
  slug: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  center: [number, number]; // [longitude, latitude]
  bounds: [[number, number], [number, number]]; // [[sw], [ne]]
  localGovernmentAreas: string[];
  population?: number;
  area?: number; // square kilometers
}

export interface RegionWithEmergency extends Region {
  emergencyData: EmergencyData;
  forecasts: EmergencyForecast[];
  lastUpdated: string;
}

// types/api.ts
export interface QGISResponse {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: {
      region_id: string;
      region_name: string;
      bushfire_rating: string;
      flood_rating: string;
      last_updated: string;
      local_govt_areas: string;
      [key: string]: any;
    };
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
}
```

### 3.2 State Management Schema

```typescript
// store/emergencyStore.ts
export interface EmergencyStore {
  // Data
  regions: RegionWithEmergency[];
  selectedDate: string;
  lastUpdated: string | null;
  
  // UI State
  selectedRegion: string | null;
  activeEmergencyTypes: EmergencyType[];
  
  // Loading States
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  
  // Actions
  fetchEmergencyData: (date?: string) => Promise<void>;
  setSelectedRegion: (regionId: string | null) => void;
  setSelectedDate: (date: string) => void;
  toggleEmergencyType: (type: EmergencyType) => void;
  refreshData: () => Promise<void>;
}

// store/mapStore.ts
export interface MapStore {
  // Map State
  viewport: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  mapStyle: 'streets' | 'satellite' | 'terrain';
  
  // Interaction State
  hoveredRegion: string | null;
  popupInfo: {
    regionId: string;
    position: [number, number];
  } | null;
  
  // Actions
  setViewport: (viewport: Partial<MapStore['viewport']>) => void;
  setMapStyle: (style: MapStore['mapStyle']) => void;
  setHoveredRegion: (regionId: string | null) => void;
  setPopupInfo: (info: MapStore['popupInfo']) => void;
  flyToRegion: (region: Region) => void;
}
```

## 4. Implementation Guidelines

### 4.1 Component Development

#### 4.1.1 Component Structure Template
```typescript
// components/example/ExampleComponent.tsx
import React from 'react';
import { cn } from '@/utils/helpers';

interface ExampleComponentProps {
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
  children?: React.ReactNode;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  return (
    <div 
      className={cn(
        'base-styles',
        {
          'variant-default': variant === 'default',
          'variant-primary': variant === 'primary',
          'variant-secondary': variant === 'secondary',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

ExampleComponent.displayName = 'ExampleComponent';
```

#### 4.1.2 Custom Hook Pattern
```typescript
// hooks/useEmergencyData.ts
import { useQuery } from '@tanstack/react-query';
import { useEmergencyStore } from '@/store';
import { emergencyApi } from '@/services/api';

export const useEmergencyData = (date?: string) => {
  const { selectedDate } = useEmergencyStore();
  const queryDate = date || selectedDate;

  return useQuery({
    queryKey: ['emergency-data', queryDate],
    queryFn: () => emergencyApi.getEmergencyData(queryDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

### 4.2 API Integration

#### 4.2.1 QGIS Data Service
```typescript
// services/api/qgis.ts
import { z } from 'zod';
import type { QGISResponse, RegionWithEmergency } from '@/types';

const QGISFeatureSchema = z.object({
  type: z.literal('Feature'),
  properties: z.object({
    region_id: z.string(),
    region_name: z.string(),
    bushfire_rating: z.string(),
    flood_rating: z.string(),
    last_updated: z.string(),
    local_govt_areas: z.string(),
  }),
  geometry: z.object({
    type: z.enum(['Polygon', 'MultiPolygon']),
    coordinates: z.array(z.array(z.array(z.number()))),
  }),
});

export class QGISService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetchEmergencyData(date?: string): Promise<RegionWithEmergency[]> {
    try {
      const url = new URL(`${this.baseUrl}/emergency-data`);
      if (date) url.searchParams.set('date', date);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`QGIS API error: ${response.status}`);
      }

      const data: QGISResponse = await response.json();
      
      // Validate data structure
      const validatedFeatures = data.features.map(feature => 
        QGISFeatureSchema.parse(feature)
      );

      // Transform QGIS data to application format
      return this.transformQGISData(validatedFeatures);
    } catch (error) {
      console.error('Failed to fetch QGIS data:', error);
      throw error;
    }
  }

  private transformQGISData(features: any[]): RegionWithEmergency[] {
    return features.map(feature => ({
      id: feature.properties.region_id,
      name: feature.properties.region_name,
      slug: this.slugify(feature.properties.region_name),
      geometry: feature.geometry,
      center: this.calculateCenter(feature.geometry),
      bounds: this.calculateBounds(feature.geometry),
      localGovernmentAreas: feature.properties.local_govt_areas.split(','),
      emergencyData: {
        bushfire: this.mapBushfireRating(feature.properties.bushfire_rating),
        flood: this.mapFloodRating(feature.properties.flood_rating),
      },
      forecasts: [], // Populate from separate endpoint if available
      lastUpdated: feature.properties.last_updated,
    }));
  }

  private mapBushfireRating(rating: string): EmergencyRating {
    // Implementation for mapping QGIS rating to application format
    // ...
  }

  private calculateCenter(geometry: GeoJSON.Geometry): [number, number] {
    // Implementation for calculating polygon center
    // ...
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
}
```

#### 4.2.2 Mock Data Service
```typescript
// services/data/mockData.ts
import type { RegionWithEmergency, EmergencyRating } from '@/types';

export const generateMockEmergencyData = (): RegionWithEmergency[] => {
  const waRegions = [
    'Perth Metro',
    'Pilbara',
    'Kimberley',
    'Goldfields-Esperance',
    'Great Southern',
    'Mid West',
    'South West',
    'Wheatbelt',
    'Gascoyne',
    'Peel',
  ];

  return waRegions.map((regionName, index) => ({
    id: `wa-region-${index + 1}`,
    name: regionName,
    slug: regionName.toLowerCase().replace(/\s+/g, '-'),
    geometry: generateMockGeometry(),
    center: generateMockCenter(),
    bounds: generateMockBounds(),
    localGovernmentAreas: [`${regionName} City`, `${regionName} Shire`],
    emergencyData: {
      bushfire: generateRandomBushfireRating(),
      flood: generateRandomFloodRating(),
    },
    forecasts: generateMockForecasts(),
    lastUpdated: new Date().toISOString(),
  }));
};

const generateRandomBushfireRating = (): EmergencyRating => {
  const ratings = ['no-rating', 'low-moderate', 'high', 'very-high', 'severe'];
  const level = ratings[Math.floor(Math.random() * ratings.length)];
  
  return {
    level: level as any,
    description: `Bushfire danger rating: ${level.replace('-', ' ')}`,
    color: getBushfireColor(level as any),
    severity: getBushfireSeverity(level as any),
    recommendations: getBushfireRecommendations(level as any),
    lastUpdated: new Date().toISOString(),
  };
};

// Additional helper functions...
```

### 4.3 Map Implementation

#### 4.3.1 Mapbox Integration
```typescript
// components/maps/MapContainer.tsx
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore, useEmergencyStore } from '@/store';
import { MapControls } from './MapControls';
import { RegionPopup } from './RegionPopup';

export const MapContainer: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  const { viewport, setViewport, popupInfo, setPopupInfo } = useMapStore();
  const { regions, selectedRegion } = useEmergencyStore();

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom,
      accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
    });

    // Add region data source and layers
    map.current.on('load', () => {
      addRegionLayers();
      setupMapInteractions();
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  const addRegionLayers = () => {
    if (!map.current) return;

    // Add GeoJSON source
    map.current.addSource('regions', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: regions.map(region => ({
          type: 'Feature',
          properties: {
            id: region.id,
            name: region.name,
            bushfireRating: region.emergencyData.bushfire.level,
            floodRating: region.emergencyData.flood.level,
          },
          geometry: region.geometry,
        })),
      },
    });

    // Add fill layer
    map.current.addLayer({
      id: 'regions-fill',
      type: 'fill',
      source: 'regions',
      paint: {
        'fill-color': [
          'case',
          ['==', ['get', 'bushfireRating'], 'extreme'],
          '#dc2626',
          ['==', ['get', 'bushfireRating'], 'very-high'],
          '#ea580c',
          ['==', ['get', 'bushfireRating'], 'high'],
          '#f59e0b',
          ['==', ['get', 'bushfireRating'], 'low-moderate'],
          '#10b981',
          '#9ca3af', // default
        ],
        'fill-opacity': [
          'case',
          ['==', ['get', 'id'], selectedRegion || ''],
          0.8,
          0.6,
        ],
      },
    });

    // Add border layer
    map.current.addLayer({
      id: 'regions-border',
      type: 'line',
      source: 'regions',
      paint: {
        'line-color': '#374151',
        'line-width': [
          'case',
          ['==', ['get', 'id'], selectedRegion || ''],
          3,
          1,
        ],
      },
    });
  };

  const setupMapInteractions = () => {
    if (!map.current) return;

    // Click handler
    map.current.on('click', 'regions-fill', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const regionId = feature.properties?.id;
        
        if (regionId) {
          setPopupInfo({
            regionId,
            position: [e.lngLat.lng, e.lngLat.lat],
          });
        }
      }
    });

    // Hover effects
    map.current.on('mouseenter', 'regions-fill', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'regions-fill', () => {
      map.current!.getCanvas().style.cursor = '';
    });
  };

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="w-full h-full" 
      />
      <MapControls />
      {popupInfo && <RegionPopup />}
    </div>
  );
};
```

## 5. Development Workflow

### 5.1 Environment Setup

#### 5.1.1 Environment Variables
```env
# .env.local
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_QGIS_API_URL=http://localhost:8000/api
VITE_ENVIRONMENT=development
VITE_MOCK_DATA=true
```

#### 5.1.2 Development Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "mock-server": "json-server --watch src/data/mockApi.json --port 3001"
  }
}
```

### 5.2 Development Process

#### 5.2.1 Feature Development Workflow
1. **Setup**: Create feature branch from `main`
2. **Design**: Update type definitions if needed
3. **Implementation**: Build components with tests
4. **Integration**: Connect to stores and APIs
5. **Testing**: Unit tests, integration tests, E2E tests
6. **Review**: Code review and QA testing
7. **Deployment**: Merge to main and deploy

#### 5.2.2 Testing Strategy
```typescript
// tests/components/EmergencyList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmergencyList } from '@/components/dashboard/EmergencyList';
import { mockRegions } from '@/tests/mocks';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('EmergencyList', () => {
  it('displays regions with correct emergency ratings', () => {
    render(<EmergencyList regions={mockRegions} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Perth Metro')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('filters regions by emergency type', async () => {
    render(<EmergencyList regions={mockRegions} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByText('Bushfire Only'));
    
    // Verify filtering logic
    expect(screen.queryByText('No Flood Warning')).not.toBeInTheDocument();
  });
});
```

### 5.3 Performance Optimization

#### 5.3.1 Code Splitting
```typescript
// App.tsx
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const EmergencyDetails = lazy(() => import('@/pages/EmergencyDetails'));

export const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/details/:regionId" element={<EmergencyDetails />} />
      </Routes>
    </Suspense>
  );
};
```

#### 5.3.2 Map Performance
```typescript
// utils/mapOptimization.ts
export const optimizeGeoJSON = (data: GeoJSON.FeatureCollection) => {
  // Simplify geometries for better performance
  return {
    ...data,
    features: data.features.map(feature => ({
      ...feature,
      geometry: simplifyGeometry(feature.geometry),
    })),
  };
};

export const createRegionClusters = (regions: Region[], zoom: number) => {
  if (zoom < 6) {
    // Group nearby regions for better performance at low zoom
    return clusterRegions(regions);
  }
  return regions;
};
```

## 6. Deployment and Production

### 6.1 Build Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          maps: ['mapbox-gl'],
          charts: ['recharts'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

### 6.2 Production Checklist
- [ ] Environment variables configured
- [ ] Mapbox token setup
- [ ] QGIS API endpoints configured
- [ ] Error tracking (Sentry) implemented
- [ ] Analytics (Google Analytics) setup
- [ ] Performance monitoring enabled
- [ ] Security headers configured
- [ ] CDN setup for static assets
- [ ] Database backup strategy
- [ ] Monitoring and alerting configured

This development documentation provides a comprehensive guide for implementing the WA Emergency Dashboard system. It should be updated as the project evolves and new requirements emerge. 