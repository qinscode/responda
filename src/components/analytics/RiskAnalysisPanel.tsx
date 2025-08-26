import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle, 
  Map,
  Network,
  BarChart3,
  Thermometer,
  CloudRain,
  Wind,
  Mountain,
  Droplets,
  Sun,
  Snowflake,
  Users,
  Building2,
  Navigation,
  Calendar,
  MapPin,
  Activity
} from 'lucide-react';
import type { 
  RegionalRiskProfile, 
  CorrelationAnalysis, 
  RiskFactor 
} from '@/types/analytics';

interface RiskAnalysisPanelProps {
  regionalProfiles: Array<RegionalRiskProfile>;
  correlationData: CorrelationAnalysis;
  className?: string;
}

export const RiskAnalysisPanel = ({ 
  regionalProfiles, 
  correlationData, 
  className 
}: RiskAnalysisPanelProps) => {
  const [selectedProfile, setSelectedProfile] = useState<RegionalRiskProfile | null>(
    regionalProfiles[0] || null
  );
  const [activeTab, setActiveTab] = useState<'weather' | 'geographic' | 'seasonal' | 'human'>('weather');

  // Calculate overall statistics
  const overallStats = {
    avgRiskScore: regionalProfiles.reduce((sum, profile) => sum + profile.overallRiskScore, 0) / regionalProfiles.length,
    highRiskRegions: regionalProfiles.filter(profile => profile.overallRiskScore > 70).length,
    lowRiskRegions: regionalProfiles.filter(profile => profile.overallRiskScore < 30).length,
    mostVulnerable: regionalProfiles.length > 0 ? regionalProfiles.reduce((max, profile) => 
      profile.vulnerabilityIndex > max.vulnerabilityIndex ? profile : max, regionalProfiles[0]!
    ) : null
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weather': return Thermometer;
      case 'geographic': return Mountain;
      case 'seasonal': return CloudRain;
      case 'human': return Users;
      default: return BarChart3;
    }
  };

  // Get trend icon and color
  const getTrendInfo = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return { icon: TrendingUp, color: 'text-red-500', bgColor: 'bg-red-50' };
      case 'decreasing':
        return { icon: TrendingDown, color: 'text-green-500', bgColor: 'bg-green-50' };
      default:
        return { icon: Minus, color: 'text-gray-500', bgColor: 'bg-gray-50' };
    }
  };

  // Get risk level color
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Generate enhanced mock data for different categories
  const generateWeatherData = () => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 29 + i);
      return {
        date: date.toLocaleDateString(),
        temperature: 20 + Math.random() * 20,
        humidity: 30 + Math.random() * 50,
        windSpeed: Math.random() * 25,
        riskLevel: 20 + Math.random() * 60
      };
    });
    return days;
  };

  const generateSeasonalData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      bushfireRisk: Math.random() * 100,
      floodRisk: Math.random() * 100,
      overallRisk: Math.random() * 100
    }));
  };

  const generateGeographicData = () => [
    { name: 'Elevation Risk', value: 75, color: '#8B5CF6' },
    { name: 'Slope Factor', value: 60, color: '#06B6D4' },
    { name: 'Vegetation Cover', value: 45, color: '#10B981' },
    { name: 'Water Proximity', value: 80, color: '#F59E0B' }
  ];

  const generateHumanFactorData = () => [
    { factor: 'Population Density', current: 65, capacity: 80, risk: 70 },
    { factor: 'Infrastructure', current: 45, capacity: 70, risk: 55 },
    { factor: 'Emergency Services', current: 85, capacity: 90, risk: 25 },
    { factor: 'Evacuation Routes', current: 60, capacity: 75, risk: 45 }
  ];

  const weatherData = generateWeatherData();
  const seasonalData = generateSeasonalData();
  const geographicData = generateGeographicData();
  const humanFactorData = generateHumanFactorData();

  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#06B6D4'];

  // Weather Tab Component
  const WeatherTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature and Risk Trend */}
        <Card className="card-modern">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Thermometer className="h-5 w-5 text-red-500" />
              Temperature & Risk Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="temperature" stroke="#EF4444" name="Temperature (°C)" />
                  <Line type="monotone" dataKey="riskLevel" stroke="#F59E0B" name="Risk Level" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weather Factors Overview */}
        <Card className="card-modern">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CloudRain className="h-5 w-5 text-blue-500" />
              Current Weather Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">32°C</div>
                  <div className="text-xs text-muted-foreground">High Risk</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Humidity</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">25%</div>
                  <div className="text-xs text-muted-foreground">Low</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Wind Speed</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">15 km/h</div>
                  <div className="text-xs text-muted-foreground">Moderate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Humidity and Wind Speed Chart */}
      <Card className="card-modern">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-purple-500" />
            Humidity & Wind Speed Correlation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weatherData}>
                <defs>
                  <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="humidity" stackId="1" stroke="#3B82F6" fillOpacity={1} fill="url(#colorHumidity)" name="Humidity %" />
                <Area type="monotone" dataKey="windSpeed" stackId="2" stroke="#10B981" fillOpacity={1} fill="url(#colorWind)" name="Wind Speed km/h" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Geographic Tab Component  
  const GeographicTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Risk Factors */}
        <Card className="card-modern">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mountain className="h-5 w-5 text-purple-500" />
              Geographic Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geographicData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {geographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Elevation and Terrain Analysis */}
        <Card className="card-modern">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-green-500" />
              Terrain Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {geographicData.map((item, index) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span>{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Mountain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">847m</div>
                <div className="text-sm text-muted-foreground">Avg Elevation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Navigation className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">15°</div>
                <div className="text-sm text-muted-foreground">Avg Slope</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">2.3km</div>
                <div className="text-sm text-muted-foreground">Water Distance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Seasonal Tab Component
  const SeasonalTab = () => (
    <div className="space-y-6">
      {/* Seasonal Risk Patterns */}
      <Card className="card-modern">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-orange-500" />
            Seasonal Risk Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bushfireRisk" fill="#EF4444" name="Bushfire Risk" />
                <Bar dataKey="floodRisk" fill="#3B82F6" name="Flood Risk" />
                <Bar dataKey="overallRisk" fill="#F59E0B" name="Overall Risk" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Season Analysis */}
        <Card className="card-modern">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sun className="h-5 w-5 text-yellow-500" />
              Current Season: Summer
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-red-800">High Fire Season</span>
                  <Badge variant="destructive">Critical</Badge>
                </div>
                <p className="text-sm text-red-700">Peak bushfire conditions with high temperatures and low humidity</p>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-blue-800">Dry Period</span>
                  <Badge variant="secondary">Moderate</Badge>
                </div>
                <p className="text-sm text-blue-700">Limited rainfall expected, increasing vegetation dryness</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seasonal Trends */}
        <Card className="card-modern">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Seasonal Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Temperature Trend</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">+2.3°C</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Humidity Trend</span>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">-15%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Wind Speed</span>
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Stable</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Human Factors Tab Component
  const HumanTab = () => (
    <div className="space-y-6">
      {/* Human Factor Analysis */}
      <Card className="card-modern">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-blue-500" />
            Human Factor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={humanFactorData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="factor" type="category" width={120} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#3B82F6" name="Current Level" />
                <Bar dataKey="capacity" fill="#10B981" name="Max Capacity" />
                <Bar dataKey="risk" fill="#EF4444" name="Risk Level" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Population Impact */}
        <Card className="card-modern">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-purple-500" />
              Infrastructure & Population
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">45,230</div>
                  <div className="text-sm text-muted-foreground">Population</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <div className="text-sm text-muted-foreground">per km²</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Vulnerable Population</span>
                  <span>23%</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Infrastructure Resilience</span>
                  <span>67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Preparedness */}
        <Card className="card-modern">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-red-500" />
              Emergency Preparedness
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Fire Stations</span>
                  <Badge variant="secondary">3 Active</Badge>
                </div>
                <div className="text-sm text-muted-foreground">Average response time: 8 minutes</div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Evacuation Centers</span>
                  <Badge variant="secondary">5 Available</Badge>
                </div>
                <div className="text-sm text-muted-foreground">Capacity: 12,000 people</div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Alert System Coverage</span>
                  <Badge variant="default">98%</Badge>
                </div>
                <div className="text-sm text-muted-foreground">SMS, Radio, Mobile App</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Risk Analysis</h2>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{overallStats.avgRiskScore.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Avg Risk Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{overallStats.highRiskRegions}</div>
                <div className="text-sm text-muted-foreground">High Risk Regions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{overallStats.lowRiskRegions}</div>
                <div className="text-sm text-muted-foreground">Low Risk Regions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Map className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-lg font-bold truncate">{overallStats.mostVulnerable?.regionId || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Most Vulnerable</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weather" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Weather
          </TabsTrigger>
          <TabsTrigger value="geographic" className="flex items-center gap-2">
            <Mountain className="h-4 w-4" />
            Geographic
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <CloudRain className="h-4 w-4" />
            Seasonal
          </TabsTrigger>
          <TabsTrigger value="human" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Human
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weather">
          <WeatherTab />
        </TabsContent>

        <TabsContent value="geographic">
          <GeographicTab />
        </TabsContent>

        <TabsContent value="seasonal">
          <SeasonalTab />
        </TabsContent>

        <TabsContent value="human">
          <HumanTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 