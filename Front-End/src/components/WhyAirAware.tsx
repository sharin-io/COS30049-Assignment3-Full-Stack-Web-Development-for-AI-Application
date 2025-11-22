import React from "react";
import { Card } from "./ui/card";
import {
  Shield,
  TrendingUp,
  Map,
  Heart,
  Clock,
  AlertCircle,
} from "lucide-react";

export const WhyAirAware: React.FC = () => {
  const features = [
    {
      icon: Clock,
      title: "Real-Time Data",
      description:
        "Get instant access to current air quality data updated every few minutes from reliable sources.",
      color: "#2196F3",
    },
    {
      icon: Map,
      title: "Wide Coverage",
      description:
        "Monitor air quality across multiple cities in Malaysia, Thailand, and Singapore.",
      color: "#4CAF50",
    },
    {
      icon: TrendingUp,
      title: "Historical Trends",
      description:
        "View historical data and forecasted predictions to plan your activities better.",
      color: "#FF9800",
    },
    {
      icon: Heart,
      title: "Health Recommendations",
      description:
        "Receive personalized health advice based on current air quality conditions.",
      color: "#F44336",
    },
    {
      icon: Shield,
      title: "Sensitive Groups Alerts",
      description:
        "Special alerts for children, elderly, and people with respiratory conditions.",
      color: "#9C27B0",
    },
    {
      icon: AlertCircle,
      title: "Pollutant Details",
      description:
        "Detailed breakdown of PM2.5, PM10, O3, and other pollutants affecting air quality.",
      color: "#607D8B",
    },
  ];

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-gray-900 dark:text-white mb-3 text-3xl font-bold">
          Why Choose AirAware?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Comprehensive air quality monitoring with actionable insights to help
          you make informed decisions about your health and outdoor activities.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl p-5 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all"
            >
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${feature.color}20` }}
              >
                <Icon className="h-6 w-6" style={{ color: feature.color }} />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2 font-semibold text-lg">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Start monitoring air quality in your area today
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Shield className="h-4 w-4 text-[#4CAF50]" />
          <span>Trusted data sources • Updated in real-time • Free to use</span>
        </div>
      </div>
    </Card>
  );
};

