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
  const destName = apiData.destName || destination;
  const country = apiData.countryName || '';
  
  const currencyCode = apiData.currency || 'USD';
  const currencyName = apiData.currencyName || 'US Dollar';
  
  // Create formatted data structure for our frontend
  const stats: DestinationStatistics = {
    destination: destName,
    summary: apiData.description || `${destName} is a popular destination known for its unique attractions and diverse experiences.`,
    currency: currencyCode,
    currencyName: currencyName,
    localLanguage: apiData.localLanguage || 'English',
    averageDailyBudget: apiData.averageDailyBudget || 150,
    topAttraction: apiData.topAttraction || `${destName} landmarks and cultural sites`,
    safetyIndex: apiData.safetyIndex || 7.5,
    bestTimeToVisit: apiData.bestTimeToVisit || 'Spring and Fall for the best weather and fewer crowds',
    expenses: generateExpensesData(apiData),
    visitorData: generateVisitorData(apiData),
    activityDistribution: generateActivityDistribution(apiData),
    seasonalRecommendations: generateSeasonalRecommendations(apiData)
  };
  
  return stats;
}

/**
 * Process data from GetYourGuide API to match our statistics format
 */
function processGetYourGuideData(apiData: any, destination: string): DestinationStatistics {
  // Extract relevant data from the API response
  const destName = apiData.name || destination;
  const country = apiData.country?.name || '';
  
  const currencyCode = apiData.currency || 'USD';
  const currencyName = apiData.currencyName || 'US Dollar';
  
  // Create formatted data structure for our frontend
  const stats: DestinationStatistics = {
    destination: destName,
    summary: apiData.description || `${destName} is a popular destination known for its unique attractions and diverse experiences.`,
    currency: currencyCode,
    currencyName: currencyName,
    localLanguage: apiData.localLanguage || 'English',
    averageDailyBudget: apiData.averageDailyBudget || 150,
    topAttraction: apiData.topAttraction || `${destName} landmarks and cultural sites`,
    safetyIndex: apiData.safetyIndex || 7.5,
    bestTimeToVisit: apiData.bestTimeToVisit || 'Spring and Fall for the best weather and fewer crowds',
    expenses: generateExpensesData(apiData),
    visitorData: generateVisitorData(apiData),
    activityDistribution: generateActivityDistribution(apiData),
    seasonalRecommendations: generateSeasonalRecommendations(apiData)
  };
  
  return stats;
}

/**
 * Helper function to generate expenses data from API data
 */
function generateExpensesData(apiData: any): Expense[] {
  // Process expenses data or create sample data if not available
  const baseAccommodation = apiData.averageAccommodationCost || 120;
  const baseFood = apiData.averageFoodCost || 50;
  const baseTransportation = apiData.averageTransportationCost || 30;
  const baseActivities = apiData.averageActivitiesCost || 40;
  
  return [
    { category: 'Accommodation', cost: baseAccommodation },
    { category: 'Food', cost: baseFood },
    { category: 'Transportation', cost: baseTransportation },
    { category: 'Activities', cost: baseActivities },
    { category: 'Miscellaneous', cost: Math.round(baseAccommodation * 0.15) }
  ];
}

/**
 * Helper function to generate visitor data from API data
 */
function generateVisitorData(apiData: any): VisitorData[] {
  // Process visitor data or create sample data if not available
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let visitorData: VisitorData[] = [];
  
  if (apiData.visitorData && Array.isArray(apiData.visitorData)) {
    visitorData = apiData.visitorData.map((item: any) => ({
      name: item.month || 'Month',
      value: item.visitors || Math.round(150 + Math.random() * 150)
    }));
  } else {
    // Generate reasonable data based on destination's general patterns
    const isNorthern = !(apiData.latitude && apiData.latitude < 0);
    const peakMonths = isNorthern ? [5, 6, 7, 8] : [11, 0, 1, 2]; // Summer months in respective hemispheres
    
    visitorData = months.map((month, index) => {
      const isPeak = peakMonths.includes(index);
      const baseVisitors = isPeak ? 300 + Math.random() * 200 : 150 + Math.random() * 100;
      
      return {
        name: month,
        value: Math.round(baseVisitors)
      };
    });
  }
  
  return visitorData;
}

/**
 * Helper function to generate activity distribution data from API data
 */
