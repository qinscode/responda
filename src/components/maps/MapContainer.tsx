import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { GeoJSONSource } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { parseWeatherStationsFromCSV, getWeatherDataForStation } from '@/data/weatherStationParser';
import type { WeatherStation, WeatherData } from '@/types/weather';

interface MapContainerProps {
  selectedStation?: WeatherStation;
  onStationSelect?: (station: WeatherStation) => void;
}

const MAPBOX_STYLES: Record<'streets' | 'satellite' | 'terrain', string> = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  terrain: 'mapbox://styles/mapbox/outdoors-v12',
};

export const MapContainer = ({ selectedStation, onStationSelect }: MapContainerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [isReady, setIsReady] = useState(false);
  const [stations, setStations] = useState<Array<WeatherStation>>([]);

  // Load weather stations on component mount (Western Australia only)
  useEffect(() => {
    parseWeatherStationsFromCSV().then(setStations);
  }, []);

  // Prepare GeoJSON from weather stations
  const featureCollection = useMemo(() => {
    const features = stations.map((station) => {
      // Color coding based on elevation and location for variety
      let color = '#3b82f6'; // Default blue
      
      if (station.height > 300) {
        color = '#8b5cf6'; // Purple for high elevation
      } else if (station.height > 100) {
        color = '#10b981'; // Green for medium elevation
      } else if (station.latitude < -30) {
        color = '#f59e0b'; // Orange for southern stations
      } else if (station.latitude > -20) {
        color = '#ef4444'; // Red for northern stations
      }
      
      return {
        type: 'Feature' as const,
        id: station.id,
        properties: {
          id: station.id,
          stationNumber: station.stationNumber,
          name: station.name,
          state: station.state,
          height: station.height,
          openDate: station.openDate || 'Unknown',
          closeDate: station.closeDate || 'Active',
          district: station.district,
          color,
          latitude: station.latitude,
          longitude: station.longitude,
        },
        geometry: {
          type: 'Point',
          coordinates: [station.longitude, station.latitude],
        },
      };
    });
    return { type: 'FeatureCollection' as const, features };
  }, [stations]);

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
      center: [121.5, -25.5], // Western Australia center
      zoom: 5.5,
      attributionControl: true,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

    map.on('load', () => {
      // Add source
      if (map.getSource('weather-stations')) map.removeSource('weather-stations');
      map.addSource('weather-stations', {
        type: 'geojson',
        data: featureCollection as any,
      });

      // Add station markers
      map.addLayer({
        id: 'weather-stations',
        type: 'circle',
        source: 'weather-stations',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, 3,
            8, 6,
            12, 8
          ],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8,
        },
      });

      // Add selected station layer (highlighted)
      map.addLayer({
        id: 'weather-stations-selected',
        type: 'circle',
        source: 'weather-stations',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, 6,
            8, 10,
            12, 14
          ],
          'circle-color': '#3b82f6',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 1,
        },
        filter: ['==', ['get', 'id'], '']
      });

      // Add station labels for higher zoom levels
      map.addLayer({
        id: 'weather-stations-labels',
        type: 'symbol',
        source: 'weather-stations',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': 10,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1,
        },
        minzoom: 7,
      });

      // Click handler for stations
      const handleClick = (e: mapboxgl.MapMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['weather-stations'] });
        const f = features[0];
        if (!f) return;
        
        const props = f.properties as any;
        const station = stations.find((s) => s.id === props.id);
        if (station && onStationSelect) onStationSelect(station);

        // Popup with weather data
        if (popupRef.current) popupRef.current.remove();
        
        // Create popup content
        const createPopupContent = (weatherData?: WeatherData) => {
          let weatherInfo = '';
          if (weatherData) {
            weatherInfo = `
              <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
                <div style="font-weight:600; margin-bottom:4px; color: #374151;">Current Weather</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
                  <div><strong>Temperature:</strong> ${weatherData.temperature}°C</div>
                  <div><strong>Humidity:</strong> ${weatherData.humidity}%</div>
                  <div><strong>Pressure:</strong> ${weatherData.pressure} hPa</div>
                  <div><strong>Wind:</strong> ${weatherData.windSpeed} km/h ${weatherData.windDirection}</div>
                  <div><strong>Precipitation:</strong> ${weatherData.precipitation} mm</div>
                  <div><strong>Visibility:</strong> ${weatherData.visibility} km</div>
                </div>
                <div style="margin-top: 4px; padding: 2px 6px; background: #f3f4f6; border-radius: 4px; font-size: 10px; text-align: center;">
                  ${weatherData.conditions}
                </div>
              </div>
            `;
          }
          
          return `
            <div style="font-family: ui-sans-serif, system-ui; font-size:12px; min-width:240px;">
              <div style="font-weight:600; margin-bottom:4px; color: ${props.color};">${props.name}</div>
              <div style="margin-bottom:4px;"><strong>Station #:</strong> ${props.stationNumber}</div>
              <div style="margin-bottom:4px;"><strong>State:</strong> ${props.state}</div>
              <div style="margin-bottom:4px;"><strong>Height:</strong> ${props.height}m</div>
              <div style="margin-bottom:4px;"><strong>Location:</strong> ${props.latitude.toFixed(4)}°, ${props.longitude.toFixed(4)}°</div>
              <div style="margin-bottom:4px;"><strong>Open:</strong> ${props.openDate}</div>
              <div style="margin-bottom:4px;"><strong>Status:</strong> ${props.closeDate === 'Active' ? 'Active' : `Closed ${props.closeDate}`}</div>
              <div style="display:flex; gap:8px; margin-top:8px;">
                <span style="background:${props.color}; width:12px; height:12px; border-radius:50%; margin-top:2px;"></span>
                <span style="font-size:11px; color:#666;">District ${props.district}</span>
              </div>
              ${weatherInfo}
            </div>
          `;
        };

        // Show initial popup
        popupRef.current = new mapboxgl.Popup({ closeButton: true })
          .setLngLat([props.longitude, props.latitude])
          .setHTML(createPopupContent())
          .addTo(map);

        // Fetch weather data and update popup
        getWeatherDataForStation(props.id).then(weatherData => {
          if (popupRef.current && weatherData) {
            popupRef.current.setHTML(createPopupContent(weatherData));
          }
        });
      };

      map.on('click', 'weather-stations', handleClick);

      // Hover effects
      map.on('mouseenter', 'weather-stations', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'weather-stations', () => {
        map.getCanvas().style.cursor = '';
      });

      setIsReady(true);
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapStyle]);

  // Update data when stations change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isReady) return;
    const source = map.getSource('weather-stations');
    if (source) {
      (source as GeoJSONSource).setData(featureCollection as any);
    }
  }, [featureCollection, isReady]);

  // Update selected station highlight
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isReady) return;
    
    // Update the filter for the selected station layer
    const selectedId = selectedStation?.id || '';
    map.setFilter('weather-stations-selected', ['==', ['get', 'id'], selectedId]);
    
    // Fly to selected station if one is selected
    if (selectedStation) {
      map.flyTo({
        center: [selectedStation.longitude, selectedStation.latitude],
        zoom: Math.max(map.getZoom(), 8),
        duration: 1000
      });
    }
  }, [selectedStation, isReady]);

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

      {/* Station count display */}
      {stations.length > 0 && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md shadow-sm text-sm">
          <span className="font-medium">{stations.length}</span> weather stations
        </div>
      )}
    </div>
  );
}; 