import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  DestinationStatistics, DestinationRating, DestinationExpense, 
  VisitorData, ActivityDistribution, SeasonalRecommendation 
} from '@/types/destination-stats';

interface DestinationStatsProps {
  statistics: DestinationStatistics | null | undefined;
  isLoading?: boolean;
}

export function DestinationStats({ statistics, isLoading = false }: DestinationStatsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (isLoading) {
    return <DestinationStatsLoading />;
  }
  
  if (!statistics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Destination Analysis</h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No statistics available for this destination.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="p-6 pb-0">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-4">
          Destination Analysis
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Data-driven insights to help you plan your perfect trip to {statistics.destination}.
        </p>
      </div>
      
      {/* Tab navigation */}
      <div className="flex overflow-x-auto border-b border-gray-200 px-6">
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
          label="Expenses"
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
      
      {/* Tab content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <OverviewTab ratings={statistics.ratings} visitorData={statistics.visitorData} />
        )}
        {activeTab === 'expenses' && (
          <ExpensesTab expenses={statistics.expenses} />
        )}
        {activeTab === 'season' && (
          <SeasonTab seasonalRecommendations={statistics.seasonalRecommendations} visitorData={statistics.visitorData} />
        )}
        {activeTab === 'activities' && (
          <ActivitiesTab activityDistribution={statistics.activityDistribution} />
        )}
      </div>
    </div>
  );
}

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}

function TabButton({ isActive, onClick, label, icon }: TabButtonProps) {
  return (
    <button
      className={`px-4 py-2 font-medium text-sm flex items-center whitespace-nowrap ${
        isActive 
          ? 'text-blue-600 border-b-2 border-blue-600' 
          : 'text-gray-500 hover:text-gray-700'
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

interface OverviewTabProps {
  ratings: DestinationRating[];
  visitorData: VisitorData[];
}

function OverviewTab({ ratings, visitorData }: OverviewTabProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Destination Ratings</h3>
        <p className="text-sm text-gray-600 mb-4">
          How this destination rates across key categories compared to global averages.
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ratings}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 10]} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}/10`, 'Rating']}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Legend />
              <Bar name="Destination Rating" dataKey="score" fill="#8884d8" />
              <Bar name="Global Average" dataKey="average" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Visitor Trends</h3>
        <p className="text-sm text-gray-600 mb-4">
          Visitor numbers and temperature throughout the year to help you plan the best time to visit.
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={visitorData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="visitors" name="Visitors (thousands)" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="temperature" name="Avg. Temperature (°C)" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

interface ExpensesTabProps {
  expenses: DestinationExpense[];
}

function ExpensesTab({ expenses }: ExpensesTabProps) {
  // Calculate totals for budget cards
  const totalDailyExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const accommodation = expenses.find(e => e.category === 'Accommodation')?.amount || 0;
  const food = expenses.find(e => e.category === 'Food')?.amount || 0;
  const transportation = expenses.find(e => e.category === 'Transportation')?.amount || 0;
  
  return (
    <div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <BudgetCard 
          title="Daily Total" 
          amount={totalDailyExpense} 
          description="Average daily expense per person"
          color="from-blue-500 to-indigo-600"
        />
        <BudgetCard 
          title="Accommodation" 
          amount={accommodation} 
          description="Average nightly cost"
          color="from-green-500 to-green-600"
        />
        <BudgetCard 
          title="Food" 
          amount={food} 
          description="Daily food budget"
          color="from-yellow-500 to-orange-500"
        />
        <BudgetCard 
          title="Transportation" 
          amount={transportation} 
          description="Daily local transport"
          color="from-red-500 to-pink-500"
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Breakdown by Category</h3>
        <p className="text-sm text-gray-600 mb-4">
          Breakdown of expenses by category to help you budget effectively.
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={expenses}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Daily Cost']}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Legend />
              <Bar dataKey="amount" name="USD per day" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

interface BudgetCardProps {
  title: string;
  amount: number;
  description: string;
  color: string;
}

function BudgetCard({ title, amount, description, color }: BudgetCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      <div className={`h-2 bg-gradient-to-r ${color}`}></div>
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <div className="mt-2 mb-1">
          <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
          <span className="text-xs text-gray-500 ml-1">USD</span>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

interface SeasonTabProps {
  seasonalRecommendations: SeasonalRecommendation[];
  visitorData: VisitorData[];
}

function SeasonTab({ seasonalRecommendations, visitorData }: SeasonTabProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  return (
    <div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Best Seasons to Visit</h3>
        <p className="text-sm text-gray-600 mb-4">
          Seasonal scores based on weather, crowds, and special events.
        </p>
        <div className="h-80 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={seasonalRecommendations}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="season" />
              <YAxis domain={[0, 10]} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}/10`, 'Recommendation Score']}
                labelFormatter={(label) => `Season: ${label}`}
              />
              <Legend />
              <Bar dataKey="score" name="Recommendation Score" fill="#8884d8">
                {seasonalRecommendations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {seasonalRecommendations.map((season, index) => (
          <div 
            key={season.season} 
            className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm"
          >
            <h4 className="text-md font-semibold flex items-center">
              <span 
                className="h-3 w-3 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              {season.season} <span className="text-sm text-gray-500 ml-2">({season.score.toFixed(1)}/10)</span>
            </h4>
            <div className="mt-2">
              <div className="text-sm text-gray-600">Highlights:</div>
              <ul className="mt-1 ml-5 text-sm text-gray-600 list-disc">
                {season.highlights.map((highlight, i) => (
                  <li key={i}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

interface ActivitiesTabProps {
  activityDistribution: ActivityDistribution[];
}

function ActivitiesTab({ activityDistribution }: ActivitiesTabProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Activities Distribution</h3>
        <p className="text-sm text-gray-600 mb-4">
          Breakdown of popular activities by category at this destination.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {activityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, 'Percentage']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-3">Popular Activities by Category</h4>
            <div className="space-y-4">
              {activityDistribution.map((activity, index) => (
                <div key={activity.name} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <span 
                      className="h-3 w-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <h5 className="font-medium">{activity.name}</h5>
                    <span className="ml-auto text-sm text-gray-500">{(activity.value * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {getActivityDescription(activity.name)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function getActivityDescription(activityType: string): string {
  const descriptions: Record<string, string> = {
    'Cultural': 'Museums, historical sites, and cultural experiences that showcase local heritage.',
    'Adventure': 'Outdoor activities like hiking, water sports, and adrenaline-pumping experiences.',
    'Relaxation': 'Spa visits, beach days, and leisurely activities for unwinding.',
    'Culinary': 'Food tours, cooking classes, and unique dining experiences.',
    'Entertainment': 'Shows, festivals, and nightlife activities.',
    'Shopping': 'Markets, boutiques, and shopping districts for souvenirs and local goods.',
    'Nature': 'Parks, gardens, and wildlife experiences in natural settings.',
    'Educational': 'Workshops, guided tours, and learning experiences.',
    'Family': 'Kid-friendly attractions and activities suitable for all ages.',
    'Wellness': 'Yoga retreats, fitness activities, and health-focused experiences.'
  };
  
  return descriptions[activityType] || 'Various activities and experiences in this category.';
}

function DestinationStatsLoading() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
      
      <div className="flex space-x-4 mb-6">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
      
      <div className="h-80 bg-gray-100 rounded mb-6"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      
      <div className="h-80 bg-gray-100 rounded"></div>
    </div>
  );
}