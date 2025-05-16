import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mic, Send, Image, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Types for chat messages
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'booking' | 'confirmation' | 'update' | 'offer';
  metadata?: {
    bookingId?: string;
    flightNumber?: string;
    departureTime?: string;
    arrivalTime?: string;
    origin?: string;
    destination?: string;
    price?: number;
    hotelName?: string;
    checkInDate?: string;
    checkOutDate?: string;
    discountPercentage?: number;
    offerExpiry?: Date;
  };
}

// Types for booking requests
interface BookingRequest {
  type: 'flight' | 'hotel';
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
  hotelName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  rooms?: number;
}

// Conversation context for tracking user intents
interface ConversationContext {
  currentIntent?: 'flight_search' | 'hotel_search' | 'booking' | 'status_check' | 'upgrade' | 'deals';
  bookingRequest?: BookingRequest;
  lastMentionedLocation?: string;
  lastMentionedDates?: {
    start: string;
    end?: string;
  };
  userPreferences?: {
    preferredClass?: 'economy' | 'business' | 'first';
    preferredAirlines?: string[];
    preferredHotelChains?: string[];
    favoriteDestinations?: string[];
  };
}

export function BookingChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [context, setContext] = useState<ConversationContext>({});
  const [activeTriggers, setActiveTriggers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      content: 'Welcome to Travel Buddy! I can help you with flight bookings, hotel reservations, checking status, and finding great deals. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };
    
    // Add some sample quick actions
    setActiveTriggers(['flight_search', 'hotel_search', 'deals']);
    
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Process user message and generate bot response
  const processMessage = useMutation({
    mutationFn: async (userMessage: string) => {
      // Simulate API call to backend
      return apiRequest('/api/booking-chat', {
        method: 'POST',
        data: {
          message: userMessage,
          context
        }
      });
    },
    onSuccess: (data) => {
      // Update messages with bot response
      if (data && data.message) {
        const botMessage: Message = {
          id: Date.now().toString(),
          content: data.message.content,
          sender: 'bot',
          timestamp: new Date(),
          type: data.message.type || 'text',
          metadata: data.message.metadata
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Update conversation context
        if (data.context) {
          setContext(data.context);
        }
        
        // Update active triggers based on context
        if (data.triggers) {
          setActiveTriggers(data.triggers);
        }
      }
    },
    onError: (error) => {
      console.error('Error processing message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error processing your request. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Error',
        description: 'Failed to process your message. Please try again.',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    
    // Add to messages
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setInputValue('');
    
    // Set processing state
    setIsProcessing(true);
    
    // Process message with backend
    processMessage.mutate(inputValue);
  };

  // Handle quick trigger buttons
  const handleTrigger = (trigger: string) => {
    let triggerMessage = '';
    
    switch (trigger) {
      case 'flight_search':
        triggerMessage = 'I want to book a flight';
        break;
      case 'hotel_search':
        triggerMessage = 'I need a hotel reservation';
        break;
      case 'status_check':
        triggerMessage = 'What\'s the status of my booking?';
        break;
      case 'deals':
        triggerMessage = 'Show me some travel deals';
        break;
      case 'upgrade':
        triggerMessage = 'Can I upgrade my booking?';
        break;
      default:
        triggerMessage = trigger;
    }
    
    // Set as input value and send
    setInputValue(triggerMessage);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Render message based on type
  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'booking':
        return (
          <div className="space-y-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            {message.metadata && (
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 space-y-2">
                  {message.metadata.flightNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Flight:</span>
                      <span className="font-medium">{message.metadata.flightNumber}</span>
                    </div>
                  )}
                  {message.metadata.origin && message.metadata.destination && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Route:</span>
                      <span className="font-medium">{message.metadata.origin} → {message.metadata.destination}</span>
                    </div>
                  )}
                  {message.metadata.departureTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Departure:</span>
                      <span className="font-medium">{message.metadata.departureTime}</span>
                    </div>
                  )}
                  {message.metadata.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Price:</span>
                      <span className="font-medium">${message.metadata.price.toFixed(2)}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 p-4 pt-0">
                  <Button variant="outline" size="sm">Modify</Button>
                  <Button size="sm">Confirm Booking</Button>
                </CardFooter>
              </Card>
            )}
          </div>
        );
      
      case 'confirmation':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-400">Booking Confirmed</span>
            </div>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            {message.metadata && message.metadata.bookingId && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Booking Reference:</span>
                  <span className="font-bold">{message.metadata.bookingId}</span>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'update':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span className="font-medium text-amber-700 dark:text-amber-400">Important Update</span>
            </div>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        );
      
      case 'offer':
        return (
          <div className="space-y-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            {message.metadata && message.metadata.discountPercentage && (
              <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-purple-800 dark:text-purple-300">Special Offer</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {message.metadata.destination && `Travel to ${message.metadata.destination}`}
                      </p>
                      {message.metadata.offerExpiry && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Expires on {new Date(message.metadata.offerExpiry).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-purple-700 hover:bg-purple-800 text-xl py-3 px-4">
                      {message.metadata.discountPercentage}% OFF
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end p-4 pt-0">
                  <Button size="sm" className="bg-purple-700 hover:bg-purple-800">
                    View Deal
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        );
      
      default:
        return <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>;
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
        <div className="bg-primary p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Travel Buddy</h2>
                <p className="text-xs text-primary-foreground/80">Booking Assistant</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs border-white/30 text-white">ONLINE</Badge>
          </div>
        </div>
        
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/20">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {message.sender === 'bot' ? (
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/bot-avatar.png" alt="Bot" />
                    <AvatarFallback className="bg-primary text-white">TB</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-300 text-gray-800">ME</AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`rounded-lg p-4 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-white dark:bg-gray-800 shadow border dark:border-gray-700'
                  }`}
                >
                  {renderMessage(message)}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Message processing indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/bot-avatar.png" alt="Bot" />
                  <AvatarFallback className="bg-primary text-white">TB</AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-4 bg-white dark:bg-gray-800 shadow border dark:border-gray-700">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Reference for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick action triggers */}
        {activeTriggers.length > 0 && (
          <div className="p-2 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-800 flex gap-2 overflow-x-auto">
            {activeTriggers.includes('flight_search') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTrigger('flight_search')}
                className="whitespace-nowrap"
              >
                ✈️ Book a Flight
              </Button>
            )}
            {activeTriggers.includes('hotel_search') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTrigger('hotel_search')}
                className="whitespace-nowrap"
              >
                🏨 Find Hotels
              </Button>
            )}
            {activeTriggers.includes('status_check') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTrigger('status_check')}
                className="whitespace-nowrap"
              >
                🔍 Check Status
              </Button>
            )}
            {activeTriggers.includes('deals') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTrigger('deals')}
                className="whitespace-nowrap"
              >
                🎁 Special Deals
              </Button>
            )}
            {activeTriggers.includes('upgrade') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTrigger('upgrade')}
                className="whitespace-nowrap"
              >
                ⬆️ Upgrade Booking
              </Button>
            )}
          </div>
        )}
        
        {/* Input box */}
        <div className="p-4 border-t">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!inputValue.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}