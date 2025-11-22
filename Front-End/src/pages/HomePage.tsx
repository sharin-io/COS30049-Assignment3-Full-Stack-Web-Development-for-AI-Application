import React from "react";
import type { AQIData } from "../types/aqi.types";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { HealthRecommendations } from "../components/HealthRecommendations";
import { FeaturedCities } from "../components/FeaturedCities";
import { WhyAirAware } from "../components/WhyAirAware";
import {
  MapPin,
  Map,
  Search,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  AlertCircle,
  Activity,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { waqiApi } from "../lib/waqiApi";
import { getAQICategory, getAQIColorByValue, getHealthMessage } from "../utils/aqiUtils";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedLocation, setSelectedLocation] = React.useState<AQIData | null>(null);
  const [locations, setLocations] = React.useState<AQIData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [locateLoading, setLocateLoading] = React.useState(false);
  const [error, setError] = React.useState<{
    type: string;
    message: string;
    suggestions: string[];
    originalQuery: string;
  } | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);
  const [searchSuggestions, setSearchSuggestions] = React.useState<Array<{
    uid: number;
    name: string;
    aqi: number | null;
    time: string;
    url: string;
    geo: [number, number] | null;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [searchingSuggestions, setSearchingSuggestions] = React.useState(false);
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load default featured cities on mount with backup cities
  React.useEffect(() => {
    const loadDefaultCities = async () => {
      setLoading(true);
      setError(null);
      try {
        // 6 Southeast Asian countries with search terms and backup cities
        const citiesWithBackups = [
          { searchTerm: "kuala lumpur", backup: "penang", country: "Malaysia" }, // Malaysia
          { searchTerm: "bangkok", backup: "chiang mai", country: "Thailand" }, // Thailand
          { searchTerm: "singapore", backup: "singapore", country: "Singapore" }, // Singapore 
          { searchTerm: "jakarta", backup: "surabaya", country: "Indonesia" }, // Indonesia
          { searchTerm: "manila", backup: "cebu", country: "Philippines" }, // Philippines
            { searchTerm: "hanoi", backup: "viet tri", country: "Vietnam" }, // Vietnam
        ];

        // Fetch cities with fallback to backup if primary fails
        const fetchCityWithFallback = async (cityConfig: { searchTerm: string; backup: string; country: string }): Promise<AQIData | null> => {
          // Helper function to validate city data
          const isValidCityData = (data: any): data is AQIData => {
            return data && 
                   data !== null && 
                   data !== undefined && 
                   data.city !== undefined && 
                   data.city !== null && 
                   data.aqi !== null && 
                   data.aqi !== undefined && 
                   !isNaN(data.aqi) && 
                   isFinite(data.aqi);
          };

          // Try to find the city using search API first, then use the first result
          try {
            const searchResults = await waqiApi.search(cityConfig.searchTerm);
            if (searchResults && searchResults.length > 0) {
              // Find the best match (prefer city-level stations, not specific districts)
              const cityMatch = searchResults.find(result => 
                result.name.toLowerCase().includes(cityConfig.searchTerm.toLowerCase()) ||
                cityConfig.searchTerm.toLowerCase().includes(result.name.toLowerCase().split(',')[0])
              ) || searchResults[0];
              
              // Use station UID to fetch data
              if (cityMatch.uid) {
                const primaryData = await waqiApi.getCityFeed(`@${cityMatch.uid}`, true);
            if (isValidCityData(primaryData)) {
              return primaryData;
            }
              }
            }
          } catch (searchError) {
            // Search failed, will try direct city name formats below
          }

          // Try direct city feed with different formats (suppress errors as many will fail)
          // Try all common formats - WAQI API accepts various formats
          const searchTermLower = cityConfig.searchTerm.toLowerCase();
          const cityFormats: string[] = [
            searchTermLower.replace(/\s+/g, "-"), // kuala-lumpur, ho-chi-minh
            searchTermLower.replace(/\s+/g, ""), // kualalumpur, hochiminh
            searchTermLower, // kuala lumpur, ho chi minh
          ];
          
          // Add city-specific known formats
          if (searchTermLower.includes("ho chi minh")) {
            cityFormats.push("ho-chi-minh-city");
            cityFormats.push("saigon");
          }
          if (searchTermLower.includes("kuala lumpur")) {
            cityFormats.push("kl");
          }

          for (const format of cityFormats) {
            try {
              const primaryData = await waqiApi.getCityFeed(format, true); // Suppress error logs
              if (isValidCityData(primaryData)) {
                return primaryData;
              }
            } catch (primaryError) {
              continue; // Try next format
            }
          }

          // If primary search failed, try backup
          try {
            const backupSearchResults = await waqiApi.search(cityConfig.backup);
            if (backupSearchResults && backupSearchResults.length > 0) {
              const backupMatch = backupSearchResults[0];
              if (backupMatch.uid) {
                const backupData = await waqiApi.getCityFeed(`@${backupMatch.uid}`);
            if (isValidCityData(backupData)) {
              return backupData;
            }
              }
            }
          } catch (backupSearchError) {
            // Backup search failed, try direct backup city name with all formats
            const backupLower = cityConfig.backup.toLowerCase();
            const backupFormats: string[] = [
              backupLower.replace(/\s+/g, "-"), // hyphenated
              backupLower.replace(/\s+/g, ""), // no spaces
              backupLower, // original
            ];
            
            for (const format of backupFormats) {
              try {
                const backupData = await waqiApi.getCityFeed(format, true); // Suppress error logs
                if (isValidCityData(backupData)) {
                  return backupData;
                }
              } catch (backupError) {
                continue;
              }
            }
          }

          // Both primary and backup failed
          console.error(`Failed to fetch data for ${cityConfig.searchTerm} and backup ${cityConfig.backup}`);
          return null;
        };

        // Fetch all cities with fallbacks
        const cityDataPromises = citiesWithBackups.map(cityConfig => 
          fetchCityWithFallback(cityConfig)
        );
        
        const cityResults = await Promise.all(cityDataPromises);
        // Filter out null results and validate data integrity
        const validCityData = cityResults.filter((data): data is AQIData => {
          if (!data || data === null || data === undefined) return false;
          if (!data.city || data.city === null || data.city === undefined) return false;
          if (!data.country || data.country === null || data.country === undefined) return false;
          if (data.aqi === null || data.aqi === undefined || isNaN(data.aqi) || !isFinite(data.aqi)) return false;
          return true;
        });
        
        setLocations(validCityData);
        
        // Set first location as selected only if we have valid data with valid AQI
        if (validCityData.length > 0 && !selectedLocation) {
          // Find the first city with valid AQI
          const firstValidCity = validCityData.find(city => 
            city.aqi !== null && 
            city.aqi !== undefined && 
            !isNaN(city.aqi) && 
            isFinite(city.aqi)
          );
          if (firstValidCity) {
            setSelectedLocation(firstValidCity);
          }
        }
        
        if (validCityData.length === 0) {
          setError({
            type: 'loading_error',
            message: "Unable to load air quality data for featured cities. Please try again later.",
            suggestions: ["Try refreshing the page", "Check your internet connection"],
            originalQuery: ""
          });
        } else if (validCityData.length < 6) {
          console.warn(`Only loaded ${validCityData.length} out of 6 featured cities`);
        }
        
        setLastUpdate(new Date());
      } catch (err: any) {
        console.error("Failed to load default cities:", err);
        setError({
          type: 'loading_error',
          message: err.message || "Failed to load air quality data. Please try again later.",
          suggestions: ["Try refreshing the page", "Check your internet connection"],
          originalQuery: ""
        });
      } finally {
        setLoading(false);
      }
    };

    loadDefaultCities();
  }, []);

  // Auto-refresh data every 5 minutes
  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (locations.length > 0 && selectedLocation && 
          selectedLocation.city && 
          selectedLocation.country) {
        try {
          // Refresh selected location
          const cityName = selectedLocation.city.toLowerCase().replace(/\s+/g, "-");
          const updated = await waqiApi.getCityFeed(cityName);
          
          // Validate the updated data before using it
          if (updated && 
              updated.city && 
              updated.country && 
              updated.aqi !== null && 
              updated.aqi !== undefined && 
              !isNaN(updated.aqi) && 
              isFinite(updated.aqi)) {
            setSelectedLocation(updated);
            
            // Update in locations array
            setLocations((prev) =>
              prev.map((loc) =>
                loc.city === updated.city && loc.country === updated.country
                  ? updated
                  : loc
              )
            );
            
            setLastUpdate(new Date());
          } else {
            console.warn("Failed to refresh data: Invalid data received for", selectedLocation.city);
            // If refresh fails, try to find a valid location from the list
            const validLocation = locations.find(loc => 
              loc && 
              loc.aqi !== null && 
              loc.aqi !== undefined && 
              !isNaN(loc.aqi) && 
              isFinite(loc.aqi) &&
              loc.city &&
              loc.country
            );
            if (validLocation) {
              setSelectedLocation(validLocation);
            }
          }
        } catch (err) {
          console.error("Failed to refresh data:", err);
          // If refresh fails, try to find a valid location from the list
          const validLocation = locations.find(loc => 
            loc && 
            loc.aqi !== null && 
            loc.aqi !== undefined && 
            !isNaN(loc.aqi) && 
            isFinite(loc.aqi) &&
            loc.city &&
            loc.country
          );
          if (validLocation) {
            setSelectedLocation(validLocation);
          }
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [locations, selectedLocation]);

  const handleLocateMe = async () => {
    setLocateLoading(true);
    setLoading(true);
    setError(null);
    try {
      const locationData = await waqiApi.getCurrentLocationFeed();
      
      // Validate the fetched data before using it
      if (locationData && 
          locationData.city && 
          locationData.country && 
          locationData.aqi !== null && 
          locationData.aqi !== undefined && 
          !isNaN(locationData.aqi) && 
          isFinite(locationData.aqi)) {
        setSelectedLocation(locationData);
        
        // Add to locations if not already present
        setLocations((prev) => {
          const exists = prev.some(
            (loc) =>
              loc.city === locationData.city && loc.country === locationData.country
          );
          if (!exists) {
            return [locationData, ...prev];
          }
          return prev;
        });
        
        setLastUpdate(new Date());
      } else {
        throw new Error("Invalid air quality data received for your location. Please try again or search for a city.");
      }
    } catch (err: any) {
      const suggestions = getCitySuggestions("");
      setError({
        type: 'location_error',
        message: err.message || "Failed to get your location. Please make sure location services are enabled or try searching for a city instead.",
        suggestions: suggestions,
        originalQuery: ""
      });
    } finally {
      setLocateLoading(false);
      setLoading(false);
    }
  };

  // Helper: Check if query is a known city name (not a district)
  const isKnownCity = (query: string): boolean => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const queryNormalized = normalize(query);
    
    const knownCities: Record<string, string[]> = {
      "kuala lumpur": ["kuala lumpur", "kl", "kualalumpur"],
      "bangkok": ["bangkok"],
      "singapore": ["singapore", "sg"],
      "jakarta": ["jakarta"],
      "manila": ["manila"],
      "ho chi minh city": ["ho chi minh city", "saigon", "hcmc"],
      "hanoi": ["hanoi"],
      "penang": ["penang", "georgetown"],
      "chiang mai": ["chiang mai", "chiang-mai"],
      "surabaya": ["surabaya"],
      "cebu": ["cebu"],
    };
    
    for (const [cityKey, variations] of Object.entries(knownCities)) {
      if (variations.some(v => normalize(v) === queryNormalized) || normalize(cityKey) === queryNormalized) {
        return true;
      }
    }
    return false;
  };

  // Helper: Get districts for a city (only call if city search fails)
  const getCityDistricts = (query: string): string[] => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const queryNormalized = normalize(query);
    
        // WAQI API format: use hyphenated names without commas
        // Districts are searched as standalone names (e.g., "cheras" not "cheras, kuala-lumpur")
        const districts: Record<string, string[]> = {
          "kuala lumpur": [
            "cheras", // Try district name alone
            "batu-muda",
            "petaling-jaya",
            "shah-alam",
            "subang-jaya",
            "ampang"
          ],
          "bangkok": [
            "bang-rak",
            "prawet",
            "phra-nakhon",
            "bang-khae",
            "nong-chok",
            "si-lom",
            "chatuchak",
            "siam",
            "sukhumvit",
            "sathon",
            "lat-krabang"
          ],
          "jakarta": [
            "central-jakarta",
            "south-jakarta",
            "north-jakarta",
            "east-jakarta",
            "west-jakarta"
          ],
          "manila": [
            "makati",
            "quezon-city",
            "pasay",
            "mandaluyong"
          ],
          "singapore": [
            // Singapore doesn't have district-level data in WAQI API
            // Only city-level data is available
          ],
        };
    
    for (const [city, districtList] of Object.entries(districts)) {
      const cityNormalized = normalize(city);
      if (queryNormalized === cityNormalized || 
          queryNormalized.includes(cityNormalized) || 
          cityNormalized.includes(queryNormalized)) {
        return districtList;
      }
    }
    return [];
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setLoading(true);
    setError(null);
    try {
      const originalQuery = searchQuery.trim();
      const isCityQuery = isKnownCity(originalQuery);
      
      // Phase 1: Try city-level searches first
      // WAQI API accepts: lowercase with hyphens (e.g., "kuala-lumpur") or simple lowercase
      // Don't use underscores, commas, or special formats
      const originalLower = originalQuery.toLowerCase().trim();
      
      // Generate valid WAQI API formats (remove duplicates)
      const format1 = originalLower.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); // e.g., "kuala-lumpur"
      const format2 = originalLower.replace(/\s+/g, "").replace(/[^a-z0-9]/g, ""); // e.g., "kualalumpur"
      
      // Try formats in order: original, hyphenated, no-spaces (if different)
      const cityVariations: string[] = [];
      if (originalLower.length > 0) {
        cityVariations.push(originalLower); // Try original format first
      }
      if (format1 && format1 !== originalLower && format1.length > 0) {
        cityVariations.push(format1);
      }
      if (format2 && format2 !== originalLower && format2 !== format1 && format2.length > 0) {
        cityVariations.push(format2);
      }

      let locationData: AQIData | null = null;
      let triedVariations: string[] = [];

      // Try city-level searches first (strict matching - only accept exact city matches)
      for (const cityName of cityVariations) {
        if (triedVariations.includes(cityName)) continue;
        triedVariations.push(cityName);
        
        try {
          const data = await waqiApi.getCityFeed(cityName);
          
          if (data && 
              data.city && 
              data.country && 
              data.aqi !== null && 
              data.aqi !== undefined && 
              !isNaN(data.aqi) && 
              isFinite(data.aqi)) {
            
            // For city queries, only accept if returned city matches the search exactly (strict)
            // Don't accept district matches when searching for a city
            if (isCityQuery) {
              // Only accept if returned city is the searched city or a known variation
              if (isCityMatchStrict(originalQuery, data.city, data.country)) {
                locationData = data;
                break;
              }
            } else {
              // For non-city queries (districts), use more flexible matching
              if (isCityMatch(originalQuery, data.city, data.country)) {
                locationData = data;
                break;
              }
            }
          }
        } catch (err) {
          continue;
        }
      }

      // Phase 2: If city search failed and it was a city query, try districts
      if (!locationData && isCityQuery) {
        const cityDistricts = getCityDistricts(originalQuery);
        
        for (const districtName of cityDistricts) {
          if (triedVariations.includes(districtName)) continue;
          triedVariations.push(districtName);
          
          try {
            // Suppress error logs for district searches - many districts don't exist in WAQI
            const data = await waqiApi.getCityFeed(districtName, true);
            
            if (data && 
                data.city && 
                data.country && 
                data.aqi !== null && 
                data.aqi !== undefined && 
                !isNaN(data.aqi) && 
                isFinite(data.aqi)) {
              
              // Accept district matches when we're explicitly searching districts
              if (isDistrictMatch(originalQuery, districtName, data.city, data.country)) {
                locationData = data;
                break;
              }
            }
          } catch (err) {
            continue;
          }
        }
      }

      if (locationData) {
        setSelectedLocation(locationData);
        
        // Add to locations if not already present
        setLocations((prev) => {
          const exists = prev.some(
            (loc) =>
              loc.city === locationData!.city && loc.country === locationData!.country
          );
          if (!exists) {
            return [locationData!, ...prev];
          }
          return prev;
        });
        
        setSearchQuery("");
        setLastUpdate(new Date());
      } else {
        // No valid data found after trying all variations, or returned city didn't match
        // Show helpful error message with suggestions
        const suggestions = getCitySuggestions(originalQuery);
        setError({
          type: 'city_not_found',
          message: `We couldn't find air quality data for "${originalQuery}". The API may have returned a different location nearby.`,
          suggestions: suggestions,
          originalQuery: originalQuery
        });
      }
    } catch (err: any) {
      const suggestions = getCitySuggestions(searchQuery.trim());
      setError({
        type: 'search_error',
        message: `Unable to search for "${searchQuery.trim()}"`,
        suggestions: suggestions,
        originalQuery: searchQuery.trim()
      });
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  };

  // Strict city matching - only accepts exact city matches, rejects districts
  const isCityMatchStrict = (searchQuery: string, returnedCity: string, returnedCountry: string): boolean => {
    const normalize = (str: string) => str.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const searchNormalized = normalize(searchQuery);
    const cityNormalized = normalize(returnedCity);
    const countryNormalized = normalize(returnedCountry);
    
    // First, check if the normalized strings match exactly (handles case differences)
    if (searchNormalized === cityNormalized) {
      return true;
    }
    
    // Check if one contains the other (handles cases like "singapore" vs "Singapore")
    // This is important because WAQI API may return station names in local languages
    if (cityNormalized.includes(searchNormalized) || searchNormalized.includes(cityNormalized)) {
      // But only if they're similar enough (to avoid false matches)
      const similarity = calculateSimilarity(searchNormalized, cityNormalized);
      if (similarity >= 0.6) {
        return true;
      }
    }
    
    // City mappings with their known variations
    const cityMappings: Record<string, { variations: string[], countries: string[] }> = {
      "kuala lumpur": { 
        variations: ["kuala lumpur", "kl", "kualalumpur"],
        countries: ["malaysia", "my"]
      },
      "bangkok": { 
        variations: ["bangkok", "krung thep", "krungthep", "กรุงเทพ"],
        countries: ["thailand", "th"]
      },
      "singapore": { 
        variations: ["singapore", "sg"],
        countries: ["singapore", "sg"]
      },
      "jakarta": { 
        variations: ["jakarta"],
        countries: ["indonesia", "id"]
      },
      "manila": { 
        variations: ["manila"],
        countries: ["philippines", "ph"]
      },
      "ho chi minh city": { 
        variations: ["ho chi minh city", "saigon", "hcmc"],
        countries: ["vietnam", "vn"]
      },
      "hanoi": { 
        variations: ["hanoi"],
        countries: ["vietnam", "vn"]
      },
      "penang": { 
        variations: ["penang", "georgetown"],
        countries: ["malaysia", "my"]
      },
      "chiang mai": { 
        variations: ["chiang mai", "chiang-mai"],
        countries: ["thailand", "th"]
      },
      "surabaya": { 
        variations: ["surabaya"],
        countries: ["indonesia", "id"]
      },
      "cebu": { 
        variations: ["cebu"],
        countries: ["philippines", "ph"]
      },
    };
    
    // Check if search query matches a known city
    for (const [cityKey, cityData] of Object.entries(cityMappings)) {
      const cityKeyNormalized = normalize(cityKey);
      
      // Check if search query matches this city
      if (cityData.variations.some(v => normalize(v) === searchNormalized) || cityKeyNormalized === searchNormalized) {
        // Check if returned country matches expected country for this city
        const countryMatches = cityData.countries.some(c => normalize(c) === countryNormalized || countryNormalized.includes(normalize(c)));
        
        // Accept if:
        // 1. Returned city matches any variation or the city key, OR
        // 2. Returned city contains the city key and country matches (handles station names in local languages)
        if (cityData.variations.some(v => normalize(v) === cityNormalized) || 
            cityKeyNormalized === cityNormalized ||
            (cityNormalized.includes(cityKeyNormalized) && countryMatches) ||
            (cityKeyNormalized.includes(cityNormalized) && countryMatches)) {
          return true;
        }
        // Reject district matches when searching for a city
        return false;
      }
    }
    
    // For unknown cities, check if names are very similar (>= 70% similarity for strict matching)
    // Also check if country matches to increase confidence
    const similarity = calculateSimilarity(searchNormalized, cityNormalized);
    if (similarity >= 0.7) {
      return true;
    }
    
    // If similarity is lower but still reasonable (>= 0.5) and one contains the other, accept it
    // This handles cases where API returns station names with additional text
    if (similarity >= 0.5 && (cityNormalized.includes(searchNormalized) || searchNormalized.includes(cityNormalized))) {
      return true;
    }
    
    return false;
  };

  // Flexible matching - accepts city and district matches (used for district searches)
  const isCityMatch = (searchQuery: string, returnedCity: string, _returnedCountry: string): boolean => {
    const normalize = (str: string) => str.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const searchNormalized = normalize(searchQuery);
    const cityNormalized = normalize(returnedCity);
    
    // Check if city name contains search query or vice versa
    if (cityNormalized.includes(searchNormalized) || searchNormalized.includes(cityNormalized)) {
      return true;
    }
    
    // Use similarity check - if less than 60% similar, don't consider it a match
    const similarity = calculateSimilarity(searchNormalized, cityNormalized);
    return similarity >= 0.6;
  };

  // Check if returned data matches the searched district
  const isDistrictMatch = (_cityQuery: string, searchedDistrict: string, returnedCity: string, _returnedCountry: string): boolean => {
    const normalize = (str: string) => str.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const districtNormalized = normalize(searchedDistrict);
    const returnedNormalized = normalize(returnedCity);
    
    // Check if returned city matches the district we searched for
    if (returnedNormalized.includes(districtNormalized) || districtNormalized.includes(returnedNormalized)) {
      return true;
    }
    
    // Also check if returned city contains the district name without the city suffix
    const districtName = searchedDistrict.split(',')[0].trim();
    const districtNameNormalized = normalize(districtName);
    if (returnedNormalized.includes(districtNameNormalized) || districtNameNormalized.includes(returnedNormalized)) {
      return true;
    }
    
    return false;
  };

  // Helper function to calculate string similarity (0-1)
  const calculateSimilarity = (str1: string, str2: string): number => {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    // Check if shorter string is contained in longer string
    if (longer.includes(shorter)) {
      return shorter.length / longer.length;
    }
    
    // Calculate Jaro-Winkler-like similarity
    let matches = 0;
    const maxDistance = Math.floor(longer.length / 2) - 1;
    
    for (let i = 0; i < shorter.length; i++) {
      const char = shorter[i];
      const start = Math.max(0, i - maxDistance);
      const end = Math.min(i + maxDistance + 1, longer.length);
      
      if (longer.substring(start, end).includes(char)) {
        matches++;
      }
    }
    
    return matches / longer.length;
  };

  // Helper function to get city suggestions based on search query (excluding searched city)
  const getCitySuggestions = (query: string): string[] => {
    const queryLower = query.toLowerCase().trim();
    const normalize = (str: string) => str.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const queryNormalized = normalize(query);
    
    // Popular Southeast Asian cities
    const popularCities = [
      { name: "Kuala Lumpur", variations: ["kuala lumpur", "kl", "kuala-lumpur"], country: "Malaysia" },
      { name: "Bangkok", variations: ["bangkok"], country: "Thailand" },
      { name: "Singapore", variations: ["singapore", "sg"], country: "Singapore" },
      { name: "Jakarta", variations: ["jakarta"], country: "Indonesia" },
      { name: "Manila", variations: ["manila"], country: "Philippines" },
      { name: "Ho Chi Minh City", variations: ["ho chi minh city", "saigon", "ho-chi-minh-city"], country: "Vietnam" },
      { name: "Hanoi", variations: ["hanoi"], country: "Vietnam" },
      { name: "Penang", variations: ["penang", "georgetown"], country: "Malaysia" },
      { name: "Chiang Mai", variations: ["chiang mai", "chiang-mai"], country: "Thailand" },
      { name: "Surabaya", variations: ["surabaya"], country: "Indonesia" },
      { name: "Cebu", variations: ["cebu"], country: "Philippines" },
    ];

    // Check if search query matches a known city to exclude it from suggestions
    const searchedCity = popularCities.find(city => 
      city.variations.some(variation => {
        const variationNormalized = normalize(variation);
        return variationNormalized === queryNormalized || 
               queryNormalized.includes(variationNormalized) ||
               variationNormalized.includes(queryNormalized);
      })
    );

    // Filter out the searched city from suggestions
    const availableCities = searchedCity
      ? popularCities.filter(city => city.name !== searchedCity.name)
      : popularCities;

    // If searched city is found, suggest alternatives from same country and nearby countries
    if (searchedCity) {
      const sameCountryCities = availableCities.filter(city => city.country === searchedCity.country);
      const otherCities = availableCities.filter(city => city.country !== searchedCity.country);
      
      // Prioritize: 2 from same country (if available), then 3 from other countries
      const suggestions: string[] = [];
      if (sameCountryCities.length > 0) {
        suggestions.push(...sameCountryCities.slice(0, 2).map(c => c.name));
      }
      suggestions.push(...otherCities.slice(0, 5 - suggestions.length).map(c => c.name));
      return suggestions.slice(0, 5);
    }

    // If no match found, find cities with similar names
    const matchingCities = availableCities.filter(city => 
      city.variations.some(variation => 
        variation.includes(queryLower) || queryLower.includes(variation)
      )
    ).slice(0, 5);

    // If no matches, return general suggestions (excluding searched city)
    if (matchingCities.length === 0) {
      return availableCities.slice(0, 5).map(city => city.name);
    }

    return matchingCities.map(city => city.name);
  };

  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return "1 min ago";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  };

  // Debounced search for autocomplete suggestions
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if query is too short
    if (value.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Set loading state
    setSearchingSuggestions(true);
    setShowSuggestions(true);

    // Debounce search - wait 300ms after user stops typing
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await waqiApi.search(value.trim());
        setSearchSuggestions(results.slice(0, 10)); // Limit to 10 results
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
        setSearchSuggestions([]);
      } finally {
        setSearchingSuggestions(false);
      }
    }, 300);
  };

  // Handle selecting a suggestion
  const handleSuggestionSelect = async (suggestion: {
    uid: number;
    name: string;
    aqi: number | null;
    time: string;
    url: string;
    geo: [number, number] | null;
  }) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    setSearchSuggestions([]);
    
    // Extract station ID (idx) from uid
    // WAQI API format: @{idx} for stations (according to API docs, city can be name or id like @7397)
    const stationIdx = suggestion.uid;
    const searchTerm = stationIdx ? `@${stationIdx}` : suggestion.name.toLowerCase().replace(/\s+/g, '-');
    
    // Perform search with selected suggestion
    setSearchLoading(true);
    setLoading(true);
    setError(null);
    
    try {
      const locationData = await waqiApi.getCityFeed(searchTerm);
      
      if (locationData && 
          locationData.city && 
          locationData.country && 
          locationData.aqi !== null && 
          locationData.aqi !== undefined && 
          !isNaN(locationData.aqi) && 
          isFinite(locationData.aqi)) {
        setSelectedLocation(locationData);
        
        // Add to locations if not already present
        setLocations((prev) => {
          const exists = prev.some(
            (loc) =>
              loc.city === locationData.city && loc.country === locationData.country
          );
          if (!exists) {
            return [locationData, ...prev];
          }
          return prev;
        });
        
        setLastUpdate(new Date());
      } else {
        throw new Error("Invalid air quality data received");
      }
    } catch (err: any) {
      const suggestions = getCitySuggestions(suggestion.name);
      setError({
        type: 'search_error',
        message: `Unable to fetch data for "${suggestion.name}"`,
        suggestions: suggestions,
        originalQuery: suggestion.name
      });
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Search Section */}
      <section className="relative py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4 font-bold">
              Hi, Know the Air Quality around you
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Dive into detailed Air Quality Insights with
              historical data, monthly patterns, and yearly
              trends at your fingertips!
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="Search any Location, City, State or Country"
                  className="pl-12 h-14 bg-white dark:bg-gray-800 border-0 shadow-lg text-base"
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onFocus={() => {
                    if (searchSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow clicking on them
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  disabled={searchLoading || locateLoading}
                />
                
                {/* Autocomplete Suggestions Dropdown */}
                {showSuggestions && (searchSuggestions.length > 0 || searchingSuggestions) && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                    {searchingSuggestions ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        <p className="mt-2 text-sm">Searching...</p>
                      </div>
                    ) : searchSuggestions.length > 0 ? (
                      <div className="py-2">
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={`${suggestion.uid}-${index}`}
                            type="button"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {suggestion.name}
                                </p>
                                {suggestion.aqi !== null && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    AQI: {suggestion.aqi} • {suggestion.time}
                                  </p>
                                )}
                              </div>
                              {suggestion.aqi !== null && (
                                <div
                                  className="ml-3 px-2 py-1 rounded text-xs font-semibold text-white flex-shrink-0"
                                  style={{
                                    backgroundColor: getAQIColorByValue(suggestion.aqi)
                                  }}
                                >
                                  {suggestion.aqi}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="h-14 px-6 bg-[#4CAF50] hover:bg-[#45a049] text-white shadow-lg font-semibold"
                disabled={searchLoading || locateLoading}
              >
                {searchLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Search className="h-5 w-5 mr-2" />
                )}
                Search
              </Button>
              <Button
                type="button"
                onClick={handleLocateMe}
                className="h-14 px-6 bg-[#2196F3] hover:bg-[#1976D2] text-white shadow-lg font-semibold"
                disabled={searchLoading || locateLoading}
              >
                {locateLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <MapPin className="h-5 w-5 mr-2" />
                )}
                Locate Me
              </Button>
            </div>
          </form>

          {/* Enhanced Error Message with Suggestions */}
          {error && (
            <div className="mt-4 max-w-4xl mx-auto">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-amber-800 dark:text-amber-300 font-semibold mb-2">
                      {error.message}
                    </h3>
                    {error.suggestions && error.suggestions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-amber-700 dark:text-amber-400 mb-2 font-medium">
                          Try searching for one of these cities instead:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {error.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSearchQuery(suggestion);
                                setError(null);
                                // Trigger search after a brief delay
                                setTimeout(() => {
                                  const form = document.querySelector('form');
                                  if (form) {
                                    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                                  }
                                }, 100);
                              }}
                              className="px-3 py-1.5 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer font-medium"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
                      Tip: Try using the city name without spaces (e.g., "kualalumpur" or "kuala-lumpur") or check our featured cities below.
                    </p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
                    aria-label="Close"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Explore Map Button */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => onNavigate("Map")}
              className="text-[#2196F3] hover:text-[#1976D2]"
            >
              <Map className="h-4 w-4 mr-2" />
              Explore Interactive Map
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content - After Location Selected */}
      {selectedLocation && 
       selectedLocation.aqi !== null && 
       selectedLocation.aqi !== undefined && 
       !isNaN(selectedLocation.aqi) && 
       isFinite(selectedLocation.aqi) &&
       !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
          {/* Real-Time AQI Analysis - Full Width */}
          <div>
            {/* Real-Time AQI */}
            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-xl overflow-hidden">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-gray-900 dark:text-white mb-1 text-2xl font-bold">
                      Real-Time Air Quality Index (AQI)
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedLocation.city},{" "}
                      {selectedLocation.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Updated {formatTimeAgo(lastUpdate)}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: AQI Gauge - Takes 5 columns */}
                <div className="lg:col-span-5">
                  <div className="flex flex-col items-center justify-center h-full">
                    {/* Circular AQI Gauge */}
                    <div className="relative mb-4">
                      <svg className="w-56 h-56 -rotate-90">
                        {/* Background Circle */}
                        <circle
                          cx="112"
                          cy="112"
                          r="100"
                          stroke="#E5E7EB"
                          strokeWidth="16"
                          fill="none"
                          className="dark:stroke-gray-700"
                        />
                        {/* Progress Circle */}
                        <circle
                          cx="112"
                          cy="112"
                          r="100"
                          stroke={getAQIColorByValue(selectedLocation.aqi)}
                          strokeWidth="16"
                          fill="none"
                          strokeDasharray={`${(selectedLocation.aqi / 500) * 628} 628`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      {/* Center Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div
                          className="text-6xl mb-2 font-bold"
                          style={{
                            color: getAQIColorByValue(selectedLocation.aqi),
                          }}
                        >
                          {selectedLocation.aqi}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                          AQI
                        </div>
                      </div>
                    </div>
                    {/* Pollutants Row */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          PM2.5
                        </p>
                        <p className="text-xl text-[#9C27B0] font-bold">
                          {selectedLocation.pollutants.pm25}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          μg/m³
                        </p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center border border-orange-200 dark:border-orange-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          PM10
                        </p>
                        <p className="text-xl text-[#FF9800] font-bold">
                          {selectedLocation.pollutants.pm10}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          μg/m³
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          O3
                        </p>
                        <p className="text-xl text-[#2196F3] font-bold">
                          {selectedLocation.pollutants.o3}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          μg/m³
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Information Panel - Takes 7 columns */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Weather Conditions Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-5 border border-blue-100 dark:border-blue-800">
                    <h3 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2 font-semibold">
                      <Activity className="h-4 w-4 text-[#2196F3]" />
                      Current Weather Conditions
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
                        <Thermometer className="h-6 w-6 text-[#FF9800] mx-auto mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Temperature
                        </p>
                        <p className="text-2xl text-gray-900 dark:text-white font-bold">
                          {selectedLocation.temperature}°C
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
                        <Droplets className="h-6 w-6 text-[#2196F3] mx-auto mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Humidity
                        </p>
                        <p className="text-2xl text-gray-900 dark:text-white font-bold">
                          {selectedLocation.humidity}%
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
                        <Wind className="h-6 w-6 text-[#4CAF50] mx-auto mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Wind Speed
                        </p>
                        <p className="text-2xl text-gray-900 dark:text-white font-bold">
                          {selectedLocation.windSpeed} km/h
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Health Advisory Card */}
                  <div
                    className="rounded-lg p-5 border-l-4"
                    style={{
                      backgroundColor:
                        selectedLocation.aqi <= 50
                          ? "#E8F5E9"
                          : selectedLocation.aqi <= 100
                            ? "#FFF9C4"
                            : selectedLocation.aqi <= 150
                              ? "#FFE0B2"
                              : "#FFCDD2",
                      borderLeftColor: getAQIColorByValue(selectedLocation.aqi),
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className="h-6 w-6 mt-0.5 flex-shrink-0"
                        style={{
                          color: getAQIColorByValue(selectedLocation.aqi),
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-gray-900 dark:text-gray-800 mb-2 flex items-center gap-2 font-semibold">
                          Health Advisory
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-white"
                            style={{
                              backgroundColor: getAQIColorByValue(selectedLocation.aqi),
                            }}
                          >
                            {getAQICategory(selectedLocation.aqi)}
                          </span>
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-800 leading-relaxed">
                          {getHealthMessage(selectedLocation.aqi)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => onNavigate("Education")}
                      variant="outline"
                      className="flex-1 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Health Recommendations Panel - Only show if we have valid data */}
          {selectedLocation && 
           selectedLocation.aqi !== null && 
           selectedLocation.aqi !== undefined && 
           !isNaN(selectedLocation.aqi) && 
           isFinite(selectedLocation.aqi) &&
           selectedLocation.city &&
           selectedLocation.country ? (
            <HealthRecommendations
              aqi={selectedLocation.aqi}
              city={selectedLocation.city}
              country={selectedLocation.country}
            />
          ) : (
            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-xl">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Air Quality Data Unavailable
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                  We're unable to load air quality data for {selectedLocation?.city || "this location"} at the moment.
                  Please try searching for another city or use the "Locate Me" feature.
                </p>
                <Button
                  onClick={() => {
                    // Try to select first valid location from locations list
                    const validLocation = locations.find(loc => 
                      loc && 
                      loc.aqi !== null && 
                      loc.aqi !== undefined && 
                      !isNaN(loc.aqi) && 
                      isFinite(loc.aqi)
                    );
                    if (validLocation) {
                      setSelectedLocation(validLocation);
                    }
                  }}
                  className="bg-[#2196F3] hover:bg-[#1976D2] text-white"
                >
                  View Available Cities
                </Button>
              </div>
            </Card>
          )}

          {/* Featured Cities */}
          <FeaturedCities locations={locations} />
        </div>
      )}

      {/* Why AirAware Section - Show when location is selected or loading */}
      {!selectedLocation && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <WhyAirAware />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Card className="p-12 bg-white dark:bg-gray-800 border-0 shadow-xl">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-[#2196F3] animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading air quality data...
              </p>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default HomePage;

