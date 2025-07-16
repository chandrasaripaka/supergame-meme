import { db } from "@db";
import { 
  destinationStats, 
  seasonalRecommendations, 
  activityDistribution, 
  visitorData, 
  comparableDestinations 
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface DestinationStatistics {
  id: string;
  name: string;
  country: string;
  ratings: Array<{
    category: string;
    score: number;
    average: number;
  }>;
  expenses: Array<{
    category: string;
    amount: number;
  }>;
  visitorData: Array<{
    month: string;
    visitors: number;
  }>;
  activityDistribution: Array<{
    name: string;
    value: number;
  }>;
  seasonalRecommendations: Array<{
    season: string;
    score: number;
    highlights: string[];
  }>;
  comparableDestinations: string[];
}

/**
 * Get destination statistics from database
 */
export async function getDestinationStats(destination: string): Promise<DestinationStatistics | null> {
  try {
    // Normalize destination to match database format
    const normalizedDestination = destination.toLowerCase().replace(/\s+/g, '-');
    
    // Get destination stats
    const stats = await db.query.destinationStats.findFirst({
      where: eq(destinationStats.destinationId, normalizedDestination)
    });
    
    if (!stats) {
      return null;
    }
    
    // Get seasonal recommendations
    const seasonalRecs = await db.query.seasonalRecommendations.findMany({
      where: eq(seasonalRecommendations.destinationId, normalizedDestination)
    });
    
    // Get activity distribution
    const activityDist = await db.query.activityDistribution.findMany({
      where: eq(activityDistribution.destinationId, normalizedDestination)
    });
    
    // Get visitor data
    const visitorStats = await db.query.visitorData.findMany({
      where: eq(visitorData.destinationId, normalizedDestination)
    });
    
    // Get comparable destinations
    const comparableDests = await db.query.comparableDestinations.findMany({
      where: eq(comparableDestinations.destinationId, normalizedDestination)
    });
    
    // Format the response
    const formattedStats: DestinationStatistics = {
      id: stats.destinationId,
      name: stats.name,
      country: stats.country,
      ratings: [
        { category: 'Overall', score: parseFloat(stats.overallRating || '7.0'), average: 7.0 },
        { category: 'Activities', score: parseFloat(stats.activitiesRating || '7.0'), average: 7.0 },
        { category: 'Scenery', score: parseFloat(stats.sceneryRating || '7.0'), average: 6.5 },
        { category: 'Value', score: parseFloat(stats.valueRating || '7.0'), average: 6.8 },
        { category: 'Accessibility', score: parseFloat(stats.accessibilityRating || '7.0'), average: 7.2 }
      ],
      expenses: [
        { category: 'Accommodation', amount: stats.accommodationCost || 120 },
        { category: 'Food', amount: stats.foodCost || 50 },
        { category: 'Transportation', amount: stats.transportationCost || 30 },
        { category: 'Activities', amount: stats.activitiesCost || 40 },
        { category: 'Miscellaneous', amount: stats.miscCost || 18 }
      ],
      visitorData: visitorStats.map(v => ({
        month: v.month,
        visitors: v.visitors
      })),
      activityDistribution: activityDist.map(a => ({
        name: a.activityType,
        value: a.percentage
      })),
      seasonalRecommendations: seasonalRecs.map(s => ({
        season: s.season,
        score: parseFloat(s.score || '7.0'),
        highlights: Array.isArray(s.highlights) ? s.highlights : []
      })),
      comparableDestinations: comparableDests.map(c => c.comparableDestinationId)
    };
    
    return formattedStats;
    
  } catch (error) {
    console.error('Error fetching destination stats:', error);
    return null;
  }
}

/**
 * Get all available destinations from database
 */
export async function getAllDestinations(): Promise<Array<{ id: string; name: string; country: string }>> {
  try {
    const destinations = await db.query.destinationStats.findMany({
      columns: {
        destinationId: true,
        name: true,
        country: true
      },
      where: eq(destinationStats.isActive, true)
    });
    
    return destinations.map(d => ({
      id: d.destinationId,
      name: d.name,
      country: d.country
    }));
    
  } catch (error) {
    console.error('Error fetching all destinations:', error);
    return [];
  }
}

/**
 * Search destinations by name or country
 */
export async function searchDestinations(query: string): Promise<Array<{ id: string; name: string; country: string }>> {
  try {
    const destinations = await db.query.destinationStats.findMany({
      columns: {
        destinationId: true,
        name: true,
        country: true
      },
      where: eq(destinationStats.isActive, true)
    });
    
    const searchTerm = query.toLowerCase();
    const filtered = destinations.filter(d => 
      d.name.toLowerCase().includes(searchTerm) || 
      d.country.toLowerCase().includes(searchTerm)
    );
    
    return filtered.map(d => ({
      id: d.destinationId,
      name: d.name,
      country: d.country
    }));
    
  } catch (error) {
    console.error('Error searching destinations:', error);
    return [];
  }
}

/**
 * Add a new destination to the database
 */
export async function addDestination(destinationData: any): Promise<string | null> {
  try {
    const destinationId = `${destinationData.name.toLowerCase().replace(/\s+/g, '-')}-${destinationData.country.toLowerCase().replace(/\s+/g, '-')}`;
    
    const [newDestination] = await db.insert(destinationStats).values({
      destinationId,
      ...destinationData
    }).returning();
    
    return newDestination.destinationId;
    
  } catch (error) {
    console.error('Error adding destination:', error);
    return null;
  }
}

/**
 * Update destination statistics
 */
export async function updateDestinationStats(destinationId: string, updates: any): Promise<boolean> {
  try {
    await db.update(destinationStats)
      .set(updates)
      .where(eq(destinationStats.destinationId, destinationId));
    
    return true;
    
  } catch (error) {
    console.error('Error updating destination stats:', error);
    return false;
  }
}