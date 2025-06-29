import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Plane, Building, Car, Camera } from 'lucide-react';
import { Booking } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface BookingManagerProps {
  userId?: number;
  tripId?: number;
}

export function BookingManager({ userId, tripId }: BookingManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Fetch bookings
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings', { userId, tripId }],
    enabled: !!userId
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest('PATCH', `/api/bookings/${bookingId}`, {
        status: 'cancelled'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="h-4 w-4" />;
      case 'hotel': return <Building className="h-4 w-4" />;
      case 'car_rental': return <Car className="h-4 w-4" />;
      case 'activity': return <Camera className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const groupedBookings = bookings.reduce((acc, booking) => {
    if (!acc[booking.bookingType]) {
      acc[booking.bookingType] = [];
    }
    acc[booking.bookingType].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <div className="text-sm text-gray-600">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600">Start planning your trip to make your first booking!</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="flight">Flights ({groupedBookings.flight?.length || 0})</TabsTrigger>
            <TabsTrigger value="hotel">Hotels ({groupedBookings.hotel?.length || 0})</TabsTrigger>
            <TabsTrigger value="car_rental">Cars ({groupedBookings.car_rental?.length || 0})</TabsTrigger>
            <TabsTrigger value="activity">Activities ({groupedBookings.activity?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onCancel={() => cancelBookingMutation.mutate(booking.id)}
                onSelect={() => setSelectedBooking(booking)}
                getBookingIcon={getBookingIcon}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </TabsContent>

          {Object.entries(groupedBookings).map(([type, typeBookings]) => (
            <TabsContent key={type} value={type} className="space-y-4">
              {typeBookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onCancel={() => cancelBookingMutation.mutate(booking.id)}
                  onSelect={() => setSelectedBooking(booking)}
                  getBookingIcon={getBookingIcon}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      )}
    </div>
  );
}

interface BookingCardProps {
  booking: Booking;
  onCancel: () => void;
  onSelect: () => void;
  getBookingIcon: (type: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

function BookingCard({ booking, onCancel, onSelect, getBookingIcon, getStatusBadge }: BookingCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
              {getBookingIcon(booking.bookingType)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{booking.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{booking.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(booking.startDate), 'MMM dd, yyyy')}
                </div>
                {booking.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {booking.location}
                  </div>
                )}
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {booking.totalAmount} {booking.currency}
                </div>
              </div>
              
              {booking.bookingReference && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Ref: {booking.bookingReference}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            {getStatusBadge(booking.status)}
            {booking.status === 'confirmed' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                className="text-red-600 hover:text-red-700"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
}

function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{booking.title}</CardTitle>
            <Button variant="ghost" onClick={onClose}>
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Booking Type</label>
              <p className="capitalize">{booking.bookingType.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <p className="capitalize">{booking.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Start Date</label>
              <p>{format(new Date(booking.startDate), 'MMMM dd, yyyy')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">End Date</label>
              <p>{booking.endDate ? format(new Date(booking.endDate), 'MMMM dd, yyyy') : 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Total Amount</label>
              <p className="font-semibold">{booking.totalAmount} {booking.currency}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Guests</label>
              <p>{booking.guestCount || 1}</p>
            </div>
          </div>
          
          {booking.location && (
            <div>
              <label className="text-sm font-medium text-gray-600">Location</label>
              <p>{booking.location}</p>
            </div>
          )}
          
          {booking.description && (
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p>{booking.description}</p>
            </div>
          )}
          
          {booking.bookingReference && (
            <div>
              <label className="text-sm font-medium text-gray-600">Booking Reference</label>
              <p className="font-mono text-sm">{booking.bookingReference}</p>
            </div>
          )}
          
          {booking.providerName && (
            <div>
              <label className="text-sm font-medium text-gray-600">Provider</label>
              <p>{booking.providerName}</p>
            </div>
          )}
          
          {booking.specialRequests && (
            <div>
              <label className="text-sm font-medium text-gray-600">Special Requests</label>
              <p>{booking.specialRequests}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}