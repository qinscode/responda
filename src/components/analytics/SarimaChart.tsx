import { useState, useEffect } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
	Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	BarChart3,
	Activity,
	Eye,
	EyeOff,
	Settings,
	MapPin,
	Droplets,
} from "lucide-react";
import { generateSarimaFloodData } from "@/data/mockSarimaData";
import { riverStations, type RiverStation } from "@/data/riverStations";

interface SarimaDataPoint {
	date: string;
	day: number;
	discharge: number;
	type: "train" | "test" | "forecast";
}

interface SarimaChartProps {
	title: string;
	height?: number;
	className?: string;
}

export const SarimaChart = ({
	title,
	height = 300,
	className,
}: SarimaChartProps) => {
	const [showTrain, setShowTrain] = useState(true);
	const [showTest, setShowTest] = useState(true);
	const [showForecast, setShowForecast] = useState(true);
	const [selectedStation, setSelectedStation] = useState<RiverStation>(
		riverStations[0]!
	);
	const [data, setData] = useState<Array<SarimaDataPoint>>([]);

	// Generate data when station changes
	useEffect(() => {
		const newData = generateSarimaFloodData(selectedStation);
		setData(newData);
	}, [selectedStation]);

	// Custom tooltip
	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
					<p className="text-sm font-medium text-gray-900">{data.date}</p>
					<div className="space-y-1 mt-2">
						{payload.map((entry: any, index: number) => (
							<div key={index} className="flex items-center gap-2">
								<div
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: entry.color }}
								/>
								<span className="text-sm text-gray-700">
									{entry.name}: {entry.value?.toFixed(0)} m³/s
								</span>
							</div>
						))}
					</div>
					<div className="text-xs text-gray-500 mt-2 capitalize">
						Data Type: {data.type}
					</div>
				</div>
			);
		}
		return null;
	};

	// Separate data by type for different line colors
	const trainData = data.filter((d) => d.type === "train");
	const testData = data.filter((d) => d.type === "test");
	const forecastData = data.filter((d) => d.type === "forecast");

	// Create combined data for chart with separate fields
	const chartData = data.map((point) => ({
		...point,
		trainValue: point.type === "train" ? point.discharge : null,
		testValue: point.type === "test" ? point.discharge : null,
		forecastValue: point.type === "forecast" ? point.discharge : null,
	}));

	return (
		<Card className={`card-modern-v2 animate-card-hover ${className}`}>
			<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
			<CardTitle className="flex items-center gap-2 text-base">
				<Droplets className="h-5 w-5 animate-pulse-gentle text-blue-500" />
				{title}
			</CardTitle>

					<div className="flex items-center gap-2">
						{/* View controls */}
						<div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
							<Button
								className="h-6 w-6 p-0 btn-spring"
								size="sm"
								variant={showTrain ? "default" : "ghost"}
								onClick={() => {
									setShowTrain(!showTrain);
								}}
							>
								{showTrain ? (
									<Eye className="h-3 w-3" />
								) : (
									<EyeOff className="h-3 w-3" />
								)}
							</Button>
							<Button
								className="h-6 w-6 p-0 btn-spring"
								size="sm"
								variant={showTest ? "default" : "ghost"}
								onClick={() => {
									setShowTest(!showTest);
								}}
							>
								{showTest ? (
									<Eye className="h-3 w-3" />
								) : (
									<EyeOff className="h-3 w-3" />
								)}
							</Button>
							<Button
								className="h-6 w-6 p-0 btn-spring"
								size="sm"
								variant={showForecast ? "default" : "ghost"}
								onClick={() => {
									setShowForecast(!showForecast);
								}}
							>
								{showForecast ? (
									<Eye className="h-3 w-3" />
								) : (
									<EyeOff className="h-3 w-3" />
								)}
							</Button>
						</div>
					</div>
				</div>

				{/* Trend summary */}
				{/*<div className="flex items-center gap-4 text-sm">*/}
				{/*  <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-blue-50">*/}
				{/*    <span className="font-medium">6-Day River Discharge Analysis & Forecasting (Day 25-31)</span>*/}
				{/*  </div>*/}
				{/*</div>*/}

				{/* River Station Selection */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm mt-4">
					<div className="flex items-center gap-2">
						<div className="p-1.5 bg-blue-100 rounded-lg">
							<MapPin className="h-4 w-4 text-blue-600" />
						</div>
						<span className="text-sm font-semibold text-gray-900">
							River Station
						</span>
					</div>
					<div className="flex-1 min-w-0">
						<div className="relative">
							<select
								className="w-full sm:w-auto min-w-[350px] appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
								value={selectedStation.site}
								onChange={(e) => {
									const station = riverStations.find(
										(s) => s.site === e.target.value
									);
									if (station) setSelectedStation(station);
								}}
							>
								{riverStations.map((station) => (
									<option key={station.site} value={station.site}>
										{station.site} - {station.river} ({station.stationName})
									</option>
								))}
							</select>
							<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
								<svg
									className="h-4 w-4 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M19 9l-7 7-7-7"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
									/>
								</svg>
							</div>
						</div>
					</div>
					<div className="flex flex-col text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
						<span>Lat: {selectedStation.latitude.toFixed(3)}</span>
						<span>Lng: {selectedStation.longitude.toFixed(3)}</span>
					</div>
				</div>

				{/* Legend */}
				<div className="flex items-center gap-6 flex-wrap mt-4">
					<div className="flex items-center gap-2">
						<div className="w-4 h-0.5 bg-blue-500"></div>
						<span className="text-sm text-gray-600">Train</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-0.5 bg-orange-500"></div>
						<span className="text-sm text-gray-600">Test</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-0.5 bg-green-500"></div>
						<span className="text-sm text-gray-600">Forecast</span>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-3 gap-4 mt-4">
					<div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
						<div className="text-2xl font-bold text-blue-600 mb-1">
							{trainData.length}
						</div>
						<div className="text-xs text-gray-600 font-medium">
							Historical Data
						</div>
					</div>
					<div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
						<div className="text-2xl font-bold text-orange-600 mb-1">
							{testData.length}
						</div>
						<div className="text-xs text-gray-600 font-medium">
							Validation Data
						</div>
					</div>
					<div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
						<div className="text-2xl font-bold text-green-600 mb-1">
							{forecastData.length}
						</div>
						<div className="text-xs text-gray-600 font-medium">
							Predicted Data
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				<div className="h-80 w-full">
					<ResponsiveContainer height="100%" width="100%">
						<LineChart
							data={chartData}
							margin={{ top: 10, right: 20, left: 20, bottom: 60 }}
						>
							<CartesianGrid
								stroke="rgba(148, 163, 184, 0.1)"
								strokeDasharray="3 3"
							/>
							<XAxis
								dataKey="day"
								domain={[25, 32.5]}
								stroke="#64748b"
								tick={{ fontSize: 11 }}
								tickFormatter={(value) => `Day ${Math.floor(value)}`}
							/>
							<YAxis
								domain={[0, 600]}
								stroke="#64748b"
								tick={{ fontSize: 11 }}
								label={{
									value: "River Discharge (m³/s)",
									angle: -90,
									position: "insideLeft",
								}}
							/>
							<Tooltip content={<CustomTooltip />} />

							{/* Train data */}
							{showTrain && (
								<Line
									connectNulls={false}
									dataKey="trainValue"
									dot={false}
									name="Train"
									stroke="#3b82f6"
									strokeWidth={2}
									type="monotone"
								/>
							)}

							{/* Test data */}
							{showTest && (
								<Line
									connectNulls={false}
									dataKey="testValue"
									dot={false}
									name="Test"
									stroke="#f97316"
									strokeWidth={2}
									type="monotone"
								/>
							)}

							{/* Forecast data */}
							{showForecast && (
								<Line
									connectNulls={false}
									dataKey="forecastValue"
									dot={false}
									name="Forecast"
									stroke="#22c55e"
									strokeWidth={2}
									type="monotone"
								/>
							)}

							{/* Reference lines to separate sections */}
							<ReferenceLine
								stroke="#94a3b8"
								strokeDasharray="2 2"
								strokeOpacity={0.5}
								x={28.5}
							/>
							<ReferenceLine
								stroke="#94a3b8"
								strokeDasharray="2 2"
								strokeOpacity={0.5}
								x={30.5}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
};
