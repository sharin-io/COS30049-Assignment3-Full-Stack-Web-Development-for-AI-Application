const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;
const csv = require("csvtojson");
const axios = require('axios');

app.use(cors());
app.use(express.json());

// WAQI API Configuration
// Use environment variable if available, otherwise use default token
const WAQI_TOKEN = process.env.WAQI_TOKEN || '4270e59f10d0948e38cd570a70a231ef544629e5';
const WAQI_BASE_URL = 'https://api.waqi.info';

// Helper function to transform WAQI response to our AQIData format
function transformWAQIData(data) {
  // Extract city and country from name (format: "City (Country)" or "City, Country")
  const cityName = data.city.name.split(/[\(,]/)[0].trim();
  const countryMatch = data.city.name.match(/\(([^)]+)\)|,\s*([^,]+)$/);
  const country = countryMatch ? (countryMatch[1] || countryMatch[2]).trim() : 'Unknown';

  return {
    city: cityName,
    country,
    aqi: data.aqi,
    pollutants: {
      pm25: data.iaqi.pm25?.v || 0,
      pm10: data.iaqi.pm10?.v || 0,
      o3: data.iaqi.o3?.v || 0,
      co: data.iaqi.co?.v,
      no2: data.iaqi.no2?.v,
      so2: data.iaqi.so2?.v,
    },
    temperature: data.iaqi.t?.v || 0,
    humidity: data.iaqi.h?.v || 0,
    windSpeed: data.iaqi.w?.v || 0,
    mainPollutant: data.dominentpol || 'pm25',
    geo: data.city.geo,
  };
}

// Classification Result
app.get("/api/classification", async (req, res) => {
  try {
    const response = await axios.post('http://localhost:8000/classifier', {});

    console.log(response.data);

    const classifier = response.data.classifier || [];

    res.json({ classifier });

  } catch (err) {
    console.error("Error fetching classification result:", err.response?.data || err.message);
    res.status(500).json({
      message: "Error fetching classification result from FastAPI",
      error: err.response?.data || err.message
    });
  }
});

// Regression Result
app.get("/api/regression", async (req, res) => {
  try {
    const response = await axios.post('http://localhost:8000/regressor', {});

    console.log(response.data);

    const regressor = response.data.regressor || [];

    res.json({ regressor });

  } catch (err) {
    console.error("Error fetching regression result:", err.response?.data || err.message);
    res.status(500).json({
      message: "Error fetching regression result from FastAPI",
      error: err.response?.data || err.message
    });
  }
});

app.get("/api/data", async (req, res) => {
  try {
    const fs = require("fs");
    const csv = fs.readFileSync("ML/data/Final.csv", "utf8");

    const lines = csv.split("\n");
    const headers = lines[0].split(",");

    const json = lines.slice(1).map(line => {
      const cols = line.split(",");
      let row = {};
      headers.forEach((h, i) => {
        row[h.trim()] = cols[i] ? cols[i].trim() : null;
      });
      return row;
    });

    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load data" });
  }
});

// ----------------------------------------
// Real-time prediction endpoint (VALIDATION ADDED HERE)
// ----------------------------------------
app.post("/api/predict", async (req, res) => {
  const payload = req.body;

  // -------------------------
  // INPUT VALIDATION
  // -------------------------
  const errors = [];

  if (!payload.country) errors.push("country is required");
  if (!payload.region) errors.push("region is required");
  if (!payload.date) errors.push("date is required");

  if (payload.temperature == null || isNaN(payload.temperature))
    errors.push("temperature must be a valid number");

  if (payload.humidity == null || isNaN(payload.humidity))
    errors.push("humidity must be a valid number");

  if (payload.wind == null || isNaN(payload.wind))
    errors.push("wind must be a valid number");

  // Optional realistic range validation
  if (payload.temperature < -50 || payload.temperature > 60)
    errors.push("temperature out of valid range (-50 to 60)");

  if (payload.humidity < 0 || payload.humidity > 100)
    errors.push("humidity must be between 0 and 100");

  if (payload.wind < 0 || payload.wind > 200)
    errors.push("wind is unrealistic (0–200)");

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Invalid input",
      details: errors,
    });
  }

  // -------------------------
  // END VALIDATION
  // -------------------------

  try {
    const response = await axios.post("http://localhost:8000/predict", payload);

    console.log("Predict result:", response.data);

    res.json(response.data);

  } catch (err) {
    console.error("Error fetching prediction:", err.response?.data || err.message);
    res.status(500).json({
      error: "Prediction failed",
      details: err.response?.data || err.message
    });
  }
});