function generateActivityDistribution(apiData: any): ActivityData[] {
  // Process activity distribution data or create sample data if not available
  if (apiData.activityTypes && Array.isArray(apiData.activityTypes)) {
    return apiData.activityTypes.map((item: any) => ({
      activity: item.name || 'Activity',
      percentage: item.percentage || Math.round(Math.random() * 20 + 10)
    }));
  }
  
  // Default distribution if not available from API
  return [
    { activity: 'Cultural', percentage: 35 },
    { activity: 'Adventure', percentage: 25 },
    { activity: 'Relaxation', percentage: 20 },
    { activity: 'Culinary', percentage: 15 },
    { activity: 'Shopping', percentage: 5 }
  ];
}

/**
 * Helper function to generate seasonal recommendations data from API data
 */
function generateSeasonalRecommendations(apiData: any): SeasonalData[] {
  // Process seasonal recommendations or create sample data if not available
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let recommendationData: SeasonalData[] = [];
  
  if (apiData.seasonalData && Array.isArray(apiData.seasonalData)) {
    recommendationData = apiData.seasonalData.map((item: any) => ({
      month: item.month || 'Month',
      rating: item.rating || Math.round(Math.random() * 5 + 5)
    }));
  } else {
    // Generate reasonable data based on destination's general patterns
    const isNorthern = !(apiData.latitude && apiData.latitude < 0);
    const peakMonths = isNorthern ? [5, 6, 7, 8] : [11, 0, 1, 2]; // Summer months in respective hemispheres
    const shoulderMonths = isNorthern ? [3, 4, 9, 10] : [3, 4, 9, 10]; // Spring/Fall months
    
    recommendationData = months.map((month, index) => {
      let rating;
      
      if (peakMonths.includes(index)) {
        rating = Math.round(Math.random() * 1 + 9); // 9-10 rating for peak season
      } else if (shoulderMonths.includes(index)) {
        rating = Math.round(Math.random() * 1 + 7); // 7-8 rating for shoulder season
      } else {
        rating = Math.round(Math.random() * 1 + 5); // 5-6 rating for off season
      }
      
      return { 
        month, 
        rating
      };
    });
  }
  
  return recommendationData;
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
    destination: 'Paris',
    summary: 'Paris, the capital of France, is known for its art, fashion, gastronomy and culture. The city is famous for iconic landmarks like the Eiffel Tower, Notre-Dame Cathedral, and the Louvre Museum.',
    currency: 'EUR',
    currencyName: 'Euro',
    localLanguage: 'French',
    averageDailyBudget: 150,
    topAttraction: 'Eiffel Tower',
    safetyIndex: 7.8,
    bestTimeToVisit: 'April to June and October to early November',
    expenses: [
      { category: 'Accommodation', cost: 150 },
      { category: 'Food', cost: 70 },
      { category: 'Transportation', cost: 20 },
      { category: 'Activities', cost: 60 },
      { category: 'Miscellaneous', cost: 30 }
    ],
    visitorData: [
      { name: 'Jan', value: 180 },
      { name: 'Feb', value: 190 },
      { name: 'Mar', value: 250 },
      { name: 'Apr', value: 350 },
      { name: 'May', value: 420 },
      { name: 'Jun', value: 500 },
      { name: 'Jul', value: 580 },
      { name: 'Aug', value: 560 },
      { name: 'Sep', value: 450 },
      { name: 'Oct', value: 350 },
      { name: 'Nov', value: 220 },
      { name: 'Dec', value: 210 }
    ],
    activityDistribution: [
      { activity: 'Museums & Culture', percentage: 40 },
      { activity: 'Cuisine & Dining', percentage: 25 },
      { activity: 'Architecture & Landmarks', percentage: 20 },
      { activity: 'Shopping', percentage: 10 },
      { activity: 'Entertainment', percentage: 5 }
    ],
    seasonalRecommendations: [
      { month: 'Jan', rating: 6 },
      { month: 'Feb', rating: 6 },
      { month: 'Mar', rating: 7 },
      { month: 'Apr', rating: 9 },
      { month: 'May', rating: 9 },
      { month: 'Jun', rating: 8 },
      { month: 'Jul', rating: 7 },
      { month: 'Aug', rating: 7 },
      { month: 'Sep', rating: 8 },
      { month: 'Oct', rating: 9 },
      { month: 'Nov', rating: 7 },
      { month: 'Dec', rating: 6 }
    ]
  };
}

/**
 * Embedded data for Tokyo
 */
