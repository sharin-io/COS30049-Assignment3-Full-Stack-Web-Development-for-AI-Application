import React from "react";
import { Mail, MapPin, Github, ExternalLink, Heart, Globe } from "lucide-react";

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleInternalNav = (page: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* About Section */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-[#2196F3]" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                AirAware
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 sm:mb-6 max-w-md">
              Real-time air quality monitoring across Southeast Asia. Track AQI data, 
              visualize trends, and make informed decisions about your health and well-being.
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#2196F3] dark:hover:text-blue-400 transition-colors group"
                aria-label="Our GitHub Repository"
              >
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                  <Github className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="text-xs sm:text-sm font-medium">GitHub</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
              <a
                href="mailto:info@airaware.com"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#2196F3] dark:hover:text-blue-400 transition-colors group"
                aria-label="Contact Email"
              >
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="text-xs sm:text-sm font-medium">Contact</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <a
                  href="https://www.airnow.gov/aqi/aqi-basics/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#2196F3] dark:hover:text-blue-400 transition-colors group"
                >
                  <span>About AQI Standards</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                </a>
              </li>
              <li>
                {onNavigate ? (
                  <button
                    onClick={(e) => handleInternalNav('Education', e)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#2196F3] dark:hover:text-blue-400 transition-colors group text-left"
                  >
                    <span>Health Recommendations</span>
                  </button>
                ) : (
                  <a
                    href="https://www.airnow.gov/air-quality-and-health/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#2196F3] dark:hover:text-blue-400 transition-colors group"
                  >
                    <span>Health Recommendations</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </a>
                )}
              </li>
              <li>
                {onNavigate ? (
                  <button
                    onClick={(e) => handleInternalNav('About', e)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#2196F3] dark:hover:text-blue-400 transition-colors group text-left"
                  >
                    <span>Data Sources</span>
                  </button>
                ) : (
                  <a
                    href="https://waqi.info/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#2196F3] dark:hover:text-blue-400 transition-colors group"
                  >
                    <span>Data Sources</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </a>
                )}
              </li>
              <li>
                <a
                  href="https://www.epa.gov/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#2196F3] dark:hover:text-blue-400 transition-colors group"
                >
                  <span>Privacy Policy</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Coverage & Resources */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              Coverage Area
            </h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm mb-4 sm:mb-6">
              <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 text-[#2196F3] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Malaysia</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">10+ cities</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 text-[#2196F3] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Thailand</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">5+ cities</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 text-[#2196F3] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Singapore</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">5+ regions</p>
                </div>
              </div>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-gray-900 dark:text-white font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">
                Navigation
              </h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {onNavigate && ['Home', 'Map', 'Data Visualization', 'Education'].map((page) => (
                  <button
                    key={page}
                    onClick={(e) => handleInternalNav(page, e)}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#2196F3] hover:text-white dark:hover:bg-blue-600 transition-colors active:scale-95"
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              <span>Built with</span>
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 fill-red-500" />
              <span>for healthier communities</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-6 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6">
                <span>© {new Date().getFullYear()} AirAware</span>
                <span className="hidden sm:inline">•</span>
                <span>Data for educational purposes</span>
              </div>
              <a 
                href="https://waqi.info/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#2196F3] transition-colors flex items-center gap-1"
              >
                Powered by WAQI
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};