import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type {
	WeatherStation,
	WeatherData,
	RiverStation,
	RiverData,
	Station,
} from "@/types/weather";
import {
	parseWeatherStationsFromJSON,
	getWeatherDataForStationWithCoords,
} from "@/data/weatherStationParser";
import { getRiverStations, getRiverDataForStation } from "@/data/riverData";

interface StationListProps {
	selectedStationId?: string;
	onStationSelect?: (station: Station) => void;
	searchQuery?: string;
	onFilterTypeChange?: (filterType: "all" | "weather" | "river") => void;
}

const ITEMS_PER_PAGE = 30;

export const WeatherStationList = ({
	selectedStationId,
	onStationSelect,
	searchQuery = "",
	onFilterTypeChange,
}: StationListProps) => {
	const [weatherStations, setWeatherStations] = useState<Array<WeatherStation>>(
		[]
	);
	const [riverStations, setRiverStations] = useState<Array<RiverStation>>([]);
	const [weatherData, setWeatherData] = useState<Map<string, WeatherData>>(
		new Map()
	);
	const [riverData, setRiverData] = useState<Map<string, RiverData>>(new Map());
	const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
	const [sortBy, setSortBy] = useState<"name" | "number" | "height">("name");
	const [filterStatus, setFilterStatus] = useState<"all" | "active" | "closed">(
		"all"
	);
	const [filterType, setFilterType] = useState<"all" | "weather" | "river">(
		"all"
	);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);

	// Combine stations into unified format
	const allStations = useMemo((): Array<Station> => {
		const weatherWithType = weatherStations.map((station) => ({
			...station,
			type: "weather" as const,
		}));
		const riverWithType = riverStations.map((station) => ({
			...station,
			type: "river" as const,
		}));
		return [...weatherWithType, ...riverWithType];
	}, [weatherStations, riverStations]);

	// Load stations and data on component mount
	useEffect(() => {
		const loadData = async () => {
			try {
				// Load weather stations from JSON
				const weatherStationsData = await parseWeatherStationsFromJSON();
				setWeatherStations(weatherStationsData);

				// Load river stations from CSV
				const riverStationsData = await getRiverStations();
				setRiverStations(riverStationsData);

				// Load weather data for weather stations (start with a reasonable batch)
				const weatherMap = new Map<string, WeatherData>();
				const loadWeatherDataBatch = async (
					stations: Array<WeatherStation>,
					batchSize = 10
				) => {
					for (let index = 0; index < stations.length; index += batchSize) {
						const batch = stations.slice(index, index + batchSize);
						const promises = batch.map(async (station) => {
							try {
								const data = await getWeatherDataForStationWithCoords(
									station.id,
									station.latitude,
									station.longitude
								);
								if (data) {
									return { stationId: station.id, data };
								}
							} catch (error) {
								console.error(
									`Failed to load weather data for station ${station.id}:`,
									error
								);
							}
							return null;
						});

						const results = await Promise.allSettled(promises);
						results.forEach((result) => {
							if (result.status === "fulfilled" && result.value) {
								weatherMap.set(result.value.stationId, result.value.data);
								setWeatherData(new Map(weatherMap)); // Update state after each batch
							}
						});

						// Small delay between batches to avoid overwhelming the API
						if (index + batchSize < stations.length) {
							await new Promise((resolve) => {
								setTimeout(resolve, 500);
							});
						}
					}
				};

				// Start loading weather data in background with API priority
				console.log(
					"Starting to load weather data from API for weather stations..."
				);
				void loadWeatherDataBatch(weatherStationsData.slice(0, 30)); // Load first 30 stations to avoid rate limits

				// Load river data for first few river stations
				const riverMap = new Map<string, RiverData>();
				for (const station of riverStationsData.slice(0, 5)) {
					try {
						const data = await getRiverDataForStation(station.id);
						if (data) {
							riverMap.set(station.id, data);
						}
					} catch (error) {
						console.error(
							`Failed to load river data for station ${station.id}:`,
							error
						);
					}
				}
				setRiverData(riverMap);

				setLoading(false);
			} catch (error) {
				console.error("Failed to load station data:", error);
				setLoading(false);
			}
		};

		void loadData();
	}, []);

	// Update local search when prop changes
	useEffect(() => {
		setLocalSearchQuery(searchQuery);
		setCurrentPage(1); // Reset page when search changes
	}, [searchQuery]);

	// Reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [sortBy, filterStatus, filterType, localSearchQuery]);

	// Filter and sort stations
	const filteredStations = useMemo(() => {
		const filtered = allStations.filter((station) => {
			if (!station.name) return false;

			const matchesSearch =
				station.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
				(station.stationNumber &&
					station.stationNumber.includes(localSearchQuery));

			let matchesStatus = true;
			if (filterStatus === "active") {
				matchesStatus = !station.closeDate || station.closeDate === "Active";
			} else if (filterStatus === "closed") {
				matchesStatus = Boolean(
					station.closeDate && station.closeDate !== "Active"
				);
			}

			let matchesType = true;
			if (filterType === "weather") {
				matchesType = station.type === "weather";
			} else if (filterType === "river") {
				matchesType = station.type === "river";
			}

			return matchesSearch && matchesStatus && matchesType;
		});

		// Sort stations
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "name":
					return a.name.localeCompare(b.name);
				case "number":
					return (a.stationNumber || "").localeCompare(b.stationNumber || "");
				case "height":
					return (a.height || 0) - (b.height || 0);
				default:
					return 0;
			}
		});

		return filtered;
	}, [allStations, localSearchQuery, sortBy, filterStatus, filterType]);

	// Paginated stations
	const paginatedStations = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredStations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
	}, [filteredStations, currentPage]);

	// Load weather data for currently visible weather stations
	const loadVisibleWeatherData = useCallback(
		async (stations: Array<Station>) => {
			const weatherStationsToLoad = stations
				.filter(
					(station) =>
						station.type === "weather" && !weatherData.has(station.id)
				)
				.slice(0, 10); // Limit to 10 concurrent requests

			if (weatherStationsToLoad.length === 0) return;

			const promises = weatherStationsToLoad.map(async (station) => {
				try {
					const data = await getWeatherDataForStationWithCoords(
						station.id,
						station.latitude,
						station.longitude
					);
					if (data) {
						return { stationId: station.id, data };
					}
				} catch (error) {
					console.error(
						`Failed to load weather data for station ${station.id}:`,
						error
					);
				}
				return null;
			});

			const results = await Promise.allSettled(promises);
			const newWeatherData = new Map(weatherData);
			let hasUpdates = false;

			results.forEach((result) => {
				if (result.status === "fulfilled" && result.value) {
					newWeatherData.set(result.value.stationId, result.value.data);
					hasUpdates = true;
				}
			});

			if (hasUpdates) {
				setWeatherData(newWeatherData);
			}
		},
		[weatherData]
	);

	// Load weather data for visible stations when paginated stations change
	useEffect(() => {
		void loadVisibleWeatherData(paginatedStations);
	}, [paginatedStations, loadVisibleWeatherData]);

	const totalPages = Math.ceil(filteredStations.length / ITEMS_PER_PAGE);

	const handleStationClick = (station: Station) => {
		if (onStationSelect) {
			onStationSelect(station);
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	if (loading) {
		return (
			<Card className="h-full max-h-[calc(100vh-200px)]">
				<CardContent className="p-6 flex items-center justify-center">
					<div className="text-center">
						<div className="text-sm text-muted-foreground">
							Loading station data...
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="card-modern-v2 h-full max-h-[calc(100vh-200px)] flex flex-col">
			<CardHeader className="pb-4 flex-shrink-0 px-4">
				<CardTitle className="text-xl font-semibold text-gray-900 mb-4">
					Monitoring Stations (WA)
				</CardTitle>
				<div className="space-y-3">
					<Input
						className="input-modern text-sm placeholder:text-gray-400 w-full"
						placeholder="Search station name or number..."
						value={localSearchQuery}
						onChange={(e) => {
							setLocalSearchQuery(e.target.value);
						}}
					/>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
						<Select
							value={sortBy}
							onValueChange={(value: "name" | "number" | "height") => {
								setSortBy(value);
							}}
						>
							<SelectTrigger className="input-modern text-xs font-medium w-full">
								<SelectValue placeholder="Sort by Name" />
							</SelectTrigger>
							<SelectContent className="card-modern-v2 border-0">
								<SelectItem className="hover:bg-blue-50" value="name">
									Sort by Name
								</SelectItem>
								<SelectItem className="hover:bg-blue-50" value="number">
									Sort by Number
								</SelectItem>
								<SelectItem className="hover:bg-blue-50" value="height">
									Sort by Height
								</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={filterStatus}
							onValueChange={(value: "all" | "active" | "closed") => {
								setFilterStatus(value);
							}}
						>
							<SelectTrigger className="input-modern text-xs font-medium w-full">
								<SelectValue placeholder="All Status" />
							</SelectTrigger>
							<SelectContent className="card-modern-v2 border-0">
								<SelectItem className="hover:bg-blue-50" value="all">
									All Status
								</SelectItem>
								<SelectItem className="hover:bg-blue-50" value="active">
									Active
								</SelectItem>
								<SelectItem className="hover:bg-blue-50" value="closed">
									Closed
								</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={filterType}
							onValueChange={(value: "all" | "weather" | "river") => {
								setFilterType(value);
								if (onFilterTypeChange) onFilterTypeChange(value);
							}}
						>
							<SelectTrigger className="input-modern text-xs font-medium w-full">
								<SelectValue placeholder="All Types" />
							</SelectTrigger>
							<SelectContent className="card-modern-v2 border-0">
								<SelectItem className="hover:bg-blue-50" value="all">
									All Types
								</SelectItem>
								<SelectItem className="hover:bg-blue-50" value="weather">
									Weather
								</SelectItem>
								<SelectItem className="hover:bg-blue-50" value="river">
									River
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardHeader>

			<CardContent className="flex-1 min-h-0 overflow-hidden p-0 flex flex-col">
				<div className="flex-1 overflow-y-auto">
					<div className="space-y-3 p-4 pt-0">
						{paginatedStations.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground text-sm">
								No matching stations found
							</div>
						) : (
							paginatedStations.map((station, index) => (
								<div
									key={station.id}
									className={`p-4 rounded-xl border cursor-pointer animate-card-hover backdrop-blur-sm card-entry transition-all duration-200 ${
										selectedStationId === station.id
											? "border-blue-300 bg-blue-50/90 shadow-lg ring-1 ring-blue-200"
											: "border-gray-200 bg-white/80 hover:border-gray-300 hover:shadow-sm"
									} ${index < 4 ? `animate-delay-${index * 100 + 100}` : ""}`}
									onClick={() => {
										handleStationClick(station);
									}}
								>
									{/* Header row with name, type badge, and status */}
									<div className="flex items-start justify-between mb-3 gap-2">
										<div className="flex items-baseline gap-1.5 flex-1 min-w-0">
											<h4 className="font-semibold text-sm text-gray-900 truncate leading-tight">
												{station.name.replace(/\s+at\s+.+$/i, "")}
											</h4>
											<Badge
												variant="outline"
												className={`text-xs font-medium shrink-0 px-1.5 py-0.5 whitespace-nowrap ${
													station.type === "weather"
														? "bg-sky-50 border-sky-200 text-sky-700"
														: "bg-emerald-50 border-emerald-200 text-emerald-700"
												}`}
											>
												{station.type === "weather" ? "🌤️" : "🌊"}
											</Badge>
										</div>
										<Badge
											variant="outline"
											className={`text-xs font-medium shrink-0 px-1.5 py-0.5 whitespace-nowrap ${
												!station.closeDate || station.closeDate === "Active"
													? "bg-green-50 border-green-200 text-green-700"
													: "bg-red-50 border-red-200 text-red-700"
											}`}
										>
											{!station.closeDate || station.closeDate === "Active"
												? "Active"
												: "Closed"}
										</Badge>
									</div>

									{/* Info section - different for weather vs river stations */}
									{station.type === "weather" ? (
										// For weather stations, show minimal technical info
										<div className="mb-3">
											<div className="text-xs text-gray-500">
												<span>
													📍 {station.latitude.toFixed(2)}°,{" "}
													{station.longitude.toFixed(2)}°
												</span>
												{station.height && (
													<span className="ml-3">
														⛰️ {station.height}m elevation
													</span>
												)}
											</div>
										</div>
									) : (
										// For river stations, show detailed info
										<>
											<div className="mb-3">
												<div className="grid grid-cols-2 gap-3 text-xs mb-2">
													<div>
														<span className="text-gray-500">Station:</span>
														<span className="font-medium text-gray-700 ml-1">
															#{station.stationNumber}
														</span>
													</div>
													<div>
														<span className="text-gray-500">Height:</span>
														<span className="font-medium text-gray-700 ml-1">
															{station.height || "N/A"}m
														</span>
													</div>
												</div>
											</div>

											<div className="mb-3 space-y-1">
												<div className="text-xs">
													<span className="text-gray-500">River:</span>
													<span className="font-medium text-gray-700 ml-1">
														{(station as RiverStation).riverName}
													</span>
													<span className="text-gray-400 mx-2">•</span>
													<span className="text-gray-500">Catchment:</span>
													<span className="font-medium text-gray-700 ml-1">
														{(
															station as RiverStation
														).catchmentArea.toLocaleString()}{" "}
														km²
													</span>
												</div>
												<div className="text-xs">
													<span className="text-gray-500">Coordinates:</span>
													<span className="font-medium text-gray-700 ml-1 font-mono">
														{station.latitude.toFixed(3)}°,{" "}
														{station.longitude.toFixed(3)}°
													</span>
												</div>
											</div>
										</>
									)}

									{/* Data display - weather or river */}
									{station.type === "weather" &&
										(weatherData.has(station.id) ? (
											<div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
												<div className="grid grid-cols-3 gap-3 text-xs">
													<div className="text-center">
														<div className="font-bold text-blue-600 text-sm leading-tight">
															{weatherData.get(station.id)!.temperature}°C
														</div>
														<div className="text-blue-500 mt-1">
															Temperature
														</div>
													</div>
													<div className="text-center">
														<div className="font-bold text-cyan-600 text-sm leading-tight">
															{weatherData.get(station.id)!.humidity}%
														</div>
														<div className="text-cyan-500 mt-1">Humidity</div>
													</div>
													<div className="text-center">
														<div
															className="font-bold text-gray-600 text-sm leading-tight truncate"
															title={weatherData.get(station.id)!.conditions}
														>
															{weatherData.get(station.id)!.conditions}
														</div>
														<div className="text-gray-500 mt-1">Conditions</div>
													</div>
												</div>
												<div className="mt-2 text-xs text-gray-500 text-center">
													Last updated: {weatherData.get(station.id)!.time} •
													Live API data
												</div>
											</div>
										) : (
											<div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
												<div className="text-center text-xs text-gray-500">
													<div className="inline-flex items-center gap-1">
														<div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
														Loading weather data...
													</div>
												</div>
											</div>
										))}

									{station.type === "river" && riverData.has(station.id) && (
										<div className="mt-2 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
											<div className="grid grid-cols-3 gap-3 text-xs">
												<div className="text-center">
													<div className="font-bold text-emerald-600 text-sm leading-tight">
														{riverData.get(station.id)!.waterLevel.toFixed(1)}m
													</div>
													<div className="text-emerald-500 mt-1">
														Water Level
													</div>
												</div>
												<div className="text-center">
													<div className="font-bold text-teal-600 text-sm leading-tight">
														{riverData.get(station.id)!.flow.toFixed(1)}
													</div>
													<div className="text-teal-500 mt-1">Flow (m³/s)</div>
												</div>
												<div className="text-center">
													<div className="font-bold text-gray-600 text-sm leading-tight">
														{riverData.get(station.id)!.quality}
													</div>
													<div className="text-gray-500 mt-1">Quality</div>
												</div>
											</div>
										</div>
									)}
								</div>
							))
						)}
					</div>
				</div>

				{/* Pagination Controls */}
				{totalPages > 1 && (
					<div className="flex-shrink-0 p-2 pb-0 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
						<div className="flex items-center justify-between">
							<div className="text-xs font-medium text-gray-600">
								Page {currentPage} of {totalPages}
							</div>
							<div className="flex gap-1">
								<Button
									className="h-8 px-3 text-xs rounded-lg btn-spring"
									disabled={currentPage <= 1}
									size="sm"
									variant="outline"
									onClick={() => {
										handlePageChange(currentPage - 1);
									}}
								>
									←
								</Button>
								{Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
									const page =
										Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
										index;
									return (
										<Button
											key={page}
											size="sm"
											variant={page === currentPage ? "default" : "outline"}
											className={`h-8 px-3 text-xs min-w-8 rounded-lg btn-spring ${
												page === currentPage
													? "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
													: "hover:bg-blue-50"
											}`}
											onClick={() => {
												handlePageChange(page);
											}}
										>
											{page}
										</Button>
									);
								})}
								<Button
									className="h-8 px-3 text-xs rounded-lg btn-spring"
									disabled={currentPage >= totalPages}
									size="sm"
									variant="outline"
									onClick={() => {
										handlePageChange(currentPage + 1);
									}}
								>
									→
								</Button>
							</div>
						</div>
					</div>
				)}
			</CardContent>

			<div className="px-4 pt-3 border-t border-gray-100 bg-gray-50/40 text-xs font-medium text-gray-600 flex-shrink-0 backdrop-blur-sm">
				Showing {Math.min(filteredStations.length, ITEMS_PER_PAGE)} of{" "}
				{filteredStations.length} stations
				{filterType !== "all" && (
					<span className="ml-2">({filterType} stations only)</span>
				)}
			</div>
		</Card>
	);
};
