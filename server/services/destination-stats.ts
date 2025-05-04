import axios from 'axios';
import { DestinationStatistics, Expense, VisitorData, ActivityData, SeasonalData } from '../../client/src/types/destination-stats';

/**
 * Fetches destination statistics from either Viator or GetYourGuide API
 * Falls back to embedded data if APIs are not available
 */
export async function getDestinationStatistics(destination: string): Promise<DestinationStatistics | null> {
  try {
    // Check if we have API keys for external services
    const viatorApiKey = process.env.VIATOR_API_KEY;
    const getYourGuideApiKey = process.env.GETYOURGUIDE_API_KEY;
    
    // First try Viator API if available
    if (viatorApiKey) {
      try {
        // Normalize destination name for API
        const normalizedDestination = encodeURIComponent(destination.trim());
        
        // Fetch destination data from Viator
        const response = await axios.get(
          `https://api.viator.com/partner/destinations/search?destName=${normalizedDestination}`,
          {
            headers: {
              'Accept-Language': 'en-US',
              'Accept': 'application/json',
              'exp-api-key': viatorApiKey
            }
          }
        );
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          // Get the destination ID to fetch more details
          const destinationId = response.data.data[0].destId;
          
          // Fetch destination details including statistics
          const detailsResponse = await axios.get(
            `https://api.viator.com/partner/destinations/${destinationId}`,
            {
              headers: {
                'Accept-Language': 'en-US',
                'Accept': 'application/json',
                'exp-api-key': viatorApiKey
              }
            }
          );
          
          if (detailsResponse.data) {
            // Process the API response into our statistics format
            return processViatorData(detailsResponse.data, destination);
          }
        }
      } catch (error) {
        console.error('Error fetching from Viator API:', error);
        // Fallback to next method if Viator fails
      }
    }
    
    // Try GetYourGuide API if available and Viator failed
    if (getYourGuideApiKey) {
      try {
        // Normalize destination name for API
        const normalizedDestination = encodeURIComponent(destination.trim());
        
        // Fetch destination data from GetYourGuide
        const response = await axios.get(
          `https://api.getyourguide.com/1/destinations/search?q=${normalizedDestination}`,
          {
            headers: {
              'Accept': 'application/json',
              'X-API-KEY': getYourGuideApiKey
            }
          }
        );
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          // Get the destination ID to fetch more details
          const destinationId = response.data.data[0].id;
          
          // Fetch destination details including statistics
          const detailsResponse = await axios.get(
            `https://api.getyourguide.com/1/destinations/${destinationId}`,
            {
              headers: {
                'Accept': 'application/json',
                'X-API-KEY': getYourGuideApiKey
              }
            }
          );
          
          if (detailsResponse.data) {
            // Process the API response into our statistics format
            return processGetYourGuideData(detailsResponse.data, destination);
          }
        }
      } catch (error) {
        console.error('Error fetching from GetYourGuide API:', error);
        // Fallback to embedded data if GetYourGuide fails
      }
    }
    
    // Fallback to embedded data if both APIs fail or are unavailable
    return getEmbeddedDestinationData(destination);
    
  } catch (error) {
    console.error('Error in getDestinationStatistics:', error);
    return null;
  }
}

/**
 * Process data from Viator API to match our statistics format
 */
