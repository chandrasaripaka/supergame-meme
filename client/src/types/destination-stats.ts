// Types for destination statistics and visualization data

export interface DestinationRating {
  category: string; // e.g., "Safety", "Affordability", "Activities", etc.
  score: number; // normalized score out of 10
  average: number; // average score for comparison
}

export interface DestinationExpense {
  category: string; // e.g., "Accommodation", "Food", "Transportation", etc.
  amount: number; // average daily expense in USD
}

export interface VisitorData {
  month: string; // e.g., "Jan", "Feb", etc.
  visitors: number; // visitor count in thousands
  temperature: number; // average temperature in Celsius
}

export interface ActivityDistribution {
  name: string; // e.g., "Cultural", "Adventure", "Relaxation", etc.
  value: number; // percentage of activities in this category
}

export interface SeasonalRecommendation {
  season: string; // e.g., "Spring", "Summer", "Fall", "Winter"
  score: number; // recommendation score out of 10
  highlights: string[]; // key highlights for this season
}

export interface DestinationStatistics {
  id: string;
  name: string;
  country: string;
  ratings: DestinationRating[];
  expenses: DestinationExpense[];
  visitorData: VisitorData[];
  activityDistribution: ActivityDistribution[];
  seasonalRecommendations: SeasonalRecommendation[];
  comparableDestinations: string[]; // IDs of comparable destinations
}