// ----------------------------------------
// Regions endpoint
// ----------------------------------------
app.get("/api/regions", async (req, res) => {
  const country = req.query.country;

  const regionsData = {
    Malaysia: [
      "AlorSetar", "KualaLumpur", "JohorBahru", "Kuantan", "Penang",
      "Melaka", "Ipoh", "KotaKinabalu", "Kuching"
    ],
    Thailand: [
      "Bangkok", "ChiangMai", "Phuket", "Pattaya", "UdonThani",
      "HatYai", "Rayong", "KhonKaen"
    ],
    Singapore: [
      "Central", "North", "East", "West", "South"
    ]
  };

  if (!country) {
    return res.json({
      success: true,
      countries: regionsData
    });
  }

  return res.json({
    success: true,
    country,
    regions: regionsData[country] || []
  });
});

// ----------------------------------------
// WAQI API Proxy Endpoints
// ----------------------------------------
// Get AQI data for a specific city
// Support both path parameter and query parameter for flexibility
app.get("/api/waqi/city/:city", async (req, res) => {
  // Prefer query parameter if provided (handles hyphens better)
  // Otherwise use path parameter
  let city = req.query.name || req.params.city;

  if (!city) {
    return res.status(400).json({
      error: "City name is required",
      status: 'error'
    });
  }

  // Decode the city name in case it was URL encoded
  try {
    city = decodeURIComponent(city);
  } catch (e) {
    // If decoding fails, use the original
    console.warn("Failed to decode city name:", city);
  }

  try {
    const response = await axios.get(
      `${WAQI_BASE_URL}/feed/${city}/?token=${WAQI_TOKEN}`
    );

    if (response.data.status === 'error') {
      return res.status(400).json({
        error: response.data.msg || 'Failed to fetch AQI data',
        status: 'error'
      });
    }

    if (!response.data.data) {
      return res.status(404).json({
        error: 'No data available',
        status: 'error'
      });
    }

    const transformedData = transformWAQIData(response.data.data);
    res.json(transformedData);
  } catch (err) {
    console.error("Error fetching WAQI city data:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to fetch AQI data",
      message: err.response?.data?.msg || err.message
    });
  }
});

// Get AQI data based on geolocation
app.get("/api/waqi/location", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({
      error: "Latitude and longitude are required",
      status: 'error'
    });
  }

  try {
    const response = await axios.get(
      `${WAQI_BASE_URL}/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`
    );

    if (response.data.status === 'error') {
      return res.status(400).json({
        error: response.data.msg || 'Failed to fetch AQI data',
        status: 'error'
      });
    }

    if (!response.data.data) {
      return res.status(404).json({
        error: 'No data available',
        status: 'error'
      });
    }

    const transformedData = transformWAQIData(response.data.data);
    res.json(transformedData);
  } catch (err) {
    console.error("Error fetching WAQI location data:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to fetch AQI data",
      message: err.response?.data?.msg || err.message
    });
  }
});

// Get AQI data for multiple cities
app.post("/api/waqi/cities", async (req, res) => {
  const { cities } = req.body;

  if (!Array.isArray(cities) || cities.length === 0) {
    return res.status(400).json({
      error: "cities must be a non-empty array",
      status: 'error'
    });
  }

  try {
    const promises = cities.map(async (city) => {
      try {
        const response = await axios.get(
          `${WAQI_BASE_URL}/feed/${city}/?token=${WAQI_TOKEN}`
        );

        if (response.data.status === 'error' || !response.data.data) {
          return null; // Skip failed cities
        }

        return transformWAQIData(response.data.data);
      } catch (err) {
        console.error(`Error fetching data for ${city}:`, err.message);
        return null; // Skip failed cities
      }
    });

    const results = await Promise.all(promises);
    const validResults = results.filter(result => result !== null);

    res.json(validResults);
  } catch (err) {
    console.error("Error fetching multiple city feeds:", err.message);
    res.status(500).json({
      error: "Failed to fetch city feeds",
      message: err.message
    });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
