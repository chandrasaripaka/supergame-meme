import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Sample flight data for demo
const flights = [
  {
    id: 'FL123456',
    airline: 'Skyline Airways',
    flightNumber: 'SL456',
    origin: 'New York',
    destination: 'San Francisco',
    departureTime: '2025-06-15T08:30:00Z',
    arrivalTime: '2025-06-15T11:45:00Z',
    price: 349.99,
    seats: {
      economy: { available: 42, price: 349.99 },
      business: { available: 12, price: 899.99 },
      first: { available: 4, price: 1299.99 }
    }
  },
  {
    id: 'FL234567',
    airline: 'Global Airlines',
    flightNumber: 'GA789',
    origin: 'New York',
    destination: 'Los Angeles',
    departureTime: '2025-06-15T09:15:00Z',
    arrivalTime: '2025-06-15T12:30:00Z',
    price: 329.99,
    seats: {
      economy: { available: 38, price: 329.99 },
      business: { available: 8, price: 849.99 },
      first: { available: 2, price: 1199.99 }
    }
  },
  {
    id: 'FL345678',
    airline: 'Ocean Air',
    flightNumber: 'OA123',
    origin: 'New York',
    destination: 'Miami',
    departureTime: '2025-06-15T10:00:00Z',
    arrivalTime: '2025-06-15T13:15:00Z',
    price: 299.99,
    seats: {
      economy: { available: 45, price: 299.99 },
      business: { available: 14, price: 799.99 },
      first: { available: 6, price: 1099.99 }
    }
  },
  {
    id: 'FL456789',
    airline: 'Sunlight Express',
    flightNumber: 'SE456',
    origin: 'New York',
    destination: 'Las Vegas',
    departureTime: '2025-06-15T11:30:00Z',
    arrivalTime: '2025-06-15T14:45:00Z',
    price: 379.99,
    seats: {
      economy: { available: 36, price: 379.99 },
      business: { available: 10, price: 949.99 },
      first: { available: 3, price: 1349.99 }
    }
  },
  {
    id: 'FL567890',
    airline: 'Mountain Airways',
    flightNumber: 'MA789',
    origin: 'New York',
    destination: 'Denver',
    departureTime: '2025-06-15T12:45:00Z',
    arrivalTime: '2025-06-15T15:30:00Z',
    price: 319.99,
    seats: {
      economy: { available: 40, price: 319.99 },
      business: { available: 9, price: 829.99 },
      first: { available: 2, price: 1149.99 }
    }
  },
];

// Sample hotel data for demo
const hotels = [
  {
    id: 'HTL12345',
    name: 'Grand Plaza Hotel',
    location: 'San Francisco',
    address: '123 Main Street, San Francisco, CA',
    stars: 4.5,
    amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'WiFi'],
    pricePerNight: 199.99,
    rooms: {
      standard: { available: 15, price: 199.99 },
      deluxe: { available: 8, price: 299.99 },
      suite: { available: 3, price: 399.99 }
    },
    images: ['grand_plaza_1.jpg', 'grand_plaza_2.jpg']
  },
  {
    id: 'HTL23456',
    name: 'Oceanview Resort',
    location: 'Miami',
    address: '456 Beach Road, Miami, FL',
    stars: 5,
    amenities: ['Beach Access', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'WiFi'],
    pricePerNight: 299.99,
    rooms: {
      standard: { available: 20, price: 299.99 },
      deluxe: { available: 12, price: 399.99 },
      suite: { available: 5, price: 599.99 }
    },
    images: ['oceanview_1.jpg', 'oceanview_2.jpg']
  },
  {
    id: 'HTL34567',
    name: 'Desert Oasis Resort',
    location: 'Las Vegas',
    address: '789 Strip Ave, Las Vegas, NV',
    stars: 4,
    amenities: ['Pool', 'Casino', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'WiFi'],
    pricePerNight: 249.99,
    rooms: {
      standard: { available: 25, price: 249.99 },
      deluxe: { available: 15, price: 349.99 },
      suite: { available: 7, price: 499.99 }
    },
    images: ['desert_oasis_1.jpg', 'desert_oasis_2.jpg']
  },
  {
    id: 'HTL45678',
    name: 'Mountain Lodge',
    location: 'Denver',
    address: '101 Mountain View Dr, Denver, CO',
    stars: 3.5,
    amenities: ['Fireplace', 'Restaurant', 'Bar', 'WiFi', 'Parking'],
    pricePerNight: 179.99,
    rooms: {
      standard: { available: 18, price: 179.99 },
      deluxe: { available: 10, price: 249.99 },
      suite: { available: 2, price: 349.99 }
    },
    images: ['mountain_lodge_1.jpg', 'mountain_lodge_2.jpg']
  },
  {
    id: 'HTL56789',
    name: 'Downtown Suites',
    location: 'Los Angeles',
    address: '567 Hollywood Blvd, Los Angeles, CA',
    stars: 4,
    amenities: ['Pool', 'Gym', 'Restaurant', 'Bar', 'WiFi', 'Parking'],
    pricePerNight: 229.99,
    rooms: {
      standard: { available: 22, price: 229.99 },
      deluxe: { available: 14, price: 329.99 },
      suite: { available: 6, price: 429.99 }
    },
    images: ['downtown_suites_1.jpg', 'downtown_suites_2.jpg']
  },
];

