import type { WeatherStation, WeatherData } from "@/types/weather";

// Type definition for weather station info JSON structure
interface WeatherStationInfo {
	"station name": string;
	lat: number;
	long: number;
	Population?: number | null;
	NearestFireStation?: string;
	NearestHospital?: string;
	HighwayEscape?: string;
}

// Type definition for OpenWeatherMap API response
interface OpenWeatherMapResponse {
	main?: {
		temp?: number;
		feels_like?: number;
		temp_min?: number;
		temp_max?: number;
		humidity?: number;
		pressure?: number;
	};
	wind?: {
		speed?: number;
		deg?: number;
	};
	rain?: {
		"1h"?: number;
	};
	snow?: {
		"1h"?: number;
	};
	visibility?: number;
	clouds?: {
		all?: number; // cloudiness percentage
	};
	sys?: {
		sunrise?: number;
		sunset?: number;
	};
	weather?: Array<{
		main?: string;
		description?: string;
		icon?: string;
	}>;
	dt?: number; // timestamp
}

// Parse weather stations from JSON file instead of CSV
export async function parseWeatherStationsFromJSON(): Promise<
	Array<WeatherStation>
> {
	try {
		const response = await fetch("/weather_station_info.json");
		if (!response.ok) {
			throw new Error(
				`Failed to fetch weather station info: ${response.status}`
			);
		}

		const jsonData = (await response.json()) as Array<WeatherStationInfo>;
		const stations: Array<WeatherStation> = [];

		for (let index = 0; index < jsonData.length; index++) {
			const stationData = jsonData[index];

			// Skip if stationData is undefined or has invalid entries
			if (
				!stationData ||
				!stationData["station name"] ||
				typeof stationData.lat !== "number" ||
				typeof stationData.long !== "number" ||
				stationData.lat === 0 ||
				stationData.long === 0
			) {
				continue;
			}

			stations.push({
				id: `ws_${index + 1}`, // Generate unique ID
				name: stationData["station name"],
				latitude: stationData.lat,
				longitude: stationData.long,
				state: "WA", // All stations in WA
				population: stationData.Population || null,
				nearestFireStation: stationData.NearestFireStation || "Unknown",
				nearestHospital: stationData.NearestHospital || "Unknown",
				highwayEscape: stationData.HighwayEscape || "Unknown",
				district: "0", // Default district
			});
		}

		console.log(`Loaded ${stations.length} weather stations from JSON`);
		return stations;
	} catch (error) {
		console.error("Error parsing weather stations JSON:", error);
		return [];
	}
}

// Legacy function for backward compatibility
export async function parseWeatherStationsFromCSV(): Promise<
	Array<WeatherStation>
> {
	return parseWeatherStationsFromJSON();
}

// Weather API service using OpenWeatherMap
const OPENWEATHER_API_KEY =
	import.meta.env["VITE_OPENWEATHER_API_KEY"] || "demo_key";

// Helper function to retry API calls with exponential backoff
async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	baseDelay: number = 1000
): Promise<T | null> {
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			if (attempt === maxRetries - 1) {
				throw error;
			}

			const delay = baseDelay * Math.pow(2, attempt);
			console.warn(
				`API call failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`
			);
			await new Promise((resolve) => {
				setTimeout(resolve, delay);
			});
		}
	}
	return null;
}

