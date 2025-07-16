import { db } from ".";
import { 
  airlines, 
  destinationStats, 
  seasonalRecommendations, 
  activityDistribution, 
  visitorData, 
  comparableDestinations, 
  airportCityMapping,
  airports
} from "@shared/schema";

// Airlines data to replace hardcoded arrays
const airlinesData = [
  { iataCode: "SQ", icaoCode: "SIA", name: "Singapore Airlines", country: "Singapore", logo: "https://logos.world/images/planes/singapore-airlines-logo.png" },
  { iataCode: "EK", icaoCode: "UAE", name: "Emirates", country: "United Arab Emirates", logo: "https://logos.world/images/planes/emirates-logo.png" },
  { iataCode: "QR", icaoCode: "QTR", name: "Qatar Airways", country: "Qatar", logo: "https://logos.world/images/planes/qatar-airways-logo.png" },
  { iataCode: "CX", icaoCode: "CPA", name: "Cathay Pacific", country: "Hong Kong", logo: "https://logos.world/images/planes/cathay-pacific-logo.png" },
  { iataCode: "TK", icaoCode: "THY", name: "Turkish Airlines", country: "Turkey", logo: "https://logos.world/images/planes/turkish-airlines-logo.png" },
  { iataCode: "BA", icaoCode: "BAW", name: "British Airways", country: "United Kingdom", logo: "https://logos.world/images/planes/british-airways-logo.png" },
  { iataCode: "AF", icaoCode: "AFR", name: "Air France", country: "France", logo: "https://logos.world/images/planes/air-france-logo.png" },
  { iataCode: "LH", icaoCode: "DLH", name: "Lufthansa", country: "Germany", logo: "https://logos.world/images/planes/lufthansa-logo.png" },
  { iataCode: "KL", icaoCode: "KLM", name: "KLM Royal Dutch Airlines", country: "Netherlands", logo: "https://logos.world/images/planes/klm-logo.png" },
  { iataCode: "AA", icaoCode: "AAL", name: "American Airlines", country: "United States", logo: "https://logos.world/images/planes/american-airlines-logo.png" },
  { iataCode: "UA", icaoCode: "UAL", name: "United Airlines", country: "United States", logo: "https://logos.world/images/planes/united-airlines-logo.png" },
  { iataCode: "DL", icaoCode: "DAL", name: "Delta Air Lines", country: "United States", logo: "https://logos.world/images/planes/delta-air-lines-logo.png" },
  { iataCode: "JL", icaoCode: "JAL", name: "Japan Airlines", country: "Japan", logo: "https://logos.world/images/planes/japan-airlines-logo.png" },
  { iataCode: "NH", icaoCode: "ANA", name: "All Nippon Airways", country: "Japan", logo: "https://logos.world/images/planes/ana-logo.png" },
  { iataCode: "OZ", icaoCode: "AAR", name: "Asiana Airlines", country: "South Korea", logo: "https://logos.world/images/planes/asiana-airlines-logo.png" },
  { iataCode: "KE", icaoCode: "KAL", name: "Korean Air", country: "South Korea", logo: "https://logos.world/images/planes/korean-air-logo.png" },
  { iataCode: "TG", icaoCode: "THA", name: "Thai Airways", country: "Thailand", logo: "https://logos.world/images/planes/thai-airways-logo.png" },
  { iataCode: "MH", icaoCode: "MAS", name: "Malaysia Airlines", country: "Malaysia", logo: "https://logos.world/images/planes/malaysia-airlines-logo.png" },
  { iataCode: "PR", icaoCode: "PAL", name: "Philippine Airlines", country: "Philippines", logo: "https://logos.world/images/planes/philippine-airlines-logo.png" },
  { iataCode: "GA", icaoCode: "GIA", name: "Garuda Indonesia", country: "Indonesia", logo: "https://logos.world/images/planes/garuda-indonesia-logo.png" },
];

