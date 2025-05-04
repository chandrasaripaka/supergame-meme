import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
  continent: string;
}

type DestinationsByContinent = {
  [continent: string]: Destination[];
};

const destinations: Destination[] = [
  // Europe
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    continent: 'Europe',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'The City of Light offers iconic architecture, world-class museums, and culinary delights.'
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    continent: 'Europe',
    image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'The Eternal City features ancient ruins, Renaissance masterpieces, and exceptional cuisine.'
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    country: 'Spain',
    continent: 'Europe',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A vibrant city with stunning architecture, beautiful beaches, and a lively cultural scene.'
  },
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Greece',
    continent: 'Europe',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Famous for its stunning blue-domed churches, white-washed buildings, and breathtaking sunsets.'
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    country: 'Netherlands',
    continent: 'Europe',
    image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Historic canals, world-class museums, and vibrant street life make this a unique city to explore.'
  },
  
  // Asia
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    continent: 'Asia',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A dazzling blend of ultramodern and traditional, from temples to skyscrapers.'
  },
  {
    id: 'bangkok',
    name: 'Bangkok',
    country: 'Thailand',
    continent: 'Asia',
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Ornate shrines, vibrant street life, and a bustling food scene in Thailand\'s capital city.'
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    continent: 'Asia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A tropical paradise with beautiful beaches, lush rice terraces, and vibrant cultural experiences.'
  },
  {
    id: 'seoul',
    name: 'Seoul',
    country: 'South Korea',
    continent: 'Asia',
    image: 'https://images.unsplash.com/photo-1538485399081-7c9a2314e837?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A city where modern skyscrapers, high-tech subways and pop culture meet Buddhist temples and palaces.'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    continent: 'Asia',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A futuristic garden city with innovative architecture, lush parks, and diverse cultural neighborhoods.'
  },
  
  // North America
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    continent: 'North America',
    image: 'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'The city that never sleeps, offering iconic landmarks, diverse culture, and endless entertainment.'
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    country: 'Canada',
    continent: 'North America',
    image: 'https://images.unsplash.com/photo-1609825488888-3f8b58129eaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A coastal seaport city known for its stunning natural beauty, outdoor activities, and film industry.'
  },
  {
    id: 'mexico-city',
    name: 'Mexico City',
    country: 'Mexico',
    continent: 'North America',
    image: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A vibrant metropolis with ancient Aztec ruins, colonial architecture, and world-class museums.'
  },
  {
    id: 'havana',
    name: 'Havana',
    country: 'Cuba',
    continent: 'North America',
    image: 'https://images.unsplash.com/photo-1500759285222-a95626b934cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Vintage cars, colorful architecture, and a rich cultural heritage in Cuba\'s capital city.'
  },
  {
    id: 'san-francisco',
    name: 'San Francisco',
    country: 'United States',
    continent: 'North America',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Famous for its iconic Golden Gate Bridge, cable cars, and diverse neighborhoods.'
  },
  
  // South America
  {
    id: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    country: 'Brazil',
    continent: 'South America',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Famous for its Copacabana beach, Christ the Redeemer statue, and annual carnival celebrations.'
  },
  {
    id: 'buenos-aires',
    name: 'Buenos Aires',
    country: 'Argentina',
    continent: 'South America',
    image: 'https://images.unsplash.com/photo-1493837417577-baec364a53eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A sophisticated city known for its European architecture, tango dancing, and rich cultural scene.'
  },
  {
    id: 'cusco',
    name: 'Cusco',
    country: 'Peru',
    continent: 'South America',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'The historic capital of the Inca Empire and gateway to Machu Picchu.'
  },
  {
    id: 'cartagena',
    name: 'Cartagena',
    country: 'Colombia',
    continent: 'South America',
    image: 'https://images.unsplash.com/photo-1593475572797-bed9044b5715?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A colorful colonial city with beautiful architecture, vibrant streets, and Caribbean beaches.'
  },
  {
    id: 'galapagos',
    name: 'Galapagos Islands',
    country: 'Ecuador',
    continent: 'South America',
    image: 'https://images.unsplash.com/photo-1544556475-3717eca646d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A volcanic archipelago famous for its diverse wildlife and Charles Darwin\'s research.'
  },
  
  // Africa
  {
    id: 'cape-town',
    name: 'Cape Town',
    country: 'South Africa',
    continent: 'Africa',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A stunning coastal city with Table Mountain, beautiful beaches, and vibrant cultural scenes.'
  },
  {
    id: 'marrakech',
    name: 'Marrakech',
    country: 'Morocco',
    continent: 'Africa',
    image: 'https://images.unsplash.com/photo-1548784575-093f71d4a89e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A former imperial city known for its vibrant markets, gardens, and historic medina.'
  },
  {
    id: 'cairo',
    name: 'Cairo',
    country: 'Egypt',
    continent: 'Africa',
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Home to the ancient Pyramids of Giza, the Sphinx, and a wealth of Egyptian artifacts.'
  },
  {
    id: 'zanzibar',
    name: 'Zanzibar',
    country: 'Tanzania',
    continent: 'Africa',
    image: 'https://images.unsplash.com/photo-1548390340-50159abd1714?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A tropical island paradise with pristine beaches, historic Stone Town, and spice plantations.'
  },
  {
    id: 'victoria-falls',
    name: 'Victoria Falls',
    country: 'Zimbabwe/Zambia',
    continent: 'Africa',
    image: 'https://images.unsplash.com/photo-1512330905116-8a50ab1ae3b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'One of the world\'s most spectacular waterfalls, known locally as "The Smoke That Thunders".'
  },
  
  // Oceania
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Australia',
    continent: 'Oceania',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Famous for its iconic Opera House, Harbour Bridge, and beautiful beaches.'
  },
  {
    id: 'queenstown',
    name: 'Queenstown',
    country: 'New Zealand',
    continent: 'Oceania',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Adventure capital of New Zealand, surrounded by mountains and set on the shores of Lake Wakatipu.'
  },
  {
    id: 'fiji',
    name: 'Fiji',
    country: 'Fiji',
    continent: 'Oceania',
    image: 'https://images.unsplash.com/photo-1542459255-ad67611b2b11?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A tropical paradise with crystal clear waters, white sandy beaches, and friendly locals.'
  },
  {
    id: 'tahiti',
    name: 'Tahiti',
    country: 'French Polynesia',
    continent: 'Oceania',
    image: 'https://images.unsplash.com/photo-1632691032272-3d20683c3991?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'The largest island in French Polynesia, known for its black sand beaches, waterfalls, and lagoons.'
  },
  {
    id: 'great-barrier-reef',
    name: 'Great Barrier Reef',
    country: 'Australia',
    continent: 'Oceania',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'The world\'s largest coral reef system, home to a diverse range of marine life.'
  }
];

