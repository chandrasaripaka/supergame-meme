import React from 'react';
import { Link } from 'wouter';
import { CheckSquare, Luggage } from 'lucide-react';

interface WelcomeCardProps {
  onSuggestionClick: (suggestion: string) => void;
  visible: boolean;
}

export function WelcomeCard({ onSuggestionClick, visible }: WelcomeCardProps) {
  if (!visible) return null;
  
  const suggestions = [
    "Plan a weekend in New York",
    "Family trip to Disney World",
    "Romantic getaway under $1000"
  ];
  
  return (
    <div className="mb-8 card-glass rounded-xl shadow-2xl p-6 mx-4 pulse-glow">
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex-1 mb-4 md:mb-0 md:mr-6">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your AI Travel Concierge</h2>
          <p className="mb-4 text-gray-700">Tell me where you want to go, your budget, interests, and travel dates. I'll help you create the perfect trip!</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((suggestion, index) => (
              <button 
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                "{suggestion}"
              </button>
            ))}
          </div>
          
          <div className="flex space-x-3">
            <Link href="/packing-list" className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg transition-all duration-200 transform hover:scale-105">
              <Luggage className="h-4 w-4" />
              Create Packing List
            </Link>
          </div>
        </div>
        <div className="w-full md:w-1/3 flex justify-center">
          <div className="floating-animation bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-6 shadow-2xl">
            <svg width="280" height="240" viewBox="0 0 280 240" fill="none" className="w-full h-auto">
              {/* Sky and clouds */}
              <rect width="280" height="120" fill="url(#skyGradient)"/>
              <circle cx="50" cy="30" r="20" fill="white" opacity="0.8"/>
              <circle cx="65" cy="25" r="15" fill="white" opacity="0.8"/>
              <circle cx="230" cy="40" r="18" fill="white" opacity="0.8"/>
              <circle cx="245" cy="35" r="12" fill="white" opacity="0.8"/>
              
              {/* Mountains */}
              <polygon points="0,120 80,60 160,120" fill="#4F46E5"/>
              <polygon points="120,120 200,70 280,120" fill="#7C3AED"/>
              
              {/* Airplane */}
              <g transform="translate(180,50)">
                <ellipse cx="0" cy="0" rx="25" ry="4" fill="white"/>
                <ellipse cx="-8" cy="-2" rx="8" ry="2" fill="white"/>
                <ellipse cx="-8" cy="2" rx="8" ry="2" fill="white"/>
                <circle cx="12" cy="0" r="2" fill="#EF4444"/>
              </g>
              
              {/* Ground and palm trees */}
              <rect x="0" y="120" width="280" height="120" fill="url(#groundGradient)"/>
              
              {/* Palm tree 1 */}
              <g transform="translate(40,140)">
                <rect x="-2" y="0" width="4" height="80" fill="#92400E"/>
                <ellipse cx="0" cy="-10" rx="25" ry="15" fill="#10B981"/>
                <ellipse cx="-20" cy="-5" rx="20" ry="10" fill="#10B981"/>
                <ellipse cx="20" cy="-5" rx="20" ry="10" fill="#10B981"/>
              </g>
              
              {/* Palm tree 2 */}
              <g transform="translate(220,130)">
                <rect x="-2" y="0" width="4" height="90" fill="#92400E"/>
                <ellipse cx="0" cy="-10" rx="30" ry="18" fill="#10B981"/>
                <ellipse cx="-25" cy="-5" rx="22" ry="12" fill="#10B981"/>
                <ellipse cx="25" cy="-5" rx="22" ry="12" fill="#10B981"/>
              </g>
              
              {/* Sun */}
              <circle cx="240" cy="30" r="20" fill="#FCD34D"/>
              <g transform="translate(240,30)">
                <line x1="-30" y1="0" x2="-35" y2="0" stroke="#FCD34D" strokeWidth="2"/>
                <line x1="30" y1="0" x2="35" y2="0" stroke="#FCD34D" strokeWidth="2"/>
                <line x1="0" y1="-30" x2="0" y2="-35" stroke="#FCD34D" strokeWidth="2"/>
                <line x1="0" y1="30" x2="0" y2="35" stroke="#FCD34D" strokeWidth="2"/>
              </g>
              
              <defs>
                <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA"/>
                  <stop offset="100%" stopColor="#93C5FD"/>
                </linearGradient>
                <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A"/>
                  <stop offset="100%" stopColor="#F59E0B"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
