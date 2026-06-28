"use client";

import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Loader,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";

// Define types for OpenWeatherMap API responses
interface WeatherData {
  currentTemp: number;
  tomorrowTemp: number;
  condition: string;
  location: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface OpenWeatherMapResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  name: string;
  wind: {
    speed: number;
  };
  cod?: number;
  message?: string;
}

interface ForecastList {
  dt: number;
  main: {
    temp: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

interface ForecastResponse {
  list: ForecastList[];
  cod?: number;
  message?: string;
}

// Function to get city from coordinates using OpenStreetMap Nominatim
const getCityFromCoords = async (lat: number, lon: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
    );
    const data = await response.json();
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      "Unknown"
    );
  } catch (error) {
    console.error("Error getting city from coordinates:", error);
    return "Unknown";
  }
};

// Get a clean city name for API calls
const getCleanCityName = (cityName: string): string => {
  // Remove "City of", "Metropolitan Municipality", etc.
  const cleanName = cityName
    .replace(/City of /i, "")
    .replace(/Metropolitan Municipality/i, "")
    .replace(/Local Municipality/i, "")
    .replace(/District Municipality/i, "")
    .trim();

  // If city name is too long or complex, use a simplified version
  if (cleanName.includes("Ekurhuleni")) {
    return "Johannesburg"; // Use nearest major city
  }

  return cleanName || "London";
};

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        let city = "London"; // Default fallback city
        let originalCityName = "";

        // Try to get user's location
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>(
              (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  timeout: 10000,
                  enableHighAccuracy: true,
                });
              },
            );

            const { latitude, longitude } = position.coords;
            const cityName = await getCityFromCoords(latitude, longitude);

            if (cityName && cityName !== "Unknown") {
              originalCityName = cityName;
              city = getCleanCityName(cityName);
              setLocationPermission(true);
            }
          } catch (err) {
            console.log("Geolocation error:", err);
            setLocationPermission(false);
          }
        } else {
          setLocationPermission(false);
        }

        // Fetch weather data from OpenWeatherMap
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

        if (!apiKey) {
          console.error("OpenWeatherMap API key is missing");
          setWeather({
            currentTemp: 22,
            tomorrowTemp: 20,
            condition: "Clear",
            location: city || "Unknown",
            feelsLike: 22,
            humidity: 50,
            windSpeed: 10,
            icon: "01d",
          });
          setLoading(false);
          return;
        }

        // Try to fetch weather with fallback cities if needed
        let currentData: OpenWeatherMapResponse | null = null;
        let forecastData: ForecastResponse | null = null;
        const citiesToTry = [city, "Johannesburg", "Cape Town", "London"];

        for (const tryCity of citiesToTry) {
          try {
            const currentResponse = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(tryCity)}&units=metric&appid=${apiKey}`,
            );

            if (currentResponse.ok) {
              currentData = await currentResponse.json();

              // Also fetch forecast
              const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(tryCity)}&units=metric&appid=${apiKey}`,
              );

              if (forecastResponse.ok) {
                forecastData = await forecastResponse.json();
              }
              break;
            }
          } catch (err) {
            console.log(`Failed to fetch for ${tryCity}:`, err);
          }
        }

        if (!currentData) {
          // If all cities fail, use fallback mock data
          console.warn("All weather API calls failed, using mock data");
          setWeather({
            currentTemp: 22,
            tomorrowTemp: 20,
            condition: "Clear",
            location: originalCityName || city || "Unknown",
            feelsLike: 22,
            humidity: 50,
            windSpeed: 10,
            icon: "01d",
          });
          setLoading(false);
          return;
        }

        // Safely extract tomorrow's forecast
        let tomorrowTemp = Math.round(currentData.main.temp + 2);
        if (forecastData && forecastData.list && forecastData.list.length > 0) {
          const today = new Date();
          const tomorrowDate = new Date(today);
          tomorrowDate.setDate(tomorrowDate.getDate() + 1);

          // Find tomorrow's forecast (noon-ish)
          const tomorrowForecast = forecastData.list.find(
            (item: ForecastList) => {
              const itemDate = new Date(item.dt * 1000);
              return (
                itemDate.getDate() === tomorrowDate.getDate() &&
                itemDate.getMonth() === tomorrowDate.getMonth() &&
                itemDate.getFullYear() === tomorrowDate.getFullYear() &&
                itemDate.getHours() >= 12 &&
                itemDate.getHours() <= 15
              );
            },
          );

          if (tomorrowForecast) {
            tomorrowTemp = Math.round(tomorrowForecast.main.temp);
          }
        }

        // Extract weather data
        setWeather({
          currentTemp: Math.round(currentData.main.temp),
          tomorrowTemp: tomorrowTemp,
          condition: currentData.weather?.[0]?.description || "Clear",
          location: originalCityName || currentData.name || city || "Unknown",
          feelsLike: Math.round(currentData.main.feels_like),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind?.speed * 3.6 || 0),
          icon: currentData.weather?.[0]?.icon || "01d",
        });
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError("Could not fetch weather");
        // Fallback to mock data
        setWeather({
          currentTemp: 22,
          tomorrowTemp: 20,
          condition: "Clear",
          location: "Unknown",
          feelsLike: 22,
          humidity: 50,
          windSpeed: 10,
          icon: "01d",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // Get the appropriate weather icon based on OpenWeatherMap icon code
  const getWeatherIcon = (iconCode: string, condition: string) => {
    if (iconCode) {
      const code = iconCode.substring(0, 2);
      if (code === "01" || code === "02") {
        return <Sun className="h-5 w-5" />;
      } else if (code === "03" || code === "04") {
        return <Cloud className="h-5 w-5" />;
      } else if (code === "09" || code === "10") {
        return <CloudRain className="h-5 w-5" />;
      } else if (code === "11") {
        return <CloudRain className="h-5 w-5" />;
      } else if (code === "13") {
        return <CloudSnow className="h-5 w-5" />;
      } else if (code === "50") {
        return <Wind className="h-5 w-5" />;
      }
    }

    const cond = condition.toLowerCase();
    if (
      cond.includes("rain") ||
      cond.includes("drizzle") ||
      cond.includes("shower")
    ) {
      return <CloudRain className="h-5 w-5" />;
    } else if (cond.includes("snow") || cond.includes("sleet")) {
      return <CloudSnow className="h-5 w-5" />;
    } else if (
      cond.includes("cloud") ||
      cond.includes("overcast") ||
      cond.includes("fog") ||
      cond.includes("mist")
    ) {
      return <Cloud className="h-5 w-5" />;
    } else if (
      cond.includes("wind") ||
      cond.includes("storm") ||
      cond.includes("gust")
    ) {
      return <Wind className="h-5 w-5" />;
    } else {
      return <Sun className="h-5 w-5" />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2 font-serif">
        <Loader className="h-5 w-5 animate-spin" />
        <span className="text-gray-500 text-sm">Loading weather...</span>
      </div>
    );
  }

  // Show error or fallback
  if (error || !weather) {
    return (
      <div className="flex items-center gap-2 font-serif">
        <Sun className="h-5 w-5" />
        <span>22°C</span>
        <span className="text-gray-600">|</span>
        <Cloud className="h-5 w-5" />
        <span>Tomorrow: 20°C</span>
        {locationPermission === false && (
          <span className="text-xs text-gray-400 ml-1 hidden sm:inline">
            (Default)
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 font-serif">
      {getWeatherIcon(weather.icon, weather.condition)}
      <span title={`Feels like ${weather.feelsLike}°C`}>
        {weather.currentTemp}°C
      </span>
      <span className="text-gray-600">|</span>
      <Cloud className="h-5 w-5" />
      <span>Tomorrow: {weather.tomorrowTemp}°C</span>

      {/* Location with pin icon */}
      <span className="text-xs text-gray-500 ml-1 hidden sm:flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        {weather.location}
      </span>

      {/* Weather details tooltip */}
      <div className="relative group hidden md:block">
        <span className="text-xs text-gray-400 cursor-help ml-1">ⓘ</span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-white border border-gray-200 shadow-lg p-3 rounded-md min-w-[150px] z-10">
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Feels like:</span>
              <span className="font-semibold">{weather.feelsLike}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Humidity:</span>
              <span className="font-semibold">{weather.humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wind:</span>
              <span className="font-semibold">{weather.windSpeed} km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Condition:</span>
              <span className="font-semibold capitalize">
                {weather.condition}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
