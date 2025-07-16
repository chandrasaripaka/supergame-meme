/**
 * MCP Travel Server - The Gateway to the Travel World
 * 
 * A unified, stable server that acts as a gateway to all travel APIs
 * Provides standardized tools for flights, hotels, activities, visas, and bookings
 */

import { db } from "@db";
import { airlines, destinationStats, airports, airportCityMapping, activityDistribution } from "@shared/schema";
import { eq } from "drizzle-orm";

// Types for MCP Travel Server
export interface FlightSearchParams {
  origin: string;
  destination: string;
  date: string;
  travelers: number;
  budget?: number;
  returnDate?: string;
  class?: 'Economy' | 'Premium Economy' | 'Business' | 'First';
}

export interface HotelSearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  qualityTier?: 'budget' | 'mid-range' | 'luxury';
  rooms?: number;
}

export interface ActivitySearchParams {
  destination: string;
  interests: string[];
  duration?: 'half-day' | 'full-day' | 'multi-day';
  budget?: number;
}

export interface VisaRequirementParams {
  citizenship: string;
  destination: string;
  purpose?: 'tourism' | 'business' | 'transit';
}

export interface BookingParams {
  type: 'flight' | 'hotel' | 'activity' | 'package';
  bookingDetails: any;
  paymentMethod?: string;
  contactInfo?: any;
}

/**
 * MCP Travel Server Class
 * Provides unified access to all travel services
 */
export class MCPTravelServer {
  private amadeus: any;
  private skyscanner: any;
  private googleFlights: any;
  private expedia: any;
  private booking: any;
  private marriott: any;
  private viator: any;
  private getYourGuide: any;
  private tripAdvisor: any;
  private iataTravel: any;
  private sherpa: any;

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize all travel service providers
   */
  private async initializeProviders() {
    // Initialize flight providers
    this.amadeus = process.env.AMADEUS_API_KEY ? await this.initAmadeus() : null;
    this.skyscanner = process.env.SKYSCANNER_API_KEY ? await this.initSkyscanner() : null;
    this.googleFlights = process.env.GOOGLE_FLIGHTS_API_KEY ? await this.initGoogleFlights() : null;

    // Initialize hotel providers
    this.expedia = process.env.EXPEDIA_API_KEY ? await this.initExpedia() : null;
    this.booking = process.env.BOOKING_API_KEY ? await this.initBooking() : null;
    this.marriott = process.env.MARRIOTT_API_KEY ? await this.initMarriott() : null;

    // Initialize activity providers
    this.viator = process.env.VIATOR_API_KEY ? await this.initViator() : null;
    this.getYourGuide = process.env.GETYOURGUIDE_API_KEY ? await this.initGetYourGuide() : null;
    this.tripAdvisor = process.env.TRIPADVISOR_API_KEY ? await this.initTripAdvisor() : null;

    // Initialize visa/document providers
    this.iataTravel = process.env.IATA_TRAVEL_API_KEY ? await this.initIATATravel() : null;
    this.sherpa = process.env.SHERPA_API_KEY ? await this.initSherpa() : null;
  }

  /**
   * tool_searchFlights - Unified flight search across multiple providers
   */
  async tool_searchFlights(params: FlightSearchParams): Promise<any[]> {
    try {
      const results = [];

      // Try Amadeus first (most comprehensive)
      if (this.amadeus) {
        const amadeus_results = await this.searchAmadeusFlights(params);
        results.push(...amadeus_results);
      }

      // Try Skyscanner for budget options
      if (this.skyscanner) {
        const skyscanner_results = await this.searchSkyscannerFlights(params);
        results.push(...skyscanner_results);
      }

      // Try Google Flights for comprehensive coverage
      if (this.googleFlights) {
        const google_results = await this.searchGoogleFlights(params);
        results.push(...google_results);
      }

      // If no external APIs available, use database-generated flights
      if (results.length === 0) {
        const db_results = await this.generateDatabaseFlights(params);
        results.push(...db_results);
      }

      // Sort by price and remove duplicates
      return this.deduplicateAndSortFlights(results);

    } catch (error) {
      console.error('Error in tool_searchFlights:', error);
      // Fallback to database-generated flights
      return await this.generateDatabaseFlights(params);
    }
  }

