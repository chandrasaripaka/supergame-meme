import { apiRequest } from "@/lib/queryClient";
import { Message, TravelPlan, Weather, Attraction, Trip } from "@/types";

// User-related API functions
export async function createUser(username: string, password: string) {
  const response = await apiRequest("POST", "/api/users", { username, password });
  return response.json();
}

// Trip-related API functions
export async function createTrip(tripData: Omit<Trip, "id" | "createdAt">) {
  const response = await apiRequest("POST", "/api/trips", tripData);
  return response.json();
}

export async function getUserTrips(userId: number) {
  const response = await apiRequest("GET", `/api/trips/${userId}`);
  return response.json();
}

// Message-related API functions
export async function saveMessage(message: Omit<Message, "id" | "timestamp">) {
  const response = await apiRequest("POST", "/api/messages", message);
  return response.json();
}

export async function getTripMessages(tripId: number) {
  const response = await apiRequest("GET", `/api/messages/${tripId}`);
  return response.json();
}

// Travel planning function
export async function generateTravelPlan(
  destination: string,
  duration: number,
  budget: number,
  interests: string[],
  startDate?: string
): Promise<TravelPlan> {
  const response = await apiRequest("POST", "/api/travel-plan", {
    destination,
    duration,
    budget,
    interests,
    startDate
  });
  
  return response.json();
}

// Weather function
export async function getWeather(location: string): Promise<Weather> {
  const response = await apiRequest("GET", `/api/weather/${encodeURIComponent(location)}`);
  return response.json();
}

// Places/Attractions function
export async function getAttractions(location: string): Promise<Attraction[]> {
  const response = await apiRequest("GET", `/api/attractions/${encodeURIComponent(location)}`);
  return response.json();
}

// Packing list generation 
export interface PackingListRequest {
  destination: string;
  duration: number;
  activities: string[];
  preferences?: {
    travelStyle?: string;
    hasChildren?: boolean;
    hasPets?: boolean;
    hasSpecialEquipment?: boolean;
    specialDietary?: boolean;
    medicalNeeds?: boolean;
    isBusinessTrip?: boolean;
  };
}

export async function generatePackingList(request: PackingListRequest) {
  const response = await apiRequest("POST", "/api/packing-list", request);
  return response.json();
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
  const response = await apiRequest("POST", "/api/flights/search", request);
  return response.json();
}

export async function getFlightRecommendations(destination: string): Promise<FlightRecommendationResponse> {
  const response = await apiRequest("GET", `/api/flights/recommendations/${encodeURIComponent(destination)}`);
  return response.json();
}
