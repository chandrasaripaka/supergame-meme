/**
 * Flight Booking Agent
 * 
 * Specialized agent for handling flight search and booking tasks
 * Integrates with our existing flight service
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
  searchFlights,
  getFlightRecommendations,
  Flight,
  FlightSearch 
} from '../services/flights';
import { 
  searchFlights as searchGoogleFlights,
  getFlightPricingTrends
} from '../services/google-maps';

export class FlightBookingAgent extends BaseAgent {
  constructor(name: string = 'Flight Booking Agent') {
    super(name, AgentType.FLIGHT_BOOKING);
    this.registerCapabilities();
  }

  /**
   * Register the capabilities of this agent
   */
  private registerCapabilities(): void {
    // Search flights capability
    this.registerCapability({
      action: 'search_flights',
      description: 'Search for flights between destinations on specific dates',
      parameters: {
        departureCity: {
          type: 'string',
          description: 'City of departure'
        },
        arrivalCity: {
          type: 'string',
          description: 'City of arrival'
        },
        departureDate: {
          type: 'string',
          description: 'Date of departure (YYYY-MM-DD)'
        },
        returnDate: {
          type: 'string',
          description: 'Date of return for round-trip flights (YYYY-MM-DD)',
          required: false
        }
      },
      examples: [
        {
          departureCity: 'New York',
          arrivalCity: 'Tokyo',
          departureDate: '2025-06-15',
          returnDate: '2025-06-30'
        }
      ]
    });

    // Get flight recommendations capability
    this.registerCapability({
      action: 'get_flight_recommendations',
      description: 'Get flight recommendations for a specific destination',
      parameters: {
        destination: {
          type: 'string',
          description: 'The destination to get flight recommendations for'
        }
      },
      examples: [
        {
          destination: 'Paris',
          result: {
            all: '...',
            cheapestByAirline: '...'
          }
        }
      ]
    });

    // Check flight safety capability (integrates with TravelSafetyAgent)
    this.registerCapability({
      action: 'check_flight_route_safety',
      description: 'Check if a flight route goes through any high-risk countries',
      parameters: {
        departureCity: {
          type: 'string',
          description: 'City of departure'
        },
        arrivalCity: {
          type: 'string',
          description: 'City of arrival'
        },
        stopoverCities: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'List of stopover cities',
          required: false
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
        case 'search_flights':
          result = await this.searchFlights(task);
          break;
        case 'get_flight_recommendations':
          result = await this.getFlightRecommendations(task);
          break;
        case 'check_flight_route_safety':
          result = await this.checkFlightRouteSafety(task);
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
   * Search for flights based on search criteria
   */
  private async searchFlights(task: Task): Promise<TaskResult> {
    const { departureCity, arrivalCity, departureDate, returnDate } = task.context;
    
    if (!departureCity || !arrivalCity || !departureDate) {
      return {
        success: false,
        error: 'Departure city, arrival city, and departure date are required'
      };
    }
    
    const searchCriteria: FlightSearch = {
      departureCity,
      arrivalCity,
      departureDate
    };
    
    if (returnDate) {
      searchCriteria.returnDate = returnDate;
    }
    
    // Implementing safety check as part of flight search
    // This demonstrates agent-to-agent collaboration
    if (!task.context.skipSafetyCheck) {
      // First, check destination safety by contacting the TravelSafetyAgent
      const safetyCheckMessage: AgentMessage = {
        id: '', // Will be filled in by sendMessage
        fromAgentId: this.id,
        toAgentId: '', // Will find a TravelSafetyAgent
        type: 'information_request',
        content: {
          query: {
            type: 'is_destination_safe',
            destination: arrivalCity
          }
        },
        timestamp: new Date(),
        taskId: task.id
      };
      
      // In a real implementation, we'd wait for the response
      // For this example, we'll continue with the flight search
      // Simulating a safety concern for demonstration
      const hasSafetyConcern = arrivalCity.toLowerCase() === 'ukraine' || 
                              arrivalCity.toLowerCase() === 'syria' || 
                              arrivalCity.toLowerCase() === 'north korea';
      
      if (hasSafetyConcern) {
        // If there's a safety concern, suggest an alternative task
        return {
          success: true,
          data: {
            safetyWarning: `Travel to ${arrivalCity} may not be advisable due to safety concerns.`
          },
          nextTasks: [
            {
              title: 'Suggest alternative destinations',
              description: `Find safer alternatives to ${arrivalCity}`,
              agentType: AgentType.TRAVEL_SAFETY,
              context: {
                action: 'suggest_safe_alternatives',
                destination: arrivalCity
              }
            }
          ]
        };
      }
    }
    
    // Try Google Maps API first
    try {
      console.log(`[${this.name}] Searching flights with Google Maps API`);
      
      const googleFlights = await searchGoogleFlights(
        searchCriteria.departureCity,
        searchCriteria.arrivalCity,
        searchCriteria.departureDate,
        searchCriteria.returnDate,
        1 // Default to 1 adult traveler
      );
      
      if (googleFlights && googleFlights.length > 0) {
        console.log(`[${this.name}] Found ${googleFlights.length} flights using Google Maps API`);
        
        // Also get pricing trends for more insight
        try {
          const pricingTrends = getFlightPricingTrends(
            searchCriteria.departureCity,
            searchCriteria.arrivalCity
          );
          
          return {
            success: true,
            data: { 
              flights: googleFlights,
              pricingTrends,
              source: 'google-maps-api' 
            }
          };
        } catch (trendsError) {
          console.warn(`[${this.name}] Error getting pricing trends:`, trendsError);
          return {
            success: true,
            data: { 
              flights: googleFlights,
              source: 'google-maps-api' 
            }
          };
        }
      }
    } catch (googleApiError) {
      console.warn(`[${this.name}] Error using Google Maps API for flights, falling back to legacy search:`, googleApiError);
    }
    
    // Fall back to legacy flight search if Google API fails or returns no results
    console.log(`[${this.name}] Falling back to legacy flight search service`);
    const flights = await searchFlights(searchCriteria);
    
    return {
      success: true,
      data: { 
        flights,
        source: 'legacy-api' 
      }
    };
  }

  /**
   * Get flight recommendations for a destination
   */
  private async getFlightRecommendations(task: Task): Promise<TaskResult> {
    const { destination } = task.context;
    
    if (!destination) {
      return {
        success: false,
        error: 'Destination is required'
      };
    }
    
    // Again, check destination safety if needed
    if (!task.context.skipSafetyCheck) {
      const hasSafetyConcern = destination.toLowerCase() === 'ukraine' || 
                              destination.toLowerCase() === 'syria' || 
                              destination.toLowerCase() === 'north korea';
      
      if (hasSafetyConcern) {
        return {
          success: true,
          data: {
            safetyWarning: `Travel to ${destination} may not be advisable due to safety concerns.`
          },
          nextTasks: [
            {
              title: 'Suggest alternative destinations',
              description: `Find safer alternatives to ${destination}`,
              agentType: AgentType.TRAVEL_SAFETY,
              context: {
                action: 'suggest_safe_alternatives',
                destination
              }
            }
          ]
        };
      }
    }
    
    const recommendations = await getFlightRecommendations(destination);
    
    return {
      success: true,
      data: recommendations
    };
  }

  /**
   * Check if a flight route passes through any high-risk countries
   */
  private async checkFlightRouteSafety(task: Task): Promise<TaskResult> {
    const { departureCity, arrivalCity, stopoverCities = [] } = task.context;
    
    if (!departureCity || !arrivalCity) {
      return {
        success: false,
        error: 'Departure city and arrival city are required'
      };
    }
    
    // Request safety information from the TravelSafetyAgent
    // This is a simplified implementation
    const allCities = [departureCity, ...stopoverCities, arrivalCity];
    const riskyDestinations: string[] = [];
    
    // In a real implementation, we'd send requests to the TravelSafetyAgent
    // and wait for responses
    for (const city of allCities) {
      // Simulate checking with TravelSafetyAgent
      const hasSafetyConcern = 
        city.toLowerCase() === 'ukraine' || 
        city.toLowerCase() === 'syria' || 
        city.toLowerCase() === 'north korea';
      
      if (hasSafetyConcern) {
        riskyDestinations.push(city);
      }
    }
    
    return {
      success: true,
      data: {
        route: allCities,
        riskyDestinations,
        isSafe: riskyDestinations.length === 0
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
        case 'flight_availability': {
          const search: FlightSearch = {
            departureCity: query.departureCity,
            arrivalCity: query.arrivalCity,
            departureDate: query.departureDate
          };
          
          if (query.returnDate) {
            search.returnDate = query.returnDate;
          }
          
          const flights = await searchFlights(search);
          response = { flights, hasAvailability: flights.length > 0 };
          break;
        }
        case 'get_cheapest_flight': {
          const search: FlightSearch = {
            departureCity: query.departureCity,
            arrivalCity: query.arrivalCity,
            departureDate: query.departureDate
          };
          
          if (query.returnDate) {
            search.returnDate = query.returnDate;
          }
          
          const flights = await searchFlights(search);
          const cheapestFlight = flights.sort((a, b) => a.price - b.price)[0];
          response = { cheapestFlight };
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