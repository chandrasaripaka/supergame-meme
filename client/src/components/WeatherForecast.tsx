import React from 'react';
import { Weather } from '@/types';

interface WeatherForecastProps {
  weather: Weather | null;
  isLoading: boolean;
}

export function WeatherForecast({ weather, isLoading }: WeatherForecastProps) {
  if (isLoading) {
    return (
      <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  // Helper function to get weather icon
  const getWeatherIcon = (condition: string) => {
    const conditionText = condition.toLowerCase();
    
    if (conditionText.includes('sunny') || conditionText.includes('clear')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    } else if (conditionText.includes('rain') || conditionText.includes('shower') || conditionText.includes('drizzle')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 18.5v.5M9 18.5v.5M17 18.5v.5" />
        </svg>
      );
    } else if (conditionText.includes('cloud') || conditionText.includes('overcast')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    } else if (conditionText.includes('snow') || conditionText.includes('blizzard') || conditionText.includes('sleet')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16l-1 6m-2-6l2 6m2-6l1 6" />
        </svg>
      );
    } else if (conditionText.includes('fog') || conditionText.includes('mist')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      );
    } else if (conditionText.includes('thunder') || conditionText.includes('lightning')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 8.5V10l2 1.5-2 1.5v1.5" />
        </svg>
      );
    }
    
    // Default icon
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    );
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4 pl-2 flex items-center bg-gradient-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text border-l-4 border-blue-500 py-1">
        🌤️ Weather Forecast for {weather.location.name}, {weather.location.country}
      </h3>

      {/* Current Weather */}
      <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg shadow-md border border-blue-100 p-6 mb-5">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            {getWeatherIcon(weather.current.condition.text)}
            <div className="ml-4">
              <div className="text-4xl font-bold text-gray-800">{weather.current.temp_c}°C</div>
              <div className="text-lg text-gray-600">{weather.current.condition.text}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-sm text-gray-500">Feels Like</div>
              <div className="text-xl font-semibold text-gray-800">{weather.current.feelslike_c}°C</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-sm text-gray-500">Humidity</div>
              <div className="text-xl font-semibold text-gray-800">{weather.current.humidity}%</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-sm text-gray-500">Wind</div>
              <div className="text-xl font-semibold text-gray-800">{weather.current.wind_mph} mph</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-sm text-gray-500">Temperature</div>
              <div className="text-xl font-semibold text-gray-800">{weather.current.temp_f}°F</div>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast */}
      {weather.forecast && weather.forecast.forecastday && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weather.forecast.forecastday.map((day, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-center mb-2 text-sm text-gray-500">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div className="flex items-center justify-center">
                {getWeatherIcon(day.day.condition.text)}
              </div>
              <div className="text-center mt-3">
                <div className="flex justify-center items-center space-x-2">
                  <span className="text-red-500 font-medium">{day.day.maxtemp_c}°C</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-blue-500 font-medium">{day.day.mintemp_c}°C</span>
                </div>
                <div className="mt-1 text-gray-600">{day.day.condition.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}