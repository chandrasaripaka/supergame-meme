import React from 'react';
import { Weather } from '@/types';

interface WeatherWidgetProps {
  weather: Weather | null;
  isLoading: boolean;
}

export function WeatherWidget({ weather, isLoading }: WeatherWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-blue-50 rounded-md p-3 mb-4 flex items-center animate-pulse">
        <div className="mr-3 h-10 w-10 bg-blue-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-blue-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-blue-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  // Determine the weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    } else if (conditionLower.includes('snow')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    }
  };

  return (
    <div className="bg-blue-50 rounded-md p-3 mb-4 flex items-center">
      <div className="mr-3 text-blue-500">
        {getWeatherIcon(weather.current.condition.text)}
      </div>
      <div>
        <h4 className="font-medium text-gray-800">Current Weather in {weather.location.name}</h4>
        <div className="flex items-center">
          <span className="text-2xl font-semibold mr-1">{Math.round(weather.current.temp_c)}°C</span>
          <span className="text-gray-600 text-sm">{weather.current.condition.text}</span>
        </div>
      </div>
    </div>
  );
}
