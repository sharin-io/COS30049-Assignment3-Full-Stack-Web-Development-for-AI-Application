import React from 'react';
import { Card } from '../components/ui/card';
import { SiGithub } from "react-icons/si";
import { Cloud, Mail, Globe, Users, Target, Database, Heart, Activity } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#2196F3] flex items-center justify-center">
              <Cloud className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-gray-900 dark:text-white mb-4">About AirAware</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A comprehensive air quality monitoring platform dedicated to providing real-time, accurate, and accessible
            environmental data across Southeast Asia
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8 bg-white dark:bg-gray-800 border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#2196F3]/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-[#2196F3]" />
              </div>
              <h2 className="text-gray-900 dark:text-white">Our Mission</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              To empower communities across Southeast Asia with real-time air quality information, enabling informed
              decisions about health and outdoor activities. We believe that environmental awareness is the first step
              toward meaningful change.
            </p>
          </Card>

          <Card className="p-8 bg-white dark:bg-gray-800 border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-[#4CAF50]" />
              </div>
              <h2 className="text-gray-900 dark:text-white">Our Vision</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              A future where everyone has access to clean air and the knowledge to protect their health. Through
              transparency, education, and technology, we strive to contribute to healthier, more sustainable communities.
            </p>
          </Card>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-gray-900 dark:text-white">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-lg bg-[#2196F3]/10 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-[#2196F3]" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-3">Real-Time Monitoring</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Live air quality data updated every 15-30 minutes from monitoring stations across the region
              </p>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-lg bg-[#FF9800]/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-[#FF9800]" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-3">Regional Coverage</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive monitoring across Malaysia, Thailand, and Singapore with plans to expand further
              </p>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-[#4CAF50]" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-3">User-Friendly Design</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Intuitive interface designed with accessibility and usability principles at its core
              </p>
            </Card>
          </div>
        </div>

        {/* Data Sources */}
        <Card className="p-8 bg-white dark:bg-gray-800 border-0 shadow-lg mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-6 w-6 text-[#2196F3]" />
            <h2 className="text-gray-900 dark:text-white">Data Sources & Methodology</h2>
          </div>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              AirAware aggregates data from official environmental monitoring agencies and research institutions across
              Southeast Asia. Our platform processes measurements from over 50 monitoring stations, providing
              comprehensive coverage of urban and semi-urban areas.
            </p>
            <p>
              We measure six key pollutants: PM2.5, PM10, Carbon Monoxide (CO), Nitrogen Dioxide (NO₂), Ozone (O₃), and
              Sulfur Dioxide (SO₂). The Air Quality Index is calculated using internationally recognized standards,
              ensuring consistency and reliability.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-900 dark:text-white mb-1">50+ Stations</p>
                <p className="text-gray-500 dark:text-gray-400">Monitoring Network</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-900 dark:text-white mb-1">6 Pollutants</p>
                <p className="text-gray-500 dark:text-gray-400">Comprehensive Tracking</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-900 dark:text-white mb-1">15-30 min</p>
                <p className="text-gray-500 dark:text-gray-400">Update Frequency</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Technology Stack */}
        <Card className="p-8 bg-white dark:bg-gray-800 border-0 shadow-lg mb-12">
          <h2 className="mb-6 text-gray-900 dark:text-white">Built With Modern Technology</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'TypeScript',
              'React',
              'Tailwind CSS',
              'Recharts',
              'Shadcn UI',
              'Lucide Icons + React Icons',
              'Responsive Design',
              'Dark Mode',
            ].map((tech) => (
              <div
                key={tech}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center text-gray-700 dark:text-gray-300"
              >
                {tech}
              </div>
            ))}
          </div>
        </Card>

        {/* Design Principles */}
        <Card className="p-8 bg-white dark:bg-gray-800 border-0 shadow-lg mb-12">
          <h2 className="mb-6 text-gray-900 dark:text-white">Design Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-gray-900 dark:text-white mb-3">Usability Heuristics</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#2196F3] mt-1">•</span>
                  <span>Visibility of system status with real-time updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2196F3] mt-1">•</span>
                  <span>Match between system and real world using familiar terms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2196F3] mt-1">•</span>
                  <span>User control with easy navigation and filtering</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2196F3] mt-1">•</span>
                  <span>Consistency in design patterns and interactions</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white mb-3">Accessibility</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#4CAF50] mt-1">•</span>
                  <span>WCAG-compliant color contrast ratios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4CAF50] mt-1">•</span>
                  <span>Keyboard navigation support throughout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4CAF50] mt-1">•</span>
                  <span>Dark mode for reduced eye strain</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4CAF50] mt-1">•</span>
                  <span>Mobile-first responsive design</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Contact Section */}
        <Card className="p-8 bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-0 shadow-lg">
          <div className="text-center">
            <h2 className="text-gray-900 dark:text-white mb-4">Get In Touch</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Have questions, suggestions, or want to collaborate? We'd love to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:info@airaware.app"
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-300"
              >
                <Mail className="h-5 w-5 text-[#2196F3]" />
                <span>info@airaware.app</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-300"
              >
                <SiGithub className="h-5 w-5 text-[#2196F3]" />
                <span>GitHub</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-300"
              >
                <Globe className="h-5 w-5 text-[#2196F3]" />
                <span>Website</span>
              </a>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
