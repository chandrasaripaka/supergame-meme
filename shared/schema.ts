import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table with Google authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"), // Nullable to support OAuth logins
  email: varchar("email", { length: 255 }).unique(),
  googleId: varchar("google_id", { length: 255 }).unique(),
  profilePicture: text("profile_picture"),
  preferences: jsonb("preferences").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email("Must provide a valid email"),
  password: (schema) => schema.optional(), // Make password optional for OAuth users
}).pick({
  username: true,
  password: true,
  email: true,
  googleId: true,
  profilePicture: true,
});

// Chat Sessions table for persistent and temporary chats
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").default("New Chat"),
  isTemporary: boolean("is_temporary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  userId: true,
  title: true,
  isTemporary: true,
});

// Chat Messages table for storing messages in a chat session
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => chatSessions.id).notNull(),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  sessionId: true,
  role: true,
  content: true,
});

// Duve Hotels integration table
export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  duveId: varchar("duve_id", { length: 100 }).unique(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  price: integer("price"),
  priceUnit: text("price_unit").default("USD"),
  rating: integer("rating"),
  amenities: jsonb("amenities").default([]),
  coordinates: jsonb("coordinates").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHotelSchema = createInsertSchema(hotels).pick({
  duveId: true,
  name: true,
  location: true,
  address: true,
  description: true,
  imageUrl: true,
  price: true,
  priceUnit: true,
  rating: true,
  amenities: true,
  coordinates: true,
});

// Trips table
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  destination: text("destination").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  budget: integer("budget").notNull(),
  itinerary: jsonb("itinerary").default({}).notNull(),
  chatSessionId: integer("chat_session_id").references(() => chatSessions.id),
  selectedHotelId: integer("selected_hotel_id").references(() => hotels.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTripSchema = createInsertSchema(trips).pick({
  userId: true,
  destination: true,
  startDate: true,
  endDate: true,
  budget: true,
  itinerary: true,
  chatSessionId: true,
  selectedHotelId: true,
});

// Attractions table for seed data
export const attractions = pgTable("attractions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: text("rating").notNull(),
  type: text("type").notNull(),
});

export const insertAttractionSchema = createInsertSchema(attractions).pick({
  name: true,
  location: true,
  description: true,
  imageUrl: true,
  rating: true,
  type: true,
});

// Airports table for comprehensive airport data
export const airports = pgTable("airports", {
  id: serial("id").primaryKey(),
  iataCode: varchar("iata_code", { length: 3 }).notNull().unique(),
  icaoCode: varchar("icao_code", { length: 4 }),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  region: text("region"),
  continent: text("continent"),
  timezone: text("timezone"),
  coordinates: jsonb("coordinates").default({}),
  elevation: integer("elevation"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAirportSchema = createInsertSchema(airports).pick({
  iataCode: true,
  icaoCode: true,
  name: true,
  city: true,
  country: true,
  countryCode: true,
  region: true,
  continent: true,
  timezone: true,
  coordinates: true,
  elevation: true,
  isActive: true,
});

// Airlines table for flight data
export const airlines = pgTable("airlines", {
  id: serial("id").primaryKey(),
  iataCode: varchar("iata_code", { length: 3 }).notNull().unique(),
  icaoCode: varchar("icao_code", { length: 4 }),
  name: text("name").notNull(),
  country: text("country").notNull(),
  logo: text("logo"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Destination statistics for comprehensive travel data
export const destinationStats = pgTable("destination_stats", {
  id: serial("id").primaryKey(),
  destinationId: text("destination_id").notNull().unique(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  overallRating: decimal("overall_rating", { precision: 3, scale: 2 }).default("7.0"),
  activitiesRating: decimal("activities_rating", { precision: 3, scale: 2 }).default("7.0"),
  sceneryRating: decimal("scenery_rating", { precision: 3, scale: 2 }).default("7.0"),
  valueRating: decimal("value_rating", { precision: 3, scale: 2 }).default("7.0"),
  accessibilityRating: decimal("accessibility_rating", { precision: 3, scale: 2 }).default("7.0"),
  accommodationCost: integer("accommodation_cost").default(120),
  foodCost: integer("food_cost").default(50),
  transportationCost: integer("transportation_cost").default(30),
  activitiesCost: integer("activities_cost").default(40),
  miscCost: integer("misc_cost").default(18),
  peakSeason: text("peak_season").default("summer"),
  bestTimeToVisit: text("best_time_to_visit"),
  timezone: text("timezone"),
  currency: text("currency").default("USD"),
  language: text("language"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Seasonal recommendations for destinations
export const seasonalRecommendations = pgTable("seasonal_recommendations", {
  id: serial("id").primaryKey(),
  destinationId: text("destination_id").notNull().references(() => destinationStats.destinationId),
  season: text("season").notNull(),
  score: decimal("score", { precision: 3, scale: 2 }).notNull(),
  highlights: text("highlights").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity distribution for destinations
export const activityDistribution = pgTable("activity_distribution", {
  id: serial("id").primaryKey(),
  destinationId: text("destination_id").notNull().references(() => destinationStats.destinationId),
  activityType: text("activity_type").notNull(),
  percentage: integer("percentage").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Visitor data for destinations
export const visitorData = pgTable("visitor_data", {
  id: serial("id").primaryKey(),
  destinationId: text("destination_id").notNull().references(() => destinationStats.destinationId),
  month: text("month").notNull(),
  visitors: integer("visitors").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Comparable destinations
export const comparableDestinations = pgTable("comparable_destinations", {
  id: serial("id").primaryKey(),
  destinationId: text("destination_id").notNull().references(() => destinationStats.destinationId),
  comparableDestinationId: text("comparable_destination_id").notNull(),
  similarityScore: decimal("similarity_score", { precision: 3, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Airport to city mappings
export const airportCityMapping = pgTable("airport_city_mapping", {
  id: serial("id").primaryKey(),
  cityName: text("city_name").notNull(),
  airportCode: varchar("airport_code", { length: 3 }).notNull().references(() => airports.iataCode),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages table for storing conversation history
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  tripId: integer("trip_id").references(() => trips.id),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  tripId: true,
  role: true,
  content: true,
});

export const scrapbooks = pgTable("scrapbooks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  theme: text("theme").notNull().default("modern"),
  backgroundColor: text("background_color").notNull().default("#F8FAFC"),
  textColor: text("text_color").notNull().default("#0F172A"),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertScrapbookSchema = createInsertSchema(scrapbooks).pick({
  title: true,
  theme: true,
  backgroundColor: true,
  textColor: true,
  userId: true,
});

export const travelMemories = pgTable("travel_memories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").default(""),
  location: text("location").default(""),
  date: text("date").notNull(),
  images: text("images").array().default([]),
  tags: text("tags").array().default([]),
  rating: integer("rating").default(5),
  transportMode: text("transport_mode").notNull().default("plane"),
  isFavorite: boolean("is_favorite").default(false),
  scrapbookId: integer("scrapbook_id").references(() => scrapbooks.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTravelMemorySchema = createInsertSchema(travelMemories).pick({
  title: true,
  description: true,
  location: true,
  date: true,
  images: true,
  tags: true,
  rating: true,
  transportMode: true,
  isFavorite: true,
  scrapbookId: true,
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planType: text("plan_type", { enum: ["explorer", "wanderer", "travel_pro"] }).notNull(),
  status: text("status", { enum: ["active", "inactive", "cancelled", "expired"] }).notNull().default("active"),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  pricePerMonth: decimal("price_per_month", { precision: 10, scale: 2 }).notNull(),
  features: text("features").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  tripId: integer("trip_id").references(() => trips.id),
  bookingType: text("booking_type").notNull(), // 'flight', 'hotel', 'activity', 'car_rental'
  bookingReference: text("booking_reference").notNull(),
  providerName: text("provider_name").notNull(), // e.g., 'Amadeus', 'Booking.com', etc.
  providerBookingId: text("provider_booking_id"),
  
  // Booking details
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  
  // Pricing
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  
  // Status tracking
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'cancelled', 'completed'
  
  // Additional metadata
  guestCount: integer("guest_count").default(1),
  specialRequests: text("special_requests"),
  confirmationDetails: text("confirmation_details"), // JSON string
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  planType: true,
  status: true,
  endDate: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  pricePerMonth: true,
  features: true
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  userId: true,
  tripId: true,
  bookingType: true,
  bookingReference: true,
  providerName: true,
  providerBookingId: true,
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  location: true,
  totalAmount: true,
  currency: true,
  status: true,
  guestCount: true,
  specialRequests: true,
  confirmationDetails: true
});

// Define relations
export const userRelations = relations(users, ({ many }) => ({
  trips: many(trips),
  messages: many(messages),
  chatSessions: many(chatSessions),
  scrapbooks: many(scrapbooks),
  subscriptions: many(subscriptions),
  bookings: many(bookings)
}));

export const bookingRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  trip: one(trips, { fields: [bookings.tripId], references: [trips.id] })
}));

export const chatSessionRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
  trips: many(trips),
}));

export const chatMessageRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const tripRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  chatSession: one(chatSessions, {
    fields: [trips.chatSessionId],
    references: [chatSessions.id],
  }),
  selectedHotel: one(hotels, {
    fields: [trips.selectedHotelId],
    references: [hotels.id],
  }),
  messages: many(messages),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  trip: one(trips, {
    fields: [messages.tripId],
    references: [trips.id],
  }),
}));

export const scrapbookRelations = relations(scrapbooks, ({ one, many }) => ({
  user: one(users, {
    fields: [scrapbooks.userId],
    references: [users.id],
  }),
  memories: many(travelMemories),
}));

export const travelMemoryRelations = relations(travelMemories, ({ one }) => ({
  scrapbook: one(scrapbooks, {
    fields: [travelMemories.scrapbookId],
    references: [scrapbooks.id],
  }),
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type Attraction = typeof attractions.$inferSelect;
export type Airport = typeof airports.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Hotel = typeof hotels.$inferSelect;
export type Scrapbook = typeof scrapbooks.$inferSelect;
export type TravelMemory = typeof travelMemories.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Booking = typeof bookings.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type InsertAttraction = z.infer<typeof insertAttractionSchema>;
export type InsertAirport = z.infer<typeof insertAirportSchema>;

// Insert schemas for new tables
export const insertAirlineSchema = createInsertSchema(airlines).pick({
  iataCode: true,
  icaoCode: true,
  name: true,
  country: true,
  logo: true,
  isActive: true,
});

export const insertDestinationStatsSchema = createInsertSchema(destinationStats).pick({
  destinationId: true,
  name: true,
  country: true,
  overallRating: true,
  activitiesRating: true,
  sceneryRating: true,
  valueRating: true,
  accessibilityRating: true,
  accommodationCost: true,
  foodCost: true,
  transportationCost: true,
  activitiesCost: true,
  miscCost: true,
  peakSeason: true,
  bestTimeToVisit: true,
  timezone: true,
  currency: true,
  language: true,
  isActive: true,
});

export const insertSeasonalRecommendationSchema = createInsertSchema(seasonalRecommendations).pick({
  destinationId: true,
  season: true,
  score: true,
  highlights: true,
});

export const insertActivityDistributionSchema = createInsertSchema(activityDistribution).pick({
  destinationId: true,
  activityType: true,
  percentage: true,
});

export const insertVisitorDataSchema = createInsertSchema(visitorData).pick({
  destinationId: true,
  month: true,
  visitors: true,
});

export const insertComparableDestinationSchema = createInsertSchema(comparableDestinations).pick({
  destinationId: true,
  comparableDestinationId: true,
  similarityScore: true,
});

export const insertAirportCityMappingSchema = createInsertSchema(airportCityMapping).pick({
  cityName: true,
  airportCode: true,
  isDefault: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type InsertScrapbook = z.infer<typeof insertScrapbookSchema>;
export type InsertTravelMemory = z.infer<typeof insertTravelMemorySchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertAirline = z.infer<typeof insertAirlineSchema>;
export type InsertDestinationStats = z.infer<typeof insertDestinationStatsSchema>;
export type InsertSeasonalRecommendation = z.infer<typeof insertSeasonalRecommendationSchema>;
export type InsertActivityDistribution = z.infer<typeof insertActivityDistributionSchema>;
export type InsertVisitorData = z.infer<typeof insertVisitorDataSchema>;
export type InsertComparableDestination = z.infer<typeof insertComparableDestinationSchema>;
export type InsertAirportCityMapping = z.infer<typeof insertAirportCityMappingSchema>;

export type Airline = typeof airlines.$inferSelect;
export type DestinationStats = typeof destinationStats.$inferSelect;
export type SeasonalRecommendation = typeof seasonalRecommendations.$inferSelect;
export type ActivityDistribution = typeof activityDistribution.$inferSelect;
export type VisitorData = typeof visitorData.$inferSelect;
export type ComparableDestination = typeof comparableDestinations.$inferSelect;
export type AirportCityMapping = typeof airportCityMapping.$inferSelect;
