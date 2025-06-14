/**
 * Flight Search Service
 * 
 * This service handles flight search functionality using Google Travel Partners API
 * for authentic flight data with real airline information and pricing.
 */

import fetch from 'node-fetch';

export interface FlightSearch {
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  returnDate?: string;
}

export interface Flight {
  id: string;
  airline: string;
  logo?: string;
  flightNumber: string;
  departureAirport: string;
  departureCity: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string;
  duration: string;
  stops: number | string;
  price: number;
  currency: string;
}

/**
 * Search for flights using Google Travel Partners API
 */
export async function searchFlights(search: FlightSearch): Promise<Flight[]> {
  try {
    // Use Google Travel Partners API for authentic flight data
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!googleApiKey) {
      throw new Error('Google API key required for flight search. Please configure GOOGLE_PLACES_API_KEY environment variable.');
    }

    try {
      const authenticFlights = await searchGoogleFlights(search, googleApiKey);
      if (authenticFlights.length > 0) {
        console.log(`Found ${authenticFlights.length} flights using Google Travel Partners API`);
        return authenticFlights;
      }
    } catch (googleError) {
      console.warn('Google Travel Partners API error:', googleError);
      // Try alternative Google endpoint or format
      try {
        const fallbackFlights = await searchGoogleFlightsAlternative(search, googleApiKey);
        if (fallbackFlights.length > 0) {
          console.log(`Found ${fallbackFlights.length} flights using alternative Google API approach`);
          return fallbackFlights;
        }
      } catch (fallbackError) {
        console.warn('Alternative Google API approach also failed:', fallbackError);
      }
    }

    // If Google API doesn't return results, throw error
    throw new Error('Google Travel Partners API did not return flight results. The API may be rate-limited or the route may not be available.');
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
}

/**
 * Search flights using Google Travel Partners API
 */
async function searchGoogleFlights(search: FlightSearch, apiKey: string): Promise<Flight[]> {
  const endpoint = 'https://www.googleapis.com/travel/flights/v1/search';
  
  const requestBody = {
    request: {
      slice: [{
        origin: getAirportCode(search.departureCity),
        destination: getAirportCode(search.arrivalCity),
        date: search.departureDate
      }],
      passengers: {
        adultCount: 1,
        childCount: 0,
        infantInLapCount: 0,
        infantInSeatCount: 0
      },
      solutions: 20,
      refundableOnly: false
    }
  };

  if (search.returnDate) {
    requestBody.request.slice.push({
      origin: getAirportCode(search.arrivalCity),
      destination: getAirportCode(search.departureCity),
      date: search.returnDate
    });
  }

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Google Travel API error: ${response.status}`);
  }

  const data = await response.json();
  return transformGoogleFlightsResponse(data);
}

/**
 * Alternative Google Flights API approach using different endpoint
 */
async function searchGoogleFlightsAlternative(search: FlightSearch, apiKey: string): Promise<Flight[]> {
  // Try Google Flights Shopping API as fallback
  const endpoint = 'https://www.googleapis.com/qpxExpress/v1/trips/search';
  
  const requestBody = {
    request: {
      slice: [{
        origin: getAirportCode(search.departureCity),
        destination: getAirportCode(search.arrivalCity),
        date: search.departureDate
      }],
      passengers: {
        adultCount: 1
      },
      solutions: 10,
      refundableOnly: false
    }
  };

  if (search.returnDate) {
    requestBody.request.slice.push({
      origin: getAirportCode(search.arrivalCity),
      destination: getAirportCode(search.departureCity),
      date: search.returnDate
    });
  }

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Google QPX Express API error: ${response.status}`);
  }

  const data = await response.json();
  return transformGoogleFlightsResponse(data);
}

/**
 * Transform Google Travel API response to our Flight format
 */
