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
      className="rounded-lg shadow-lg overflow-hidden mb-4 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Main weather card with animated background */}
      <div className={`relative ${
        isDaytime 
          ? 'bg-gradient-to-br from-sky-400 to-blue-500' 
          : 'bg-gradient-to-br from-indigo-900 to-blue-900'
      } p-5`}>
        
        {/* Animated weather effects in background */}
        <div className="absolute inset-0 overflow-hidden">
          {isSunny && isDaytime && (
            <>
              <motion.div 
                className="absolute right-5 top-5 h-28 w-28 bg-yellow-300 rounded-full blur-3xl opacity-40"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.5, 0.4]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute -right-10 -top-10 h-20 w-20 bg-orange-300 rounded-full blur-2xl opacity-30"
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.4, 0.3]
                }}
                transition={{
                  duration: 6,
                  delay: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </>
          )}
          
          {isSunny && !isDaytime && (
            <>
              <motion.div 
                className="absolute right-5 top-5 h-24 w-24 bg-blue-400 rounded-full blur-3xl opacity-20"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="absolute inset-0">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-0.5 h-0.5 bg-white rounded-full"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0.1, 0.8, 0.1],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 5,
                      repeat: Infinity,
                      delay: Math.random() * 5,
                    }}
                  />
                ))}
              </div>
            </>
          )}
          
          {isCloudy && (
            <div className="absolute inset-0">
              <motion.div 
                className="absolute left-10 top-0 h-16 w-32 bg-white rounded-full blur-xl opacity-40"
                animate={{ x: [0, 10, 0] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute right-5 top-5 h-12 w-24 bg-white rounded-full blur-xl opacity-30"
                animate={{ x: [0, -15, 0] }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute left-1/4 top-10 h-8 w-16 bg-white rounded-full blur-xl opacity-20"
                animate={{ x: [0, 20, 0] }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          )}
          
          {isRainy && (
            <div className="absolute inset-0">
              {raindrops.map(drop => (
                <motion.div
                  key={drop.id}
                  className="absolute w-0.5 bg-blue-200 rounded-full opacity-70"
                  style={{ 
                    left: `${drop.x}%`, 
                    top: `${drop.y}%`,
                    height: `${drop.size * 5}px`
                  }}
                  animate={{ 
                    y: ['0%', '120%'], 
                    opacity: [0.7, 0.3],
                    rotate: 15
                  }}
                  transition={{ 
                    duration: drop.duration, 
                    repeat: Infinity, 
                    delay: Math.random() * 2,
                    ease: 'linear'
                  }}
                />
              ))}
              
              <motion.div 
                className="absolute inset-0 bg-blue-900/10"
                animate={{ opacity: [0.1, 0.15, 0.1] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          )}
          
          {isSnowy && (
            <div className="absolute inset-0">
              {snowflakes.map(flake => (
                <motion.div
                  key={flake.id}
                  className="absolute bg-white rounded-full opacity-90"
                  style={{ 
                    left: `${flake.x}%`, 
                    top: `${flake.y}%`,
                    width: `${flake.size}px`,
                    height: `${flake.size}px`,
                  }}
                  animate={{ 
                    y: ['0%', '100%'], 
                    x: [`${flake.x}%`, `${flake.x + (Math.random() * 10 - 5)}%`],
                    rotate: [0, 360],
                    opacity: [0.9, 0.7]
                  }}
                  transition={{ 
                    duration: flake.duration * 2, 
                    repeat: Infinity, 
                    delay: Math.random() * 2,
                    ease: 'linear'
                  }}
                />
              ))}
              
              <motion.div 
                className="absolute inset-0 bg-blue-100/5"
                animate={{ opacity: [0.05, 0.1, 0.05] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          )}
        </div>

        {/* Weather content */}
        <div className="relative z-10">
          {/* Location and expand control */}
          <div className="flex justify-between items-center mb-3">
            <motion.h3 
              className="text-white font-bold text-xl flex items-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {name}, {country}
              <motion.span 
                className="ml-2 text-white/80"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                {isDaytime ? "☀️" : "🌙"}
              </motion.span>
            </motion.h3>
            
            <motion.button
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </motion.button>
          </div>
          
          {/* Temperature and condition display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Animated weather icon */}
              <div className="mr-3">
                {renderAnimatedIcon()}
              </div>
              
              <div>
                <motion.div 
                  className="text-4xl font-bold text-white flex items-baseline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {Math.round(temp_c)}
                  <span className="text-xl">°C</span>
                </motion.div>
                
                <motion.div 
                  className="text-white/90 text-sm mt-0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {condition.text}
                </motion.div>
              </div>
            </div>
            
            <motion.div 
              className="text-right"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-sm text-white/80 flex items-center justify-end mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Feels like: {Math.round(feelslike_c)}°C
              </div>
              <div className="text-sm text-white/80 flex items-center justify-end">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Humidity: {humidity}%
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Expanded details panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 p-4"
          >
            {/* Additional Weather Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg flex items-center">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-blue-500 dark:text-blue-300">Wind Speed</div>
                  <div className="font-bold text-blue-700 dark:text-blue-200">{wind_mph} mph</div>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg flex items-center">
                <div className="bg-purple-100 dark:bg-purple-800 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-purple-500 dark:text-purple-300">Temperature (F)</div>
                  <div className="font-bold text-purple-700 dark:text-purple-200">{Math.round(temp_f)}°F</div>
                </div>
              </div>
            </div>
            
            {/* 3-Day Forecast */}
            {forecast.length > 0 && (
              <div className="mt-1">
                <h5 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  3-Day Forecast
                </h5>
                
                <div className="grid grid-cols-3 gap-2">
                  {forecast.map((day, index) => (
                    <motion.div 
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ 
                        y: -4, 
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        backgroundColor: "#f5f9ff"
                      }}
                    >
                      <div className="font-bold text-sm text-gray-700 dark:text-gray-200 mb-1">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      
                      <div className="flex justify-center my-2">
                        <img 
                          src={day.day.condition.icon} 
                          alt={day.day.condition.text} 
                          className="h-10 w-10 object-contain" 
                        />
                      </div>
                      
                      <div className="flex justify-center space-x-3 text-sm">
                        <div className={`font-bold ${getTemperatureColor(day.day.maxtemp_c)}`}>
                          {Math.round(day.day.maxtemp_c)}°
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {Math.round(day.day.mintemp_c)}°
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {day.day.condition.text}
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
