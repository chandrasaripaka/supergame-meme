export interface DestinationStatistics {
  destination: string;
  summary: string;
  currency: string;
  currencyName: string;
  localLanguage: string;
  averageDailyBudget: number;
  topAttraction: string;
  safetyIndex: number;
  bestTimeToVisit: string;
  expenses: Expense[];
  visitorData: VisitorData[];
  activityDistribution: ActivityData[];
  seasonalRecommendations: SeasonalData[];
}

export interface Expense {
  category: string;
  cost: number;
}

export interface VisitorData {
  name: string;
  value: number;
}

export interface ActivityData {
  activity: string;
  percentage: number;
}

export interface SeasonalData {
  month: string;
  rating: number;
}