import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { fetchClassification } from "../api/aqi";
import { Card } from "../components/ui/card";
import { Loader2, AlertCircle, Play, Pause, SkipBack, SkipForward, Calendar, Clock } from "lucide-react";
import * as d3 from "d3";

const categoryColors: Record<string, string> = {
  Good: "#4CAF50",
  Moderate: "#FFEB3B",
  Unhealthy: "#FFB74D",
  "Very Unhealthy": "#FF9800",
  Hazardous: "#F44336",
};

type CountryKey = "Malaysia" | "Thailand" | "Singapore";

interface GeoJSONFeature {
  type: string;
  properties: {
    name?: string;
    NAME_1?: string;
    Region?: string;
    [key: string]: any;
  };
  geometry: any;
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
  [key: string]: any;
}

const geoFiles: Record<CountryKey, string> = {
  Malaysia: "/geo/malaysia.geojson",
  Thailand: "/geo/thailand.geojson",
  Singapore: "/geo/singapore.geojson",
};

export const MapPage: React.FC = () => {
  const [allData, setAllData] = useState<any[]>([]);
  const [country, setCountry] = useState<CountryKey>("Malaysia");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingMap, setLoadingMap] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(500); // milliseconds per frame

  const svgRef = useRef<any>(null);
  const zoomRef = useRef<any>(null);
  const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Cache for fuzzy matching results to avoid recalculating
  const fuzzyMatchCache = useRef<Map<string, Map<string, string | null>>>(new Map());

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      setError(null);
      try {
        const classifier = await fetchClassification();
        if (!classifier || !Array.isArray(classifier) || classifier.length === 0) {
          throw new Error("No classification data received");
        }
        if (!classifier[0]?.org_data) {
          throw new Error("Invalid data structure received");
        }
        const items = classifier[0].org_data;
        setAllData(Array.isArray(items) ? items : []);
      } catch (e: any) {
        console.error("Failed to fetch classification:", e);
        setError(e.message || "Failed to load air quality data. Please try again later.");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  // Memoize filtered data by country for performance
  const countryData = useMemo(() => {
    if (allData.length === 0) return [];
    return allData.filter((d) => d.Country === country);
  }, [allData, country]);

  // Update available dates when country changes
  useEffect(() => {
    if (countryData.length === 0) {
      setAvailableDates([]);
      setSelectedDate("");
      return;
    }
    
    const dates = Array.from(new Set(countryData.map((d) => d.Date)))
      .filter((date) => date) // Filter out null/undefined dates
      .sort();
    
    setAvailableDates(dates);
    
    // Only update selectedDate if current date is not in the list
    if (dates.length > 0 && !dates.includes(selectedDate)) {
      setSelectedDate(dates[dates.length - 1]);
    } else if (dates.length === 0) {
      setSelectedDate("");
    }
  }, [countryData, country]); // Removed selectedDate from dependencies to avoid loops

  useEffect(() => {
    const loadGeo = async () => {
      setLoadingMap(true);
      setGeoData(null);
      setMapError(null);
      fuzzyMatchCache.current.clear(); // Clear cache when country changes
      
      try {
        const file = geoFiles[country];
        const geo = (await d3.json(file)) as GeoJSONData;
        
        if (!geo || !geo.features || !Array.isArray(geo.features)) {
          throw new Error(`Invalid GeoJSON file for ${country}`);
        }
        
        setGeoData(geo);
      } catch (e: any) {
        console.error("Failed to load geojson:", e);
        setMapError(`Failed to load map data for ${country}. ${e.message || "Please try again."}`);
      } finally {
        setLoadingMap(false);
      }
    };
    loadGeo();
  }, [country]);

  const getRegionName = (feature: any) => {
    const p = feature.properties || {};
    return p.name || p.NAME_1 || p.Region || "";
  };

  function normalize(str: string) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function similarity(a: string, b: string) {
    const A = new Set(a.split(""));
    const B = new Set(b.split(""));
    let inter = [...A].filter((x) => B.has(x));
    return inter.length / Math.max(A.size, B.size);
  }

  // Memoized fuzzy match function with caching
  const fuzzyMatch = useCallback((region: string, datasetRegions: string[]): string | null => {
    const cacheKey = `${country}-${selectedDate}`;
    
    if (!fuzzyMatchCache.current.has(cacheKey)) {
      fuzzyMatchCache.current.set(cacheKey, new Map());
    }
    
    const cache = fuzzyMatchCache.current.get(cacheKey)!;
    
    // Check cache first
    if (cache.has(region)) {
      return cache.get(region)!;
    }
    
    const clean = normalize(region);
    let best: string | null = null;
    let bestScore = 0;

    datasetRegions.forEach((dr) => {
      const score = similarity(clean, normalize(dr));
      if (score > bestScore) {
        bestScore = score;
        best = dr;
      }
    });

    const result = bestScore >= 0.6 ? best : null;
    cache.set(region, result);
    return result;
  }, [country, selectedDate]);

  // Memoize filtered rows for selected date
  const filteredRows = useMemo(() => {
    if (countryData.length === 0 || !selectedDate) return [];
    return countryData.filter((d) => d.Date === selectedDate);
  }, [countryData, selectedDate]);

  // Memoize AQI by region map
  const aqiByRegion = useMemo(() => {
    const map = new Map<string, { category: string; aqi: number }>();
    filteredRows.forEach((r) => {
      if (r.Region && r.AQI_Category && r.AQI !== null && r.AQI !== undefined) {
        map.set(r.Region, {
          category: r.AQI_Category,
          aqi: r.AQI,
        });
      }
    });
    return map;
  }, [filteredRows]);

  // Memoize region list
  const regionList = useMemo(() => {
    return filteredRows
      .filter((r) => r.Region && r.AQI !== null && r.AQI !== undefined)
      .map((r) => ({
        region: r.Region,
        aqi: r.AQI,
        category: r.AQI_Category || "Unknown",
      }))
      .sort((a, b) => (b.aqi as number) - (a.aqi as number)); // Sort by AQI descending
  }, [filteredRows]);

  // Playback animation effect
  useEffect(() => {
    if (isPlaying && availableDates.length > 0) {
      playbackIntervalRef.current = setInterval(() => {
        setSelectedDate((currentDate) => {
          const currentIndex = availableDates.indexOf(currentDate);
          if (currentIndex >= 0 && currentIndex < availableDates.length - 1) {
            return availableDates[currentIndex + 1];
          } else {
            // Loop back to start or stop at end
            setIsPlaying(false);
            return currentDate;
          }
        });
      }, playbackSpeed);

      return () => {
        if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current);
        }
      };
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
    }
  }, [isPlaying, playbackSpeed, availableDates]);

  // Render map
  useEffect(() => {
    if (!geoData || !selectedDate || filteredRows.length === 0) {
      // Clear map if no data
      const container = d3.select("#aqi-map");
      container.selectAll("*").remove();
      return;
    }

    const container = d3.select("#aqi-map");
    container.selectAll("*").remove();

    const width = 900;
    const height = 420;

    const svg = container
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "100%");

    svgRef.current = svg;
    const g = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));

    zoomRef.current = zoom;
    svg.call(zoom);

    try {
      const projection = d3.geoMercator().fitSize([width, height], geoData as any);
    const path = d3.geoPath().projection(projection);

      const datasetRegions = Array.from(aqiByRegion.keys());
    const features = geoData.features || [];

    g.selectAll("path")
      .data(features)
      .enter()
      .append("path")
      .attr("d", path as any)
      .attr("stroke", "#E5E7EB")
      .attr("stroke-width", 0.8)
      .attr("fill", (d: any) => {
        const regionName = getRegionName(d);
          if (!regionName) return "#9CA3AF";
          
          const match = fuzzyMatch(regionName, datasetRegions);
        const rec = match ? aqiByRegion.get(match) : null;
          return rec && categoryColors[rec.category] 
            ? categoryColors[rec.category] 
            : "#9CA3AF";
        })
        .style("cursor", "pointer")
        .on("mouseover", function() {
          d3.select(this).attr("stroke-width", 2).attr("stroke", "#1F2937");
        })
        .on("mouseout", function() {
          d3.select(this).attr("stroke-width", 0.8).attr("stroke", "#E5E7EB");
      })
      .append("title")
      .text((d: any) => {
        const regionName = getRegionName(d);
          if (!regionName) return "No region name";
          
          const match = fuzzyMatch(regionName, datasetRegions);
        const rec = match ? aqiByRegion.get(match) : null;

        if (!rec) return `${regionName}\nNo data for ${selectedDate}`;
        return `${match}\nAQI: ${rec.aqi}\nCategory: ${rec.category}`;
      });
    } catch (err) {
      console.error("Error rendering map:", err);
      setMapError("Error rendering map. Please try again.");
    }
  }, [geoData, filteredRows, selectedDate, aqiByRegion, fuzzyMatch]);

  const loading = loadingData || loadingMap;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Interactive Map
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore air quality monitoring stations across Southeast Asia
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-800 dark:text-red-300 font-semibold mb-1">Error Loading Data</h3>
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {mapError && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold mb-1">Map Loading Warning</h3>
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">{mapError}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          {["Malaysia", "Thailand", "Singapore"].map((c) => (
            <button
              key={c}
              onClick={() => setCountry(c as CountryKey)}
              className={`px-4 py-2 rounded-lg ${
                country === c
                  ? "bg-[#2196F3] text-white"
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Historical Data Indicator */}
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Historical Data Viewer</span>
            {availableDates.length > 0 && (
              <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                Available: {availableDates[0]} to {availableDates[availableDates.length - 1]}
              </span>
            )}
          </div>
        </div>

        {/* Timeline Slider Section */}
        {availableDates.length > 0 && (
          <Card className="p-4 mb-4 bg-white dark:bg-gray-800 shadow-lg">
            <div className="space-y-4">
              {/* Date Range Display */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Earliest:</span>
                  <span>{availableDates[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Latest:</span>
                  <span>{availableDates[availableDates.length - 1]}</span>
                </div>
              </div>

              {/* Timeline Slider */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max={availableDates.length - 1}
                    value={availableDates.indexOf(selectedDate) >= 0 ? availableDates.indexOf(selectedDate) : 0}
                    onChange={(e) => {
                      const index = parseInt(e.target.value);
                      setSelectedDate(availableDates[index]);
                      setIsPlaying(false); // Stop playback when manually changing
                    }}
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    disabled={loading || availableDates.length === 0}
                    style={{
                      background: `linear-gradient(to right, #2196F3 0%, #2196F3 ${availableDates.indexOf(selectedDate) >= 0 ? ((availableDates.indexOf(selectedDate) / (availableDates.length - 1 || 1)) * 100) : 0}%, #E5E7EB ${availableDates.indexOf(selectedDate) >= 0 ? ((availableDates.indexOf(selectedDate) / (availableDates.length - 1 || 1)) * 100) : 0}%, #E5E7EB 100%)`
                    }}
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[100px] text-right">
                    {selectedDate || "No date"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Date {availableDates.indexOf(selectedDate) + 1 || 0} of {availableDates.length}</span>
                  <span>{selectedDate}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Navigation Buttons */}
                <button
                  onClick={() => {
                    const index = availableDates.indexOf(selectedDate);
                    if (index > 0) {
                      setSelectedDate(availableDates[index - 1]);
                      setIsPlaying(false);
                    }
                  }}
                  disabled={loading || availableDates.indexOf(selectedDate) <= 0}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  aria-label="Previous date"
                >
                  <SkipBack className="h-4 w-4" />
                  <span className="text-sm">Prev</span>
                </button>

                {/* Play/Pause Button */}
                <button
                  onClick={() => {
                    if (isPlaying) {
                      setIsPlaying(false);
                    } else {
                      const currentIndex = availableDates.indexOf(selectedDate);
                      if (currentIndex >= availableDates.length - 1) {
                        setSelectedDate(availableDates[0]); // Start from beginning
                      }
                      setIsPlaying(true);
                    }
                  }}
                  disabled={loading || availableDates.length === 0}
                  className="px-4 py-1.5 rounded-lg bg-[#2196F3] text-white hover:bg-[#1976D2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  aria-label={isPlaying ? "Pause animation" : "Play animation"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span className="text-sm font-medium">{isPlaying ? "Pause" : "Play"}</span>
                </button>

                <button
                  onClick={() => {
                    const index = availableDates.indexOf(selectedDate);
                    if (index < availableDates.length - 1) {
                      setSelectedDate(availableDates[index + 1]);
                      setIsPlaying(false);
                    }
                  }}
                  disabled={loading || availableDates.indexOf(selectedDate) >= availableDates.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  aria-label="Next date"
                >
                  <span className="text-sm">Next</span>
                  <SkipForward className="h-4 w-4" />
                </button>

                {/* Jump Buttons */}
                <div className="flex gap-1 ml-auto">
                  <button
                    onClick={() => {
                      setSelectedDate(availableDates[0]);
                      setIsPlaying(false);
                    }}
                    disabled={loading || selectedDate === availableDates[0]}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    aria-label="Jump to earliest date"
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDate(availableDates[availableDates.length - 1]);
                      setIsPlaying(false);
                    }}
                    disabled={loading || selectedDate === availableDates[availableDates.length - 1]}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    aria-label="Jump to latest date"
                  >
                    Last
                  </button>
                </div>
              </div>

              {/* Playback Speed Control */}
              {isPlaying && (
                <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Speed:</span>
                  <div className="flex gap-2">
                    {[300, 500, 1000, 2000].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          playbackSpeed === speed
                            ? "bg-[#2196F3] text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {speed < 1000 ? `${speed}ms` : `${speed / 1000}s`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Picker (Collapsible) */}
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-[#2196F3] dark:hover:text-blue-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Select specific date</span>
                </summary>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Choose Date:
                  </label>
          <input
            type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            value={selectedDate}
                    min={availableDates[0] || undefined}
                    max={availableDates[availableDates.length - 1] || undefined}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setIsPlaying(false);
                    }}
                    disabled={loading || availableDates.length === 0}
          />
        </div>
              </details>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 items-stretch">

          <Card className="relative p-6 bg-white dark:bg-gray-800 shadow-lg lg:col-span-2 h-full flex flex-col">

            {/* FIXED ZOOM BUTTONS */}
            <div className="absolute top-4 right-4 space-y-2 z-50">
              <button
                className="w-8 h-8 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 shadow border flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                onClick={() => {
                  if (svgRef.current && zoomRef.current) {
                    const transition = d3.transition().duration(300);
                    svgRef.current.transition(transition).call(
                      zoomRef.current.scaleBy as any,
                      1.3
                    );
                  }
                }}
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                className="w-8 h-8 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 shadow border flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                onClick={() => {
                  if (svgRef.current && zoomRef.current) {
                    const transition = d3.transition().duration(300);
                    svgRef.current.transition(transition).call(
                      zoomRef.current.scaleBy as any,
                      1 / 1.3
                    );
                  }
                }}
                aria-label="Zoom out"
              >
                –
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center flex-1">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div
                id="aqi-map"
                className="w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[420px]"
              />
            )}

            <div className="mt-6 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg border w-full">
              <p className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-200">
                AQI Legend
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6">

                {/* Good */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#4CAF50" }}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Good (0–50)
                  </span>
                </div>

                {/* Moderate */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#FFEB3B" }}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Moderate (51–100)
                  </span>
                </div>

                {/* Unhealthy for Sensitive Groups */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#FFB74D" }}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Unhealthy for Sensitive Groups (101–150)
                  </span>
                </div>

                {/* Unhealthy */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#FF7043" }}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Unhealthy (151–200)
                  </span>
                </div>

                {/* Very Unhealthy */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#8E24AA" }}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Very Unhealthy (201–300)
                  </span>
                </div>

                {/* Hazardous */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#B71C1C" }}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Hazardous (301+)
                  </span>
                </div>

                {/* No Data (Grey) */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#9CA3AF" }}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    No Data
                  </span>
                </div>

              </div>

            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-800 shadow-lg h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {country} — Regions AQI ({selectedDate})
            </h3>

            {regionList.length === 0 && (
              <p className="text-gray-500">No data available.</p>
            )}

            <div className="space-y-3 overflow-y-auto flex-1">
              {regionList.map((item) => (
                <div
                  key={item.region}
                  className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700"
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {item.region}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {country}
                    </p>
                  </div>

                  <div
                    className="px-3 py-1 rounded-full text-white font-semibold text-sm"
                    style={{ backgroundColor: categoryColors[item.category] }}
                  >
                    {item.aqi}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