function getTokyoData(): DestinationStatistics {
  return {
    destination: 'Tokyo',
    summary: 'Tokyo, Japan\'s busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples. It offers cutting-edge technology, world-class cuisine, efficient transportation, and unique cultural experiences.',
    currency: 'JPY',
    currencyName: 'Japanese Yen',
    localLanguage: 'Japanese',
    averageDailyBudget: 140,
    topAttraction: 'Tokyo Skytree',
    safetyIndex: 9.2,
    bestTimeToVisit: 'March-April for cherry blossoms, October-November for autumn colors',
    expenses: [
      { category: 'Accommodation', cost: 140 },
      { category: 'Food', cost: 60 },
      { category: 'Transportation', cost: 15 },
      { category: 'Activities', cost: 50 },
      { category: 'Miscellaneous', cost: 25 }
    ],
    visitorData: [
      { name: 'Jan', value: 220 },
      { name: 'Feb', value: 230 },
      { name: 'Mar', value: 350 },
      { name: 'Apr', value: 420 },
      { name: 'May', value: 350 },
      { name: 'Jun', value: 270 },
      { name: 'Jul', value: 280 },
      { name: 'Aug', value: 300 },
      { name: 'Sep', value: 320 },
      { name: 'Oct', value: 380 },
      { name: 'Nov', value: 340 },
      { name: 'Dec', value: 280 }
    ],
    activityDistribution: [
      { activity: 'Technology & Modern Culture', percentage: 30 },
      { activity: 'Traditional Culture', percentage: 25 },
      { activity: 'Cuisine', percentage: 25 },
      { activity: 'Shopping', percentage: 15 },
      { activity: 'Nature & Parks', percentage: 5 }
    ],
    seasonalRecommendations: [
      { month: 'Jan', rating: 6 },
      { month: 'Feb', rating: 6 },
      { month: 'Mar', rating: 8 },
      { month: 'Apr', rating: 10 },
      { month: 'May', rating: 8 },
      { month: 'Jun', rating: 6 },
      { month: 'Jul', rating: 6 },
      { month: 'Aug', rating: 7 },
      { month: 'Sep', rating: 8 },
      { month: 'Oct', rating: 9 },
      { month: 'Nov', rating: 9 },
      { month: 'Dec', rating: 7 }
    ]
  };
}

/**
 * Embedded data for New York
 */
function getNewYorkData(): DestinationStatistics {
  return {
    destination: 'New York City',
    summary: 'New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean. At its core is Manhattan, a densely populated borough that is among the world\'s major commercial, financial and cultural centers.',
    currency: 'USD',
    currencyName: 'US Dollar',
    localLanguage: 'English',
    averageDailyBudget: 220,
    topAttraction: 'Times Square',
    safetyIndex: 7.5,
    bestTimeToVisit: 'April to June and September to early November',
    expenses: [
      { category: 'Accommodation', cost: 220 },
      { category: 'Food', cost: 80 },
      { category: 'Transportation', cost: 30 },
      { category: 'Activities', cost: 70 },
      { category: 'Miscellaneous', cost: 40 }
    ],
    visitorData: [
      { name: 'Jan', value: 320 },
      { name: 'Feb', value: 330 },
      { name: 'Mar', value: 380 },
      { name: 'Apr', value: 420 },
      { name: 'May', value: 480 },
      { name: 'Jun', value: 520 },
      { name: 'Jul', value: 550 },
      { name: 'Aug', value: 560 },
      { name: 'Sep', value: 490 },
      { name: 'Oct', value: 450 },
      { name: 'Nov', value: 420 },
      { name: 'Dec', value: 500 }
    ],
    activityDistribution: [
      { activity: 'Urban Exploration', percentage: 30 },
      { activity: 'Arts & Culture', percentage: 25 },
      { activity: 'Dining & Nightlife', percentage: 25 },
      { activity: 'Shopping', percentage: 15 },
      { activity: 'Parks & Recreation', percentage: 5 }
    ],
    seasonalRecommendations: [
      { month: 'Jan', rating: 7 },
      { month: 'Feb', rating: 6 },
      { month: 'Mar', rating: 7 },
      { month: 'Apr', rating: 8 },
      { month: 'May', rating: 9 },
      { month: 'Jun', rating: 9 },
      { month: 'Jul', rating: 8 },
      { month: 'Aug', rating: 8 },
      { month: 'Sep', rating: 9 },
      { month: 'Oct', rating: 10 },
      { month: 'Nov', rating: 8 },
      { month: 'Dec', rating: 8 }
    ]
  };
}

/**
 * Embedded data for Bali
 */
