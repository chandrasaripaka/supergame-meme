import React, { useState } from "react";
import { Search, MapPin, Calendar, Users, Plane, Hotel, Car, MapIcon, Clock, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TravelChatInterface } from "@/components/TravelChatInterface";

export function TravelPlatformLayout() {
  const [activeTab, setActiveTab] = useState("flights");
  const [showChat, setShowChat] = useState(false);

  const popularDestinations = [
    { name: "Tokyo", country: "Japan", price: 899, image: "🗾", trend: "+12%" },
    { name: "Paris", country: "France", price: 654, image: "🗼", trend: "+8%" },
    { name: "Bali", country: "Indonesia", price: 567, image: "🏝️", trend: "+15%" },
    { name: "Dubai", country: "UAE", price: 445, image: "🏢", trend: "+5%" },
  ];

  const quickSearches = [
    "Weekend getaway",
    "Business travel",
    "Family vacation",
    "Solo adventure",
    "Honeymoon",
    "Budget travel"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  WanderNotes
                </span>
              </div>
              
              <nav className="hidden md:flex items-center gap-6">
                <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  Flights
                </button>
                <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  Hotels
                </button>
                <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  Packages
                </button>
                <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  Experiences
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowChat(!showChat)}
                className="hidden sm:flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Ask AI Assistant
              </Button>
              <Badge variant="secondary">USD</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* AI Chat Interface */}
      {showChat && (
        <div className="container mx-auto px-4 py-6">
          <TravelChatInterface onClose={() => setShowChat(false)} />
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Your Next
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Adventure
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Plan, book, and experience unforgettable journeys with our AI-powered travel platform
          </p>
          
          <Button
            size="lg"
            onClick={() => setShowChat(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl"
          >
            Start Planning with AI
          </Button>
        </section>

        {/* Search Section */}
        <section className="mb-12">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl border-0">
            <CardContent className="p-6">
              <Tabs defaultValue="flights" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="flights" className="flex items-center gap-2">
                    <Plane className="w-4 h-4" />
                    Flights
                  </TabsTrigger>
                  <TabsTrigger value="hotels" className="flex items-center gap-2">
                    <Hotel className="w-4 h-4" />
                    Hotels
                  </TabsTrigger>
                  <TabsTrigger value="packages" className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4" />
                    Packages
                  </TabsTrigger>
                  <TabsTrigger value="cars" className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Cars
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="flights">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input placeholder="Departure city" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input placeholder="Destination" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Departure</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input type="date" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Passengers</label>
                      <Select>
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <SelectValue placeholder="1 Adult" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Adult</SelectItem>
                          <SelectItem value="2">2 Adults</SelectItem>
                          <SelectItem value="3">3 Adults</SelectItem>
                          <SelectItem value="4">4 Adults</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <div className="flex gap-2">
                      {quickSearches.slice(0, 3).map((search) => (
                        <Badge
                          key={search}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900"
                        >
                          {search}
                        </Badge>
                      ))}
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Search className="w-4 h-4 mr-2" />
                      Search Flights
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="hotels">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Destination</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input placeholder="City or hotel name" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Check-in</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input type="date" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Check-out</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input type="date" className="pl-10" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Search className="w-4 h-4 mr-2" />
                      Search Hotels
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* Popular Destinations */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Destinations</h2>
            <Button variant="outline">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDestinations.map((destination, index) => (
              <Card key={index} className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-4xl">
                    {destination.image}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{destination.name}</h3>
                      <Badge variant="secondary" className="text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {destination.trend}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{destination.country}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">From ${destination.price}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">4.8</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">AI-Powered Search</h3>
            <p className="text-gray-600 dark:text-gray-300">Get personalized recommendations based on your preferences and travel history.</p>
          </Card>

          <Card className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Real-time Updates</h3>
            <p className="text-gray-600 dark:text-gray-300">Stay informed with live flight status, weather updates, and travel alerts.</p>
          </Card>

          <Card className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Best Price Guarantee</h3>
            <p className="text-gray-600 dark:text-gray-300">Find the best deals with our price comparison and exclusive partner offers.</p>
          </Card>
        </section>
      </main>
    </div>
  );
}