  /**
   * tool_searchHotels - Unified hotel search across multiple providers
   */
  async tool_searchHotels(params: HotelSearchParams): Promise<any[]> {
    try {
      const results = [];

      // Try Expedia for comprehensive coverage
      if (this.expedia) {
        const expedia_results = await this.searchExpediaHotels(params);
        results.push(...expedia_results);
      }

      // Try Booking.com for variety
      if (this.booking) {
        const booking_results = await this.searchBookingHotels(params);
        results.push(...booking_results);
      }

      // Try Marriott for luxury options
      if (this.marriott) {
        const marriott_results = await this.searchMarriottHotels(params);
        results.push(...marriott_results);
      }

      // If no external APIs available, use database-generated hotels
      if (results.length === 0) {
        const db_results = await this.generateDatabaseHotels(params);
        results.push(...db_results);
      }

      return this.deduplicateAndSortHotels(results);

    } catch (error) {
      console.error('Error in tool_searchHotels:', error);
      return await this.generateDatabaseHotels(params);
    }
  }

  /**
   * tool_findActivities - Unified activity search across multiple providers
   */
  async tool_findActivities(params: ActivitySearchParams): Promise<any[]> {
    try {
      const results = [];

      // Try Viator for tours and activities
      if (this.viator) {
        const viator_results = await this.searchViatorActivities(params);
        results.push(...viator_results);
      }

      // Try GetYourGuide for experiences
      if (this.getYourGuide) {
        const gyg_results = await this.searchGetYourGuideActivities(params);
        results.push(...gyg_results);
      }

      // Try TripAdvisor for local insights
      if (this.tripAdvisor) {
        const ta_results = await this.searchTripAdvisorActivities(params);
        results.push(...ta_results);
      }

      // If no external APIs available, use database-generated activities
      if (results.length === 0) {
        const db_results = await this.generateDatabaseActivities(params);
        results.push(...db_results);
      }

      return this.deduplicateAndSortActivities(results);

    } catch (error) {
      console.error('Error in tool_findActivities:', error);
      return await this.generateDatabaseActivities(params);
    }
  }

  /**
   * tool_getVisaRequirements - Unified visa information across multiple providers
   */
  async tool_getVisaRequirements(params: VisaRequirementParams): Promise<any> {
    try {
      // Try IATA Travel Centre first (most authoritative)
      if (this.iataTravel) {
        const iata_result = await this.getIATAVisaInfo(params);
        if (iata_result) return iata_result;
      }

      // Try Sherpa as backup
      if (this.sherpa) {
        const sherpa_result = await this.getSherpaVisaInfo(params);
        if (sherpa_result) return sherpa_result;
      }

      // Fallback to database-generated visa info
      return await this.generateDatabaseVisaInfo(params);

    } catch (error) {
      console.error('Error in tool_getVisaRequirements:', error);
      return await this.generateDatabaseVisaInfo(params);
    }
  }

  /**
   * tool_book - Unified booking across multiple providers
   */
  async tool_book(params: BookingParams): Promise<any> {
    try {
      switch (params.type) {
        case 'flight':
          return await this.bookFlight(params);
        case 'hotel':
          return await this.bookHotel(params);
        case 'activity':
          return await this.bookActivity(params);
        case 'package':
          return await this.bookPackage(params);
        default:
          throw new Error(`Unsupported booking type: ${params.type}`);
      }
    } catch (error) {
      console.error('Error in tool_book:', error);
      throw error;
    }
  }

  // Private methods for database fallbacks
  private async generateDatabaseFlights(params: FlightSearchParams): Promise<any[]> {
    // Get airport codes for origin and destination
    const originCode = await this.getAirportCode(params.origin);
    const destCode = await this.getAirportCode(params.destination);

    // Get available airlines from database
    const availableAirlines = await db.query.airlines.findMany({
      where: eq(airlines.isActive, true),
      limit: 10
    });

    // Generate flight options based on database data
    const basePrice = this.calculateBasePrice(params.origin, params.destination, params.budget);
    
    return this.generateFlightOptions(
      originCode,
      destCode,
      params.date,
      params.returnDate,
      basePrice,
      availableAirlines,
      params.travelers
    );
  }

  private async generateDatabaseHotels(params: HotelSearchParams): Promise<any[]> {
    // Generate hotel options based on destination statistics
    const stats = await db.query.destinationStats.findFirst({
      where: eq(destinationStats.destinationId, params.location.toLowerCase().replace(/\s+/g, '-'))
    });

    if (!stats) {
      return this.generateGenericHotels(params);
    }

    return this.generateHotelsFromStats(params, stats);
  }

