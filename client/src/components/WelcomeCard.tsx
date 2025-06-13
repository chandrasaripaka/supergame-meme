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
    {
      text: "Plan a weekend in New York",
      demographic: "Urban Explorer",
      description: "Discover museums, Broadway shows, and hidden gems in the city that never sleeps"
    },
    {
      text: "Family trip to Disney World with kids under 10",
      demographic: "Family Traveler",
      description: "Create magical memories with age-appropriate attractions and dining experiences"
    },
    {
      text: "Romantic getaway under $1000 for couples",
      demographic: "Couples",
      description: "Intimate escapes with wine tastings, spa treatments, and scenic views"
    },
    {
      text: "Solo backpacking adventure through Southeast Asia",
      demographic: "Solo Adventurer",
      description: "Budget-friendly hostels, street food tours, and cultural immersion experiences"
    },
    {
      text: "Luxury spa retreat for seniors in Tuscany",
      demographic: "Luxury Traveler",
      description: "Peaceful countryside, wellness treatments, and fine dining experiences"
    },
    {
      text: "Adventure sports weekend in Colorado",
      demographic: "Thrill Seeker",
      description: "Rock climbing, white-water rafting, and mountain biking adventures"
    }
  ];
  
  return (
    <div className="mb-8 space-y-6">
      <div className="card-glass rounded-xl shadow-2xl p-6 mx-4 pulse-glow text-center">
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your AI Travel Concierge</h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">Tell me where you want to go, your budget, interests, and travel dates. I'll help you create the perfect trip tailored just for you!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="card-glass rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
          >
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                {index === 0 && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                )}
                {index === 1 && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                )}
                {index === 2 && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                  </svg>
                )}
                {index === 3 && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                )}
                {index === 4 && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                )}
                {index === 5 && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{suggestion.demographic}</h3>
              <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all duration-200 group-hover:scale-105">
              {suggestion.text}
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center mx-4">
        <Link href="/packing-list" className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-lg text-base font-medium shadow-lg transition-all duration-200 transform hover:scale-105">
          <Luggage className="h-5 w-5" />
          Create Packing List
        </Link>
      </div>
    </div>
  );
}