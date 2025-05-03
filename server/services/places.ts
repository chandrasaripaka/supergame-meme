import axios from "axios";

interface PlaceDetails {
  id: string;
  name: string;
  rating: number;
  photos?: Array<{
    photo_reference: string;
  }>;
  vicinity: string;
  types: string[];
  price_level?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface PlacesResponse {
  results: PlaceDetails[];
  status: string;
}

export async function getPlaceDetails(location: string, type = "tourist_attraction"): Promise<PlaceDetails[]> {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || "";
    
    if (!apiKey) {
      throw new Error("Google Places API key is not configured");
    }

    // First, geocode the location to get coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
    
    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (geocodeResponse.data.status !== "OK" || !geocodeResponse.data.results.length) {
      throw new Error(`Failed to geocode location: ${location}`);
    }
    
    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
    
    // Now search for places using the coordinates
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${type}&key=${apiKey}`;
    
    const placesResponse = await axios.get<PlacesResponse>(placesUrl);
    
    if (placesResponse.data.status !== "OK") {
      throw new Error(`Failed to fetch places: ${placesResponse.data.status}`);
    }
    
    return placesResponse.data.results;
  } catch (error) {
    console.error("Error fetching place details:", error);
    throw new Error(`Places service error: ${error.message}`);
  }
}

export function getPhotoUrl(photoReference: string): string {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || "";
  
  if (!apiKey || !photoReference) {
    return "https://via.placeholder.com/400x300?text=No+Image+Available";
  }
  
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
}
