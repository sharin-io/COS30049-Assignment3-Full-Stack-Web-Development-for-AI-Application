import type { AQICategory, HealthImpact } from '../types/aqi.types';
export const getAQICategory = (aqi: number | null | undefined): AQICategory => {
  // Handle invalid values
  if (aqi === null || aqi === undefined || isNaN(aqi) || !isFinite(aqi)) {
    return 'Moderate'; // Default to Moderate for invalid values
  }
  
  // Ensure aqi is a number
  const aqiValue = Number(aqi);
  
  if (aqiValue <= 50) return 'Good';
  if (aqiValue <= 100) return 'Moderate';
  if (aqiValue <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqiValue <= 200) return 'Unhealthy';
  if (aqiValue <= 300) return 'Very Unhealthy';
  if (aqiValue > 300) return 'Hazardous';
  
  // Fallback (should not reach here)
  return 'Moderate';
};

export const getAQIColor = (category: AQICategory): string => {
  const colors = {
    'Good': '#4CAF50',
    'Moderate': '#FFEB3B',
    'Unhealthy for Sensitive Groups': '#FF9800',
    'Unhealthy': '#F44336',
    'Very Unhealthy': '#9C27B0',
    'Hazardous': '#7E0023',
  };
  return colors[category];
};

/**
 * Get AQI color directly from AQI number value
 * @param aqi - Air Quality Index number (can be null/undefined for safety)
 * @returns Hex color code
 */
export const getAQIColorByValue = (aqi: number | null | undefined): string => {
  const category = getAQICategory(aqi);
  return getAQIColor(category);
};

/**
 * Get health message based on AQI value
 * @param aqi - Air Quality Index number (can be null/undefined for safety)
 * @returns Health message string
 */
export const getHealthMessage = (aqi: number | null | undefined): string => {
  // Handle invalid values
  if (aqi === null || aqi === undefined || isNaN(aqi) || !isFinite(aqi)) {
    return 'Air quality data is not available.';
  }
  
  const aqiValue = Number(aqi);
  
  if (aqiValue <= 50)
    return 'Air quality is good. Ideal for outdoor activities!';
  if (aqiValue <= 100)
    return 'Air quality is acceptable for most people.';
  if (aqiValue <= 150)
    return 'Sensitive groups should limit prolonged outdoor exposure.';
  if (aqiValue <= 200)
    return 'Everyone may begin to experience health effects.';
  if (aqiValue <= 300)
    return 'Health alert: Everyone may experience serious effects.';
  return 'Health warning: Emergency conditions. Avoid outdoor activities.';
};

export const getAQITextColor = (category: AQICategory): string => {
  // Return dark text for light backgrounds (Good, Moderate) and light text for dark backgrounds
  if (category === 'Good' || category === 'Moderate') return '#212121';
  return '#FFFFFF';
};

export const healthImpacts: HealthImpact[] = [
  {
    category: 'Good',
    range: '0-50',
    color: '#4CAF50',
    healthImplications: 'Air quality is satisfactory, and air pollution poses little or no risk.',
    cautionaryStatement: 'None',
  },
  {
    category: 'Moderate',
    range: '51-100',
    color: '#FFEB3B',
    healthImplications: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.',
    cautionaryStatement: 'Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.',
  },

  {
    category: 'Unhealthy for Sensitive Groups',
    range: '101-150',
    color: '#FF9800',
    healthImplications: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
    cautionaryStatement: 'Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion; everyone else, especially children, should limit prolonged outdoor exertion.',
  },
  { 
    category: 'Unhealthy',
    range: '151-200',
    color: '#F44336',
    healthImplications: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.',
    cautionaryStatement: 'Active children and adults, and people with respiratory disease, such as asthma, should avoid all outdoor exertion; everyone else, especially children, should limit outdoor exertion.',
  },
  {
    category: 'Very Unhealthy',
    range: '201-300',
    color: '#9C27B0',
    healthImplications: 'Health alert: The risk of health effects is increased for everyone.',
    cautionaryStatement: 'Active children and adults, and people with respiratory disease, such as asthma, should avoid all outdoor exertion; everyone else, especially children, should limit outdoor exertion.',
  },
  {
    category: 'Hazardous',
    range: '301+',
    color: '#7E0023',
    healthImplications: 'Health warning of emergency conditions: everyone is more likely to be affected.',
    cautionaryStatement: 'Everyone should avoid all outdoor exertion.',
  },
];

export const pollutantInfo = {
  pm25: {
    name: 'PM2.5',
    fullName: 'Fine Particulate Matter',
    unit: 'µg/m³',
    description: 'Particles smaller than 2.5 micrometers that can penetrate deep into the lungs.',
  },
  pm10: {
    name: 'PM10',
    fullName: 'Coarse Particulate Matter',
    unit: 'µg/m³',
    description: 'Particles smaller than 10 micrometers that can irritate the respiratory system.',
  },
  co: {
    name: 'CO',
    fullName: 'Carbon Monoxide',
    unit: 'ppm',
    description: 'A colorless, odorless gas that can cause headaches and reduce oxygen delivery.',
  },
  no2: {
    name: 'NO₂',
    fullName: 'Nitrogen Dioxide',
    unit: 'ppb',
    description: 'A reddish-brown gas that can cause respiratory problems and aggravate asthma.',
  },
  o3: {
    name: 'O₃',
    fullName: 'Ozone',
    unit: 'ppb',
    description: 'A gas that can cause breathing problems and reduce lung function.',
  },
  so2: {
    name: 'SO₂',
    fullName: 'Sulfur Dioxide',
    unit: 'ppb',
    description: 'A gas that can cause respiratory problems and aggravate asthma.',
  },
};

export const formatPollutantValue = (value: number, unit: string): string => {
  return `${value.toFixed(2)} ${unit}`;
};
