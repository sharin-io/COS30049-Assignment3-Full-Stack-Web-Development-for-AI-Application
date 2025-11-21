import React, { useEffect, useState, useRef } from "react";
import { fetchClassification } from "../api/aqi";
import { Card } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import * as d3 from "d3";
import { Footer } from "../components/Footer";

const categoryColors: Record<string, string> = {
  Good: "#4CAF50",
  Moderate: "#FFEB3B",
  Unhealthy: "#FFB74D",
  "Very Unhealthy": "#FF9800",
  Hazardous: "#F44336",
};

const categoryRanges: Record<string, string> = {
  Good: "0–50",
  Moderate: "51–100",
  Unhealthy: "101–150",
  "Very Unhealthy": "151–200",
  Hazardous: "201+",
};

type CountryKey = "Malaysia" | "Thailand" | "Singapore";

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
  const [geoData, setGeoData] = useState<any | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingMap, setLoadingMap] = useState(true);
  const [regionList, setRegionList] = useState<any[]>([]);

  const svgRef = useRef<any>(null);
  const zoomRef = useRef<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const classifier = await fetchClassification();
        const items = classifier[0].org_data;
        setAllData(items);
      } catch (e) {
        console.error("Failed to fetch classification:", e);
      }
      setLoadingData(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (allData.length === 0) return;
    const rows = allData.filter((d) => d.Country === country);
    const dates = Array.from(new Set(rows.map((d) => d.Date))).sort();
    setAvailableDates(dates);
    if (!dates.includes(selectedDate)) {
      setSelectedDate(dates[dates.length - 1] || "");
    }
  }, [allData, country, selectedDate]);

  useEffect(() => {
    const loadGeo = async () => {
      setLoadingMap(true);
      setGeoData(null);
      try {
        const file = geoFiles[country];
        const geo = await d3.json(file);
        setGeoData(geo);
      } catch (e) {
        console.error("Failed to load geojson:", e);
      }
      setLoadingMap(false);
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

  function fuzzyMatch(region: string, datasetRegions: string[]) {
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

    return bestScore >= 0.6 ? best : null;
  }

  useEffect(() => {
    if (!geoData || allData.length === 0 || !selectedDate) return;

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
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));

    zoomRef.current = zoom;
    svg.call(zoom);

    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);

    const rows = allData.filter(
      (d) => d.Country === country && d.Date === selectedDate
    );

    const aqiByRegion = new Map();
    rows.forEach((r) =>
      aqiByRegion.set(r.Region, {
        category: r.AQI_Category,
        aqi: r.AQI,
      })
    );

    setRegionList(
      rows.map((r) => ({
        region: r.Region,
        aqi: r.AQI,
        category: r.AQI_Category,
      }))
    );

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
        const match = fuzzyMatch(regionName, [...aqiByRegion.keys()]);
        const rec = match ? aqiByRegion.get(match) : null;
        return rec ? categoryColors[rec.category] : "#9CA3AF";
      })
      .append("title")
      .text((d: any) => {
        const regionName = getRegionName(d);
        const match = fuzzyMatch(regionName, [...aqiByRegion.keys()]);
        const rec = match ? aqiByRegion.get(match) : null;

        if (!rec) return `${regionName}\nNo data for ${selectedDate}`;
        return `${match}\nAQI: ${rec.aqi}\nCategory: ${rec.category}`;
      });
  }, [geoData, allData, country, selectedDate]);

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

        <div className="mb-4 flex items-center gap-3">
          <label className="text-gray-800 dark:text-gray-300">Date:</label>
          <input
            type="date"
            className="p-2 border rounded dark:bg-gray-800 dark:text-white"
            value={selectedDate}
            min={availableDates[0]}
            max={availableDates[availableDates.length - 1]}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 items-stretch">

          <Card className="relative p-6 bg-white dark:bg-gray-800 shadow-lg lg:col-span-2 h-full flex flex-col">

            {/* FIXED ZOOM BUTTONS */}
            <div className="absolute top-4 right-4 space-y-2 z-50">
              <button
                className="w-8 h-8 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 shadow border flex items-center justify-center"
                onClick={() => {
                  if (svgRef.current && zoomRef.current) {
                    svgRef.current.transition().call(
                      zoomRef.current.scaleBy as any,
                      1.3
                    );
                  }
                }}
              >
                +
              </button>
              <button
                className="w-8 h-8 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 shadow border flex items-center justify-center"
                onClick={() => {
                  if (svgRef.current && zoomRef.current) {
                    svgRef.current.transition().call(
                      zoomRef.current.scaleBy as any,
                      1 / 1.3
                    );
                  }
                }}
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: "#4CAF50" }}
                  ></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Good (0–50)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: "#FFEB3B" }}
                  ></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Moderate (51–100)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: "#FFB74D" }}
                  ></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Unhealthy (101–150)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: "#FF9800" }}
                  ></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Very Unhealthy (151–200)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: "#F44336" }}
                  ></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Hazardous (201+)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-400"></div>
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
      <Footer />
    </div>
  );
};