export async function getWeatherDataFromAPI(
	latitude: number,
	longitude: number
): Promise<WeatherData | null> {
	try {
		// Check if we have a valid API key
		if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "demo_key") {
			console.warn(
				"No valid OpenWeatherMap API key found. Please set VITE_OPENWEATHER_API_KEY in your environment variables."
			);
			return null;
		}

		const fetchWeatherData = async () => {
			// Fetch current weather and UV index in parallel
			const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
			const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`;

			const [weatherResponse, uvResponse] = await Promise.allSettled([
				fetch(weatherUrl, {
					method: "GET",
					headers: { Accept: "application/json" },
				}),
				fetch(uvUrl, {
					method: "GET",
					headers: { Accept: "application/json" },
				})
			]);

			// Handle weather response
			if (weatherResponse.status === 'rejected' || !weatherResponse.value.ok) {
				const status = weatherResponse.status === 'fulfilled' ? weatherResponse.value.status : 500;
				if (status === 401) {
					console.error("Invalid API key for OpenWeatherMap. Please check your VITE_OPENWEATHER_API_KEY.");
				} else if (status === 429) {
					console.error("API rate limit exceeded. Please wait before making more requests.");
				} else if (status === 404) {
					console.error(`No weather data found for coordinates: ${latitude}, ${longitude}`);
				}
				throw new Error(`Weather API request failed: ${status}`);
			}

			const weatherData = await weatherResponse.value.json() as OpenWeatherMapResponse;
			let uvData = null;
			
			// Handle UV response (optional, don't fail if UV data is unavailable)
			if (uvResponse.status === 'fulfilled' && uvResponse.value.ok) {
				try {
					uvData = await uvResponse.value.json() as { value?: number };
				} catch (error) {
					console.warn('Failed to parse UV data:', error);
				}
			}

			return { weather: weatherData, uv: uvData };
		};

		const result = await retryWithBackoff(fetchWeatherData, 3, 1000);
		if (!result) {
			return null;
		}

		const data = result.weather;
		const uvData = result.uv;

		const currentDate =
			new Date().toISOString().split("T")[0] || new Date().toDateString();
		const currentTime =
			new Date().toTimeString().split(" ")[0] || new Date().toTimeString();

		// Helper function to format time
		const formatTime = (timestamp: number) => {
			return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
				hour12: false, 
				hour: '2-digit', 
				minute: '2-digit' 
			});
		};

		// Calculate dew point (approximation)
		const calculateDewPoint = (temp: number, humidity: number) => {
			const a = 17.27;
			const b = 237.7;
			const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
			return Math.round(((b * alpha) / (a - alpha)) * 10) / 10;
		};

		const temp = data.main?.temp || 0;
		const humidity = data.main?.humidity || 0;

		return {
			stationId: `api_${latitude}_${longitude}`,
			date: currentDate,
			time: currentTime,
			temperature: Math.round(temp * 10) / 10,
			humidity: Math.round(humidity),
			pressure: Math.round(data.main?.pressure || 0),
			windSpeed: Math.round((data.wind?.speed || 0) * 10) / 10,
			windDirection: data.wind?.deg ? `${Math.round(data.wind.deg)}°` : "N/A",
			precipitation: Math.round((data.rain?.["1h"] || data.snow?.["1h"] || 0) * 10) / 10,
			visibility: data.visibility ? Math.round((data.visibility / 1000) * 10) / 10 : 0,
			conditions: data.weather?.[0]?.description || "Unknown",
			// Extended data
			feelsLike: data.main?.feels_like ? Math.round(data.main.feels_like * 10) / 10 : undefined,
			tempMin: data.main?.temp_min ? Math.round(data.main.temp_min * 10) / 10 : undefined,
			tempMax: data.main?.temp_max ? Math.round(data.main.temp_max * 10) / 10 : undefined,
			cloudiness: data.clouds?.all || 0,
			uvIndex: uvData?.value ? Math.round(uvData.value * 10) / 10 : undefined,
			dewPoint: humidity > 0 ? calculateDewPoint(temp, humidity) : undefined,
			sunrise: data.sys?.sunrise ? formatTime(data.sys.sunrise) : undefined,
			sunset: data.sys?.sunset ? formatTime(data.sys.sunset) : undefined,
			weatherIcon: data.weather?.[0]?.icon || undefined,
			weatherMain: data.weather?.[0]?.main || undefined,
		};
	} catch (error) {
		console.error("Error fetching weather data from API:", error);
		return null;
	}
}

// Function to fetch weather data for a specific station (with API fallback)
export async function getWeatherDataForStation(
	stationId: string
): Promise<WeatherData | null> {
	try {
		// First try to get data from CSV
		const response = await fetch("/weather_data.csv");
		if (response.ok) {
			const csvText = await response.text();
			const lines = csvText.split("\n");

			if (lines.length >= 2) {
				// Find data for the specific station
				for (let index = 1; index < lines.length; index++) {
					const line = lines[index]?.trim();
					if (!line) continue;

					const values = line.split(",");
					const csvStationId = values[0]?.trim();

					if (csvStationId === stationId) {
						const defaultDate =
							new Date().toISOString().split("T")[0] ||
							new Date().toDateString();
						const defaultTime =
							new Date().toTimeString().split(" ")[0] ||
							new Date().toTimeString();

						return {
							stationId: csvStationId,
							date: values[1]?.trim() || defaultDate,
							time: values[2]?.trim() || defaultTime,
							temperature: parseFloat(values[3]?.trim() || "0"),
							humidity: parseFloat(values[4]?.trim() || "0"),
							pressure: parseFloat(values[5]?.trim() || "0"),
							windSpeed: parseFloat(values[6]?.trim() || "0"),
							windDirection: values[7]?.trim() || "N/A",
							precipitation: parseFloat(values[8]?.trim() || "0"),
							visibility: parseFloat(values[9]?.trim() || "0"),
							conditions: values[10]?.trim() || "Unknown",
						};
					}
				}
			}
		}

		return null;
	} catch (error) {
		console.error("Error fetching weather data:", error);
		return null;
	}
}

// Function to get weather data for station with coordinates (using API first)
export async function getWeatherDataForStationWithCoords(
	stationId: string,
	latitude: number,
	longitude: number
): Promise<WeatherData | null> {
	// First try to get live data from API
	const apiData = await getWeatherDataFromAPI(latitude, longitude);
	if (apiData) {
		apiData.stationId = stationId; // Override with actual station ID
		return apiData;
	}

	// Fallback to CSV data if API fails
	const csvData = await getWeatherDataForStation(stationId);
	if (csvData) {
		return csvData;
	}

	return null;
}

// Function to get stations in a specific region or all stations
export function getStationsInRegion(
	stations: Array<WeatherStation>,
	bounds?: {
		north: number;
		south: number;
		east: number;
		west: number;
	}
): Array<WeatherStation> {
	if (!bounds) return stations;

	return stations.filter(
		(station) =>
			station.latitude <= bounds.north &&
			station.latitude >= bounds.south &&
			station.longitude <= bounds.east &&
			station.longitude >= bounds.west
	);
}
