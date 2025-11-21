import React from "react";
import { Mail, MapPin, Github } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-gray-900 dark:text-white mb-3">
              About AirAware
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Real-time air quality monitoring across Southeast
              Asia. Track AQI data, visualize trends, and make
              informed decisions about your health.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 dark:text-white mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#2196F3] transition-colors"
                >
                  About AQI Standards
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#2196F3] transition-colors"
                >
                  Health Recommendations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#2196F3] transition-colors"
                >
                  Data Sources
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#2196F3] transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Coverage */}
          <div>
            <h3 className="text-gray-900 dark:text-white mb-3">
              Coverage Area
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 text-[#2196F3]" />
                <span>Malaysia (10 cities)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 text-[#2196F3]" />
                <span>Thailand (5 cities)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 text-[#2196F3]" />
                <span>Singapore (5 regions)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1">
              Built with care for healthier communities.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-[#2196F3] transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-[#2196F3] transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              © 2025 AirAware. Data for educational purposes.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};