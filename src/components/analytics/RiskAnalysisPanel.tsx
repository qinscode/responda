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
  Tooltip
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
  Mountain
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
  const [riskCategory, setRiskCategory] = useState<'all' | 'weather' | 'geographic' | 'seasonal' | 'human'>('all');

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
      case 'human': return Shield;
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

  // Prepare radar chart data for selected profile
  const radarData = selectedProfile ? selectedProfile.riskFactors
    .filter(factor => riskCategory === 'all' || factor.category === riskCategory)
    .map(factor => ({
      factor: factor.name,
      current: factor.currentValue,
      historical: factor.historicalAverage,
      weight: factor.weight * 100
    })) : [];

  // Prepare correlation heatmap data
  const correlationHeatmapData = correlationData.significantCorrelations.map(corr => ({
    x: corr.variable1,
    y: corr.variable2,
    value: Math.abs(corr.correlation),
    correlation: corr.correlation,
    significance: corr.significance
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Risk Analysis</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
            {(['all', 'weather', 'geographic', 'seasonal', 'human'] as const).map((category) => (
              <Button
                key={category}
                size="sm"
                variant={riskCategory === category ? 'default' : 'ghost'}
                className="h-6 px-2 text-xs capitalize"
                onClick={() => setRiskCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
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

      <Tabs defaultValue="profiles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profiles">Regional Profiles</TabsTrigger>
          <TabsTrigger value="factors">Risk Factors</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Region selector */}
            <Card className="card-modern">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Regional Profiles</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {regionalProfiles.map((profile) => (
                    <div
                      key={profile.regionId}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedProfile?.regionId === profile.regionId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{profile.regionId}</span>
                        <div className={`w-3 h-3 rounded-full ${getRiskColor(profile.overallRiskScore)}`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Risk Score</span>
                          <span>{profile.overallRiskScore.toFixed(0)}</span>
                        </div>
                        <Progress value={profile.overallRiskScore} className="h-1" />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>Vulnerability: {(profile.vulnerabilityIndex * 100).toFixed(0)}%</span>
                        <span>Capacity: {(profile.adaptationCapacity * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected profile details */}
            {selectedProfile && (
              <div className="lg:col-span-2 space-y-4">
                <Card className="card-modern">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Map className="h-5 w-5 text-blue-500" />
                      {selectedProfile.regionId} Risk Profile
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded ${
                        selectedProfile.overallRiskScore >= 70 ? 'bg-red-50 text-red-700' :
                        selectedProfile.overallRiskScore >= 40 ? 'bg-yellow-50 text-yellow-700' :
                        'bg-green-50 text-green-700'
                      }`}>
                        <span>Overall Risk: {selectedProfile.overallRiskScore.toFixed(0)}/100</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Updated: {new Date(selectedProfile.lastUpdated).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis 
                            dataKey="factor" 
                            tick={{ fontSize: 10 }}
                          />
                          <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, 100]}
                            tick={{ fontSize: 8 }}
                          />
                          <Radar
                            name="Current"
                            dataKey="current"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          <Radar
                            name="Historical Avg"
                            dataKey="historical"
                            stroke="#64748b"
                            fill="#64748b"
                            fillOpacity={0.1}
                            strokeWidth={1}
                            strokeDasharray="5 5"
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="glass rounded-lg shadow-lg p-3 border border-white/20">
                                    <div className="font-medium text-sm mb-2">{data.factor}</div>
                                    <div className="space-y-1 text-xs">
                                      <div>Current: {data.current?.toFixed(1)}</div>
                                      <div>Historical Avg: {data.historical?.toFixed(1)}</div>
                                      <div>Weight: {data.weight?.toFixed(0)}%</div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="card-modern">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Vulnerability Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Vulnerability Index</span>
                            <span>{(selectedProfile.vulnerabilityIndex * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={selectedProfile.vulnerabilityIndex * 100} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Adaptation Capacity</span>
                            <span>{(selectedProfile.adaptationCapacity * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={selectedProfile.adaptationCapacity * 100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-modern">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Top Risk Factors</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {selectedProfile.riskFactors
                          .sort((a, b) => b.weight - a.weight)
                          .slice(0, 4)
                          .map((factor, index) => {
                            const CategoryIcon = getCategoryIcon(factor.category);
                            const trendInfo = getTrendInfo(factor.trend);
                            const TrendIcon = trendInfo.icon;
                            
                            return (
                              <div key={factor.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{factor.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded ${trendInfo.bgColor}`}>
                                    <TrendIcon className={`h-3 w-3 ${trendInfo.color}`} />
                                  </div>
                                  <span className="text-sm">{(factor.weight * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="factors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {riskCategory === 'all' ? (
              ['weather', 'geographic', 'seasonal', 'human'].map(category => {
                const factors = selectedProfile?.riskFactors.filter(f => f.category === category) || [];
                const CategoryIcon = getCategoryIcon(category);
                
                return (
                  <Card key={category} className="card-modern">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base capitalize">
                        <CategoryIcon className="h-5 w-5 text-blue-500" />
                        {category} Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {factors.map((factor) => {
                          const trendInfo = getTrendInfo(factor.trend);
                          const TrendIcon = trendInfo.icon;
                          
                          return (
                            <div key={factor.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{factor.name}</span>
                                <div className={`p-1 rounded ${trendInfo.bgColor}`}>
                                  <TrendIcon className={`h-3 w-3 ${trendInfo.color}`} />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Current: {factor.currentValue.toFixed(1)}</span>
                                  <span>Avg: {factor.historicalAverage.toFixed(1)}</span>
                                </div>
                                <Progress value={(factor.weight * 100)} className="h-1" />
                                <div className="text-xs text-muted-foreground text-right">
                                  Weight: {(factor.weight * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="lg:col-span-2">
                <Card className="card-modern">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base capitalize">
                      {getCategoryIcon(riskCategory)({ className: "h-5 w-5 text-blue-500" })}
                      {riskCategory} Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={selectedProfile?.riskFactors
                            .filter(f => f.category === riskCategory)
                            .map(f => ({
                              name: f.name,
                              current: f.currentValue,
                              historical: f.historicalAverage,
                              weight: f.weight * 100
                            })) || []}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="current" fill="#3b82f6" name="Current Value" />
                          <Bar dataKey="historical" fill="#64748b" name="Historical Average" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-modern">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Network className="h-5 w-5 text-purple-500" />
                  Significant Correlations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {correlationData.significantCorrelations.map((corr, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {corr.variable1} ↔ {corr.variable2}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            p-value: {corr.pValue.toFixed(4)}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            corr.significance === 'high' ? 'default' : 
                            corr.significance === 'medium' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {corr.significance}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Correlation</span>
                          <span className={
                            corr.correlation > 0 ? 'text-green-600' : 'text-red-600'
                          }>
                            {corr.correlation.toFixed(3)}
                          </span>
                        </div>
                        <Progress 
                          value={Math.abs(corr.correlation) * 100} 
                          className="h-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {correlationData.insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm">{insight}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 