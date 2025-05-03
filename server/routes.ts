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
import { generateTravelPlan, continueTravelConversation } from "./services/gemini";
import { getWeather } from "./services/weather";
import { getPlaceDetails } from "./services/places";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";

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
      const validatedData = insertMessageSchema.parse(req.body);
      const [newMessage] = await db.insert(messages).values(validatedData).returning();
      return res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating message:', error);
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

      const travelPlan = await generateTravelPlan(
        travelRequest.destination,
        travelRequest.duration,
        travelRequest.budget,
        travelRequest.interests,
        travelRequest.startDate
      );

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

  const httpServer = createServer(app);
  return httpServer;
}
