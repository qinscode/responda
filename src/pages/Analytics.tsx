import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { TrendChart } from '@/components/analytics/TrendChart';
import { PredictionPanel } from '@/components/analytics/PredictionPanel';
import { RiskAnalysisPanel } from '@/components/analytics/RiskAnalysisPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Shield,
  Activity,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';
import {
  mockBushfireTimeSeriesAnalysis,
  mockFloodTimeSeriesAnalysis,
  mockAnalyticsDashboardData,
  mockPredictionModels,
  mockAdvancedForecasts,
  mockPredictiveAlerts,
  mockRegionalRiskProfiles,
  mockCorrelationAnalysis
} from '@/data/mockAnalyticsData';

export const Analytics = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const dashboardData = mockAnalyticsDashboardData;

  return (
    <AppShell onSearchChange={setSearchQuery}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">
                Advanced analytics and predictive insights for emergency management
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{dashboardData.summary.totalRegions}</div>
                  <div className="text-sm text-gray-600">Total Regions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{dashboardData.summary.activeAlerts}</div>
                  <div className="text-sm text-gray-600">Active Alerts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{dashboardData.summary.highRiskRegions}</div>
                  <div className="text-sm text-gray-600">High Risk Regions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Brain className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(dashboardData.summary.predictionAccuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Model Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="trends" className="flex items-center gap-2 data-[state=active]:bg-white">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Brain className="h-4 w-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="risk-analysis" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Shield className="h-4 w-4" />
              Risk Analysis
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-white">
              <BarChart3 className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            {/* Trend Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart
                data={mockBushfireTimeSeriesAnalysis}
                type="bushfire"
                title="Bushfire Risk Trends"
                showForecast={true}
                showAnomalies={true}
              />
              <TrendChart
                data={mockFloodTimeSeriesAnalysis}
                type="flood"
                title="Flood Risk Trends"
                showForecast={true}
                showAnomalies={true}
              />
            </div>

            {/* Trend Summary */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Trend Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Bushfire Trend</div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={dashboardData.trends.bushfireTrend.trend === 'increasing' ? 'destructive' : 'secondary'}
                        className="capitalize"
                      >
                        {dashboardData.trends.bushfireTrend.trend}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {Math.abs(dashboardData.trends.bushfireTrend.changeRate).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Confidence: {(dashboardData.trends.bushfireTrend.confidence * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Flood Trend</div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={dashboardData.trends.floodTrend.trend === 'increasing' ? 'destructive' : 'secondary'}
                        className="capitalize"
                      >
                        {dashboardData.trends.floodTrend.trend}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {Math.abs(dashboardData.trends.floodTrend.changeRate).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Confidence: {(dashboardData.trends.floodTrend.confidence * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Overall Risk</div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={dashboardData.trends.overallRiskTrend.trend === 'increasing' ? 'destructive' : 'secondary'}
                        className="capitalize"
                      >
                        {dashboardData.trends.overallRiskTrend.trend}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {Math.abs(dashboardData.trends.overallRiskTrend.changeRate).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Confidence: {(dashboardData.trends.overallRiskTrend.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <PredictionPanel
              forecasts={mockAdvancedForecasts}
              alerts={mockPredictiveAlerts}
              models={mockPredictionModels}
            />
          </TabsContent>

          <TabsContent value="risk-analysis" className="space-y-6">
            <RiskAnalysisPanel
              regionalProfiles={mockRegionalRiskProfiles}
              correlationData={mockCorrelationAnalysis}
            />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Model Performance */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Model Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.modelPerformance.map((performance) => {
                    const model = mockPredictionModels.find(m => m.id === performance.modelId);
                    return (
                      <div key={performance.modelId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{model?.name}</div>
                          <div className="text-sm text-gray-600 capitalize">{model?.type}</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{(performance.accuracy * 100).toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">Accuracy</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{(performance.precision * 100).toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">Precision</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{(performance.recall * 100).toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">Recall</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{(performance.f1Score * 100).toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">F1-Score</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Key Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCorrelationAnalysis.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-800 mb-1">
                          Statistical Insight #{index + 1}
                        </div>
                        <div className="text-sm text-blue-700">{insight}</div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Additional recommendations */}
                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Brain className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800 mb-1">
                        Model Optimization Recommendation
                      </div>
                      <div className="text-sm text-green-700">
                        Consider implementing ensemble methods combining weather-based and historical pattern models for improved accuracy in seasonal predictions.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-amber-800 mb-1">
                        Data Quality Alert
                      </div>
                      <div className="text-sm text-amber-700">
                        Some regions show inconsistent historical data patterns. Consider implementing additional data validation and cleaning procedures.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}; 