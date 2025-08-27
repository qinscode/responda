import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import type { GeoJSONSource } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { parseWeatherStationsFromJSON, getWeatherDataForStationWithCoords } from '@/data/weatherStationParser';
import { getRiverStations, getRiverDataForStation } from '@/data/riverData';
import { RiverStageChart } from '@/components/charts/RiverStageChart';
import type { WeatherStation, WeatherData, RiverStation, RiverData, Station } from '@/types/weather';

interface MapContainerProps {
  selectedStation?: Station;
  onStationSelect?: (station: Station) => void;
  stationTypeFilter?: 'all' | 'weather' | 'river';
}

const MAPBOX_STYLES: Record<'streets' | 'satellite' | 'terrain', string> = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  terrain: 'mapbox://styles/mapbox/outdoors-v12',
};

export const MapContainer = ({ selectedStation, onStationSelect, stationTypeFilter = 'all' }: MapContainerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [isReady, setIsReady] = useState(false);
  const [weatherStations, setWeatherStations] = useState<Array<WeatherStation>>([]);
  const [riverStations, setRiverStations] = useState<Array<RiverStation>>([]);

  // Combine stations into unified format
  const allStations = useMemo((): Array<Station> => {
    const weatherWithType = weatherStations.map(station => ({ ...station, type: 'weather' as const }));
    const riverWithType = riverStations.map(station => ({ ...station, type: 'river' as const }));
    return [...weatherWithType, ...riverWithType];
  }, [weatherStations, riverStations]);

  // Filter stations based on type filter
  const filteredStations = useMemo(() => {
    if (stationTypeFilter === 'all') return allStations;
    return allStations.filter(station => station.type === stationTypeFilter);
  }, [allStations, stationTypeFilter]);

  // Load stations on component mount
  useEffect(() => {
    const loadData = async () => {
      const weatherData = await parseWeatherStationsFromJSON();
      setWeatherStations(weatherData);
      
      const riverData = await getRiverStations();
      setRiverStations(riverData);
    };
    void loadData();
  }, []);

  // Prepare GeoJSON from filtered stations
  const featureCollection = useMemo(() => {
    const features = filteredStations.map((station) => {
      // Color coding based on station type and other properties
      let color = '#3b82f6'; // Default blue
      
      if (station.type === 'river') {
        color = '#10b981'; // Green for river stations
      } else if (station.type === 'weather') {
        if ((station.height || 0) > 300) {
          color = '#8b5cf6'; // Purple for high elevation
        } else if ((station.height || 0) > 100) {
          color = '#3b82f6'; // Blue for medium elevation
        } else if (station.latitude < -30) {
          color = '#f59e0b'; // Orange for southern stations
        } else if (station.latitude > -20) {
          color = '#ef4444'; // Red for northern stations
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
          height: station.height,
          openDate: station.openDate || 'Unknown',
          closeDate: station.closeDate || 'Active',
          district: station.district,
          type: station.type,
          color,
          latitude: station.latitude,
          longitude: station.longitude,
          // Add river-specific properties if applicable
          ...(station.type === 'river' && {
            riverName: (station as RiverStation).riverName,
            catchmentArea: (station as RiverStation).catchmentArea,
          })
        },
        geometry: {
          type: 'Point',
          coordinates: [station.longitude, station.latitude],
        },
      };
    });
    return { type: 'FeatureCollection' as const, features };
  }, [filteredStations]);

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

      // Add weather station markers (circles)
      map.addLayer({
        id: 'weather-stations',
        type: 'circle',
        source: 'weather-stations',
        filter: ['==', ['get', 'type'], 'weather'],
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

      // Add river station markers (triangles using circle with custom styling)
      map.addLayer({
        id: 'river-stations',
        type: 'circle',
        source: 'weather-stations',
        filter: ['==', ['get', 'type'], 'river'],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, 4,
            8, 7,
            12, 10
          ],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      // Add triangle shape overlay for river stations
      map.addLayer({
        id: 'river-stations-triangles',
        type: 'symbol',
        source: 'weather-stations',
        filter: ['==', ['get', 'type'], 'river'],
        layout: {
          'text-field': '▲',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, 10,
            8, 16,
            12, 22
          ],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': ['get', 'color'],
          'text-opacity': 0.9,
          'text-halo-color': '#ffffff',
          'text-halo-width': 1,
        },
      });

      // Add selected weather station layer (highlighted circles)
      map.addLayer({
        id: 'weather-stations-selected',
        type: 'circle',
        source: 'weather-stations',
        filter: ['all', ['==', ['get', 'type'], 'weather'], ['==', ['get', 'id'], '']],
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
      });

      // Add selected river station layer (highlighted triangles)
      map.addLayer({
        id: 'river-stations-selected',
        type: 'circle',
        source: 'weather-stations',
        filter: ['all', ['==', ['get', 'type'], 'river'], ['==', ['get', 'id'], '']],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, 7,
            8, 11,
            12, 15
          ],
          'circle-color': '#3b82f6',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 1,
        },
      });

      // Add selected river station triangle overlay
      map.addLayer({
        id: 'river-stations-selected-triangles',
        type: 'symbol',
        source: 'weather-stations',
        filter: ['all', ['==', ['get', 'type'], 'river'], ['==', ['get', 'id'], '']],
        layout: {
          'text-field': '▲',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, 14,
            8, 22,
            12, 30
          ],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': '#3b82f6',
          'text-opacity': 1,
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
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
        const features = map.queryRenderedFeatures(e.point, { layers: ['weather-stations', 'river-stations', 'river-stations-triangles'] });
        const f = features[0];
        if (!f) return;
        
        const props = f.properties as any;
        const station = filteredStations.find((s) => s.id === props.id);
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

          // River data display
          let riverInfo = '';
          if (riverData && props.type === 'river') {
            riverInfo = `
              <div style="margin-top: 4px; padding: 12px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 6px; border: 1px solid #d1fae5; border-top: 2px solid #a7f3d0;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #d1fae5;">
                  <h4 style="font-weight: 600; font-size: 12px; color: #1e293b; margin: 0;">River Data</h4>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-size: 14px; line-height: 1; display: inline-block; width: 14px; text-align: center;">🌊</span>
                    <span style="font-size: 10px; color: #064e3b; font-weight: 500;">${riverData.quality}</span>
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 6px;">
                  <div style="text-align: center; padding: 8px 4px; background: white; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 52px; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 12px; line-height: 1; margin-bottom: 3px; height: 12px; display: flex; align-items: center; justify-content: center;">📏</div>
                    <div style="font-size: 8px; color: #064e3b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; line-height: 1;">LEVEL</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 11px; line-height: 1;">${riverData.waterLevel.toFixed(1)}m</div>
                  </div>
                  <div style="text-align: center; padding: 8px 4px; background: white; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 52px; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 12px; line-height: 1; margin-bottom: 3px; height: 12px; display: flex; align-items: center; justify-content: center;">🌊</div>
                    <div style="font-size: 8px; color: #064e3b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; line-height: 1;">FLOW</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 10px; line-height: 1;">${riverData.flow.toFixed(1)} m³/s</div>
                  </div>
                  <div style="text-align: center; padding: 8px 4px; background: white; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 52px; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 12px; line-height: 1; margin-bottom: 3px; height: 12px; display: flex; align-items: center; justify-content: center;">🌡️</div>
                    <div style="font-size: 8px; color: #064e3b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; line-height: 1;">TEMP</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 11px; line-height: 1;">${riverData.temperature.toFixed(1)}°C</div>
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
                  <div style="text-align: center; padding: 8px 4px; background: white; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 52px; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 12px; line-height: 1; margin-bottom: 3px; height: 12px; display: flex; align-items: center; justify-content: center;">🌫️</div>
                    <div style="font-size: 8px; color: #064e3b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; line-height: 1;">TURBIDITY</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 10px; line-height: 1;">${riverData.turbidity.toFixed(1)} NTU</div>
                  </div>
                  <div style="text-align: center; padding: 8px 4px; background: white; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 52px; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 12px; line-height: 1; margin-bottom: 3px; height: 12px; display: flex; align-items: center; justify-content: center;">⚗️</div>
                    <div style="font-size: 8px; color: #064e3b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; line-height: 1;">PH</div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 11px; line-height: 1;">${riverData.ph.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            `;
          }
          
          const statusColor = props.closeDate === 'Active' ? '#10b981' : '#ef4444';
          const statusDot = props.closeDate === 'Active' ? '●' : '●';
          
          // Format date to be more readable
          const formatDate = (dateString: string | undefined) => {
            if (!dateString || dateString === 'Unknown') return 'Unknown';
            const parts = dateString.split('/');
            if (parts.length === 2) {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const monthIndex = parseInt(parts[0] || '1', 10) - 1;
              const year = parts[1] || '';
              return `${months[monthIndex] || 'Jan'} ${year}`;
            }
            return dateString;
          };
          
          return `
            <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; width: 100%; background: transparent; overflow: visible;">
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
                  ${props.type === 'river' && props.riverName ? `<br/>🌊 ${props.riverName} • Catchment: ${props.catchmentArea?.toLocaleString()} km²` : ''}
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
                ${riverInfo}
              </div>
            </div>
          `;
        };

        // Show initial popup with custom styling
        popupRef.current = new mapboxgl.Popup({ 
          closeButton: false,
          className: 'custom-popup',
          maxWidth: '820px',
          anchor: 'bottom',
          offset: [0, -10]
        })
          .setLngLat([props.longitude, props.latitude])
          .setHTML(createPopupContent())
          .addTo(map);

        // Fetch data based on station type and update popup
        if (props.type === 'weather') {
          void getWeatherDataForStationWithCoords(props.id, props.latitude, props.longitude).then(weatherData => {
            if (popupRef.current && weatherData) {
              popupRef.current.setHTML(createPopupContent(weatherData));
            }
          });
        } else if (props.type === 'river') {
          void getRiverDataForStation(props.id).then(riverData => {
            if (popupRef.current && riverData) {
              // Create a container for the React component
              const popupContainer = document.createElement('div');
              const siteNumber = props.id.replace('river-', '');
              
              // Create enhanced content with side-by-side layout
              const basicContent = createPopupContent(undefined, riverData);
              
              popupContainer.innerHTML = `
                <div style="position: relative; display: flex; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow: hidden; width: 800px; min-height: 350px;">
                  <button onclick="this.closest('.mapboxgl-popup').remove()" 
                          style="position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; 
                                 background: rgba(0,0,0,0.1); border: none; border-radius: 50%; 
                                 display: flex; align-items: center; justify-content: center; 
                                 cursor: pointer; z-index: 10; color: #64748b; font-size: 14px; 
                                 transition: all 0.2s ease;">×</button>
                  
                  <!-- Left side: Station info -->
                  <div style="flex: 0 0 360px; padding: 0;">
                    ${basicContent}
                  </div>
                  
                  <!-- Right side: Chart -->
                  <div style="flex: 1; background: #f8fafc; border-left: 1px solid #e2e8f0; padding: 16px;">
                    <div id="river-chart-${siteNumber}" style="width: 100%; height: 300px;"></div>
                  </div>
                </div>
              `;
              
              popupRef.current.setDOMContent(popupContainer);
              
              // Render the chart component
              const chartContainer = document.getElementById(`river-chart-${siteNumber}`);
              if (chartContainer) {
                const root = createRoot(chartContainer);
                root.render(<RiverStageChart siteNumber={siteNumber} stationName={props.name} />);
              }
            }
          });
        }
      };

      // Add click handlers for all station layers
      map.on('click', 'weather-stations', handleClick);
      map.on('click', 'river-stations', handleClick);
      map.on('click', 'river-stations-triangles', handleClick);

      // Hover effects for all station layers
      map.on('mouseenter', 'weather-stations', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseenter', 'river-stations', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseenter', 'river-stations-triangles', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'weather-stations', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseleave', 'river-stations', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseleave', 'river-stations-triangles', () => {
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
    
    // Update the filter for the selected station layers
    const selectedId = selectedStation?.id || '';
    
    // Update weather station selected layer
    map.setFilter('weather-stations-selected', [
      'all', 
      ['==', ['get', 'type'], 'weather'], 
      ['==', ['get', 'id'], selectedId]
    ]);
    
    // Update river station selected layer
    map.setFilter('river-stations-selected', [
      'all', 
      ['==', ['get', 'type'], 'river'], 
      ['==', ['get', 'id'], selectedId]
    ]);
    
    // Update river station selected triangle overlay
    map.setFilter('river-stations-selected-triangles', [
      'all', 
      ['==', ['get', 'type'], 'river'], 
      ['==', ['get', 'id'], selectedId]
    ]);
    
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
      {filteredStations.length > 0 && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md shadow-sm text-sm">
          <span className="font-medium">{filteredStations.length}</span> {stationTypeFilter === 'all' ? 'monitoring stations' : `${stationTypeFilter} stations`}
        </div>
      )}
    </div>
  );
}; 