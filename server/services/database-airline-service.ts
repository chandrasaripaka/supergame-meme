import { db } from "@db";
import { airlines, airportCityMapping, airports } from "@shared/schema";
import { eq, like } from "drizzle-orm";

/**
 * Get airline by IATA code
 */
export async function getAirlineByCode(iataCode: string) {
  try {
    const airline = await db.query.airlines.findFirst({
      where: eq(airlines.iataCode, iataCode.toUpperCase())
    });
    
    return airline;
  } catch (error) {
    console.error('Error fetching airline:', error);
    return null;
  }
}

/**
 * Get all active airlines
 */
export async function getAllAirlines() {
  try {
    const allAirlines = await db.query.airlines.findMany({
      where: eq(airlines.isActive, true),
      orderBy: (airlines, { asc }) => [asc(airlines.name)]
    });
    
    return allAirlines;
  } catch (error) {
    console.error('Error fetching all airlines:', error);
    return [];
  }
}

/**
 * Search airlines by name or code
 */
export async function searchAirlines(query: string) {
  try {
    const searchTerm = query.toLowerCase();
    const allAirlines = await db.query.airlines.findMany({
      where: eq(airlines.isActive, true)
    });
    
    const filtered = allAirlines.filter(airline => 
      airline.name.toLowerCase().includes(searchTerm) ||
      airline.iataCode.toLowerCase().includes(searchTerm) ||
      airline.country.toLowerCase().includes(searchTerm)
    );
    
    return filtered;
  } catch (error) {
    console.error('Error searching airlines:', error);
    return [];
  }
}

/**
 * Get airport code for a city (with fallback to SIN for Singapore)
 */
export async function getAirportCodeForCity(cityName: string): Promise<string> {
  try {
    const normalizedCity = cityName.toLowerCase().trim();
    
    // Try to find default airport for the city
    const mapping = await db.query.airportCityMapping.findFirst({
      where: eq(airportCityMapping.cityName, normalizedCity)
    });
    
    if (mapping) {
      return mapping.airportCode;
    }
    
    // If not found, try to find any airport for the city
    const anyMapping = await db.query.airportCityMapping.findFirst({
      where: like(airportCityMapping.cityName, `%${normalizedCity}%`)
    });
    
    if (anyMapping) {
      return anyMapping.airportCode;
    }
    
    // Fallback to SIN for Singapore (instead of generating random codes)
    return 'SIN';
    
  } catch (error) {
    console.error('Error getting airport code for city:', error);
    return 'SIN'; // Default fallback
  }
}

/**
 * Get city name for airport code
 */
export async function getCityForAirportCode(airportCode: string): Promise<string> {
  try {
    const mapping = await db.query.airportCityMapping.findFirst({
      where: eq(airportCityMapping.airportCode, airportCode.toUpperCase())
    });
    
    if (mapping) {
      return mapping.cityName;
    }
    
    // Try to get from airports table
    const airport = await db.query.airports.findFirst({
      where: eq(airports.iataCode, airportCode.toUpperCase())
    });
    
    if (airport) {
      return airport.city;
    }
    
    return airportCode; // Return the code if no city found
    
  } catch (error) {
    console.error('Error getting city for airport code:', error);
    return airportCode;
  }
}

/**
 * Get all airport-city mappings
 */
export async function getAllAirportCityMappings() {
  try {
    const mappings = await db.query.airportCityMapping.findMany({
      orderBy: (airportCityMapping, { asc }) => [asc(airportCityMapping.cityName)]
    });
    
    return mappings;
  } catch (error) {
    console.error('Error fetching airport city mappings:', error);
    return [];
  }
}

/**
 * Add airport-city mapping
 */
export async function addAirportCityMapping(cityName: string, airportCode: string, isDefault: boolean = false) {
  try {
    const [newMapping] = await db.insert(airportCityMapping).values({
      cityName: cityName.toLowerCase().trim(),
      airportCode: airportCode.toUpperCase(),
      isDefault
    }).returning();
    
    return newMapping;
  } catch (error) {
    console.error('Error adding airport city mapping:', error);
    return null;
  }
}