// Sample offers for promotions
const offers = [
  {
    id: 'OFF12345',
    destination: 'Bali',
    title: 'Tropical Getaway',
    description: 'Enjoy 20% off on flights and hotels to Bali. Perfect for a relaxing beach vacation!',
    discountPercentage: 20,
    validUntil: '2025-07-31T23:59:59Z'
  },
  {
    id: 'OFF23456',
    destination: 'Paris',
    title: 'Romantic Paris Escape',
    description: 'Get 15% off on your Paris adventure. Explore the city of love and its iconic landmarks!',
    discountPercentage: 15,
    validUntil: '2025-08-15T23:59:59Z'
  },
  {
    id: 'OFF34567',
    destination: 'Tokyo',
    title: 'Tokyo Explorer',
    description: 'Discover Tokyo with 25% off on flight and hotel packages. Experience Japanese culture and cuisine!',
    discountPercentage: 25,
    validUntil: '2025-07-15T23:59:59Z'
  }
];

// Sample bookings storage
const bookings = [
  {
    id: 'BK123456',
    userId: '1',
    type: 'flight',
    flightId: 'FL123456',
    passengers: [
      { name: 'John Doe', type: 'adult' }
    ],
    status: 'confirmed',
    totalPrice: 349.99,
    bookingDate: '2025-05-10T14:30:00Z'
  }
];

