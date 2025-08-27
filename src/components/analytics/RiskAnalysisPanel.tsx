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
  Activity,
  Clock
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
    const days = Array.from({ length: 30 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - 29 + index);
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
    { 
      factor: 'Population Density', 
      current: 65, 
      capacity: 80, 
      risk: 70,
      description: '156 people/km² - High density creates evacuation bottlenecks'
    },
    { 
      factor: 'Critical Infrastructure', 
      current: 45, 
      capacity: 70, 
      risk: 55,
      description: 'Hospital capacity, power grid, water systems resilience'
    },
    { 
      factor: 'Emergency Services', 
      current: 85, 
      capacity: 90, 
      risk: 25,
      description: '3 fire stations, 2 police units, 1 hospital with good coverage'
    },
    { 
      factor: 'Evacuation Routes', 
      current: 60, 
      capacity: 75, 
      risk: 45,
      description: '4 primary routes, 2 secondary - limited by bridge capacity'
    },
    { 
      factor: 'Community Preparedness', 
      current: 55, 
      capacity: 85, 
      risk: 60,
      description: 'Emergency plans awareness 67%, drill participation 41%'
    },
    { 
      factor: 'Vulnerable Population Support', 
      current: 40, 
      capacity: 65, 
      risk: 75,
      description: '40.7% vulnerable groups (elderly, disabled, low-income)'
    },
    { 
      factor: 'Communication Systems', 
      current: 78, 
      capacity: 85, 
      risk: 35,
      description: 'SMS alerts 98%, radio 95%, mobile app 82% coverage'
    },
    { 
      factor: 'Economic Resilience', 
      current: 52, 
      capacity: 70, 
      risk: 48,
      description: 'Business continuity plans, insurance coverage, recovery funds'
    }
  ];

  const generateDemographicData = () => [
    { group: 'Children (0-14)', population: 8456, vulnerable: true, percentage: 18.7 },
    { group: 'Adults (15-64)', population: 28934, vulnerable: false, percentage: 64.0 },
    { group: 'Elderly (65+)', population: 7840, vulnerable: true, percentage: 17.3 },
    { group: 'Disabled', population: 2145, vulnerable: true, percentage: 4.7 },
    { group: 'Low Income Households', population: 6782, vulnerable: true, percentage: 15.0 }
  ];

  const generateEvacuationCapacityData = () => [
    { name: 'Current Capacity', value: 12000, color: '#3B82F6' },
    { name: 'Population at Risk', value: 18500, color: '#EF4444' },
    { name: 'Shortfall', value: 6500, color: '#F59E0B' }
  ];

  const generateResponseTimeData = () => [
    { service: 'Fire Department', current: 8, target: 6, coverage: 95 },
    { service: 'Police', current: 5, target: 4, coverage: 98 },
    { service: 'Medical Emergency', current: 12, target: 8, coverage: 92 },
    { service: 'Search & Rescue', current: 25, target: 15, coverage: 85 }
  ];

  const generateCommunityReadinessData = () => [
    { aspect: 'Emergency Plans Awareness', percentage: 67 },
    { aspect: 'Emergency Kit Prepared', percentage: 45 },
    { aspect: 'Evacuation Route Knowledge', percentage: 58 },
    { aspect: 'Communication System Enrollment', percentage: 78 },
    { aspect: 'First Aid Training', percentage: 32 },
    { aspect: 'Community Drill Participation', percentage: 41 }
  ];

  const weatherData = generateWeatherData();
  const seasonalData = generateSeasonalData();
  const geographicData = generateGeographicData();
  const humanFactorData = generateHumanFactorData();
  const demographicData = generateDemographicData();
  const evacuationCapacityData = generateEvacuationCapacityData();
  const responseTimeData = generateResponseTimeData();
  const communityReadinessData = generateCommunityReadinessData();

  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#06B6D4'];

  // Weather Tab Component
  const WeatherTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature and Risk Trend */}
        <Card className="card-modern-v2 animate-card-hover animate-scale-in animate-delay-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Thermometer className="h-5 w-5 text-red-500 animate-pulse-gentle" />
              Temperature & Risk Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line dataKey="temperature" name="Temperature (°C)" stroke="#EF4444" type="monotone" />
                  <Line dataKey="riskLevel" name="Risk Level" stroke="#F59E0B" type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weather Factors Overview */}
        <Card className="card-modern-v2 animate-card-hover animate-scale-in animate-delay-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CloudRain className="h-5 w-5 text-blue-500 animate-pulse-gentle" />
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
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={weatherData}>
                <defs>
                  <linearGradient id="colorHumidity" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWind" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area dataKey="humidity" fill="url(#colorHumidity)" fillOpacity={1} name="Humidity %" stackId="1" stroke="#3B82F6" type="monotone" />
                <Area dataKey="windSpeed" fill="url(#colorWind)" fillOpacity={1} name="Wind Speed km/h" stackId="2" stroke="#10B981" type="monotone" />
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
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={geographicData}
                    dataKey="value"
                    fill="#8884d8"
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                    outerRadius={80}
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
                  <Progress className="h-2" value={item.value} />
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
            <ResponsiveContainer height="100%" width="100%">
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
      <Card className="card-modern-v2 animate-card-hover animate-scale-in animate-delay-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-blue-500 animate-pulse-gentle" />
            Human Factor Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80 w-full mb-6">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={humanFactorData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis domain={[0, 100]} type="number" />
                <YAxis dataKey="factor" tick={{ fontSize: 10 }} type="category" width={180} />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, name]}
                  labelFormatter={(label) => {
                    const item = humanFactorData.find(d => d.factor === label);
                    return item ? `${label}: ${item.description}` : label;
                  }}
                />
                <Legend />
                <Bar dataKey="current" fill="#3B82F6" name="Current Level %" />
                <Bar dataKey="capacity" fill="#10B981" name="Max Capacity %" />
                <Bar dataKey="risk" fill="#EF4444" name="Risk Level %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Detailed Analysis */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-4">Detailed Risk Factor Analysis</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {humanFactorData.map((factor, index) => {
                const riskLevel = factor.risk >= 70 ? 'high' : factor.risk >= 50 ? 'medium' : 'low';
                const riskColor = riskLevel === 'high' ? 'red' : riskLevel === 'medium' ? 'yellow' : 'green';
                const capacityGap = factor.capacity - factor.current;
                
                return (
                  <div key={factor.factor} className={`p-4 rounded-lg border ${
                    riskLevel === 'high' ? 'bg-red-50 border-red-200' : 
                    riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' : 
                    'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-sm">{factor.factor}</h5>
                      <Badge variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'secondary' : 'default'}>
                        {riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3">{factor.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Current Performance</span>
                        <span className="font-bold">{factor.current}%</span>
                      </div>
                      <Progress className="h-2" value={factor.current} />
                      
                      <div className="flex justify-between text-xs">
                        <span>Risk Assessment</span>
                        <span className={`font-bold text-${riskColor}-600`}>{factor.risk}%</span>
                      </div>
                      <Progress 
                        className="h-2" 
                        value={factor.risk}
                        // @ts-ignore
                        style={{ '--progress-background': riskColor === 'red' ? '#EF4444' : riskColor === 'yellow' ? '#F59E0B' : '#10B981' }}
                      />
                      
                      {capacityGap > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <span className="text-blue-700">
                            <strong>Improvement Potential:</strong> +{capacityGap}% capacity available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Key Insights */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Key Risk Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-red-100 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-1">Highest Risk Areas</h5>
                  <div className="text-red-700 space-y-1">
                    <div>• Vulnerable Population Support (75%)</div>
                    <div>• Population Density (70%)</div>
                    <div>• Community Preparedness (60%)</div>
                  </div>
                </div>
                
                <div className="p-3 bg-green-100 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-1">Strong Performance</h5>
                  <div className="text-green-700 space-y-1">
                    <div>• Emergency Services (85%)</div>
                    <div>• Communication Systems (78%)</div>
                    <div>• Population Density Management (65%)</div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-100 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-1">Improvement Opportunities</h5>
                  <div className="text-blue-700 space-y-1">
                    <div>• Infrastructure (+25% capacity)</div>
                    <div>• Economic Resilience (+18% capacity)</div>
                    <div>• Evacuation Routes (+15% capacity)</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recommendations */}
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-3">Priority Recommendations</h4>
              <div className="space-y-3 text-sm text-amber-700">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Immediate Action:</strong> Develop targeted support programs for vulnerable populations (elderly, disabled, low-income households)
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Short-term (3-6 months):</strong> Increase community preparedness through mandatory emergency drills and awareness campaigns
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Medium-term (6-12 months):</strong> Invest in critical infrastructure upgrades, particularly backup power systems and water security
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Long-term (1-2 years):</strong> Develop additional evacuation routes and economic resilience programs for business continuity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demographics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-modern-v2 animate-card-hover animate-scale-in animate-delay-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-purple-500 animate-pulse-gentle" />
              Population Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {demographicData.map((demo, index) => (
                <div key={demo.group} className={`p-3 rounded-lg border ${demo.vulnerable ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{demo.group}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={demo.vulnerable ? "destructive" : "secondary"}>
                        {demo.vulnerable ? 'Vulnerable' : 'Resilient'}
                      </Badge>
                      <span className="text-sm font-bold">{demo.percentage}%</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Population: {demo.population.toLocaleString()}
                  </div>
                  <Progress 
                    className="h-2 mt-2" 
                    value={demo.percentage} 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-v2 animate-card-hover animate-scale-in animate-delay-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-orange-500 animate-pulse-gentle" />
              Evacuation Capacity Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={evacuationCapacityData}
                    dataKey="value"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {evacuationCapacityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value.toLocaleString(), 'People']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Capacity Gap:</span>
                <span>6,500 people need additional shelter</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Response Times */}
      <Card className="card-modern-v2 animate-card-hover animate-scale-in animate-delay-400">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-red-500 animate-pulse-gentle" />
            Emergency Service Response Times
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 w-full">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#EF4444" name="Current (min)" />
                  <Bar dataKey="target" fill="#10B981" name="Target (min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {responseTimeData.map((service, index) => (
                <div key={service.service} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{service.service}</span>
                    <Badge variant={service.current <= service.target ? "default" : "destructive"}>
                      {service.coverage}% Coverage
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Current: {service.current} min</span>
                    <span>Target: {service.target} min</span>
                  </div>
                  <Progress 
                    className="h-2" 
                    value={Math.min((service.target / service.current) * 100, 100)}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Preparedness */}
      <Card className="card-modern-v2 animate-card-hover animate-scale-in animate-delay-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5 text-green-500 animate-pulse-gentle" />
            Community Preparedness & Education
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {communityReadinessData.map((item, index) => (
                <div key={item.aspect} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.aspect}</span>
                    <span className={`font-bold ${item.percentage >= 70 ? 'text-green-600' : item.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {item.percentage}%
                    </span>
                  </div>
                  <Progress 
                    className="h-3" 
                    value={item.percentage}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Critical Infrastructure</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hospitals</span>
                    <Badge variant="default">2 Primary, 1 Emergency</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Schools (Shelters)</span>
                    <Badge variant="secondary">8 Available</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Communication Towers</span>
                    <Badge variant="default">99.2% Uptime</Badge>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Recent Improvements</h4>
                <div className="space-y-2 text-sm text-green-700">
                  <div>• Added 2 new evacuation centers (+3,000 capacity)</div>
                  <div>• Updated emergency alert system</div>
                  <div>• Conducted community drill (78% participation)</div>
                  <div>• Deployed additional first aid training</div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">Recommended Actions</h4>
                <div className="space-y-2 text-sm text-amber-700">
                  <div>• Increase emergency kit preparation programs</div>
                  <div>• Expand first aid training coverage</div>
                  <div>• Improve evacuation route signage</div>
                  <div>• Enhance vulnerable population support</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 animate-fade-in ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-in-right">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500 animate-pulse-gentle" />
          <h2 className="text-lg font-semibold">Risk Analysis</h2>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-modern-v2 animate-card-hover animate-scale-in animate-delay-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg animate-pulse-gentle">
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
      <Tabs className="space-y-4 animate-fade-in-up animate-delay-200" value={activeTab} onValueChange={(value) => { setActiveTab(value as any); }}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-50 p-1 rounded-xl border border-gray-200 h-12">
          <TabsTrigger className="flex items-center justify-center gap-2 h-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 data-[state=active]:font-semibold text-gray-600 hover:text-gray-900 btn-spring transition-all duration-200 rounded-lg" value="weather">
            <Thermometer className="h-4 w-4" />
            Weather
          </TabsTrigger>
          <TabsTrigger className="flex items-center justify-center gap-2 h-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 data-[state=active]:font-semibold text-gray-600 hover:text-gray-900 btn-spring transition-all duration-200 rounded-lg" value="geographic">
            <Mountain className="h-4 w-4" />
            Geographic
          </TabsTrigger>
          <TabsTrigger className="flex items-center justify-center gap-2 h-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 data-[state=active]:font-semibold text-gray-600 hover:text-gray-900 btn-spring transition-all duration-200 rounded-lg" value="seasonal">
            <CloudRain className="h-4 w-4" />
            Seasonal
          </TabsTrigger>
          <TabsTrigger className="flex items-center justify-center gap-2 h-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 data-[state=active]:font-semibold text-gray-600 hover:text-gray-900 btn-spring transition-all duration-200 rounded-lg" value="human">
            <Users className="h-4 w-4" />
            Human
          </TabsTrigger>
        </TabsList>

        <TabsContent className="animate-fade-in-up animate-delay-100" value="weather">
          <WeatherTab />
        </TabsContent>

        <TabsContent className="animate-fade-in-up animate-delay-100" value="geographic">
          <GeographicTab />
        </TabsContent>

        <TabsContent className="animate-fade-in-up animate-delay-100" value="seasonal">
          <SeasonalTab />
        </TabsContent>

        <TabsContent className="animate-fade-in-up animate-delay-100" value="human">
          <HumanTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 