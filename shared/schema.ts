import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  preferences: jsonb("preferences").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTripSchema = createInsertSchema(trips).pick({
  userId: true,
  destination: true,
  startDate: true,
  endDate: true,
  budget: true,
  itinerary: true,
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

// Travel companions table
export const companions = pgTable("companions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  interests: text("interests").array().notNull(),
  languages: text("languages").array().notNull(),
  travelStyle: text("travel_style").notNull(),
  availabilityStart: timestamp("availability_start"),
  availabilityEnd: timestamp("availability_end"),
  preferredDestinations: text("preferred_destinations").array(),
  avatarUrl: text("avatar_url"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("4.5"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompanionSchema = createInsertSchema(companions).pick({
  name: true,
  bio: true,
  age: true,
  gender: true,
  interests: true,
  languages: true,
  travelStyle: true,
  availabilityStart: true,
  availabilityEnd: true,
  preferredDestinations: true,
  avatarUrl: true,
});

// Trip companions junction table
export const tripCompanions = pgTable("trip_companions", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id).notNull(),
  companionId: integer("companion_id").references(() => companions.id).notNull(),
  status: text("status").default("pending").notNull(), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTripCompanionSchema = createInsertSchema(tripCompanions).pick({
  tripId: true,
  companionId: true,
  status: true,
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

// Define relations
export const userRelations = relations(users, ({ many }) => ({
  trips: many(trips),
  messages: many(messages),
}));

export const tripRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  messages: many(messages),
  tripCompanions: many(tripCompanions),
}));

export const companionRelations = relations(companions, ({ many }) => ({
  tripCompanions: many(tripCompanions),
}));

export const tripCompanionRelations = relations(tripCompanions, ({ one }) => ({
  trip: one(trips, {
    fields: [tripCompanions.tripId],
    references: [trips.id],
  }),
  companion: one(companions, {
    fields: [tripCompanions.companionId],
    references: [companions.id],
  }),
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

// Types
export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type Attraction = typeof attractions.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Companion = typeof companions.$inferSelect;
export type TripCompanion = typeof tripCompanions.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type InsertAttraction = z.infer<typeof insertAttractionSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertCompanion = z.infer<typeof insertCompanionSchema>;
export type InsertTripCompanion = z.infer<typeof insertTripCompanionSchema>;
