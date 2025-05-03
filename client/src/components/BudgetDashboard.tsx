import React from 'react';
import { BudgetBreakdown as BudgetType } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useMobile } from '@/hooks/use-mobile';

interface BudgetDashboardProps {
  budget: number;
  budgetBreakdown: BudgetType;
  remainingBudget: number;
}

export function BudgetDashboard({ budget, budgetBreakdown, remainingBudget }: BudgetDashboardProps) {
  const { isMobile } = useMobile();
  
  // Format the budget breakdown for charts
  const pieChartData = [
    { name: 'Accommodation', value: budgetBreakdown.accommodation, color: '#0088FE' },
    { name: 'Food', value: budgetBreakdown.food, color: '#00C49F' },
    { name: 'Activities', value: budgetBreakdown.activities, color: '#FFBB28' },
    { name: 'Transportation', value: budgetBreakdown.transportation, color: '#FF8042' },
    { name: 'Miscellaneous', value: budgetBreakdown.miscellaneous, color: '#8884d8' },
    { name: 'Remaining', value: remainingBudget, color: '#82ca9d' }
  ];

  const barChartData = pieChartData.filter(item => item.name !== 'Remaining');

  // Calculate percentages
  const spentBudget = budget - remainingBudget;
  const spentPercentage = Math.round((spentBudget / budget) * 100);
  const remainingPercentage = 100 - spentPercentage;

  return (
    <div className="budget-dashboard mb-8">
      <h3 className="text-xl font-bold mb-4 pl-2 flex items-center bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text border-l-4 border-green-500 py-1">
        🧮 Budget Overview
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Budget Summary Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
          <div className="text-center mb-4">
            <h4 className="text-gray-700 text-sm font-medium uppercase tracking-wide">Total Budget</h4>
            <div className="mt-1 text-3xl font-extrabold text-gray-900">${budget}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-green-50 rounded-lg p-3">
              <h5 className="text-green-800 text-sm font-medium">Remaining</h5>
              <div className="mt-1 text-xl font-bold text-green-600">${remainingBudget}</div>
              <div className="text-xs text-green-700">{remainingPercentage}% of budget</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <h5 className="text-blue-800 text-sm font-medium">Spent</h5>
              <div className="mt-1 text-xl font-bold text-blue-600">${spentBudget}</div>
              <div className="text-xs text-blue-700">{spentPercentage}% of budget</div>
            </div>
          </div>

          {/* Budget Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-1 text-xs">
              <span className="text-blue-600 font-medium">Spent (${spentBudget})</span>
              <span className="text-green-600 font-medium">Remaining (${remainingBudget})</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${spentPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Budget Pie Chart */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
          <h4 className="text-gray-700 text-sm font-medium uppercase tracking-wide text-center mb-4">Budget Distribution</h4>
          <div className={isMobile ? "h-48" : "h-64"}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
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
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Legend 
                  wrapperStyle={isMobile ? { fontSize: '10px' } : undefined}
                  layout={isMobile ? "horizontal" : "vertical"}
                  verticalAlign={isMobile ? "bottom" : "middle"}
                  align={isMobile ? "center" : "right"}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget Breakdown Bar Chart */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-6">
        <h4 className="text-gray-700 text-sm font-medium uppercase tracking-wide text-center mb-4">Expense Categories</h4>
        <div className={isMobile ? "h-48" : "h-64"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={isMobile ? 
                { top: 5, right: 10, left: 0, bottom: 5 } : 
                { top: 5, right: 30, left: 20, bottom: 5 }
              }
              layout={isMobile ? "vertical" : "horizontal"}
            >
              <CartesianGrid strokeDasharray="3 3" />
              {isMobile ? (
                <>
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 10 }}
                    width={70}
                  />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 10 }}
                    height={30}
                  />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" />
                  <YAxis />
                </>
              )}
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              <Legend wrapperStyle={isMobile ? { fontSize: '10px' } : undefined} />
              <Bar dataKey="value" name="Amount">
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Breakdown Table - Desktop */}
      <div className="hidden md:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Category</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Percentage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Object.entries(budgetBreakdown).map(([category, amount]) => (
              <tr key={category} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 capitalize">
                  {category}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  ${amount}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {Math.round((amount / budget) * 100)}%
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-green-700 sm:pl-6">
                Remaining Budget
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-green-700">
                ${remainingBudget}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-green-700">
                {remainingPercentage}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Budget Breakdown Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {Object.entries(budgetBreakdown).map(([category, amount]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-gray-900 font-medium capitalize">{category}</h5>
                <span className="text-lg font-semibold text-primary">${amount}</span>
              </div>
              <div className="flex items-center">
                <div className="flex-grow">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.round((amount / budget) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="ml-2 text-sm text-gray-600">{Math.round((amount / budget) * 100)}%</span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Remaining Budget Card - Mobile */}
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-green-800 font-medium">Remaining Budget</h5>
              <span className="text-lg font-semibold text-green-600">${remainingBudget}</span>
            </div>
            <div className="flex items-center">
              <div className="flex-grow">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${remainingPercentage}%` }}
                  />
                </div>
              </div>
              <span className="ml-2 text-sm text-green-700">{remainingPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}