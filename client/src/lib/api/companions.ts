import { Companion, TripCompanion } from '@shared/schema';
import { apiRequest } from '../queryClient';

/**
 * Fetch all available travel companions
 */
export async function getAllCompanions(): Promise<Companion[]> {
  return apiRequest('/companions');
}

/**
 * Fetch a specific companion by ID
 */
export async function getCompanion(id: number): Promise<Companion> {
  return apiRequest(`/companions/${id}`);
}

/**
 * Find companions that match a trip's preferences
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
    useAi?: boolean;
    activities?: string[];
    destination?: string;
  }
): Promise<Companion[]> {
  return apiRequest({
    url: `/trips/${tripId}/companion-matches`,
    method: 'POST',
    data: preferences
  });
}

/**
 * Associate a companion with a trip
 */
export async function associateCompanionWithTrip(
  tripId: number,
  companionId: number,
  status = 'pending'
): Promise<TripCompanion> {
  return apiRequest({
    url: `/trips/${tripId}/companions`,
    method: 'POST',
    data: { companionId, status }
  });
}

/**
 * Update a trip companion's status
 */
export async function updateTripCompanionStatus(
  tripId: number,
  companionId: number,
  status: string
): Promise<TripCompanion> {
  return apiRequest({
    url: `/trips/${tripId}/companions/${companionId}`,
    method: 'PATCH',
    data: { status }
  });
}

/**
 * Get all companions for a trip
 */
export interface TripCompanionWithDetails {
  companion: Companion;
  status: string;
  id: number;
  tripId: number;
  companionId: number;
  createdAt: Date;
}

export async function getTripCompanions(tripId: number): Promise<TripCompanionWithDetails[]> {
  return apiRequest(`/trips/${tripId}/companions`);
}