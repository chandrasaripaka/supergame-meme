// Trip related types
export interface Trip {
  id: number;
  userId: number;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  itinerary: TravelPlan;
  createdAt: string;
}

export interface TravelPlan {
  destination: string;
  duration: number;
  budget: number;
  remainingBudget: number;
  weather: {
    temp: string;
    condition: string;
  };
  days: Array<ItineraryDay>;
  budgetBreakdown: BudgetBreakdown;
  recommendations: Array<Recommendation>;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: Array<Activity>;
}

export interface Activity {
  type: 'accommodation' | 'food' | 'activity' | 'transportation';
  description: string;
  cost: number;
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  transportation: number;
  miscellaneous: number;
}

export interface Recommendation {
  name: string;
  rating: number;
  description: string;
}

// Message related types
export interface Message {
  id?: number;
  userId?: number;
  tripId?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  modelInfo?: {
    provider?: string;
    model?: string;
    note?: string;
  };
  data?: {
    flights?: Array<{
      airline: string;
      price: number;
      duration: string;
      stops: number;
    }>;
    hotels?: Array<{
      name: string;
      price: number;
      rating: number;
      amenities: string[];
    }>;
    attractions?: Array<{
      name: string;
      description: string;
      type: string;
      rating: number;
    }>;
    budget?: {
      total: number;
      breakdown: Record<string, number>;
    };
    destination?: string;
    price?: number;
    duration?: string;
    weather?: Weather;
    restaurants?: Array<{
      name: string;
      location: string;
      cuisine: string;
      rating: number;
      price: string;
      description: string;
      image: string;
      bookingAvailable: boolean;
    }>;
    [key: string]: any;
  };
}

// Weather related types
export interface Weather {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_mph: number;
    humidity: number;
    feelslike_c: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
    }>;
  };
}

// Attraction related types
export interface Attraction {
  id: number;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  rating: string;
  type: string;
}



export interface PackingItem {
  id: string;
  name: string;
  category: string; 
  quantity: number;
  essential: boolean;
  weatherDependent?: boolean;
  activityDependent?: string;
}

export interface PackingList {
  destination: string;
  categories: Array<{
    name: string;
    items: PackingItem[];
  }>;
  essentials: PackingItem[];
  weatherSpecific: PackingItem[];
  activitySpecific: PackingItem[];
}
