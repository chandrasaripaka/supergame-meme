import { Message, TravelPlan, Weather, Attraction, Trip } from "@/types";

// Helper function for API requests
async function apiRequest(method: string, endpoint: string, data?: any) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };
  
  // Add body for non-GET requests if data is provided
  if (method !== 'GET' && data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(path, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error ${response.status}`,
      }));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }
    
    // Handle both JSON and non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// User-related API functions
export async function createUser(username: string, password: string) {
  return apiRequest('POST', "/api/users", { username, password });
}

// Trip-related API functions
export async function createTrip(tripData: Omit<Trip, "id" | "createdAt">) {
  return apiRequest('POST', "/api/trips", tripData);
}

export async function getUserTrips(userId: number) {
  return apiRequest('GET', `/api/trips/${userId}`);
}

// Message-related API functions
export async function saveMessage(message: Omit<Message, "id" | "timestamp">) {
  return apiRequest('POST', "/api/messages", message);
}

export async function getTripMessages(tripId: number) {
  return apiRequest('GET', `/api/messages/${tripId}`);
}

// Travel planning function
export async function generateTravelPlan(
  destination: string,
  duration: number,
  budget: number,
  interests: string[],
  startDate?: string
): Promise<TravelPlan> {
  return apiRequest('POST', "/api/travel-plan", {
    destination,
    duration,
    budget,
    interests,
    startDate
  });
}

// Weather-related functions
export async function getWeather(location: string): Promise<Weather> {
  return apiRequest('GET', `/api/weather/${encodeURIComponent(location)}`);
}

// Attractions-related functions
export async function getAttractions(location: string): Promise<Attraction[]> {
  return apiRequest('GET', `/api/places/${encodeURIComponent(location)}`);
}

// Packing list function
export async function generatePackingList(request: {
  destination: string;
  duration: number;
  activities: string[];
  preferences?: Record<string, any>;
}) {
  return apiRequest('POST', "/api/packing-list", request);
}

// Flight-related API functions
export interface Flight {
  id: string;
  airline: string;
  logo: string;
  flightNumber: string;
  departureAirport: string;
  departureCity: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
}

export interface FlightSearch {
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  returnDate?: string;
}

export interface FlightRecommendationResponse {
  all: Flight[];
  cheapestByAirline: Flight[];
}

export async function searchFlights(request: FlightSearch): Promise<Flight[]> {
  return apiRequest('POST', "/api/flights/search", request);
}

export async function getFlightRecommendations(destination: string): Promise<FlightRecommendationResponse> {
  return apiRequest('GET', `/api/flights/recommendations/${encodeURIComponent(destination)}`);
}

// Destination statistics function
export async function getDestinationStats(destination: string) {
  return apiRequest('GET', `/api/destination-stats/${encodeURIComponent(destination)}`);
}

// Travel safety related functions
export enum SafetyLevel {
  SAFE = 'safe',
  CAUTION = 'caution',
  RECONSIDER_TRAVEL = 'reconsider',
  DO_NOT_TRAVEL = 'do_not_travel'
}

export interface SafetyAdvisory {
  country: string;
  level: string;
  lastUpdated: string;
  reason: string[];
  details: string;
  regions?: Array<{
    name: string;
    level: string;
    reason: string[];
  }>;
  sanctions?: boolean;
}

export interface SafetyResponse {
  safe: boolean;
  advisory?: SafetyAdvisory;
}

export async function checkDestinationSafety(destination: string): Promise<SafetyResponse> {
  return apiRequest('GET', `/api/travel-safety/${encodeURIComponent(destination)}`);
}

export async function getHighRiskDestinations(): Promise<{destinations: string[]}> {
  return apiRequest('GET', '/api/travel-safety');
}