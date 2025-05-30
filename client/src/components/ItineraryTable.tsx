import React from 'react';
import { ItineraryDay, Activity } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useMobile } from '@/hooks/use-mobile';

// Define custom type icons for different activity types
const ActivityTypeIcons = {
  accommodation: '🏨',
  food: '🍽️',
  activity: '🏄‍♂️',
  transportation: '🚗',
  default: '📍'
};

interface ItineraryTableProps {
  days: ItineraryDay[];
}

export function ItineraryTable({ days }: ItineraryTableProps) {
  const { isMobile } = useMobile();
  
  if (!days || days.length === 0) {
    return <div className="text-gray-500 text-center p-4">No itinerary data available</div>;
  }

  // Prepare data for Budget Distribution chart
  const budgetByDay = days.map((day, index) => {
    const dayTotal = day.activities.reduce((sum, activity) => sum + activity.cost, 0);
    return {
      name: `Day ${day.day}`,
      value: dayTotal,
      fill: `hsl(${210 + (index * 30) % 360}, 70%, 60%)`,
    };
  });

  // Prepare data for Activity Types chart
  const activityCostsByType = days.reduce((acc, day) => {
    day.activities.forEach(activity => {
      if (!acc[activity.type]) {
        acc[activity.type] = 0;
      }
      acc[activity.type] += activity.cost;
    });
    return acc;
  }, {} as Record<string, number>);

  const activityTypesData = Object.entries(activityCostsByType).map(([type, cost], index) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: cost,
    fill: `hsl(${180 + (index * 60) % 360}, 70%, 50%)`,
  }));

  // Define colors for the charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="itinerary-table mb-8">
      <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 mb-6">
        {/* Budget Distribution Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">Budget by Day</h3>
          <div className={isMobile ? "h-48" : "h-64"}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetByDay}
                margin={isMobile ? 
                  { top: 5, right: 10, left: 0, bottom: 5 } : 
                  { top: 5, right: 30, left: 20, bottom: 5 }
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickFormatter={isMobile && budgetByDay.length > 5 ? 
                    (value) => value.replace('Day ', 'D') : 
                    undefined}
                />
                <YAxis 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  width={isMobile ? 30 : 40}
                />
                <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                <Legend wrapperStyle={isMobile ? { fontSize: '10px' } : undefined} />
                <Bar dataKey="value" name="Daily Cost">
                  {budgetByDay.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Types Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">Budget by Activity Type</h3>
          <div className={isMobile ? "h-48" : "h-64"}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={!isMobile}
                  outerRadius={isMobile ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                  label={isMobile ? 
                    undefined : 
                    ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {activityTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                <Legend wrapperStyle={isMobile ? { fontSize: '10px' } : undefined} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Day-by-day Itinerary */}
      {days.map((day) => (
        <div key={day.day} className="mb-8">
          <h3 className="text-xl font-bold mt-8 mb-4 pl-2 flex items-center bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text border-l-4 border-primary py-1">
            Day {day.day}: {day.title}
          </h3>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Type</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Details</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {day.activities.map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">
                          {ActivityTypeIcons[activity.type as keyof typeof ActivityTypeIcons] || ActivityTypeIcons.default}
                        </span>
                        <span className="capitalize">{activity.type}</span>
                      </div>
                    </td>
                    <td className="whitespace-pre-wrap px-3 py-4 text-sm text-gray-500">
                      {activity.description}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {activity.cost > 0 ? `$${activity.cost}` : 'Free'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {day.activities.map((activity, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="mr-2 text-lg">
                      {ActivityTypeIcons[activity.type as keyof typeof ActivityTypeIcons] || ActivityTypeIcons.default}
                    </span>
                    <span className="capitalize font-medium text-gray-900">{activity.type}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {activity.cost > 0 ? `$${activity.cost}` : 'Free'}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Day Total */}
          <div className="mt-4 bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Day {day.day} Total</span>
              <span className="text-lg font-semibold text-primary">
                ${day.activities.reduce((sum, activity) => sum + activity.cost, 0)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}