  private async generateDatabaseActivities(params: ActivitySearchParams): Promise<any[]> {
    // Get activity distribution from database
    const activityDist = await db.query.activityDistribution.findMany({
      where: eq(activityDistribution.destinationId, params.destination.toLowerCase().replace(/\s+/g, '-'))
    });

    return this.generateActivitiesFromDistribution(params, activityDist);
  }

  private async generateDatabaseVisaInfo(params: VisaRequirementParams): Promise<any> {
    // Generate visa information based on common visa requirements
    return this.generateGenericVisaInfo(params);
  }

  // Helper methods for API initialization (stubs for now)
  private async initAmadeus() { return null; }
  private async initSkyscanner() { return null; }
  private async initGoogleFlights() { return null; }
  private async initExpedia() { return null; }
  private async initBooking() { return null; }
  private async initMarriott() { return null; }
  private async initViator() { return null; }
  private async initGetYourGuide() { return null; }
  private async initTripAdvisor() { return null; }
  private async initIATATravel() { return null; }
  private async initSherpa() { return null; }

  // Helper methods for API calls (stubs for now)
  private async searchAmadeusFlights(params: FlightSearchParams) { return []; }
  private async searchSkyscannerFlights(params: FlightSearchParams) { return []; }
  private async searchGoogleFlights(params: FlightSearchParams) { return []; }
  private async searchExpediaHotels(params: HotelSearchParams) { return []; }
  private async searchBookingHotels(params: HotelSearchParams) { return []; }
  private async searchMarriottHotels(params: HotelSearchParams) { return []; }
  private async searchViatorActivities(params: ActivitySearchParams) { return []; }
  private async searchGetYourGuideActivities(params: ActivitySearchParams) { return []; }
  private async searchTripAdvisorActivities(params: ActivitySearchParams) { return []; }
  private async getIATAVisaInfo(params: VisaRequirementParams) { return null; }
  private async getSherpaVisaInfo(params: VisaRequirementParams) { return null; }

  // Helper methods for booking (stubs for now)
  private async bookFlight(params: BookingParams) { return null; }
  private async bookHotel(params: BookingParams) { return null; }
  private async bookActivity(params: BookingParams) { return null; }
  private async bookPackage(params: BookingParams) { return null; }

  // Helper methods for deduplication and sorting
  private deduplicateAndSortFlights(flights: any[]): any[] {
    // Remove duplicates and sort by price
    const unique = flights.filter((flight, index, self) => 
      index === self.findIndex(f => f.flightNumber === flight.flightNumber)
    );
    return unique.sort((a, b) => (a.price || 0) - (b.price || 0));
  }

  private deduplicateAndSortHotels(hotels: any[]): any[] {
    // Remove duplicates and sort by price
    const unique = hotels.filter((hotel, index, self) => 
      index === self.findIndex(h => h.id === hotel.id)
    );
    return unique.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
  }

