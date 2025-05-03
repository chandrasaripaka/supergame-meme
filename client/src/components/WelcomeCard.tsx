import React from 'react';

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
    <div className="mb-8 bg-gradient-to-r from-primary to-blue-500 rounded-lg shadow-md p-6 text-white">
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex-1 mb-4 md:mb-0 md:mr-6">
          <h2 className="text-2xl font-bold mb-2">Your AI Travel Concierge</h2>
          <p className="mb-4">Tell me where you want to go, your budget, interests, and travel dates. I'll help you create the perfect trip!</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button 
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-sm backdrop-blur-sm transition"
              >
                "{suggestion}"
              </button>
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/3 flex justify-center">
          <img 
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
            alt="Travel inspiration" 
            className="rounded-lg w-full max-w-xs h-auto object-cover" 
            width="400" 
            height="267"
          />
        </div>
      </div>
    </div>
  );
}
