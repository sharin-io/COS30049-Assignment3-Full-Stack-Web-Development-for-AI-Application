import React from "react";
import { Card } from "./ui/card";
import { MapPin, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { AQIData } from "../types/aqi.types";
import { getAQICategory, getAQIColorByValue } from "../utils/aqiUtils";

interface FeaturedCitiesProps {
  locations: AQIData[];
}

interface CityDisplayData {
  city: string;
  country: string;
  aqi: number;
  mainPollutant: string;
}

export const FeaturedCities: React.FC<FeaturedCitiesProps> = ({ locations }) => {
  // Default featured cities if locations are empty - 6 Southeast Asian countries
  const defaultCities: CityDisplayData[] = [
    { city: "Kuala Lumpur", country: "Malaysia", aqi: 65, mainPollutant: "PM2.5" },
    { city: "Bangkok", country: "Thailand", aqi: 75, mainPollutant: "PM10" },
    { city: "Singapore", country: "Singapore", aqi: 55, mainPollutant: "PM2.5" },
    { city: "Jakarta", country: "Indonesia", aqi: 85, mainPollutant: "PM2.5" },
    { city: "Manila", country: "Philippines", aqi: 70, mainPollutant: "PM2.5" },
    { city: "Ho Chi Minh City", country: "Vietnam", aqi: 80, mainPollutant: "PM10" },
  ];

  // Normalize locations to CityDisplayData format
  const normalizedLocations: CityDisplayData[] = locations.map((loc) => ({
    city: loc.city,
    country: loc.country,
    aqi: loc.aqi,
    mainPollutant: loc.mainPollutant,
  }));

  const featuredCities: CityDisplayData[] = normalizedLocations.length > 0 
    ? normalizedLocations.slice(0, 6)
    : defaultCities;

  const getTrend = (_city: CityDisplayData) => {
    // Mock trend calculation - in real app, you'd compare with previous data
    const random = Math.random();
    if (random > 0.6) {
      return { direction: "up" as const, value: Math.floor(Math.random() * 10) + 1 };
    } else if (random > 0.3) {
      return { direction: "down" as const, value: Math.floor(Math.random() * 10) + 1 };
    }
    return { direction: "stable" as const, value: 0 };
  };

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-gray-900 dark:text-white mb-2 text-2xl">
          Featured Cities Across Southeast Asia
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Quick glance at air quality in major cities across Malaysia, Thailand, Singapore, Indonesia, Philippines, and Vietnam
        </p>
      </div>

      {/* Cities Grid - 3 columns per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredCities.map((city, index) => {
          const trend = getTrend(city);

          return (
            <div
              key={`${city.city}-${index}`}
              className="bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 border border-slate-200 dark:border-gray-600 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              {/* City Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <h3 className="text-gray-900 dark:text-white font-semibold text-base">
                      {city.city}
                    </h3>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {city.country}
                  </p>
                </div>
              </div>

              {/* AQI Display */}
              <div className="mb-4">
                <div
                  className="inline-flex items-center justify-center w-full rounded-xl p-4 mb-3 shadow-md"
                  style={{ backgroundColor: `${getAQIColorByValue(city.aqi ?? 0)}15` }}
                >
                  <div className="text-center">
                    <div
                      className="text-4xl font-bold mb-1"
                      style={{ color: getAQIColorByValue(city.aqi ?? 0) }}
                    >
                      {city.aqi ?? 'N/A'}
                    </div>
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      AQI
                    </div>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="text-center">
                  <span
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-white shadow-md"
                    style={{ backgroundColor: getAQIColorByValue(city.aqi ?? 0) }}
                  >
                    {getAQICategory(city.aqi ?? 0)}
                  </span>
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="flex items-center justify-center gap-1.5 text-xs">
                {trend.direction === "up" && (
                  <>
                    <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-red-500">+{trend.value} from yesterday</span>
                  </>
                )}
                {trend.direction === "down" && (
                  <>
                    <TrendingDown className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500">-{trend.value} from yesterday</span>
                  </>
                )}
                {trend.direction === "stable" && (
                  <>
                    <Minus className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-500 dark:text-gray-400">No change</span>
                  </>
                )}
              </div>

              {/* Main Pollutant */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Main Pollutant: <span className="text-gray-900 dark:text-gray-100 font-semibold">{city.mainPollutant}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <div className="text-center">
          <div className="text-2xl text-[#4CAF50] mb-1 font-bold">
            {featuredCities.filter((c) => {
              const aqi = c.aqi ?? 0;
              return !isNaN(aqi) && isFinite(aqi) && aqi <= 50;
            }).length}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Good</p>
        </div>
        <div className="text-center border-l border-r border-blue-200 dark:border-blue-700">
          <div className="text-2xl text-[#FFEB3B] mb-1 font-bold">
            {featuredCities.filter((c) => {
              const aqi = c.aqi ?? 0;
              return !isNaN(aqi) && isFinite(aqi) && aqi > 50 && aqi <= 100;
            }).length}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Moderate</p>
        </div>
        <div className="text-center">
          <div className="text-2xl text-[#FF9800] mb-1 font-bold">
            {featuredCities.filter((c) => {
              const aqi = c.aqi ?? 0;
              return !isNaN(aqi) && isFinite(aqi) && aqi > 100;
            }).length}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Unhealthy+</p>
        </div>
      </div>
    </Card>
  );
};