// Destination statistics data
const destinationStatsData = [
  {
    destinationId: "tokyo-japan",
    name: "Tokyo",
    country: "Japan",
    overallRating: "8.7",
    activitiesRating: "9.2",
    sceneryRating: "8.1",
    valueRating: "7.8",
    accessibilityRating: "8.9",
    accommodationCost: 180,
    foodCost: 65,
    transportationCost: 45,
    activitiesCost: 55,
    miscCost: 27,
    peakSeason: "spring",
    bestTimeToVisit: "March-May, October-November",
    timezone: "JST",
    currency: "JPY",
    language: "Japanese"
  },
  {
    destinationId: "rome-italy",
    name: "Rome",
    country: "Italy",
    overallRating: "8.4",
    activitiesRating: "8.8",
    sceneryRating: "9.1",
    valueRating: "7.5",
    accessibilityRating: "7.8",
    accommodationCost: 150,
    foodCost: 55,
    transportationCost: 35,
    activitiesCost: 45,
    miscCost: 23,
    peakSeason: "summer",
    bestTimeToVisit: "April-June, September-October",
    timezone: "CET",
    currency: "EUR",
    language: "Italian"
  },
  {
    destinationId: "beijing-china",
    name: "Beijing",
    country: "China",
    overallRating: "8.1",
    activitiesRating: "8.5",
    sceneryRating: "7.9",
    valueRating: "8.4",
    accessibilityRating: "7.6",
    accommodationCost: 120,
    foodCost: 40,
    transportationCost: 25,
    activitiesCost: 35,
    miscCost: 18,
    peakSeason: "spring",
    bestTimeToVisit: "April-May, September-October",
    timezone: "CST",
    currency: "CNY",
    language: "Chinese"
  },
  {
    destinationId: "singapore-singapore",
    name: "Singapore",
    country: "Singapore",
    overallRating: "8.6",
    activitiesRating: "8.3",
    sceneryRating: "7.8",
    valueRating: "7.2",
    accessibilityRating: "9.1",
    accommodationCost: 200,
    foodCost: 70,
    transportationCost: 40,
    activitiesCost: 60,
    miscCost: 30,
    peakSeason: "year-round",
    bestTimeToVisit: "February-April, July-September",
    timezone: "SGT",
    currency: "SGD",
    language: "English"
  },
  {
    destinationId: "bangkok-thailand",
    name: "Bangkok",
    country: "Thailand",
    overallRating: "8.3",
    activitiesRating: "8.7",
    sceneryRating: "8.0",
    valueRating: "8.8",
    accessibilityRating: "8.2",
    accommodationCost: 80,
    foodCost: 30,
    transportationCost: 15,
    activitiesCost: 25,
    miscCost: 12,
    peakSeason: "winter",
    bestTimeToVisit: "November-March",
    timezone: "ICT",
    currency: "THB",
    language: "Thai"
  }
];

// Seasonal recommendations data
const seasonalRecommendationsData = [
  // Tokyo
  { destinationId: "tokyo-japan", season: "Spring", score: "9.5", highlights: ["Cherry blossom season", "Pleasant temperatures", "Seasonal festivals"] },
  { destinationId: "tokyo-japan", season: "Summer", score: "7.2", highlights: ["Summer festivals", "Firework displays", "Hot and humid"] },
  { destinationId: "tokyo-japan", season: "Fall", score: "9.3", highlights: ["Autumn foliage", "Comfortable temperatures", "Cultural events"] },
  { destinationId: "tokyo-japan", season: "Winter", score: "8.0", highlights: ["Winter illuminations", "New Year celebrations", "Less crowded"] },
  
  // Rome
  { destinationId: "rome-italy", season: "Spring", score: "9.3", highlights: ["Pleasant weather", "Blooming gardens", "Pre-summer crowds"] },
  { destinationId: "rome-italy", season: "Summer", score: "7.8", highlights: ["Long daylight hours", "Outdoor dining", "Hot and crowded"] },
  { destinationId: "rome-italy", season: "Fall", score: "9.0", highlights: ["Comfortable temperatures", "Fewer tourists", "Harvest cuisine"] },
  { destinationId: "rome-italy", season: "Winter", score: "8.2", highlights: ["Christmas markets", "Vatican celebrations", "Lowest crowds"] },
  
  // Beijing
  { destinationId: "beijing-china", season: "Spring (Apr-May)", score: "9.2", highlights: ["Comfortable temperatures", "Blooming flowers", "Less air pollution"] },
  { destinationId: "beijing-china", season: "Autumn (Sep-Oct)", score: "9.5", highlights: ["Clear skies", "Perfect temperatures", "National holiday events"] },
  { destinationId: "beijing-china", season: "Summer (Jun-Aug)", score: "7.0", highlights: ["Extended opening hours", "Summer festivals", "Hot temperatures"] },
  { destinationId: "beijing-china", season: "Winter (Nov-Mar)", score: "7.2", highlights: ["Snow at Great Wall", "Chinese New Year", "Cold temperatures"] },
  
  // Singapore
  { destinationId: "singapore-singapore", season: "Dry Season (Feb-Apr)", score: "9.1", highlights: ["Less rainfall", "Comfortable humidity", "Chinese New Year"] },
  { destinationId: "singapore-singapore", season: "Wet Season (Nov-Jan)", score: "8.4", highlights: ["Cooler temperatures", "Festive season", "Occasional showers"] },
  { destinationId: "singapore-singapore", season: "Mid-Year (May-Oct)", score: "8.0", highlights: ["Consistent weather", "Good shopping", "Indoor attractions"] },
  
  // Bangkok
  { destinationId: "bangkok-thailand", season: "Cool Season (Nov-Feb)", score: "9.4", highlights: ["Pleasant weather", "Low humidity", "Peak tourist season"] },
  { destinationId: "bangkok-thailand", season: "Hot Season (Mar-May)", score: "7.5", highlights: ["Songkran festival", "Very hot weather", "Fewer crowds"] },
  { destinationId: "bangkok-thailand", season: "Rainy Season (Jun-Oct)", score: "8.2", highlights: ["Lush greenery", "Lower prices", "Afternoon showers"] },
];

