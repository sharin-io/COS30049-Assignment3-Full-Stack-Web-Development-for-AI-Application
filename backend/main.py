from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from pydantic import BaseModel
from datetime import datetime, timedelta
import pandas as pd
from xgboost import XGBRegressor

from ML.ML_model.XGBRegressor import run_regressor as xgb_run_regressor
from ML.ML_model.ClassificationModels import run_classifier


# ---------------------------------------------------------
# Create FastAPI App
# ---------------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Helper: make everything JSON-safe
# ---------------------------------------------------------
def clean_json(obj):
    if isinstance(obj, dict):
        return {k: clean_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [clean_json(i) for i in obj]
    if isinstance(obj, np.generic):
        return obj.item()
    if isinstance(obj, float) and (np.isnan(obj) or np.isinf(obj)):
        return 0
    return obj


# ---------------------------------------------------------
# 1. REGRESSOR ENDPOINT
# ---------------------------------------------------------
@app.post("/regressor")
def regressor_api():
    result = xgb_run_regressor()
    if isinstance(result, dict) and "regressor" in result:
        data = result["regressor"]
    else:
        data = result
    return {"regressor": clean_json(data)}


# ---------------------------------------------------------
# 2. CLASSIFIER ENDPOINT
# ---------------------------------------------------------
@app.post("/classifier")
async def classifier_api():
    result = await run_classifier()
    if isinstance(result, dict) and "classifier" in result:
        data = result["classifier"]
    else:
        data = result
    return {"classifier": clean_json(data)}



# ---------------------------------------------------------
# REAL-TIME PREDICTION ENGINE
# ---------------------------------------------------------
def run_temp_prediction(country: str, user_temp: float, user_humidity: float, user_wind: float, start_date: str):
    df = pd.read_csv("ML/data/Final.csv")
    df['Date'] = pd.to_datetime(df['Date'])
    df['AQI'] = pd.to_numeric(df['AQI'], errors='coerce')
    df['Temperature'] = pd.to_numeric(df['Temperature'], errors='coerce')
    df['RelativeHumidity'] = pd.to_numeric(df['RelativeHumidity'], errors='coerce')
    df['WindSpeed'] = pd.to_numeric(df['WindSpeed'], errors='coerce')

    
    # Filter country
    country_data = df[df['Country'] == country].sort_values('Date').copy()

    # Feature engineering
    country_data['month'] = country_data['Date'].dt.month
    country_data['day'] = country_data['Date'].dt.day
    country_data['dayofweek'] = country_data['Date'].dt.dayofweek

    for lag in [1, 3, 7, 14, 30]:
        country_data[f'aqi_lag_{lag}'] = country_data['AQI'].shift(lag)

    country_data['aqi_roll_3'] = country_data['AQI'].rolling(3).mean()
    country_data['aqi_roll_7'] = country_data['AQI'].rolling(7).mean()
    country_data['aqi_roll_14'] = country_data['AQI'].rolling(14).mean()

    country_data['month_sin'] = np.sin(2 * np.pi * country_data['month'] / 12)
    country_data['month_cos'] = np.cos(2 * np.pi * country_data['month'] / 12)
    country_data['dayofweek_sin'] = np.sin(2 * np.pi * country_data['dayofweek'] / 7)
    country_data['dayofweek_cos'] = np.cos(2 * np.pi * country_data['dayofweek'] / 7)

    country_data = country_data.dropna()

    # 🔥 Ensure lag & rolling features are numeric (Fix for XGBoost dtype error)
    lag_cols = [
        'aqi_lag_1', 'aqi_lag_3', 'aqi_lag_7', 'aqi_lag_14', 'aqi_lag_30',
        'aqi_roll_3', 'aqi_roll_7', 'aqi_roll_14'
    ]

    for col in lag_cols:
        country_data[col] = pd.to_numeric(country_data[col], errors='coerce')


    # Train model (demo)
    features = [
        'Temperature', 'RelativeHumidity', 'WindSpeed',
        'month', 'day', 'dayofweek',
        'aqi_lag_1', 'aqi_lag_3', 'aqi_lag_7', 'aqi_lag_14', 'aqi_lag_30',
        'aqi_roll_3', 'aqi_roll_7', 'aqi_roll_14',
        'month_sin', 'month_cos', 'dayofweek_sin', 'dayofweek_cos'
    ]

    X = country_data[features]
    y = country_data['AQI']

    model = XGBRegressor(
        n_estimators=600,
        max_depth=10,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )
    model.fit(X, y)

    # ---- Start Simulation ----
    start = pd.to_datetime(start_date)
    future_dates = pd.date_range(start=start, periods=180)

    # Take last 30 rows
    last_known = country_data.iloc[-30:].copy()

    # ---------------------------------------------------------
    # ✅ FIX: ensure we have at least 30 rows to avoid index errors
    # ---------------------------------------------------------
    if len(last_known) < 30:
        last_value = last_known['AQI'].iloc[-1]
        missing = 30 - len(last_known)
        padding = pd.DataFrame({
            'Date': [last_known['Date'].iloc[-1]] * missing,
            'AQI': [last_value] * missing
        })
        last_known = pd.concat([padding, last_known]).reset_index(drop=True)
    # ---------------------------------------------------------

    predictions = []

    for next_date in future_dates:

        next_row = {
            'Temperature': user_temp,
            'RelativeHumidity': user_humidity,
            'WindSpeed': user_wind,
            'month': next_date.month,
            'day': next_date.day,
            'dayofweek': next_date.dayofweek,
            'aqi_lag_1': last_known['AQI'].iloc[-1],
            'aqi_lag_3': last_known['AQI'].iloc[-3],
            'aqi_lag_7': last_known['AQI'].iloc[-7],
            'aqi_lag_14': last_known['AQI'].iloc[-14],
            'aqi_lag_30': last_known['AQI'].iloc[-30],
            'aqi_roll_3': last_known['AQI'].iloc[-3:].mean(),
            'aqi_roll_7': last_known['AQI'].iloc[-7:].mean(),
            'aqi_roll_14': last_known['AQI'].iloc[-14:].mean(),
            'month_sin': np.sin(2 * np.pi * next_date.month / 12),
            'month_cos': np.cos(2 * np.pi * next_date.month / 12),
            'dayofweek_sin': np.sin(2 * np.pi * next_date.dayofweek / 7),
            'dayofweek_cos': np.cos(2 * np.pi * next_date.dayofweek / 7)
        }

        pred = model.predict(pd.DataFrame([next_row]))[0]

        predictions.append({
            "date": next_date.strftime("%Y-%m-%d"),
            "aqi": float(pred)
        })

        new_row = pd.DataFrame({'Date': [next_date], 'AQI': [pred]})
        last_known = pd.concat([last_known, new_row]).iloc[1:].reset_index(drop=True)

    return {
        "predictions": predictions,
        "start_date": start.strftime("%Y-%m-%d"),
        "end_date": future_dates[-1].strftime("%Y-%m-%d")
    }



# ---------------------------
# Pydantic Model
# ---------------------------
class PredictionRequest(BaseModel):
    country: str
    region: str
    temperature: float
    relative_humidity: float
    wind_speed: float
    date: str


# ---------------------------
# /predict API
# ---------------------------
@app.post("/predict")
def predict_api(payload: PredictionRequest):

    country = payload.country
    temp = payload.temperature
    humidity = payload.relative_humidity
    wind = payload.wind_speed
    start_date = payload.date

    predictions = run_temp_prediction(
        country=country,
        user_temp=temp,
        user_humidity=humidity,
        user_wind=wind,
        start_date=start_date
    )

    return clean_json(predictions)
