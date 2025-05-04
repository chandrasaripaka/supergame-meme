import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getDestinationStats, getWeather, getAttractions } from '@/lib/api';
import { Weather } from '@/types';
import { DestinationStats } from '@/components/DestinationStats';
import { WeatherWidget } from '@/components/WeatherWidget';
import { AttractionCards } from '@/components/AttractionCards';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function DestinationInfoPage() {
  const [_, setLocation] = useLocation();
  const params = useParams<{ destination: string }>();
  const destination = params?.destination || '';
  const decodedDestination = decodeURIComponent(destination);
  
  // Fetch destination statistics
  const { data: statistics, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ['/api/destination-stats', destination],
    queryFn: () => destination ? getDestinationStats(decodedDestination) : null,
    enabled: !!destination
  });
  
  // Fetch weather data
  const { data: weather, isLoading: isLoadingWeather } = useQuery({
    queryKey: ['/api/weather', destination],
    queryFn: () => destination ? getWeather(decodedDestination) : null,
    enabled: !!destination
  });
  
  // Fetch attraction data
  const { data: attractions, isLoading: isLoadingAttractions } = useQuery({
    queryKey: ['/api/attractions', destination],
    queryFn: () => destination ? getAttractions(decodedDestination) : null,
    enabled: !!destination
  });
  
  // Handle the case when no destination is provided
  if (!destination) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Destination Selected</h2>
          <p className="text-gray-600 mb-6">Please select a destination to view detailed information.</p>
          <Button 
            onClick={() => setLocation('/')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              {decodedDestination}
            </h1>
            <p className="text-gray-600 mt-1">Explore what makes this destination special</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              onClick={() => setLocation('/')}
              variant="outline"
              className="mr-2"
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => window.open(`https://www.google.com/maps/place/${encodeURIComponent(decodedDestination)}`, '_blank')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              View on Map
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Weather Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <WeatherWidget weather={weather || null} isLoading={isLoadingWeather} />
      </motion.div>
      
      {/* Destination Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {statsError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Could not load destination statistics</h3>
            <p className="text-red-700 text-sm">
              Statistics for this destination are not available. This could be because the destination is not popular enough or our data sources don't have information on it.
            </p>
          </div>
        ) : (
          <DestinationStats statistics={statistics} isLoading={isLoadingStats} />
        )}
      </motion.div>
      
      {/* Attractions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4 mt-8 pl-2 flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text border-l-4 border-blue-500 py-1">
          Popular Attractions
        </h2>
        <AttractionCards attractions={attractions || []} isLoading={isLoadingAttractions} />
      </motion.div>
      
      {/* Action Buttons */}
      <motion.div 
        className="mt-8 flex flex-wrap justify-center space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Button 
          onClick={() => setLocation(`/flights/${encodeURIComponent(decodedDestination)}`)}
          className="bg-indigo-500 hover:bg-indigo-600 mb-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
          </svg>
          Find Flights
        </Button>
        
        <Button 
          onClick={() => setLocation(`/packing-list?destination=${encodeURIComponent(decodedDestination)}`)}
          className="bg-green-500 hover:bg-green-600 mb-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Create Packing List
        </Button>
        
        <Button 
          onClick={() => setLocation(`/plan?destination=${encodeURIComponent(decodedDestination)}`)}
          className="bg-blue-500 hover:bg-blue-600 mb-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Plan Itinerary
        </Button>
      </motion.div>
    </div>
  );
}