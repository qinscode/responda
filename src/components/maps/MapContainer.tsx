import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { GeoJSONSource } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { parseWeatherStationsFromCSV, getWeatherDataForStation } from '@/data/weatherStationParser';
import { mockRiverStations, getRiverDataForStation } from '@/data/mockRiverData';
import type { WeatherStation, WeatherData } from '@/types/weather';
import type { RiverStation, RiverData, StationType } from '@/types/river';

interface MapContainerProps {
  selectedStation?: WeatherStation | RiverStation;
  onStationSelect?: (station: WeatherStation | RiverStation) => void;
  stationType: StationType;
}

const MAPBOX_STYLES: Record<'streets' | 'satellite' | 'terrain', string> = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  terrain: 'mapbox://styles/mapbox/outdoors-v12',
};

export const MapContainer = ({ selectedStation, onStationSelect, stationType }: MapContainerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [isReady, setIsReady] = useState(false);
  const [weatherStations, setWeatherStations] = useState<Array<WeatherStation>>([]);
  const [riverStations, setRiverStations] = useState<Array<RiverStation>>([]);

  // Load stations based on type
  useEffect(() => {
    if (stationType === 'weather') {
      void parseWeatherStationsFromCSV().then(setWeatherStations);
    } else {
      setRiverStations(mockRiverStations);
    }
  }, [stationType]);

  // Get current stations based on type
  const currentStations = stationType === 'weather' ? weatherStations : riverStations;

  // Prepare GeoJSON from stations
  const featureCollection = useMemo(() => {
    const features = currentStations.map((station: WeatherStation | RiverStation) => {
      // Color coding based on type and properties
      let color = '#3b82f6'; // Default blue
      
      if (stationType === 'weather') {
        const weatherStation = station as WeatherStation;
        if (weatherStation.height > 300) {
          color = '#8b5cf6'; // Purple for high elevation
        } else if (weatherStation.height > 100) {
          color = '#10b981'; // Green for medium elevation
        } else if (station.latitude < -30) {
          color = '#f59e0b'; // Orange for southern stations
        } else if (station.latitude > -20) {
          color = '#ef4444'; // Red for northern stations
        }
      } else {
        // River stations - use different color scheme
        const riverStation = station as RiverStation;
        if (riverStation.purpose.includes('Water Quality')) {
          color = '#06b6d4'; // Cyan for water quality
        } else if (riverStation.purpose.includes('Flood Warning')) {
          color = '#f59e0b'; // Orange for flood warning
        } else if (riverStation.purpose.includes('Flow Monitoring')) {
          color = '#3b82f6'; // Blue for flow monitoring
        } else {
          color = '#6366f1'; // Indigo for other purposes
        }
      }
      
      return {
        type: 'Feature' as const,
        id: station.id,
        properties: {
          id: station.id,
          stationNumber: station.stationNumber,
          name: station.name,
          state: station.state,
          height: stationType === 'weather' ? (station as WeatherStation).height : (station as RiverStation).height || 0,
          openDate: station.openDate || 'Unknown',
          closeDate: station.closeDate || 'Active',
          district: station.district,
          color,
          latitude: station.latitude,
          longitude: station.longitude,
          stationType,
          ...(stationType === 'river' && {
            river: (station as RiverStation).river,
            catchment: (station as RiverStation).catchment,
            purpose: (station as RiverStation).purpose,
          }),
        },
        geometry: {
          type: 'Point',
          coordinates: [station.longitude, station.latitude],
        },
      };
    });
    return { type: 'FeatureCollection' as const, features };
  }, [currentStations, stationType]);

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
        const station = currentStations.find((s: WeatherStation | RiverStation) => s.id === props.id);
        if (station && onStationSelect) onStationSelect(station);

        // Popup with weather data
        if (popupRef.current) popupRef.current.remove();
        
        // Create popup content
        const createPopupContent = (weatherData?: WeatherData, riverData?: RiverData) => {
          let weatherInfo = '';
          if (weatherData) {
            // Weather icon mapping
            const getWeatherIcon = (conditions: string) => {
              const cond = conditions.toLowerCase();
              if (cond.includes('sunny') || cond.includes('clear')) return '☀️';
              if (cond.includes('cloudy') || cond.includes('overcast')) return '☁️';
              if (cond.includes('partly')) return '⛅';
              if (cond.includes('rain') || cond.includes('shower')) return '🌧️';
              if (cond.includes('storm') || cond.includes('thunder')) return '⛈️';
              if (cond.includes('snow')) return '❄️';
              if (cond.includes('fog') || cond.includes('mist')) return '🌫️';
              return '🌤️'; // Default
            };

            weatherInfo = `
              <div style="margin-top: 4px; padding: 12px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 6px; border: 1px solid #e2e8f0; border-top: 2px solid #e2e8f0;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;">
                  <h4 style="font-weight: 600; font-size: 12px; color: #1e293b; margin: 0;">Current Weather</h4>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-size: 14px; line-height: 1; display: inline-block; width: 14px; text-align: center;">${getWeatherIcon(weatherData.conditions)}</span>
                    <span style="font-size: 10px; color: #64748b; font-weight: 500;">${weatherData.conditions}</span>
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 6px;">
                  <div style="text-align: center; padding: 8px 4px; background: white; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 52px; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 12px; line-height: 1; margin-bottom: 3px; height: 12px; display: flex; align-items: center; justify-content: center;">🌡️</div>
                    <div style="font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; line-height: 1;">TEMP</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 11px; line-height: 1;">${weatherData.temperature}°C</div>
                  </div>
                  <div style="text-align: center; padding: 8px 4px; background: white; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 52px; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 12px; line-height: 1; margin-bottom: 3px; height: 12px; display: flex; align-items: center; justify-content: center;">💧</div>
                    <div style="font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; line-height: 1;">HUMIDITY</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 11px; line-height: 1;">${weatherData.humidity}%</div>
                  </div>
                  <div style="text-align: center; padding: 8px 4px; background: white; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 52px; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 12px; line-height: 1; margin-bottom: 3px; height: 12px; display: flex; align-items: center; justify-content: center;">💨</div>
                    <div style="font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; line-height: 1;">WIND</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 11px; line-height: 1;">${weatherData.windSpeed} km/h</div>
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
                  <div style="text-align: center; padding: 8px 4px; background: white; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 52px; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 12px; line-height: 1; margin-bottom: 3px; height: 12px; display: flex; align-items: center; justify-content: center;">📊</div>
                    <div style="font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; line-height: 1;">PRESSURE</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 10px; line-height: 1;">${weatherData.pressure} hPa</div>
                  </div>
                  <div style="text-align: center; padding: 8px 4px; background: white; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 52px; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 12px; line-height: 1; margin-bottom: 3px; height: 12px; display: flex; align-items: center; justify-content: center;">🌧️</div>
                    <div style="font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; line-height: 1;">RAIN</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 11px; line-height: 1;">${weatherData.precipitation} mm</div>
                  </div>
                  <div style="text-align: center; padding: 8px 4px; background: white; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 52px; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 12px; line-height: 1; margin-bottom: 3px; height: 12px; display: flex; align-items: center; justify-content: center;">👁️</div>
                    <div style="font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; line-height: 1;">VISIBILITY</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 11px; line-height: 1;">${weatherData.visibility} km</div>
                  </div>
                </div>
              </div>
            `;
          }
          
          const statusColor = props.closeDate === 'Active' ? '#10b981' : '#ef4444';
          const statusDot = props.closeDate === 'Active' ? '●' : '●';
          
          // Format date to be more readable
          const formatDate = (dateStr: string | undefined) => {
            if (!dateStr || dateStr === 'Unknown') return 'Unknown';
            const parts = dateStr.split('/');
            if (parts.length === 2) {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const monthIndex = parseInt(parts[0] || '1', 10) - 1;
              const year = parts[1] || '';
              return `${months[monthIndex] || 'Jan'} ${year}`;
            }
            return dateStr;
          };
          
          return `
            <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 280px; max-width: 300px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow: hidden;">
              <!-- Header Section -->
              <div style="padding: 14px; background: linear-gradient(135deg, ${props.color}08 0%, ${props.color}12 100%); border-bottom: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px;">
                  <div style="display: flex; align-items: baseline; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: ${props.color}; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); margin-top: 2px;"></div>
                    <h3 style="font-weight: 700; font-size: 16px; color: #1e293b; margin: 0; line-height: 1;">${props.name}</h3>
                  </div>
                  <div style="display: flex; align-items: baseline; gap: 4px; font-size: 10px; color: ${statusColor};">
                    <span style="font-size: 8px; line-height: 1;">${statusDot}</span>
                    <span style="font-weight: 500; line-height: 1;">${props.closeDate === 'Active' ? 'Active' : 'Closed'}</span>
                  </div>
                </div>
                <div style="font-size: 11px; color: #64748b; font-weight: 500;">
                  Station #${props.stationNumber} • District ${props.district}
                </div>
              </div>
              
              <!-- Info Section -->
              <div style="padding: 14px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px;">
                  <div style="padding: 8px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; height: 44px; display: flex; flex-direction: column; justify-content: center; text-align: center;">
                    <div style="font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px;">STATE</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 13px;">${props.state}</div>
                  </div>
                  <div style="padding: 8px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; height: 44px; display: flex; flex-direction: column; justify-content: center; text-align: center;">
                    <div style="font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px;">ELEVATION</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 13px;">${props.height}m</div>
                  </div>
                  <div style="padding: 8px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; height: 44px; display: flex; flex-direction: column; justify-content: center; text-align: center;">
                    <div style="font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px;">OPENED</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 11px;">${formatDate(props.openDate || 'Unknown')}</div>
                  </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px;">
                  <div style="padding: 8px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; height: 44px; display: flex; flex-direction: column; justify-content: center; text-align: center;">
                    <div style="font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px;">📍 LATITUDE</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 11px; font-family: monospace;">${props.latitude.toFixed(4)}°</div>
                  </div>
                  <div style="padding: 8px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; height: 44px; display: flex; flex-direction: column; justify-content: center; text-align: center;">
                    <div style="font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px;">📍 LONGITUDE</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 11px; font-family: monospace;">${props.longitude.toFixed(4)}°</div>
                  </div>
                </div>
                
                ${weatherInfo}
              </div>
            </div>
          `;
        };

        // Show initial popup with custom styling
        popupRef.current = new mapboxgl.Popup({ 
          closeButton: false,
          className: 'custom-popup'
        })
          .setLngLat([props.longitude, props.latitude])
          .setHTML(createPopupContent())
          .addTo(map);

        // Fetch data based on station type and update popup
        if (props.stationType === 'weather') {
          void getWeatherDataForStation(props.id).then(weatherData => {
            if (popupRef.current && weatherData) {
              popupRef.current.setHTML(createPopupContent(weatherData));
            }
          });
        } else {
          void getRiverDataForStation(props.id).then(riverData => {
            if (popupRef.current && riverData) {
              popupRef.current.setHTML(createPopupContent(undefined, riverData));
            }
          });
        }
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
      {/* Custom popup styles */}
      <style>{`
        .custom-popup .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          background: transparent !important;
        }
        .custom-popup .mapboxgl-popup-tip {
          display: none !important;
        }

      `}</style>
      
      {tokenMissing ? (
        <div className="flex items-center justify-center h-full bg-muted/50">
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
      {currentStations.length > 0 && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md shadow-sm text-sm">
          <span className="font-medium">{currentStations.length}</span> {stationType === 'weather' ? 'weather' : 'river'} stations
        </div>
      )}
    </div>
  );
}; 