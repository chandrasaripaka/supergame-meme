import axios from 'axios';

export interface Flight {
  id: string;
  airline: string;
  logo: string;
  flightNumber: string;
  departureAirport: string;
  departureCity: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
}

export interface FlightSearch {
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  returnDate?: string;
}

/**
 * Search for flights using external API or generate realistic flight data
 * Will use a real flight API when available
 */
export async function searchFlights(search: FlightSearch): Promise<Flight[]> {
  try {
    // In a production environment, this would call a real flight search API
    // For now, we'll generate realistic data based on the search parameters
    
    const airlines = [
      { name: 'American Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/AA.png' },
      { name: 'United Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/UA.png' },
      { name: 'Delta Air Lines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/DL.png' },
      { name: 'JetBlue Airways', logo: 'https://www.gstatic.com/flights/airline_logos/70px/B6.png' },
      { name: 'Southwest Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/WN.png' },
      { name: 'Air France', logo: 'https://www.gstatic.com/flights/airline_logos/70px/AF.png' },
      { name: 'British Airways', logo: 'https://www.gstatic.com/flights/airline_logos/70px/BA.png' },
      { name: 'Emirates', logo: 'https://www.gstatic.com/flights/airline_logos/70px/EK.png' },
      { name: 'Lufthansa', logo: 'https://www.gstatic.com/flights/airline_logos/70px/LH.png' },
      { name: 'Singapore Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/SQ.png' }
    ];
    
    // Generate random departure and arrival times
    const generateTimes = () => {
      const hours = Math.floor(Math.random() * 24);
      const minutes = Math.floor(Math.random() * 60);
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      return `${formattedHours}:${formattedMinutes}`;
    };
    
    // Generate random duration between 2 and 15 hours
    const generateDuration = () => {
      const hours = Math.floor(Math.random() * 13) + 2;
      const minutes = Math.floor(Math.random() * 60);
      return `${hours}h ${minutes}m`;
    };
    
    // Generate random price between $200 and $1500
    const generatePrice = () => {
      return Math.floor(Math.random() * 1300) + 200;
    };
    
    // Generate flight number
    const generateFlightNumber = (airline: string) => {
      const prefix = airline.split(' ')[0].charAt(0) + (airline.split(' ')[1]?.charAt(0) || '');
      const number = Math.floor(Math.random() * 9000) + 1000;
      return `${prefix}${number}`;
    };
    
    // Generate different flight options
    const flights: Flight[] = [];
    
    for (let i = 0; i < 15; i++) {
      const randomAirlineIndex = Math.floor(Math.random() * airlines.length);
      const airline = airlines[randomAirlineIndex];
      const stops = Math.floor(Math.random() * 3); // 0, 1, or 2 stops
      
      flights.push({
        id: `flight-${i + 1}`,
        airline: airline.name,
        logo: airline.logo,
        flightNumber: generateFlightNumber(airline.name),
        departureAirport: `${search.departureCity.slice(0, 3).toUpperCase()}`,
        departureCity: search.departureCity,
        departureTime: generateTimes(),
        arrivalAirport: `${search.arrivalCity.slice(0, 3).toUpperCase()}`,
        arrivalCity: search.arrivalCity,
        arrivalTime: generateTimes(),
        duration: generateDuration(),
        stops: stops,
        price: generatePrice(),
        currency: 'USD'
      });
    }
    
    // Sort flights by price
    return flights.sort((a, b) => a.price - b.price);
  } catch (error) {
    console.error('Error searching flights:', error);
    throw new Error('Failed to search flights');
  }
}

/**
 * Get flight recommendations for a destination
 */
export async function getFlightRecommendations(destination: string): Promise<Flight[]> {
  // Use the search function with a default departure city
  return searchFlights({
    departureCity: 'New York',
    arrivalCity: destination,
    departureDate: new Date().toISOString().split('T')[0]
  });
}

/**
 * Group flights by airline for comparison
 */
export function groupFlightsByAirline(flights: Flight[]): { [airline: string]: Flight[] } {
  return flights.reduce((acc, flight) => {
    if (!acc[flight.airline]) {
      acc[flight.airline] = [];
    }
    acc[flight.airline].push(flight);
    return acc;
  }, {} as { [airline: string]: Flight[] });
}

/**
 * Get the cheapest flight for each airline
 */
export function getCheapestFlightsByAirline(flights: Flight[]): Flight[] {
  const groupedFlights = groupFlightsByAirline(flights);
  
  return Object.values(groupedFlights).map(airlineFlights => {
    // Sort by price and return the cheapest
    return airlineFlights.sort((a, b) => a.price - b.price)[0];
  });
}