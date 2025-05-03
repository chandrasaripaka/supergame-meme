import React, { useState } from 'react';
import { Flight } from '@/lib/api';
import { useMobile } from '@/hooks/use-mobile';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Sector, LineChart, Line
} from 'recharts';

interface FlightComparisonProps {
  flights: Flight[];
  cheapestByAirline: Flight[];
  isLoading: boolean;
}

export function FlightComparison({ flights, cheapestByAirline, isLoading }: FlightComparisonProps) {
  const { isMobile } = useMobile();
  const [activeAirlineIndex, setActiveAirlineIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'stops'>('price');
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div className="h-48 bg-slate-200 rounded mt-6"></div>
        </div>
      </div>
    );
  }
  
  if (!flights || flights.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-500 text-center">No flight data available for this destination</p>
      </div>
    );
  }
  
  // Prepare price comparison data for the selected airlines
  const airlinePriceData = cheapestByAirline.map((flight) => ({
    name: flight.airline.split(' ')[0], // Use just first word of airline name for cleaner display
    price: flight.price,
    fullName: flight.airline,
    logo: flight.logo,
    fill: getRandomColor(flight.airline)
  })).sort((a, b) => a.price - b.price);
  
  // Sort flights based on selected criteria
  const sortedFlights = [...flights].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') {
      // Convert duration strings like "5h 30m" to minutes for comparison
      const getMinutes = (duration: string) => {
        const match = duration.match(/(\d+)h\s+(\d+)m/);
        if (match) {
          return parseInt(match[1]) * 60 + parseInt(match[2]);
        }
        return 0;
      };
      return getMinutes(a.duration) - getMinutes(b.duration);
    }
    return a.stops - b.stops;
  });
  
  // Randomly generate colors for airlines
  function getRandomColor(seed: string): string {
    // Simple hash function to generate a deterministic value from a string
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold mb-6 pl-2 flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text border-l-4 border-blue-500 py-1">
        ✈️ Flight Comparison
      </h3>
      
      {/* Sorting Controls */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button 
          onClick={() => setSortBy('price')}
          className={`px-4 py-2 rounded-md text-sm ${sortBy === 'price' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Sort by Price
        </button>
        <button 
          onClick={() => setSortBy('duration')}
          className={`px-4 py-2 rounded-md text-sm ${sortBy === 'duration' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Sort by Duration
        </button>
        <button 
          onClick={() => setSortBy('stops')}
          className={`px-4 py-2 rounded-md text-sm ${sortBy === 'stops' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Sort by Stops
        </button>
      </div>
      
      {/* Airline Price Comparison Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h4 className="text-gray-700 text-sm font-medium uppercase tracking-wide text-center mb-4">
          Price Comparison by Airline
        </h4>
        <div className={isMobile ? "h-60" : "h-80"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={airlinePriceData}
              margin={isMobile ? 
                { top: 20, right: 10, left: 10, bottom: 60 } : 
                { top: 20, right: 30, left: 20, bottom: 50 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis 
                label={{ 
                  value: 'Price (USD)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Price']}
                labelFormatter={(label) => {
                  const airline = airlinePriceData.find(a => a.name === label);
                  return airline ? airline.fullName : label;
                }}
              />
              <Legend wrapperStyle={isMobile ? { fontSize: '10px' } : undefined} />
              <Bar 
                dataKey="price" 
                name="Price" 
                animationDuration={1000}
                onClick={(data, index) => setActiveAirlineIndex(index === activeAirlineIndex ? null : index)}
              >
                {airlinePriceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill} 
                    fillOpacity={activeAirlineIndex === null || activeAirlineIndex === index ? 1 : 0.6}
                    stroke={activeAirlineIndex === index ? '#000' : undefined}
                    strokeWidth={activeAirlineIndex === index ? 1 : undefined}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Flight Cards */}
      <div className="space-y-4">
        <h4 className="text-gray-700 text-base font-medium mb-2">Top Flight Options</h4>
        
        {sortedFlights.slice(0, 5).map((flight) => (
          <div key={flight.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row">
              {/* Airline Info */}
              <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200 flex items-center md:w-48">
                <img src={flight.logo} alt={flight.airline} className="h-8 w-auto mr-3" />
                <div>
                  <div className="font-medium text-gray-900">{flight.airline}</div>
                  <div className="text-xs text-gray-500">{flight.flightNumber}</div>
                </div>
              </div>
              
              {/* Flight Details */}
              <div className="p-4 flex-grow flex flex-col md:flex-row md:items-center">
                {/* Departure */}
                <div className="text-center md:text-left mb-2 md:mb-0">
                  <div className="text-lg font-bold">{flight.departureTime}</div>
                  <div className="text-gray-700">{flight.departureAirport}</div>
                  <div className="text-xs text-gray-500">{flight.departureCity}</div>
                </div>
                
                {/* Flight Path */}
                <div className="flex-grow px-4 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                  <div className="relative w-full">
                    <div className="absolute w-full h-0.5 bg-gray-300"></div>
                    <div className="flex justify-between">
                      <div className="rounded-full w-2 h-2 bg-gray-700 relative top-[-3px]"></div>
                      {flight.stops > 0 && (
                        <div className="rounded-full w-2 h-2 bg-gray-500 relative top-[-3px]"></div>
                      )}
                      <div className="rounded-full w-2 h-2 bg-gray-700 relative top-[-3px]"></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  </div>
                </div>
                
                {/* Arrival */}
                <div className="text-center md:text-right mt-2 md:mt-0">
                  <div className="text-lg font-bold">{flight.arrivalTime}</div>
                  <div className="text-gray-700">{flight.arrivalAirport}</div>
                  <div className="text-xs text-gray-500">{flight.arrivalCity}</div>
                </div>
              </div>
              
              {/* Price */}
              <div className="p-4 bg-blue-50 flex flex-row md:flex-col justify-between md:justify-center items-center md:w-40">
                <div className="text-sm text-gray-500">Price</div>
                <div className="text-xl font-bold text-blue-700">${flight.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* View All Flights Button */}
      {flights.length > 5 && (
        <div className="mt-4 text-center">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
            View All {flights.length} Flights
          </button>
        </div>
      )}
    </div>
  );
}