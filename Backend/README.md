# Air Quality Backend

Backend services for the Air Quality and Health application.

## Architecture

- **Python FastAPI** (Port 8000): ML model endpoints for predictions, classification, and regression
- **Node.js Express** (Port 3001): API gateway that proxies requests to FastAPI and provides additional endpoints

## Quick Start

### Option 1: Using start.sh (Recommended)

```bash
cd backend
./start.sh
```

This script will:
- Check for Python 3 and Node.js
- Create Python virtual environment
- Install all dependencies
- Start both Python FastAPI and Node.js servers

### Option 2: Manual Setup

1. **Setup Python environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Start Python FastAPI server:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

3. **Setup Node.js (in a new terminal):**
```bash
npm install
```

4. **Start Node.js server:**
```bash
node server.js
```

## 📚 API Endpoint Documentation

### Base URLs

- **Node.js Express API**: `http://localhost:3001`
- **Python FastAPI**: `http://localhost:8000`
- **FastAPI Interactive Docs**: `http://localhost:8000/docs` (Swagger UI)

---

## Node.js Express Endpoints (Port 3001)

All endpoints are prefixed with `/api`.

### 1. Get Classification Results

**Endpoint**: `GET /api/classification`

**Description**: Retrieves classification results from the ML model.

**Request**:
```http
GET http://localhost:3001/api/classification
```

