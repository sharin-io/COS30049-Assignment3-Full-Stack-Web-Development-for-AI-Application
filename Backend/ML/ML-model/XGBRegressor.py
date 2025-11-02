import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
from datetime import timedelta

#Read Data
df = pd.read_csv("ML/data/Final.csv")          
#print(df.head(10))


# Check and Clean Missing Values
print("\nMissing values before cleaning:\n", df.isnull().sum())

# Convert to numeric
for col in ['AQI', 'Temperature', 'RelativeHumidity', 'WindSpeed']:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Fill missing AQI with mean
df['AQI'] = df['AQI'].fillna(df['AQI'].mean())

print("\nMissing values after cleaning:\n", df.isnull().sum())

# Convert date column and prepare countries list
df['Date'] = pd.to_datetime(df['Date'])

# Process Each Country variables
countries = df['Country'].unique()
print("Countries to process:", countries)

# Cell 6: Process Each Country
for country in countries:
    print("=" * 60)
    print(f"Processing Country: {country}")
    print("=" * 60)

    country_data = df[df['Country'] == country].sort_values('Date').copy()

    # -------------------------------
    # Feature Engineering
    # -------------------------------
    country_data['month'] = country_data['Date'].dt.month
    country_data['day'] = country_data['Date'].dt.day
    country_data['dayofweek'] = country_data['Date'].dt.dayofweek
    country_data['year'] = country_data['Date'].dt.year

    # Lag features
    for lag in [1, 3, 7, 14, 30]:
        country_data[f'aqi_lag_{lag}'] = country_data['AQI'].shift(lag)

    # Rolling mean features
    country_data['aqi_roll_3'] = country_data['AQI'].rolling(3).mean()
    country_data['aqi_roll_7'] = country_data['AQI'].rolling(7).mean()
    country_data['aqi_roll_14'] = country_data['AQI'].rolling(14).mean()

    # Seasonality encoding (cyclical)
    country_data['month_sin'] = np.sin(2 * np.pi * country_data['month'] / 12)
    country_data['month_cos'] = np.cos(2 * np.pi * country_data['month'] / 12)
    country_data['dayofweek_sin'] = np.sin(2 * np.pi * country_data['dayofweek'] / 7)
    country_data['dayofweek_cos'] = np.cos(2 * np.pi * country_data['dayofweek'] / 7)

    # Drop missing after lag/rolling creation
    country_data = country_data.dropna()

    # -------------------------------
    # Define Features and Target
    # -------------------------------
    features = [
        'Temperature', 'RelativeHumidity', 'WindSpeed',
        'month', 'day', 'dayofweek',
        'aqi_lag_1', 'aqi_lag_3', 'aqi_lag_7', 'aqi_lag_14', 'aqi_lag_30',
        'aqi_roll_3', 'aqi_roll_7', 'aqi_roll_14',
        'month_sin', 'month_cos', 'dayofweek_sin', 'dayofweek_cos'
    ]

    X = country_data[features]
    y = country_data['AQI']

    # Split chronologically (no shuffle)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, shuffle=False
    )

    # -------------------------------
    # Train XGBoost Model
    # -------------------------------
    model = XGBRegressor(
        n_estimators=600,
        max_depth=10,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        objective='reg:squarederror'
    )

    model.fit(X_train, y_train)

    # -------------------------------
    # Evaluate Model
    # -------------------------------
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    print("\nModel Performance on Test Set:")
    print(f"R²: {r2:.3f}")
    print(f"MAE: {mae:.3f}")
    print(f"RMSE: {rmse:.3f}")

    # -------------------------------
    # Forecast Next 6 Months
    # -------------------------------
    last_known = country_data.iloc[-30:].copy()
    future_dates = pd.date_range(start=country_data['Date'].max() + timedelta(days=1), periods=180)

    predictions = []
    for next_date in future_dates:
        # Prepare next input
        next_row = {
            'Temperature': last_known['Temperature'].mean(),
            'RelativeHumidity': last_known['RelativeHumidity'].mean(),
            'WindSpeed': last_known['WindSpeed'].mean(),
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

        next_pred = model.predict(pd.DataFrame([next_row]))[0]
        predictions.append(next_pred)

        # Add prediction for future lags
        new_row = pd.DataFrame({'Date': [next_date], 'AQI': [next_pred]})
        last_known = pd.concat([last_known, new_row]).iloc[1:].reset_index(drop=True)

    future_df = pd.DataFrame({
        'Date': future_dates,
        'Predicted_AQI': predictions
    })

    print(f"Predicted AQI for {country} (Next 6 Months):")
    print(future_df.head(10))
    print("...")

    # -------------------------------
    # Visualization
    # -------------------------------
    plt.figure(figsize=(10, 5))
    plt.plot(country_data['Date'], country_data['AQI'], label='Historical AQI', color='blue')
    plt.plot(future_df['Date'], future_df['Predicted_AQI'], label='Predicted AQI', color='orange')
    plt.title(f"AQI Forecast for {country} using XGBoost")
    plt.xlabel("Date")
    plt.ylabel("AQI")
    plt.legend()
    plt.grid(True)
    plt.show()


# -------------------------------
    # Save results
    # -------------------------------
    import os

    # Save forecast data
    forecast_path = f"ML-result/regression/{country}_forecast.csv"
    future_df.to_csv(forecast_path, index=False)

    # Save model metrics
    metrics = {
        "Country": country,
        "R2": round(r2, 3),
        "MAE": round(mae, 3),
        "RMSE": round(rmse, 3)
    }

    # Append to metrics summary file
    metrics_path = "ML-result/regression/metrics_summary.csv"
    if not os.path.exists(metrics_path):
        with open(metrics_path, "w") as f:
            f.write("Country,R2,MAE,RMSE\n")
    with open(metrics_path, "a") as f:
        f.write(f"{country},{metrics['R2']},{metrics['MAE']},{metrics['RMSE']}\n")

    # Save the forecast chart
    #chart_path = f"ml_results/regression/charts/{country}_forecast.png"
    #plt.savefig(chart_path)
    #plt.close()


