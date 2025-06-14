import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, Plane, Hotel, Star } from "lucide-react";
import { Message } from "@/types";

interface ChatResponseWithChartsProps {
  message: Message;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

export function ChatResponseWithCharts({ message }: ChatResponseWithChartsProps) {
  const isUser = message.role === 'user';
  
  // Parse structured data for charts
  const parseChartData = (content: string, data?: any) => {
    const charts = [];
    
    // Price comparison chart
    if (data?.flights?.length > 0) {
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

        {/* Structured Data Display */}
        {message.data && (
          <>
            {message.data.hotels && (
              <Card className="mt-3 bg-white dark:bg-gray-800 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Hotel className="w-4 h-4" />
                    Top Hotel Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {message.data.hotels.slice(0, 3).map((hotel: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <p className="font-medium text-sm">{hotel.name}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">{hotel.rating}/5</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">${hotel.price}</p>
                          <p className="text-xs text-gray-500">per night</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {message.data.attractions && (
              <Card className="mt-3 bg-white dark:bg-gray-800 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Must-Visit Attractions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {message.data.attractions.slice(0, 3).map((attraction: any, index: number) => (
                      <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="font-medium text-sm">{attraction.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{attraction.description}</p>
                        <Badge variant="outline" className="mt-1 text-xs">{attraction.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}