import React from "react";
import { Card } from "./ui/card";
import { Heart, Shield, Activity, AlertTriangle } from "lucide-react";

interface HealthRecommendationsProps {
  aqi: number;
  city: string;
  country: string;
}

export const HealthRecommendations: React.FC<HealthRecommendationsProps> = ({
  aqi,
  city,
  country,
}) => {
  const getRecommendations = () => {
    if (aqi <= 50) {
      return {
        icon: Activity,
        iconColor: "#4CAF50",
        title: "Excellent Air Quality",
        recommendations: [
          "Perfect for outdoor activities and exercise",
          "Ideal conditions for sports and outdoor events",
          "No health concerns for the general population",
          "Great day to open windows and enjoy fresh air",
        ],
        sensitiveGroups: "All groups can safely enjoy outdoor activities.",
      };
    }
    if (aqi <= 100) {
      return {
        icon: Activity,
        iconColor: "#FFEB3B",
        title: "Moderate Air Quality",
        recommendations: [
          "Generally safe for most people",
          "Sensitive individuals should consider reducing prolonged outdoor activities",
          "Good for light outdoor exercise",
          "Consider closing windows if you have respiratory conditions",
        ],
        sensitiveGroups:
          "Children, elderly, and people with respiratory conditions should limit prolonged outdoor exertion.",
      };
    }
    if (aqi <= 150) {
      return {
        icon: Shield,
        iconColor: "#FF9800",
        title: "Unhealthy for Sensitive Groups",
        recommendations: [
          "Sensitive groups should avoid prolonged outdoor exposure",
          "Everyone should reduce intense outdoor activities",
          "Keep windows closed, especially if you have respiratory conditions",
          "Consider using air purifiers indoors",
        ],
        sensitiveGroups:
          "Active children and adults with respiratory disease should avoid prolonged outdoor exertion.",
      };
    }
    if (aqi <= 200) {
      return {
        icon: AlertTriangle,
        iconColor: "#F44336",
        title: "Unhealthy Air Quality",
        recommendations: [
          "Everyone may begin to experience health effects",
          "Avoid outdoor exercise and strenuous activities",
          "Keep windows and doors closed",
          "Use air purifiers if available",
          "Sensitive groups should stay indoors",
        ],
        sensitiveGroups:
          "Active children and adults with respiratory or heart disease should avoid all outdoor exertion.",
      };
    }
    if (aqi <= 300) {
      return {
        icon: AlertTriangle,
        iconColor: "#9C27B0",
        title: "Very Unhealthy Air Quality",
        recommendations: [
          "Health alert: Everyone may experience serious effects",
          "Avoid all outdoor activities",
          "Stay indoors with windows and doors closed",
          "Use air purifiers with HEPA filters",
          "Consider wearing N95 masks if going outside is necessary",
        ],
        sensitiveGroups:
          "Everyone should avoid outdoor exertion. Sensitive groups should stay indoors.",
      };
    }
    return {
      icon: AlertTriangle,
      iconColor: "#7E0023",
      title: "Hazardous Air Quality",
      recommendations: [
        "Health warning: Emergency conditions",
        "Stay indoors and avoid all outdoor activities",
        "Keep all windows and doors tightly closed",
        "Use high-efficiency air purifiers",
        "Wear N95 masks if you must go outside",
        "Consider relocating if possible",
      ],
      sensitiveGroups:
        "Everyone should avoid all outdoor activities. Stay indoors and protect yourself.",
    };
  };

  const { icon: Icon, iconColor, title, recommendations, sensitiveGroups } =
    getRecommendations();

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Heart
            className="h-6 w-6"
            style={{ color: iconColor }}
          />
          <h2 className="text-gray-900 dark:text-white text-2xl">
            Health Recommendations for {city}, {country}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
          <p
            className="text-lg font-medium"
            style={{ color: iconColor }}
          >
            {title}
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="mb-6">
        <h3 className="text-gray-900 dark:text-white mb-3 font-semibold">
          Recommendations for Everyone:
        </h3>
        <ul className="space-y-2">
          {recommendations.map((rec, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
            >
              <div
                className="h-2 w-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: iconColor }}
              />
              <span className="flex-1">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sensitive Groups */}
      <div
        className="rounded-lg p-4 border-l-4"
        style={{
          backgroundColor: `${iconColor}15`,
          borderLeftColor: iconColor,
        }}
      >
        <h3 className="text-gray-900 dark:text-white mb-2 font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" style={{ color: iconColor }} />
          For Sensitive Groups:
        </h3>
        <p className="text-gray-700 dark:text-gray-300">{sensitiveGroups}</p>
      </div>

      {/* Note */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Sensitive groups include children, elderly, pregnant women, and people
          with respiratory or cardiovascular conditions such as asthma, COPD, or
          heart disease.
        </p>
      </div>
    </Card>
  );
};

