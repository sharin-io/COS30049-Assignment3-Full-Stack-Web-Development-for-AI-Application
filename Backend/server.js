const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;
const csv = require("csvtojson");

app.use(cors());
app.use(bodyParser.json());

// Classification Result
app.get("/api/classification", async (req, res) => {
  const filePath = path.join(__dirname, "ML/ML-result/Classification_Data.csv");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Clustering result not found" });
  } 

  try {
    const data = await csv().fromFile(filePath);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error reading CSV" });
  }
});

// Regression Result
app.get("/api/regression", async (req, res) => {
  const country = req.query.country; // get country from query
  const filePath = path.join(__dirname, `ML/ML-result/regression/${country}_forecast.csv`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Regression result not found" });
  }

  try {
    let data = await csv().fromFile(filePath);
    
    // Add country field to each row
    data = data.map(row => ({ ...row, Country: country }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error reading CSV" });
  }
});

// Clustering Result
app.get("/api/clustering", async (req, res) => {
  const filePath = path.join(__dirname, "ML/ML-result/DBSCAN_Result.csv");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Clustering result not found" });
  } 

  try {
    const data = await csv().fromFile(filePath);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error reading CSV" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
