import React from 'react';
import { Attraction } from '@/types';

interface AttractionCardsProps {
  attractions: Attraction[];
  isLoading: boolean;
}

export function AttractionCards({ attractions, isLoading }: AttractionCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-3">
        <h4 className="font-medium text-gray-800 mb-2">Must-See Attractions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-md overflow-hidden shadow-sm border border-gray-200 animate-pulse">
              <div className="w-full h-24 bg-gray-300"></div>
              <div className="p-2">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!attractions || attractions.length === 0) {
    return null;
  }

  // Helper function to render star ratings
  const renderStars = (rating: string) => {
    const ratingNum = parseFloat(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingNum) {
        // Full star
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i - 0.5 <= ratingNum) {
        // Half star
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      } else {
        // Empty star
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      }
    }
    
    return (
      <div className="flex items-center text-xs">
        {stars}
        <span className="ml-1 text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="mb-3">
      <h4 className="font-medium text-gray-800 mb-2">Must-See Attractions</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {attractions.slice(0, 3).map((attraction) => (
          <div key={attraction.id} className="rounded-md overflow-hidden shadow-sm border border-gray-200">
            <img 
              src={attraction.imageUrl} 
              alt={attraction.name} 
              className="w-full h-24 object-cover"
              width="200"
              height="96"
            />
            <div className="p-2">
              <h5 className="font-medium text-sm">{attraction.name}</h5>
              {renderStars(attraction.rating)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
