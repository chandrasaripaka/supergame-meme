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

// Western popular destinations
const westernDestinations: Destination[] = [
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

// Asian cities destinations
const asianDestinations: Destination[] = [
  {
    id: 'bangkok',
    name: 'Bangkok',
    country: 'Thailand',
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Vibrant capital with ornate shrines, bustling markets, and a rich street food culture.'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Modern city-state with stunning architecture, diverse cuisine, and pristine gardens.'
  },
  {
    id: 'seoul',
    name: 'Seoul',
    country: 'South Korea',
    image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Dynamic metropolis blending high-tech innovation with traditional palaces and street markets.'
  },
  {
    id: 'hong-kong',
    name: 'Hong Kong',
    country: 'China',
    image: 'https://images.unsplash.com/photo-1506970845246-18f21d533b20?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Bustling harbor city known for its iconic skyline, vibrant food scene, and shopping districts.'
  },
  {
    id: 'beijing',
    name: 'Beijing',
    country: 'China',
    image: 'https://images.unsplash.com/photo-1584843760783-00f402ab5074?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Historic capital city featuring ancient wonders like the Great Wall and Forbidden City.'
  }
];

// Animation variants
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

// Destination card component
function DestinationCard({ destination, onClick }: { destination: Destination, onClick: (destination: Destination) => void }) {
  return (
    <motion.div
      variants={item}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg"
      onClick={() => onClick(destination)}
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
            onClick(destination);
          }}
        >
          Explore Details
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

export function PopularDestinations() {
  const [_, setLocation] = useLocation();
  
  const handleDestinationClick = (destination: Destination) => {
    setLocation(`/destination/${encodeURIComponent(`${destination.name}, ${destination.country}`)}`);
  };
  
  return (
    <div className="my-8">
      {/* Western Destinations Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 pl-2 flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text border-l-4 border-blue-500 py-1">
          Popular Destinations
        </h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {westernDestinations.map((destination) => (
            <DestinationCard 
              key={destination.id}
              destination={destination} 
              onClick={handleDestinationClick} 
            />
          ))}
        </motion.div>
      </div>
      
      {/* Asian Cities Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 pl-2 flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text border-l-4 border-indigo-500 py-1">
          Discover Asia
        </h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {asianDestinations.map((destination) => (
            <DestinationCard 
              key={destination.id}
              destination={destination} 
              onClick={handleDestinationClick} 
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}