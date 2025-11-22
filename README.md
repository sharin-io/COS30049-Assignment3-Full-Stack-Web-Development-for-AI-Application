# COS30049 - Assignment 3: Full-Stack Web Development for AI Application

**Air Quality and Health Application**

A comprehensive air quality monitoring and prediction application with real-time data, historical analysis, and ML-powered forecasts. This full-stack web application integrates React frontend with FastAPI/Express backend and XGBoost machine learning models for accurate AQI predictions.

## 📋 Assignment Information

- **Course**: COS30049 - Full-Stack Web Development for AI Application
- **Assignment**: Assignment 3
- **Project**: Air Quality and Health Application
- **Technology Stack**: React, TypeScript, FastAPI, Node.js, XGBoost

## 🌟 Features

- 🌍 **Real-time AQI Data**: Live air quality data from WAQI API
- 📊 **Interactive Data Visualization**: Multiple chart types using D3.js (Donut charts, Line charts, Prediction charts)
- 🤖 **ML-Powered Predictions**: XGBoost regression model for 180-day AQI forecasting
- 📱 **Responsive Design**: Works seamlessly on mobile and desktop devices
- 🌙 **Dark Mode Support**: Beautiful dark theme with smooth transitions
- 🗺️ **Interactive Maps**: Geographic visualization of air quality data
- ✅ **Input Validation**: Comprehensive validation on both frontend and backend
- 🔄 **Real-time Updates**: Dynamic data updates and responsive UI interactions

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Technology Stack](#technology-stack)
- [Development Guide](#development-guide)
- [Troubleshooting](#troubleshooting)
- [Assignment Rubric Compliance](#assignment-rubric-compliance)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Node.js 14+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

### Verify Installation

```bash
python3 --version  # Should show Python 3.8 or higher
node --version      # Should show v14 or higher
npm --version      # Should show version 6 or higher
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application.git
   cd COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application
   ```

2. **Start Backend Services**:
   ```bash
   cd backend
   chmod +x start.sh  # Make script executable (Linux/Mac)
   ./start.sh
   ```
   
   This script will:
   - ✅ Check for Python 3 and Node.js
   - ✅ Create Python virtual environment
   - ✅ Install all Python dependencies
   - ✅ Install Node.js dependencies
   - ✅ Start Python FastAPI server (port 8000)
   - ✅ Start Node.js Express server (port 3001)

3. **Start Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install  # Only needed first time
   npm run dev  # Start development server
   ```

4. **Access the Application**:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3001
   - **FastAPI Interactive Docs**: http://localhost:8000/docs

### Option 2: Manual Setup

See [Backend README](./backend/README.md) and [Frontend README](./frontend/README.md) for detailed manual setup instructions.

## 📁 Project Structure

```
COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application/
├── backend/                    # Backend services
│   ├── main.py                # FastAPI ML endpoints
│   ├── server.js              # Express API gateway
│   ├── requirements.txt       # Python dependencies
│   ├── package.json           # Node.js dependencies
│   ├── start.sh              # Automated startup script
│   ├── README.md              # Backend API documentation
│   └── ML/                    # Machine learning models
│       ├── data/
│       │   └── Final.csv     # Historical AQI dataset
│       └── ML_model/
│           ├── XGBRegressor.py           # XGBoost regression model
│           ├── ClassificationModels.py    # Classification models
│           └── ClusteringModel.py        # Clustering models
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── lib/               # API clients and utilities
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Utility functions
│   ├── package.json           # Frontend dependencies
│   └── README.md              # Frontend documentation
│
└── README.md                   # This file
```

## 📚 API Documentation

For comprehensive API endpoint documentation with detailed request/response examples, parameters, and status codes, please see:

**👉 [Backend API Documentation](./backend/README.md#-api-endpoint-documentation)**

### Quick Reference

**Base URLs**:
- **Node.js Express API**: `http://localhost:3001`
- **Python FastAPI**: `http://localhost:8000`
- **FastAPI Interactive Docs**: `http://localhost:8000/docs`

**Available Endpoints**:

#### Node.js Express (Port 3001)
- `GET /api/classification` - Get classification results
- `GET /api/regression` - Get regression results
- `GET /api/data` - Get historical AQI data
- `POST /api/predict` - Predict future AQI values (180-day forecast)
- `GET /api/regions` - Get available regions
- `GET /api/waqi/city/:city` - Get real-time AQI for a city
- `GET /api/waqi/location` - Get AQI by geolocation
- `POST /api/waqi/cities` - Get AQI for multiple cities

#### Python FastAPI (Port 8000)
- `POST /classifier` - Classification endpoint
- `POST /regressor` - Regression endpoint
- `POST /predict` - Prediction endpoint
- `GET /docs` - Interactive API documentation (Swagger UI)

**For detailed API documentation with request/response examples, parameters, status codes, and cURL examples, see [Backend API Documentation](./backend/README.md#-api-endpoint-documentation).**

---

## 🛠️ Technology Stack

### Frontend
- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **D3.js**: Data visualization library
- **Axios**: HTTP client
- **React Router**: Client-side routing

### Backend
- **Python FastAPI**: High-performance Python web framework
- **Node.js Express**: JavaScript web framework (API gateway)
- **XGBoost**: Gradient boosting ML framework
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **Uvicorn**: ASGI server for FastAPI

### External APIs
- **WAQI API**: Real-time air quality data

## 💻 Development Guide

### Frontend Development

```bash
cd frontend
npm run dev    # Start dev server
npm run build  # Build for production
npm run preview # Preview production build
```

### Backend Development

```bash
cd backend
./start.sh  # Start both servers using script
```

## 🔍 Troubleshooting

See [Backend README](./backend/README.md) and [Frontend README](./frontend/README.md) for detailed troubleshooting guides.

Common issues:
- **Port conflicts**: Change ports in `backend/server.js` and `backend/main.py`
- **Permission errors**: Use `chmod +x backend/start.sh`
- **Dependency issues**: Delete `node_modules` and reinstall



## 📝 Summary

This application demonstrates:

- ✅ **Full-stack development** with React frontend and FastAPI/Express backend
- ✅ **ML integration** with XGBoost for AQI predictions
- ✅ **RESTful API design** with comprehensive documentation
- ✅ **Interactive visualizations** using D3.js
- ✅ **Error handling** and input validation
- ✅ **Responsive design** with dark mode support
- ✅ **Real-time data** from WAQI API

## 📄 License

This project is for educational purposes (COS30049 Assignment 3).

## 👤 Author

Student submission for COS30049 - Full-Stack Web Development for AI Application

---

**Repository**: `COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application`
**Last Updated**: 2025-01-22

