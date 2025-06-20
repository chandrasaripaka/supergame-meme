import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { 
  users, 
  trips, 
  attractions, 
  messages, 
  chatSessions,
  chatMessages,
  scrapbooks,
  travelMemories,
  insertUserSchema, 
  insertTripSchema, 
  insertMessageSchema,
  insertScrapbookSchema,
  insertTravelMemorySchema
} from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { z } from "zod";
import authRoutes from "./routes/auth";
import localAuthRoutes from "./routes/local-auth";
import bookingChatRoutes from "./routes/booking-chat";
import { isAuthenticated, createTemporarySession } from "./services/auth";
import { getWeather } from "./services/weather";
import { getPlaceDetails } from "./services/places";
import { generatePackingList, PackingListPreferences } from "./services/packing";
import { getDestinationStatistics } from "./services/destination-stats";
import { searchFlights, getFlightRecommendations, getCheapestFlightsByAirline, Flight, FlightSearch } from "./services/flights";
import { checkDestinationSafety, getHighRiskDestinations } from "./services/travel-safety";

// Import the new AI service with dynamic LLM Router
import { generateTravelPlan, continueTravelConversation } from "./services/ai-service";

// Keep the original services for fallback if needed
import { generateTravelPlan as generateTravelPlanGemini, continueTravelConversation as continueTravelConversationGemini } from "./services/gemini";
import { generateTravelPlan as generateTravelPlanOpenAI, continueTravelConversation as continueTravelConversationOpenAI } from "./services/openai";

// Import the Agent-to-Agent (A2A) framework
import { demonstrateTravelPlan } from "./agents";

// Import Google Maps APIs
import { 
  searchHotels as searchGoogleHotels, 
  getHotelPriceEstimate, 
  getPlaceDetails as getGooglePlaceDetails, 
  searchAirports, 
  calculateDistance,
  getPhotoUrl,
  getStaticMapUrl,
  searchFlights as searchGoogleFlights,
  getHotelPricingTrends,
  getFlightPricingTrends
} from "./services/google-maps";
import { getHotelRecommendations, getEventRecommendations, getAllSupportedDestinations } from "./services/hotel-recommendations";

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