// Activity distribution data
const activityDistributionData = [
  // Tokyo
  { destinationId: "tokyo-japan", activityType: "Cultural Sites", percentage: 25 },
  { destinationId: "tokyo-japan", activityType: "Modern Attractions", percentage: 20 },
  { destinationId: "tokyo-japan", activityType: "Cuisine", percentage: 25 },
  { destinationId: "tokyo-japan", activityType: "Shopping", percentage: 15 },
  { destinationId: "tokyo-japan", activityType: "Nature & Parks", percentage: 10 },
  { destinationId: "tokyo-japan", activityType: "Entertainment", percentage: 5 },
  
  // Rome
  { destinationId: "rome-italy", activityType: "Historical Sites", percentage: 35 },
  { destinationId: "rome-italy", activityType: "Museums", percentage: 20 },
  { destinationId: "rome-italy", activityType: "Religious Sites", percentage: 15 },
  { destinationId: "rome-italy", activityType: "Art & Culture", percentage: 15 },
  { destinationId: "rome-italy", activityType: "Food & Dining", percentage: 10 },
  { destinationId: "rome-italy", activityType: "Shopping", percentage: 5 },
  
  // Beijing
  { destinationId: "beijing-china", activityType: "Historical Sites", percentage: 30 },
  { destinationId: "beijing-china", activityType: "Cultural Sites", percentage: 25 },
  { destinationId: "beijing-china", activityType: "Culinary Tourism", percentage: 15 },
  { destinationId: "beijing-china", activityType: "Modern Attractions", percentage: 15 },
  { destinationId: "beijing-china", activityType: "Shopping", percentage: 10 },
  { destinationId: "beijing-china", activityType: "Nature & Parks", percentage: 5 },
  
  // Singapore
  { destinationId: "singapore-singapore", activityType: "Urban Attractions", percentage: 25 },
  { destinationId: "singapore-singapore", activityType: "Food & Dining", percentage: 25 },
  { destinationId: "singapore-singapore", activityType: "Shopping", percentage: 20 },
  { destinationId: "singapore-singapore", activityType: "Cultural Sites", percentage: 15 },
  { destinationId: "singapore-singapore", activityType: "Nature & Parks", percentage: 10 },
  { destinationId: "singapore-singapore", activityType: "Entertainment", percentage: 5 },
  
  // Bangkok
  { destinationId: "bangkok-thailand", activityType: "Cultural Sites", percentage: 30 },
  { destinationId: "bangkok-thailand", activityType: "Food & Dining", percentage: 25 },
  { destinationId: "bangkok-thailand", activityType: "Shopping", percentage: 20 },
  { destinationId: "bangkok-thailand", activityType: "Religious Sites", percentage: 15 },
  { destinationId: "bangkok-thailand", activityType: "Modern Attractions", percentage: 5 },
  { destinationId: "bangkok-thailand", activityType: "Nightlife", percentage: 5 },
];

