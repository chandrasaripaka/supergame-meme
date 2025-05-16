import React from 'react';
import { BookingChat } from '@/components/BookingChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MessageSquare, Plane, Hotel, Gift } from 'lucide-react';

export default function BookingPage() {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            Travel Booking Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
            Use our interactive chat assistant to book flights, find hotels, check booking status, and discover exclusive travel deals. Get real-time notifications and personalized recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Booking Chat */}
          <div className="lg:col-span-2">
            <BookingChat />
          </div>
          
          {/* Right column: Info and Tips */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <span>Special Offers</span>
                </CardTitle>
                <CardDescription>
                  Current promotions and limited-time deals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-700 dark:text-blue-300">Summer Escape</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Flights to Bali
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                      20% OFF
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-purple-700 dark:text-purple-300">City Break</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Hotels in Paris
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                      15% OFF
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-amber-700 dark:text-amber-300">Asian Adventure</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tokyo Explorer Package
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100">
                      25% OFF
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>Chat Assistant Tips</span>
                </CardTitle>
                <CardDescription>
                  How to get the most from your booking assistant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Plane className="h-4 w-4 text-primary" />
                    <span>Flight Bookings</span>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Try phrases like "I want to book a flight from New York to San Francisco on June 15th" or "Show me flights to Miami next week."
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Hotel className="h-4 w-4 text-primary" />
                    <span>Hotel Reservations</span>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ask "Find me a hotel in Las Vegas for next weekend" or "I need accommodation in Denver from June 20-25."
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>Booking Status</span>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check your reservation with "What's the status of my booking?" or "Can you show me the details of booking BK123456?"
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <span>Why Book with Chat?</span>
                </CardTitle>
                <CardDescription>
                  Benefits of our chat-based booking system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-800 dark:text-gray-200">Real-time updates</span> on flight changes, gate information, and travel alerts
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-800 dark:text-gray-200">Personalized recommendations</span> based on your travel history and preferences
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-800 dark:text-gray-200">Instant booking confirmations</span> delivered directly to your phone
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-800 dark:text-gray-200">Exclusive chat-only deals</span> and promotions not available elsewhere
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}