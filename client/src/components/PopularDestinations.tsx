import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
}

const popularDestinations: Destination[] = [
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'The City of Light offers iconic architecture, world-class museums, and culinary delights.'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A dazzling blend of ultramodern and traditional, from temples to skyscrapers.'
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    image: 'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'The city that never sleeps, offering iconic landmarks, diverse culture, and endless entertainment.'
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A tropical paradise with beautiful beaches, lush rice terraces, and vibrant cultural experiences.'
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'The Eternal City features ancient ruins, Renaissance masterpieces, and exceptional cuisine.'
  }
];

export function PopularDestinations() {
  const [_, setLocation] = useLocation();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  const handleDestinationClick = (destination: Destination) => {
    setLocation(`/destination/${encodeURIComponent(`${destination.name}, ${destination.country}`)}`);
  };
  
  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-6 pl-2 flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text border-l-4 border-blue-500 py-1">
        Popular Destinations
      </h2>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {popularDestinations.map((destination) => (
          <motion.div
            key={destination.id}
            variants={item}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg"
            onClick={() => handleDestinationClick(destination)}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="h-40 overflow-hidden">
              <img 
                src={destination.image} 
                alt={destination.name} 
                className="w-full h-full object-cover transition-all hover:scale-110"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{destination.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{destination.country}</p>
              <p className="text-gray-700 text-sm line-clamp-2">{destination.description}</p>
            </div>
            <div className="px-4 pb-3 pt-0">
              <button 
                className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDestinationClick(destination);
                }}
              >
                Explore Details
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}