**Response**:
```json
{
  "classifier": [
    {
      "Country": "Malaysia",
      "Region": "AlorSetar",
      "Date": "2014-01-01",
      "AQI": 45,
      "Classification": "Good",
      ...
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Success
- `500 Internal Server Error`: Error fetching classification result

---

### 2. Get Regression Results

**Endpoint**: `GET /api/regression`

**Description**: Retrieves regression/forecast results from the XGBoost model.

**Request**:
```http
GET http://localhost:3001/api/regression
```

**Response**:
```json
{
  "regressor": [
    {
      "country": "Malaysia",
      "forecast_sample": [
        {
          "Date": "2025-01-01",
          "Predicted_AQI": 52.3,
          ...
        }
      ],
      "metrics": {
        "r2_score": 0.85,
        "mae": 12.5,
        "rmse": 15.2
      }
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Success
- `500 Internal Server Error`: Error fetching regression result

---

### 3. Get Historical AQI Data

**Endpoint**: `GET /api/data`

**Description**: Retrieves all historical AQI data from the dataset.

**Request**:
```http
GET http://localhost:3001/api/data
```

**Response**:
```json
[
  {
    "Country": "Malaysia",
    "Region": "AlorSetar",
    "Date": "2014-01-01",
    "AQI": 45,
    "Temperature": 28.5,
    "RelativeHumidity": 75.0,
    "WindSpeed": 15.0
  },
  ...
]
```

**Status Codes**:
- `200 OK`: Success
- `500 Internal Server Error`: Could not load data

---

### 4. Predict Future AQI Values

**Endpoint**: `POST /api/predict`

**Description**: Generates 180-day AQI predictions using XGBoost model with user-provided weather parameters.

**Request**:
```http
POST http://localhost:3001/api/predict
Content-Type: application/json
```

**Request Body**:
```json
{
  "country": "Malaysia",
  "region": "AlorSetar",
  "temperature": 28.5,
  "humidity": 75.0,
  "wind": 15.0,
  "date": "2025-01-01"
}
```

**Request Parameters**:
| Parameter | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| `country` | string | Yes | Country name | "Malaysia", "Thailand", or "Singapore" |
| `region` | string | Yes | Region within country | See `/api/regions` endpoint |
| `temperature` | number | Yes | Temperature in Celsius | -50 to 60 |
| `humidity` | number | Yes | Relative humidity percentage | 0 to 100 |
| `wind` | number | Yes | Wind speed | 0 to 200 |
| `date` | string | Yes | Start date for prediction | Format: "YYYY-MM-DD" |

**Response**:
```json
{
  "predictions": [
    {
      "date": "2025-01-01",
      "aqi": 52.3
    },
    {
      "date": "2025-01-02",
      "aqi": 48.7
    },
    ...
  ],
  "start_date": "2025-01-01",
  "end_date": "2025-06-29"
}
```

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid input (see error details)
- `500 Internal Server Error`: Prediction failed

**Error Response** (400):
```json
{
  "error": "Invalid input",
  "details": [
    "temperature must be a valid number",
    "humidity must be between 0 and 100"
  ]
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:3001/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "country": "Malaysia",
    "region": "AlorSetar",
    "temperature": 28.5,
    "humidity": 75.0,
    "wind": 15.0,
    "date": "2025-01-01"
  }'
```

---

### 5. Get Available Regions

**Endpoint**: `GET /api/regions`

**Description**: Retrieves available regions for a specific country or all countries.

**Request**:
```http
GET http://localhost:3001/api/regions?country=Malaysia
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country` | string | No | Filter regions by country |

**Response** (with country):
```json
{
  "success": true,
  "country": "Malaysia",
  "regions": [
    "AlorSetar",
    "KualaLumpur",
    "JohorBahru",
    "Kuantan",
    "Penang",
    "Melaka",
    "Ipoh",
    "KotaKinabalu",
    "Kuching"
  ]
}
```

**Response** (without country):
```json
{
  "success": true,
  "countries": {
    "Malaysia": ["AlorSetar", "KualaLumpur", ...],
    "Thailand": ["Bangkok", "ChiangMai", ...],
    "Singapore": ["Central", "North", "East", "West", "South"]
  }
}
```

**Status Codes**:
- `200 OK`: Success

---

### 6. Get WAQI City Data

**Endpoint**: `GET /api/waqi/city/:city`

**Description**: Fetches real-time AQI data for a specific city from WAQI API.

**Request**:
```http
GET http://localhost:3001/api/waqi/city/Kuala%20Lumpur
# Or using query parameter:
GET http://localhost:3001/api/waqi/city/:city?name=Kuala%20Lumpur
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `city` | string | Yes | City name (URL encoded) |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Alternative city name parameter |

**Response**:
```json
{
  "city": "Kuala Lumpur",
  "country": "Malaysia",
  "aqi": 52,
  "pollutants": {
    "pm25": 15.2,
    "pm10": 28.5,
    "o3": 45.3,
    "co": 1.2,
    "no2": 25.8,
    "so2": 8.5
  },
  "temperature": 28.5,
  "humidity": 75.0,
  "windSpeed": 15.0,
  "mainPollutant": "pm25",
  "geo": [3.1390, 101.6869]
}
```

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: City name required or WAQI API error
- `404 Not Found`: No data available
- `500 Internal Server Error`: Failed to fetch AQI data

---

### 7. Get WAQI Location Data

**Endpoint**: `GET /api/waqi/location`

**Description**: Fetches real-time AQI data based on geolocation coordinates.

**Request**:
```http
GET http://localhost:3001/api/waqi/location?lat=3.1390&lon=101.6869
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude |
| `lon` | number | Yes | Longitude |

**Response**: Same structure as `/api/waqi/city/:city`

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Latitude and longitude required
- `404 Not Found`: No data available
- `500 Internal Server Error`: Failed to fetch AQI data

---

### 8. Get Multiple Cities WAQI Data

**Endpoint**: `POST /api/waqi/cities`

**Description**: Fetches real-time AQI data for multiple cities in a single request.

**Request**:
```http
POST http://localhost:3001/api/waqi/cities
Content-Type: application/json
```

**Request Body**:
```json
{
  "cities": ["Kuala Lumpur", "Bangkok", "Singapore"]
}
```

**Response**:
```json
[
  {
    "city": "Kuala Lumpur",
    "country": "Malaysia",
    "aqi": 52,
    ...
  },
  {
    "city": "Bangkok",
    "country": "Thailand",
    "aqi": 68,
    ...
  },
  ...
]
```

**Status Codes**:
- `200 OK`: Success (returns array of valid results, skips failed cities)
- `400 Bad Request`: cities must be a non-empty array
- `500 Internal Server Error`: Failed to fetch city feeds

---

## Python FastAPI Endpoints (Port 8000)

### 1. Classification Endpoint

**Endpoint**: `POST /classifier`

**Description**: Runs classification model and returns results.

**Request**:
```http
POST http://localhost:8000/classifier
Content-Type: application/json
```

**Request Body**: `{}` (empty object)

**Response**:
```json
{
  "classifier": [...]
}
```

**Status Codes**:
- `200 OK`: Success
- `500 Internal Server Error`: Classification failed

---

### 2. Regression Endpoint

**Endpoint**: `POST /regressor`

**Description**: Runs XGBoost regression model and returns forecast results.

**Request**:
```http
POST http://localhost:8000/regressor
Content-Type: application/json
```

**Request Body**: `{}` (empty object)

**Response**:
```json
{
  "regressor": [...]
}
```

**Status Codes**:
- `200 OK`: Success
- `500 Internal Server Error`: Regression failed

---

### 3. Prediction Endpoint

**Endpoint**: `POST /predict`

**Description**: Generates real-time AQI predictions using XGBoost model.

**Request**:
```http
POST http://localhost:8000/predict
Content-Type: application/json
```

**Request Body**:
```json
{
  "country": "Malaysia",
  "region": "AlorSetar",
  "temperature": 28.5,
  "relative_humidity": 75.0,
  "wind_speed": 15.0,
  "date": "2025-01-01"
}
```

**Request Parameters**:
| Parameter | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| `country` | string | Yes | Country name | "Malaysia", "Thailand", or "Singapore" |
| `region` | string | Yes | Region within country | See `/api/regions` endpoint |
| `temperature` | number | Yes | Temperature in Celsius | -50 to 60 |
| `relative_humidity` | number | Yes | Relative humidity percentage | 0 to 100 |
| `wind_speed` | number | Yes | Wind speed | 0 to 200 |
| `date` | string | Yes | Start date for prediction | Format: "YYYY-MM-DD" |

**Response**:
```json
{
  "predictions": [
    {
      "date": "2025-01-01",
      "aqi": 52.3
    },
    ...
  ],
  "start_date": "2025-01-01",
  "end_date": "2025-06-29"
}
```

**Status Codes**:
- `200 OK`: Success
- `422 Unprocessable Entity`: Validation error (Pydantic)
- `500 Internal Server Error`: Prediction failed

---

### 4. Interactive API Documentation

**Endpoint**: `GET /docs`

**Description**: Swagger UI interactive API documentation.

**Access**: http://localhost:8000/docs

This provides an interactive interface to test all FastAPI endpoints directly from the browser.

---

## HTTP Methods Summary

The API uses the following HTTP methods:

- **GET**: Used for retrieving data (classification, regression, historical data, regions, WAQI data)
- **POST**: Used for submitting data and generating predictions

This satisfies the assignment requirement of using "at least two HTTP methods" (GET, POST, PUT, or DELETE).

---

## Error Handling

All endpoints include comprehensive error handling:

1. **Input Validation**: Both frontend and backend validate inputs
2. **Range Validation**: Temperature (-50 to 60), Humidity (0 to 100), Wind (0 to 200)
3. **Error Responses**: Clear error messages with status codes
4. **Try-Catch Blocks**: All async operations wrapped in error handling

---

## Testing API Endpoints

### Using cURL

```bash
# Test classification
curl http://localhost:3001/api/classification

# Test prediction
curl -X POST http://localhost:3001/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "country": "Malaysia",
    "region": "AlorSetar",
    "temperature": 28.5,
    "humidity": 75.0,
    "wind": 15.0,
    "date": "2025-01-01"
  }'

# Test WAQI city data
curl http://localhost:3001/api/waqi/city/Kuala%20Lumpur
```

### Using FastAPI Interactive Docs

Visit http://localhost:8000/docs to interactively test FastAPI endpoints with Swagger UI.

### Using Postman

Import the endpoints into Postman and test with the provided request/response examples above.

## Requirements

- Python 3.8+
- Node.js 14+
- npm

## Dependencies

Python dependencies are listed in `requirements.txt`
Node.js dependencies are listed in `package.json`

## Environment Variables

### WAQI Token (Optional)

You can set the WAQI API token via environment variable:

```bash
export WAQI_TOKEN=your_token_here
```

Or create a `.env` file (not included in git for security):
```
WAQI_TOKEN=4270e59f10d0948e38cd570a70a231ef544629e5
```

The token is currently hardcoded in `server.js` for simplicity, but using environment variables is recommended for production.

