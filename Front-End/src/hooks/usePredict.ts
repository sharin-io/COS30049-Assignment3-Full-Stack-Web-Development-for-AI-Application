import { useState } from 'react';
import { aqiApi } from '../api/aqi';
import type { PredictionRequest, PredictionResponse } from '../types/aqi.types';

export const usePredict = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  const predict = async (data: PredictionRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await aqiApi.predict(data);
      setPrediction(response.data);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Prediction failed';
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setLoading(false);
    }
  };

  return { predict, prediction, loading, error };
};