import React, { useState } from 'react';
import { ItineraryDay } from '@/types';

interface ItineraryTimelineProps {
  days: ItineraryDay[];
  showAll?: boolean;
}

export function ItineraryTimeline({ days, showAll = false }: ItineraryTimelineProps) {
  const [expanded, setExpanded] = useState(showAll);
  
  // If not expanded, only show first 2 days
  const displayDays = expanded ? days : days.slice(0, 2);
  
  return (
    <div className="mb-4">
      <h3 className="font-semibold text-gray-800 mb-2">{days.length}-Day Itinerary</h3>
      <div className="itinerary-timeline relative pl-10 space-y-4">
        {displayDays.map((day) => (
          <div key={day.day} className="pb-2">
            <div className="absolute left-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
              <span>{day.day}</span>
            </div>
            <h4 className="font-medium text-gray-800">Day {day.day}: {day.title}</h4>
            <ul className="mt-1 space-y-1 text-sm text-gray-600">
              {day.activities.map((activity, index) => (
                <li key={index} className="flex items-start">
                  {activity.type === 'accommodation' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-1 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )}
                  {activity.type === 'food' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-1 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                  {activity.type === 'activity' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-1 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {activity.type === 'transportation' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-1 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  )}
                  <span>{activity.description} (${activity.cost})</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {days.length > 2 && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-primary hover:text-blue-700 text-sm font-medium flex items-center"
        >
          {expanded ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Hide full itinerary
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              View full itinerary
            </>
          )}
        </button>
      )}
    </div>
  );
}
