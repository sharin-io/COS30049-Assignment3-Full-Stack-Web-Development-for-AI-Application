export interface AQIDataPoint {
  country: string;
  region: string;
  date: string;
  aqi: number;
  temperature: number;
  relative_humidity: number;
  wind_speed: number;
}

export interface DataResponse {
  success: boolean;
  count: number;
  total: number;
  data: AQIDataPoint[];
}

export interface PredictionRequest {
  country: string;
  region: string;
  temperature: number;
  relative_humidity: number;
  wind_speed: number;
  date?: string;
}

export interface PredictionResponse {
  success: boolean;
  predicted_aqi: number;
  category: string;
  confidence?: number;
  input_data?: PredictionRequest;
}

export interface DailyPrediction {
  date: string; // YYYY-MM-DD
  aqi: number;
  category: string;
}

export interface MonthlyAverage {
  month: string;
  avg_aqi: number;
}

export interface MultiDayPredictionResponse {
  success: boolean;
  start_date: string;
  end_date: string;
  predictions: DailyPrediction[];
  monthly_averages: MonthlyAverage[];
}

export type AQICategory = 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export type Country = 'Malaysia' | 'Thailand' | 'Singapore';
export interface HealthImpact {
  category: AQICategory;
  range: string;
  color: string;
  healthImplications: string;
  cautionaryStatement: string;
}

// WAQI API Types
export interface WAQIResponse {
  status: string;
  data?: WAQIData;
  msg?: string;
}

export interface WAQIData {
  aqi: number;
  idx: number;
  attributions: Array<{
    url: string;
    name: string;
  }>;
  city: {
    geo: [number, number];
    name: string;
    url: string;
    location?: string;
  };
  dominentpol: string;
  iaqi: {
    co?: { v: number };
    h?: { v: number };
    no2?: { v: number };
    o3?: { v: number };
    p?: { v: number };
    pm10?: { v: number };
    pm25?: { v: number };
    so2?: { v: number };
    t?: { v: number };
    w?: { v: number };
  };
  time: {
    s: string;
    tz: string;
    v: number;
    iso: string;
  };
  forecast?: {
    daily: {
      pm25?: Array<{
        avg: number;
        day: string;
        max: number;
        min: number;
      }>;
      pm10?: Array<{
        avg: number;
        day: string;
        max: number;
        min: number;
      }>;
      o3?: Array<{
        avg: number;
        day: string;
        max: number;
        min: number;
      }>;
      uvi?: Array<{
        avg: number;
        day: string;
        max: number;
        min: number;
      }>;
    };
  };
}

export interface AQIData {
  city: string;
  country: string;
  aqi: number;
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    co?: number;
    no2?: number;
    so2?: number;
  };
  temperature: number;
  humidity: number;
  windSpeed: number;
  mainPollutant: string;
  geo?: [number, number];
}