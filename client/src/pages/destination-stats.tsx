import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useMobile } from '@/hooks/use-mobile';
import { DestinationStatistics } from '@/types/destination-stats';

export default function DestinationStats() {
  const [location, setLocation] = useLocation();
  const [destination, setDestination] = useState<string>("");
  const [searchedDestination, setSearchedDestination] = useState<string>("");
  const { isMobile } = useMobile();

  // Fetch destination statistics
  const { data: stats, isLoading, isError } = useQuery<DestinationStatistics>({
    queryKey: ['/api/destination-stats', searchedDestination],
    enabled: !!searchedDestination,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) {
      setSearchedDestination(destination);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-2">
            Destination Statistics
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Get detailed travel analytics, visitor statistics, and expense breakdowns for destinations around the world.
          </p>
        </div>
        <Button 
          onClick={() => setLocation('/')}
          variant="outline"
          className="mt-4 md:mt-0"
        >
          Back to Home
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          type="text"
          placeholder="Enter a destination (e.g., Paris, Tokyo, New York)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          Search
        </Button>
      </form>

      {isLoading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {isError && (
        <Card className="bg-red-50 border-red-200 mb-8">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We couldn't find statistics for "{searchedDestination}". Please try another destination or check your spelling.</p>
          </CardContent>
        </Card>
      )}

      {stats && !isLoading && !isError && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Average Daily Expenses
              </CardTitle>
              <CardDescription>Cost breakdown for travelers in {stats.destination}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.expenses}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={60} />
                    <YAxis label={{ value: `Cost (${stats.currency})`, angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${value} ${stats.currency}`} />
                    <Legend />
                    <Bar dataKey="cost" fill="#4f46e5" name="Average Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Visitor Demographics
              </CardTitle>
              <CardDescription>Breakdown of visitors to {stats.destination}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.visitorData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.visitorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Popular Activities
              </CardTitle>
              <CardDescription>Most common activities in {stats.destination}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.activityDistribution}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis dataKey="activity" type="category" width={80} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="percentage" fill="#6366f1" name="Popularity" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Seasonal Recommendations
              </CardTitle>
              <CardDescription>Best times to visit {stats.destination}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.seasonalRecommendations}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} />
                    <YAxis domain={[0, 10]} label={{ value: 'Rating (1-10)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `Rating: ${value}/10`} />
                    <Legend />
                    <Bar dataKey="rating" fill="#8884d8" name="Recommended Rating" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Destination Overview
              </CardTitle>
              <CardDescription>Key information about {stats.destination}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p className="text-gray-600">{stats.summary}</p>
                  
                  <h3 className="font-medium mt-4 mb-2">When to Go</h3>
                  <p className="text-gray-600">{stats.bestTimeToVisit}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Quick Facts</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li><span className="font-medium">Local Language:</span> {stats.localLanguage}</li>
                    <li><span className="font-medium">Currency:</span> {stats.currencyName} ({stats.currency})</li>
                    <li><span className="font-medium">Average Daily Budget:</span> {stats.averageDailyBudget} {stats.currency}</li>
                    <li><span className="font-medium">Top Attraction:</span> {stats.topAttraction}</li>
                    <li><span className="font-medium">Safety Index:</span> {stats.safetyIndex}/10</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!searchedDestination && (
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Ready to explore destination statistics?</h2>
          <p className="text-gray-600 mb-4">Enter a destination name above to discover travel insights and analytics.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Paris', 'Tokyo', 'New York', 'Bali', 'Rome'].map((place) => (
              <Button 
                key={place}
                variant="outline" 
                onClick={() => {
                  setDestination(place);
                  setSearchedDestination(place);
                }}
              >
                {place}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}