const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;
const csv = require("csvtojson");
const axios = require('axios');

app.use(cors());
app.use(express.json());



// Classification Result
app.get("/api/classification", async (req, res) => {
  try {
    // Call Python FastAPI service
    const response = await axios.post('http://localhost:8000/classifier', { });

    console.log(response.data);

    const classifier = response.data.classifier || []; 

    // Send all clustering results as JSON to frontend
    res.json({ classifier });
    
  } catch (err) {
    console.error("Error fetching classification result:", err.response?.data || err.message);
    res.status(500).json({
      message: "Error fetching classification result from FastAPI",
      error: err.response?.data || err.message
    });
  }
});


//Regression Result
app.get("/api/regression", async (req, res) => {
  try {
    // Call Python FastAPI service
    const response = await axios.post('http://localhost:8000/regressor', { });

    console.log(response.data);

    const regressor = response.data.regressor || []; 

    // Send all clustering results as JSON to frontend
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

    // Convert CSV → JSON
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




// Real-time prediction endpoint
app.post("/api/predict", async (req, res) => {
  try {
    const payload = req.body; // user input from frontend

    // Call FastAPI real-time prediction
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





app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
