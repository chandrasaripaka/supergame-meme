import React, { useState, useEffect } from 'react';
import { FlightSelector } from './FlightSelector';
import { DayActivitySelector } from './DayActivitySelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plane, Calendar, DollarSign, CheckCircle, Loader2 } from 'lucide-react';

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: { airport: string; time: string; date: string; };
  arrival: { airport: string; time: string; date: string; };
  duration: string;
  price: number;
  class: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  stops: number;
  amenities: string[];
  baggage: string;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  duration: string;
  cost: number;
  category: string;
  location: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  groupSize: string;
  highlights: string[];
}

interface DayPlan {
  day: number;
  date: string;
  location: string;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
}

interface InteractiveItineraryProps {
  destination: string;
  outboundFlights: Flight[];
  returnFlights: Flight[];
  dayPlans: DayPlan[];
  travelDetails?: {
    source: string;
    destination: string;
    departureDate?: string;
    returnDate?: string;
  };
  onComplete: (selections: {
    outboundFlight: Flight | null;
    returnFlight: Flight | null;
    activities: { [key: string]: string };
  }) => void;
}

export function InteractiveItinerary({ 
  destination, 
  outboundFlights: initialOutboundFlights, 
  returnFlights: initialReturnFlights, 
  dayPlans, 
  travelDetails,
  onComplete 
}: InteractiveItineraryProps) {
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<Flight | null>(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<Flight | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<{ [key: string]: string }>({});
  const [outboundFlights, setOutboundFlights] = useState<Flight[]>(initialOutboundFlights);
  const [returnFlights, setReturnFlights] = useState<Flight[]>(initialReturnFlights);
  const [loadingFlights, setLoadingFlights] = useState(false);

  // Load real flight data when component mounts
  useEffect(() => {
    const loadFlightData = async () => {
      if (!travelDetails?.source || !travelDetails?.destination) return;
      
      setLoadingFlights(true);
      try {
        // Load outbound flights
        const outboundResponse = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            departureCity: travelDetails.source,
            arrivalCity: travelDetails.destination,
            departureDate: travelDetails.departureDate || '2025-06-17'
          })
        });

        if (outboundResponse.ok) {
          const outboundData = await outboundResponse.json();
          if (outboundData.flights) {
            setOutboundFlights(outboundData.flights.map((flight: any) => {
              // Calculate arrival date based on flight duration and departure date
              const departureDate = new Date(travelDetails.departureDate || '2025-06-17');
              const arrivalDate = new Date(departureDate);
              
              // Parse duration to determine if arrival is next day
              const durationMatch = flight.duration?.match(/(\d+)h\s*(\d+)?m?/);
              if (durationMatch) {
                const hours = parseInt(durationMatch[1]);
                const minutes = parseInt(durationMatch[2] || '0');
                
                // Add flight duration to departure time to get arrival date
                const [depHour, depMinute] = flight.departureTime.split(':').map(Number);
                const totalMinutes = depHour * 60 + depMinute + hours * 60 + minutes;
                
                if (totalMinutes >= 24 * 60) {
                  arrivalDate.setDate(arrivalDate.getDate() + 1);
                }
              }
              
              return {
                id: flight.id,
                airline: flight.airline,
                flightNumber: flight.flightNumber,
                departure: {
                  airport: flight.departureAirport,
                  time: flight.departureTime,
                  date: departureDate.toISOString().split('T')[0]
                },
                arrival: {
                  airport: flight.arrivalAirport,
                  time: flight.arrivalTime,
                  date: arrivalDate.toISOString().split('T')[0]
                },
                duration: flight.duration,
                price: flight.price,
                class: flight.class as any || 'Economy',
                stops: flight.stops,
                amenities: flight.amenities || ['WiFi', 'Meals'],
                baggage: flight.baggage || '23kg included'
              };
            }));
          }
        }

        // Load return flights
        const returnResponse = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            departureCity: travelDetails.destination,
            arrivalCity: travelDetails.source,
            departureDate: travelDetails.returnDate || '2025-06-21'
          })
        });

        if (returnResponse.ok) {
          const returnData = await returnResponse.json();
          if (returnData.flights) {
            setReturnFlights(returnData.flights.map((flight: any) => {
              // Calculate arrival date based on flight duration and return date
              const departureDate = new Date(travelDetails.returnDate || '2025-06-21');
              const arrivalDate = new Date(departureDate);
              
              // Parse duration to determine if arrival is next day
              const durationMatch = flight.duration?.match(/(\d+)h\s*(\d+)?m?/);
              if (durationMatch) {
                const hours = parseInt(durationMatch[1]);
                const minutes = parseInt(durationMatch[2] || '0');
                
                // Add flight duration to departure time to get arrival date
                const [depHour, depMinute] = flight.departureTime.split(':').map(Number);
                const totalMinutes = depHour * 60 + depMinute + hours * 60 + minutes;
                
                if (totalMinutes >= 24 * 60) {
                  arrivalDate.setDate(arrivalDate.getDate() + 1);
                }
              }
              
              return {
                id: flight.id,
                airline: flight.airline,
                flightNumber: flight.flightNumber,
                departure: {
                  airport: flight.departureAirport,
                  time: flight.departureTime,
                  date: departureDate.toISOString().split('T')[0]
                },
                arrival: {
                  airport: flight.arrivalAirport,
                  time: flight.arrivalTime,
                  date: arrivalDate.toISOString().split('T')[0]
                },
                duration: flight.duration,
                price: flight.price,
                class: flight.class as any || 'Economy',
                stops: flight.stops,
                amenities: flight.amenities || ['WiFi', 'Meals'],
                baggage: flight.baggage || '23kg included'
              };
            }));
          }
        }
      } catch (error) {
        console.error('Error loading flight data:', error);
      } finally {
        setLoadingFlights(false);
      }
    };

    loadFlightData();
  }, [travelDetails]);

  const handleActivitySelect = (day: number, timeSlot: string, activity: Activity) => {
    const key = `${day}-${timeSlot}`;
    setSelectedActivities(prev => ({
      ...prev,
      [key]: activity.id
    }));
  };

  const getTotalCost = () => {
    let total = 0;
    
    // Add flight costs
    if (selectedOutboundFlight) total += selectedOutboundFlight.price;
    if (selectedReturnFlight) total += selectedReturnFlight.price;
    
    // Add activity costs
    dayPlans.forEach(dayPlan => {
      ['morning', 'afternoon', 'evening'].forEach(timeSlot => {
        const key = `${dayPlan.day}-${timeSlot}`;
        const selectedActivityId = selectedActivities[key];
        if (selectedActivityId) {
          const activities = dayPlan[timeSlot as keyof typeof dayPlan] as Activity[];
          const activity = activities.find(a => a.id === selectedActivityId);
          if (activity) total += activity.cost;
        }
      });
    });
    
    return total;
  };

  const getCompletionStatus = () => {
    const flightsSelected = selectedOutboundFlight && selectedReturnFlight;
    const totalTimeSlots = dayPlans.length * 3; // 3 time slots per day
    const selectedTimeSlots = Object.keys(selectedActivities).length;
    
    return {
      flightsComplete: flightsSelected,
      activitiesComplete: selectedTimeSlots === totalTimeSlots,
      activitiesProgress: `${selectedTimeSlots}/${totalTimeSlots}`,
      allComplete: flightsSelected && selectedTimeSlots === totalTimeSlots
    };
  };

  const handleComplete = () => {
    onComplete({
      outboundFlight: selectedOutboundFlight,
      returnFlight: selectedReturnFlight,
      activities: selectedActivities
    });
  };

  const status = getCompletionStatus();

  return (
    <div className="w-full space-y-6">
      {/* Header with destination and progress */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Customize Your {destination} Trip</h2>
              <p className="text-blue-100">Select your preferred flights and daily activities</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">${getTotalCost()}</div>
              <div className="text-sm text-blue-100">Total Cost</div>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                status.flightsComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {status.flightsComplete ? <CheckCircle className="h-5 w-5" /> : <Plane className="h-5 w-5" />}
              </div>
              <div>
                <div className="font-medium text-gray-800">Flights</div>
                <div className="text-sm text-gray-600">
                  {status.flightsComplete ? 'Selected' : 'Choose flights'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                status.activitiesComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {status.activitiesComplete ? <CheckCircle className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
              </div>
              <div>
                <div className="font-medium text-gray-800">Activities</div>
                <div className="text-sm text-gray-600">
                  {status.activitiesProgress} selected
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleComplete}
                disabled={!status.allComplete}
                className={`${
                  status.allComplete 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {status.allComplete ? 'Confirm Selections' : 'Complete All Selections'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content with tabs */}
      <Tabs defaultValue="flights" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flights" className="flex items-center space-x-2">
            <Plane className="h-4 w-4" />
            <span>Flights</span>
            {status.flightsComplete && <CheckCircle className="h-4 w-4 text-green-600" />}
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Daily Activities</span>
            <Badge variant="outline" className="ml-2">
              {status.activitiesProgress}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flights" className="space-y-6">
          {loadingFlights ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading flight options...</p>
              </div>
            </div>
          ) : (
            <>
              <FlightSelector
                flights={outboundFlights}
                onSelectFlight={setSelectedOutboundFlight}
                direction="outbound"
                travelDetails={travelDetails}
              />
              
              <FlightSelector
                flights={returnFlights}
                onSelectFlight={setSelectedReturnFlight}
                direction="return"
                travelDetails={travelDetails}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          {dayPlans.map((dayPlan) => (
            <DayActivitySelector
              key={dayPlan.day}
              dayPlan={dayPlan}
              onActivitySelect={handleActivitySelect}
              selectedActivities={selectedActivities}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}