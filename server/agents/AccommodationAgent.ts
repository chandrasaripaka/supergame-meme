/**
 * Accommodation Agent
 * 
 * Specialized agent for handling hotel search and booking tasks
 */

import { BaseAgent } from './BaseAgent';
import { 
  AgentType, 
  Task, 
  TaskStatus, 
  AgentMessage,
  TaskResult
} from './types';
import { 
  searchHotels as searchGoogleHotels,
  getHotelPriceEstimate,
  getHotelPricingTrends
} from '../services/google-maps';

// Simulated hotel data and service functions
// In a real implementation, this would connect to an actual hotel API
interface Hotel {
  id: string;
  name: string;
  location: string;
  address: string;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  availableRooms?: number;
}

// Simulated database of hotels
const hotelsDb: Hotel[] = [
  {
    id: 'h001',
    name: 'Grand Plaza Hotel',
    location: 'Tokyo',
    address: '1-1-1 Shibuya, Tokyo, Japan',
    rating: 4.8,
    pricePerNight: 250,
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
    images: ['grand_plaza_1.jpg', 'grand_plaza_2.jpg']
  },
  {
    id: 'h002',
    name: 'Ocean View Resort',
    location: 'Bali',
    address: 'Jl. Pantai Kuta, Bali, Indonesia',
    rating: 4.6,
    pricePerNight: 180,
    amenities: ['WiFi', 'Private Beach', 'Spa', 'Restaurant', 'Bar'],
    images: ['ocean_view_1.jpg', 'ocean_view_2.jpg']
  },
  {
    id: 'h003',
    name: 'City Comfort Inn',
    location: 'Paris',
    address: '123 Rue de Rivoli, Paris, France',
    rating: 4.2,
    pricePerNight: 150,
    amenities: ['WiFi', 'Breakfast', 'Restaurant'],
    images: ['city_comfort_1.jpg', 'city_comfort_2.jpg']
  },
  {
    id: 'h004',
    name: 'Mountain Lodge',
    location: 'Zurich',
    address: 'Bergstrasse 100, Zurich, Switzerland',
    rating: 4.7,
    pricePerNight: 220,
    amenities: ['WiFi', 'Sauna', 'Ski Storage', 'Restaurant'],
    images: ['mountain_lodge_1.jpg', 'mountain_lodge_2.jpg']
  },
  {
    id: 'h005',
    name: 'Desert Oasis Resort',
    location: 'Dubai',
    address: 'Palm Jumeirah, Dubai, UAE',
    rating: 4.9,
    pricePerNight: 350,
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Beach Access', 'Gym'],
    images: ['desert_oasis_1.jpg', 'desert_oasis_2.jpg']
  }
];

// Simulated hotel search function
async function searchHotels(
  location: string, 
  checkIn: string, 
  checkOut: string, 
  guests: number = 2,
  maxPrice?: number
): Promise<Hotel[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter hotels by location and price
  return hotelsDb
    .filter(hotel => 
      hotel.location.toLowerCase() === location.toLowerCase() &&
      (!maxPrice || hotel.pricePerNight <= maxPrice)
    )
    .map(hotel => ({
      ...hotel,
      availableRooms: Math.floor(Math.random() * 5) + 1 // Simulate availability
    }));
}

// Simulated hotel details function
async function getHotelDetails(hotelId: string): Promise<Hotel | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const hotel = hotelsDb.find(h => h.id === hotelId);
  if (!hotel) return null;
  
  return {
    ...hotel,
    availableRooms: Math.floor(Math.random() * 5) + 1 // Simulate availability
  };
}

export class AccommodationAgent extends BaseAgent {
  constructor(name: string = 'Accommodation Agent') {
    super(name, AgentType.ACCOMMODATION);
    this.registerCapabilities();
  }