// Visitor data (monthly)
const visitorDataSet = [
  // Tokyo
  { destinationId: "tokyo-japan", month: "Jan", visitors: 180000 },
  { destinationId: "tokyo-japan", month: "Feb", visitors: 220000 },
  { destinationId: "tokyo-japan", month: "Mar", visitors: 380000 },
  { destinationId: "tokyo-japan", month: "Apr", visitors: 450000 },
  { destinationId: "tokyo-japan", month: "May", visitors: 320000 },
  { destinationId: "tokyo-japan", month: "Jun", visitors: 250000 },
  { destinationId: "tokyo-japan", month: "Jul", visitors: 280000 },
  { destinationId: "tokyo-japan", month: "Aug", visitors: 290000 },
  { destinationId: "tokyo-japan", month: "Sep", visitors: 310000 },
  { destinationId: "tokyo-japan", month: "Oct", visitors: 370000 },
  { destinationId: "tokyo-japan", month: "Nov", visitors: 340000 },
  { destinationId: "tokyo-japan", month: "Dec", visitors: 240000 },
  
  // Rome
  { destinationId: "rome-italy", month: "Jan", visitors: 150000 },
  { destinationId: "rome-italy", month: "Feb", visitors: 180000 },
  { destinationId: "rome-italy", month: "Mar", visitors: 280000 },
  { destinationId: "rome-italy", month: "Apr", visitors: 420000 },
  { destinationId: "rome-italy", month: "May", visitors: 480000 },
  { destinationId: "rome-italy", month: "Jun", visitors: 520000 },
  { destinationId: "rome-italy", month: "Jul", visitors: 580000 },
  { destinationId: "rome-italy", month: "Aug", visitors: 560000 },
  { destinationId: "rome-italy", month: "Sep", visitors: 450000 },
  { destinationId: "rome-italy", month: "Oct", visitors: 380000 },
  { destinationId: "rome-italy", month: "Nov", visitors: 220000 },
  { destinationId: "rome-italy", month: "Dec", visitors: 190000 },
];

// Comparable destinations
const comparableDestinationsData = [
  { destinationId: "tokyo-japan", comparableDestinationId: "osaka-japan", similarityScore: "0.85" },
  { destinationId: "tokyo-japan", comparableDestinationId: "seoul-south-korea", similarityScore: "0.78" },
  { destinationId: "tokyo-japan", comparableDestinationId: "taipei-taiwan", similarityScore: "0.72" },
  
  { destinationId: "rome-italy", comparableDestinationId: "florence-italy", similarityScore: "0.82" },
  { destinationId: "rome-italy", comparableDestinationId: "paris-france", similarityScore: "0.75" },
  { destinationId: "rome-italy", comparableDestinationId: "athens-greece", similarityScore: "0.68" },
  
  { destinationId: "beijing-china", comparableDestinationId: "shanghai-china", similarityScore: "0.80" },
  { destinationId: "beijing-china", comparableDestinationId: "xian-china", similarityScore: "0.73" },
  { destinationId: "beijing-china", comparableDestinationId: "seoul-south-korea", similarityScore: "0.65" },
];

