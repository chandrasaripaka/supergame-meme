import React, { useState, useEffect, useRef } from 'react';
import { ChatInterface } from './ChatInterface';
import { InteractiveItinerary } from './InteractiveItinerary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { MessageCircle, Map, Calendar, Users, DollarSign, ChevronDown, ChevronUp, History, PlaneTakeoff } from 'lucide-react';
import { Message } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface TravelPlannerInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  travelContext?: any;
  onSavePlan?: () => void;
  onExportPDF?: () => void;
  onModifyPlan?: () => void;
  currentSessionId?: number | null;
}

interface ChatSession {
  id: number;
  name: string;
  createdAt: string;
  lastMessage?: string;
}

export function TravelPlannerInterface({
  messages,
  onSendMessage,
  isLoading,
  travelContext,
  onSavePlan,
  onExportPDF,
  onModifyPlan,
  currentSessionId
}: TravelPlannerInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'itinerary'>('chat');
  const [chatHistoryCollapsed, setChatHistoryCollapsed] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Fetch chat sessions for history
  const { data: chatSessions, isLoading: isLoadingHistory } = useQuery<ChatSession[]>({
    queryKey: ['/api/chat/sessions'],
    queryFn: async () => {
      const response = await fetch('/api/chat/sessions');
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Generate mock travel data from chat messages for itinerary
  const generateTravelDataFromChat = () => {
    if (!travelContext) return null;

    // Extract travel information from messages and context
    const destination = travelContext.destination || 'Unknown Destination';
    const source = travelContext.source || travelContext.from || 'Singapore';
    const travelers = travelContext.travelers || 1;
    const budget = travelContext.budget || 'mid-range';
    
    // Map common city names to airport codes
    const getAirportCode = (cityName: string): string => {
      const cityToAirport: { [key: string]: string } = {
        'singapore': 'SIN',
        'new york': 'JFK',
        'london': 'LHR',
        'paris': 'CDG',
        'tokyo': 'NRT',
        'sydney': 'SYD',
        'los angeles': 'LAX',
        'bangkok': 'BKK',
        'dubai': 'DXB',
        'hong kong': 'HKG',
        'kuala lumpur': 'KUL',
        'manila': 'MNL',
        'jakarta': 'CGK',
        'seoul': 'ICN',
        'mumbai': 'BOM',
        'delhi': 'DEL'
      };
      
      const normalized = cityName.toLowerCase().trim();
      return cityToAirport[normalized] || cityName.slice(0, 3).toUpperCase();
    };

    const sourceCode = getAirportCode(source);
    const destinationCode = getAirportCode(destination);
    
    // Generate sample flights based on context
    const outboundFlights = [
      {
        id: 'flight-1',
        airline: 'Singapore Airlines',
        flightNumber: 'SQ001',
        departure: { airport: sourceCode, time: '14:30', date: travelContext.departureDate || '2025-07-01' },
        arrival: { airport: destinationCode, time: '22:15', date: travelContext.departureDate || '2025-07-01' },
        duration: '8h 45m',
        price: budget === 'luxury' ? 2500 : budget === 'mid-range' ? 1200 : 650,
        class: 'Economy' as const,
        stops: 0,
        amenities: ['In-flight entertainment', 'Meals included', 'Wi-Fi'],
        baggage: '30kg checked'
      }
    ];

    const returnFlights = [
      {
        id: 'flight-r1',
        airline: 'Singapore Airlines',
        flightNumber: 'SQ002',
        departure: { airport: destinationCode, time: '10:30', date: travelContext.returnDate || '2025-07-07' },
        arrival: { airport: sourceCode, time: '18:15', date: travelContext.returnDate || '2025-07-07' },
        duration: '8h 45m',
        price: budget === 'luxury' ? 2500 : budget === 'mid-range' ? 1200 : 650,
        class: 'Economy' as const,
        stops: 0,
        amenities: ['In-flight entertainment', 'Meals included', 'Wi-Fi'],
        baggage: '30kg checked'
      }
    ];

    // Generate day plans based on context
    const dayPlans = [
      {
        day: 1,
        date: travelContext.departureDate || '2025-07-01',
        location: destination,
        morning: [{
          id: 'act-1',
          name: 'Airport Transfer & Hotel Check-in',
          description: 'Arrive at destination and settle into accommodation',
          duration: '2 hours',
          cost: 50,
          category: 'Transfer',
          location: destination,
          timeSlot: 'morning' as const,
          groupSize: `${travelers} travelers`,
          highlights: ['Comfortable transfer', 'Hotel orientation']
        }],
        afternoon: [{
          id: 'act-2',
          name: 'City Walking Tour',
          description: 'Explore the main attractions and get oriented with the city',
          duration: '3 hours',
          cost: 75,
          category: 'Sightseeing',
          location: destination,
          timeSlot: 'afternoon' as const,
          groupSize: `${travelers} travelers`,
          highlights: ['Local guide', 'Photo opportunities', 'Historical insights']
        }],
        evening: [{
          id: 'act-3',
          name: 'Welcome Dinner',
          description: 'Traditional local cuisine at a recommended restaurant',
          duration: '2 hours',
          cost: budget === 'luxury' ? 150 : budget === 'mid-range' ? 75 : 40,
          category: 'Dining',
          location: destination,
          timeSlot: 'evening' as const,
          groupSize: `${travelers} travelers`,
          highlights: ['Local cuisine', 'Cultural experience', 'Wine pairing']
        }]
      }
    ];

    return {
      destination,
      outboundFlights,
      returnFlights,
      dayPlans,
      travelers,
      budget
    };
  };

  const travelData = generateTravelDataFromChat();

  const handleSessionSelect = (sessionId: number) => {
    // Store the session ID in localStorage to trigger restoration
    localStorage.setItem('restoreChatSession', sessionId.toString());
    window.location.reload();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Mobile-only Chat History Toggle */}
      <div className="md:hidden border-b bg-white p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowChatHistory(!showChatHistory)}
          className="w-full flex items-center gap-2"
        >
          <History size={16} />
          Chat History
          {showChatHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>

      {/* Chat History Sidebar - Responsive */}
      <div className={`
        ${showChatHistory ? 'block' : 'hidden'} md:block
        ${chatHistoryCollapsed ? 'md:w-16' : 'md:w-80'}
        w-full md:h-full bg-gray-50/50 border-r transition-all duration-300
        ${showChatHistory ? 'max-h-60 md:max-h-none overflow-y-auto' : ''}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b hidden md:block">
            <div className="flex items-center justify-between">
              {!chatHistoryCollapsed && (
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <History size={16} />
                  Chat History
                </h3>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatHistoryCollapsed(!chatHistoryCollapsed)}
                className="h-8 w-8 p-0"
              >
                {chatHistoryCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </Button>
            </div>
          </div>
          
          {(!chatHistoryCollapsed || showChatHistory) && (
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                {isLoadingHistory ? (
                  <div className="text-center py-4 text-sm text-gray-500">
                    Loading chat history...
                  </div>
                ) : chatSessions?.length ? (
                  chatSessions.map((session) => (
                    <Card
                      key={session.id}
                      className={cn(
                        "cursor-pointer hover:bg-gray-50 transition-colors",
                        currentSessionId === session.id && "bg-blue-50 border-blue-200"
                      )}
                      onClick={() => {
                        handleSessionSelect(session.id);
                        setShowChatHistory(false); // Close on mobile after selection
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{session.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(session.createdAt)}
                            </p>
                            {session.lastMessage && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {session.lastMessage}
                              </p>
                            )}
                          </div>
                          {currentSessionId === session.id && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500">
                    No chat history yet
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 h-full"
        <div className="h-full flex flex-col">
          {/* Travel Context Header - Mobile Responsive */}
          {travelContext && (
            <div className="border-b bg-white p-2 md:p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
                <div className="flex items-center gap-2">
                  <PlaneTakeoff size={20} className="text-blue-600 flex-shrink-0" />
                  <h2 className="font-semibold text-lg truncate">{travelContext.destination}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span className="truncate">
                      {travelContext.departureDate && new Date(travelContext.departureDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} className="flex-shrink-0" />
                    <span>{travelContext.travelers} travelers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} className="flex-shrink-0" />
                    <span className="truncate">{travelContext.budget}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation - Mobile Responsive */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chat' | 'itinerary')} className="flex-1 flex flex-col">
            <div className="border-b bg-white px-2 md:px-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                  <MessageCircle size={14} className="md:w-4 md:h-4" />
                  <span className="hidden sm:inline">AI Chat</span>
                  <span className="sm:hidden">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="itinerary" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm" disabled={!travelContext}>
                  <Map size={14} className="md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Travel Planner</span>
                  <span className="sm:hidden">Planner</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 m-0">
              <div className="h-full" ref={chatRef}>
                <ChatInterface
                  messages={messages}
                  onSendMessage={onSendMessage}
                  onSavePlan={onSavePlan}
                  onExportPDF={onExportPDF}
                  onModifyPlan={onModifyPlan}
                  isLoading={isLoading}
                  showFormByDefault={false}
                />
              </div>
            </TabsContent>

            {/* Itinerary Tab */}
            <TabsContent value="itinerary" className="flex-1 m-0">
              <div className="h-full overflow-auto">
                {travelData ? (
                  <div className="p-2 md:p-0">
                    <InteractiveItinerary
                      destination={travelData.destination}
                      outboundFlights={travelData.outboundFlights}
                      returnFlights={travelData.returnFlights}
                      dayPlans={travelData.dayPlans}
                      onFlightSelect={() => {}}
                      onActivitySelect={() => {}}
                      onSaveItinerary={onSavePlan}
                      onExportPDF={onExportPDF}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-4">
                    <div className="text-center max-w-sm">
                      <Map size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Travel Plan Yet</h3>
                      <p className="text-gray-500 mb-4 text-sm md:text-base">
                        Start a conversation in the AI Chat to create your travel plan
                      </p>
                      <Button onClick={() => setActiveTab('chat')} variant="outline" className="w-full md:w-auto">
                        Go to Chat
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}