import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TravelChatInterface } from "@/components/TravelChatInterface";
import { ScrapbookManager } from "@/components/ScrapbookManager";
import { MapPin, Calendar, Users, Search, Plane, Hotel, Car, Camera, Star, ArrowRight, Globe, Clock, Zap, Menu, User, Settings, LogOut, MessageCircle, Compass, TrendingUp, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  googleId?: string | null;
  profilePicture?: string | null;
  createdAt: string;
}

export function TravelPlatformLayout() {
  const [activeTab, setActiveTab] = useState("destinations");
  const [showChat, setShowChat] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const queryClient = useQueryClient();

  // Check authentication status
  const { data: authStatus, isLoading: authLoading } = useQuery<{ isAuthenticated: boolean; user: AuthUser | null }>({
    queryKey: ["/api/auth/user"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.reload();
    },
  });

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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
      {/* Top Navigation Menu */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Globe className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">WanderNotes</span>
            </div>

            {/* Main Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Button 
                variant={activeTab === "destinations" ? "default" : "ghost"} 
                onClick={() => setActiveTab("destinations")}
                className="flex items-center space-x-2"
              >
                <Compass className="h-4 w-4" />
                <span>Destinations</span>
              </Button>
              
              <Button 
                variant={activeTab === "flights" ? "default" : "ghost"} 
                onClick={() => setActiveTab("flights")}
                className="flex items-center space-x-2"
              >
                <Plane className="h-4 w-4" />
                <span>Flights</span>
              </Button>
              
              <Button 
                variant={activeTab === "hotels" ? "default" : "ghost"} 
                onClick={() => setActiveTab("hotels")}
                className="flex items-center space-x-2"
              >
                <Hotel className="h-4 w-4" />
                <span>Hotels</span>
              </Button>
              
              <Button 
                variant={activeTab === "experiences" ? "default" : "ghost"} 
                onClick={() => setActiveTab("experiences")}
                className="flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Experiences</span>
              </Button>

              <Button 
                variant={activeTab === "scrapbook" ? "default" : "ghost"} 
                onClick={() => setActiveTab("scrapbook")}
                className="flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Scrapbook</span>
              </Button>

              <Button 
                variant="ghost"
                className="flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Price Alerts</span>
              </Button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">AI Assistant</span>
              </Button>
              
              {authLoading ? (
                <Button variant="ghost" size="sm" disabled>
                  <User className="h-4 w-4" />
                </Button>
              ) : authStatus?.isAuthenticated && authStatus.user ? (
                <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      {authStatus.user.profilePicture ? (
                        <img 
                          src={authStatus.user.profilePicture} 
                          alt={authStatus.user.username}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">{authStatus.user.username}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Account</DialogTitle>
                    </DialogHeader>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-4 mb-4">
                          {authStatus.user.profilePicture ? (
                            <img 
                              src={authStatus.user.profilePicture} 
                              alt={authStatus.user.username}
                              className="h-12 w-12 rounded-full"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold">{authStatus.user.username}</h3>
                            {authStatus.user.email && (
                              <p className="text-sm text-gray-600">{authStatus.user.email}</p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            Account Settings
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={handleLogout}
                            disabled={logoutMutation.isPending}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <User className="h-4 w-4" />
                      <span>Sign In with Google</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Welcome to WanderNotes</DialogTitle>
                    </DialogHeader>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-center">Sign in to continue</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 text-center mb-6">
                          Access your travel scrapbooks, save preferences, and get personalized recommendations
                        </p>
                        <Button 
                          onClick={handleGoogleSignIn}
                          className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <span>Continue with Google</span>
                        </Button>
                        <p className="text-xs text-gray-500 text-center">
                          By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                      </CardContent>
                    </Card>
                  </DialogContent>
                </Dialog>
              )}

              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>

              {/* Mobile Menu Button */}
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

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

      {/* Scrapbook Section */}
      {activeTab === "scrapbook" && (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
          <ScrapbookManager />
        </div>
      )}

      {/* Show Chat Interface */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Travel Assistant</h2>
              <Button variant="ghost" onClick={() => setShowChat(false)}>×</Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TravelChatInterface initialPrompt={initialPrompt} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}