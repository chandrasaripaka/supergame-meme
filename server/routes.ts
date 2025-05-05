import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { 
  users, 
  trips, 
  attractions, 
  messages, 
  insertUserSchema, 
  insertTripSchema, 
  insertMessageSchema 
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import authRoutes from "./routes/auth";
import { isAuthenticated, createTemporarySession } from "./services/auth";
import { generateTravelPlan as generateTravelPlanGemini, continueTravelConversation as continueTravelConversationGemini } from "./services/gemini";
// Fallback to OpenAI when Gemini fails
import { generateTravelPlan as generateTravelPlanOpenAI, continueTravelConversation as continueTravelConversationOpenAI } from "./services/openai";
import { getWeather } from "./services/weather";
import { getPlaceDetails } from "./services/places";
import { generatePackingList, PackingListPreferences } from "./services/packing";
import { getDestinationStatistics } from "./services/destination-stats";
import { searchFlights, getFlightRecommendations, getCheapestFlightsByAirline, Flight, FlightSearch } from "./services/flights";

/**
 * Extract potential destination names from a message
 * @param message The message content to analyze
 * @returns Array of potential destination names
 */
function extractPotentialDestinations(message: string): string[] {
  // Common travel-related words that may indicate a destination
  const travelIndicators = [
    "travel to", "visit", "go to", "vacation in", "trip to", 
    "holiday in", "flying to", "visiting", "staying in",
    "exploring", "discover", "planning to go to"
  ];

  // List of common city names and countries to detect
  // This is a basic implementation that could be improved with a more comprehensive database
  const destinations: string[] = [];
  
  // Check for expressions like "I want to travel to [location]"
  for (const indicator of travelIndicators) {
    const regex = new RegExp(`${indicator}\\s+([A-Z][a-zA-Z\\s]+?)(?:[,.]|\\s+for|\\s+in|\\s+on|$)`, 'gi');
    let match;
    while ((match = regex.exec(message)) !== null) {
      if (match[1] && match[1].trim().length > 2) {
        destinations.push(match[1].trim());
      }
    }
  }
  
  // Look for capitalized words that may be city/country names (simple heuristic)
  const wordRegex = /\b([A-Z][a-zA-Z]{3,})\b/g;
  const capitalizedWords = [];
  let capitalizedMatch;
  while ((capitalizedMatch = wordRegex.exec(message)) !== null) {
    capitalizedWords.push(capitalizedMatch);
  }
  
  for (const match of capitalizedWords) {
    // Exclude common non-destination capitalized words
    const excludedWords = ['I', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
      'Hello', 'Thanks', 'Thank', 'Please', 'Great'];
    
    if (!excludedWords.includes(match[1]) && !destinations.includes(match[1])) {
      destinations.push(match[1]);
    }
  }
  
  return destinations;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";
  
  // Register authentication routes
  app.use('/auth', authRoutes);

  // User routes
  app.post(`${apiPrefix}/users`, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const [newUser] = await db.insert(users).values(validatedData).returning();
      return res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Trip routes
  app.post(`${apiPrefix}/trips`, async (req, res) => {
    try {
      const validatedData = insertTripSchema.parse(req.body);
      const [newTrip] = await db.insert(trips).values(validatedData).returning();
      return res.status(201).json(newTrip);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating trip:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all trips or filter by user
  app.get(`${apiPrefix}/trips`, async (req, res) => {
    try {
      // If userId is provided as a query parameter, filter by user
      const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
      
      let userTrips;
      if (userId) {
        userTrips = await db.query.trips.findMany({
          where: eq(trips.userId, userId),
          orderBy: desc(trips.createdAt)
        });
      } else {
        // Get all trips if no userId is specified
        userTrips = await db.query.trips.findMany({
          orderBy: desc(trips.createdAt)
        });
      }
      
      return res.status(200).json(userTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get trips for a specific user
  app.get(`${apiPrefix}/trips/:userId`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userTrips = await db.query.trips.findMany({
        where: eq(trips.userId, userId),
        orderBy: desc(trips.createdAt)
      });
      return res.status(200).json(userTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Chat/Message routes
  app.post(`${apiPrefix}/messages`, async (req, res) => {
    try {
      // Check if this is a message to the AI
      if (req.body.messages && Array.isArray(req.body.messages)) {
        // This is a message to the AI
        const messageHistory = req.body.messages;
        const lastMessage = messageHistory[messageHistory.length - 1];
        
        if (!lastMessage || !lastMessage.content) {
          return res.status(400).json({ error: 'Invalid message format' });
        }
        
        // Extract potential destinations from the message
        const destinations = extractPotentialDestinations(lastMessage.content);
        let weatherData = null;
        
        // If we have a clear destination, fetch weather data
        if (destinations.length > 0) {
          try {
            // Only get weather for the first/primary destination
            weatherData = await getWeather(destinations[0]);
            console.log(`Weather data fetched for ${destinations[0]}`);
          } catch (weatherErr: any) {
            console.log(`Failed to fetch weather for ${destinations[0]}:`, weatherErr?.message || String(weatherErr));
          }
        }
        
        // Get AI response with fallback
        let aiResponse;
        try {
          // First try with Gemini
          aiResponse = await continueTravelConversationGemini(
            messageHistory.slice(0, -1), // Previous messages
            lastMessage.content, // New message content
            weatherData
          );
        } catch (err: any) {
          console.log("Gemini API failed, falling back to OpenAI:", err?.message || String(err));
          // Fallback to OpenAI if Gemini fails
          aiResponse = await continueTravelConversationOpenAI(
            messageHistory.slice(0, -1), // Previous messages
            lastMessage.content, // New message content
            weatherData
          );
        }
        
        return res.status(200).json({ content: aiResponse });
      } else {
        // This is a message to be saved in the database
        const validatedData = insertMessageSchema.parse(req.body);
        const [newMessage] = await db.insert(messages).values(validatedData).returning();
        return res.status(201).json(newMessage);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error processing message:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get(`${apiPrefix}/messages/:tripId`, async (req, res) => {
    try {
      const tripId = parseInt(req.params.tripId);
      const tripMessages = await db.query.messages.findMany({
        where: eq(messages.tripId, tripId),
        orderBy: desc(messages.timestamp)
      });
      return res.status(200).json(tripMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // AI Travel Planning route
  app.post(`${apiPrefix}/travel-plan`, async (req, res) => {
    try {
      const travelRequest = z.object({
        destination: z.string(),
        duration: z.number(),
        budget: z.number(),
        interests: z.array(z.string()),
        startDate: z.string().optional(),
      }).parse(req.body);

      // Try Gemini first, fallback to OpenAI
      let travelPlan;
      try {
        travelPlan = await generateTravelPlanGemini(
          travelRequest.destination,
          travelRequest.duration,
          travelRequest.budget,
          travelRequest.interests,
          travelRequest.startDate
        );
      } catch (err: any) {
        console.log("Gemini API failed for travel plan, falling back to OpenAI:", err?.message || String(err));
        travelPlan = await generateTravelPlanOpenAI(
          travelRequest.destination,
          travelRequest.duration,
          travelRequest.budget,
          travelRequest.interests,
          travelRequest.startDate
        );
      }

      return res.status(200).json(travelPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error generating travel plan:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Weather route
  app.get(`${apiPrefix}/weather/:location`, async (req, res) => {
    try {
      const location = req.params.location;
      const weatherData = await getWeather(location);
      return res.status(200).json(weatherData);
    } catch (error) {
      console.error('Error fetching weather:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Places/Attractions route
  app.get(`${apiPrefix}/places/:location`, async (req, res) => {
    try {
      const location = req.params.location;
      const placesData = await getPlaceDetails(location);
      return res.status(200).json(placesData);
    } catch (error) {
      console.error('Error fetching places:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get attractions from database
  app.get(`${apiPrefix}/attractions/:location`, async (req, res) => {
    try {
      const location = req.params.location;
      const locationAttractions = await db.query.attractions.findMany({
        where: eq(attractions.location, location)
      });
      return res.status(200).json(locationAttractions);
    } catch (error) {
      console.error('Error fetching attractions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Packing list generation route
  app.post(`${apiPrefix}/packing-list`, async (req, res) => {
    try {
      // Validate request body
      const packingListRequest = z.object({
        destination: z.string(),
        duration: z.number(),
        activities: z.array(z.string()),
        preferences: z.object({
          travelStyle: z.string().optional(),
          hasChildren: z.boolean().optional(),
          hasPets: z.boolean().optional(),
          hasSpecialEquipment: z.boolean().optional(),
          specialDietary: z.boolean().optional(),
          medicalNeeds: z.boolean().optional(),
          isBusinessTrip: z.boolean().optional()
        }).optional()
      }).parse(req.body);

      // Generate the packing list
      const packingList = await generatePackingList({
        destination: packingListRequest.destination,
        duration: packingListRequest.duration,
        activities: packingListRequest.activities,
        preferences: packingListRequest.preferences || {}
      });

      return res.status(200).json(packingList);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error generating packing list:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Flight search route
  app.post(`${apiPrefix}/flights/search`, async (req, res) => {
    try {
      // Validate request body
      const flightSearchRequest = z.object({
        departureCity: z.string(),
        arrivalCity: z.string(),
        departureDate: z.string(),
        returnDate: z.string().optional()
      }).parse(req.body);

      // Search for flights
      const flights = await searchFlights(flightSearchRequest);
      
      return res.status(200).json(flights);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error searching flights:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Flight recommendations route
  app.get(`${apiPrefix}/flights/recommendations/:destination`, async (req, res) => {
    try {
      const destination = req.params.destination;
      const flights = await getFlightRecommendations(destination);
      
      // Also get cheapest flight options by airline for comparison
      const cheapestByAirline = getCheapestFlightsByAirline(flights);
      
      return res.status(200).json({
        all: flights,
        cheapestByAirline
      });
    } catch (error) {
      console.error('Error getting flight recommendations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Destination statistics route
  app.get(`${apiPrefix}/destination-stats/:destination`, async (req, res) => {
    try {
      const destination = req.params.destination;
      const statistics = await getDestinationStatistics(destination);
      
      if (!statistics) {
        return res.status(404).json({ error: 'No statistics available for this destination' });
      }
      
      return res.status(200).json(statistics);
    } catch (error) {
      console.error('Error getting destination statistics:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