function getBaliData(): DestinationStatistics {
  return {
    destination: 'Bali',
    summary: 'Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs. The island is home to religious sites such as cliffside Uluwatu Temple and offers world-class surfing and diving.',
    currency: 'IDR',
    currencyName: 'Indonesian Rupiah',
    localLanguage: 'Balinese, Indonesian',
    averageDailyBudget: 70,
    topAttraction: 'Uluwatu Temple',
    safetyIndex: 8.2,
    bestTimeToVisit: 'April to October (dry season)',
    expenses: [
      { category: 'Accommodation', cost: 70 },
      { category: 'Food', cost: 25 },
      { category: 'Transportation', cost: 15 },
      { category: 'Activities', cost: 30 },
      { category: 'Miscellaneous', cost: 15 }
    ],
    visitorData: [
      { name: 'Jan', value: 380 },
      { name: 'Feb', value: 350 },
      { name: 'Mar', value: 370 },
      { name: 'Apr', value: 400 },
      { name: 'May', value: 420 },
      { name: 'Jun', value: 450 },
      { name: 'Jul', value: 580 },
      { name: 'Aug', value: 620 },
      { name: 'Sep', value: 480 },
      { name: 'Oct', value: 440 },
      { name: 'Nov', value: 400 },
      { name: 'Dec', value: 420 }
    ],
    activityDistribution: [
      { activity: 'Beaches & Water Sports', percentage: 35 },
      { activity: 'Cultural Experiences', percentage: 25 },
      { activity: 'Wellness & Spa', percentage: 20 },
      { activity: 'Nature & Hiking', percentage: 15 },
      { activity: 'Nightlife', percentage: 5 }
    ],
    seasonalRecommendations: [
      { month: 'Jan', rating: 6 },
      { month: 'Feb', rating: 6 },
      { month: 'Mar', rating: 7 },
      { month: 'Apr', rating: 8 },
      { month: 'May', rating: 9 },
      { month: 'Jun', rating: 9 },
      { month: 'Jul', rating: 10 },
      { month: 'Aug', rating: 10 },
      { month: 'Sep', rating: 9 },
      { month: 'Oct', rating: 8 },
      { month: 'Nov', rating: 6 },
      { month: 'Dec', rating: 6 }
    ]
  };
}

/**
 * Embedded data for Rome
 */
function getRomeData(): DestinationStatistics {
  return {
    destination: 'Rome',
    summary: 'Rome, Italy\'s capital, is a sprawling, cosmopolitan city with nearly 3,000 years of globally influential art, architecture and culture on display. Ancient ruins such as the Forum and the Colosseum evoke the power of the former Roman Empire.',
    currency: 'EUR',
    currencyName: 'Euro',
    localLanguage: 'Italian',
    averageDailyBudget: 130,
    topAttraction: 'Colosseum',
    safetyIndex: 7.4,
    bestTimeToVisit: 'April to May and September to October',
    expenses: [
      { category: 'Accommodation', cost: 130 },
      { category: 'Food', cost: 60 },
      { category: 'Transportation', cost: 15 },
      { category: 'Activities', cost: 50 },
      { category: 'Miscellaneous', cost: 25 }
    ],
    visitorData: [
      { name: 'Jan', value: 200 },
      { name: 'Feb', value: 220 },
      { name: 'Mar', value: 300 },
      { name: 'Apr', value: 400 },
      { name: 'May', value: 480 },
      { name: 'Jun', value: 520 },
      { name: 'Jul', value: 580 },
      { name: 'Aug', value: 600 },
      { name: 'Sep', value: 500 },
      { name: 'Oct', value: 420 },
      { name: 'Nov', value: 280 },
      { name: 'Dec', value: 240 }
    ],
    activityDistribution: [
      { activity: 'Historical Sites', percentage: 40 },
      { activity: 'Cuisine & Dining', percentage: 25 },
      { activity: 'Religious Sites', percentage: 15 },
      { activity: 'Art & Museums', percentage: 15 },
      { activity: 'Shopping', percentage: 5 }
    ],
    seasonalRecommendations: [
      { month: 'Jan', rating: 6 },
      { month: 'Feb', rating: 7 },
      { month: 'Mar', rating: 8 },
      { month: 'Apr', rating: 9 },
      { month: 'May', rating: 9 },
      { month: 'Jun', rating: 8 },
      { month: 'Jul', rating: 7 },
      { month: 'Aug', rating: 6 },
      { month: 'Sep', rating: 9 },
      { month: 'Oct', rating: 10 },
      { month: 'Nov', rating: 8 },
      { month: 'Dec', rating: 7 }
    ]
  };
}