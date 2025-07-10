import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, Clock, DollarSign, Wifi, Utensils, Luggage, MapPin } from 'lucide-react';

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  class: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  stops: number;
  amenities: string[];
  baggage: string;
}

interface FlightSelectorProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  direction: 'outbound' | 'return';
  travelDetails?: {
    source: string;
    destination: string;
  };
}

export function FlightSelector({ flights, onSelectFlight, direction, travelDetails }: FlightSelectorProps) {
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<string>('Your Location');

  useEffect(() => {
    // Get user's location using browser geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use reverse geocoding to get location name
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const locationName = data.city && data.countryName 
              ? `${data.city}, ${data.countryName}`
              : data.locality || data.countryName || 'Your Location';
            setUserLocation(locationName);
          } catch (error) {
            console.log('Failed to get location name, using default');
            setUserLocation('Your Location');
          }
        },
        (error) => {
          console.log('Geolocation denied or failed, using default location');
          setUserLocation('Your Location');
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    }
  }, []);

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight.id);
    onSelectFlight(flight);
  };

  const getClassColor = (flightClass: string) => {
    switch (flightClass) {
      case 'Economy': return 'bg-gray-100 text-gray-800';
      case 'Premium Economy': return 'bg-blue-100 text-blue-800';
      case 'Business': return 'bg-purple-100 text-purple-800';
      case 'First': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStopsText = (stops: number) => {
    if (stops === 0) return 'Non-stop';
    if (stops === 1) return '1 stop';
    return `${stops} stops`;
  };

  const getStopsBadgeColor = (stops: number) => {
    if (stops === 0) return 'bg-green-100 text-green-800';
    if (stops === 1) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'meals': return <Utensils className="h-4 w-4" />;
      case 'extra baggage': return <Luggage className="h-4 w-4" />;
      default: return null;
    }
  };

  const getRouteDisplay = () => {
    if (!travelDetails) return null;
    
    const { destination } = travelDetails;
    // For outbound flights: User Location -> Destination
    // For return flights: Destination -> User Location
    const fromLocation = direction === 'outbound' ? userLocation : destination;
    const toLocation = direction === 'outbound' ? destination : userLocation;
    
    return (
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
        <div className="flex items-center justify-center text-sm text-blue-700">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-blue-600" />
            <span className="font-medium">{fromLocation}</span>
          </div>
          <Plane className="h-4 w-4 mx-3 text-blue-600" />
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-blue-600" />
            <span className="font-medium">{toLocation}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Plane className="h-5 w-5 mr-2 text-blue-600" />
          {direction === 'outbound' ? 'Outbound Flights' : 'Return Flights'}
        </h3>
        <Badge variant="outline" className="text-sm">
          {flights.length} options available
        </Badge>
      </div>
      
      {getRouteDisplay()}

      <div className="grid gap-4">
        {flights.map((flight) => (
          <Card 
            key={flight.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedFlight === flight.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleFlightSelect(flight)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Plane className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {flight.airline}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{flight.flightNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${flight.price}
                  </div>
                  <Badge className={getClassColor(flight.class)}>
                    {flight.class}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Departure Info */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Departure</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {flight.departure.time}
                  </div>
                  <div className="text-sm text-gray-600">
                    {flight.departure.airport}
                  </div>
                  <div className="text-sm text-gray-600">
                    {flight.departure.date}
                  </div>
                </div>

                {/* Flight Duration & Stops */}
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {flight.duration}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="h-px bg-gray-300 w-full"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white px-2 text-xs text-gray-500">
                        {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {flight.baggage}
                  </div>
                </div>

                {/* Arrival Info */}
                <div className="space-y-2 text-right">
                  <div className="text-sm font-medium text-gray-700">Arrival</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {flight.arrival.time}
                  </div>
                  <div className="text-sm text-gray-600">
                    {flight.arrival.airport}
                  </div>
                  <div className="text-sm text-gray-600">
                    {flight.arrival.date}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {flight.amenities.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">Amenities:</span>
                    <div className="flex items-center space-x-3">
                      {flight.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-1">
                          {getAmenityIcon(amenity)}
                          <span className="text-sm text-gray-600">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Select Button */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <Button 
                  className={`w-full ${
                    selectedFlight === flight.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlightSelect(flight);
                  }}
                >
                  {selectedFlight === flight.id ? 'Selected ✓' : 'Select This Flight'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}