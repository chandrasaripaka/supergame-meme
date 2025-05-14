/**
 * Google Maps Services Integration
 * 
 * This service provides functions to interact with Google Maps APIs for:
 * - Places (hotels, airports, etc.)
 * - Distance and duration calculations
 * - Geocoding
 */

import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js';
import fetch from 'node-fetch';

// Initialize the Google Maps Client
const client = new Client({});
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!GOOGLE_PLACES_API_KEY) {
  console.warn('GOOGLE_PLACES_API_KEY environment variable not set. Google Maps services will not work.');
}

/**
 * Search for hotels in a specific location
 * 
 * @param location Location to search around (city, address, etc.)
 * @param radius Radius in meters to search within (max 50000)
 * @returns Array of hotel places
 */
export async function searchHotels(
  location: string,
  checkIn?: string,  // Added for compatibility with AccommodationAgent
  checkOut?: string,  // Added for compatibility with AccommodationAgent
  guests: number = 2, // Added for compatibility with AccommodationAgent
  radius: number = 5000,
  minPrice?: number,
  maxPrice?: number,
): Promise<any[]> {
  try {
    // First, geocode the location to get coordinates
    const geocodeResponse = await client.geocode({
      params: {
        address: location,
        key: GOOGLE_PLACES_API_KEY!
      }
    });
    
    if (geocodeResponse.data.results.length === 0) {
      throw new Error(`Location "${location}" not found`);
    }
    
    const locationCoords = geocodeResponse.data.results[0].geometry?.location;
    
    if (!locationCoords) {
      throw new Error(`Could not determine coordinates for location "${location}"`);
    }
    
    const { lat, lng } = locationCoords;
    
    // Search for hotels using nearby search
    const placesResponse = await client.placesNearby({
      params: {
        location: { lat, lng },
        radius: Math.min(radius, 50000), // Max radius is 50km
        type: 'lodging', // Type for hotels and accommodations
        key: GOOGLE_PLACES_API_KEY!
      }
    });
    
    // Filter out hotels that don't have valid details
    const hotels = placesResponse.data.results.map(place => ({
      id: place.place_id,
      name: place.name || 'Unnamed Hotel',
      address: place.vicinity || 'Address not available',
      location: {
        lat: place.geometry?.location?.lat || lat,
        lng: place.geometry?.location?.lng || lng
      },
      rating: place.rating || 0,
      userRatingsTotal: place.user_ratings_total || 0,
      priceLevel: place.price_level,
      photos: place.photos?.map(photo => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height
      })) || []
    }));
    
    // Apply price filtering if specified
    let filteredHotels = hotels;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filteredHotels = hotels.filter(hotel => {
        if (minPrice !== undefined && (hotel.priceLevel === undefined || hotel.priceLevel < minPrice)) {
          return false;
        }
        if (maxPrice !== undefined && (hotel.priceLevel !== undefined && hotel.priceLevel > maxPrice)) {
          return false;
        }
        return true;
      });
    }
    
    return filteredHotels;
  } catch (error) {
    console.error('Error searching for hotels:', error);
    throw error;
  }
}

/**
 * Get hotel price estimates based on the pricing level
 * 
 * @param priceLevel Google's price level (0-4)
 * @returns Estimated price range in USD
 */
export function getHotelPriceEstimate(priceLevel?: number): { min: number; max: number } {
  switch (priceLevel) {
    case 0: // Free
      return { min: 0, max: 0 };
    case 1: // Inexpensive
      return { min: 50, max: 100 };
    case 2: // Moderate
      return { min: 100, max: 200 };
    case 3: // Expensive
      return { min: 200, max: 350 };
    case 4: // Very Expensive
      return { min: 350, max: 1000 };
    default: // Unknown
      return { min: 100, max: 300 };
  }
}

/**
 * Get details for a specific place
 * 
 * @param placeId Google Places ID
 * @returns Detailed place information
 */
