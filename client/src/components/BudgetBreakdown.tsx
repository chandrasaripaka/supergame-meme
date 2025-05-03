import React from 'react';
import { BudgetBreakdown as BudgetType } from '@/types';

interface BudgetBreakdownProps {
  budget: number;
  budgetBreakdown: BudgetType;
  remainingBudget: number;
}

export function BudgetBreakdown({ budget, budgetBreakdown, remainingBudget }: BudgetBreakdownProps) {
  const categories = [
    { name: 'Accommodation', value: budgetBreakdown.accommodation },
    { name: 'Food & Drinks', value: budgetBreakdown.food },
    { name: 'Activities', value: budgetBreakdown.activities },
    { name: 'Transportation', value: budgetBreakdown.transportation },
    { name: 'Shopping/Misc', value: budgetBreakdown.miscellaneous },
  ];

  // Calculate percentage of budget used
  const usedBudget = budget - remainingBudget;
  const percentUsed = Math.round((usedBudget / budget) * 100);
  
  return (
    <div className="bg-green-50 rounded-md p-3 mb-4">
      <h4 className="font-medium text-gray-800 mb-1">Budget Breakdown</h4>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
        <div 
          className="bg-green-600 h-2.5 rounded-full" 
          style={{ width: `${percentUsed}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        {categories.map((category) => (
          <div key={category.name}>
            {category.name}: <span className="font-semibold">${category.value}</span>
          </div>
        ))}
        <div className="font-medium text-green-700">
          Remaining: <span className="font-semibold">${remainingBudget}</span>
        </div>
        <div className="font-medium">
          Total Budget: <span className="font-semibold">${budget}</span>
        </div>
      </div>
    </div>
  );
}
