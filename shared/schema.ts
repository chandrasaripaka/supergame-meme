import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
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

// Define relations
export const userRelations = relations(users, ({ many }) => ({
  trips: many(trips),
  messages: many(messages),
  chatSessions: many(chatSessions),
  scrapbooks: many(scrapbooks),
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

// Types
export type User = typeof users.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type Attraction = typeof attractions.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Hotel = typeof hotels.$inferSelect;
export type Scrapbook = typeof scrapbooks.$inferSelect;
export type TravelMemory = typeof travelMemories.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type InsertAttraction = z.infer<typeof insertAttractionSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type InsertScrapbook = z.infer<typeof insertScrapbookSchema>;
export type InsertTravelMemory = z.infer<typeof insertTravelMemorySchema>;