export async function getPlaceDetails(placeId: string): Promise<any> {
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ['name', 'formatted_address', 'geometry', 'rating', 'user_ratings_total', 'price_level', 'formatted_phone_number', 'website', 'photos', 'reviews', 'opening_hours', 'types'],
        key: GOOGLE_PLACES_API_KEY!
      }
    });
    
    return response.data.result;
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
}

/**
 * Search for airports in a specific location
 * 
 * @param location Location to search around (city, country, etc.)
 * @param radius Radius in meters to search within (max 50000)
 * @returns Array of airport places
 */
export async function searchAirports(location: string, radius: number = 20000): Promise<any[]> {
  try {
    // First, geocode the location to get coordinates
    const geocodeResponse = await client.geocode({
      params: {
        address: location,
        key: GOOGLE_PLACES_API_KEY!
      }
    });
    
    if (geocodeResponse.data.results.length === 0) {
      throw new Error(`Location "${location}" not found`);
    }
    
    const locationCoords = geocodeResponse.data.results[0].geometry?.location;
    
    if (!locationCoords) {
      throw new Error(`Could not determine coordinates for location "${location}"`);
    }
    
    const { lat, lng } = locationCoords;
    
    // Search for airports using nearby search with different keywords
    const placesResponse = await client.placesNearby({
      params: {
        location: { lat, lng },
        radius: Math.min(radius, 50000), // Max radius is 50km
        keyword: 'airport' as any, // Type cast as 'any' to bypass strict type checking
        key: GOOGLE_PLACES_API_KEY!
      }
    });
    
    // Filter and map the results
    const airports = placesResponse.data.results
      .filter(place => {
        // Ensure it's actually an airport by checking name or types
        const name = (place.name || '').toLowerCase();
        const isAirport = name.includes('airport') || 
                          name.includes('international') ||
                          place.types?.some(type => type.toLowerCase() === 'airport');
        return isAirport;
      })
      .map(place => ({
        id: place.place_id,
        name: place.name || 'Unnamed Airport',
        address: place.vicinity || 'Address not available',
        location: {
          lat: place.geometry?.location?.lat || lat,
          lng: place.geometry?.location?.lng || lng
        },
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        photos: place.photos?.map(photo => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height
        })) || []
      }));
    
    return airports;
  } catch (error) {
    console.error('Error searching for airports:', error);
    throw error;
  }
}

/**
 * Calculate distance and duration between origin and destination
 * 
 * @param origin Origin location (address, city, etc.)
 * @param destination Destination location (address, city, etc.)
 * @param mode Travel mode (driving, walking, bicycling, transit)
 * @returns Distance and duration information
 */
export async function calculateDistance(
  origin: string,
  destination: string,
  mode: any = 'driving'
): Promise<{ distance: { text: string; value: number }; duration: { text: string; value: number } }> {
  try {
    const response = await client.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        mode: mode as any,
        key: GOOGLE_PLACES_API_KEY!
      }
    });
    
    if (response.data.rows.length === 0 || response.data.rows[0].elements.length === 0) {
      throw new Error('No route found between origin and destination');
    }
    
    const element = response.data.rows[0].elements[0];
    
    if (element.status !== 'OK') {
      throw new Error(`Route calculation failed: ${element.status}`);
    }
    
    return {
      distance: element.distance,
      duration: element.duration
    };
  } catch (error) {
    console.error('Error calculating distance:', error);
    throw error;
  }
}

/**
 * Get a photo URL from a photo reference
 * 
 * @param photoReference Google Places photo reference
 * @param maxWidth Maximum width of the image
 * @param maxHeight Maximum height of the image
 * @returns URL to the photo
 */
export function getPhotoUrl(photoReference: string, maxWidth: number = 400, maxHeight?: number): string {
  const params = new URLSearchParams({
    photoreference: photoReference,
    key: GOOGLE_PLACES_API_KEY!,
    maxwidth: maxWidth.toString()
  });
  
  if (maxHeight) {
    params.append('maxheight', maxHeight.toString());
  }
  
  return `https://maps.googleapis.com/maps/api/place/photo?${params.toString()}`;
}

