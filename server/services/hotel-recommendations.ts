/**
 * Hotel Recommendations Service
 * Provides specific hotel recommendations with detailed information
 */

export interface HotelRecommendation {
  id: string;
  name: string;
  brand: string;
  address: string;
  district: string;
  rating: number;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  amenities: string[];
  highlights: string[];
  bookingUrl?: string;
  images: string[];
  category: 'luxury' | 'business' | 'boutique' | 'budget' | 'family';
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface EventRecommendation {
  id: string;
  name: string;
  type: 'cultural' | 'entertainment' | 'sports' | 'food' | 'nightlife' | 'shopping' | 'outdoor';
  description: string;
  venue: string;
  address: string;
  date?: string;
  duration: string;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  highlights: string[];
  bookingUrl?: string;
  category: 'must-see' | 'popular' | 'hidden-gem' | 'seasonal';
}

const cityHotels: Record<string, HotelRecommendation[]> = {
  'new york': [
    {
      id: 'ny-plaza',
      name: 'The Plaza Hotel',
      brand: 'The Plaza',
      address: '768 5th Ave, New York, NY 10019',
      district: 'Midtown Manhattan',
      rating: 4.5,
      priceRange: { min: 695, max: 1200, currency: 'USD' },
      amenities: ['Spa', 'Fitness Center', 'Fine Dining', 'Concierge', 'Butler Service'],
      highlights: ['Iconic Central Park views', 'Historic luxury since 1907', 'Oak Room restaurant'],
      images: ['/hotels/plaza-ny.jpg'],
      category: 'luxury',
      coordinates: { lat: 40.7648, lng: -73.9808 }
    },
    {
      id: 'ny-standard',
      name: 'The Standard High Line',
      brand: 'Standard Hotels',
      address: '848 Washington St, New York, NY 10014',
      district: 'Meatpacking District',
      rating: 4.3,
      priceRange: { min: 275, max: 450, currency: 'USD' },
      amenities: ['Rooftop Bar', 'Fitness Center', 'Pet Friendly', 'Business Center'],
      highlights: ['Hudson River views', 'Trendy Meatpacking location', 'Le Bain rooftop'],
      images: ['/hotels/standard-ny.jpg'],
      category: 'boutique',
      coordinates: { lat: 40.7408, lng: -74.0073 }
    },
    {
      id: 'ny-pod',
      name: 'Pod Hotels Midtown',
      brand: 'Pod Hotels',
      address: '247 W 46th St, New York, NY 10036',
      district: 'Times Square',
      rating: 4.1,
      priceRange: { min: 129, max: 199, currency: 'USD' },
      amenities: ['24/7 Gym', 'Free WiFi', 'Grab & Go Market', 'Luggage Storage'],
      highlights: ['Steps from Times Square', 'Modern pod-style rooms', 'Rooftop lounge'],
      images: ['/hotels/pod-ny.jpg'],
      category: 'budget',
      coordinates: { lat: 40.7580, lng: -73.9855 }
    }
  ],
  'tokyo': [
    {
      id: 'tokyo-ritz',
      name: 'The Ritz-Carlton Tokyo',
      brand: 'Ritz-Carlton',
      address: '9-7-1 Akasaka, Minato City, Tokyo 107-6245',
      district: 'Roppongi',
      rating: 4.7,
      priceRange: { min: 950, max: 1800, currency: 'USD' },
      amenities: ['Spa', 'Michelin-starred dining', 'Club Level', 'Concierge'],
      highlights: ['Tokyo skyline views', 'Hinokizaka restaurant', 'Traditional Japanese service'],
      images: ['/hotels/ritz-tokyo.jpg'],
      category: 'luxury',
      coordinates: { lat: 35.6627, lng: 139.7323 }
    },
    {
      id: 'tokyo-aman',
      name: 'Aman Tokyo',
      brand: 'Aman Resorts',
      address: '1-5-6 Otemachi, Chiyoda City, Tokyo 100-0004',
      district: 'Otemachi',
      rating: 4.6,
      priceRange: { min: 1200, max: 2500, currency: 'USD' },
      amenities: ['Aman Spa', 'Traditional Aman Design', 'Imperial Palace views', 'Private dining'],
      highlights: ['Serene urban oasis', 'Imperial Palace gardens view', 'Minimalist luxury'],
      images: ['/hotels/aman-tokyo.jpg'],
      category: 'luxury',
      coordinates: { lat: 35.6841, lng: 139.7648 }
    },
    {
      id: 'tokyo-shibuya',
      name: 'Shibuya Sky Hotel',
      brand: 'Independent',
      address: '2-24-12 Shibuya, Shibuya City, Tokyo 150-0002',
      district: 'Shibuya',
      rating: 4.2,
      priceRange: { min: 180, max: 280, currency: 'USD' },
      amenities: ['Shibuya Crossing views', 'Modern design', 'Rooftop terrace', 'Free WiFi'],
      highlights: ['Heart of Shibuya', 'Fashion district access', 'Youth culture hub'],
      images: ['/hotels/shibuya-sky.jpg'],
      category: 'business',
      coordinates: { lat: 35.6598, lng: 139.7006 }
    }
  ],
  'london': [
    {
      id: 'london-savoy',
      name: 'The Savoy',
      brand: 'Fairmont',
      address: 'Strand, London WC2R 0EU',
      district: 'Covent Garden',
      rating: 4.6,
      priceRange: { min: 590, max: 1200, currency: 'USD' },
      amenities: ['Savoy Grill', 'Fitness Centre', 'Business Centre', 'Thames views'],
      highlights: ['Historic luxury since 1889', 'Art Deco elegance', 'Thames River location'],
      images: ['/hotels/savoy-london.jpg'],
      category: 'luxury',
      coordinates: { lat: 51.5101, lng: -0.1197 }
    },
    {
      id: 'london-zetter',
      name: 'The Zetter Townhouse',
      brand: 'The Zetter Group',
      address: '49-50 Seymour St, London W1H 7JG',
      district: 'Marylebone',
      rating: 4.4,
      priceRange: { min: 320, max: 480, currency: 'USD' },
      amenities: ['Cocktail Lounge', 'Boutique Design', 'Personalized Service', 'Pet Friendly'],
      highlights: ['Victorian townhouse charm', 'Seymour\'s Parlour cocktails', 'Marylebone village feel'],
      images: ['/hotels/zetter-london.jpg'],
      category: 'boutique',
      coordinates: { lat: 51.5196, lng: -0.1579 }
    },
    {
      id: 'london-hub',
      name: 'hub by Premier Inn London City',
      brand: 'Premier Inn',
      address: '1 Alie St, London E1 8DE',
      district: 'City of London',
      rating: 4.0,
      priceRange: { min: 95, max: 150, currency: 'USD' },
      amenities: ['Smart rooms', '24/7 reception', 'Hypnos beds', 'Express check-in'],
      highlights: ['Modern compact design', 'City location', 'Tower Bridge nearby'],
      images: ['/hotels/hub-london.jpg'],
      category: 'budget',
      coordinates: { lat: 51.5124, lng: -0.0761 }
    }
  ],
  'paris': [
    {
      id: 'paris-ritz',
      name: 'Ritz Paris',
      brand: 'Ritz-Carlton',
      address: '15 Place Vendôme, 75001 Paris',
      district: '1st Arrondissement',
      rating: 4.8,
      priceRange: { min: 1200, max: 2800, currency: 'USD' },
      amenities: ['Ritz Club', 'Chanel Spa', 'L\'Espadon restaurant', 'Place Vendôme shopping'],
      highlights: ['Legendary Parisian luxury', 'Coco Chanel suite', 'Place Vendôme prestige'],
      images: ['/hotels/ritz-paris.jpg'],
      category: 'luxury',
      coordinates: { lat: 48.8673, lng: 2.3282 }
    },
    {
      id: 'paris-hotel-des-grands-boulevards',
      name: 'Hôtel des Grands Boulevards',
      brand: 'Independent',
      address: '17 Boulevard Poissonnière, 75002 Paris',
      district: '2nd Arrondissement',
      rating: 4.3,
      priceRange: { min: 280, max: 420, currency: 'USD' },
      amenities: ['Restaurant Giovanni Passerini', 'Cocktail bar', 'Garden courtyard', 'Design hotel'],
      highlights: ['Historic Grands Boulevards', 'Italian restaurant', 'Parisian charm'],
      images: ['/hotels/grands-boulevards-paris.jpg'],
      category: 'boutique',
      coordinates: { lat: 48.8707, lng: 2.3448 }
    },
    {
      id: 'paris-mama-shelter',
      name: 'Mama Shelter Paris East',
      brand: 'Mama Shelter',
      address: '109 Rue de Bagnolet, 75020 Paris',
      district: '20th Arrondissement',
      rating: 4.1,
      priceRange: { min: 125, max: 185, currency: 'USD' },
      amenities: ['Rooftop restaurant', 'Creative design', 'Bar/lounge', 'Modern amenities'],
      highlights: ['Philippe Starck design', 'Trendy Belleville area', 'Rooftop views'],
      images: ['/hotels/mama-shelter-paris.jpg'],
      category: 'budget',
      coordinates: { lat: 48.8644, lng: 2.4004 }
    }
  ]
};

const cityEvents: Record<string, EventRecommendation[]> = {
  'new york': [
    {
      id: 'ny-broadway',
      name: 'Broadway Show Experience',
      type: 'entertainment',
      description: 'Catch a world-class Broadway production in the Theater District',
      venue: 'Multiple Broadway Theaters',
      address: 'Theater District, Times Square',
      duration: '2.5-3 hours',
      priceRange: { min: 75, max: 300, currency: 'USD' },
      highlights: ['World-renowned performances', 'Historic theaters', 'Pre-show dining options'],
      category: 'must-see'
    },
    {
      id: 'ny-central-park',
      name: 'Central Park Guided Walking Tour',
      type: 'outdoor',
      description: 'Explore iconic Central Park with expert local guides',
      venue: 'Central Park',
      address: 'Central Park, Manhattan',
      duration: '2 hours',
      priceRange: { min: 25, max: 45, currency: 'USD' },
      highlights: ['Bethesda Fountain', 'Strawberry Fields', 'Bow Bridge'],
      category: 'popular'
    },
    {
      id: 'ny-food-tour',
      name: 'Greenwich Village Food Tour',
      type: 'food',
      description: 'Taste your way through historic Greenwich Village',
      venue: 'Greenwich Village',
      address: 'Various locations in Greenwich Village',
      duration: '3 hours',
      priceRange: { min: 65, max: 85, currency: 'USD' },
      highlights: ['Local eateries', 'Historic neighborhood', 'Cultural insights'],
      category: 'hidden-gem'
    }
  ],
  'tokyo': [
    {
      id: 'tokyo-tsukiji',
      name: 'Tsukiji Outer Market Food Tour',
      type: 'food',
      description: 'Early morning sushi and street food experience',
      venue: 'Tsukiji Outer Market',
      address: 'Tsukiji, Chuo City, Tokyo',
      duration: '3 hours',
      priceRange: { min: 85, max: 120, currency: 'USD' },
      highlights: ['Fresh sushi breakfast', 'Traditional market culture', 'Local vendors'],
      category: 'must-see'
    },
    {
      id: 'tokyo-sumo',
      name: 'Sumo Wrestling Experience',
      type: 'cultural',
      description: 'Watch traditional sumo wrestling with cultural insights',
      venue: 'Ryogoku Kokugikan',
      address: '1-3-28 Yokoami, Sumida City, Tokyo',
      duration: '4 hours',
      priceRange: { min: 45, max: 150, currency: 'USD' },
      highlights: ['Traditional Japanese sport', 'Cultural ceremony', 'Chanko-nabe dining'],
      category: 'popular'
    },
    {
      id: 'tokyo-teamlab',
      name: 'teamLab Borderless Digital Art',
      type: 'entertainment',
      description: 'Immersive digital art experience in futuristic museum',
      venue: 'teamLab Borderless',
      address: '1-3-15 Toyosu, Koto City, Tokyo',
      duration: '3-4 hours',
      priceRange: { min: 28, max: 35, currency: 'USD' },
      highlights: ['Interactive digital art', 'Instagram-worthy spaces', 'Cutting-edge technology'],
      category: 'hidden-gem'
    }
  ],
  'london': [
    {
      id: 'london-tower',
      name: 'Tower of London Crown Jewels Tour',
      type: 'cultural',
      description: 'Explore 1000 years of history and see the Crown Jewels',
      venue: 'Tower of London',
      address: 'St Katharine\'s & Wapping, London EC3N 4AB',
      duration: '3 hours',
      priceRange: { min: 35, max: 50, currency: 'USD' },
      highlights: ['Crown Jewels collection', 'Beefeater guides', 'Historic fortress'],
      category: 'must-see'
    },
    {
      id: 'london-pub-walk',
      name: 'Historic London Pub Walking Tour',
      type: 'nightlife',
      description: 'Discover London\'s most historic pubs and their stories',
      venue: 'Various Historic Pubs',
      address: 'Central London',
      duration: '3.5 hours',
      priceRange: { min: 55, max: 75, currency: 'USD' },
      highlights: ['Traditional British pubs', 'Local beer tasting', 'Historic stories'],
      category: 'popular'
    },
    {
      id: 'london-markets',
      name: 'Borough Market Food Experience',
      type: 'food',
      description: 'Explore London\'s oldest food market with guided tastings',
      venue: 'Borough Market',
      address: '8 Southwark St, London SE1 1TL',
      duration: '2.5 hours',
      priceRange: { min: 45, max: 65, currency: 'USD' },
      highlights: ['Artisanal food producers', 'Free tastings', 'Historic market atmosphere'],
      category: 'hidden-gem'
    }
  ],
  'paris': [
    {
      id: 'paris-louvre',
      name: 'Louvre Museum Skip-the-Line Tour',
      type: 'cultural',
      description: 'Expert-guided tour of the world\'s most famous museum',
      venue: 'Louvre Museum',
      address: 'Rue de Rivoli, 75001 Paris',
      duration: '3 hours',
      priceRange: { min: 65, max: 95, currency: 'USD' },
      highlights: ['Mona Lisa', 'Venus de Milo', 'Expert art historian guide'],
      category: 'must-see'
    },
    {
      id: 'paris-cooking',
      name: 'French Cooking Class in Montmartre',
      type: 'food',
      description: 'Learn to cook classic French dishes in historic Montmartre',
      venue: 'Cooking Studio Montmartre',
      address: 'Montmartre, 75018 Paris',
      duration: '4 hours',
      priceRange: { min: 135, max: 185, currency: 'USD' },
      highlights: ['Hands-on cooking', 'Market visit', 'Wine pairing'],
      category: 'popular'
    },
    {
      id: 'paris-seine-cruise',
      name: 'Evening Seine River Cruise with Dinner',
      type: 'entertainment',
      description: 'Romantic dinner cruise along the Seine with city views',
      venue: 'Seine River',
      address: 'Port de la Bourdonnais, 75007 Paris',
      duration: '2.5 hours',
      priceRange: { min: 85, max: 150, currency: 'USD' },
      highlights: ['Eiffel Tower views', 'French cuisine', 'City lights'],
      category: 'hidden-gem'
    }
  ]
};

export function getHotelRecommendations(destination: string, budget?: number): HotelRecommendation[] {
  const normalizedDestination = destination.toLowerCase();
  const hotels = cityHotels[normalizedDestination] || [];
  
  if (budget) {
    return hotels.filter(hotel => hotel.priceRange.min <= budget).slice(0, 3);
  }
  
  return hotels.slice(0, 3);
}

export function getEventRecommendations(destination: string, interests?: string[]): EventRecommendation[] {
  const normalizedDestination = destination.toLowerCase();
  const events = cityEvents[normalizedDestination] || [];
  
  if (interests && interests.length > 0) {
    const filteredEvents = events.filter(event => 
      interests.some(interest => 
        event.type.includes(interest.toLowerCase()) || 
        event.description.toLowerCase().includes(interest.toLowerCase())
      )
    );
    return filteredEvents.slice(0, 3);
  }
  
  return events.slice(0, 3);
}

export function getAllSupportedDestinations(): string[] {
  return Object.keys(cityHotels);
}