/**
 * Generate flight data using database airlines
 */
export async function generateFlightOptions(
  fromCode: string, 
  toCode: string, 
  departureDate: string, 
  basePrice: number
) {
  try {
    const availableAirlines = await getAllAirlines();
    
    if (availableAirlines.length === 0) {
      // Fallback if no airlines in database
      return [];
    }
    
    const flightOptions = [
      // Business class premium
      {
        id: `${fromCode}-${toCode}-1`,
        airline: availableAirlines[0]?.name || 'Singapore Airlines',
        flightNumber: `${availableAirlines[0]?.iataCode || 'SQ'}001`,
        departure: { airport: fromCode, time: '14:30', date: departureDate },
        arrival: { airport: toCode, time: '22:15', date: departureDate },
        duration: '8h 45m',
        price: Math.round(basePrice * 1.4),
        class: 'Business' as const,
        stops: 0,
        amenities: ['In-flight entertainment', 'Gourmet meals', 'Wi-Fi', 'Lie-flat seats'],
        baggage: '40kg checked'
      },
      // Economy standard
      {
        id: `${fromCode}-${toCode}-2`,
        airline: availableAirlines[1]?.name || 'Emirates',
        flightNumber: `${availableAirlines[1]?.iataCode || 'EK'}015`,
        departure: { airport: fromCode, time: '10:15', date: departureDate },
        arrival: { airport: toCode, time: '18:00', date: departureDate },
        duration: '8h 45m',
        price: basePrice,
        class: 'Economy' as const,
        stops: 0,
        amenities: ['In-flight entertainment', 'Meals included', 'Wi-Fi'],
        baggage: '30kg checked'
      },
      // Budget with stops
      {
        id: `${fromCode}-${toCode}-3`,
        airline: availableAirlines[2]?.name || 'Qatar Airways',
        flightNumber: `${availableAirlines[2]?.iataCode || 'QR'}205`,
        departure: { airport: fromCode, time: '06:30', date: departureDate },
        arrival: { airport: toCode, time: '20:45', date: departureDate },
        duration: '12h 15m',
        price: Math.round(basePrice * 0.7),
        class: 'Economy' as const,
        stops: 1,
        amenities: ['In-flight entertainment', 'Meals included'],
        baggage: '25kg checked'
      },
      // Premium economy
      {
        id: `${fromCode}-${toCode}-4`,
        airline: availableAirlines[3]?.name || 'Cathay Pacific',
        flightNumber: `${availableAirlines[3]?.iataCode || 'CX'}042`,
        departure: { airport: fromCode, time: '16:45', date: departureDate },
        arrival: { airport: toCode, time: '01:30', date: departureDate },
        duration: '9h 45m',
        price: Math.round(basePrice * 1.2),
        class: 'Premium Economy' as const,
        stops: 0,
        amenities: ['In-flight entertainment', 'Meals included', 'Wi-Fi', 'Extra legroom'],
        baggage: '35kg checked'
      },
      // First class luxury
      {
        id: `${fromCode}-${toCode}-5`,
        airline: availableAirlines[4]?.name || 'British Airways',
        flightNumber: `${availableAirlines[4]?.iataCode || 'BA'}001`,
        departure: { airport: fromCode, time: '12:00', date: departureDate },
        arrival: { airport: toCode, time: '19:45', date: departureDate },
        duration: '8h 45m',
        price: Math.round(basePrice * 3.5),
        class: 'First' as const,
        stops: 0,
        amenities: ['In-flight entertainment', 'Gourmet meals', 'Wi-Fi', 'Private suite', 'Chauffeur service'],
        baggage: '50kg checked'
      }
    ];
    
    return flightOptions;
    
  } catch (error) {
    console.error('Error generating flight options:', error);
    return [];
  }
}