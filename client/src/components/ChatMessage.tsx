import React from "react";
import { Message } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { InteractiveItinerary } from "./InteractiveItinerary";

interface ChatMessageProps {
  message: Message;
}

// Helper functions for extracting travel data
const extractDestination = (content: string): string => {
  const match = content.match(/\*\*Destination:\*\*\s*([^\n]+)/);
  return match ? match[1].trim() : 'Travel Destination';
};

const extractTravelDetails = (content: string): { source: string; destination: string; departureDate?: string; returnDate?: string } => {
  // Extract source and destination from travel details
  const fromMatch = content.match(/📍\s*From:\s*([^→\n]+)→\s*To:\s*([^\n]+)/);
  const destinationMatch = content.match(/\*\*Destination:\*\*\s*([^\n]+)/);
  const departureDateMatch = content.match(/📅\s*Departure:\s*([^\n]+)/);
  const returnDateMatch = content.match(/📅\s*Return:\s*([^\n]+)/);
  
  let source = 'Your Location';
  let destination = 'Travel Destination';
  
  if (fromMatch) {
    source = fromMatch[1].trim();
    destination = fromMatch[2].trim();
  } else if (destinationMatch) {
    destination = destinationMatch[1].trim();
  }
  
  return {
    source,
    destination,
    departureDate: departureDateMatch ? departureDateMatch[1].trim() : undefined,
    returnDate: returnDateMatch ? returnDateMatch[1].trim() : undefined
  };
};

const getAirportCode = (location: string): string => {
  const airportCodes: { [key: string]: string } = {
    'New York': 'JFK',
    'NYC': 'JFK',
    'New York City': 'JFK',
    'Los Angeles': 'LAX',
    'LA': 'LAX',
    'Chicago': 'ORD',
    'London': 'LHR',
    'Paris': 'CDG',
    'Tokyo': 'NRT',
    'Dubai': 'DXB',
    'Singapore': 'SIN',
    'Bangkok': 'BKK',
    'Seoul': 'ICN',
    'Hong Kong': 'HKG',
    'Sydney': 'SYD',
    'Melbourne': 'MEL',
    'Toronto': 'YYZ',
    'Vancouver': 'YVR',
    'Mumbai': 'BOM',
    'Delhi': 'DEL',
    'Barcelona': 'BCN',
    'Madrid': 'MAD',
    'Rome': 'FCO',
    'Amsterdam': 'AMS',
    'Frankfurt': 'FRA',
    'Zurich': 'ZUR',
    'Istanbul': 'IST',
    'Cairo': 'CAI',
    'Johannesburg': 'JNB',
    'São Paulo': 'GRU',
    'Buenos Aires': 'EZE',
    'Mexico City': 'MEX',
    'Your Location': 'JFK'
  };
  
  // Try exact match first
  if (airportCodes[location]) {
    return airportCodes[location];
  }
  
  // Try partial matches
  for (const [city, code] of Object.entries(airportCodes)) {
    if (location.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(location.toLowerCase())) {
      return code;
    }
  }
  
  // Default fallback
  return 'XXX';
};