function transformGoogleFlightsResponse(data: any): Flight[] {
  if (!data.trips?.tripOption) return [];

  return data.trips.tripOption.map((trip: any, index: number) => {
    const slice = trip.slice[0];
    const segment = slice.segment[0];
    const flight = segment.flight;
    const leg = segment.leg[0];
    
    return {
      id: `google-${index}`,
      airline: getAirlineName(flight.carrier),
      logo: `https://www.gstatic.com/flights/airline_logos/70px/${flight.carrier}.png`,
      flightNumber: `${flight.carrier} ${flight.number}`,
      departureAirport: leg.origin,
      departureCity: leg.origin,
      departureTime: formatTime(leg.departureTime),
      arrivalAirport: leg.destination,
      arrivalCity: leg.destination,
      arrivalTime: formatTime(leg.arrivalTime),
      duration: formatDuration(leg.duration),
      stops: segment.connectionDuration ? 1 : 0,
      price: parseFloat(trip.saleTotal.replace(/[^0-9.]/g, '')),
      currency: 'USD'
    };
  });
}

/**
 * Convert city name to airport code
 */
function getAirportCode(location: string): string {
  const airportCodes: { [key: string]: string } = {
    'Tokyo': 'NRT',
    'Paris': 'CDG', 
    'London': 'LHR',
    'New York': 'JFK',
    'Los Angeles': 'LAX',
    'San Francisco': 'SFO',
    'Chicago': 'ORD',
    'Miami': 'MIA',
    'Dubai': 'DXB',
    'Singapore': 'SIN',
    'Hong Kong': 'HKG',
    'Sydney': 'SYD',
    'Mumbai': 'BOM',
    'Bangkok': 'BKK'
  };
  
  return airportCodes[location] || location.substring(0, 3).toUpperCase();
}

/**
 * Get airline name from carrier code
 */
function getAirlineName(carrierCode: string): string {
  const airlineNames: { [key: string]: string } = {
    'AA': 'American Airlines',
    'UA': 'United Airlines', 
    'DL': 'Delta Air Lines',
    'B6': 'JetBlue Airways',
    'WN': 'Southwest Airlines',
    'AF': 'Air France',
    'BA': 'British Airways',
    'EK': 'Emirates',
    'LH': 'Lufthansa',
    'SQ': 'Singapore Airlines',
    'JL': 'Japan Airlines',
    'NH': 'All Nippon Airways',
    'QF': 'Qantas',
    'EY': 'Etihad Airways',
    'QR': 'Qatar Airways',
    'CX': 'Cathay Pacific',
    'TK': 'Turkish Airlines',
    'KL': 'KLM Royal Dutch Airlines'
  };
  
  return airlineNames[carrierCode] || carrierCode;
}

/**
 * Format time from API response
 */
function formatTime(timeString: string): string {
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } catch {
    return timeString || 'N/A';
  }
}

/**
 * Format duration from minutes to hours and minutes
 */
function formatDuration(minutes: number | string): string {
  if (typeof minutes === 'string') return minutes;
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Get flight recommendations for a destination
 */
export async function getFlightRecommendations(destination: string): Promise<Flight[]> {
  // Use the search function with a default departure city
  return searchFlights({
    departureCity: 'New York',
    arrivalCity: destination,
    departureDate: new Date().toISOString().split('T')[0]
  });
}

/**
 * Group flights by airline for comparison
 */
export function groupFlightsByAirline(flights: Flight[]): { [airline: string]: Flight[] } {
  return flights.reduce((acc, flight) => {
    if (!acc[flight.airline]) {
      acc[flight.airline] = [];
    }
    acc[flight.airline].push(flight);
    return acc;
  }, {} as { [airline: string]: Flight[] });
}

/**
 * Get the cheapest flight for each airline
 */
export function getCheapestFlightsByAirline(flights: Flight[]): Flight[] {
  const groupedFlights = groupFlightsByAirline(flights);
  
  return Object.values(groupedFlights).map(airlineFlights => {
    // Sort by price and return the cheapest
    return airlineFlights.sort((a, b) => a.price - b.price)[0];
  });
}