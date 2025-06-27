import React, { useState, useRef, useEffect } from "react";
import {
  Message,
  Weather,
  Attraction,
  TravelPlan,
  ItineraryDay,
  BudgetBreakdown as BudgetType,
} from "@/types";
import { ChatMessage, TypingIndicator } from "./ChatMessage";
import { WeatherForecast } from "./WeatherForecast";
import { ItineraryTable } from "./ItineraryTable";
import { BudgetDashboard } from "./BudgetDashboard";
import { AttractionCards } from "./AttractionCards";
import { FlightComparison } from "./FlightComparison";
import { SaveTripButton } from "./SaveTripButton";
import { TravelSafetyAlert } from "./TravelSafetyAlert";
import { InlineTravelForm, TravelFormData } from "./InlineTravelForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { sendMessageToAI } from "@/lib/gemini";
import {
  getWeather,
  getAttractions,
  generateTravelPlan,
  getFlightRecommendations,
} from "@/lib/apiClient";
import { extractTravelIntent } from "@/lib/gemini";
import { useMobile } from "@/hooks/use-mobile";

// Define interfaces for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
    item(index: number): any;
    length: number;
  };
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onSavePlan?: () => void;
  onExportPDF?: () => void;
  onModifyPlan?: () => void;
  isLoading: boolean;
  showFormByDefault?: boolean;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onSavePlan,
  onExportPDF,
  onModifyPlan,
  isLoading,
  showFormByDefault = true,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showInlineTravelForm, setShowInlineTravelForm] = useState(showFormByDefault);
  const [savedTravelDetails, setSavedTravelDetails] = useState<TravelFormData | null>(null);
  const [showTravelDetailsPrompt, setShowTravelDetailsPrompt] = useState(!showFormByDefault);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isMobile } = useMobile();

  // Fetch user preferences for context
  const { data: userPreferences } = useQuery({
    queryKey: ['/api/user/preferences'],
    queryFn: async () => {
      const response = await fetch('/api/user/preferences');
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Load saved travel details from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedTravelDetails');
    if (saved) {
      try {
        const parsedDetails = JSON.parse(saved);
        setSavedTravelDetails(parsedDetails);
        setShowTravelDetailsPrompt(false);
      } catch (error) {
        console.error('Error loading saved travel details:', error);
      }
    }
  }, []);

  // Check if speech recognition is available
  const speechRecognitionSupported =
    "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

  // Extract travel intent from messages
  const travelIntent = extractTravelIntent(messages);

  // Handle travel form submission with auto-save
  const handleTravelFormSubmit = (formData: TravelFormData) => {
    // Automatically save travel details to state
    setSavedTravelDetails(formData);
    setShowInlineTravelForm(false);
    setShowTravelDetailsPrompt(false);
    
    // Save to localStorage for persistence
    localStorage.setItem('savedTravelDetails', JSON.stringify(formData));
    
    // Show confirmation toast
    toast({
      title: "Travel details saved",
      description: "Your travel information has been automatically saved and can be used for future planning.",
    });
    
    // Create detailed travel context with user preferences
    const travelContext = {
      ...formData,
      userPreferences: userPreferences || {},
      tripDuration: calculateTripDuration(formData.departureDate, formData.returnDate)
    };

    // Create formatted message with travel details
    const travelMessage = `Plan my trip:
📍 From: ${formData.source} → To: ${formData.destination}
📅 Departure: ${new Date(formData.departureDate).toLocaleDateString()}
📅 Return: ${new Date(formData.returnDate).toLocaleDateString()}
👥 Travelers: ${formData.travelers}
💰 Budget: ${getBudgetLabel(formData.budget)}
🎯 Preferences: ${formData.preferences.join(', ')}

Please create a detailed itinerary with flight options, accommodations, activities, and daily plans.`;

    onSendMessage(travelMessage);
  };

  const handlePlanTripClick = () => {
    // Show the form immediately in chat
    setShowInlineTravelForm(true);
    
    // Auto-scroll to the form after a brief delay
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const calculateTripDuration = (departure: string, returnDate: string): number => {
    const start = new Date(departure);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getBudgetLabel = (budget: string): string => {
    const labels: { [key: string]: string } = {
      'budget': 'Budget ($500-1,500)',
      'mid-range': 'Mid-range ($1,500-3,000)',
      'luxury': 'Luxury ($3,000+)'
    };
    return labels[budget] || budget;
  };

  // Fetch weather data if we have a destination
  const { data: weatherData, isLoading: isWeatherLoading } = useQuery({
    queryKey: ["/api/weather", travelIntent.destination],
    enabled: !!travelIntent.destination,
    // Using the default queryFn that's set up in queryClient.ts
  });

  // Fetch attractions data if we have a destination
  const { data: attractionsData, isLoading: isAttractionsLoading } = useQuery({
    queryKey: ["/api/attractions", travelIntent.destination],
    enabled: !!travelIntent.destination,
    // Using the default queryFn that's set up in queryClient.ts
  });

  // Generate travel plan
  const { data: travelPlan, isLoading: isTravelPlanLoading } =
    useQuery<TravelPlan | null>({
      queryKey: ["/api/travel-plan", travelIntent],
      enabled: !!(
        travelIntent.destination &&
        travelIntent.duration &&
        travelIntent.budget
      ),
      // Using the default queryFn that's set up in queryClient.ts
    });

  // Get flight recommendations if we have a destination
  const { data: flightRecommendations, isLoading: isFlightLoading } = useQuery({
    queryKey: ["/api/flights/recommendations", travelIntent.destination],
    enabled: !!travelIntent.destination,
    // Using the default queryFn that's set up in queryClient.ts
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;

    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleSavePlan = () => {
    if (onSavePlan) {
      onSavePlan();
      toast({
        title: "Itinerary Saved",
        description: "Your travel plan has been saved successfully.",
      });
    }
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
      toast({
        title: "Exporting PDF",
        description: "Your travel plan is being exported to PDF.",
      });
    }
  };

  const handleModifyPlan = () => {
    if (onModifyPlan) {
      onModifyPlan();
    }
  };

  const handleCreateReport = () => {
    // Generate comprehensive travel report from conversation history
    const generateTravelReport = () => {
      const reportSections = [];
      
      // Header
      reportSections.push("# Travel Planning Report");
      reportSections.push(`*Generated on ${new Date().toLocaleDateString()}*\n`);
      
      // Travel Details Summary
      if (savedTravelDetails) {
        reportSections.push("## Travel Details");
        reportSections.push(`**Destination:** ${savedTravelDetails.destination}`);
        reportSections.push(`**Departure from:** ${savedTravelDetails.source}`);
        const duration = savedTravelDetails.returnDate && savedTravelDetails.departureDate 
          ? Math.ceil((new Date(savedTravelDetails.returnDate).getTime() - new Date(savedTravelDetails.departureDate).getTime()) / (1000 * 60 * 60 * 24))
          : 'N/A';
        reportSections.push(`**Duration:** ${duration} days`);
        reportSections.push(`**Budget:** $${savedTravelDetails.budget}`);
        reportSections.push(`**Travelers:** ${savedTravelDetails.travelers}`);
        if (savedTravelDetails.departureDate) {
          reportSections.push(`**Departure Date:** ${savedTravelDetails.departureDate}`);
        }
        if (savedTravelDetails.returnDate) {
          reportSections.push(`**Return Date:** ${savedTravelDetails.returnDate}`);
        }
        reportSections.push("");
      }
      
      // Conversation Summary
      reportSections.push("## Conversation Summary");
      messages.forEach((message, index) => {
        if (message.role === 'user') {
          reportSections.push(`**You:** ${message.content}`);
        } else {
          // Clean AI response and extract key information
          const cleanContent = message.content
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
            .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
            .replace(/#{1,6}\s/g, '') // Remove markdown headers
            .split('\n')
            .filter(line => line.trim() && !line.includes('Flight Options') && !line.includes('Interactive Daily Activities'))
            .join('\n');
          
          if (cleanContent.trim()) {
            reportSections.push(`**WanderNotes:** ${cleanContent}`);
          }
        }
        reportSections.push("");
      });
      
      // Travel Plan Summary (if available)
      if (travelPlan && typeof travelPlan === 'object') {
        const plan = travelPlan as TravelPlan;
        reportSections.push("## Travel Plan Overview");
        reportSections.push(`**Destination:** ${plan.destination}`);
        reportSections.push(`**Duration:** ${plan.duration} days`);
        reportSections.push(`**Budget:** $${plan.budget}`);
        reportSections.push("");
        
        if (plan.days && Array.isArray(plan.days)) {
          reportSections.push("### Daily Itinerary");
          plan.days.forEach((day: any, index: number) => {
            reportSections.push(`**Day ${index + 1}:**`);
            if (day.activities && Array.isArray(day.activities)) {
              day.activities.forEach((activity: string) => {
                reportSections.push(`- ${activity}`);
              });
            }
            reportSections.push("");
          });
        }
        
        if (plan.budgetBreakdown) {
          reportSections.push("### Budget Breakdown");
          Object.entries(plan.budgetBreakdown).forEach(([category, amount]) => {
            reportSections.push(`- ${category}: $${amount}`);
          });
          reportSections.push("");
        }
      }
      
      // Weather Information (if available)
      if (weatherData && typeof weatherData === 'object') {
        try {
          const weather = weatherData as any;
          if (weather.current || weather.forecast) {
            reportSections.push("## Weather Forecast");
            if (weather.current) {
              reportSections.push(`**Current:** ${weather.current.condition || 'N/A'}`);
              reportSections.push(`**Temperature:** ${weather.current.temperature || 'N/A'}`);
            }
            if (weather.forecast && Array.isArray(weather.forecast)) {
              reportSections.push("### 5-Day Forecast:");
              weather.forecast.slice(0, 5).forEach((day: any) => {
                reportSections.push(`- ${day.date}: ${day.condition}, High: ${day.high}°, Low: ${day.low}°`);
              });
            }
            reportSections.push("");
          }
        } catch (error) {
          // Skip weather section if there's an error
        }
      }
      
      // Attractions (if available)
      if (attractionsData && Array.isArray(attractionsData)) {
        reportSections.push("## Recommended Attractions");
        attractionsData.slice(0, 10).forEach((attraction: any) => {
          reportSections.push(`### ${attraction.name}`);
          if (attraction.description) {
            reportSections.push(attraction.description);
          }
          if (attraction.rating) {
            reportSections.push(`**Rating:** ${attraction.rating}/5`);
          }
          reportSections.push("");
        });
      }
      
      // Flight Information (if available)
      if (flightRecommendations && Array.isArray(flightRecommendations)) {
        reportSections.push("## Flight Recommendations");
        flightRecommendations.slice(0, 5).forEach((flight: any) => {
          reportSections.push(`### ${flight.airline} ${flight.flightNumber}`);
          reportSections.push(`**Route:** ${flight.departureCity} (${flight.departureAirport}) → ${flight.arrivalCity} (${flight.arrivalAirport})`);
          reportSections.push(`**Departure:** ${flight.departureTime}`);
          reportSections.push(`**Arrival:** ${flight.arrivalTime}`);
          reportSections.push(`**Duration:** ${flight.duration}`);
          reportSections.push(`**Price:** $${flight.price} ${flight.currency}`);
          reportSections.push(`**Stops:** ${flight.stops === 0 ? 'Direct' : flight.stops + ' stop(s)'}`);
          reportSections.push("");
        });
      }
      
      // Footer
      reportSections.push("---");
      reportSections.push("*Report generated by Wander Notes Travel Concierge*");
      
      return reportSections.join('\n');
    };
    
    // Generate and download the report
    const reportContent = generateTravelReport();
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `travel-report-${savedTravelDetails?.destination?.replace(/\s+/g, '-').toLowerCase() || 'plan'}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Generated",
      description: "Your comprehensive travel report has been downloaded as a Markdown file.",
    });
  };

  // Create a reference to store the speech recognition instance
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Handle starting and stopping voice input
  const handleVoiceInput = () => {
    if (!speechRecognitionSupported) {
      toast({
        title: "Voice Input Not Supported",
        description:
          "Your browser doesn't support voice input. Please try Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    try {
      // Start listening
      setSpeechError(null);
      setIsListening(true);

      // Create a new instance of SpeechRecognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Configure the recognition
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US"; // Default to English

      // Set up event handlers
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputValue((prev) => prev + transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setSpeechError(event.error);
        setIsListening(false);

        toast({
          title: "Voice Input Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      // Start recognition
      recognition.start();

      toast({
        title: "Listening...",
        description: "Speak now. I'm listening for your travel query.",
      });
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      setSpeechError("initialization_failed");
      setIsListening(false);

      toast({
        title: "Voice Input Failed",
        description:
          "Failed to initialize voice input. Please try again or use text input.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      {/* Chat Messages Container - Perplexity Style */}
      <div
        ref={chatContainerRef}
        className="space-y-8 pb-8"
      >
        {/* Render chat messages with cleaner spacing */}
        {messages.map((message, index) => (
          <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
            <ChatMessage message={message} />
          </div>
        ))}

        {/* Show typing indicator when loading */}
        {isLoading && (
          <div className="border-b border-gray-100 pb-6">
            <TypingIndicator />
          </div>
        )}

        {/* Inline Travel Form as Chat Message */}
        {showInlineTravelForm && (
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239"
                />
              </svg>
            </div>
            <div className="flex-1 max-w-none">
              <InlineTravelForm
                onSubmit={handleTravelFormSubmit}
                onCancel={() => setShowInlineTravelForm(false)}
                initialData={{
                  preferences: userPreferences?.travelPreferences || []
                }}
              />
            </div>
          </div>
        )}

        {/* Show travel plan if available */}
        {travelPlan &&
          typeof travelPlan === "object" &&
          !isLoading &&
          messages.length > 1 && (
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="chat-message bg-light rounded-lg p-3 shadow-sm">
                {/* Travel Safety Alert */}
                <TravelSafetyAlert destination={(travelPlan as TravelPlan).destination} />
                
                <p className="text-gray-800 mb-3">
                  Here's what I recommend for your{" "}
                  {(travelPlan as TravelPlan).duration}-day trip to{" "}
                  {(travelPlan as TravelPlan).destination} with a $
                  {(travelPlan as TravelPlan).budget} budget:
                </p>

                {/* Enhanced Weather Forecast */}
                <WeatherForecast
                  weather={weatherData as Weather | null}
                  isLoading={isWeatherLoading}
                />

                {/* Enhanced Itinerary Table with Charts */}
                <div>
                  {(travelPlan as any)?.days && Array.isArray((travelPlan as any).days) && (travelPlan as any).days.length > 0 && (
                    <ItineraryTable
                      days={(travelPlan as any).days}
                    />
                  )}
                </div>

                {/* Enhanced Budget Dashboard with Charts */}
                <BudgetDashboard
                  budget={(travelPlan as TravelPlan)?.budget || 0}
                  budgetBreakdown={
                    ((travelPlan as TravelPlan)?.budgetBreakdown || {}) as BudgetType
                  }
                  remainingBudget={(travelPlan as TravelPlan)?.remainingBudget || 0}
                />

                {/* Attraction Cards */}
                <AttractionCards
                  attractions={(attractionsData || []) as Attraction[]}
                  isLoading={isAttractionsLoading}
                />

                {/* Flight Comparison with price comparisons */}
                {flightRecommendations && (
                  <FlightComparison
                    flights={(flightRecommendations as any).all || []}
                    cheapestByAirline={
                      (flightRecommendations as any).cheapestByAirline || []
                    }
                    isLoading={isFlightLoading}
                  />
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <SaveTripButton 
                    messages={messages} 
                    destination={(travelPlan as TravelPlan)?.destination || ''} 
                  />
                  <button
                    onClick={handleExportPDF}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Export PDF
                  </button>
                  <button
                    onClick={handleModifyPlan}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm flex items-center transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Modify Plan
                  </button>
                  <button
                    onClick={handleCreateReport}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm flex items-center transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Create Report
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Input Area - OpenAI Style */}
      <div className="mt-6 px-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative bg-white border border-gray-300 rounded-xl shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <Input
              type="text"
              placeholder="Message WanderNotes..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-4 pr-20 border-0 rounded-xl resize-none focus:ring-0 focus:outline-none text-base"
              style={{ minHeight: '56px' }}
            />
            
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`absolute right-14 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                isListening
                  ? "text-primary bg-primary/10"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
              disabled={!speechRecognitionSupported}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              {isListening && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              )}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                inputValue.trim() && !isLoading
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-100 text-gray-400"
              }`}
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Action Buttons - Below Input */}
          <div className="mt-3 flex justify-center gap-3">
            {showInlineTravelForm && (
              <Button
                type="button"
                onClick={handlePlanTripClick}
                variant="outline"
                className="text-sm px-4 py-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239"
                  />
                </svg>
                Plan a Trip
              </Button>
            )}
            
            {/* Create Report Button - Show when there's conversation history */}
            {messages.length > 1 && (
              <Button
                type="button"
                onClick={handleCreateReport}
                variant="outline"
                className="text-sm px-4 py-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Create Report
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
