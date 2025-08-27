import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Eye, 
  Cloud,
  Sun,
  Sunrise,
  Sunset,
  CloudRain,
  CloudSnow,
  Zap,
  Navigation,
  CloudDrizzle,
  Moon,
  Star
} from 'lucide-react';
import type { WeatherData } from '@/types/weather';

interface WeatherDataDisplayProps {
  weatherData: WeatherData;
  stationName: string;
  stationNumber?: string;
  latitude: number;
  longitude: number;
  height?: number;
  isCompact?: boolean;
}

export const WeatherDataDisplay = ({ 
  weatherData, 
  stationName, 
  stationNumber, 
  latitude, 
  longitude, 
  height,
  isCompact = false 
}: WeatherDataDisplayProps) => {
  
  // Weather icon mapping with Lucide icons
  const getWeatherIcon = (conditions: string, main?: string, icon?: string) => {
    if (icon) {
      // Use OpenWeatherMap icon mapping with Lucide icons
      const iconMap: Record<string, React.ComponentType<any>> = {
        '01d': Sun, '01n': Moon, // clear sky
        '02d': Cloud, '02n': Cloud, // few clouds
        '03d': Cloud, '03n': Cloud, // scattered clouds
        '04d': Cloud, '04n': Cloud, // broken clouds
        '09d': CloudDrizzle, '09n': CloudDrizzle, // shower rain
        '10d': CloudRain, '10n': CloudRain, // rain
        '11d': Zap, '11n': Zap, // thunderstorm
        '13d': CloudSnow, '13n': CloudSnow, // snow
        '50d': Cloud, '50n': Cloud, // mist
      };
      const IconComponent = iconMap[icon] || Sun;
      return <IconComponent className="w-8 h-8" />;
    }
    
    // Fallback to conditions-based mapping
    const cond = conditions.toLowerCase();
    if (cond.includes('sunny') || cond.includes('clear')) {
      return <Sun className="w-8 h-8" />;
    }
    if (cond.includes('cloudy') || cond.includes('overcast')) {
      return <Cloud className="w-8 h-8" />;
    }
    if (cond.includes('partly')) {
      return <Cloud className="w-8 h-8" />;
    }
    if (cond.includes('rain') || cond.includes('shower')) {
      return <CloudRain className="w-8 h-8" />;
    }
    if (cond.includes('storm') || cond.includes('thunder')) {
      return <Zap className="w-8 h-8" />;
    }
    if (cond.includes('snow')) {
      return <CloudSnow className="w-8 h-8" />;
    }
    if (cond.includes('fog') || cond.includes('mist')) {
      return <Cloud className="w-8 h-8" />;
    }
    return <Sun className="w-8 h-8" />;
  };

  // Get UV index color and description
  const getUVInfo = (uvIndex?: number) => {
    if (!uvIndex) return { color: '#6b7280', text: 'N/A', level: 'Unknown' };
    if (uvIndex <= 2) return { color: '#10b981', text: uvIndex.toString(), level: 'Low' };
    if (uvIndex <= 5) return { color: '#f59e0b', text: uvIndex.toString(), level: 'Moderate' };
    if (uvIndex <= 7) return { color: '#f97316', text: uvIndex.toString(), level: 'High' };
    if (uvIndex <= 10) return { color: '#ef4444', text: uvIndex.toString(), level: 'Very High' };
    return { color: '#8b5cf6', text: uvIndex.toString(), level: 'Extreme' };
  };

  // Get wind direction arrow
  const getWindDirection = (windDirection: string) => {
    if (windDirection === 'N/A') return <Navigation className="w-4 h-4" />;
    const degrees = parseInt(windDirection.replace('°', ''));
    if (isNaN(degrees)) return <Navigation className="w-4 h-4" />;
    
    // Convert degrees to rotation for Navigation icon
    return <Navigation className="w-4 h-4" style={{ transform: `rotate(${degrees}deg)` }} />;
  };

  const uvInfo = getUVInfo(weatherData.uvIndex);
  const weatherIcon = getWeatherIcon(weatherData.conditions, weatherData.weatherMain, weatherData.weatherIcon);
  const windArrow = getWindDirection(weatherData.windDirection);

  if (isCompact) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900 truncate">{stationName}</h3>
            <div className="text-sm text-gray-600">
              Station #{stationNumber} • {latitude.toFixed(3)}°, {longitude.toFixed(3)}°
              {height && <span> • {height}m</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-blue-600 mb-1">{weatherIcon}</div>
            <div className="text-xs text-gray-500 capitalize">{weatherData.conditions}</div>
          </div>
        </div>

        {/* Main weather metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-center mb-2">
              <Thermometer className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-xs font-medium text-orange-700 uppercase tracking-wide mb-1">Temperature</div>
            <div className="text-xl font-bold text-orange-800">{weatherData.temperature}°C</div>
            {weatherData.feelsLike && (
              <div className="text-xs text-orange-600">Feels {weatherData.feelsLike}°C</div>
            )}
            {(weatherData.tempMin !== undefined && weatherData.tempMax !== undefined) && (
              <div className="text-xs text-orange-500 mt-1">
                {weatherData.tempMin}° / {weatherData.tempMax}°
              </div>
            )}
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-center mb-2">
              <Droplets className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Humidity</div>
            <div className="text-xl font-bold text-blue-800">{weatherData.humidity}%</div>
            {weatherData.dewPoint && (
              <div className="text-xs text-blue-600">Dew {weatherData.dewPoint}°C</div>
            )}
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-center mb-2">
              <Wind className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">Wind</div>
            <div className="text-xl font-bold text-green-800">{weatherData.windSpeed} km/h</div>
            <div className="text-xs text-green-600 flex items-center justify-center gap-1">
              {windArrow} {weatherData.windDirection}
            </div>
          </div>
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between p-3 bg-white bg-opacity-60 rounded-lg border border-gray-200 hover:bg-opacity-80 transition-all">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Pressure</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{weatherData.pressure} hPa</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white bg-opacity-60 rounded-lg border border-gray-200 hover:bg-opacity-80 transition-all">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Visibility</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{weatherData.visibility} km</span>
          </div>
          
          {weatherData.cloudiness !== undefined && (
            <div className="flex items-center justify-between p-3 bg-white bg-opacity-60 rounded-lg border border-gray-200 hover:bg-opacity-80 transition-all">
              <div className="flex items-center space-x-2">
                <Cloud className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Clouds</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{weatherData.cloudiness}%</span>
            </div>
          )}
          
          {weatherData.uvIndex !== undefined && (
            <div className="flex items-center justify-between p-3 bg-white bg-opacity-60 rounded-lg border border-gray-200 hover:bg-opacity-80 transition-all">
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-medium text-gray-700">UV Index</span>
              </div>
              <span className="text-sm font-bold" style={{ color: uvInfo.color }}>
                {uvInfo.text} ({uvInfo.level})
              </span>
            </div>
          )}
          
          {weatherData.precipitation > 0 && (
            <div className="flex items-center justify-between p-3 bg-white bg-opacity-60 rounded-lg border border-gray-200 hover:bg-opacity-80 transition-all">
              <div className="flex items-center space-x-2">
                <CloudRain className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">Rain</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{weatherData.precipitation} mm/h</span>
            </div>
          )}
        </div>

        {/* Sun times */}
        {(weatherData.sunrise || weatherData.sunset) && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 rounded-xl border border-yellow-200 shadow-sm">
            {weatherData.sunrise && (
              <div className="text-center flex-1">
                <div className="w-8 h-8 mx-auto mb-1 flex items-center justify-center bg-yellow-100 rounded-full">
                  <Sunrise className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-yellow-700 text-xs font-medium uppercase tracking-wide">Sunrise</div>
                <div className="text-yellow-800 font-bold text-sm">{weatherData.sunrise}</div>
              </div>
            )}
            {weatherData.sunrise && weatherData.sunset && (
              <div className="w-px h-8 bg-yellow-300 mx-2"></div>
            )}
            {weatherData.sunset && (
              <div className="text-center flex-1">
                <div className="w-8 h-8 mx-auto mb-1 flex items-center justify-center bg-orange-100 rounded-full">
                  <Sunset className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-orange-700 text-xs font-medium uppercase tracking-wide">Sunset</div>
                <div className="text-orange-800 font-bold text-sm">{weatherData.sunset}</div>
              </div>
            )}
          </div>
        )}

        {/* Data source and update time */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-200 pt-3 mt-1">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="font-medium">Live API Data</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">OpenWeatherMap</div>
            <div className="text-gray-400">Updated {weatherData.time}</div>
          </div>
        </div>
      </div>
    );
  }

  // Full version (non-compact) - can be used elsewhere
  return (
    <div className="p-6 space-y-6">
      {/* Similar structure but with more space and detail */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{stationName}</h2>
        <p className="text-gray-600">Current Weather Conditions</p>
      </div>
      {/* ... implement full version if needed */}
    </div>
  );
}; 