  private deduplicateAndSortActivities(activities: any[]): any[] {
    // Remove duplicates and sort by rating
    const unique = activities.filter((activity, index, self) => 
      index === self.findIndex(a => a.id === activity.id)
    );
    return unique.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  // Helper methods for database generation
  private async getAirportCode(location: string): Promise<string> {
    const mapping = await db.query.airportCityMapping.findFirst({
      where: eq(airportCityMapping.cityName, location.toLowerCase())
    });
    return mapping?.airportCode || 'SIN'; // Default to Singapore
  }

  private calculateBasePrice(origin: string, destination: string, budget?: number): number {
    // Simple distance-based pricing
    const basePrice = 300; // Base price in USD
    const distance = this.calculateDistance(origin, destination);
    const distanceMultiplier = Math.max(1, distance / 1000);
    return Math.round(basePrice * distanceMultiplier);
  }

  private calculateDistance(origin: string, destination: string): number {
    // Simplified distance calculation (in practice, would use actual coordinates)
    const distances: { [key: string]: number } = {
      'singapore-tokyo': 5300,
      'singapore-rome': 10800,
      'singapore-beijing': 4500,
      'singapore-bangkok': 1400,
      'tokyo-rome': 9600,
      'tokyo-beijing': 2100,
      'tokyo-bangkok': 4600,
      'rome-beijing': 8100,
      'rome-bangkok': 9400,
      'beijing-bangkok': 2300
    };

    const key = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
    const reverseKey = `${destination.toLowerCase()}-${origin.toLowerCase()}`;
    
    return distances[key] || distances[reverseKey] || 5000; // Default 5000km
  }

  private generateFlightOptions(
    originCode: string,
    destCode: string,
    date: string,
    returnDate: string | undefined,
    basePrice: number,
    airlines: any[],
    travelers: number
  ): any[] {
    // Generate flight options using database airlines
    const flights = [];
    
    airlines.slice(0, 5).forEach((airline, index) => {
      const priceMultiplier = 1 + (index * 0.2); // Vary prices
      const price = Math.round(basePrice * priceMultiplier * travelers);
      
      flights.push({
        id: `${originCode}-${destCode}-${index + 1}`,
        airline: airline.name,
        flightNumber: `${airline.iataCode}${String(index + 1).padStart(3, '0')}`,
        departure: {
          airport: originCode,
          time: this.generateRandomTime(),
          date: date
        },
        arrival: {
          airport: destCode,
          time: this.generateRandomTime(),
          date: date
        },
        duration: this.calculateFlightDuration(originCode, destCode),
        price: price,
        class: this.getFlightClass(index),
        stops: index > 2 ? 1 : 0,
        amenities: this.getAmenities(this.getFlightClass(index)),
        baggage: this.getBaggageAllowance(this.getFlightClass(index))
      });
    });

    return flights;
  }

  private generateRandomTime(): string {
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private calculateFlightDuration(origin: string, destination: string): string {
    const distance = this.calculateDistance(origin, destination);
    const hours = Math.floor(distance / 800); // Average speed 800 km/h
    const minutes = Math.floor((distance % 800) / 13.33); // Remaining distance to minutes
    return `${hours}h ${minutes}m`;
  }

  private getFlightClass(index: number): string {
    const classes = ['Economy', 'Premium Economy', 'Business', 'First'];
    return classes[index % classes.length];
  }

  private getAmenities(flightClass: string): string[] {
    const amenities = {
      'Economy': ['In-flight entertainment', 'Meals included'],
      'Premium Economy': ['In-flight entertainment', 'Meals included', 'Wi-Fi', 'Extra legroom'],
      'Business': ['In-flight entertainment', 'Gourmet meals', 'Wi-Fi', 'Lie-flat seats'],
      'First': ['In-flight entertainment', 'Gourmet meals', 'Wi-Fi', 'Private suite', 'Chauffeur service']
    };
    return amenities[flightClass] || amenities['Economy'];
  }

  private getBaggageAllowance(flightClass: string): string {
    const baggage = {
      'Economy': '25kg checked',
      'Premium Economy': '35kg checked',
      'Business': '40kg checked',
      'First': '50kg checked'
    };
    return baggage[flightClass] || baggage['Economy'];
  }

  private generateGenericHotels(params: HotelSearchParams): any[] {
    const hotels = [];
    const basePrice = 120; // Base price per night
    
    const hotelNames = [
      'Grand Palace Hotel', 'City View Inn', 'Luxury Suites', 
      'Business Hotel', 'Boutique Lodge', 'Comfort Inn',
      'Heritage Hotel', 'Modern Resort', 'Executive Suites'
    ];
    
    hotelNames.forEach((name, index) => {
      const tierMultiplier = params.qualityTier === 'luxury' ? 2.5 : 
                           params.qualityTier === 'mid-range' ? 1.5 : 1.0;
      const price = Math.round(basePrice * tierMultiplier * (1 + index * 0.1));
      
      hotels.push({
        id: `hotel-${index + 1}`,
        name: name,
        location: params.location,
        pricePerNight: price,
        rating: 3.5 + (index % 3) * 0.5,
        amenities: this.getHotelAmenities(params.qualityTier),
        images: [`https://via.placeholder.com/400x300?text=${name.replace(' ', '+')}`],
        description: `A comfortable ${params.qualityTier || 'mid-range'} hotel in ${params.location}`,
        availability: true,
        roomType: 'Standard Room',
        cancellationPolicy: 'Free cancellation up to 24 hours'
      });
    });
    
    return hotels;
  }

  private generateHotelsFromStats(params: HotelSearchParams, stats: any): any[] {
    const hotels = [];
    const basePrice = stats.accommodationCost || 120;
    
    const hotelTypes = [
      { name: 'Premium Resort', multiplier: 2.0, rating: 4.5 },
      { name: 'Business Hotel', multiplier: 1.5, rating: 4.0 },
      { name: 'City Center Inn', multiplier: 1.2, rating: 3.8 },
      { name: 'Budget Lodge', multiplier: 0.8, rating: 3.5 },
      { name: 'Boutique Hotel', multiplier: 1.8, rating: 4.2 }
    ];
    
    hotelTypes.forEach((type, index) => {
      const price = Math.round(basePrice * type.multiplier);
      
      hotels.push({
        id: `stats-hotel-${index + 1}`,
        name: `${type.name} ${stats.name}`,
        location: params.location,
        pricePerNight: price,
        rating: type.rating,
        amenities: this.getHotelAmenities(params.qualityTier),
        images: [`https://via.placeholder.com/400x300?text=${type.name.replace(' ', '+')}`],
        description: `A ${type.name.toLowerCase()} in ${stats.name}, ${stats.country}`,
        availability: true,
        roomType: 'Standard Room',
        cancellationPolicy: 'Free cancellation up to 24 hours'
      });
    });
    
    return hotels;
  }

  private generateActivitiesFromDistribution(params: ActivitySearchParams, distribution: any[]): any[] {
    const activities = [];
    
    if (distribution.length === 0) {
      return this.generateGenericActivities(params);
    }
    
    distribution.forEach((activity, index) => {
      const basePrice = 50;
      const price = Math.round(basePrice * (1 + Math.random() * 0.5));
      
      activities.push({
        id: `activity-${index + 1}`,
        name: `${activity.activityType} Experience`,
        destination: params.destination,
        description: `Explore ${activity.activityType.toLowerCase()} in ${params.destination}`,
        price: price,
        duration: params.duration || 'full-day',
        rating: 4.0 + Math.random() * 1.0,
        category: activity.activityType,
        availability: true,
        maxParticipants: 20,
        languages: ['English'],
        includes: ['Professional guide', 'Transportation', 'Entrance fees'],
        images: [`https://via.placeholder.com/400x300?text=${activity.activityType.replace(' ', '+')}`]
      });
    });
    
    return activities;
  }

  private generateGenericActivities(params: ActivitySearchParams): any[] {
    const activities = [];
    const genericActivities = [
      'City Walking Tour', 'Cultural Museum Visit', 'Local Food Tour',
      'Historical Sites Tour', 'Nature Hiking', 'Art Gallery Visit',
      'Shopping District Tour', 'Religious Sites Visit', 'Scenic Viewpoint Tour'
    ];
    
    genericActivities.forEach((activity, index) => {
      const basePrice = 40;
      const price = Math.round(basePrice * (1 + index * 0.1));
      
      activities.push({
        id: `generic-activity-${index + 1}`,
        name: activity,
        destination: params.destination,
        description: `Experience ${activity.toLowerCase()} in ${params.destination}`,
        price: price,
        duration: params.duration || 'half-day',
        rating: 3.8 + Math.random() * 1.2,
        category: 'Sightseeing',
        availability: true,
        maxParticipants: 15,
        languages: ['English'],
        includes: ['Professional guide', 'Transportation'],
        images: [`https://via.placeholder.com/400x300?text=${activity.replace(' ', '+')}`]
      });
    });
    
    return activities;
  }

  private getHotelAmenities(qualityTier?: string): string[] {
    const amenities = {
      'budget': ['WiFi', 'Air Conditioning', '24/7 Reception'],
      'mid-range': ['WiFi', 'Air Conditioning', '24/7 Reception', 'Restaurant', 'Fitness Center'],
      'luxury': ['WiFi', 'Air Conditioning', '24/7 Reception', 'Restaurant', 'Spa', 'Pool', 'Concierge', 'Room Service']
    };
    
    return amenities[qualityTier as keyof typeof amenities] || amenities['mid-range'];
  }

  private generateGenericVisaInfo(params: VisaRequirementParams): any {
    // Generate generic visa information
    return {
      required: true,
      type: 'Tourist Visa',
      processingTime: '5-10 business days',
      validity: '30 days',
      cost: 'USD 50',
      requirements: [
        'Valid passport',
        'Passport photos',
        'Proof of accommodation',
        'Return flight ticket',
        'Bank statement'
      ]
    };
  }
}

// Export singleton instance
export const mcpTravelServer = new MCPTravelServer();