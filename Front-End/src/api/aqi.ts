import axios from "axios";
import type {
  DataResponse,
  PredictionRequest,
  PredictionResponse,
  MultiDayPredictionResponse
} from "../types/aqi.types";

// --------------------------------------------------------
// 1️⃣ FIX: attach baseURL so all api.* calls go to Node 3001
// --------------------------------------------------------
const api = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 15000,
});

// --------------------------------------------------------
// API wrapper
// --------------------------------------------------------
export const aqiApi = {
  // Historical data
  getData: async (params: { country?: string; limit?: number; offset?: number }) => {
    return api.get<DataResponse>("/api/data", { params });
  },

  // Get regions
  getRegions: async (country?: string) => {
    return api.get("/api/regions", {
      params: country ? { country } : {},
    });
  },

  // --------------------------------------------------------
  // 2️⃣ FIX: /api/predict DOES NOT accept months param
  // NodeJS will reject it → remove months
  // --------------------------------------------------------
  predict: async (data: PredictionRequest) => {
    return api.post<MultiDayPredictionResponse>(
      "/api/predict",
      data
    );
  },

  // Health check
  health: async () => {
    return api.get("/health");
  },
};

// --------------------------------------------------------
// Regression + Classification
// (direct call to Node port 3001)
// --------------------------------------------------------
export const fetchRegression = async () => {
  const response = await axios.get("http://localhost:3001/api/regression");
  return response.data.regressor;
};

export const fetchClassification = async () => {
  const response = await axios.get("http://localhost:3001/api/classification");
  return response.data.classifier;
};

export default api;
