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