const generateSampleFlights = (direction: 'outbound' | 'return', travelDetails?: { source: string; destination: string; departureDate?: string; returnDate?: string }) => {
  const sourceAirport = getAirportCode(travelDetails?.source || 'Your Location');
  const destAirport = getAirportCode(travelDetails?.destination || 'Travel Destination');
  
  const baseFlights = [
    {
      id: `${direction}-1`,
      airline: 'Emirates',
      flightNumber: 'EK 203',
      departure: {
        airport: direction === 'outbound' ? sourceAirport : destAirport,
        time: direction === 'outbound' ? '10:30 AM' : '2:15 PM',
        date: direction === 'outbound' ? (travelDetails?.departureDate || 'June 17') : (travelDetails?.returnDate || 'June 21')
      },
      arrival: {
        airport: direction === 'outbound' ? destAirport : sourceAirport,
        time: direction === 'outbound' ? '11:45 PM' : '8:30 PM',
        date: direction === 'outbound' ? (travelDetails?.departureDate || 'June 18') : (travelDetails?.returnDate || 'June 21')
      },
      duration: '14h 15m',
      price: 850,
      class: 'Economy' as const,
      stops: 0,
      amenities: ['WiFi', 'Meals', 'Entertainment'],
      baggage: '23kg included'
    },
    {
      id: `${direction}-2`,
      airline: 'Singapore Airlines',
      flightNumber: 'SQ 25',
      departure: {
        airport: direction === 'outbound' ? 'JFK' : 'SIN',
        time: direction === 'outbound' ? '1:20 PM' : '11:50 AM',
        date: direction === 'outbound' ? 'June 17' : 'June 21'
      },
      arrival: {
        airport: direction === 'outbound' ? 'SIN' : 'JFK',
        time: direction === 'outbound' ? '7:30 PM+1' : '6:45 PM',
        date: direction === 'outbound' ? 'June 18' : 'June 21'
      },
      duration: '18h 10m',
      price: 1200,
      class: 'Premium Economy' as const,
      stops: 1,
      amenities: ['WiFi', 'Meals', 'Extra Legroom'],
      baggage: '30kg included'
    },
    {
      id: `${direction}-3`,
      airline: 'Qatar Airways',
      flightNumber: 'QR 702',
      departure: {
        airport: direction === 'outbound' ? 'JFK' : 'DOH',
        time: direction === 'outbound' ? '8:15 PM' : '1:35 AM',
        date: direction === 'outbound' ? 'June 17' : 'June 21'
      },
      arrival: {
        airport: direction === 'outbound' ? 'DOH' : 'JFK',
        time: direction === 'outbound' ? '6:40 PM+1' : '8:55 AM',
        date: direction === 'outbound' ? 'June 18' : 'June 21'
      },
      duration: '12h 25m',
      price: 950,
      class: 'Business' as const,
      stops: 0,
      amenities: ['WiFi', 'Gourmet Meals', 'Flat Bed'],
      baggage: '40kg included'
    }
  ];
  
  return baseFlights;
};

const generateSampleDayPlans = () => {
  return [
    {
      day: 1,
      date: 'June 18, 2025',
      location: 'Singapore',
      morning: [
        {
          id: 'morning-1-1',
          name: 'Gardens by the Bay Tour',
          description: 'Explore the iconic Supertree Grove and Cloud Forest',
          duration: '3 hours',
          cost: 35,
          category: 'sightseeing',
          location: 'Gardens by the Bay',
          timeSlot: 'morning' as const,
          groupSize: 'Up to 15 people',
          highlights: ['Supertree Grove', 'Cloud Forest', 'Flower Dome']
        },
        {
          id: 'morning-1-2',
          name: 'Singapore Botanic Gardens Walk',
          description: 'UNESCO World Heritage site with orchid garden',
          duration: '2.5 hours',
          cost: 15,
          category: 'culture',
          location: 'Botanic Gardens',
          timeSlot: 'morning' as const,
          groupSize: 'Flexible',
          highlights: ['Orchid Garden', 'Heritage Trees', 'Swan Lake']
        }
      ],
      afternoon: [
        {
          id: 'afternoon-1-1',
          name: 'Marina Bay Sands SkyPark',
          description: 'Rooftop infinity pool and observation deck',
          duration: '2 hours',
          cost: 65,
          category: 'sightseeing',
          location: 'Marina Bay Sands',
          timeSlot: 'afternoon' as const,
          groupSize: 'Up to 20 people',
          highlights: ['Infinity Pool', 'City Views', 'Photo Opportunities']
        },
        {
          id: 'afternoon-1-2',
          name: 'Chinatown Heritage Center',
          description: 'Cultural immersion in historic Chinatown',
          duration: '2.5 hours',
          cost: 25,
          category: 'culture',
          location: 'Chinatown',
          timeSlot: 'afternoon' as const,
          groupSize: 'Small groups',
          highlights: ['Heritage Center', 'Traditional Shops', 'Street Food']
        }
      ],
      evening: [
        {
          id: 'evening-1-1',
          name: 'Singapore River Cruise',
          description: 'Evening cruise with city skyline views',
          duration: '1.5 hours',
          cost: 45,
          category: 'relaxation',
          location: 'Singapore River',
          timeSlot: 'evening' as const,
          groupSize: 'Up to 40 people',
          highlights: ['City Lights', 'Historical Commentary', 'Refreshments']
        },
        {
          id: 'evening-1-2',
          name: 'Clarke Quay Dining',
          description: 'Riverside dining and nightlife experience',
          duration: '3 hours',
          cost: 80,
          category: 'food',
          location: 'Clarke Quay',
          timeSlot: 'evening' as const,
          groupSize: 'Flexible',
          highlights: ['Riverside Views', 'International Cuisine', 'Live Music']
        }
      ]
    }
  ];
};

