import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

// Trip type definition
interface Trip {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes: string;
  companions: string[];
  activities: string[];
  status: 'planned' | 'in-progress' | 'completed';
  coverImage?: string;
}

export default function SavedTripsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Fetch saved trips
  const { data: trips, isLoading, refetch } = useQuery({
    queryKey: ['/api/trips'],
    queryFn: async () => {
      try {
        const response = await apiRequest<Trip[]>('/api/trips');
        return response || [];
      } catch (error) {
        // For demo purposes, return mock data if API isn't implemented yet
        console.warn('API not implemented, using demo data');
        return mockTrips;
      }
    }
  });
  
  // Filter trips based on search query and status filter
  const filteredTrips = trips?.filter(trip => {
    const matchesSearch = 
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter 
      ? trip.status === statusFilter 
      : true;
      
    return matchesSearch && matchesStatus;
  });
  
  const handleDeleteTrip = async (id: number) => {
    try {
      // In a real implementation, call delete API
      // await apiRequest('/api/trips/' + id, 'DELETE');
      
      toast({
        title: 'Trip Deleted',
        description: 'The trip has been successfully deleted.',
      });
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete the trip. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Demo mock data - would be replaced by actual API call in production
  const mockTrips: Trip[] = [
    {
      id: 1,
      title: 'Summer in Paris',
      destination: 'Paris, France',
      startDate: '2025-06-15',
      endDate: '2025-06-23',
      budget: 2500,
      notes: 'Visit Eiffel Tower, Louvre, and try local cuisine',
      companions: ['Alex', 'Sarah'],
      activities: ['sightseeing', 'museums', 'dining'],
      status: 'planned',
      coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'Tokyo Adventure',
      destination: 'Tokyo, Japan',
      startDate: '2025-09-10',
      endDate: '2025-09-20',
      budget: 3500,
      notes: 'Explore Shibuya, visit Mount Fuji, try authentic Japanese cuisine',
      companions: ['David'],
      activities: ['shopping', 'hiking', 'food tour'],
      status: 'planned',
      coverImage: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=2036&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'Weekend in Rome',
      destination: 'Rome, Italy',
      startDate: '2025-04-05',
      endDate: '2025-04-08',
      budget: 1200,
      notes: 'Visit Colosseum, Roman Forum, and Vatican',
      companions: [],
      activities: ['history', 'architecture', 'food'],
      status: 'completed',
      coverImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1996&auto=format&fit=crop',
    },
  ];
  
  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format date from ISO to readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Saved Trips
            </h1>
            <p className="text-gray-500">
              View and manage your travel plans and past adventures
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link href="/">
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Plan New Trip
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label htmlFor="search" className="mb-2 block">Search Trips</Label>
              <Input
                id="search"
                placeholder="Search by trip title or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="status" className="mb-2 block">Filter by Status</Label>
              <div className="flex space-x-2">
                <Button
                  variant={statusFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(null)}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'planned' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter('planned')}
                >
                  Planned
                </Button>
                <Button
                  variant={statusFilter === 'completed' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trip Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="relative">
                  <Skeleton className="w-full h-48" />
                </div>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredTrips && filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative overflow-hidden h-48">
                  {trip.coverImage ? (
                    <img 
                      src={trip.coverImage} 
                      alt={trip.destination}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <div className={`${getStatusColor(trip.status)} rounded-full px-3 py-1 text-xs font-medium capitalize`}>
                      {trip.status}
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">{trip.title}</CardTitle>
                  <CardDescription className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {trip.destination}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {formatDate(trip.startDate)}
                      </span>
                      <span className="text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 8a1 1 0 01-1 1H6a1 1 0 010-2h4V6a1 1 0 112 0v4z" clipRule="evenodd" />
                        </svg>
                        {formatDate(trip.endDate)}
                      </span>
                    </div>
                    
                    {trip.companions.length > 0 && (
                      <div className="text-sm text-gray-500">
                        <div className="font-medium mb-1">Travel Companions:</div>
                        <div className="flex flex-wrap gap-1">
                          {trip.companions.map((companion, i) => (
                            <Badge key={i} variant="outline" className="bg-gray-50">
                              {companion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {trip.activities.length > 0 && (
                      <div className="text-sm text-gray-500">
                        <div className="font-medium mb-1">Activities:</div>
                        <div className="flex flex-wrap gap-1">
                          {trip.activities.map((activity, i) => (
                            <Badge key={i} variant="secondary" className="capitalize">
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm">
                      <span className="font-medium">Budget:</span> ${trip.budget.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href={`/trip/${trip.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h2 className="text-xl font-bold mb-2">No trips found</h2>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter
                ? "No trips match your search criteria. Try adjusting your filters."
                : "You haven't saved any trips yet. Plan your first adventure now!"}
            </p>
            <Link href="/">
              <Button>
                Plan Your First Trip
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}