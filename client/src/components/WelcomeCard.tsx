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
      description: "Discover museums, Broadway shows, and hidden gems in the city that never sleeps",
      context: "destination:New York, duration:weekend, interests:museums,broadway,culture"
    },
    {
      text: "Family trip to Disney World with kids under 10",
      demographic: "Family Traveler", 
      description: "Create magical memories with age-appropriate attractions and dining experiences",
      context: "destination:Orlando, travelers:family_with_kids, age_range:under_10, interests:theme_parks,family_activities"
    },
    {
      text: "Romantic getaway under $1000 for couples",
      demographic: "Couples",
      description: "Intimate escapes with wine tastings, spa treatments, and scenic views",
      context: "budget:under_1000, travelers:2, interests:romance,wine,spa,scenic_views"
    },
    {
      text: "Solo backpacking adventure through Southeast Asia",
      demographic: "Solo Adventurer",
      description: "Budget-friendly hostels, street food tours, and cultural immersion experiences",
      context: "travelers:1, style:backpacking, region:southeast_asia, budget:budget_friendly, interests:culture,food,hostels"
    },
    {
      text: "Luxury spa retreat for seniors in Tuscany",
      demographic: "Luxury Traveler",
      description: "Peaceful countryside, wellness treatments, and fine dining experiences",
      context: "destination:Tuscany, style:luxury, interests:spa,wellness,fine_dining, age_group:seniors"
    },
    {
      text: "Adventure sports weekend in Colorado",
      demographic: "Thrill Seeker",
      description: "Rock climbing, white-water rafting, and mountain biking adventures",
      context: "destination:Colorado, duration:weekend, interests:adventure_sports,rock_climbing,rafting,mountain_biking"
    },
    {
      text: "Business trip to Tokyo with cultural experiences",
      demographic: "Business Traveler",
      description: "Combine work with authentic Japanese culture, temples, and cuisine",
      context: "destination:Tokyo, purpose:business, interests:culture,temples,cuisine,authentic_experiences"
    },
    {
      text: "European train journey across 5 countries",
      demographic: "Rail Enthusiast",
      description: "Scenic routes through Europe with historic cities and countryside views",
      context: "region:Europe, transport:train, countries:5, interests:scenic_routes,historic_cities,countryside"
    },
    {
      text: "Beach holiday in Maldives for honeymoon",
      demographic: "Honeymooners",
      description: "Private villas, crystal waters, and romantic sunset dinners",
      context: "destination:Maldives, purpose:honeymoon, style:luxury, interests:beaches,private_villas,romantic_dining"
    },
    {
      text: "Photography tour of Iceland's natural wonders",
      demographic: "Photographers",
      description: "Capture Northern Lights, waterfalls, and dramatic landscapes",
      context: "destination:Iceland, purpose:photography, interests:northern_lights,waterfalls,landscapes,nature"
    },
    {
      text: "Food and wine tour through France",
      demographic: "Food Enthusiasts",
      description: "Vineyard visits, cooking classes, and Michelin-starred restaurants",
      context: "destination:France, interests:food,wine,cooking_classes,michelin_restaurants,vineyards"
    },
    {
      text: "Budget backpacking through Central America",
      demographic: "Budget Backpackers",
      description: "Hostels, local transport, and authentic cultural experiences",
      context: "region:Central_America, style:backpacking, budget:budget, interests:culture,authentic_experiences,hostels"
    }
  ];
  
  return (
    <div className="mb-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            onClick={() => onSuggestionClick(`${suggestion.text} [Context: ${suggestion.context}]`)}
            className="card-glass rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
          >
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                {suggestion.demographic === "Urban Explorer" && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                )}
                {suggestion.demographic === "Family Traveler" && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.5 7h-5c-.8 0-1.5.7-1.5 1.5v6c0 .8.7 1.5 1.5 1.5H16v6h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zm1.5 1h-2c-.83 0-1.5.67-1.5 1.5v6h2V22h2v-2.5h2v-6c0-.83-.67-1.5-1.5-1.5z"/>
                  </svg>
                )}
                {suggestion.demographic === "Couples" && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                )}
                {suggestion.demographic === "Solo Adventurer" && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                )}
                {suggestion.demographic === "Luxury Traveler" && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-2V2.5C17 2.22 16.78 2 16.5 2h-9C7.22 2 7 2.22 7 2.5V4H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4 2V3h-2v3H9V3H7v3h10z"/>
                  </svg>
                )}
                {suggestion.demographic === "Thrill Seeker" && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                )}
                {suggestion.demographic === "Business Traveler" && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 6V4h-4v2h4zM4 8v11h16V8H4zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2l.01-11c0-1.11.88-2 1.99-2h4V4c0-1.11.89-2 2-2h4c1.11 0 2 .89 2 2v2h4z"/>
                  </svg>
                )}
                {suggestion.demographic === "Rail Enthusiast" && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8 1.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7H6V5h12v5z"/>
                  </svg>
                )}
                {suggestion.demographic === "Honeymooners" && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                )}
                {suggestion.demographic === "Photographers" && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15.5c1.93 0 3.5-1.57 3.5-3.5S13.93 8.5 12 8.5 8.5 10.07 8.5 12s1.57 3.5 3.5 3.5zM17.5 9c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
                  </svg>
                )}
                {suggestion.demographic === "Food Enthusiasts" && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
                  </svg>
                )}
                {suggestion.demographic === "Budget Backpackers" && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 8h-3V6c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10h20V10c0-1.1-.9-2-2-2zM9 6h6v2H9V6z"/>
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