function processViatorData(apiData: any, destination: string): DestinationStatistics {
  // Extract relevant data from the API response
  const name = apiData.destName || destination;
  const country = apiData.countryName || '';
  
  // Create a unique ID based on name and country
  const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${country.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Create formatted data structure for our frontend
  const stats: DestinationStatistics = {
    id,
    name,
    country,
    ratings: [
      { category: 'Overall', score: parseFloat((apiData.rating || 7.5).toFixed(1)), average: 7.0 },
      { category: 'Activities', score: parseFloat((apiData.activitiesRating || 8.0).toFixed(1)), average: 7.0 },
      { category: 'Scenery', score: parseFloat((apiData.sceneryRating || 7.8).toFixed(1)), average: 6.5 },
      { category: 'Value', score: parseFloat((apiData.valueRating || 7.2).toFixed(1)), average: 6.8 },
      { category: 'Accessibility', score: parseFloat((apiData.accessibilityRating || 7.5).toFixed(1)), average: 7.2 }
    ],
    expenses: generateExpensesData(apiData),
    visitorData: generateVisitorData(apiData),
    activityDistribution: generateActivityDistribution(apiData),
    seasonalRecommendations: generateSeasonalRecommendations(apiData),
    comparableDestinations: []
  };
  
  return stats;
}

/**
 * Process data from GetYourGuide API to match our statistics format
 */
function processGetYourGuideData(apiData: any, destination: string): DestinationStatistics {
  // Extract relevant data from the API response
  const name = apiData.name || destination;
  const country = apiData.country?.name || '';
  
  // Create a unique ID based on name and country
  const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${country.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Create formatted data structure for our frontend
  const stats: DestinationStatistics = {
    id,
    name,
    country,
    ratings: [
      { category: 'Overall', score: parseFloat((apiData.rating || 7.5).toFixed(1)), average: 7.0 },
      { category: 'Activities', score: parseFloat((apiData.activitiesScore || 8.0).toFixed(1)), average: 7.0 },
      { category: 'Scenery', score: parseFloat((apiData.sceneryScore || 7.8).toFixed(1)), average: 6.5 },
      { category: 'Value', score: parseFloat((apiData.valueScore || 7.2).toFixed(1)), average: 6.8 },
      { category: 'Accessibility', score: parseFloat((apiData.accessibilityScore || 7.5).toFixed(1)), average: 7.2 }
    ],
    expenses: generateExpensesData(apiData),
    visitorData: generateVisitorData(apiData),
    activityDistribution: generateActivityDistribution(apiData),
    seasonalRecommendations: generateSeasonalRecommendations(apiData),
    comparableDestinations: []
  };
  
  return stats;
}

/**
 * Helper function to generate expenses data from API data
 */
function generateExpensesData(apiData: any) {
  // Process expenses data or create sample data if not available
  const baseAccommodation = apiData.averageAccommodationCost || 120;
  const baseFood = apiData.averageFoodCost || 50;
  const baseTransportation = apiData.averageTransportationCost || 30;
  const baseActivities = apiData.averageActivitiesCost || 40;
  
  return [
    { category: 'Accommodation', amount: baseAccommodation },
    { category: 'Food', amount: baseFood },
    { category: 'Transportation', amount: baseTransportation },
    { category: 'Activities', amount: baseActivities },
    { category: 'Miscellaneous', amount: Math.round(baseAccommodation * 0.15) }
  ];
}

/**
 * Helper function to generate visitor data from API data
 */
function generateVisitorData(apiData: any) {
  // Process visitor data or create sample data if not available
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let visitorData = [];
  
  if (apiData.visitorData && Array.isArray(apiData.visitorData)) {
    visitorData = apiData.visitorData.map((item: any) => ({
      month: item.month,
      visitors: item.visitors,
      temperature: item.temperature
    }));
  } else {
    // Generate reasonable data based on destination's general patterns
    const isNorthern = !(apiData.latitude && apiData.latitude < 0);
    const peakMonths = isNorthern ? [5, 6, 7, 8] : [11, 0, 1, 2]; // Summer months in respective hemispheres
    
    visitorData = months.map((month, index) => {
      const isPeak = peakMonths.includes(index);
      const baseVisitors = isPeak ? 300 + Math.random() * 200 : 150 + Math.random() * 100;
      const baseTemp = isPeak ? 25 + Math.random() * 5 : 15 + Math.random() * 5;
      
      return {
        month,
        visitors: Math.round(baseVisitors),
        temperature: parseFloat(baseTemp.toFixed(1))
      };
    });
  }
  
  return visitorData;
}

/**
 * Helper function to generate activity distribution data from API data
 */
function generateActivityDistribution(apiData: any) {
  // Process activity distribution data or create sample data if not available
  if (apiData.activityTypes && Array.isArray(apiData.activityTypes)) {
    return apiData.activityTypes.map((item: any) => ({
      name: item.name,
      value: item.percentage
    }));
  }
  
  // Default distribution if not available from API
  return [
    { name: 'Cultural', value: 35 },
    { name: 'Adventure', value: 25 },
    { name: 'Relaxation', value: 20 },
    { name: 'Culinary', value: 15 },
    { name: 'Shopping', value: 5 }
  ];
}

/**
 * Helper function to generate seasonal recommendations data from API data
 */
function generateSeasonalRecommendations(apiData: any) {
  // Process seasonal recommendations or create sample data if not available
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
  let recommendations = [];
  
  if (apiData.seasonalRecommendations && Array.isArray(apiData.seasonalRecommendations)) {
    recommendations = apiData.seasonalRecommendations.map((item: any) => ({
      season: item.season,
      score: item.score,
      highlights: item.highlights || []
    }));
  } else {
    // Generate reasonable data based on destination's general patterns
    const isNorthern = !(apiData.latitude && apiData.latitude < 0);
    
    recommendations = seasons.map(season => {
      let score, highlights;
      
      switch (season) {
        case 'Summer':
          score = isNorthern ? 9.2 : 6.5;
          highlights = isNorthern 
            ? ['Perfect beach weather', 'Outdoor festivals', 'Extended daylight hours'] 
            : ['Low season deals', 'Less crowded attractions', 'Mild temperatures'];
          break;
        case 'Winter':
          score = isNorthern ? 6.8 : 8.5;
          highlights = isNorthern 
            ? ['Holiday markets', 'Snow activities', 'Lower tourist numbers'] 
            : ['Beach season', 'Outdoor adventures', 'Cultural festivals'];
          break;
        case 'Spring':
          score = 8.0;
          highlights = ['Blooming landscapes', 'Pleasant temperatures', 'Pre-summer deals'];
          break;
        case 'Fall':
          score = 7.5;
          highlights = ['Autumn colors', 'Harvest festivals', 'Fewer tourists'];
          break;
        default:
          score = 7.0;
          highlights = ['Pleasant weather', 'Cultural experiences', 'Local cuisine'];
      }
      
      return { 
        season, 
        score, 
        highlights 
      };
    });
  }
  
  return recommendations;
}

/**
 * Fallback to embedded data if APIs are not available
 */
function getEmbeddedDestinationData(destination: string): DestinationStatistics | null {
  // Try to find a match in our embedded data
  const normalizedDestination = destination.toLowerCase().trim();
  
  // Check for major destinations
  if (normalizedDestination.includes('paris') || normalizedDestination.includes('france')) {
    return getParisData();
  } else if (normalizedDestination.includes('tokyo') || normalizedDestination.includes('japan')) {
    return getTokyoData();
  } else if (normalizedDestination.includes('new york') || normalizedDestination.includes('nyc')) {
    return getNewYorkData();
  } else if (normalizedDestination.includes('bali') || normalizedDestination.includes('indonesia')) {
    return getBaliData();
  } else if (normalizedDestination.includes('rome') || normalizedDestination.includes('italy')) {
    return getRomeData();
  }
  
  // If no match, return null and let the application handle it
  return null;
}

/**
 * Embedded data for Paris
 */
function getParisData(): DestinationStatistics {
  return {
    id: 'paris-france',
    name: 'Paris',
    country: 'France',
    ratings: [
      { category: 'Overall', score: 8.7, average: 7.0 },
      { category: 'Culture', score: 9.5, average: 7.2 },
      { category: 'Food', score: 9.3, average: 7.5 },
      { category: 'Architecture', score: 9.4, average: 7.0 },
      { category: 'Value', score: 7.2, average: 7.5 }
    ],
    expenses: [
      { category: 'Accommodation', amount: 150 },
      { category: 'Food', amount: 70 },
      { category: 'Transportation', amount: 20 },
      { category: 'Activities', amount: 60 },
      { category: 'Miscellaneous', amount: 30 }
    ],
    visitorData: [
      { month: 'Jan', visitors: 180, temperature: 5 },
      { month: 'Feb', visitors: 190, temperature: 6 },
      { month: 'Mar', visitors: 250, temperature: 10 },
      { month: 'Apr', visitors: 350, temperature: 13 },
      { month: 'May', visitors: 420, temperature: 16 },
      { month: 'Jun', visitors: 500, temperature: 19 },
      { month: 'Jul', visitors: 580, temperature: 21 },
      { month: 'Aug', visitors: 560, temperature: 21 },
      { month: 'Sep', visitors: 450, temperature: 18 },
      { month: 'Oct', visitors: 350, temperature: 14 },
      { month: 'Nov', visitors: 220, temperature: 9 },
      { month: 'Dec', visitors: 210, temperature: 6 }
    ],
    activityDistribution: [
      { name: 'Museums & Culture', value: 40 },
      { name: 'Cuisine & Dining', value: 25 },
      { name: 'Architecture & Landmarks', value: 20 },
      { name: 'Shopping', value: 10 },
      { name: 'Entertainment', value: 5 }
    ],
    seasonalRecommendations: [
      { 
        season: 'Spring', 
        score: 9.0, 
        highlights: ['Gardens in bloom', 'Fewer crowds than summer', 'Pleasant outdoor cafe weather'] 
      },
      { 
        season: 'Summer', 
        score: 8.5, 
        highlights: ['Long daylight hours', 'Outdoor events', 'Bastille Day celebrations'] 
      },
      { 
        season: 'Fall', 
        score: 8.7, 
        highlights: ['Beautiful fall colors', 'Less crowded museums', 'Fashion week'] 
      },
      { 
        season: 'Winter', 
        score: 7.8, 
        highlights: ['Christmas markets', 'Festive decorations', 'Off-season rates'] 
      }
    ],
    comparableDestinations: ['rome-italy', 'london-uk', 'barcelona-spain']
  };
}

/**
 * Embedded data for Tokyo
 */
function getTokyoData(): DestinationStatistics {
  return {
    id: 'tokyo-japan',
    name: 'Tokyo',
    country: 'Japan',
    ratings: [
      { category: 'Overall', score: 9.0, average: 7.0 },
      { category: 'Technology', score: 9.8, average: 7.0 },
      { category: 'Food', score: 9.5, average: 7.5 },
      { category: 'Transportation', score: 9.7, average: 7.2 },
      { category: 'Safety', score: 9.9, average: 7.6 }
    ],
    expenses: [
      { category: 'Accommodation', amount: 140 },
      { category: 'Food', amount: 60 },
      { category: 'Transportation', amount: 15 },
      { category: 'Activities', amount: 50 },
      { category: 'Miscellaneous', amount: 25 }
    ],
    visitorData: [
      { month: 'Jan', visitors: 220, temperature: 6 },
      { month: 'Feb', visitors: 230, temperature: 7 },
      { month: 'Mar', visitors: 350, temperature: 10 },
      { month: 'Apr', visitors: 420, temperature: 14 },
      { month: 'May', visitors: 350, temperature: 19 },
      { month: 'Jun', visitors: 270, temperature: 22 },
      { month: 'Jul', visitors: 280, temperature: 26 },
      { month: 'Aug', visitors: 300, temperature: 28 },
      { month: 'Sep', visitors: 320, temperature: 24 },
      { month: 'Oct', visitors: 380, temperature: 19 },
      { month: 'Nov', visitors: 340, temperature: 14 },
      { month: 'Dec', visitors: 280, temperature: 9 }
    ],
    activityDistribution: [
      { name: 'Technology & Modern Culture', value: 30 },
      { name: 'Traditional Culture', value: 25 },
      { name: 'Cuisine', value: 25 },
      { name: 'Shopping', value: 15 },
      { name: 'Nature & Parks', value: 5 }
    ],
    seasonalRecommendations: [
      { 
        season: 'Spring', 
        score: 9.5, 
        highlights: ['Cherry blossom season', 'Pleasant temperatures', 'Seasonal festivals'] 
      },
      { 
        season: 'Summer', 
        score: 7.2, 
        highlights: ['Summer festivals', 'Firework displays', 'Hot and humid'] 
      },
      { 
        season: 'Fall', 
        score: 9.3, 
        highlights: ['Autumn foliage', 'Comfortable temperatures', 'Cultural events'] 
      },
      { 
        season: 'Winter', 
        score: 8.0, 
        highlights: ['Winter illuminations', 'New Year celebrations', 'Less crowded'] 
      }
    ],
    comparableDestinations: ['osaka-japan', 'seoul-south-korea', 'taipei-taiwan']
  };
}

/**
 * Embedded data for New York
 */
function getNewYorkData(): DestinationStatistics {
  return {
    id: 'new-york-usa',
    name: 'New York City',
    country: 'United States',
    ratings: [
      { category: 'Overall', score: 8.5, average: 7.0 },
      { category: 'Entertainment', score: 9.4, average: 7.3 },
      { category: 'Dining', score: 9.2, average: 7.5 },
      { category: 'Architecture', score: 9.0, average: 7.0 },
      { category: 'Value', score: 6.8, average: 7.5 }
    ],
    expenses: [
      { category: 'Accommodation', amount: 220 },
      { category: 'Food', amount: 80 },
      { category: 'Transportation', amount: 30 },
      { category: 'Activities', amount: 70 },
      { category: 'Miscellaneous', amount: 40 }
    ],
    visitorData: [
      { month: 'Jan', visitors: 320, temperature: 0 },
      { month: 'Feb', visitors: 330, temperature: 1 },
      { month: 'Mar', visitors: 380, temperature: 6 },
      { month: 'Apr', visitors: 420, temperature: 12 },
      { month: 'May', visitors: 480, temperature: 18 },
      { month: 'Jun', visitors: 520, temperature: 23 },
      { month: 'Jul', visitors: 550, temperature: 26 },
      { month: 'Aug', visitors: 560, temperature: 25 },
      { month: 'Sep', visitors: 490, temperature: 21 },
      { month: 'Oct', visitors: 450, temperature: 15 },
      { month: 'Nov', visitors: 420, temperature: 9 },
      { month: 'Dec', visitors: 500, temperature: 3 }
    ],
    activityDistribution: [
      { name: 'Urban Exploration', value: 30 },
      { name: 'Arts & Culture', value: 25 },
      { name: 'Dining & Nightlife', value: 25 },
      { name: 'Shopping', value: 15 },
      { name: 'Parks & Recreation', value: 5 }
    ],
    seasonalRecommendations: [
      { 
        season: 'Spring', 
        score: 8.8, 
        highlights: ['Central Park blooming', 'Moderate temperatures', 'Outdoor events'] 
      },
      { 
        season: 'Summer', 
        score: 8.0, 
        highlights: ['Outdoor concerts', 'Beach access', 'Hot and humid'] 
      },
      { 
        season: 'Fall', 
        score: 9.2, 
        highlights: ['Fall foliage in parks', 'Pleasant temperatures', 'Fashion Week'] 
      },
      { 
        season: 'Winter', 
        score: 8.5, 
        highlights: ['Holiday decorations', 'New Year in Times Square', 'Ice skating'] 
      }
    ],
    comparableDestinations: ['chicago-usa', 'los-angeles-usa', 'toronto-canada']
  };
}

/**
 * Embedded data for Bali
 */
function getBaliData(): DestinationStatistics {
  return {
    id: 'bali-indonesia',
    name: 'Bali',
    country: 'Indonesia',
    ratings: [
      { category: 'Overall', score: 8.8, average: 7.0 },
      { category: 'Beaches', score: 9.3, average: 7.4 },
      { category: 'Culture', score: 9.0, average: 7.2 },
      { category: 'Value', score: 8.9, average: 7.5 },
      { category: 'Hospitality', score: 9.2, average: 7.6 }
    ],
    expenses: [
      { category: 'Accommodation', amount: 70 },
      { category: 'Food', amount: 25 },
      { category: 'Transportation', amount: 15 },
      { category: 'Activities', amount: 30 },
      { category: 'Miscellaneous', amount: 15 }
    ],
    visitorData: [
      { month: 'Jan', visitors: 380, temperature: 28 },
      { month: 'Feb', visitors: 350, temperature: 28 },
      { month: 'Mar', visitors: 370, temperature: 28 },
      { month: 'Apr', visitors: 400, temperature: 28 },
      { month: 'May', visitors: 420, temperature: 28 },
      { month: 'Jun', visitors: 450, temperature: 27 },
      { month: 'Jul', visitors: 580, temperature: 27 },
      { month: 'Aug', visitors: 620, temperature: 27 },
      { month: 'Sep', visitors: 480, temperature: 27 },
      { month: 'Oct', visitors: 440, temperature: 28 },
      { month: 'Nov', visitors: 400, temperature: 28 },
      { month: 'Dec', visitors: 420, temperature: 28 }
    ],
    activityDistribution: [
      { name: 'Beaches & Water Sports', value: 35 },
      { name: 'Cultural Experiences', value: 25 },
      { name: 'Wellness & Spa', value: 20 },
      { name: 'Nature & Hiking', value: 15 },
      { name: 'Nightlife', value: 5 }
    ],
    seasonalRecommendations: [
      { 
        season: 'Dry Season (Apr-Sep)', 
        score: 9.5, 
        highlights: ['Perfect beach weather', 'Cultural festivals', 'Ideal for outdoor activities'] 
      },
      { 
        season: 'Shoulder Season (Mar, Oct)', 
        score: 8.8, 
        highlights: ['Fewer tourists', 'Lower prices', 'Still good weather'] 
      },
      { 
        season: 'Rainy Season (Nov-Feb)', 
        score: 7.5, 
        highlights: ['Lush landscapes', 'Best deals', 'Intermittent rain'] 
      },
      { 
        season: 'New Year', 
        score: 8.0, 
        highlights: ['Festive atmosphere', 'Special events', 'Higher prices'] 
      }
    ],
    comparableDestinations: ['phuket-thailand', 'maldives-maldives', 'boracay-philippines']
  };
}

/**
 * Embedded data for Rome
 */
function getRomeData(): DestinationStatistics {
  return {
    id: 'rome-italy',
    name: 'Rome',
    country: 'Italy',
    ratings: [
      { category: 'Overall', score: 8.9, average: 7.0 },
      { category: 'History', score: 9.8, average: 7.2 },
      { category: 'Food', score: 9.5, average: 7.5 },
      { category: 'Architecture', score: 9.7, average: 7.0 },
      { category: 'Value', score: 7.5, average: 7.5 }
    ],
    expenses: [
      { category: 'Accommodation', amount: 130 },
      { category: 'Food', amount: 60 },
      { category: 'Transportation', amount: 15 },
      { category: 'Activities', amount: 50 },
      { category: 'Miscellaneous', amount: 25 }
    ],
    visitorData: [
      { month: 'Jan', visitors: 200, temperature: 8 },
      { month: 'Feb', visitors: 220, temperature: 9 },
      { month: 'Mar', visitors: 300, temperature: 12 },
      { month: 'Apr', visitors: 400, temperature: 15 },
      { month: 'May', visitors: 480, temperature: 20 },
      { month: 'Jun', visitors: 520, temperature: 24 },
      { month: 'Jul', visitors: 580, temperature: 27 },
      { month: 'Aug', visitors: 600, temperature: 27 },
      { month: 'Sep', visitors: 500, temperature: 23 },
      { month: 'Oct', visitors: 420, temperature: 18 },
      { month: 'Nov', visitors: 280, temperature: 13 },
      { month: 'Dec', visitors: 240, temperature: 9 }
    ],
    activityDistribution: [
      { name: 'Historical Sites', value: 40 },
      { name: 'Cuisine & Dining', value: 25 },
      { name: 'Religious Sites', value: 15 },
      { name: 'Art & Museums', value: 15 },
      { name: 'Shopping', value: 5 }
    ],
    seasonalRecommendations: [
      { 
        season: 'Spring', 
        score: 9.3, 
        highlights: ['Pleasant weather', 'Blooming gardens', 'Pre-summer crowds'] 
      },
      { 
        season: 'Summer', 
        score: 7.8, 
        highlights: ['Long daylight hours', 'Outdoor dining', 'Hot and crowded'] 
      },
      { 
        season: 'Fall', 
        score: 9.0, 
        highlights: ['Comfortable temperatures', 'Fewer tourists', 'Harvest cuisine'] 
      },
      { 
        season: 'Winter', 
        score: 8.2, 
        highlights: ['Christmas markets', 'Vatican celebrations', 'Lowest crowds'] 
      }
    ],
    comparableDestinations: ['florence-italy', 'paris-france', 'athens-greece']
  };
}