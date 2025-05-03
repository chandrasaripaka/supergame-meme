import React, { useState, useEffect } from 'react';
import { Weather } from '@/types';
import { useMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

interface WeatherWidgetProps {
  weather: Weather | null;
  isLoading: boolean;
}

export function WeatherWidget({ weather, isLoading }: WeatherWidgetProps) {
  const { isMobile } = useMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Animate weather icon periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-50 rounded-md p-3 mb-4 flex items-center animate-pulse"
      >
        <div className="mr-3 h-10 w-10 bg-blue-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-blue-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-blue-200 rounded w-1/4"></div>
        </div>
      </motion.div>
    );
  }

  if (!weather) {
    return null;
  }
  
  // Get weather information
  const { temp_c, temp_f, humidity, wind_mph, feelslike_c, condition } = weather.current;
  const { name, country } = weather.location;
  const forecast = weather.forecast?.forecastday || [];

  // Get time of day (for animations)
  const now = new Date();
  const hours = now.getHours();
  const isDaytime = hours >= 6 && hours < 18;
  
  // Determine weather type
  const conditionText = condition.text.toLowerCase();
  const isSunny = conditionText.includes('sunny') || conditionText.includes('clear');
  const isCloudy = conditionText.includes('cloud') || conditionText.includes('overcast');
  const isRainy = conditionText.includes('rain') || conditionText.includes('drizzle');
  const isSnowy = conditionText.includes('snow');
  
  // Generate random particles for animations
  const generateParticles = (count: number, type: 'rain' | 'snow') => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: type === 'rain' ? 1 + Math.random() : 2 + Math.random() * 2,
      duration: 0.8 + Math.random() * 0.4
    }));
  };
  
  const raindrops = isRainy ? generateParticles(10, 'rain') : [];
  const snowflakes = isSnowy ? generateParticles(7, 'snow') : [];
  
  // Animated weather icons
  const renderAnimatedIcon = () => {
    if (isSunny) {
      return (
        <motion.div
          key={animationKey}
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ 
            scale: [0.8, 1, 0.8], 
            opacity: [0.7, 1, 0.7],
            rotate: isDaytime ? [0, 10, 0] : [0, -10, 0]
          }}
          transition={{ duration: 3, repeat: 0 }}
          className="relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {/* Sun rays */}
          <motion.div 
            className="absolute inset-0 opacity-30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </motion.div>
        </motion.div>
      );
    } else if (isCloudy) {
      return (
        <motion.div
          key={animationKey}
          className="relative"
          initial={{ x: -10 }}
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 6, repeat: 0 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          {/* Extra small cloud that moves */}
          <motion.div 
            className="absolute top-1 left-1"
            animate={{ x: [-5, 10, -5] }}
            transition={{ duration: 10, repeat: Infinity }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </motion.div>
        </motion.div>
      );
    } else if (isRainy) {
      return (
        <motion.div className="relative h-12 w-12 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          
          {/* Raindrops */}
          {raindrops.map((drop) => (
            <motion.div
              key={`raindrop-${drop.id}-${animationKey}`}
              className="absolute bg-blue-400 rounded-full opacity-70"
              style={{
                width: `${drop.size}px`,
                height: `${drop.size * 3}px`,
                left: `${drop.x}%`,
                top: `${drop.y}%`,
              }}
              initial={{ y: drop.y }}
              animate={{ y: 100 }}
              transition={{
                duration: drop.duration,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                delay: drop.id * 0.1
              }}
            />
          ))}
        </motion.div>
      );
    } else if (isSnowy) {
      return (
        <motion.div className="relative h-12 w-12 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          
          {/* Snowflakes */}
          {snowflakes.map((flake) => (
            <motion.div
              key={`snowflake-${flake.id}-${animationKey}`}
              className="absolute text-blue-100 text-opacity-90"
              style={{
                left: `${flake.x}%`,
                top: `${flake.y}%`,
                fontSize: `${flake.size * 3}px`
              }}
              initial={{ y: flake.y, rotate: 0 }}
              animate={{ 
                y: 100, 
                x: [`${flake.x}%`, `${flake.x + (Math.random() * 20 - 10)}%`, `${flake.x}%`],
                rotate: [0, 180, 360] 
              }}
              transition={{
                duration: flake.duration * 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                delay: flake.id * 0.2
              }}
            >
              ❄
            </motion.div>
          ))}
        </motion.div>
      );
    } else {
      return (
        <motion.div
          key={animationKey}
          initial={{ scale: 0.9 }}
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: 0 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </motion.div>
      );
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return 'text-blue-600';
    if (temp < 10) return 'text-blue-500';
    if (temp < 20) return 'text-green-500';
    if (temp < 30) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <motion.div 
      className={`bg-gradient-to-br ${isDaytime ? 'from-blue-100 to-blue-50' : 'from-indigo-900 to-blue-800'} rounded-lg shadow-md overflow-hidden mb-4 cursor-pointer transition-all`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Basic Weather Info */}
      <div className="p-4 flex items-center">
        <div className="mr-4">
          {renderAnimatedIcon()}
        </div>
        
        <div className="flex-1">
          <motion.h4 
            className={`font-medium ${isDaytime ? 'text-gray-800' : 'text-white'} flex items-center`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {name}, {country}
            <motion.span 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="ml-2 text-blue-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </motion.span>
          </motion.h4>
          
          <div className="flex items-center">
            <motion.span 
              className={`text-2xl font-semibold mr-2 ${getTemperatureColor(temp_c)}`}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
            >
              {Math.round(temp_c)}°C
            </motion.span>
            <motion.span className={`text-sm ${isDaytime ? 'text-gray-600' : 'text-gray-300'}`}>
              {condition.text}
            </motion.span>
          </div>
        </div>
      </div>
      
      {/* Expanded Weather Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`px-4 pb-4 pt-0 ${isDaytime ? 'text-gray-700' : 'text-gray-200'}`}
          >
            <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-200 to-transparent my-2"></div>
            
            {/* Additional Weather Info */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span className="text-sm">Feels like: {Math.round(feelslike_c)}°C</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Wind: {wind_mph} mph</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="text-sm">Humidity: {humidity}%</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm">Temp in °F: {Math.round(temp_f)}°F</span>
              </div>
            </div>
            
            {/* Forecast */}
            {forecast.length > 0 && (
              <div className="mt-3">
                <h5 className={`text-sm font-semibold mb-2 ${isDaytime ? 'text-gray-700' : 'text-gray-200'}`}>3-Day Forecast</h5>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {forecast.map((day, index) => (
                    <motion.div 
                      key={index}
                      className={`flex-shrink-0 p-2 rounded-md ${isDaytime ? 'bg-white bg-opacity-50' : 'bg-blue-900 bg-opacity-40'} text-center`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -3 }}
                    >
                      <div className={`text-xs font-medium ${isDaytime ? 'text-gray-700' : 'text-gray-300'}`}>
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="flex justify-center my-1">
                        <img src={day.day.condition.icon} alt={day.day.condition.text} className="h-6 w-6" />
                      </div>
                      <div className={`text-xs ${getTemperatureColor(day.day.maxtemp_c)}`}>
                        {Math.round(day.day.maxtemp_c)}°
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(day.day.mintemp_c)}°
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
