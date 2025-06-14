import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TravelChatInterface } from "@/components/TravelChatInterface";
import { MapPin, Calendar, Users, Search, Plane, Hotel, Car, Camera, Star, ArrowRight, Globe, Clock, Zap } from "lucide-react";

export function TravelPlatformLayout() {
  const [activeTab, setActiveTab] = useState("destinations");
  const [showChat, setShowChat] = useState(false);
  const [searchForm, setSearchForm] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    travelers: "2"
  });

  const generateAIPrompt = () => {
    const { destination, checkIn, checkOut, travelers } = searchForm;
    
    if (!destination && !checkIn && !checkOut) {
      return "Help me plan a trip. What destinations would you recommend?";
    }

    let prompt = `Help me plan a trip`;
    
    if (destination) {
      prompt += ` to ${destination}`;
    }
    
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      });
      const checkOutDate = new Date(checkOut).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      });
      prompt += ` from ${checkInDate} to ${checkOutDate}`;
    } else if (checkIn) {
      const checkInDate = new Date(checkIn).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      });
      prompt += ` starting ${checkInDate}`;
    }
    
    if (travelers && travelers !== "1") {
      const travelerCount = parseInt(travelers);
      if (travelerCount === 2) {
        prompt += ` for 2 travelers`;
      } else if (travelerCount >= 4) {
        prompt += ` for a group of ${travelerCount}+ people`;
      } else {
        prompt += ` for ${travelers} travelers`;
      }
    } else if (travelers === "1") {
      prompt += ` for solo travel`;
    }

    // Add context based on active tab
    switch (activeTab) {
      case "flights":
        prompt += ". Please show me flight options with prices and duration.";
        break;
      case "hotels":
        prompt += ". I need hotel recommendations with ratings and amenities.";
        break;
      case "experiences":
        prompt += ". Suggest unique experiences and activities for my trip.";
        break;
      default:
        prompt += ". Include flights, hotels, activities, and dining recommendations.";
    }

    return prompt;
  };

  const [initialPrompt, setInitialPrompt] = useState("");

  const handleSearchWithAI = () => {
    const prompt = generateAIPrompt();
    setInitialPrompt(prompt);
    setShowChat(true);
  };

  const destinations = [
    {
      name: "Santorini, Greece",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop&crop=entropy&auto=format",
      price: "From $1,200",
      rating: 4.9,
      description: "Stunning sunsets and white-washed buildings",
      tags: ["Romantic", "Beach", "Historic"]
    },
    {
      name: "Tokyo, Japan",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&crop=entropy&auto=format",
      price: "From $1,800",
      rating: 4.8,
      description: "Modern culture meets ancient traditions",
      tags: ["Culture", "Food", "Technology"]
    },
    {
      name: "Bali, Indonesia",
      image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop&crop=entropy&auto=format",
      price: "From $900",
      rating: 4.7,
      description: "Tropical paradise with rich culture",
      tags: ["Tropical", "Adventure", "Wellness"]
    },
    {
      name: "Paris, France",
      image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=entropy&auto=format",
      price: "From $1,500",
      rating: 4.6,
      description: "City of lights and romance",
      tags: ["Romance", "Art", "Fashion"]
    },
    {
      name: "Maldives",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=entropy&auto=format",
      price: "From $2,500",
      rating: 4.9,
      description: "Overwater villas and crystal clear waters",
      tags: ["Luxury", "Beach", "Honeymoon"]
    },
    {
      name: "Dubai, UAE",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&crop=entropy&auto=format",
      price: "From $1,400",
      rating: 4.5,
      description: "Luxury shopping and modern architecture",
      tags: ["Luxury", "Shopping", "Modern"]
    }
  ];

  const experiences = [
    {
      title: "Northern Lights Adventure",
      location: "Iceland",
      image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop&crop=entropy&auto=format",
      price: "$899",
      duration: "5 days",
      rating: 4.8
    },
    {
      title: "Safari Experience",
      location: "Kenya",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&crop=entropy&auto=format",
      price: "$2,200",
      duration: "7 days",
      rating: 4.9
    },
    {
      title: "Culinary Tour",
      location: "Italy",
      image: "https://images.unsplash.com/photo-1539650116574-75c0c6d1f42b?w=800&h=600&fit=crop&crop=entropy&auto=format",
      price: "$1,600",
      duration: "10 days",
      rating: 4.7
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section with Search */}
      <div className="relative overflow-hidden">
        <div 
          className="relative bg-cover bg-center bg-no-repeat min-h-[70vh] flex items-center"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop&crop=entropy&auto=format")'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold mb-6 text-white leading-tight">
                Discover Your Next
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Adventure
                </span>
              </h1>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Plan, book, and experience unforgettable journeys with our AI-powered travel assistant
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-5xl mx-auto">
              <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input 
                        placeholder="Where do you want to go?" 
                        value={searchForm.destination}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, destination: e.target.value }))}
                        className="pl-12 h-14 text-lg border-gray-200 focus:ring-2 focus:ring-blue-500 rounded-xl"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input 
                        type="date" 
                        value={searchForm.checkIn}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, checkIn: e.target.value }))}
                        className="pl-12 h-14 text-lg border-gray-200 focus:ring-2 focus:ring-blue-500 rounded-xl"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input 
                        type="date" 
                        value={searchForm.checkOut}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, checkOut: e.target.value }))}
                        className="pl-12 h-14 text-lg border-gray-200 focus:ring-2 focus:ring-blue-500 rounded-xl"
                      />
                    </div>
                    <div className="relative">
                      <Users className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Select value={searchForm.travelers} onValueChange={(value) => setSearchForm(prev => ({ ...prev, travelers: value }))}>
                        <SelectTrigger className="pl-12 h-14 text-lg border-gray-200 focus:ring-2 focus:ring-blue-500 rounded-xl">
                          <SelectValue placeholder="Travelers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Traveler</SelectItem>
                          <SelectItem value="2">2 Travelers</SelectItem>
                          <SelectItem value="3">3 Travelers</SelectItem>
                          <SelectItem value="4">4+ Travelers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    size="lg"
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-all duration-200"
                    onClick={handleSearchWithAI}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Plan with AI Assistant
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {showChat && (
        <div className="bg-white dark:bg-gray-800 border-b shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <TravelChatInterface 
              onClose={() => setShowChat(false)} 
              initialPrompt={initialPrompt}
              onPromptSent={() => setInitialPrompt("")}
            />
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-transparent border-none h-20">
              <TabsTrigger 
                value="destinations" 
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none h-full flex flex-col items-center justify-center gap-1 text-sm font-medium"
              >
                <MapPin className="h-5 w-5" />
                Destinations
              </TabsTrigger>
              <TabsTrigger 
                value="flights" 
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none h-full flex flex-col items-center justify-center gap-1 text-sm font-medium"
              >
                <Plane className="h-5 w-5" />
                Flights
              </TabsTrigger>
              <TabsTrigger 
                value="hotels" 
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none h-full flex flex-col items-center justify-center gap-1 text-sm font-medium"
              >
                <Hotel className="h-5 w-5" />
                Hotels
              </TabsTrigger>
              <TabsTrigger 
                value="experiences" 
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none h-full flex flex-col items-center justify-center gap-1 text-sm font-medium"
              >
                <Globe className="h-5 w-5" />
                Experiences
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Destinations Tab */}
          <TabsContent value="destinations" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Popular Destinations
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Discover the world's most beautiful places
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((destination, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-0 shadow-lg">
                  <div className="relative">
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{destination.rating}</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {destination.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {destination.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {destination.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        {destination.price}
                      </span>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        View Details
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Flights Tab */}
          <TabsContent value="flights" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Find the Best Flights
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Compare prices and book your perfect flight
              </p>
            </div>
            
            <Card className="p-8 shadow-lg">
              <div className="text-center py-12">
                <Plane className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Flight Search Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Use our AI assistant to find and compare flights from multiple airlines
                </p>
                <Button 
                  onClick={() => setShowChat(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Ask AI for Flight Options
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Hotels Tab */}
          <TabsContent value="hotels" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Luxury Accommodations
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Find the perfect place to stay
              </p>
            </div>
            
            <Card className="p-8 shadow-lg">
              <div className="text-center py-12">
                <Hotel className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Hotel Search Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Let our AI assistant help you find the best hotels for your stay
                </p>
                <Button 
                  onClick={() => setShowChat(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Ask AI for Hotel Recommendations
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Experiences Tab */}
          <TabsContent value="experiences" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Unique Experiences
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Create memories that last a lifetime
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {experiences.map((experience, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-0 shadow-lg">
                  <div className="relative">
                    <img 
                      src={experience.image} 
                      alt={experience.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{experience.rating}</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {experience.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {experience.location}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          {experience.price}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {experience.duration}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        Book Now
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose WanderNotes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Experience travel planning like never before
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-0 shadow-lg">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                AI-Powered Planning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get personalized travel recommendations based on your preferences and budget
              </p>
            </Card>
            
            <Card className="text-center p-8 border-0 shadow-lg">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Global Coverage
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access destinations, hotels, and experiences from around the world
              </p>
            </Card>
            
            <Card className="text-center p-8 border-0 shadow-lg">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Premium Quality
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Curated experiences and verified reviews for the best travel decisions
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}