import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DestinationStatistics, 
  DestinationRating, 
  DestinationExpense, 
  VisitorData, 
  ActivityDistribution, 
  SeasonalRecommendation
} from '@/types/destination-stats';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area
} from 'recharts';
import { useMobile } from '@/hooks/use-mobile';

interface DestinationStatsProps {
  statistics: DestinationStatistics;
  isLoading?: boolean;
}

export function DestinationStats({ statistics, isLoading = false }: DestinationStatsProps) {
  const { isMobile } = useMobile();
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'season' | 'activities'>('overview');
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const SEASON_COLORS = {
    'Spring': '#4ade80',
    'Summer': '#f59e0b',
    'Fall': '#ef4444',
    'Winter': '#3b82f6',
    'Dry Season (Apr-Sep)': '#f59e0b',
    'Shoulder Season (Mar, Oct)': '#84cc16',
    'Rainy Season (Nov-Feb)': '#3b82f6',
    'New Year': '#8b5cf6'
  };
  
  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-100 rounded mb-4"></div>
        <div className="flex space-x-3 mb-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }
  
  if (!statistics) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-500 text-center">No statistics available for this destination.</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="bg-white shadow-md rounded-lg overflow-hidden mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with basic info */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <h3 className="text-xl font-bold">{statistics.name}, {statistics.country}</h3>
        <p className="text-blue-100">Travel insights based on data analysis</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b">
        <TabButton 
          isActive={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
          label="Overview"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <TabButton 
          isActive={activeTab === 'expenses'} 
          onClick={() => setActiveTab('expenses')}
          label="Costs"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <TabButton 
          isActive={activeTab === 'season'} 
          onClick={() => setActiveTab('season')}
          label="Best Time"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <TabButton 
          isActive={activeTab === 'activities'} 
          onClick={() => setActiveTab('activities')}
          label="Activities"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>
      
      {/* Tab Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OverviewTab ratings={statistics.ratings} visitorData={statistics.visitorData} />
            </motion.div>
          )}
          
          {activeTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ExpensesTab expenses={statistics.expenses} />
            </motion.div>
          )}
          
          {activeTab === 'season' && (
            <motion.div
              key="season"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SeasonTab 
                seasonalRecommendations={statistics.seasonalRecommendations} 
                visitorData={statistics.visitorData} 
              />
            </motion.div>
          )}
          
          {activeTab === 'activities' && (
            <motion.div
              key="activities"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ActivitiesTab activityDistribution={statistics.activityDistribution} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Tab Button Component
interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}

function TabButton({ isActive, onClick, label, icon }: TabButtonProps) {
  return (
    <button
      className={`flex items-center py-2 px-4 text-sm font-medium border-b-2 focus:outline-none ${
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

// Overview Tab Content
interface OverviewTabProps {
  ratings: DestinationRating[];
  visitorData: VisitorData[];
}

function OverviewTab({ ratings, visitorData }: OverviewTabProps) {
  const { isMobile } = useMobile();
  
  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">Destination Ratings</h4>
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={ratings}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis domain={[0, 10]} />
            <Tooltip 
              formatter={(value) => [`${value}/10`, 'Rating']}
              labelFormatter={(label) => `${label} Rating`}
            />
            <Legend />
            <Bar name="This Destination" dataKey="score" fill="#3b82f6" />
            <Bar name="Global Average" dataKey="average" fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <h4 className="text-lg font-semibold mb-4">Visitor Trends & Climate</h4>
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={visitorData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" name="Visitors (thousands)" dataKey="visitors" fill="#3b82f6" />
            <Line yAxisId="right" name="Temperature (°C)" type="monotone" dataKey="temperature" stroke="#ef4444" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 bg-blue-50 p-3 rounded-md">
        <h5 className="font-medium text-blue-800 mb-2">Why Visit {ratings[0]?.category === 'Overall' ? `(${ratings[0]?.score}/10)` : ''}</h5>
        <p className="text-blue-700 text-sm">
          This destination scores particularly high for 
          {ratings
            .filter(r => r.category !== 'Overall' && r.score > 8.5)
            .map(r => r.category)
            .slice(0, 2)
            .join(' and ')}. 
          The best months to visit based on weather and crowd levels are 
          {visitorData
            .filter(d => d.temperature > 15 && d.temperature < 28 && d.visitors < 450)
            .map(d => d.month)
            .slice(0, 3)
            .join(', ')}.
        </p>
      </div>
    </div>
  );
}

// Expenses Tab Content
interface ExpensesTabProps {
  expenses: DestinationExpense[];
}

function ExpensesTab({ expenses }: ExpensesTabProps) {
  const totalDailyBudget = expenses.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate reasonable budget ranges
  const budgetRanges = {
    budget: Math.round(totalDailyBudget * 0.7),
    average: totalDailyBudget,
    luxury: Math.round(totalDailyBudget * 1.8)
  };
  
  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">Daily Expense Breakdown</h4>
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expenses}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="amount"
            >
              {expenses.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`$${value}`, 'Daily Cost']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-3">Suggested Daily Budgets</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BudgetCard 
            title="Budget" 
            amount={budgetRanges.budget} 
            description="Hostels, street food, public transit" 
            color="bg-green-100 border-green-300 text-green-800"
          />
          <BudgetCard 
            title="Standard" 
            amount={budgetRanges.average} 
            description="Mid-range hotels, local restaurants" 
            color="bg-blue-100 border-blue-300 text-blue-800"
          />
          <BudgetCard 
            title="Luxury" 
            amount={budgetRanges.luxury} 
            description="Upscale hotels, fine dining" 
            color="bg-purple-100 border-purple-300 text-purple-800"
          />
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-3">Average Daily Costs</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${expense.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.category === 'Accommodation' && 'Standard double room in mid-range hotel'}
                    {expense.category === 'Food' && 'Three meals, mix of local restaurants and cafes'}
                    {expense.category === 'Transportation' && 'Local transit, occasional taxi'}
                    {expense.category === 'Activities' && 'One paid attraction or tour per day'}
                    {expense.category === 'Miscellaneous' && 'Souvenirs, tips, and other extras'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Budget Card Component
interface BudgetCardProps {
  title: string;
  amount: number;
  description: string;
  color: string;
}

function BudgetCard({ title, amount, description, color }: BudgetCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${color}`}>
      <h5 className="font-semibold mb-1">{title}</h5>
      <div className="text-2xl font-bold mb-1">${amount}/day</div>
      <p className="text-sm">{description}</p>
    </div>
  );
}

// Season Tab Content
interface SeasonTabProps {
  seasonalRecommendations: SeasonalRecommendation[];
  visitorData: VisitorData[];
}

function SeasonTab({ seasonalRecommendations, visitorData }: SeasonTabProps) {
  const bestSeason = [...seasonalRecommendations].sort((a, b) => b.score - a.score)[0];
  
  // Get season color from mapping or default to blue
  const getSeasonColor = (season: string) => {
    return SEASON_COLORS[season as keyof typeof SEASON_COLORS] || '#3b82f6';
  };
  
  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">When to Visit</h4>
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={seasonalRecommendations}>
            <PolarGrid />
            <PolarAngleAxis dataKey="season" />
            <PolarRadiusAxis domain={[0, 10]} />
            <Radar
              name="Visit Score"
              dataKey="score"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Tooltip formatter={(value) => [`${value}/10`, 'Rating']} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3">Monthly Visitor Trends</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={visitorData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}k visitors`, 'Tourism']} />
            <Legend />
            <Line type="monotone" dataKey="visitors" stroke="#3b82f6" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="temperature" stroke="#ef4444" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {seasonalRecommendations.map((season, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg border ${
              season.season === bestSeason.season ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center mb-2">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: getSeasonColor(season.season) }}
              ></div>
              <h5 className="font-semibold">{season.season}</h5>
              {season.season === bestSeason.season && (
                <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                  Best Time
                </span>
              )}
            </div>
            <div className="flex items-center mb-2">
              <div className="text-lg font-semibold">{season.score.toFixed(1)}/10</div>
              <div className="ml-2 flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg 
                    key={i} 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 ${i < Math.round(season.score / 2) ? 'text-yellow-500' : 'text-gray-300'}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <ul className="text-sm space-y-1">
              {season.highlights.map((highlight, i) => (
                <li key={i} className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// Activities Tab Content
interface ActivitiesTabProps {
  activityDistribution: ActivityDistribution[];
}

function ActivitiesTab({ activityDistribution }: ActivitiesTabProps) {
  const topActivity = [...activityDistribution].sort((a, b) => b.value - a.value)[0];
  
  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">Activity Breakdown</h4>
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={activityDistribution}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {activityDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h5 className="font-semibold text-blue-800 mb-2">Activity Insights</h5>
        <p className="text-blue-700 mb-3">
          This destination is most known for <span className="font-semibold">{topActivity.name}</span> activities, 
          which make up {topActivity.value}% of all experiences enjoyed by travelers.
        </p>
        <h6 className="font-medium text-blue-800 mb-1">Recommended experiences:</h6>
        <ul className="text-blue-700 pl-5 list-disc">
          {activityDistribution.map((activity, index) => (
            <li key={index}>
              <strong>{activity.name}</strong>: {getActivityDescription(activity.name)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Helper function to get activity descriptions
function getActivityDescription(activityType: string): string {
  switch (activityType) {
    case 'Cultural':
      return 'Museum visits, historical sites, and local cultural experiences';
    case 'Museums & Culture':
      return 'World-class museums, art galleries, and historical landmarks';
    case 'Adventure':
      return 'Outdoor excursions, hiking, and adrenaline activities';
    case 'Relaxation':
      return 'Spa treatments, beach days, and leisure activities';
    case 'Culinary':
      return 'Food tours, cooking classes, and dining experiences';
    case 'Cuisine & Dining':
      return 'Local specialties, fine dining, and food markets';
    case 'Shopping':
      return 'Markets, boutiques, and commercial districts';
    case 'Architecture & Landmarks':
      return 'Iconic buildings, monuments, and urban landscapes';
    case 'Urban Exploration':
      return 'Neighborhood tours, city walks, and local hotspots';
    case 'Entertainment':
      return 'Shows, performances, and nightlife';
    case 'Beaches & Water Sports':
      return 'Beach activities, swimming, snorkeling, and water sports';
    case 'Traditional Culture':
      return 'Local traditions, ceremonies, and authentic cultural experiences';
    case 'Technology & Modern Culture':
      return 'Cutting-edge attractions, innovative experiences, and modern cultural sites';
    case 'Nature & Hiking':
      return 'Parks, trails, gardens, and natural attractions';
    case 'Wellness & Spa':
      return 'Relaxation retreats, spa treatments, and wellness activities';
    case 'Nightlife':
      return 'Bars, clubs, and evening entertainment';
    case 'Historical Sites':
      return 'Ancient ruins, historical buildings, and heritage sites';
    case 'Religious Sites':
      return 'Churches, temples, mosques, and spiritual landmarks';
    case 'Art & Museums':
      return 'Art galleries, exhibitions, and museum collections';
    default:
      return 'Various locally recommended activities and experiences';
  }
}