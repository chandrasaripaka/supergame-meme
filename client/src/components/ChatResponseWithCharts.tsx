import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, DollarSign, Plane, Hotel, Star, MapPin as Destination, Activity } from "lucide-react";
import { Message } from "@/types";

interface ChatResponseWithChartsProps {
  message: Message;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

export function ChatResponseWithCharts({ message }: ChatResponseWithChartsProps) {
  const isUser = message.role === 'user';
  const [activeTab, setActiveTab] = useState('flights');
  
  // Check if we have categorized data (Budget/Luxury structure)
  const hasCategorizedData = (data: any) => {
    return data && (data.budget || data.luxury);
  };
  
  // Render categorized recommendations with Budget/Luxury tabs
  const renderCategorizedRecommendations = (data: any, type: string) => {
    if (!hasCategorizedData(data)) return null;
    
    const Icon = type === 'flights' ? Plane : type === 'hotels' ? Hotel : type === 'experiences' ? Activity : Destination;
    
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {type.charAt(0).toUpperCase() + type.slice(1)} Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={data.budget ? 'budget' : 'luxury'} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {data.budget && <TabsTrigger value="budget">Budget Options</TabsTrigger>}
              {data.luxury && <TabsTrigger value="luxury">Luxury Options</TabsTrigger>}
            </TabsList>
            
            {data.budget && (
              <TabsContent value="budget" className="mt-4">
                <div className="grid gap-4">
                  {data.budget.map((item: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      {renderRecommendationCard(item, type)}
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
            
            {data.luxury && (
              <TabsContent value="luxury" className="mt-4">
                <div className="grid gap-4">
                  {data.luxury.map((item: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      {renderRecommendationCard(item, type)}
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    );
  };
  
  // Render individual recommendation card based on type
  const renderRecommendationCard = (item: any, type: string) => {
    switch (type) {
      case 'flights':
        return (
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{item.airline}</span>
                <Badge variant={item.category === 'Budget' ? 'secondary' : 'default'}>
                  {item.category}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Departure: {item.departure} → Arrival: {item.arrival}</div>
                <div>Duration: {item.duration} | Stops: {item.stops}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${item.price}</div>
              <Button size="sm" className="mt-2">Book Now</Button>
            </div>
          </div>
        );
      
      case 'hotels':
        return (
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{item.name}</span>
                <Badge variant={item.category === 'Budget' ? 'secondary' : 'default'}>
                  {item.category}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {item.rating}/5
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.amenities?.slice(0, 3).map((amenity: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">{amenity}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${item.price}</div>
              <div className="text-xs text-muted-foreground">per night</div>
              <Button size="sm" className="mt-2">Book Now</Button>
            </div>
          </div>
        );
      
      case 'experiences':
        return (
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{item.name}</span>
                <Badge variant={item.category === 'Budget' ? 'secondary' : 'default'}>
                  {item.category}
                </Badge>
                <Badge variant="outline">{item.type}</Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{item.description}</div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {item.rating}/5
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {item.price === 0 ? 'Free' : `$${item.price}`}
              </div>
              <Button size="sm" className="mt-2">Learn More</Button>
            </div>
          </div>
        );
      
      case 'restaurants':
        return (
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{item.name}</span>
                <Badge variant={item.category === 'Budget' ? 'secondary' : 'default'}>
                  {item.category}
                </Badge>
                <Badge variant="outline">{item.cuisine}</Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {item.rating}/5 • {item.price}
                </div>
                <div>{item.description}</div>
              </div>
            </div>
            <div className="text-right">
              <Button size="sm" className="mt-2" disabled={!item.bookingAvailable}>
                {item.bookingAvailable ? 'Reserve' : 'View Menu'}
              </Button>
            </div>
          </div>
        );
      
      default:
        return <div>{JSON.stringify(item)}</div>;
    }
  };
  
  // Parse structured data for charts
  const parseChartData = (content: string, data?: any) => {
    const charts = [];
    
    // For categorized data, create comparison charts
    if (data?.flights && hasCategorizedData(data.flights)) {
      const allFlights = [...(data.flights.budget || []), ...(data.flights.luxury || [])];
      const flightData = allFlights.slice(0, 6).map((flight: any) => ({
        airline: flight.airline,
        price: flight.price,
        category: flight.category,
        duration: flight.duration
      }));
      
      charts.push({
        type: 'bar',
        title: 'Flight Price Comparison (Budget vs Luxury)',
        data: flightData,
        dataKey: 'price',
        xAxisKey: 'airline'
      });
    }
    
    // Legacy support for non-categorized data
    else if (data?.flights?.length > 0) {
      const flightData = data.flights.slice(0, 5).map((flight: any, index: number) => ({
        airline: flight.airline || `Option ${index + 1}`,
        price: flight.price || Math.floor(Math.random() * 500) + 200,
        duration: flight.duration || `${Math.floor(Math.random() * 5) + 8}h`,
        stops: flight.stops || Math.floor(Math.random() * 2)
      }));
      
      charts.push({
        type: 'bar',
        title: 'Flight Price Comparison',
        data: flightData,
        dataKey: 'price',
        xAxisKey: 'airline'
      });
    }
    
    // Budget breakdown pie chart
    if (data?.budget || content.toLowerCase().includes('budget')) {
      const budgetData = [
        { name: 'Accommodation', value: 40, color: COLORS[0] },
        { name: 'Flights', value: 25, color: COLORS[1] },
        { name: 'Food & Dining', value: 20, color: COLORS[2] },
        { name: 'Activities', value: 10, color: COLORS[3] },
        { name: 'Transport', value: 5, color: COLORS[4] }
      ];
      
      charts.push({
        type: 'pie',
        title: 'Budget Breakdown',
        data: budgetData
      });
    }
    
    // Destination popularity trend
    if (content.toLowerCase().includes('popular') || content.toLowerCase().includes('trend')) {
      const trendData = [
        { month: 'Jan', visitors: 45 },
        { month: 'Feb', visitors: 52 },
        { month: 'Mar', visitors: 68 },
        { month: 'Apr', visitors: 84 },
        { month: 'May', visitors: 95 },
        { month: 'Jun', visitors: 87 }
      ];
      
      charts.push({
        type: 'line',
        title: 'Destination Popularity Trend',
        data: trendData,
        dataKey: 'visitors',
        xAxisKey: 'month'
      });
    }
    
    return charts;
  };

  const renderChart = (chart: any) => {
    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxisKey} />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
              <Bar dataKey={chart.dataKey} fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxisKey} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={chart.dataKey} stroke={COLORS[1]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {chart.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const charts = parseChartData(message.content, message.data);
  
  // Extract key information for quick display
  const extractKeyInfo = (content: string, data?: any) => {
    const info = [];
    
    if (data?.destination || content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/)) {
      info.push({ icon: MapPin, label: "Destination", value: data?.destination || "Multiple options" });
    }
    
    if (data?.price || content.match(/\$\d+/)) {
      const price = data?.price || content.match(/\$(\d+)/)?.[1];
      info.push({ icon: DollarSign, label: "From", value: price ? `$${price}` : "Price varies" });
    }
    
    if (data?.duration || content.match(/\d+\s*days?/)) {
      const duration = data?.duration || content.match(/(\d+)\s*days?/)?.[1];
      info.push({ icon: Calendar, label: "Duration", value: duration ? `${duration} days` : "Flexible" });
    }
    
    return info;
  };

  const keyInfo = extractKeyInfo(message.content, message.data);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg max-w-xs">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-2xl">
        {/* Key Information Cards */}
        {keyInfo.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {keyInfo.map((info, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                <info.icon className="w-3 h-3" />
                <span className="text-xs">{info.label}: {info.value}</span>
              </Badge>
            ))}
          </div>
        )}

        {/* Main Response */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {message.content.split('\n').map((line, index) => {
                if (line.trim()) {
                  // Make responses more concise
                  const conciseLine = line
                    .replace(/I'd be happy to help you with|I can help you|Let me help you/gi, '')
                    .replace(/Here's what I found|Here are some|Here's some/gi, '')
                    .replace(/\*\*/g, '')
                    .trim();
                  
                  if (conciseLine) {
                    return <p key={index} className="mb-2 text-sm">{conciseLine}</p>;
                  }
                }
                return null;
              })}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        {charts.map((chart, index) => (
          <Card key={index} className="mt-3 bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{chart.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderChart(chart)}
            </CardContent>
          </Card>
        ))}

        {/* Categorized Travel Recommendations */}
        {message.data && (message.data.flights || message.data.hotels || message.data.experiences || message.data.restaurants) && (
          <div className="mt-4">
            <Tabs defaultValue="flights" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="flights" className="flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  Flights
                </TabsTrigger>
                <TabsTrigger value="hotels" className="flex items-center gap-2">
                  <Hotel className="h-4 w-4" />
                  Hotels
                </TabsTrigger>
                <TabsTrigger value="experiences" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Experiences
                </TabsTrigger>
                <TabsTrigger value="destinations" className="flex items-center gap-2">
                  <Destination className="h-4 w-4" />
                  Dining
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="flights" className="mt-4">
                {message.data?.flights ? renderCategorizedRecommendations(message.data.flights, 'flights') : 
                  <div className="text-center py-8 text-muted-foreground">
                    <Plane className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No flight recommendations available for this query.</p>
                  </div>
                }
              </TabsContent>
              
              <TabsContent value="hotels" className="mt-4">
                {message.data?.hotels ? renderCategorizedRecommendations(message.data.hotels, 'hotels') : 
                  <div className="text-center py-8 text-muted-foreground">
                    <Hotel className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hotel recommendations available for this query.</p>
                  </div>
                }
              </TabsContent>
              
              <TabsContent value="experiences" className="mt-4">
                {message.data?.experiences ? renderCategorizedRecommendations(message.data.experiences, 'experiences') : 
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No experience recommendations available for this query.</p>
                  </div>
                }
              </TabsContent>
              
              <TabsContent value="destinations" className="mt-4">
                {message.data?.restaurants ? renderCategorizedRecommendations(message.data.restaurants, 'restaurants') : 
                  <div className="text-center py-8 text-muted-foreground">
                    <Destination className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No restaurant recommendations available for this query.</p>
                  </div>
                }
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Legacy support for old restaurant format */}
        {message.data?.restaurants && !hasCategorizedData(message.data.restaurants) && (
          <Card className="mt-3 bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Restaurant Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {message.data.restaurants.map((restaurant: any, index: number) => (
                  <div key={index} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-700">
                    <div className="relative">
                      <img 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold">{restaurant.rating}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                        {restaurant.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                        {restaurant.cuisine} • {restaurant.location} • {restaurant.price}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                        {restaurant.description}
                      </p>
                      {restaurant.bookingAvailable && (
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs">
                          Book Table
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}