// Chat sessions API endpoints
function setupChatSessionsRoutes(app: Express) {
  // Get all chat sessions for the logged-in user
  app.get('/api/chat-sessions', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const sessions = await db.query.chatSessions.findMany({
        where: eq(chatSessions.userId, userId),
        orderBy: [desc(chatSessions.updatedAt)]
      });

      res.json(sessions);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      res.status(500).json({ error: 'Failed to fetch chat sessions' });
    }
  });

  // Get a specific chat session by ID
  app.get('/api/chat-sessions/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const sessionId = parseInt(req.params.id);
      const userId = req.user!.id;

      const session = await db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.userId, userId)
        ),
        with: {
          messages: {
            orderBy: [asc(chatMessages.createdAt)]
          }
        }
      });

      if (!session) {
        return res.status(404).json({ error: 'Chat session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Error fetching chat session:', error);
      res.status(500).json({ error: 'Failed to fetch chat session' });
    }
  });

  // Create a new chat session
  app.post('/api/chat-sessions', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = req.user!.id;
      const { title, isTemporary = false } = req.body;

      const [session] = await db.insert(chatSessions).values({
        userId,
        title: title || 'New Chat',
        isTemporary,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating chat session:', error);
      res.status(500).json({ error: 'Failed to create chat session' });
    }
  });

  // Update a chat session
  app.patch('/api/chat-sessions/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const sessionId = parseInt(req.params.id);
      const userId = req.user!.id;
      const { title, summary, isTemporary } = req.body;

      // Check if the session exists and belongs to the user
      const existingSession = await db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.userId, userId)
        )
      });

      if (!existingSession) {
        return res.status(404).json({ error: 'Chat session not found' });
      }

      // Update the session
      const [updatedSession] = await db.update(chatSessions)
        .set({
          title: title !== undefined ? title : existingSession.title,
          isTemporary: isTemporary !== undefined ? isTemporary : existingSession.isTemporary,
          updatedAt: new Date()
        })
        .where(and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.userId, userId)
        ))
        .returning();

      res.json(updatedSession);
    } catch (error) {
      console.error('Error updating chat session:', error);
      res.status(500).json({ error: 'Failed to update chat session' });
    }
  });

  // Delete a chat session
  app.delete('/api/chat-sessions/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const sessionId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Check if the session exists and belongs to the user
      const existingSession = await db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.userId, userId)
        )
      });

      if (!existingSession) {
        return res.status(404).json({ error: 'Chat session not found' });
      }

      // Delete all associated messages first
      await db.delete(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId));

      // Delete the session
      await db.delete(chatSessions)
        .where(and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.userId, userId)
        ));

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting chat session:', error);
      res.status(500).json({ error: 'Failed to delete chat session' });
    }
  });

  // Get messages for a chat session
  app.get('/api/chat-sessions/:id/messages', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const sessionId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Check if the session exists and belongs to the user
      const existingSession = await db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.userId, userId)
        )
      });

      if (!existingSession) {
        return res.status(404).json({ error: 'Chat session not found' });
      }

      // Get messages
      const messages = await db.query.chatMessages.findMany({
        where: eq(chatMessages.sessionId, sessionId),
        orderBy: [asc(chatMessages.timestamp)]
      });

      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  });

  // Add a message to a chat session
  app.post('/api/chat-sessions/:id/messages', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const sessionId = parseInt(req.params.id);
      const userId = req.user!.id;
      const { content, role } = req.body;

      if (!content || !role) {
        return res.status(400).json({ error: 'Content and role are required' });
      }

      // Check if the session exists and belongs to the user
      const existingSession = await db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.userId, userId)
        )
      });

      if (!existingSession) {
        return res.status(404).json({ error: 'Chat session not found' });
      }

      // Add message
      const [message] = await db.insert(chatMessages).values({
        sessionId: sessionId,
        content,
        role,
        timestamp: new Date()
      }).returning();

      // Update session's updatedAt timestamp
      await db.update(chatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessions.id, sessionId));

      res.status(201).json(message);
    } catch (error) {
      console.error('Error adding chat message:', error);
      res.status(500).json({ error: 'Failed to add chat message' });
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup chat sessions routes
  setupChatSessionsRoutes(app);
  // API prefix
  const apiPrefix = "/api";
  
  // Register authentication routes
  app.use('/auth', authRoutes);
  
  // Register local auth routes for testing
  app.use('/api/local-auth', localAuthRoutes);
  
  // Register booking chat routes
  app.use('/api/booking-chat', bookingChatRoutes);

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

  // Get user preferences
  app.get(`${apiPrefix}/user/preferences`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const userId = req.user!.id;
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({ preferences: user.preferences || {} });
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update user preferences
  app.patch(`${apiPrefix}/user/preferences`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const userId = req.user!.id;
      const { preferences } = req.body;
      
      if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({ error: 'Valid preferences object required' });
      }
      
      // Update user preferences
      const [updatedUser] = await db.update(users)
        .set({ preferences: preferences })
        .where(eq(users.id, userId))
        .returning();
      
      return res.status(200).json({ preferences: updatedUser.preferences });
    } catch (error) {
      console.error('Error updating user preferences:', error);
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
        
        // Get user preferences for travel style defaults
        let userPreferences = null;
        if (req.isAuthenticated() && req.user) {
          const user = await db.query.users.findFirst({
            where: eq(users.id, req.user.id)
          });
          userPreferences = user?.preferences || {};
        }

        // Use the dynamic LLM Router for AI responses
        try {
          // Call our new AI service with LLM Router
          const aiResult = await continueTravelConversation(
            messageHistory.slice(0, -1), // Previous messages
            lastMessage.content, // New message content
            weatherData,
            userPreferences
          );
          
          // Return both the response and model info
          return res.status(200).json({ 
            content: aiResult.text,
            modelInfo: aiResult.modelInfo 
          });
        } catch (err: any) {
          console.log("LLM Router failed, falling back to original providers:", err?.message || String(err));
          
          // Fallback to the original approach if the router fails
          try {
            // First try with Gemini
            const aiResponse = await continueTravelConversationGemini(
              messageHistory.slice(0, -1), // Previous messages
              lastMessage.content, // New message content
              weatherData
            );
            return res.status(200).json({ 
              content: aiResponse,
              modelInfo: { provider: 'google', model: 'gemini-2.0-flash' }
            });
          } catch (fallbackErr: any) {
            console.log("Gemini API failed, falling back to OpenAI:", fallbackErr?.message || String(fallbackErr));
            // Fallback to OpenAI if Gemini fails
            const aiResponse = await continueTravelConversationOpenAI(
              messageHistory.slice(0, -1), // Previous messages
              lastMessage.content, // New message content
              weatherData
            );
            return res.status(200).json({ 
              content: aiResponse,
              modelInfo: { provider: 'openai', model: 'gpt-4o' }
            });
          }
        }
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

      // Use the dynamic LLM Router for travel plan generation
      try {
        // Call our new AI service with LLM Router
        const travelPlan = await generateTravelPlan(
          travelRequest.destination,
          travelRequest.duration,
          travelRequest.budget,
          travelRequest.interests,
          travelRequest.startDate
        );
        
        return res.status(200).json({
          ...travelPlan,
          _modelInfo: {
            note: "Generated using Dynamic LLM Router"
          }
        });
      } catch (err: any) {
        console.log("LLM Router failed for travel plan, falling back to original providers:", err?.message || String(err));
        
        // Fallback to the original approach if the router fails
        try {
          // Try Gemini first
          const travelPlan = await generateTravelPlanGemini(
            travelRequest.destination,
            travelRequest.duration,
            travelRequest.budget,
            travelRequest.interests,
            travelRequest.startDate
          );
          return res.status(200).json({
            ...travelPlan,
            _modelInfo: {
              provider: "google",
              model: "gemini-2.0-flash"
            }
          });
        } catch (fallbackErr: any) {
          console.log("Gemini API failed for travel plan, falling back to OpenAI:", fallbackErr?.message || String(fallbackErr));
          // Fallback to OpenAI
          const travelPlan = await generateTravelPlanOpenAI(
            travelRequest.destination,
            travelRequest.duration,
            travelRequest.budget,
            travelRequest.interests,
            travelRequest.startDate
          );
          return res.status(200).json({
            ...travelPlan,
            _modelInfo: {
              provider: "openai",
              model: "gpt-4o"
            }
          });
        }
      }
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

  // Flight Search route - using real flight data
  app.post(`${apiPrefix}/flights/search`, async (req, res) => {
    try {
      const flightSearchRequest = z.object({
        departureCity: z.string(),
        arrivalCity: z.string(),
        departureDate: z.string(),
        returnDate: z.string().optional(),
      }).parse(req.body);

      console.log(`Searching flights from ${flightSearchRequest.departureCity} to ${flightSearchRequest.arrivalCity}`);
      
      const flights = await searchFlights(flightSearchRequest);
      
      return res.status(200).json({
        success: true,
        flights: flights,
        searchParams: flightSearchRequest
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error searching flights:', error);
      return res.status(500).json({ error: 'Failed to search flights' });
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
  
  // Travel safety check route
  app.get(`${apiPrefix}/travel-safety/:destination`, async (req, res) => {
    try {
      const destination = req.params.destination;
      const safetyInfo = checkDestinationSafety(destination);
      return res.status(200).json(safetyInfo);
    } catch (error) {
      console.error('Error checking destination safety:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get high-risk destinations route
  app.get(`${apiPrefix}/travel-safety`, async (req, res) => {
    try {
      const highRiskDestinations = getHighRiskDestinations();
      return res.status(200).json({ destinations: highRiskDestinations });
    } catch (error) {
      console.error('Error fetching high-risk destinations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Agent-to-Agent (A2A) Travel Planning Demo
  app.post(`${apiPrefix}/a2a/travel-plan`, async (req, res) => {
    try {
      const { destination, departureDate, returnDate, budget } = req.body;
      
      // Validate required fields
      if (!destination || !departureDate || !returnDate || budget === undefined) {
        return res.status(400).json({ 
          error: 'Missing required fields', 
          required: ['destination', 'departureDate', 'returnDate', 'budget'] 
        });
      }
      
      // Validate dates
      const departureDateObj = new Date(departureDate);
      const returnDateObj = new Date(returnDate);
      const now = new Date();
      
      if (isNaN(departureDateObj.getTime()) || isNaN(returnDateObj.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid date format. Use YYYY-MM-DD format.'
        });
      }
      
      if (departureDateObj < now) {
        return res.status(400).json({ 
          error: 'Departure date must be in the future'
        });
      }
      
      if (returnDateObj <= departureDateObj) {
        return res.status(400).json({ 
          error: 'Return date must be after departure date'
        });
      }
      
      // Validate budget
      if (typeof budget !== 'number' || budget <= 0) {
        return res.status(400).json({ 
          error: 'Budget must be a positive number'
        });
      }
      
      // Run the A2A demonstration
      const result = await demonstrateTravelPlan(
        destination,
        departureDate,
        returnDate,
        budget
      );
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in A2A travel planning:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // User preferences routes
  app.get(`${apiPrefix}/user/preferences`, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({ preferences: user.preferences });
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.put(`${apiPrefix}/user/preferences`, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { preferences } = req.body;
      
      // Validate preferences
      const preferencesSchema = z.object({
        travelStyle: z.string().optional(),
        budgetLevel: z.number().optional(),
        preferredAccommodation: z.string().optional(),
        adventureLevel: z.number().optional(),
        preferredActivities: z.array(z.string()).optional(),
        darkMode: z.boolean().optional(),
        receiveNotifications: z.boolean().optional(),
        saveSearchHistory: z.boolean().optional(),
        companions: z.array(z.object({
          id: z.number(),
          name: z.string(),
          relationship: z.string(),
          preferences: z.array(z.string())
        })).optional()
      }).parse(preferences);
      
      // Get existing user
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Create updated preferences object
      let updatedPreferences = {};
      
      // Start with default empty object if preferences is null/undefined
      if (user.preferences && typeof user.preferences === 'object') {
        // Copy existing preferences (safe way to handle potentially invalid objects)
        Object.keys(user.preferences).forEach(key => {
          (updatedPreferences as any)[key] = (user.preferences as any)[key];
        });
      }
      
      // Add new preferences
      Object.keys(preferencesSchema).forEach(key => {
        (updatedPreferences as any)[key] = (preferencesSchema as any)[key];
      });
      
      // Update user preferences
      await db.update(users)
        .set({ 
          preferences: updatedPreferences,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      return res.status(200).json({ 
        success: true, 
        message: 'Preferences updated successfully',
        preferences: updatedPreferences
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating user preferences:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Scrapbook API Routes
  
  // Get all scrapbooks for the logged-in user
  app.get(`${apiPrefix}/scrapbooks`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const userScrapbooks = await db.query.scrapbooks.findMany({
        where: eq(scrapbooks.userId, userId),
        orderBy: [desc(scrapbooks.updatedAt)],
        with: {
          memories: {
            orderBy: [desc(travelMemories.createdAt)]
          }
        }
      });
      
      return res.status(200).json(userScrapbooks);
    } catch (error) {
      console.error('Error fetching scrapbooks:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create a new scrapbook
  app.post(`${apiPrefix}/scrapbooks`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const validatedData = insertScrapbookSchema.parse({
        ...req.body,
        userId
      });
      
      const [newScrapbook] = await db.insert(scrapbooks).values(validatedData).returning();
      return res.status(201).json(newScrapbook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating scrapbook:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get a specific scrapbook with memories
  app.get(`${apiPrefix}/scrapbooks/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = req.user?.id;
      const scrapbookId = parseInt(req.params.id);
      
      if (!userId || isNaN(scrapbookId)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      
      const scrapbook = await db.query.scrapbooks.findFirst({
        where: and(eq(scrapbooks.id, scrapbookId), eq(scrapbooks.userId, userId)),
        with: {
          memories: {
            orderBy: [desc(travelMemories.createdAt)]
          }
        }
      });
      
      if (!scrapbook) {
        return res.status(404).json({ error: 'Scrapbook not found' });
      }
      
      return res.status(200).json(scrapbook);
    } catch (error) {
      console.error('Error fetching scrapbook:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update a scrapbook
  app.put(`${apiPrefix}/scrapbooks/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = req.user?.id;
      const scrapbookId = parseInt(req.params.id);
      
      if (!userId || isNaN(scrapbookId)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      // Verify ownership
      const existingScrapbook = await db.query.scrapbooks.findFirst({
        where: and(eq(scrapbooks.id, scrapbookId), eq(scrapbooks.userId, userId))
      });
      
      if (!existingScrapbook) {
        return res.status(404).json({ error: 'Scrapbook not found' });
      }

      const validatedData = insertScrapbookSchema.partial().parse(req.body);
      
      const [updatedScrapbook] = await db.update(scrapbooks)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(scrapbooks.id, scrapbookId))
        .returning();
        
      return res.status(200).json(updatedScrapbook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating scrapbook:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete a scrapbook
  app.delete(`${apiPrefix}/scrapbooks/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = req.user?.id;
      const scrapbookId = parseInt(req.params.id);
      
      if (!userId || isNaN(scrapbookId)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      // Verify ownership
      const existingScrapbook = await db.query.scrapbooks.findFirst({
        where: and(eq(scrapbooks.id, scrapbookId), eq(scrapbooks.userId, userId))
      });
      
      if (!existingScrapbook) {
        return res.status(404).json({ error: 'Scrapbook not found' });
      }

      // Delete all memories first
      await db.delete(travelMemories).where(eq(travelMemories.scrapbookId, scrapbookId));
      
      // Delete the scrapbook
      await db.delete(scrapbooks).where(eq(scrapbooks.id, scrapbookId));
      
      return res.status(200).json({ success: true, message: 'Scrapbook deleted successfully' });
    } catch (error) {
      console.error('Error deleting scrapbook:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Travel Memory Routes

  // Add a memory to a scrapbook
  app.post(`${apiPrefix}/scrapbooks/:id/memories`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = req.user?.id;
      const scrapbookId = parseInt(req.params.id);
      
      if (!userId || isNaN(scrapbookId)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      // Verify scrapbook ownership
      const scrapbook = await db.query.scrapbooks.findFirst({
        where: and(eq(scrapbooks.id, scrapbookId), eq(scrapbooks.userId, userId))
      });
      
      if (!scrapbook) {
        return res.status(404).json({ error: 'Scrapbook not found' });
      }

      const validatedData = insertTravelMemorySchema.parse({
        ...req.body,
        scrapbookId
      });
      
      const [newMemory] = await db.insert(travelMemories).values(validatedData).returning();
      
      // Update scrapbook timestamp
      await db.update(scrapbooks)
        .set({ updatedAt: new Date() })
        .where(eq(scrapbooks.id, scrapbookId));
      
      return res.status(201).json(newMemory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating memory:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update a memory
  app.put(`${apiPrefix}/memories/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = req.user?.id;
      const memoryId = parseInt(req.params.id);
      
      if (!userId || isNaN(memoryId)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      // Verify memory ownership through scrapbook
      const memory = await db.query.travelMemories.findFirst({
        where: eq(travelMemories.id, memoryId),
        with: {
          scrapbook: true
        }
      });
      
      if (!memory || memory.scrapbook.userId !== userId) {
        return res.status(404).json({ error: 'Memory not found' });
      }

      const validatedData = insertTravelMemorySchema.partial().parse(req.body);
      
      const [updatedMemory] = await db.update(travelMemories)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(travelMemories.id, memoryId))
        .returning();
        
      // Update scrapbook timestamp
      await db.update(scrapbooks)
        .set({ updatedAt: new Date() })
        .where(eq(scrapbooks.id, memory.scrapbookId));
        
      return res.status(200).json(updatedMemory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating memory:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete a memory
  app.delete(`${apiPrefix}/memories/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = req.user?.id;
      const memoryId = parseInt(req.params.id);
      
      if (!userId || isNaN(memoryId)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      // Verify memory ownership through scrapbook
      const memory = await db.query.travelMemories.findFirst({
        where: eq(travelMemories.id, memoryId),
        with: {
          scrapbook: true
        }
      });
      
      if (!memory || memory.scrapbook.userId !== userId) {
        return res.status(404).json({ error: 'Memory not found' });
      }

      await db.delete(travelMemories).where(eq(travelMemories.id, memoryId));
      
      // Update scrapbook timestamp
      await db.update(scrapbooks)
        .set({ updatedAt: new Date() })
        .where(eq(scrapbooks.id, memory.scrapbookId));
      
      return res.status(200).json({ success: true, message: 'Memory deleted successfully' });
    } catch (error) {
      console.error('Error deleting memory:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Google Maps API Routes for Hotels and Flights
  
  // Search for hotels in a destination
  app.get(`${apiPrefix}/hotels/search`, async (req, res) => {
    try {
      const { location, radius, minPrice, maxPrice } = req.query;
      
      if (!location) {
        return res.status(400).json({ error: 'Location parameter is required' });
      }
      
      const radiusNum = radius ? parseInt(radius as string) : undefined;
      const minPriceNum = minPrice ? parseInt(minPrice as string) : undefined;
      const maxPriceNum = maxPrice ? parseInt(maxPrice as string) : undefined;
      
      const hotels = await searchGoogleHotels(
        location as string, 
        radiusNum, 
        minPriceNum, 
        maxPriceNum
      );
      
      // Add estimated prices based on price level
      const hotelsWithPrices = hotels.map(hotel => {
        const priceEstimate = getHotelPriceEstimate(hotel.priceLevel);
        return {
          ...hotel,
          estimatedPriceRange: priceEstimate,
          pricePerNight: Math.round((priceEstimate.min + priceEstimate.max) / 2)
        };
      });
      
      return res.status(200).json({ hotels: hotelsWithPrices });
    } catch (error) {
      console.error('Error searching for hotels:', error);
      return res.status(500).json({ 
        error: 'Error searching for hotels',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Get hotel pricing trends for a destination
  app.get(`${apiPrefix}/hotels/pricing-trends`, async (req, res) => {
    try {
      const { destination } = req.query;
      
      if (!destination) {
        return res.status(400).json({ error: 'Destination parameter is required' });
      }
      
      const pricingTrends = getHotelPricingTrends(destination as string);
      
      return res.status(200).json(pricingTrends);
    } catch (error) {
      console.error('Error getting hotel pricing trends:', error);
      return res.status(500).json({ 
        error: 'Error getting hotel pricing trends',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Search for flights between destinations
  app.get(`${apiPrefix}/flights/search`, async (req, res) => {
    try {
      const { origin, destination, departureDate, returnDate, adults } = req.query;
      
      if (!origin || !destination || !departureDate) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          required: ['origin', 'destination', 'departureDate']
        });
      }
      
      const adultsNum = adults ? parseInt(adults as string) : 1;
      
      const flights = await searchGoogleFlights(
        origin as string,
        destination as string,
        departureDate as string,
        returnDate as string,
        adultsNum
      );
      
      return res.status(200).json({ flights });
    } catch (error) {
      console.error('Error searching for flights:', error);
      return res.status(500).json({ 
        error: 'Error searching for flights',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Get flight pricing trends for a route
  app.get(`${apiPrefix}/flights/pricing-trends`, async (req, res) => {
    try {
      const { origin, destination } = req.query;
      
      if (!origin || !destination) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          required: ['origin', 'destination']
        });
      }
      
      const pricingTrends = getFlightPricingTrends(origin as string, destination as string);
      
      return res.status(200).json(pricingTrends);
    } catch (error) {
      console.error('Error getting flight pricing trends:', error);
      return res.status(500).json({ 
        error: 'Error getting flight pricing trends',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Hotel recommendations endpoint - specific hotels with authentic data
  app.get(`${apiPrefix}/hotels/recommendations/:destination`, async (req, res) => {
    try {
      const destination = req.params.destination;
      const budget = req.query.budget ? parseInt(req.query.budget as string) : undefined;
      
      const recommendations = getHotelRecommendations(destination, budget);
      
      if (recommendations.length === 0) {
        return res.status(404).json({ 
          error: 'No hotel recommendations available for this destination',
          supportedDestinations: getAllSupportedDestinations()
        });
      }
      
      return res.status(200).json({ 
        destination,
        hotels: recommendations,
        count: recommendations.length
      });
    } catch (error) {
      console.error('Error getting hotel recommendations:', error);
      return res.status(500).json({ 
        error: 'Error getting hotel recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Event recommendations endpoint - specific events and activities
  app.get(`${apiPrefix}/events/recommendations/:destination`, async (req, res) => {
    try {
      const destination = req.params.destination;
      const interests = req.query.interests ? (req.query.interests as string).split(',') : undefined;
      
      const recommendations = getEventRecommendations(destination, interests);
      
      if (recommendations.length === 0) {
        return res.status(404).json({ 
          error: 'No event recommendations available for this destination',
          supportedDestinations: getAllSupportedDestinations()
        });
      }
      
      return res.status(200).json({ 
        destination,
        events: recommendations,
        count: recommendations.length
      });
    } catch (error) {
      console.error('Error getting event recommendations:', error);
      return res.status(500).json({ 
        error: 'Error getting event recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Combined travel recommendations endpoint
  app.get(`${apiPrefix}/travel/recommendations/:destination`, async (req, res) => {
    try {
      const destination = req.params.destination;
      const budget = req.query.budget ? parseInt(req.query.budget as string) : undefined;
      const interests = req.query.interests ? (req.query.interests as string).split(',') : undefined;
      
      const hotels = getHotelRecommendations(destination, budget);
      const events = getEventRecommendations(destination, interests);
      
      if (hotels.length === 0 && events.length === 0) {
        return res.status(404).json({ 
          error: 'No recommendations available for this destination',
          supportedDestinations: getAllSupportedDestinations()
        });
      }
      
      return res.status(200).json({ 
        destination,
        recommendations: {
          hotels,
          events,
          summary: {
            hotelCount: hotels.length,
            eventCount: events.length,
            priceRange: hotels.length > 0 ? {
              min: Math.min(...hotels.map(h => h.priceRange.min)),
              max: Math.max(...hotels.map(h => h.priceRange.max)),
              currency: hotels[0].priceRange.currency
            } : null
          }
        }
      });
    } catch (error) {
      console.error('Error getting travel recommendations:', error);
      return res.status(500).json({ 
        error: 'Error getting travel recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Supported destinations endpoint
  app.get(`${apiPrefix}/destinations/supported`, async (req, res) => {
    try {
      const destinations = getAllSupportedDestinations();
      return res.status(200).json({ 
        destinations,
        count: destinations.length
      });
    } catch (error) {
      console.error('Error getting supported destinations:', error);
      return res.status(500).json({ 
        error: 'Error getting supported destinations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
