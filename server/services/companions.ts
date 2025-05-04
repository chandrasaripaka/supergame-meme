import { db } from "@db";
import { 
  companions,
  companions as companionsTable,
  Companion,
  tripCompanions,
  trips
} from "@shared/schema";
import { eq, and, sql, like, not, or, inArray, desc } from "drizzle-orm";

/**
 * Get all available travel companions
 */
export async function getAllCompanions(): Promise<Companion[]> {
  try {
    const allCompanions = await db.query.companions.findMany({
      orderBy: (companions, { desc }) => [desc(companions.rating)],
    });
    return allCompanions;
  } catch (error) {
    console.error("Error fetching companions:", error);
    throw new Error("Failed to fetch travel companions");
  }
}

/**
 * Get a specific companion by id
 */
export async function getCompanion(id: number): Promise<Companion | null> {
  try {
    const companion = await db.query.companions.findFirst({
      where: eq(companions.id, id),
    });
    return companion || null;
  } catch (error) {
    console.error(`Error fetching companion with id ${id}:`, error);
    throw new Error("Failed to fetch travel companion");
  }
}

/**
 * Find companion matches based on user preferences and trip details
 * @param tripId The trip ID to find matches for
 * @param preferences User preferences for companion matching
 */
export async function findCompanionMatches(
  tripId: number,
  preferences: {
    travelStyles?: string[];
    languages?: string[];
    ageRange?: { min: number; max: number };
    gender?: string;
    interests?: string[];
    destinationMatch?: boolean;
  } = {}
): Promise<Companion[]> {
  try {
    // Get the trip details
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!trip) {
      throw new Error(`Trip with id ${tripId} not found`);
    }

    // Construct the base query
    let query = db.select().from(companionsTable);

    // Apply filters based on preferences
    const conditions = [];

    // Filter by travel style if provided
    if (preferences.travelStyles && preferences.travelStyles.length > 0) {
      conditions.push(
        or(...preferences.travelStyles.map(style => eq(companionsTable.travelStyle, style)))
      );
    }

    // Filter by languages if provided
    if (preferences.languages && preferences.languages.length > 0) {
      // This is a simplification, as array containment checks are more complex
      // In a real implementation, we might use a more sophisticated approach
      preferences.languages.forEach(language => {
        conditions.push(
          sql`${companionsTable.languages} @> ARRAY[${language}]::text[]`
        );
      });
    }

    // Filter by age range if provided
    if (preferences.ageRange) {
      conditions.push(
        and(
          sql`${companionsTable.age} >= ${preferences.ageRange.min}`,
          sql`${companionsTable.age} <= ${preferences.ageRange.max}`
        )
      );
    }

    // Filter by gender if provided
    if (preferences.gender) {
      conditions.push(eq(companionsTable.gender, preferences.gender));
    }

    // Filter by interests if provided
    if (preferences.interests && preferences.interests.length > 0) {
      // Similar to languages, this is a simplification
      preferences.interests.forEach(interest => {
        conditions.push(
          sql`${companionsTable.interests} @> ARRAY[${interest}]::text[]`
        );
      });
    }

    // Filter by destination match if requested
    if (preferences.destinationMatch) {
      const destination = trip.destination;
      conditions.push(
        sql`${companionsTable.preferredDestinations} @> ARRAY[${destination}]::text[]`
      );
    }

    // Filter by availability
    if (trip.startDate && trip.endDate) {
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);
      
      conditions.push(
        or(
          // Either the companion has no specific availability (null)
          sql`${companionsTable.availabilityStart} IS NULL`,
          // Or the companion's availability overlaps with the trip dates
          and(
            sql`${companionsTable.availabilityStart} <= ${tripEnd}`,
            sql`${companionsTable.availabilityEnd} >= ${tripStart}`
          )
        )
      );
    }

    // Exclude companions already associated with this trip
    const existingCompanions = await db.select({ companionId: tripCompanions.companionId })
      .from(tripCompanions)
      .where(eq(tripCompanions.tripId, tripId));
    
    if (existingCompanions.length > 0) {
      const existingIds = existingCompanions.map(ec => ec.companionId);
      conditions.push(not(inArray(companionsTable.id, existingIds)));
    }

    // Apply all conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Order by rating (best first)
    query = query.orderBy(sql`${companions.rating} DESC`);

    // Execute the query
    const matches = await query;
    return matches;
  } catch (error) {
    console.error(`Error finding companion matches for trip ${tripId}:`, error);
    throw new Error("Failed to find companion matches");
  }
}

/**
 * Create a trip companion association
 */
export async function associateCompanionWithTrip(
  tripId: number,
  companionId: number,
  status = "pending"
) {
  try {
    const [result] = await db.insert(tripCompanions)
      .values({
        tripId,
        companionId,
        status
      })
      .returning();
    return result;
  } catch (error) {
    console.error(`Error associating companion ${companionId} with trip ${tripId}:`, error);
    throw new Error("Failed to associate companion with trip");
  }
}

/**
 * Update the status of a trip companion
 */
export async function updateTripCompanionStatus(
  tripId: number,
  companionId: number,
  status: string
) {
  try {
    const [result] = await db.update(tripCompanions)
      .set({ status })
      .where(
        and(
          eq(tripCompanions.tripId, tripId),
          eq(tripCompanions.companionId, companionId)
        )
      )
      .returning();
    return result;
  } catch (error) {
    console.error(`Error updating status for companion ${companionId} on trip ${tripId}:`, error);
    throw new Error("Failed to update companion status");
  }
}

/**
 * Get all companions associated with a trip
 */
export async function getTripCompanions(tripId: number) {
  try {
    const result = await db.query.tripCompanions.findMany({
      where: eq(tripCompanions.tripId, tripId),
      with: {
        companion: true
      }
    });
    return result;
  } catch (error) {
    console.error(`Error fetching companions for trip ${tripId}:`, error);
    throw new Error("Failed to fetch trip companions");
  }
}

/**
 * Use AI to find the best companion matches based on trip context and preferences
 * This is a placeholder for a more sophisticated AI-based matching algorithm
 */
export async function findAICompanionMatches(
  tripId: number,
  destination: string,
  activities: string[],
  userPreferences: any
) {
  try {
    // For now, this is just a simplified version of the regular match function
    // In a real implementation, this would use the AI service to analyze
    // the trip context and find the best matches
    
    const preferences = {
      interests: activities,
      destinationMatch: true
    };
    
    return findCompanionMatches(tripId, preferences);
  } catch (error) {
    console.error(`Error finding AI companion matches for trip ${tripId}:`, error);
    throw new Error("Failed to find AI companion matches");
  }
}