export function TypingIndicator() {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mr-3">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      <div className="bg-light text-gray-800 rounded-lg p-3 shadow-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}

      <div
        className={`chat-message ${isUser ? "bg-primary text-white" : "bg-light text-gray-800"} rounded-lg p-3 shadow-sm relative`}
      >
        {/* Model info badge for AI messages */}
        {!isUser && message.modelInfo && (
          <div className="absolute top-0 right-0 transform -translate-y-3/4 bg-gray-100 text-xs text-gray-700 px-2 py-1 rounded-full shadow-sm">
            {message.modelInfo.provider && message.modelInfo.model ? (
              <span className="flex items-center">
                <span className="font-medium">
                  {message.modelInfo.provider === 'google' 
                    ? 'Gemini' 
                    : message.modelInfo.provider === 'anthropic' 
                      ? 'Claude' 
                      : message.modelInfo.provider}
                </span>
                <span className="mx-1">•</span>
                <span className="text-gray-500">{message.modelInfo.model.split('-')[0]}</span>
              </span>
            ) : message.modelInfo.note ? (
              <span>{message.modelInfo.note}</span>
            ) : (
              <span>AI Assistant</span>
            )}
          </div>
        )}
        
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="space-y-6">
            {/* Check if message contains flight and activity data */}
            {message.content.includes('Flight Options') && message.content.includes('Interactive Daily Activities') && (
              <div className="mb-6">
                <InteractiveItinerary
                  destination={extractDestination(message.content)}
                  outboundFlights={generateSampleFlights('outbound', extractTravelDetails(message.content))}
                  returnFlights={generateSampleFlights('return', extractTravelDetails(message.content))}
                  dayPlans={generateSampleDayPlans()}
                  travelDetails={extractTravelDetails(message.content)}
                  onComplete={(selections) => {
                    console.log('User selections:', selections);
                    // Handle user selections here
                  }}
                />
              </div>
            )}
            
            <div className="prose max-w-none dark:prose-invert prose-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }: any) => (
                    <h1
                      className="text-2xl font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-3"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }: any) => (
                    <h2
                      className="text-xl font-bold mb-4 text-gray-800 mt-8"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }: any) => (
                    <h3
                      className="text-lg font-semibold mb-3 text-gray-700 mt-6"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }: any) => (
                    <p className="mb-4 leading-relaxed" {...props} />
                  ),
                  ul: ({ node, ...props }: any) => (
                    <ul className="mb-4 space-y-2" {...props} />
                  ),
                  ol: ({ node, ...props }: any) => (
                    <ol className="mb-4 space-y-2" {...props} />
                  ),
                  li: ({ node, ...props }: any) => (
                    <li className="flex items-start" {...props} />
                  ),
                  strong: ({ node, ...props }: any) => (
                    <strong className="font-semibold text-gray-900" {...props} />
                  ),
                  em: ({ node, ...props }: any) => (
                    <em className="italic text-gray-700" {...props} />
                  ),
                  blockquote: ({ node, ...props }: any) => (
                    <blockquote
                      className="border-l-4 border-blue-500 pl-4 italic text-gray-600 bg-blue-50 p-4 rounded-r-lg my-4"
                      {...props}
                    />
                  ),
                  code: ({ node, inline, ...props }: any) =>
                    inline ? (
                      <code
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono"
                        {...props}
                      />
                    ) : (
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                        <code className="font-mono text-sm" {...props} />
                      </div>
                    ),
                  pre: ({ node, ...props }: any) => (
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                      <pre className="font-mono text-sm" {...props} />
                    </div>
                  ),
                  table: ({ node, ...props }: any) => (
                    <div className="overflow-x-auto my-6">
                      <table
                        className="min-w-full border-collapse border border-gray-300 bg-white rounded-lg shadow-sm"
                        {...props}
                      />
                    </div>
                  ),
                  thead: ({ node, ...props }: any) => (
                    <thead className="bg-gray-50" {...props} />
                  ),
                  tbody: ({ node, ...props }: any) => (
                    <tbody className="divide-y divide-gray-200" {...props} />
                  ),
                  tr: ({ node, ...props }: any) => (
                    <tr className="hover:bg-gray-50" {...props} />
                  ),
                  th: ({ node, ...props }: any) => (
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300"
                      {...props}
                    />
                  ),
                  td: ({ node, ...props }: any) => (
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-300"
                      {...props}
                    />
                  ),
                  a: ({ node, ...props }: any) => (
                    <a
                      className="text-blue-600 hover:text-blue-800 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}