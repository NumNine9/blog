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
              city = cityName;
              setLocationPermission(true);
            }
          } catch (err) {
            console.log("Geolocation error:", err);
            setLocationPermission(false);
            // User denied or geolocation failed - use default city
          }
        } else {
          setLocationPermission(false);
        }

        // Fetch weather data from OpenWeatherMap
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

        if (!apiKey) {
          console.error(
            "OpenWeatherMap API key is missing. Add NEXT_PUBLIC_WEATHER_API_KEY to your .env.local",
          );
          // Fallback to mock data in Celsius
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

        // Fetch current weather (using metric units for Celsius)
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`,
        );

        if (!currentResponse.ok) {
          throw new Error(`Weather API error: ${currentResponse.status}`);
        }

        const currentData = await currentResponse.json();

        // Fetch 5-day forecast for tomorrow's temperature
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`,
        );

        if (!forecastResponse.ok) {
          throw new Error(`Forecast API error: ${forecastResponse.status}`);
        }

        const forecastData = await forecastResponse.json();

        // Get tomorrow's forecast (first entry for tomorrow)
        const tomorrow =
          forecastData.list?.find((item: any) => {
            const date = new Date(item.dt * 1000);
            const tomorrowDate = new Date();
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
            return (
              date.getDate() === tomorrowDate.getDate() && date.getHours() >= 12
            );
          }) ||
          forecastData.list?.[8] ||
          null;

        // Extract weather data (already in Celsius from units=metric)
        setWeather({
          currentTemp: Math.round(currentData.main.temp),
          tomorrowTemp: tomorrow
            ? Math.round(tomorrow.main.temp)
            : Math.round(currentData.main.temp + 2),
          condition: currentData.weather?.[0]?.description || "Clear",
          location: currentData.name || city || "Unknown",
          feelsLike: Math.round(currentData.main.feels_like),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
          icon: currentData.weather?.[0]?.icon || "01d",
        });
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError("Could not fetch weather");
        // Fallback to mock data in Celsius
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
    // Map OpenWeatherMap icon codes to Lucide icons
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

    // Fallback based on condition text
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
