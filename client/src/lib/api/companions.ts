import { Companion, TripCompanion } from '@shared/schema';
import { apiRequest } from '../queryClient';

/**
 * Fetch all available travel companions
 */
export async function getAllCompanions(): Promise<Companion[]> {
  const response = await apiRequest<Companion[]>('/companions');
  return response;
}

/**
 * Fetch a specific companion by ID
 */
export async function getCompanion(id: number): Promise<Companion> {
  const response = await apiRequest<Companion>(`/companions/${id}`);
  return response;
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
  const response = await apiRequest<Companion[]>(
    `/trips/${tripId}/companion-matches`, 
    {
      method: 'POST',
      data: preferences
    }
  );
  return response;
}

/**
 * Associate a companion with a trip
 */
export async function associateCompanionWithTrip(
  tripId: number,
  companionId: number,
  status = 'pending'
): Promise<TripCompanion> {
  const response = await apiRequest<TripCompanion>(
    `/trips/${tripId}/companions`,
    {
      method: 'POST',
      data: { companionId, status }
    }
  );
  return response;
}

/**
 * Update a trip companion's status
 */
export async function updateTripCompanionStatus(
  tripId: number,
  companionId: number,
  status: string
): Promise<TripCompanion> {
  const response = await apiRequest<TripCompanion>(
    `/trips/${tripId}/companions/${companionId}`,
    {
      method: 'PATCH',
      data: { status }
    }
  );
  return response;
}

/**
 * Get all companions for a trip
 */
export async function getTripCompanions(tripId: number): Promise<Array<{
  companion: Companion;
  status: string;
  id: number;
  tripId: number;
  companionId: number;
  createdAt: Date;
}>> {
  const response = await apiRequest<Array<{
    companion: Companion;
    status: string;
    id: number;
    tripId: number;
    companionId: number;
    createdAt: Date;
  }>>(`/trips/${tripId}/companions`);
  return response;
}