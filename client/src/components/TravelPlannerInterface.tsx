import React, { useState, useEffect, useRef } from 'react';
import { ChatInterface } from './ChatInterface';
import { InteractiveItinerary } from './InteractiveItinerary';
import { SubscriptionSelector } from './SubscriptionSelector';
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
  isStudyMode?: boolean;
  onToggleStudyMode?: () => void;
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
  currentSessionId,
  isStudyMode,
  onToggleStudyMode
}: TravelPlannerInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'itinerary'>('chat');
  const [chatHistoryCollapsed, setChatHistoryCollapsed] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showSubscriptionSelector, setShowSubscriptionSelector] = useState(false);
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
    
    // Get airport code from API
    const getAirportCode = async (cityName: string): Promise<string> => {
      try {
        const response = await fetch(`/api/airport-code/${encodeURIComponent(cityName)}`);
        if (response.ok) {
          const data = await response.json();
          return data.airportCode || 'SIN';
        }
        return 'SIN';
      } catch (error) {
        console.error('Error fetching airport code:', error);
        return 'SIN';
      }
    };

    // Generate multiple flight options based on context and preferences
    const generateFlightOptions = async (isOutbound: boolean) => {
      const sourceCode = await getAirportCode(source);
      const destinationCode = await getAirportCode(destination);
      
      const fromAirport = isOutbound ? sourceCode : destinationCode;
      const toAirport = isOutbound ? destinationCode : sourceCode;
      const flightDate = isOutbound ? (travelContext.departureDate || '2025-07-01') : (travelContext.returnDate || '2025-07-07');
      
      const basePrice = budget === 'over_10000' ? 2500 : budget === '5000_10000' ? 1800 : 
                        budget === '2500_5000' ? 1200 : budget === '1000_2500' ? 800 : 
                        budget === '500_1000' ? 500 : 350;
      
      // Get flight options from API
      try {
        const response = await fetch('/api/flight-options', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fromCode: fromAirport,
            toCode: toAirport,
            departureDate: flightDate,
            basePrice: basePrice
          })
        });
        
        if (response.ok) {
          const flightOptions = await response.json();
          return flightOptions;
        }
      } catch (error) {
        console.error('Error fetching flight options:', error);
      }
      
      // Return empty array if API fails
      return [];
    };
    
    const [outboundFlights, setOutboundFlights] = useState<any[]>([]);
    const [returnFlights, setReturnFlights] = useState<any[]>([]);

    // Load flight options on component mount
    useEffect(() => {
      const loadFlights = async () => {
        const outbound = await generateFlightOptions(true);
        const returnFlight = await generateFlightOptions(false);
        setOutboundFlights(outbound);
        setReturnFlights(returnFlight);
      };
      loadFlights();
    }, [destination, source, travelContext.departureDate, travelContext.returnDate, budget]);

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
    <div className="h-full flex flex-col">
      {/* Main Content */}
      <div className="flex-1 min-w-0 h-full">
        <div className="h-full flex flex-col">
          {/* Travel Context - Mobile-Responsive */}
          {travelContext && (
            <div className="border-b bg-blue-50 px-3 py-2 md:px-2 md:py-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm md:text-xs truncate">{travelContext.destination}</span>
                <span className="text-xs text-blue-600 font-medium">${travelContext.budget}</span>
              </div>
            </div>
          )}

          {/* Tab Navigation - Mobile-Responsive */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chat' | 'itinerary')} className="flex-1 flex flex-col">
            <div className="border-b bg-white px-3 py-2 md:px-2 md:py-1">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-4 py-2 md:px-3 md:py-1.5 text-sm md:text-xs font-medium rounded-l transition-colors ${
                    activeTab === 'chat' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('itinerary')}
                  disabled={!travelContext}
                  className={`flex-1 px-4 py-2 md:px-3 md:py-1.5 text-sm md:text-xs font-medium rounded-r transition-colors ${
                    activeTab === 'itinerary' 
                      ? 'bg-blue-100 text-blue-700' 
                      : travelContext 
                        ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-50' 
                        : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Plan
                </button>
              </div>
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
                  isStudyMode={isStudyMode}
                  onToggleStudyMode={onToggleStudyMode}
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

      {/* Subscription Selector Modal */}
      {showSubscriptionSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Choose Your Plan</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubscriptionSelector(false)}
                  className="h-8 w-8 p-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
            
            <SubscriptionSelector
              onPlanSelect={(planId) => {
                setShowSubscriptionSelector(false);
                // Handle plan selection
              }}
              showTravelContext={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}