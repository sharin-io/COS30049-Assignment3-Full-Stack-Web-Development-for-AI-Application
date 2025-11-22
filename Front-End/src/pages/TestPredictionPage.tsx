import React, { useState, useMemo, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Loader2, XCircle } from "lucide-react";
import type {
  PredictionRequest,
  MultiDayPredictionResponse,
} from "../types/aqi.types";
import { fetchRegression, aqiApi } from "../api/aqi";
import Prediction from "../components/chart/Prediction";


export const TestPredictionPage: React.FC = () => {
  const [formData, setFormData] = useState<PredictionRequest>({
    country: "Malaysia",
    region: "AlorSetar",
    temperature: 28.5,
    relative_humidity: 75.0,
    wind_speed: 15.0,
    date: "2025-01-01",
  });

  const [result, setResult] =
    useState<MultiDayPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [regressionData, setRegressionData] = useState<any[]>([]);
  const [loadingRegression, setLoadingRegression] = useState(true);



  useEffect(() => {
    setLoadingRegression(true);
    fetchRegression()
      .then((data) => setRegressionData(data))
      .catch(console.error)
      .finally(() => setLoadingRegression(false));
  }, []);

  useEffect(() => {
    const loadRegions = async () => {
      setLoadingRegions(true);
      try {
        const r = await aqiApi.getRegions(formData.country);
        if (r.data?.regions) setRegions(r.data.regions);
        else setRegions([]);
  
        // ---- AUTO-SELECT FIRST REGION (ONLY ADDED) ----
        if (r.data?.regions?.length) {
          setFormData(prev => ({
            ...prev,
            region: r.data.regions[0],
          }));
        }
  
      } catch {
        setRegions([]);
      }
      setLoadingRegions(false);
    };
    loadRegions();
  }, [formData.country]);
  

  

  const handleInputChange = (
    field: keyof PredictionRequest,
    value: any
  ) => {
    if (field === "country") {
      setResult(null);              //reset chart
      setFormData((prev) => ({
        ...prev,
        country: value,
        date: value === "Singapore" ? prev.date : "2025-01-01",
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ----------------------------------------------------
  // ONLY VALIDATION ADDED — NOTHING ELSE CHANGED
  // ----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // -------- VALIDATION RULES --------
    if (!formData.region) {
      setError("Region is required.");
      setLoading(false);
      return;
    }

    if (!formData.date) {
      setError("Date is required.");
      setLoading(false);
      return;
    }

    if (formData.temperature < -50 || formData.temperature > 60) {
      setError("Temperature must be between -50 and 60.");
      setLoading(false);
      return;
    }

    if (formData.relative_humidity < 0 || formData.relative_humidity > 100) {
      setError("Humidity must be between 0 and 100.");
      setLoading(false);
      return;
    }

    if (formData.wind_speed < 0 || formData.wind_speed > 200) {
      setError("Wind speed must be between 0 and 200.");
      setLoading(false);
      return;
    }
    // -------- END VALIDATION --------

    try {
      const response = await aqiApi.predict(formData);
      setResult(response.data);
    } catch (err: any) {
      // Extract error message from response
      const errorMsg = err.response?.data?.details || 
                      err.response?.data?.error || 
                      err.message || 
                      "Failed to get prediction";
      setError(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    }
    setLoading(false);
  };

  const chartData = useMemo(() => {
    // If real-time prediction exists → use it
    if (result?.predictions?.length) {
      return result.predictions.map(p => ({
        date: p.date,
        aqi: Math.round(p.aqi),
      }));
    }
  
    // Otherwise use regression default
    const block = regressionData.find(
      (d: any) => d.country === formData.country
    );
  
    if (block?.forecast_sample) {
      return block.forecast_sample.map((d: any) => ({
        date: String(d.Date).split("T")[0],
        aqi: Math.round(d.Predicted_AQI),
      }));
    }
  
    return [];
  }, [result, regressionData, formData.country]);

  

  const minDate =
    formData.country === "Singapore"
      ? "2024-01-01"
      : "2025-01-01";

  const maxDate =
      formData.country === "Singapore"
        ? "2024-06-30"
        : "2025-06-30";
  

  return (
    <div className="min-h-screen p-6">


      {/* Page Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200">
        Real-Time AQI Forecast Simulator
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Adjust environmental factors and generate a 6-month AQI projection.
      </p>
    </div>

    {/* Progress Bar */}
    {loading && (
      <div className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-blue-500 animate-[progress_2s_linear_infinite]"></div>
      </div>
    )}

    <style>
    {`
    @keyframes progress {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    `}
    </style>



      {/* Country Switch Buttons */}
      <div className="flex gap-3 mb-6">
        {["Malaysia", "Thailand", "Singapore"].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleInputChange("country", c)}
            className={`px-6 py-2 rounded-xl font-medium border transition-all
              ${formData.country === c
                ? "bg-blue-500 text-white shadow"
                : "bg-white text-black border-gray-300 hover:bg-gray-100"
              }`}
          >
            {c}
          </button>
        ))}
      </div>



      {loadingRegression ? (
        <Card className="p-6 mb-6 animate-pulse">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="flex mt-4 space-x-3">
            <div className="h-3 w-20 bg-gray-300 rounded"></div>
            <div className="h-3 w-10 bg-gray-300 rounded"></div>
            <div className="h-3 w-16 bg-gray-300 rounded"></div>
          </div>
        </Card>
      ) : (
        chartData.length > 0 && (
          <Card className="p-6 mb-6">
            <Prediction data={chartData} width={1200} height={350} />
          </Card>
        )
      )}


      <Card className="p-6">

        {/* Form Title */}
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Predict Data Form
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <Label>Country</Label>
            <Select
              value={formData.country}
              onValueChange={(v) => handleInputChange("country", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Malaysia">Malaysia</SelectItem>
                <SelectItem value="Thailand">Thailand</SelectItem>
                <SelectItem value="Singapore">Singapore</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Region</Label>

            {loadingRegions ? (
              <div className="text-sm text-gray-500">Loading regions...</div>
            ) : (
              <Select
                value={formData.region}
                onValueChange={(v) => handleInputChange("region", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>

                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>


          <div>
            <Label>Temperature</Label>
            <Input
              type="number"
              value={formData.temperature}
              onChange={(e) =>
                handleInputChange("temperature", parseFloat(e.target.value))
              }
            />
          </div>

          <div>
            <Label>Humidity</Label>
            <Input
              type="number"
              value={formData.relative_humidity}
              onChange={(e) =>
                handleInputChange(
                  "relative_humidity",
                  parseFloat(e.target.value)
                )
              }
            />
          </div>

          <div>
            <Label>Wind Speed</Label>
            <Input
              type="number"
              value={formData.wind_speed}
              onChange={(e) =>
                handleInputChange(
                  "wind_speed",
                  parseFloat(e.target.value)
                )
              }
            />
          </div>

          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={formData.date}
              min={minDate}
              max={maxDate}
              onChange={(e) =>
                handleInputChange("date", e.target.value)
              }
            />

            <p className="text-xs text-gray-500 mt-1">
              Earliest available date for {formData.country}: {minDate}
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Get 6-Month Forecast"
            )}
          </Button>


        </form>
      </Card>

      {error && (
        <div
          className="
            fixed bottom-6 left-1/2 transform -translate-x-1/2
            bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg
            flex items-center gap-2
            animate-slide-up
            z-[9999]
          "
        >
          <XCircle size={20} />
          <span>{error}</span>
        </div>
      )}


    </div>
  );
};