  /**
   * Register the capabilities of this agent
   */
  private registerCapabilities(): void {
    // Search hotels capability
    this.registerCapability({
      action: 'search_hotels',
      description: 'Search for hotels in a specific location',
      parameters: {
        location: {
          type: 'string',
          description: 'City or location to search for hotels'
        },
        checkIn: {
          type: 'string',
          description: 'Check-in date (YYYY-MM-DD)'
        },
        checkOut: {
          type: 'string',
          description: 'Check-out date (YYYY-MM-DD)'
        },
        guests: {
          type: 'number',
          description: 'Number of guests',
          required: false,
          default: 2
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum price per night',
          required: false
        }
      },
      examples: [
        {
          location: 'Tokyo',
          checkIn: '2025-06-15',
          checkOut: '2025-06-20',
          guests: 2
        }
      ]
    });

    // Get hotel details capability
    this.registerCapability({
      action: 'get_hotel_details',
      description: 'Get detailed information about a specific hotel',
      parameters: {
        hotelId: {
          type: 'string',
          description: 'The ID of the hotel to get details for'
        }
      },
      examples: [
        {
          hotelId: 'h001'
        }
      ]
    });

    // Check accommodation safety capability (integrates with TravelSafetyAgent)
    this.registerCapability({
      action: 'check_hotel_area_safety',
      description: 'Check if a hotel is located in a safe area',
      parameters: {
        hotelId: {
          type: 'string',
          description: 'The ID of the hotel to check'
        }
      }
    });
  }