// Group destinations by continent
const destinationsByContinent: DestinationsByContinent = destinations.reduce((acc, destination) => {
  if (!acc[destination.continent]) {
    acc[destination.continent] = [];
  }
  acc[destination.continent].push(destination);
  return acc;
}, {} as DestinationsByContinent);

// Get list of continents
const continents = Object.keys(destinationsByContinent);

export function PopularDestinations() {
  const [_, setLocation] = useLocation();
  const [activeContinent, setActiveContinent] = useState<string>(continents[0]);
  
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
        Destinations by Continent
      </h2>
      
      <Tabs defaultValue={continents[0]} className="w-full">
        <TabsList className="mb-4 w-full sm:w-auto flex flex-wrap justify-start">
          {continents.map((continent) => (
            <TabsTrigger 
              key={continent} 
              value={continent}
              onClick={() => setActiveContinent(continent)}
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {continent}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {continents.map((continent) => (
          <TabsContent key={continent} value={continent}>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
              key={continent} // Adding key prop to force re-animation when tab changes
            >
              {destinationsByContinent[continent]?.map((destination) => (
                <motion.div
                  key={destination.id}
                  variants={item}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => handleDestinationClick(destination)}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={destination.image} 
                      alt={destination.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs font-medium">{destination.country}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{destination.name}</h3>
                    <p className="text-gray-700 text-sm line-clamp-2 mt-1">{destination.description}</p>
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
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
        <div className="mb-4 sm:mb-0">
          <h3 className="text-lg font-semibold text-gray-800">Looking for destination statistics?</h3>
          <p className="text-gray-600">Get detailed travel data for any location</p>
        </div>
        <button 
          onClick={() => setLocation('/destination-stats')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md hover:shadow-md transition-all"
        >
          View Statistics Dashboard
        </button>
      </div>
    </div>
  );
}