// Airport city mappings
const airportCityMappingData = [
  { cityName: "singapore", airportCode: "SIN", isDefault: true },
  { cityName: "new york", airportCode: "JFK", isDefault: true },
  { cityName: "new york", airportCode: "LGA", isDefault: false },
  { cityName: "new york", airportCode: "EWR", isDefault: false },
  { cityName: "london", airportCode: "LHR", isDefault: true },
  { cityName: "london", airportCode: "LGW", isDefault: false },
  { cityName: "london", airportCode: "STN", isDefault: false },
  { cityName: "paris", airportCode: "CDG", isDefault: true },
  { cityName: "paris", airportCode: "ORY", isDefault: false },
  { cityName: "tokyo", airportCode: "NRT", isDefault: true },
  { cityName: "tokyo", airportCode: "HND", isDefault: false },
  { cityName: "sydney", airportCode: "SYD", isDefault: true },
  { cityName: "los angeles", airportCode: "LAX", isDefault: true },
  { cityName: "bangkok", airportCode: "BKK", isDefault: true },
  { cityName: "dubai", airportCode: "DXB", isDefault: true },
  { cityName: "hong kong", airportCode: "HKG", isDefault: true },
  { cityName: "kuala lumpur", airportCode: "KUL", isDefault: true },
  { cityName: "manila", airportCode: "MNL", isDefault: true },
  { cityName: "jakarta", airportCode: "CGK", isDefault: true },
  { cityName: "seoul", airportCode: "ICN", isDefault: true },
  { cityName: "seoul", airportCode: "GMP", isDefault: false },
  { cityName: "mumbai", airportCode: "BOM", isDefault: true },
  { cityName: "delhi", airportCode: "DEL", isDefault: true },
  { cityName: "beijing", airportCode: "PEK", isDefault: true },
  { cityName: "beijing", airportCode: "PKX", isDefault: false },
  { cityName: "shanghai", airportCode: "PVG", isDefault: true },
  { cityName: "shanghai", airportCode: "SHA", isDefault: false },
  { cityName: "rome", airportCode: "FCO", isDefault: true },
  { cityName: "rome", airportCode: "CIA", isDefault: false },
  { cityName: "amsterdam", airportCode: "AMS", isDefault: true },
  { cityName: "frankfurt", airportCode: "FRA", isDefault: true },
  { cityName: "zurich", airportCode: "ZUR", isDefault: true },
  { cityName: "vienna", airportCode: "VIE", isDefault: true },
  { cityName: "oslo", airportCode: "OSL", isDefault: true },
  { cityName: "stockholm", airportCode: "ARN", isDefault: true },
  { cityName: "copenhagen", airportCode: "CPH", isDefault: true },
  { cityName: "helsinki", airportCode: "HEL", isDefault: true },
  { cityName: "moscow", airportCode: "SVO", isDefault: true },
  { cityName: "moscow", airportCode: "DME", isDefault: false },
  { cityName: "istanbul", airportCode: "IST", isDefault: true },
  { cityName: "istanbul", airportCode: "SAW", isDefault: false },
  { cityName: "doha", airportCode: "DOH", isDefault: true },
  { cityName: "abu dhabi", airportCode: "AUH", isDefault: true },
  { cityName: "riyadh", airportCode: "RUH", isDefault: true },
  { cityName: "jeddah", airportCode: "JED", isDefault: true },
  { cityName: "cairo", airportCode: "CAI", isDefault: true },
  { cityName: "johannesburg", airportCode: "JNB", isDefault: true },
  { cityName: "cape town", airportCode: "CPT", isDefault: true },
  { cityName: "nairobi", airportCode: "NBO", isDefault: true },
  { cityName: "addis ababa", airportCode: "ADD", isDefault: true },
  { cityName: "casablanca", airportCode: "CMN", isDefault: true },
  { cityName: "tunis", airportCode: "TUN", isDefault: true },
  { cityName: "algiers", airportCode: "ALG", isDefault: true },
  { cityName: "lagos", airportCode: "LOS", isDefault: true },
  { cityName: "accra", airportCode: "ACC", isDefault: true },
  { cityName: "dakar", airportCode: "DKR", isDefault: true },
];

async function seedComprehensiveData() {
  try {
    console.log("Starting comprehensive data seeding...");
    
    // Clear existing data
    await db.delete(airportCityMapping);
    await db.delete(comparableDestinations);
    await db.delete(visitorData);
    await db.delete(activityDistribution);
    await db.delete(seasonalRecommendations);
    await db.delete(destinationStats);
    await db.delete(airlines);
    
    console.log("Cleared existing data");
    
    // Insert airlines
    await db.insert(airlines).values(airlinesData);
    console.log(`Inserted ${airlinesData.length} airlines`);
    
    // Insert destination stats - map destinationId to id
    const destinationStatsFormatted = destinationStatsData.map(dest => ({
      ...dest,
      id: dest.destinationId
    }));
    await db.insert(destinationStats).values(destinationStatsFormatted);
    console.log(`Inserted ${destinationStatsFormatted.length} destination stats`);
    
    // Insert seasonal recommendations - convert score to integer (multiply by 10 to preserve decimal precision)
    const seasonalRecommendationsFormatted = seasonalRecommendationsData.map(item => ({
      ...item,
      score: Math.round(parseFloat(item.score) * 10) // Convert 9.5 to 95, 8.2 to 82
    }));
    await db.insert(seasonalRecommendations).values(seasonalRecommendationsFormatted);
    console.log(`Inserted ${seasonalRecommendationsFormatted.length} seasonal recommendations`);
    
    // Insert activity distributions
    await db.insert(activityDistribution).values(activityDistributionData);
    console.log(`Inserted ${activityDistributionData.length} activity distributions`);
    
    // Insert visitor data
    await db.insert(visitorData).values(visitorDataSet);
    console.log(`Inserted ${visitorDataSet.length} visitor data points`);
    
    // Insert comparable destinations
    await db.insert(comparableDestinations).values(comparableDestinationsData);
    console.log(`Inserted ${comparableDestinationsData.length} comparable destinations`);
    
    // Insert airport city mappings
    await db.insert(airportCityMapping).values(airportCityMappingData);
    console.log(`Inserted ${airportCityMappingData.length} airport city mappings`);
    
    console.log("✅ Comprehensive data seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding comprehensive data:", error);
    throw error;
  }
}

// Run the seeding function when executed directly
seedComprehensiveData()
  .then(() => {
    console.log("Database seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database seeding failed:", error);
    process.exit(1);
  });

export { seedComprehensiveData };