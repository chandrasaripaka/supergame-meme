import React, { useState, useEffect } from 'react';
import { Flight } from '@/lib/api';
import { useMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Sector, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

interface FlightComparisonProps {
  flights: Flight[];
  cheapestByAirline: Flight[];
  isLoading: boolean;
}

export function FlightComparison({ flights, cheapestByAirline, isLoading }: FlightComparisonProps) {
  const { isMobile } = useMobile();
  const { toast } = useToast();
  const [activeAirlineIndex, setActiveAirlineIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'stops'>('price');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [showAllFlights, setShowAllFlights] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedFlights, setSelectedFlights] = useState<Flight[]>([]);
  const [viewMode, setViewMode] = useState<'chart' | 'cards' | 'map'>('chart');
  
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
  
  // Initialize min/max price once when component mounts
  useEffect(() => {
    if (flights && flights.length > 0) {
      const prices = flights.map(f => f.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange([minPrice, maxPrice]);
    }
  }, [flights]);

  // Get list of all airlines (in a TypeScript-friendly way)
  const uniqueAirlines = Array.from(new Set(flights.map(f => f.airline)));
  
  // Apply filters
  const filteredFlights = flights.filter(flight => {
    // Filter by selected airlines
    if (selectedAirlines.length > 0 && !selectedAirlines.includes(flight.airline)) {
      return false;
    }
    
    // Filter by price range
    if (flight.price < priceRange[0] || flight.price > priceRange[1]) {
      return false;
    }
    
    return true;
  });
  
  // Sort filtered flights
  const sortedAndFilteredFlights = [...filteredFlights].sort((a, b) => {
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
  
  // Get flights to display based on showAll setting
  const displayedFlights = showAllFlights 
    ? sortedAndFilteredFlights 
    : sortedAndFilteredFlights.slice(0, 5);
  
  // Handle flight selection for comparison
  const toggleFlightSelection = (flight: Flight) => {
    if (selectedFlights.some(f => f.id === flight.id)) {
      setSelectedFlights(selectedFlights.filter(f => f.id !== flight.id));
    } else {
      if (selectedFlights.length < 3) {
        setSelectedFlights([...selectedFlights, flight]);
      } else {
        toast({
          title: "Maximum selection reached",
          description: "You can compare up to 3 flights at a time. Deselect a flight first.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Handle airline selection toggle
  const toggleAirlineSelection = (airline: string) => {
    if (selectedAirlines.includes(airline)) {
      setSelectedAirlines(selectedAirlines.filter(a => a !== airline));
    } else {
      setSelectedAirlines([...selectedAirlines, airline]);
    }
  };
  
  // Calculate savings compared to most expensive option
  const calculateSavings = (price: number) => {
    const maxPrice = Math.max(...flights.map(f => f.price));
    return maxPrice - price;
  };
  
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
      
      {/* View Mode Selector */}
      <div className="mb-6">
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('chart')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              viewMode === 'chart' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Price Chart
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              viewMode === 'cards' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Flight Cards
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              viewMode === 'map' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Route Map
          </button>
        </div>
      </div>
      
      {/* Interactive Controls and Filters */}
      <div className="mb-6 space-y-4">
        {/* Sorting Controls */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setSortBy('price')}
            className={`px-4 py-2 rounded-md text-sm ${sortBy === 'price' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort by Price
            </span>
          </button>
          <button 
            onClick={() => setSortBy('duration')}
            className={`px-4 py-2 rounded-md text-sm ${sortBy === 'duration' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sort by Duration
            </span>
          </button>
          <button 
            onClick={() => setSortBy('stops')}
            className={`px-4 py-2 rounded-md text-sm ${sortBy === 'stops' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              Sort by Stops
            </span>
          </button>
        </div>
        
        {/* Compare Mode Toggle */}
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
          <span className="text-sm font-medium text-gray-700">
            {compareMode ? "Select up to 3 flights to compare" : "Enable comparison mode to select flights"}
          </span>
          <label className="inline-flex items-center cursor-pointer">
            <span className="mr-3 text-sm font-medium text-gray-700">Compare Mode</span>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={compareMode}
                onChange={() => {
                  setCompareMode(!compareMode);
                  if (!compareMode) {
                    setSelectedFlights([]);
                  }
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>
        </div>
        
        {/* Airline Filters */}
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h5 className="text-sm font-medium text-gray-700">Filter by Airline</h5>
            <button 
              onClick={() => setSelectedAirlines(selectedAirlines.length === uniqueAirlines.length ? [] : [...uniqueAirlines])}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {selectedAirlines.length === uniqueAirlines.length ? 'Clear All' : 'Select All'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueAirlines.map((airline) => (
              <button
                key={airline}
                onClick={() => toggleAirlineSelection(airline)}
                className={`px-3 py-1 text-xs rounded-full flex items-center ${
                  selectedAirlines.includes(airline) || selectedAirlines.length === 0
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                {selectedAirlines.includes(airline) && (
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {airline}
              </button>
            ))}
          </div>
        </div>
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
      
      {/* Selected Flights for Comparison */}
      {compareMode && selectedFlights.length > 0 && (
        <div className="mb-6">
          <h4 className="text-gray-700 text-base font-medium mb-4">Selected Flights Comparison</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Airline</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stops</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedFlights.map((flight) => (
                  <tr key={flight.id} className="hover:bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={flight.logo} alt={flight.airline} className="h-8 w-auto mr-3" />
                        <div className="text-sm font-medium text-gray-900">{flight.airline}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{flight.departureTime}</div>
                      <div className="text-xs text-gray-500">{flight.departureAirport}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{flight.arrivalTime}</div>
                      <div className="text-xs text-gray-500">{flight.arrivalAirport}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{flight.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {flight.stops === 0 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Nonstop</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{flight.stops} Stop{flight.stops > 1 ? 's' : ''}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">${flight.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {selectedFlights.length > 1 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Price Difference</h5>
              <div className="flex items-center justify-between text-sm">
                <span>Cheapest option: <span className="font-bold text-green-600">
                  ${Math.min(...selectedFlights.map(f => f.price))}
                </span></span>
                <span>Difference: <span className="font-bold text-red-600">
                  ${(Math.max(...selectedFlights.map(f => f.price)) - Math.min(...selectedFlights.map(f => f.price))).toFixed(2)}
                </span></span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Flight Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-gray-700 text-base font-medium">
            {showAllFlights ? "All Flight Options" : "Top Flight Options"} 
            <span className="text-gray-500 text-sm ml-2">({sortedAndFilteredFlights.length} results)</span>
          </h4>
          
          {displayedFlights.length > 0 && flights.length > 5 && (
            <button 
              onClick={() => setShowAllFlights(!showAllFlights)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {showAllFlights ? "Show Less" : "Show All"}
            </button>
          )}
        </div>
        
        {displayedFlights.length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No flights match your filter criteria</p>
            <button 
              onClick={() => {
                setSelectedAirlines([]);
                setPriceRange([0, Math.max(...flights.map(f => f.price))]);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          displayedFlights.map((flight) => (
            <div 
              key={flight.id} 
              onClick={() => compareMode && toggleFlightSelection(flight)}
              className={`bg-white rounded-lg border ${
                compareMode 
                  ? selectedFlights.some(f => f.id === flight.id)
                    ? "border-blue-500 shadow-md"
                    : "border-gray-200 hover:border-blue-300"
                  : "border-gray-200"
              } overflow-hidden hover:shadow-md transition-all cursor-pointer`}
            >
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
                <div className="p-4 relative bg-blue-50 flex flex-row md:flex-col justify-between md:justify-center items-center md:w-40">
                  {/* "Best Deal" Badge for cheapest flight */}
                  {flight.price === Math.min(...flights.map(f => f.price)) && (
                    <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                        Best Deal
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="text-xl font-bold text-blue-700">${flight.price}</div>
                  
                  {/* Savings compared to most expensive */}
                  {calculateSavings(flight.price) > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      Save ${calculateSavings(flight.price)}
                    </div>
                  )}
                  
                  {/* Select Button for comparison mode */}
                  {compareMode && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFlightSelection(flight);
                      }}
                      className={`mt-2 px-3 py-1 text-xs rounded-md ${
                        selectedFlights.some(f => f.id === flight.id)
                          ? "bg-blue-600 text-white"
                          : "bg-white text-blue-600 border border-blue-600"
                      }`}
                    >
                      {selectedFlights.some(f => f.id === flight.id) ? "Selected" : "Select"}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Expandable Flight Details */}
              <div className="border-t border-gray-200 bg-gray-50 p-4 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-500 block">Aircraft</span>
                  <span className="font-medium">Boeing 737</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Travel Time</span>
                  <span className="font-medium">{flight.duration}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Fare Class</span>
                  <span className="font-medium">Economy</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* View All Flights Button */}
      {!showAllFlights && sortedAndFilteredFlights.length > 5 && (
        <div className="mt-4 text-center">
          <button 
            onClick={() => setShowAllFlights(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            View All {sortedAndFilteredFlights.length} Flights
          </button>
        </div>
      )}
    </div>
  );
}