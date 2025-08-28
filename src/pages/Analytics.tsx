import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TrendChart } from "@/components/analytics/TrendChart";
import { SarimaChart } from "@/components/analytics/SarimaChart";
import { PredictionPanel } from "@/components/analytics/PredictionPanel";
import { RiskAnalysisPanel } from "@/components/analytics/RiskAnalysisPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BarChart3,
	TrendingUp,
	Brain,
	Shield,
	Activity,
	AlertTriangle,
	RefreshCw,
	Download,
	Settings,
	Zap,
	Target,
	ArrowUpRight,
	Sparkles,
} from "lucide-react";
import {
	mockBushfireTimeSeriesAnalysis,
	mockFloodTimeSeriesAnalysis,
	mockAnalyticsDashboardData,
	mockPredictionModels,
	mockAdvancedForecasts,
	mockPredictiveAlerts,
	mockRegionalRiskProfiles,
	mockCorrelationAnalysis,
} from "@/data/mockAnalyticsData";

export const Analytics = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		// Simulate API call
		await new Promise((resolve) => {
			setTimeout(resolve, 2000);
		});
		setIsRefreshing(false);
	};

	const dashboardData = mockAnalyticsDashboardData;

	return (
		<AppShell onSearchChange={setSearchQuery}>
			<div className="space-y-8">
				{/* Enhanced Header */}
				<div className="relative overflow-hidden bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 rounded-2xl border border-gray-200/60 p-8 shadow-lg backdrop-blur-sm">
					{/* Subtle decorative elements */}
					<div className="absolute top-4 right-8 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
					<div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-2xl"></div>

					<div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
						<div className="flex items-center gap-4">
							<div className="relative group">
								<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
								<div className="relative p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
									<BarChart3 className="h-7 w-7 text-white" />
								</div>
							</div>
							<div>
								<div className="flex items-center gap-2 mb-1">
									<h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
										Analytics Dashboard
									</h1>
									<Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
								</div>
								<p className="text-gray-600 text-base leading-relaxed">
									Advanced analytics and predictive insights for emergency
									management
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Button
								className="group flex items-center gap-2 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
								disabled={isRefreshing}
								size="sm"
								variant="outline"
								onClick={handleRefresh}
							>
								<RefreshCw
									className={`h-4 w-4 transition-transform duration-300 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"}`}
								/>
								Refresh
							</Button>
							<Button
								className="group flex items-center gap-2 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
								size="sm"
								variant="outline"
							>
								<Download className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
								Export
							</Button>
							<Button
								className="group flex items-center gap-2 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
								size="sm"
								variant="outline"
							>
								<Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
								Settings
							</Button>
						</div>
					</div>
				</div>

				{/* Modern Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<Card className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:-translate-y-1">
						<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10"></div>
						<CardContent className="relative p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
									<Activity className="h-5 w-5 text-white" />
								</div>
								<ArrowUpRight className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>
							<div>
								<div className="text-2xl font-bold text-gray-900 mb-1">
									{dashboardData.summary.totalRegions}
								</div>
								<div className="text-sm text-gray-600 mb-2">Total Regions</div>
								<div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block font-medium">
									+12% this month
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="group relative overflow-hidden bg-gradient-to-br from-white to-red-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:-translate-y-1">
						<div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10"></div>
						<CardContent className="relative p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
									<AlertTriangle className="h-5 w-5 text-white" />
								</div>
								<ArrowUpRight className="h-4 w-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>
							<div>
								<div className="text-2xl font-bold text-gray-900 mb-1">
									{dashboardData.summary.activeAlerts}
								</div>
								<div className="text-sm text-gray-600 mb-2">Active Alerts</div>
								<div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full inline-block font-medium">
									Requires attention
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="group relative overflow-hidden bg-gradient-to-br from-white to-orange-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:-translate-y-1">
						<div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/10"></div>
						<CardContent className="relative p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
									<Shield className="h-5 w-5 text-white" />
								</div>
								<ArrowUpRight className="h-4 w-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>
							<div>
								<div className="text-2xl font-bold text-gray-900 mb-1">
									{dashboardData.summary.highRiskRegions}
								</div>
								<div className="text-sm text-gray-600 mb-2">
									High Risk Regions
								</div>
								<div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full inline-block font-medium">
									Monitor closely
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="group relative overflow-hidden bg-gradient-to-br from-white to-green-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:-translate-y-1">
						<div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10"></div>
						<CardContent className="relative p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
									<Brain className="h-5 w-5 text-white" />
								</div>
								<ArrowUpRight className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>
							<div>
								<div className="text-2xl font-bold text-gray-900 mb-1">
									{(dashboardData.summary.predictionAccuracy * 100).toFixed(1)}%
								</div>
								<div className="text-sm text-gray-600 mb-2">Model Accuracy</div>
								<div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full inline-block font-medium">
									Excellent performance
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Enhanced Tabs */}
				<Tabs className="space-y-8" defaultValue="trends">
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-2xl blur-xl"></div>
						<TabsList className="relative grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-gray-200/60 shadow-lg h-14">
							<TabsTrigger
								className="group flex items-center justify-center gap-2 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 hover:text-gray-900 transition-all duration-300 rounded-xl font-medium hover:bg-gray-50"
								value="trends"
							>
								<TrendingUp className="h-4 w-4 group-data-[state=active]:animate-pulse" />
								Trends
							</TabsTrigger>
							<TabsTrigger
								className="group flex items-center justify-center gap-2 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 hover:text-gray-900 transition-all duration-300 rounded-xl font-medium hover:bg-gray-50"
								value="predictions"
							>
								<Brain className="h-4 w-4 group-data-[state=active]:animate-pulse" />
								Predictions
							</TabsTrigger>
							<TabsTrigger
								className="group flex items-center justify-center gap-2 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 hover:text-gray-900 transition-all duration-300 rounded-xl font-medium hover:bg-gray-50"
								value="risk-analysis"
							>
								<Shield className="h-4 w-4 group-data-[state=active]:animate-pulse" />
								Risk Analysis
							</TabsTrigger>
							<TabsTrigger
								className="group flex items-center justify-center gap-2 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 hover:text-gray-900 transition-all duration-300 rounded-xl font-medium hover:bg-gray-50"
								value="insights"
							>
								<BarChart3 className="h-4 w-4 group-data-[state=active]:animate-pulse" />
								Insights
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent className="space-y-8" value="trends">
						{/* Trend Analysis Section */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<div className="animate-slide-in-left">
								<TrendChart
									showAnomalies
									showForecast
									data={mockBushfireTimeSeriesAnalysis}
									title="Bushfire Risk Trends"
									type="bushfire"
								/>
							</div>
							<div className="animate-slide-in-right">
								<SarimaChart height={350} title="Flood Risk Trends" />
							</div>
						</div>

						{/* Enhanced Trend Summary */}
						<Card className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
							<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
							<CardHeader className="relative pb-6">
								<CardTitle className="flex items-center gap-3 text-xl">
									<div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-md">
										<TrendingUp className="h-5 w-5 text-white" />
									</div>
									<span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent font-bold">
										Trend Summary
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="relative">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="group space-y-3 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
										<div className="text-sm font-semibold text-gray-900">
											Bushfire Trend
										</div>
										<div className="flex items-center gap-3">
											<Badge
												className="capitalize shadow-sm"
												variant={
													dashboardData.trends.bushfireTrend.trend ===
													"increasing"
														? "destructive"
														: "secondary"
												}
											>
												{dashboardData.trends.bushfireTrend.trend}
											</Badge>
											<span className="text-lg font-bold text-gray-700">
												{Math.abs(
													dashboardData.trends.bushfireTrend.changeRate
												).toFixed(1)}
												%
											</span>
										</div>
										<div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
											Confidence:{" "}
											{(
												dashboardData.trends.bushfireTrend.confidence * 100
											).toFixed(0)}
											%
										</div>
									</div>

									<div className="group space-y-3 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
										<div className="text-sm font-semibold text-gray-900">
											Flood Trend
										</div>
										<div className="flex items-center gap-3">
											<Badge
												className="capitalize shadow-sm"
												variant={
													dashboardData.trends.floodTrend.trend === "increasing"
														? "destructive"
														: "secondary"
												}
											>
												{dashboardData.trends.floodTrend.trend}
											</Badge>
											<span className="text-lg font-bold text-gray-700">
												{Math.abs(
													dashboardData.trends.floodTrend.changeRate
												).toFixed(1)}
												%
											</span>
										</div>
										<div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
											Confidence:{" "}
											{(
												dashboardData.trends.floodTrend.confidence * 100
											).toFixed(0)}
											%
										</div>
									</div>

									<div className="group space-y-3 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
										<div className="text-sm font-semibold text-gray-900">
											Overall Risk
										</div>
										<div className="flex items-center gap-3">
											<Badge
												className="capitalize shadow-sm"
												variant={
													dashboardData.trends.overallRiskTrend.trend ===
													"increasing"
														? "destructive"
														: "secondary"
												}
											>
												{dashboardData.trends.overallRiskTrend.trend}
											</Badge>
											<span className="text-lg font-bold text-gray-700">
												{Math.abs(
													dashboardData.trends.overallRiskTrend.changeRate
												).toFixed(1)}
												%
											</span>
										</div>
										<div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
											Confidence:{" "}
											{(
												dashboardData.trends.overallRiskTrend.confidence * 100
											).toFixed(0)}
											%
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent className="space-y-8" value="predictions">
						<div className="animate-fade-in-up">
							<PredictionPanel
								alerts={mockPredictiveAlerts}
								forecasts={mockAdvancedForecasts}
								models={mockPredictionModels}
							/>
						</div>
					</TabsContent>

					<TabsContent className="space-y-8" value="risk-analysis">
						<div className="animate-fade-in-up">
							<RiskAnalysisPanel
								correlationData={mockCorrelationAnalysis}
								regionalProfiles={mockRegionalRiskProfiles}
							/>
						</div>
					</TabsContent>

					<TabsContent className="space-y-8" value="insights">
						{/* Enhanced Model Performance */}
						<Card className="relative overflow-hidden bg-gradient-to-br from-white to-purple-50/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
							<div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
							<CardHeader className="relative pb-6">
								<CardTitle className="flex items-center gap-3 text-xl">
									<div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md animate-pulse">
										<Brain className="h-5 w-5 text-white" />
									</div>
									<span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent font-bold">
										Model Performance Overview
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="relative">
								<div className="space-y-4">
									{dashboardData.modelPerformance.map((performance, index) => {
										const model = mockPredictionModels.find(
											(m) => m.id === performance.modelId
										);
										return (
											<div
												key={performance.modelId}
												className="group flex items-center justify-between p-6 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-xl hover:shadow-md hover:bg-white/80 transition-all duration-300 hover:-translate-y-1"
											>
												<div className="flex-1">
													<div className="font-semibold text-lg text-gray-900">
														{model?.name}
													</div>
													<div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block mt-1 capitalize">
														{model?.type}
													</div>
												</div>
												<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
													<div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:scale-105 transition-transform duration-200">
														<div className="text-lg font-bold text-blue-700">
															{(performance.accuracy * 100).toFixed(1)}%
														</div>
														<div className="text-xs text-blue-600 font-medium">
															Accuracy
														</div>
													</div>
													<div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:scale-105 transition-transform duration-200">
														<div className="text-lg font-bold text-green-700">
															{(performance.precision * 100).toFixed(1)}%
														</div>
														<div className="text-xs text-green-600 font-medium">
															Precision
														</div>
													</div>
													<div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:scale-105 transition-transform duration-200">
														<div className="text-lg font-bold text-orange-700">
															{(performance.recall * 100).toFixed(1)}%
														</div>
														<div className="text-xs text-orange-600 font-medium">
															Recall
														</div>
													</div>
													<div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:scale-105 transition-transform duration-200">
														<div className="text-lg font-bold text-purple-700">
															{(performance.f1Score * 100).toFixed(1)}%
														</div>
														<div className="text-xs text-purple-600 font-medium">
															F1-Score
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>

						{/* Enhanced Key Insights */}
						<Card className="relative overflow-hidden bg-gradient-to-br from-white to-green-50/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
							<div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5"></div>
							<CardHeader className="relative pb-6">
								<CardTitle className="flex items-center gap-3 text-xl">
									<div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-md animate-pulse">
										<Zap className="h-5 w-5 text-white" />
									</div>
									<span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent font-bold">
										Key Insights & Recommendations
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="relative">
								<div className="space-y-6">
									{mockCorrelationAnalysis.insights.map((insight, index) => (
										<div
											key={index}
											className="group flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-1"
										>
											<div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
												<Target className="h-5 w-5 text-white" />
											</div>
											<div className="flex-1">
												<div className="font-semibold text-lg text-blue-800 mb-2">
													Statistical Insight #{index + 1}
												</div>
												<div className="text-blue-700 leading-relaxed">
													{insight}
												</div>
											</div>
										</div>
									))}

									{/* Enhanced recommendations */}
									<div className="group flex items-start gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-1">
										<div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
											<Brain className="h-5 w-5 text-white" />
										</div>
										<div className="flex-1">
											<div className="font-semibold text-lg text-green-800 mb-2">
												Model Optimization Recommendation
											</div>
											<div className="text-green-700 leading-relaxed">
												Consider implementing ensemble methods combining
												weather-based and historical pattern models for improved
												accuracy in seasonal predictions.
											</div>
										</div>
									</div>

									<div className="group flex items-start gap-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-1">
										<div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
											<AlertTriangle className="h-5 w-5 text-white" />
										</div>
										<div className="flex-1">
											<div className="font-semibold text-lg text-amber-800 mb-2">
												Data Quality Alert
											</div>
											<div className="text-amber-700 leading-relaxed">
												Some regions show inconsistent historical data patterns.
												Consider implementing additional data validation and
												cleaning procedures.
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
