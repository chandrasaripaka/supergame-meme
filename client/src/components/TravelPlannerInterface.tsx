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
    const travelers = travelContext.travelers || 1;
    const budget = travelContext.budget || 'mid-range';
    
    // Generate sample flights based on context
    const outboundFlights = [
      {
        id: 'flight-1',
        airline: 'Singapore Airlines',
        flightNumber: 'SQ001',
        departure: { airport: travelContext.source || 'SIN', time: '14:30', date: travelContext.departureDate || '2025-07-01' },
        arrival: { airport: destination.slice(0, 3).toUpperCase(), time: '22:15', date: travelContext.departureDate || '2025-07-01' },
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
        departure: { airport: destination.slice(0, 3).toUpperCase(), time: '10:30', date: travelContext.returnDate || '2025-07-07' },
        arrival: { airport: travelContext.source || 'SIN', time: '18:15', date: travelContext.returnDate || '2025-07-07' },
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
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Chat History Sidebar */}
      <ResizablePanel
        defaultSize={chatHistoryCollapsed ? 5 : 20}
        minSize={5}
        maxSize={30}
        className="bg-gray-50/50"
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
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
          
          {!chatHistoryCollapsed && (
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
                      onClick={() => handleSessionSelect(session.id)}
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
      </ResizablePanel>

      <ResizableHandle />

      {/* Main Content */}
      <ResizablePanel defaultSize={chatHistoryCollapsed ? 95 : 80} minSize={50}>
        <div className="h-full flex flex-col">
          {/* Travel Context Header */}
          {travelContext && (
            <div className="border-b bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <PlaneTakeoff size={20} className="text-blue-600" />
                    <h2 className="font-semibold text-lg">{travelContext.destination}</h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      {travelContext.departureDate && new Date(travelContext.departureDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      {travelContext.travelers} travelers
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={16} />
                      {travelContext.budget}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chat' | 'itinerary')} className="flex-1 flex flex-col">
            <div className="border-b bg-white px-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle size={16} />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="itinerary" className="flex items-center gap-2" disabled={!travelContext}>
                  <Map size={16} />
                  Travel Planner
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
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Map size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Travel Plan Yet</h3>
                      <p className="text-gray-500 mb-4">
                        Start a conversation in the AI Chat to create your travel plan
                      </p>
                      <Button onClick={() => setActiveTab('chat')} variant="outline">
                        Go to Chat
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}