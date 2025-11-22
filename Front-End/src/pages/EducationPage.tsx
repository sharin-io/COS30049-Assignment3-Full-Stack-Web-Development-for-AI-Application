import React from 'react';
import { Card } from '../components/ui/card';
import { pollutantInfo, healthImpacts, getAQITextColor } from '../utils/aqiUtils';
import {
  AlertCircle,
  Activity,
  Wind,
  ShieldCheck,
  BookOpen,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

export const EducationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-[#2196F3]" />
          </div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            Understanding Air Quality
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Learn about air quality index, pollutants, health impacts, and how to protect yourself
          </p>
        </div>

        {/* AQI Categories */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-6 w-6 text-[#2196F3]" />
            <h2 className="text-gray-900 dark:text-white">AQI Categories & Health Impact</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {healthImpacts.map((impact) => (
              <Card
                key={impact.category}
                className="p-4 border-0 transition-all hover:shadow-lg hover:scale-105"
              >
                <div className="text-center">
                  <div
                    className="px-3 py-6 rounded-lg mb-3"
                    style={{
                      backgroundColor: impact.color,
                      color: getAQITextColor(impact.category),
                    }}
                  >
                    <div className="mb-1">{impact.range}</div>
                  </div>
                  <h4 className="text-gray-900 dark:text-white">{impact.category}</h4>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Pollutant Information */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Wind className="h-6 w-6 text-[#2196F3]" />
            <h2 className="text-gray-900 dark:text-white">Air Pollutants Explained</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(pollutantInfo).map(([key, info]) => (
              <Card
                key={key}
                className="p-6 bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#2196F3' + '20' }}
                  >
                    <span style={{ color: '#2196F3' }}>{info.name}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 dark:text-white mb-1">{info.fullName}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Measured in {info.unit}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{info.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Health Recommendations */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-6 w-6 text-[#2196F3]" />
            <h2 className="text-gray-900 dark:text-white">Health & Prevention Tips</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
                <h3 className="text-gray-900 dark:text-white">When Air Quality is Good</h3>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#4CAF50] mt-1">•</span>
                  <span>Enjoy outdoor activities without restrictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4CAF50] mt-1">•</span>
                  <span>Open windows for natural ventilation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4CAF50] mt-1">•</span>
                  <span>Exercise outdoors for optimal health benefits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4CAF50] mt-1">•</span>
                  <span>Take advantage of fresh air for better sleep</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-[#F44336]" />
                <h3 className="text-gray-900 dark:text-white">When Air Quality is Poor</h3>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#F44336] mt-1">•</span>
                  <span>Limit outdoor activities, especially for sensitive groups</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F44336] mt-1">•</span>
                  <span>Keep windows and doors closed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F44336] mt-1">•</span>
                  <span>Use air purifiers indoors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F44336] mt-1">•</span>
                  <span>Wear N95 masks when going outside</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="h-6 w-6 text-[#2196F3]" />
            <h2 className="text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </div>

          <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-md">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-gray-900 dark:text-white">
                  What is the Air Quality Index (AQI)?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-300">
                  The Air Quality Index is a standardized indicator of air quality. It tells you how clean or polluted
                  your air is, and what associated health effects might be a concern. The AQI focuses on health effects
                  you may experience within a few hours or days after breathing polluted air.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-gray-900 dark:text-white">
                  How often is the data updated?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-300">
                  Our monitoring stations update air quality data in real-time, typically every 15-30 minutes. The
                  dashboard displays the most recent readings along with a timestamp showing when each measurement was
                  taken.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-gray-900 dark:text-white">
                  Who is most at risk from air pollution?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-300">
                  Sensitive groups include children, older adults, people with heart or lung disease (including asthma),
                  and those who are active outdoors. These groups should pay particular attention to air quality
                  forecasts and take precautions when AQI levels are elevated.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-gray-900 dark:text-white">
                  What causes poor air quality?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-300">
                  Poor air quality can result from various sources including vehicle emissions, industrial facilities,
                  power plants, wildfires, and weather conditions. In Southeast Asia, seasonal burning and transboundary
                  haze are additional factors that can significantly impact air quality.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-gray-900 dark:text-white">
                  How can I protect myself from air pollution?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-300">
                  Monitor the AQI regularly, limit outdoor activities when levels are unhealthy, use air purifiers
                  indoors, keep windows closed during poor air quality days, wear appropriate masks (N95 or equivalent)
                  when necessary, and consider relocating exercise indoors during high pollution periods.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>

        {/* Additional Resources */}
        <Card className="p-8 bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-0 shadow-md">
          <div className="text-center">
            <h3 className="text-gray-900 dark:text-white mb-4">Stay Informed</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Knowledge is your best defense against air pollution. Check the AQI daily, understand the health
              implications, and take appropriate action to protect yourself and your loved ones.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-gray-400">Data Source</p>
                <p className="text-gray-900 dark:text-white">Environmental Agencies</p>
              </div>
              <div className="px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-gray-400">Update Frequency</p>
                <p className="text-gray-900 dark:text-white">Real-time (15-30 min)</p>
              </div>
              <div className="px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-gray-400">Coverage</p>
                <p className="text-gray-900 dark:text-white">Southeast Asia</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
