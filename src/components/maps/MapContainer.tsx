import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { GeoJSONSource } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { getAllMockRegions } from '@/data/mockEmergencyData';
import type { RegionWithEmergency } from '@/types/emergency';
import { BUSHFIRE_RATINGS, FLOOD_RATINGS } from '@/types/emergency';

interface MapContainerProps {
  selectedRegion?: RegionWithEmergency;
  onRegionSelect?: (region: RegionWithEmergency) => void;
}

const MAPBOX_STYLES: Record<'streets' | 'satellite' | 'terrain', string> = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  terrain: 'mapbox://styles/mapbox/outdoors-v12',
};

export const MapContainer = ({  onRegionSelect }: MapContainerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [isReady, setIsReady] = useState(false);

  const regions = getAllMockRegions();

  // Prepare GeoJSON from mock regions
  const featureCollection = useMemo(() => {
    const features = regions.map((r) => {
      const highest = r.emergencyData.bushfire.severity >= r.emergencyData.flood.severity
        ? r.emergencyData.bushfire
        : r.emergencyData.flood;
      const color = r.emergencyData.bushfire.severity >= r.emergencyData.flood.severity
        ? BUSHFIRE_RATINGS[r.emergencyData.bushfire.level as keyof typeof BUSHFIRE_RATINGS].color
        : FLOOD_RATINGS[r.emergencyData.flood.level as keyof typeof FLOOD_RATINGS].color;
      const center = r.center ?? [120.0, -26.0];
      return {
        type: 'Feature' as const,
        id: r.id,
        properties: {
          id: r.id,
          name: r.name,
          highestLevel: highest.level,
          highestDesc: highest.description,
          severity: highest.severity,
          bushfireLevel: r.emergencyData.bushfire.level,
          floodLevel: r.emergencyData.flood.level,
          color,
          centerLon: center[0],
          centerLat: center[1],
        },
        geometry: r.geometry ?? {
          type: 'Point',
          coordinates: center,
        },
      };
    });
    return { type: 'FeatureCollection' as const, features };
  }, [regions]);

  // Init map
  useEffect(() => {
    const token = import.meta.env['VITE_MAPBOX_TOKEN'] as string | undefined;
    if (!containerRef.current) return;

    if (!token) {
      // No token, skip initializing mapbox
      setIsReady(false);
      return;
    }

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLES[mapStyle],
      center: [121.5, -25.5], // WA rough center
      zoom: 4.2,
      attributionControl: true,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

    map.on('load', () => {
      // Add source
      if (map.getSource('regions')) map.removeSource('regions');
      map.addSource('regions', {
        type: 'geojson',
        data: featureCollection as any,
      });

      // Add fill layer if polygon
      map.addLayer({
        id: 'regions-fill',
        type: 'fill',
        source: 'regions',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.35,
        },
        filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
      });

      // Outline
      map.addLayer({
        id: 'regions-outline',
        type: 'line',
        source: 'regions',
        paint: {
          'line-color': '#334155',
          'line-width': 1.2,
          'line-opacity': 0.5,
        },
        filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
      });

      // Add center markers for all regions
      map.addLayer({
        id: 'regions-centers',
        type: 'circle',
        source: 'regions',
        paint: {
          'circle-radius': 4,
          'circle-color': '#000',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
        filter: ['==', ['geometry-type'], 'Point'],
      });

      // Click handler (fill and centers)
      const handleClick = (e: mapboxgl.MapMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['regions-fill', 'regions-centers'] });
        const f = features[0];
        if (!f) return;
        const id = (f.properties as any)?.id as string | undefined;
        if (!id) return;
        const region = regions.find((r) => r.id === id);
        if (region && onRegionSelect) onRegionSelect(region);

        // Popup
        if (popupRef.current) popupRef.current.remove();
        const props = f.properties as any;
        const html = `
          <div style="font-family: ui-sans-serif, system-ui; font-size:12px; min-width:220px;">
            <div style="font-weight:600; margin-bottom:4px;">${props.name}</div>
            <div style="margin-bottom:6px;">Danger rating: <b>${props.highestLevel}</b></div>
            <div style="margin-bottom:6px;">${props.highestDesc}</div>
            <div style="display:flex; gap:8px;">
              <span style="background:${props.color}; width:10px; height:10px; border-radius:9999px; margin-top:5px;"></span>
              <span>Severity: ${props.severity}/10</span>
            </div>
          </div>
        `;
        popupRef.current = new mapboxgl.Popup({ closeButton: true })
          .setLngLat([props.centerLon, props.centerLat])
          .setHTML(html)
          .addTo(map);
      };

      map.on('click', 'regions-fill', handleClick);
      map.on('click', 'regions-centers', handleClick);

      setIsReady(true);
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapStyle]);

  // Update data when regions change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource('regions');
    if (source) {
      (source as GeoJSONSource).setData(featureCollection as any);
    }
  }, [featureCollection]);

  const tokenMissing = !import.meta.env['VITE_MAPBOX_TOKEN'];

  return (
    <div className="relative w-full h-full">
      {tokenMissing ? (
        <div className="flex items-center justify-center h-[600px] bg-muted/50">
          <div className="text-center">
            <p className="font-medium mb-1">Mapbox token not configured</p>
            <p className="text-sm text-muted-foreground">Set VITE_MAPBOX_TOKEN in your environment to enable the interactive map.</p>
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-full" />
      )}

      {/* Simple style switcher */}
      <div aria-label="Map styles" className="absolute top-3 right-3 space-x-2 z-10" role="toolbar">
        {(['streets', 'satellite', 'terrain'] as const).map((s) => (
          <Button key={s} size="sm" variant={mapStyle === s ? 'default' : 'ghost'} onClick={() => { setMapStyle(s); }}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}; 