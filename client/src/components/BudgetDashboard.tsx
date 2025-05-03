import React from 'react';
import { BudgetBreakdown as BudgetType } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface BudgetDashboardProps {
  budget: number;
  budgetBreakdown: BudgetType;
  remainingBudget: number;
}

export function BudgetDashboard({ budget, budgetBreakdown, remainingBudget }: BudgetDashboardProps) {
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
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget Breakdown Bar Chart */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-6">
        <h4 className="text-gray-700 text-sm font-medium uppercase tracking-wide text-center mb-4">Expense Categories</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              <Legend />
              <Bar dataKey="value" name="Amount">
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Breakdown Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
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
    </div>
  );
}