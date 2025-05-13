import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
} from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  Loader2, 
  CalendarIcon, 
  Building, 
  Plane, 
  ArrowRight, 
  Star, 
  TrendingUp, 
  Calendar as CalendarIcon2, 
  Clock
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';

// Define form schemas
const hotelSearchSchema = z.object({
  location: z.string().min(2, { message: 'Location must be at least 2 characters' }),
  radius: z.coerce.number().optional().default(5000),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional()
});

const flightSearchSchema = z.object({
  origin: z.string().min(2, { message: 'Origin must be at least 2 characters' }),
  destination: z.string().min(2, { message: 'Destination must be at least 2 characters' }),
  departureDate: z.date({
    required_error: "Departure date is required",
  }),
  returnDate: z.date().optional(),
  adults: z.coerce.number().min(1).max(10).default(1)
});

type HotelSearchFormValues = z.infer<typeof hotelSearchSchema>;
type FlightSearchFormValues = z.infer<typeof flightSearchSchema>;

export default function PriceComparison() {
  const { toast } = useToast();
  
  // States for loading and results
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelResults, setHotelResults] = useState<any[] | null>(null);
  const [hotelTrends, setHotelTrends] = useState<any | null>(null);
  
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [flightResults, setFlightResults] = useState<any[] | null>(null);
  const [flightTrends, setFlightTrends] = useState<any | null>(null);
  
  const [activeTab, setActiveTab] = useState('hotels');
  
  // Forms
  const hotelForm = useForm<HotelSearchFormValues>({
    resolver: zodResolver(hotelSearchSchema),
    defaultValues: {
      location: '',
      radius: 5000,
      minPrice: undefined,
      maxPrice: undefined
    }
  });
  
  const flightForm = useForm<FlightSearchFormValues>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      origin: '',
      destination: '',
      adults: 1
    }
  });
  
  // Search handlers
  const searchHotels = async (values: HotelSearchFormValues) => {
    setHotelsLoading(true);
    setHotelResults(null);
    setHotelTrends(null);
    
    try {
      // Create query string
      const params = new URLSearchParams();
      params.append('location', values.location);
      if (values.radius) params.append('radius', values.radius.toString());
      if (values.minPrice) params.append('minPrice', values.minPrice.toString());
      if (values.maxPrice) params.append('maxPrice', values.maxPrice.toString());
      
      // Fetch hotels
      const response = await fetch(`/api/hotels/search?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch hotels');
      }
      
      const data = await response.json();
      setHotelResults(data.hotels);
      
      // Fetch price trends
      const trendsResponse = await fetch(`/api/hotels/pricing-trends?destination=${encodeURIComponent(values.location)}`);
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setHotelTrends(trendsData);
      }
      
      toast({
        title: 'Hotel search completed',
        description: `Found ${data.hotels.length} hotels in ${values.location}`,
      });
    } catch (error) {
      console.error('Error searching hotels:', error);
      toast({
        title: 'Error searching hotels',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setHotelsLoading(false);
    }
  };
  
  const searchFlights = async (values: FlightSearchFormValues) => {
    setFlightsLoading(true);
    setFlightResults(null);
    setFlightTrends(null);
    
    try {
      // Create query string
      const params = new URLSearchParams();
      params.append('origin', values.origin);
      params.append('destination', values.destination);
      params.append('departureDate', format(values.departureDate, 'yyyy-MM-dd'));
      if (values.returnDate) params.append('returnDate', format(values.returnDate, 'yyyy-MM-dd'));
      params.append('adults', values.adults.toString());
      
      // Fetch flights
      const response = await fetch(`/api/flights/search?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch flights');
      }
      
      const data = await response.json();
      setFlightResults(data.flights);
      
      // Fetch price trends
      const trendsResponse = await fetch(`/api/flights/pricing-trends?origin=${encodeURIComponent(values.origin)}&destination=${encodeURIComponent(values.destination)}`);
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setFlightTrends(trendsData);
      }
      
      toast({
        title: 'Flight search completed',
        description: `Found ${data.flights.length} flights from ${values.origin} to ${values.destination}`,
      });
    } catch (error) {
      console.error('Error searching flights:', error);
      toast({
        title: 'Error searching flights',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setFlightsLoading(false);
    }
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">Travel Price Comparison</h1>
      <p className="text-muted-foreground mb-8">
        Compare prices for hotels and flights across multiple providers
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="hotels">
            <Building className="mr-2 h-4 w-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="flights">
            <Plane className="mr-2 h-4 w-4" />
            Flights
          </TabsTrigger>
        </TabsList>
        
        {/* Hotels Tab */}
        <TabsContent value="hotels">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hotel Search</CardTitle>
                <CardDescription>
                  Search for hotels by location and price range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...hotelForm}>
                  <form onSubmit={hotelForm.handleSubmit(searchHotels)} className="space-y-4">
                    <FormField
                      control={hotelForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, region, or country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={hotelForm.control}
                        name="minPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Price (USD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                placeholder="Min price" 
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={hotelForm.control}
                        name="maxPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Price (USD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                placeholder="Max price" 
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={hotelForm.control}
                      name="radius"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Radius (meters)</FormLabel>
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select radius" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1000">1 km</SelectItem>
                              <SelectItem value="2000">2 km</SelectItem>
                              <SelectItem value="5000">5 km</SelectItem>
                              <SelectItem value="10000">10 km</SelectItem>
                              <SelectItem value="20000">20 km</SelectItem>
                              <SelectItem value="50000">50 km</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={hotelsLoading}
                    >
                      {hotelsLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        'Search Hotels'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <div className="lg:col-span-2">
              {hotelsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : hotelResults ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Hotel Results</CardTitle>
                    <CardDescription>
                      Found {hotelResults.length} hotels matching your criteria
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="overflow-auto max-h-[400px] pr-2">
                      {hotelResults.length > 0 ? (
                        <div className="space-y-4">
                          {hotelResults.map(hotel => (
                            <div 
                              key={hotel.id} 
                              className="flex flex-col sm:flex-row border rounded-lg overflow-hidden"
                            >
                              <div className="w-full sm:w-1/3 bg-slate-100 flex items-center justify-center p-4">
                                {hotel.photos && hotel.photos.length > 0 ? (
                                  <img 
                                    src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${hotel.photos[0].reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`}
                                    alt={hotel.name}
                                    className="h-32 object-cover rounded-md"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://placehold.co/400x300/e2e8f0/6b7280?text=Hotel+Image';
                                    }}
                                  />
                                ) : (
                                  <Building className="h-16 w-16 text-slate-400" />
                                )}
                              </div>
                              <div className="p-4 flex-grow">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold text-lg">{hotel.name}</h3>
                                    <p className="text-sm text-muted-foreground">{hotel.address}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">
                                      {formatPrice(hotel.pricePerNight)}
                                      <span className="text-xs text-muted-foreground font-normal">/night</span>
                                    </div>
                                    <div className="flex items-center mt-1">
                                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                      <span>{hotel.rating.toFixed(1)}</span>
                                      {hotel.userRatingsTotal > 0 && (
                                        <span className="text-xs text-muted-foreground ml-1">
                                          ({hotel.userRatingsTotal})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm">
                                    <span className="font-medium">Price Range:</span>{' '}
                                    {formatPrice(hotel.estimatedPriceRange.min)} - {formatPrice(hotel.estimatedPriceRange.max)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium">No hotels found</h3>
                          <p className="text-muted-foreground">Try adjusting your search criteria</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center rounded-lg border border-dashed p-10 text-center">
                  <div>
                    <Building className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Search for Hotels</h3>
                    <p className="text-muted-foreground">
                      Enter a location to see hotel prices and trends
                    </p>
                  </div>
                </div>
              )}
              
              {/* Hotel Trends */}
              {hotelTrends && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Hotel Price Trends for {hotelTrends.destination}
                    </CardTitle>
                    <CardDescription>
                      Price analysis and trends for your destination
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Monthly Prices */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Monthly Price Averages</h4>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={hotelTrends.monthlyPrices}
                              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" angle={-45} textAnchor="end" height={50} />
                              <YAxis
                                label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft' }}
                                tickFormatter={(value) => `$${value}`}
                              />
                              <Tooltip formatter={(value) => [`$${value}`, 'Avg. Price']} />
                              <Bar dataKey="avgPrice" fill="#0ea5e9" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Best time to book */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Best Time to Book</h4>
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="flex items-start">
                              <CalendarIcon2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                              <div>
                                <p className="font-medium">Recommended Months:</p>
                                <p className="text-sm">{hotelTrends.bestTimeToBook.join(', ')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hotel Types Comparison */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Hotel Types Comparison</h4>
                          <div className="space-y-2">
                            {hotelTrends.hotelTypes.map((type: any, index: number) => (
                              <div key={index} className="bg-slate-50 p-3 rounded-lg">
                                <p className="font-medium">{type.type}</p>
                                <p className="text-sm">
                                  {formatPrice(type.priceRange.min)} - {formatPrice(type.priceRange.max)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Flights Tab */}
        <TabsContent value="flights">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Flight Search</CardTitle>
                <CardDescription>
                  Search for flights between destinations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...flightForm}>
                  <form onSubmit={flightForm.handleSubmit(searchFlights)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={flightForm.control}
                        name="origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origin</FormLabel>
                            <FormControl>
                              <Input placeholder="City or airport code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={flightForm.control}
                        name="destination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination</FormLabel>
                            <FormControl>
                              <Input placeholder="City or airport code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={flightForm.control}
                        name="departureDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Departure Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={`pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={flightForm.control}
                        name="returnDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Return Date (Optional)</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={`pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={(date) => field.onChange(date)}
                                  disabled={(date) => {
                                    const departureDate = flightForm.getValues("departureDate");
                                    return (
                                      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                      (departureDate && date < departureDate)
                                    );
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={flightForm.control}
                      name="adults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passengers</FormLabel>
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Number of passengers" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Adult</SelectItem>
                              <SelectItem value="2">2 Adults</SelectItem>
                              <SelectItem value="3">3 Adults</SelectItem>
                              <SelectItem value="4">4 Adults</SelectItem>
                              <SelectItem value="5">5 Adults</SelectItem>
                              <SelectItem value="6">6 Adults</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={flightsLoading}
                    >
                      {flightsLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        'Search Flights'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <div className="lg:col-span-2">
              {flightsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : flightResults ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Flight Results</CardTitle>
                    <CardDescription>
                      Found {flightResults.length} flights matching your criteria
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="overflow-auto max-h-[400px] pr-2">
                      {flightResults.length > 0 ? (
                        <div className="space-y-4">
                          {flightResults.map((flight, index) => (
                            <div 
                              key={flight.id || index} 
                              className="border rounded-lg overflow-hidden"
                            >
                              <div className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold">{flight.airline}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      Flight {flight.id}
                                      {flight.stops === 0 ? ' • Direct' : ` • ${flight.stops} stop(s)`}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">
                                      {formatPrice(flight.price)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {flight.returnFlight ? 'Round trip' : 'One way'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="text-center">
                                    <p className="text-lg font-medium">{flight.departureTime}</p>
                                    <p className="text-sm text-muted-foreground">{flight.departureAirport}</p>
                                  </div>
                                  
                                  <div className="flex-grow px-4 flex flex-col items-center">
                                    <div className="text-xs text-muted-foreground mb-1">{flight.duration}</div>
                                    <div className="w-full flex items-center">
                                      <div className="h-[2px] flex-grow bg-slate-200"></div>
                                      <ArrowRight className="h-4 w-4 text-slate-400 mx-1" />
                                      <div className="h-[2px] flex-grow bg-slate-200"></div>
                                    </div>
                                  </div>
                                  
                                  <div className="text-center">
                                    <p className="text-lg font-medium">{flight.arrivalTime}</p>
                                    <p className="text-sm text-muted-foreground">{flight.arrivalAirport}</p>
                                  </div>
                                </div>
                                
                                {flight.returnFlight && (
                                  <>
                                    <Separator className="my-3" />
                                    
                                    <div className="mt-2 flex items-center justify-between">
                                      <div className="text-center">
                                        <p className="text-lg font-medium">{flight.returnFlight.departureTime}</p>
                                        <p className="text-sm text-muted-foreground">{flight.arrivalAirport}</p>
                                      </div>
                                      
                                      <div className="flex-grow px-4 flex flex-col items-center">
                                        <div className="text-xs text-muted-foreground mb-1">{flight.returnFlight.duration}</div>
                                        <div className="w-full flex items-center">
                                          <div className="h-[2px] flex-grow bg-slate-200"></div>
                                          <ArrowRight className="h-4 w-4 text-slate-400 mx-1" />
                                          <div className="h-[2px] flex-grow bg-slate-200"></div>
                                        </div>
                                      </div>
                                      
                                      <div className="text-center">
                                        <p className="text-lg font-medium">{flight.returnFlight.arrivalTime}</p>
                                        <p className="text-sm text-muted-foreground">{flight.departureAirport}</p>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium">No flights found</h3>
                          <p className="text-muted-foreground">Try adjusting your search criteria</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center rounded-lg border border-dashed p-10 text-center">
                  <div>
                    <Plane className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Search for Flights</h3>
                    <p className="text-muted-foreground">
                      Enter origin, destination, and dates to see flight prices and trends
                    </p>
                  </div>
                </div>
              )}
              
              {/* Flight Trends */}
              {flightTrends && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Flight Price Trends: {flightTrends.route}
                    </CardTitle>
                    <CardDescription>
                      Price analysis and trends for your route
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Monthly Prices */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Monthly Price Averages</h4>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={flightTrends.monthlyPrices}
                              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" angle={-45} textAnchor="end" height={50} />
                              <YAxis
                                label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft' }}
                                tickFormatter={(value) => `$${value}`}
                              />
                              <Tooltip formatter={(value) => [`$${value}`, 'Avg. Price']} />
                              <Line type="monotone" dataKey="avgPrice" stroke="#0ea5e9" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Best time to book */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Best Time to Book</h4>
                          <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg">
                              <div className="flex items-start">
                                <CalendarIcon2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                                <div>
                                  <p className="font-medium">Recommended Months:</p>
                                  <p className="text-sm">{flightTrends.bestTimeToBook.join(', ')}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Days Before Departure Pricing</h4>
                              {flightTrends.advanceBookingTrend.map((trend: any, index: number) => (
                                <div key={index} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-slate-500 mr-2" />
                                    <span>{trend.daysBeforeDeparture} days</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">{(trend.priceMultiplier * 100).toFixed(0)}%</span>
                                    <span className="text-sm text-muted-foreground ml-1">of base price</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Airline Comparison */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Airline Price Comparison</h4>
                          <div className="space-y-2">
                            {flightTrends.airlines.map((airline: any, index: number) => (
                              <div key={index} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                                <div className="font-medium">{airline.airline}</div>
                                <div className="flex items-center">
                                  <div className="mr-3">
                                    <span className="text-sm">{airline.rating.toFixed(1)}</span>
                                    <Star className="h-3 w-3 text-yellow-500 inline ml-1" />
                                  </div>
                                  <div className="text-green-600 font-medium">{formatPrice(airline.avgPrice)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}