// Helper for date formatting
function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Process natural language to identify intents and entities
function processNaturalLanguage(message: string, context: any) {
  // Convert to lowercase for easier matching
  const messageLower = message.toLowerCase();
  
  // Basic intent detection
  let intent = '';
  let entities: any = {};
  
  // Flight booking intent
  if (
    messageLower.includes('book a flight') || 
    messageLower.includes('flight to') ||
    messageLower.includes('fly to') ||
    messageLower.includes('flight from') ||
    messageLower.includes('flight booking')
  ) {
    intent = 'flight_search';
    
    // Try to extract destinations
    const destinations = [
      'new york', 'san francisco', 'los angeles', 'miami', 'las vegas', 
      'denver', 'chicago', 'boston', 'seattle', 'dallas'
    ];
    
    for (const destination of destinations) {
      if (messageLower.includes(`to ${destination}`)) {
        entities.destination = destination;
      }
      if (messageLower.includes(`from ${destination}`)) {
        entities.origin = destination;
      }
    }
    
    // Try to extract dates
    const dateRegex = /(\d{1,2}(st|nd|rd|th)?\s+of\s+\w+|\w+\s+\d{1,2}(st|nd|rd|th)?|\d{1,2}\/\d{1,2}(\/\d{2,4})?)/gi;
    const dateMatches = messageLower.match(dateRegex);
    
    if (dateMatches && dateMatches.length > 0) {
      // Very simple date extraction - would need a proper date parser in production
      entities.dates = dateMatches;
    }
  }
  
  // Hotel booking intent
  else if (
    messageLower.includes('book a hotel') || 
    messageLower.includes('hotel in') ||
    messageLower.includes('stay in') ||
    messageLower.includes('accommodation in') ||
    messageLower.includes('hotel booking')
  ) {
    intent = 'hotel_search';
    
    // Try to extract locations
    const locations = [
      'san francisco', 'los angeles', 'miami', 'las vegas', 'denver',
      'chicago', 'boston', 'seattle', 'dallas', 'new york'
    ];
    
    for (const location of locations) {
      if (messageLower.includes(`in ${location}`)) {
        entities.location = location;
      }
    }
  }
  
  // Booking status intent
  else if (
    messageLower.includes('status') || 
    messageLower.includes('my booking') ||
    messageLower.includes('my reservation') ||
    messageLower.includes('check my flight') ||
    messageLower.includes('booking details')
  ) {
    intent = 'status_check';
    
    // Try to extract booking ID
    const bookingIdRegex = /(booking|reservation|confirmation)(\s+number|\s+id)?(\s*[:#]?\s*)([a-z0-9]{6,})/i;
    const bookingMatch = message.match(bookingIdRegex);
    
    if (bookingMatch && bookingMatch[4]) {
      entities.bookingId = bookingMatch[4];
    }
  }
  
  // Upgrade intent
  else if (
    messageLower.includes('upgrade') || 
    messageLower.includes('business class') ||
    messageLower.includes('first class') ||
    messageLower.includes('better seat') ||
    messageLower.includes('change my seat')
  ) {
    intent = 'upgrade';
    
    if (messageLower.includes('business')) {
      entities.class = 'business';
    } else if (messageLower.includes('first')) {
      entities.class = 'first';
    }
  }
  
  // Deals intent
  else if (
    messageLower.includes('deal') || 
    messageLower.includes('offer') ||
    messageLower.includes('discount') ||
    messageLower.includes('promotion') ||
    messageLower.includes('special price')
  ) {
    intent = 'deals';
    
    // Try to extract destinations of interest
    const destinations = [
      'bali', 'paris', 'tokyo', 'new york', 'london', 
      'rome', 'sydney', 'dubai', 'bangkok', 'cancun'
    ];
    
    for (const destination of destinations) {
      if (messageLower.includes(destination)) {
        entities.destination = destination;
      }
    }
  }
  
  return { intent, entities };
}

// Generate response based on intent
function generateResponse(intent: string, entities: any, context: any) {
  let response = {
    message: {
      content: '',
      type: 'text',
      metadata: {}
    },
    context: { ...context },
    triggers: ['flight_search', 'hotel_search', 'deals']
  };
  
  switch (intent) {
    case 'flight_search':
      // Process flight search
      response.message.content = 'I can help you find flights. ';
      response.context.currentIntent = 'flight_search';
      
      if (entities.destination) {
        response.message.content += `I see you're interested in flying to ${entities.destination}. `;
        response.context.lastMentionedLocation = entities.destination;
      }
      
      if (entities.origin) {
        response.message.content += `You'll be departing from ${entities.origin}. `;
      } else {
        response.message.content += 'Where will you be flying from? ';
      }
      
      if (entities.dates && entities.dates.length > 0) {
        response.message.content += `I see you mentioned the date(s): ${entities.dates.join(', ')}. `;
      } else {
        response.message.content += 'When would you like to travel? ';
      }
      
      // If we have both origin and destination, show flight options
      if (entities.origin && entities.destination) {
        const matchingOrigin = 'New York'.toLowerCase();
        const availableDestinations = flights
          .filter(flight => 
            flight.origin.toLowerCase() === matchingOrigin &&
            flight.destination.toLowerCase().includes(entities.destination.toLowerCase())
          )
          .slice(0, 3);
        
        if (availableDestinations.length > 0) {
          response.message.content += 'Here are some flight options I found for you:';
          response.message.type = 'booking';
          
          // Add the first flight details to metadata
          const flight = availableDestinations[0];
          response.message.metadata = {
            flightNumber: flight.flightNumber,
            origin: flight.origin,
            destination: flight.destination,
            departureTime: formatDateForDisplay(flight.departureTime),
            arrivalTime: formatDateForDisplay(flight.arrivalTime),
            price: flight.price
          };
          
          // Include other flight options in the message content
          response.message.content += '\n\n';
          availableDestinations.forEach((flight, index) => {
            response.message.content += `\n**Option ${index + 1}**: ${flight.airline} ${flight.flightNumber}\n` +
              `${flight.origin} to ${flight.destination}\n` +
              `Departure: ${formatDateForDisplay(flight.departureTime)}\n` +
              `Arrival: ${formatDateForDisplay(flight.arrivalTime)}\n` +
              `Price: $${flight.price.toFixed(2)}\n`;
          });
          
          response.message.content += '\n\nWould you like to book one of these flights?';
          
          // Add status check and upgrade triggers
          response.triggers.push('status_check');
          response.triggers.push('upgrade');
        } else {
          response.message.content += 'I couldn\'t find any flights matching your criteria. Would you like to search for different destinations or dates?';
        }
      }
      
      break;
      
    case 'hotel_search':
      // Process hotel search
      response.message.content = 'I can help you find hotels. ';
      response.context.currentIntent = 'hotel_search';
      
      if (entities.location) {
        response.message.content += `I see you're looking for a hotel in ${entities.location}. `;
        response.context.lastMentionedLocation = entities.location;
        
        // Show matching hotels
        const matchingHotels = hotels
          .filter(hotel => 
            hotel.location.toLowerCase().includes(entities.location.toLowerCase())
          )
          .slice(0, 3);
        
        if (matchingHotels.length > 0) {
          response.message.content += 'Here are some hotels I found for you:';
          
          // Include hotel options in the message content
          response.message.content += '\n\n';
          matchingHotels.forEach((hotel, index) => {
            response.message.content += `\n**Option ${index + 1}**: ${hotel.name}\n` +
              `Location: ${hotel.location}\n` +
              `Rating: ${hotel.stars} ⭐\n` +
              `Price: $${hotel.pricePerNight.toFixed(2)} per night\n` +
              `Amenities: ${hotel.amenities.slice(0, 4).join(', ')}\n`;
          });
          
          response.message.content += '\n\nWould you like more details on any of these hotels?';
        } else {
          response.message.content += 'I couldn\'t find any hotels in that location. Would you like to search for a different city?';
        }
      } else {
        response.message.content += 'Which city are you planning to visit?';
      }
      
      break;
      
    case 'status_check':
      // Process booking status check
      response.message.content = 'I can help you check the status of your booking. ';
      response.context.currentIntent = 'status_check';
      
      if (entities.bookingId) {
        // Check if booking exists
        const booking = bookings.find(b => b.id === entities.bookingId);
        
        if (booking) {
          response.message.type = 'confirmation';
          response.message.metadata = {
            bookingId: booking.id
          };
          
          response.message.content = `I found your booking with reference ${booking.id}.\n\n` +
            `**Booking Details**\n` +
            `Type: ${booking.type}\n` +
            `Status: ${booking.status}\n` +
            `Booked on: ${formatDateForDisplay(booking.bookingDate)}\n` +
            `Total Price: $${booking.totalPrice.toFixed(2)}\n\n` +
            `Is there anything specific you'd like to know about this booking?`;
          
          // Add upgrade trigger
          response.triggers.push('upgrade');
        } else {
          response.message.content += `I couldn't find any booking with the reference ${entities.bookingId}. Please check the booking ID and try again.`;
        }
      } else {
        response.message.content += 'Please provide your booking reference number so I can look it up for you.';
      }
      
      break;
      
    case 'upgrade':
      // Process upgrade request
      response.message.content = 'I can help you upgrade your booking. ';
      response.context.currentIntent = 'upgrade';
      
      // For demo purposes, assume user has a booking
      const sampleBooking = bookings[0];
      const flight = flights.find(f => f.id === sampleBooking.flightId);
      
      if (flight) {
        response.message.type = 'update';
        response.message.content += `I found your booking for ${flight.airline} flight ${flight.flightNumber} from ${flight.origin} to ${flight.destination}.\n\n`;
        
        if (entities.class === 'business') {
          response.message.content += `I can upgrade you to Business Class for an additional $${(flight.seats.business.price - flight.seats.economy.price).toFixed(2)}.\n\n` +
            `Business Class benefits include:\n` +
            `- Priority boarding\n` +
            `- Extra legroom\n` +
            `- Premium meals\n` +
            `- Dedicated cabin crew\n\n` +
            `Would you like to proceed with this upgrade?`;
        } else if (entities.class === 'first') {
          response.message.content += `I can upgrade you to First Class for an additional $${(flight.seats.first.price - flight.seats.economy.price).toFixed(2)}.\n\n` +
            `First Class benefits include:\n` +
            `- Priority check-in and boarding\n` +
            `- Spacious seating\n` +
            `- Premium dining experience\n` +
            `- Dedicated cabin crew\n` +
            `- Exclusive lounge access\n\n` +
            `Would you like to proceed with this upgrade?`;
        } else {
          response.message.content += `I can offer you the following upgrade options:\n\n` +
            `1. Business Class: $${flight.seats.business.price.toFixed(2)} (additional $${(flight.seats.business.price - flight.seats.economy.price).toFixed(2)})\n` +
            `2. First Class: $${flight.seats.first.price.toFixed(2)} (additional $${(flight.seats.first.price - flight.seats.economy.price).toFixed(2)})\n\n` +
            `Would you like to upgrade to Business or First Class?`;
        }
      } else {
        response.message.content += 'I couldn\'t find an active booking to upgrade. Do you have a booking reference number?';
      }
      
      break;
      
    case 'deals':
      // Process deals request
      response.message.content = 'I can show you some current travel deals and promotions. ';
      response.context.currentIntent = 'deals';
      
      if (entities.destination) {
        // Find matching offers
        const matchingOffers = offers.filter(offer => 
          offer.destination.toLowerCase() === entities.destination.toLowerCase()
        );
        
        if (matchingOffers.length > 0) {
          const offer = matchingOffers[0];
          response.message.type = 'offer';
          response.message.metadata = {
            destination: offer.destination,
            discountPercentage: offer.discountPercentage,
            offerExpiry: offer.validUntil
          };
          
          response.message.content += `Great! I found a special offer for ${offer.destination}:\n\n` +
            `**${offer.title}**\n` +
            `${offer.description}\n\n` +
            `This offer is valid until ${formatDateForDisplay(offer.validUntil)}. Would you like to see available flights and hotels for this deal?`;
        } else {
          response.message.content += `I don't have any current deals for ${entities.destination}, but here are some other popular offers:`;
          response.message.type = 'offer';
          
          // Show a random offer instead
          const randomOffer = offers[Math.floor(Math.random() * offers.length)];
          response.message.metadata = {
            destination: randomOffer.destination,
            discountPercentage: randomOffer.discountPercentage,
            offerExpiry: randomOffer.validUntil
          };
          
          response.message.content += `\n\n**${randomOffer.title}**\n` +
            `${randomOffer.description}\n\n` +
            `This offer is valid until ${formatDateForDisplay(randomOffer.validUntil)}. Would you like to see available flights and hotels for this deal?`;
        }
      } else {
        // Show random offers
        response.message.content += 'Here are some popular travel deals currently available:';
        response.message.type = 'offer';
        
        const randomOffer = offers[Math.floor(Math.random() * offers.length)];
        response.message.metadata = {
          destination: randomOffer.destination,
          discountPercentage: randomOffer.discountPercentage,
          offerExpiry: randomOffer.validUntil
        };
        
        response.message.content += `\n\n**${randomOffer.title}**\n` +
          `${randomOffer.description}\n\n` +
          `This offer is valid until ${formatDateForDisplay(randomOffer.validUntil)}. Would you like to see available flights and hotels for this deal?`;
      }
      
      break;
      
    default:
      // Handle general conversation
      const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
      const thanks = ['thank you', 'thanks', 'appreciate it', 'thank you so much'];
      const goodbyes = ['bye', 'goodbye', 'see you', 'farewell'];
      
      const messageLower = (entities.originalMessage || '').toLowerCase();
      
      if (greetings.some(greeting => messageLower.includes(greeting))) {
        response.message.content = 'Hello! How can I assist with your travel plans today? I can help you book flights, find hotels, check your booking status, or discover special deals.';
      }
      else if (thanks.some(thank => messageLower.includes(thank))) {
        response.message.content = 'You\'re welcome! Is there anything else I can help you with regarding your travel plans?';
      }
      else if (goodbyes.some(goodbye => messageLower.includes(goodbye))) {
        response.message.content = 'Thank you for chatting with Travel Buddy! Have a great day and safe travels!';
      }
      else {
        response.message.content = 'I\'m here to help with your travel needs. You can ask me about booking flights, finding hotels, checking your booking status, or discovering special travel deals.';
      }
  }
  
  return response;
}

// Process chat messages
router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    console.log('Received message:', message);
    console.log('Current context:', context);
    
    // Basic validation
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Process natural language to identify intent
    const { intent, entities } = processNaturalLanguage(message, context);
    entities.originalMessage = message;
    
    console.log('Detected intent:', intent);
    console.log('Detected entities:', entities);
    
    // Generate response based on intent and entities
    const response = generateResponse(intent, entities, context);
    
    console.log('Generated response:', response);
    
    res.json(response);
  } catch (error) {
    console.error('Error processing booking chat message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;