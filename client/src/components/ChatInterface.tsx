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
} from "@/lib/api";
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
}

export function ChatInterface({
  messages,
  onSendMessage,
  onSavePlan,
  onExportPDF,
  onModifyPlan,
  isLoading,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isMobile } = useMobile();

  // Check if speech recognition is available
  const speechRecognitionSupported =
    "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

  // Extract travel intent from messages
  const travelIntent = extractTravelIntent(messages);

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-primary mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h2 className="font-semibold text-gray-800">
          Chat with TravelAI{" "}
          <span className="text-xs text-gray-500">**</span>
        </h2>
      </div>

      <div
        ref={chatContainerRef}
        className="chat-container overflow-y-auto px-4 py-4 space-y-4"
      >
        {/* Render chat messages */}
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {/* Show typing indicator when loading */}
        {isLoading && <TypingIndicator />}

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
                <ItineraryTable
                  days={((travelPlan as TravelPlan).days || []) as ItineraryDay[]}
                />

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
                </div>
              </div>
            </div>
          )}
      </div>

      <div className="border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Ask about your trip..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                isListening
                  ? "text-primary animate-pulse"
                  : "text-gray-400 hover:text-primary"
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
                <span className="absolute -top-2 -right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              )}
            </button>
          </div>
          <Button
            type="submit"
            className="bg-primary hover:bg-blue-700 text-white ml-2 px-5 py-3 rounded-md transition flex items-center"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
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
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