  /**
   * Handle task assignment
   */
  protected async handleTaskAssignment(task: Task): Promise<void> {
    this.updateTaskStatus(task.id, TaskStatus.IN_PROGRESS);
    
    try {
      let result: TaskResult;
      
      // Determine which capability to execute based on task context
      const action = task.context.action;
      
      switch (action) {
        case 'search_hotels':
          result = await this.searchHotels(task);
          break;
        case 'get_hotel_details':
          result = await this.getHotelDetails(task);
          break;
        case 'check_hotel_area_safety':
          result = await this.checkHotelAreaSafety(task);
          break;
        default:
          result = {
            success: false,
            error: `Unknown action: ${action}`
          };
      }
      
      this.completeTask(task.id, result);
    } catch (error) {
      console.error(`Error executing task ${task.id}:`, error);
      this.completeTask(task.id, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Search for hotels based on search criteria
   */
  private async searchHotels(task: Task): Promise<TaskResult> {
    const { location, checkIn, checkOut, guests, maxPrice } = task.context;
    
    if (!location || !checkIn || !checkOut) {
      return {
        success: false,
        error: 'Location, check-in date, and check-out date are required'
      };
    }
    
    // Implementing safety check as part of hotel search
    // This demonstrates agent-to-agent collaboration
    if (!task.context.skipSafetyCheck) {
      // Check destination safety by contacting the TravelSafetyAgent
      // In a real implementation, we'd make an actual request to the TravelSafetyAgent
      
      // Simulating a safety concern for demonstration
      const hasSafetyConcern = location.toLowerCase() === 'ukraine' || 
                              location.toLowerCase() === 'syria' || 
                              location.toLowerCase() === 'north korea';
      
      if (hasSafetyConcern) {
        // If there's a safety concern, suggest an alternative task
        return {
          success: true,
          data: {
            safetyWarning: `Travel to ${location} may not be advisable due to safety concerns.`
          },
          nextTasks: [
            {
              title: 'Suggest alternative destinations',
              description: `Find safer alternatives to ${location}`,
              agentType: AgentType.TRAVEL_SAFETY,
              context: {
                action: 'suggest_safe_alternatives',
                destination: location
              }
            }
          ]
        };
      }
    }
    
    // Try Google Maps API first
    try {
      console.log(`[${this.name}] Searching hotels with Google Maps API`);
      
      const googleHotels = await searchGoogleHotels(
        location,
        checkIn,
        checkOut,
        guests || 2
      );
      
      if (googleHotels && googleHotels.length > 0) {
        console.log(`[${this.name}] Found ${googleHotels.length} hotels using Google Maps API`);
        
        // Filter by price if maxPrice is provided
        const filteredHotels = maxPrice 
          ? googleHotels.filter(hotel => hotel.pricePerNight <= maxPrice)
          : googleHotels;
        
        // Also get pricing trends for more insight
        try {
          const pricingTrends = await getHotelPricingTrends(location);
          
          return {
            success: true,
            data: { 
              hotels: filteredHotels,
              pricingTrends,
              source: 'google-maps-api' 
            }
          };
        } catch (trendsError) {
          console.warn(`[${this.name}] Error getting pricing trends:`, trendsError);
          return {
            success: true,
            data: { 
              hotels: filteredHotels,
              source: 'google-maps-api' 
            }
          };
        }
      }
    } catch (googleApiError) {
      console.warn(`[${this.name}] Error using Google Maps API for hotels, falling back to legacy search:`, googleApiError);
    }
    
    // Fall back to legacy hotel search if Google API fails or returns no results
    console.log(`[${this.name}] Falling back to legacy hotel search service`);
    const hotels = await searchHotels(
      location, 
      checkIn, 
      checkOut, 
      guests || 2,
      maxPrice
    );
    
    return {
      success: true,
      data: { 
        hotels,
        source: 'legacy-api' 
      }
    };
  }

  /**
   * Get detailed information about a specific hotel
   */
  private async getHotelDetails(task: Task): Promise<TaskResult> {
    const { hotelId } = task.context;
    
    if (!hotelId) {
      return {
        success: false,
        error: 'Hotel ID is required'
      };
    }
    
    try {
      // First try to get detailed pricing information using Google Maps API
      console.log(`[${this.name}] Getting hotel details with Google Maps API for ID: ${hotelId}`);
      
      const priceEstimate = await getHotelPriceEstimate(hotelId);
      
      if (priceEstimate) {
        console.log(`[${this.name}] Found hotel pricing details using Google Maps API`);
        
        // Merge with local hotel details for the most complete information
        const localHotel = await getHotelDetails(hotelId);
        
        if (localHotel) {
          const enhancedHotel = {
            ...localHotel,
            pricing: priceEstimate,
            source: 'google-maps-enhanced'
          };
          
          return {
            success: true,
            data: { hotel: enhancedHotel }
          };
        }
        
        // If we don't have local details, return just the pricing data
        return {
          success: true,
          data: { 
            hotel: {
              id: hotelId,
              ...priceEstimate,
              source: 'google-maps-api'
            }
          }
        };
      }
    } catch (googleApiError) {
      console.warn(`[${this.name}] Error using Google Maps API for hotel details, falling back:`, googleApiError);
    }
    
    // Fall back to legacy hotel details if Google API fails
    console.log(`[${this.name}] Falling back to legacy hotel details service`);
    const hotel = await getHotelDetails(hotelId);
    
    if (!hotel) {
      return {
        success: false,
        error: `Hotel with ID ${hotelId} not found`
      };
    }
    
    return {
      success: true,
      data: { 
        hotel,
        source: 'legacy-api'
      }
    };
  }

  /**
   * Check if a hotel is located in a safe area
   */
  private async checkHotelAreaSafety(task: Task): Promise<TaskResult> {
    const { hotelId } = task.context;
    
    if (!hotelId) {
      return {
        success: false,
        error: 'Hotel ID is required'
      };
    }
    
    const hotel = await getHotelDetails(hotelId);
    
    if (!hotel) {
      return {
        success: false,
        error: `Hotel with ID ${hotelId} not found`
      };
    }
    
    // Request safety information from the TravelSafetyAgent
    // This is a simplified implementation
    
    // In a real implementation, we'd send a request to the TravelSafetyAgent
    // and wait for a response
    
    // Simulate checking with TravelSafetyAgent
    const hasSafetyConcern = 
      hotel.location.toLowerCase() === 'ukraine' || 
      hotel.location.toLowerCase() === 'syria' || 
      hotel.location.toLowerCase() === 'north korea';
    
    return {
      success: true,
      data: {
        hotel: {
          id: hotel.id,
          name: hotel.name,
          location: hotel.location
        },
        safetyAnalysis: {
          isSafe: !hasSafetyConcern,
          areaRating: hasSafetyConcern ? 'high_risk' : 'safe',
          notes: hasSafetyConcern 
            ? `The area where this hotel is located may have safety concerns.`
            : `No known safety issues in this area.`
        }
      }
    };
  }

  /**
   * Handle information requests from other agents
   */
  protected async handleInformationRequest(message: AgentMessage): Promise<void> {
    const { query } = message.content;
    
    try {
      let response: any;
      
      switch (query.type) {
        case 'hotel_availability': {
          try {
            // Try Google Maps API first
            const googleHotels = await searchGoogleHotels(
              query.location,
              query.checkIn,
              query.checkOut,
              query.guests || 2
            );
            
            if (googleHotels && googleHotels.length > 0) {
              // Filter by price if maxPrice is provided
              const filteredHotels = query.maxPrice 
                ? googleHotels.filter(hotel => hotel.pricePerNight <= query.maxPrice)
                : googleHotels;
                
              response = { 
                hotels: filteredHotels, 
                hasAvailability: filteredHotels.length > 0,
                source: 'google-maps-api'
              };
              break;
            }
          } catch (googleApiError) {
            console.warn(`[${this.name}] Error using Google Maps API for hotels in info request, falling back:`, googleApiError);
          }
          
          // Fall back to legacy search
          const hotels = await searchHotels(
            query.location,
            query.checkIn,
            query.checkOut,
            query.guests || 2,
            query.maxPrice
          );
          response = { 
            hotels, 
            hasAvailability: hotels.length > 0,
            source: 'legacy-api'
          };
          break;
        }
        case 'hotel_details': {
          try {
            // Try to get detailed pricing information using Google Maps API
            const priceEstimate = await getHotelPriceEstimate(query.hotelId);
            
            if (priceEstimate) {
              // Merge with local hotel details for the most complete information
              const localHotel = await getHotelDetails(query.hotelId);
              
              if (localHotel) {
                const enhancedHotel = {
                  ...localHotel,
                  pricing: priceEstimate,
                  source: 'google-maps-enhanced'
                };
                
                response = { 
                  hotel: enhancedHotel,
                  source: 'google-maps-enhanced'
                };
                break;
              }
              
              // If we don't have local details, return just the pricing data
              response = { 
                hotel: {
                  id: query.hotelId,
                  ...priceEstimate,
                  source: 'google-maps-api'
                },
                source: 'google-maps-api'
              };
              break;
            }
          } catch (googleApiError) {
            console.warn(`[${this.name}] Error using Google Maps API for hotel details in info request, falling back:`, googleApiError);
          }
          
          // Fall back to legacy hotel details if Google API fails
          const hotel = await getHotelDetails(query.hotelId);
          response = { 
            hotel,
            source: hotel ? 'legacy-api' : null
          };
          break;
        }
        case 'recommend_hotels': {
          const hotels = await searchHotels(
            query.location,
            query.checkIn,
            query.checkOut,
            query.guests || 2
          );
          
          // Sort by rating for recommendations
          const recommendations = hotels
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3);
          
          response = { recommendations };
          break;
        }
        default:
          response = { error: `Unknown query type: ${query.type}` };
      }
      
      // Send response back to the requesting agent
      this.sendMessage(
        message.fromAgentId,
        'information_response',
        { response, originalQuery: query },
        message.taskId
      );
    } catch (error) {
      console.error('Error handling information request:', error);
      this.sendMessage(
        message.fromAgentId,
        'information_response',
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          originalQuery: query 
        },
        message.taskId
      );
    }
  }
}