/**
 * Get a static map URL for a location
 * 
 * @param location Location (lat/lng object or address string)
 * @param zoom Zoom level (1-20)
 * @param width Image width in pixels
 * @param height Image height in pixels
 * @returns URL to the static map image
 */
export function getStaticMapUrl(
  location: { lat: number; lng: number } | string,
  zoom: number = 13,
  width: number = 600,
  height: number = 300
): string {
  const center = typeof location === 'string' 
    ? encodeURIComponent(location)
    : `${location.lat},${location.lng}`;
  
  return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${center}&key=${GOOGLE_PLACES_API_KEY}`;
}

/**
 * Search for flights between two locations
 * Note: This is a simulated function as Google doesn't have a direct API for flight prices.
 * In a real-world scenario, you'd use a flight search API like Amadeus, Skyscanner, or Sabre.
 * 
 * @param origin Origin location (city or airport code)
 * @param destination Destination location (city or airport code)
 * @param departureDate Departure date (YYYY-MM-DD)
 * @param returnDate Return date (YYYY-MM-DD)
 * @param adults Number of adult passengers
 * @returns Array of flight options
 */
export async function searchFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string,
  adults: number = 1
): Promise<any[]> {
  try {
    // TODO: Replace with real flight API integration
    
    // For now, we'll generate realistic flight data based on destinations
    const flights = generateFlightData(origin, destination, departureDate, returnDate, adults);
    
    return flights;
  } catch (error) {
    console.error('Error searching for flights:', error);
    throw error;
  }
}

/**
 * Generate realistic flight data for demo purposes
 * 
 * @param origin Origin location
 * @param destination Destination location
 * @param departureDate Departure date
 * @param returnDate Return date
 * @param adults Number of adult passengers
 * @returns Array of flight options
 */
function generateFlightData(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string,
  adults: number = 1
): any[] {
  // Common airlines
  const airlines = [
    'American Airlines', 'United', 'Delta', 'British Airways', 
    'Lufthansa', 'Emirates', 'Singapore Airlines', 'Qatar Airways',
    'Air France', 'KLM', 'Japan Airlines', 'Cathay Pacific'
  ];
  
  // Generate a base price based on distance (very simplified)
  const basePriceMultiplier = getDistanceBasedPriceMultiplier(origin, destination);
  
  // Generate different flight options
  const flights = [];
  const numFlights = 5 + Math.floor(Math.random() * 8); // 5-12 flights
  
  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const stops = Math.random() > 0.6 ? Math.floor(Math.random() * 2) + 1 : 0; // 60% chance of direct flight
    
    // Generate departure time between 6am and 10pm
    const depHour = 6 + Math.floor(Math.random() * 16);
    const depMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45 min
    const departureTime = `${depHour.toString().padStart(2, '0')}:${depMinute.toString().padStart(2, '0')}`;
    
    // Generate duration between 2 and 15 hours
    const durationHours = Math.max(2, Math.min(15, Math.floor(basePriceMultiplier))); 
    const durationMinutes = Math.floor(Math.random() * 60);
    const duration = `${durationHours}h ${durationMinutes}m`;
    
    // Calculate arrival time
    const arrHour = (depHour + durationHours + Math.floor((depMinute + durationMinutes) / 60)) % 24;
    const arrMinute = (depMinute + durationMinutes) % 60;
    const arrivalTime = `${arrHour.toString().padStart(2, '0')}:${arrMinute.toString().padStart(2, '0')}`;
    
    // Calculate price based on airline quality, stops, and random variation
    const airlineQualityFactor = 0.8 + (airlines.indexOf(airline) / airlines.length) * 0.4; // 0.8-1.2
    const stopsFactor = 1 - (stops * 0.15); // Fewer stops = higher price
    const randomFactor = 0.85 + (Math.random() * 0.3); // 0.85-1.15 random variation
    
    let price = Math.round(basePriceMultiplier * 100 * airlineQualityFactor * stopsFactor * randomFactor) * adults;
    
    // Add roundtrip price if return date is provided
    if (returnDate) {
      price = Math.round(price * 1.8); // Roundtrip is typically less than 2x one-way
    }
    
    flights.push({
      id: `FL${100000 + Math.floor(Math.random() * 900000)}`,
      airline,
      price,
      currency: 'USD',
      departureTime,
      arrivalTime,
      duration,
      stops,
      departureAirport: origin.length === 3 ? origin : `${origin} Airport`,
      arrivalAirport: destination.length === 3 ? destination : `${destination} Airport`,
      returnFlight: returnDate ? {
        // Calculate return flight times properly based on return date
        departureTime: `${(6 + Math.floor(Math.random() * 16)).toString().padStart(2, '0')}:${(Math.floor(Math.random() * 4) * 15).toString().padStart(2, '0')}`,
        duration: `${durationHours}h ${durationMinutes}m`, // Use same duration as outbound
        // Calculate correct arrival time based on departure and duration
        get arrivalTime() {
          const depTimeParts = this.departureTime.split(':');
          const depHour = parseInt(depTimeParts[0], 10);
          const depMinute = parseInt(depTimeParts[1], 10);
          
          const durHours = parseInt(this.duration.split('h')[0], 10);
          const durMinutes = parseInt(this.duration.split('h ')[1].split('m')[0], 10);
          
          const arrHour = (depHour + durHours + Math.floor((depMinute + durMinutes) / 60)) % 24;
          const arrMinute = (depMinute + durMinutes) % 60;
          
          return `${arrHour.toString().padStart(2, '0')}:${arrMinute.toString().padStart(2, '0')}`;
        }
      } : undefined
    });
  }
  
  // Sort by price (lowest first)
  return flights.sort((a, b) => a.price - b.price);
}

/**
 * Get a price multiplier based on the distance between origin and destination
 * This is a very simplified model for demo purposes
 * 
 * @param origin Origin location
 * @param destination Destination location
 * @returns Price multiplier
 */
function getDistanceBasedPriceMultiplier(origin: string, destination: string): number {
  // This is a simplified function that returns a price multiplier based on "perceived distance"
  // In a real app, you would calculate actual distances and use real pricing data
  
  // Normalize inputs
  const originLower = origin.toLowerCase();
  const destinationLower = destination.toLowerCase();
  
  // Determine if domestic or international (simplified)
  const isDomestic = (
    (originLower.includes('usa') || originLower.includes('united states') || originLower.includes('us')) && 
    (destinationLower.includes('usa') || destinationLower.includes('united states') || destinationLower.includes('us'))
  );
  
  // Check for common continent pairs (simplified)
  const isTransatlantic = (
    (originLower.includes('america') || originLower.includes('usa') || originLower.includes('us') || originLower.includes('canada')) &&
    (destinationLower.includes('europe') || destinationLower.includes('uk') || destinationLower.includes('france') || destinationLower.includes('germany'))
  ) || (
    (destinationLower.includes('america') || destinationLower.includes('usa') || destinationLower.includes('us') || destinationLower.includes('canada')) &&
    (originLower.includes('europe') || originLower.includes('uk') || originLower.includes('france') || originLower.includes('germany'))
  );
  
  const isTranspacific = (
    (originLower.includes('america') || originLower.includes('usa') || originLower.includes('us') || originLower.includes('canada')) &&
    (destinationLower.includes('asia') || destinationLower.includes('japan') || destinationLower.includes('china') || destinationLower.includes('australia'))
  ) || (
    (destinationLower.includes('america') || destinationLower.includes('usa') || destinationLower.includes('us') || destinationLower.includes('canada')) &&
    (originLower.includes('asia') || originLower.includes('japan') || originLower.includes('china') || originLower.includes('australia'))
  );
  
  if (isDomestic) {
    return 2 + Math.random() * 3; // $200-500 base price
  } else if (isTransatlantic) {
    return 6 + Math.random() * 4; // $600-1000 base price
  } else if (isTranspacific) {
    return 8 + Math.random() * 6; // $800-1400 base price
  } else {
    // Generic international
    return 5 + Math.random() * 7; // $500-1200 base price
  }
}

/**
 * Get hotel pricing trends for a destination
 * This simulates hotel pricing trends based on location
 * 
 * @param destination Destination location
 * @returns Hotel pricing trends
 */
export function getHotelPricingTrends(destination: string): any {
  const destinationLower = destination.toLowerCase();
  
  // Base price range based on destination type
  let basePriceRange: { min: number; max: number };
  
  // Major international cities have higher prices
  const majorCities = [
    'new york', 'london', 'tokyo', 'paris', 'hong kong', 'singapore',
    'dubai', 'sydney', 'san francisco', 'los angeles', 'miami',
    'vancouver', 'amsterdam', 'barcelona', 'rome', 'berlin'
  ];
  
  // Resort destinations typically have higher prices too
  const resortDestinations = [
    'bali', 'maldives', 'cancun', 'hawaii', 'phuket', 'santorini',
    'amalfi', 'cabo', 'ibiza', 'seychelles', 'fiji', 'tahiti'
  ];
  
  // Check destination type
  if (majorCities.some(city => destinationLower.includes(city))) {
    basePriceRange = { min: 150, max: 500 };
  } else if (resortDestinations.some(resort => destinationLower.includes(resort))) {
    basePriceRange = { min: 200, max: 800 };
  } else {
    // Default for other destinations
    basePriceRange = { min: 80, max: 350 };
  }
  
  // Generate monthly pricing trends - generally follows a global seasonality pattern
  // but with random variations
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Seasonal factors (simplified global tourism patterns)
  const seasonalFactors = {
    'January': 0.8,   // Post-holiday low season
    'February': 0.75, // Low season
    'March': 0.85,    // Beginning of spring break
    'April': 0.9,     // Spring break
    'May': 0.95,      // Spring shoulder season
    'June': 1.1,      // Summer begins
    'July': 1.25,     // Peak summer
    'August': 1.2,    // Peak summer
    'September': 0.9, // Post-summer shoulder season
    'October': 0.85,  // Fall shoulder season
    'November': 0.8,  // Pre-holiday low season
    'December': 1.15  // Holiday season
  };
  
  // Generate monthly prices
  const monthlyPrices = months.map(month => {
    const factor = seasonalFactors[month as keyof typeof seasonalFactors];
    // Add some randomness to the factor
    const adjustedFactor = factor * (0.9 + Math.random() * 0.2);
    
    const avgPrice = Math.round((basePriceRange.min + basePriceRange.max) / 2 * adjustedFactor);
    
    return {
      month,
      avgPrice,
      occupancyRate: Math.round(50 + adjustedFactor * 40) // Higher prices correlate with higher occupancy
    };
  });
  
  // Generate hotel types and their price ranges
  const hotelTypes = [
    { type: 'Budget', priceRange: { min: Math.round(basePriceRange.min * 0.6), max: Math.round(basePriceRange.min * 1.2) } },
    { type: 'Mid-range', priceRange: { min: Math.round(basePriceRange.min * 0.9), max: Math.round(basePriceRange.max * 0.7) } },
    { type: 'Luxury', priceRange: { min: Math.round(basePriceRange.max * 0.6), max: Math.round(basePriceRange.max * 1.5) } }
  ];
  
  return {
    destination,
    overallPriceRange: basePriceRange,
    monthlyPrices,
    hotelTypes,
    bestTimeToBook: getBestTimeToBook(monthlyPrices)
  };
}

/**
 * Determine the best time to book based on monthly prices
 * 
 * @param monthlyPrices Array of monthly prices
 * @returns Best month(s) to book
 */
function getBestTimeToBook(monthlyPrices: Array<{ month: string; avgPrice: number; occupancyRate: number }>): string[] {
  // Sort by price (lowest first)
  const sorted = [...monthlyPrices].sort((a, b) => a.avgPrice - b.avgPrice);
  
  // Get the 3 cheapest months
  const cheapestMonths = sorted.slice(0, 3).map(m => m.month);
  
  return cheapestMonths;
}

/**
 * Get flight pricing trends for a route
 * This simulates flight pricing trends for a specific route
 * 
 * @param origin Origin location
 * @param destination Destination location
 * @returns Flight pricing trends
 */
export function getFlightPricingTrends(origin: string, destination: string): any {
  // Generate a base price multiplier
  const basePriceMultiplier = getDistanceBasedPriceMultiplier(origin, destination);
  
  // Generate monthly pricing trends
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Seasonal factors (simplified global flight patterns)
  const seasonalFactors = {
    'January': 0.75,   // Post-holiday low season
    'February': 0.7,   // Low season
    'March': 0.85,     // Spring break begins
    'April': 0.9,      // Spring travel
    'May': 0.8,        // Shoulder season
    'June': 1.1,       // Summer begins
    'July': 1.3,       // Peak summer
    'August': 1.25,    // Peak summer
    'September': 0.85, // Post-summer
    'October': 0.8,    // Fall shoulder season
    'November': 0.85,  // Thanksgiving in US
    'December': 1.2    // Holiday season
  };
  
  // Generate monthly prices
  const monthlyPrices = months.map(month => {
    const factor = seasonalFactors[month as keyof typeof seasonalFactors];
    // Add some randomness
    const adjustedFactor = factor * (0.9 + Math.random() * 0.2);
    
    const avgPrice = Math.round(basePriceMultiplier * 100 * adjustedFactor);
    const availabilityNum = Math.round(90 - adjustedFactor * 30);
    
    return {
      month,
      avgPrice,
      occupancyRate: 100 - availabilityNum // Convert availability to occupancy rate
    };
  });
  
  // Generate "days before departure" pricing trend
  const advanceBookingTrend = [
    { daysBeforeDeparture: "1-7", priceMultiplier: 1.4 },
    { daysBeforeDeparture: "8-14", priceMultiplier: 1.2 },
    { daysBeforeDeparture: "15-30", priceMultiplier: 1.0 },
    { daysBeforeDeparture: "31-60", priceMultiplier: 0.9 },
    { daysBeforeDeparture: "61-90", priceMultiplier: 0.85 },
    { daysBeforeDeparture: "91+", priceMultiplier: 0.8 }
  ];
  
  // Generate airline comparison
  const airlines = [
    'American Airlines', 'United', 'Delta', 'British Airways', 
    'Lufthansa', 'Emirates', 'Singapore Airlines', 'Qatar Airways'
  ].slice(0, 4 + Math.floor(Math.random() * 4)); // Random selection of 4-7 airlines
  
  const airlinePrices = airlines.map(airline => {
    // Generate a factor for each airline
    const airlineFactor = 0.9 + Math.random() * 0.3; // 0.9-1.2
    
    return {
      airline,
      avgPrice: Math.round(basePriceMultiplier * 100 * airlineFactor),
      rating: 3 + Math.random() * 2 // 3-5 star rating
    };
  }).sort((a, b) => a.avgPrice - b.avgPrice); // Sort by price
  
  return {
    route: `${origin} to ${destination}`,
    basePrice: Math.round(basePriceMultiplier * 100),
    monthlyPrices,
    advanceBookingTrend,
    airlines: airlinePrices,
    bestTimeToBook: getBestTimeToBook(monthlyPrices)
  };
}