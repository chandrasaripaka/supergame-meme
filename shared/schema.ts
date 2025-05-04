import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type InsertAttraction = z.infer<typeof insertAttractionSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
