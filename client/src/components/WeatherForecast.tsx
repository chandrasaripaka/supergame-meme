import React, { useState } from 'react';
import { Weather } from '@/types';
import { WeatherWidget } from './WeatherWidget';
import { motion, AnimatePresence } from 'framer-motion';

interface WeatherForecastProps {
  weather: Weather | null;
  isLoading: boolean;
}

export function WeatherForecast({ weather, isLoading }: WeatherForecastProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse"
      >
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!weather) {
    return null;
  }
  
  // Use our enhanced WeatherWidget for current weather
  const currentWeather = (
    <div className="mb-5">
      <WeatherWidget weather={weather} isLoading={false} />
    </div>
  );

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

  // Function to get temperature color class
  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return 'text-blue-600';
    if (temp < 10) return 'text-blue-500';
    if (temp < 20) return 'text-green-500';
    if (temp < 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h3 
        className="text-xl font-bold mb-4 pl-2 flex items-center bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text border-l-4 border-blue-500 py-1"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span 
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mr-2"
        >
          🌤️
        </motion.span> 
        Weather Forecast for {weather.location.name}, {weather.location.country}
      </motion.h3>

      {/* Use the new animated WeatherWidget */}
      {currentWeather}

      {/* Forecast Section Title */}
      <motion.div 
        className="flex items-center justify-between mb-4"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="text-lg font-semibold text-gray-800">3-Day Forecast</h4>
        <motion.div 
          className="text-sm text-blue-600 cursor-pointer flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsHovering(!isHovering)}
        >
          <span>View as {isHovering ? "Cards" : "Timeline"}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Forecast */}
      {weather.forecast && weather.forecast.forecastday && (
        <AnimatePresence>
          {isHovering ? (
            <motion.div 
              key="timeline"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg shadow-md border border-blue-100 p-5 mb-4"
            >
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-0 w-1 h-full bg-blue-200 rounded-full"></div>
                
                {/* Timeline items */}
                {weather.forecast.forecastday.map((day, index) => (
                  <motion.div 
                    key={index}
                    className="ml-6 mb-6 last:mb-0 relative"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Timeline dot */}
                    <motion.div 
                      className="absolute left-[-1.625rem] w-5 h-5 bg-blue-500 rounded-full border-4 border-white"
                      whileHover={{ scale: 1.2 }}
                    ></motion.div>
                    
                    <div className="flex flex-col md:flex-row bg-white/70 backdrop-blur-sm p-3 rounded-lg">
                      <div className="md:w-40 mb-2 md:mb-0">
                        <h5 className="font-semibold">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </h5>
                        <p className="text-sm text-gray-500">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="flex-grow flex flex-wrap items-center">
                        <div className="flex items-center mr-6 mb-2 md:mb-0">
                          <img src={day.day.condition.icon} alt={day.day.condition.text} className="w-10 h-10" />
                          <span className="ml-2 text-gray-700">{day.day.condition.text}</span>
                        </div>
                        
                        <div className="flex space-x-6">
                          <div>
                            <span className="text-xs text-gray-500">High</span>
                            <div className={`font-semibold ${getTemperatureColor(day.day.maxtemp_c)}`}>
                              {Math.round(day.day.maxtemp_c)}°C
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-xs text-gray-500">Low</span>
                            <div className={`font-semibold ${getTemperatureColor(day.day.mintemp_c)}`}>
                              {Math.round(day.day.mintemp_c)}°C
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {weather.forecast.forecastday.map((day, index) => (
                <motion.div 
                  key={index} 
                  className={`bg-white rounded-lg shadow-sm border ${
                    selectedDay === index ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200'
                  } p-4 relative overflow-hidden cursor-pointer`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)" 
                  }}
                  onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                >
                  {/* Weather condition specific background effect */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                    {day.day.condition.text.toLowerCase().includes('rain') && (
                      <motion.div
                        initial={{ y: -100 }}
                        animate={{ y: 500 }}
                        transition={{ duration: 10, repeat: Infinity, repeatType: "loop" }}
                        className="absolute top-0 left-0 w-full h-full"
                      >
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div 
                            key={i}
                            className="absolute bg-blue-400 opacity-30"
                            style={{
                              width: '1px',
                              height: '10px',
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                              animationDelay: `${Math.random() * 2}s`
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                    {day.day.condition.text.toLowerCase().includes('cloud') && (
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-transparent" />
                    )}
                    {day.day.condition.text.toLowerCase().includes('sunny') && (
                      <motion.div 
                        className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-yellow-300 rounded-full opacity-20"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                    )}
                  </div>
                  
                  <div className="text-center mb-2 text-sm text-gray-500">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <motion.div
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <img 
                        src={day.day.condition.icon} 
                        alt={day.day.condition.text} 
                        className="h-16 w-16 object-contain" 
                      />
                    </motion.div>
                  </div>
                  
                  <div className="text-center mt-3">
                    <div className="flex justify-center items-center space-x-4">
                      <motion.div 
                        className={`text-lg font-semibold ${getTemperatureColor(day.day.maxtemp_c)}`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {Math.round(day.day.maxtemp_c)}°
                      </motion.div>
                      <div className="text-gray-400 text-xs">|</div>
                      <motion.div 
                        className={`text-lg font-semibold ${getTemperatureColor(day.day.mintemp_c)}`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {Math.round(day.day.mintemp_c)}°
                      </motion.div>
                    </div>
                    <div className="mt-1 text-gray-600">{day.day.condition.text}</div>
                  </div>
                  
                  {/* Expanded details when card is selected */}
                  <AnimatePresence>
                    {selectedDay === index && (
                      <motion.div 
                        className="mt-4 pt-4 border-t border-gray-100"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Humidity</div>
                            <div className="font-medium">{day.day.avghumidity}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">UV Index</div>
                            <div className="font-medium">{day.day.uv}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Chance of Rain</div>
                            <div className="font-medium">{day.day.daily_chance_of_rain}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Max Wind</div>
                            <div className="font-medium">{day.day.maxwind_mph} mph</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}