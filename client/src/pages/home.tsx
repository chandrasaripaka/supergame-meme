import React, { useState, useEffect } from 'react';
import { WelcomeCard } from '@/components/WelcomeCard';
import { ChatInterface } from '@/components/ChatInterface';
import { TravelPlannerInterface } from '@/components/TravelPlannerInterface';
import { TravelQuickForm, BudgetBreakdown, DestinationSuggestions, TravelForm } from '@/components/TravelFormComponents';
import { Message } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { sendMessageToAI } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { PopularDestinations } from '@/components/PopularDestinations';
import { User } from '@shared/schema';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTravelForm, setShowTravelForm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [travelContext, setTravelContext] = useState<any>(null);
  const [savedTravelDetails, setSavedTravelDetails] = useState<any>(null);
  const [requireTravelDetails, setRequireTravelDetails] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome! I'm your AI Travel Concierge. To provide you with the most personalized travel recommendations, I'll need to collect your travel details first. Please fill out the travel form above to get started with your planning.",
      modelInfo: {
        provider: "system",
        model: "dynamic-llm-router",
        note: "Travel Details Required"
      }
    }
  ]);
  
  const { toast } = useToast();
  
  // Get user data
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user'],
    retry: false
  });
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check for chat session restoration and load saved travel details on component mount
  useEffect(() => {
    const restoreSessionId = localStorage.getItem('restoreChatSession');
    if (restoreSessionId) {
      localStorage.removeItem('restoreChatSession');
      restoreChatSession(parseInt(restoreSessionId));
    }
    
    // Load saved travel details
    const saved = localStorage.getItem('savedTravelDetails');
    if (saved) {
      try {
        const parsedDetails = JSON.parse(saved);
        setSavedTravelDetails(parsedDetails);
        setTravelContext(parsedDetails);
        setRequireTravelDetails(false);
        
        // Update welcome message to reflect saved details
        setMessages(prev => [
          {
            role: 'assistant',
            content: `Welcome back! I have your saved travel details for ${parsedDetails.destination}. How can I help you plan your trip today?`,
            modelInfo: {
              provider: "system",
              model: "dynamic-llm-router",
              note: "Travel details loaded"
            }
          }
        ]);
      } catch (error) {
        console.error('Error loading saved travel details:', error);
      }
    }
  }, []);

  // Function to restore a chat session
  const restoreChatSession = async (sessionId: number) => {
    try {
      // Fetch the chat session and its messages
      const sessionResponse = await fetch(`/api/chat-sessions/${sessionId}`, {
        credentials: 'include'
      });
      
      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        
        // Fetch messages for this session
        const messagesResponse = await fetch(`/api/chat-messages?sessionId=${sessionId}`, {
          credentials: 'include'
        });
        
        if (messagesResponse.ok) {
          const sessionMessages = await messagesResponse.json();
          
          // Convert database messages to our Message format
          const restoredMessages: Message[] = sessionMessages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            modelInfo: msg.modelInfo || { provider: 'restored', model: 'chat-history' }
          }));
          
          // Update state
          setMessages(restoredMessages);
          setCurrentSessionId(sessionId);
          setShowWelcome(false);
          setShowTravelForm(false); // Hide travel form when restoring conversation
          
          toast({
            title: "Chat Restored",
            description: `Restored conversation: ${session.title}`,
          });
        }
      }
    } catch (error) {
      console.error('Error restoring chat session:', error);
      toast({
        title: "Error",
        description: "Failed to restore chat session",
        variant: "destructive",
      });
    }
  };
  
  // Mutation for sending messages to the AI
  const { mutate, isPending } = useMutation({
    mutationFn: async (newMessage: string) => {
      // Add user message first
      const userMessage: Message = {
        role: 'user',
        content: newMessage
      };
      
      // Update messages state with user message
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      
      // Send to AI with updated message history
      const updatedMessages = [...messages, userMessage];
      return await sendMessageToAI(updatedMessages, newMessage);
    },
    onSuccess: async (aiMessage) => {
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      // Save AI response to database
      if (aiMessage.content) {
        await saveAIResponse(aiMessage.content);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      console.error("Error sending message:", error);
    }
  });
  
  const handleSendMessage = async (message: string) => {
    // Check if travel details are required first
    if (requireTravelDetails && !savedTravelDetails) {
      toast({
        title: "Travel details required",
        description: "Please enter your travel details first before starting the conversation.",
        variant: "destructive",
      });
      setShowTravelForm(true);
      return;
    }
    
    setShowWelcome(false);
    
    // Save chat session and message
    try {
      await saveChatMessage(message);
    } catch (error) {
      console.error('Failed to save chat message:', error);
    }
    
    // Send to AI with travel context if available
    const contextualMessage = travelContext 
      ? `${message}\n\nTravel Context: ${JSON.stringify(travelContext)}`
      : message;
    
    mutate(contextualMessage);
  };

  const saveChatMessage = async (message: string) => {
    try {
      let sessionId = currentSessionId;
      
      // Create new session if none exists
      if (!sessionId) {
        const sessionResponse = await fetch('/api/chat-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: message.substring(0, 50) + '...',
            summary: 'Travel planning conversation'
          })
        });
        
        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          sessionId = session.id;
          setCurrentSessionId(sessionId);
        }
      }
      
      // Save the message to the session
      if (sessionId) {
        await fetch('/api/chat-messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId,
            role: 'user',
            content: message
          })
        });
      }
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  // Save AI responses as well
  const saveAIResponse = async (response: string) => {
    try {
      if (currentSessionId) {
        await fetch('/api/chat-messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            role: 'assistant',
            content: response
          })
        });
      }
    } catch (error) {
      console.error('Error saving AI response:', error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleTravelFormSubmit = (formData: any) => {
    // Automatically save travel details to state and localStorage
    setSavedTravelDetails(formData);
    setTravelContext(formData);
    setRequireTravelDetails(false);
    setShowTravelForm(false);
    
    // Save to localStorage for persistence
    localStorage.setItem('savedTravelDetails', JSON.stringify(formData));
    
    // Show confirmation toast
    toast({
      title: "Travel details saved",
      description: "Your travel information has been automatically saved and can be used for future planning.",
    });
    
    // Create a summary message with travel details
    const travelSummary = `Perfect! Here are your travel details:
    
✈️ From: ${formData.from}
🌍 To: ${formData.destination}
📅 Dates: ${formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Flexible'} - ${formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'Flexible'}
💰 Budget: ${getBudgetLabel(formData.budget)}
👥 Travelers: ${getTravelersLabel(formData.travelers)}
⏱️ Duration: ${getDurationLabel(formData.duration)}

Let me create a personalized itinerary for you!`;

    const summaryMessage: Message = {
      role: 'assistant',
      content: travelSummary,
      modelInfo: {
        provider: "system",
        model: "travel-summary",
        note: "Travel Details Summary"
      }
    };
    
    setMessages((prevMessages) => [...prevMessages, summaryMessage]);
    
    // Send the travel context to AI for planning
    const planningPrompt = `Create a detailed travel itinerary with the following details: ${JSON.stringify(formData)}`;
    mutate(planningPrompt);
  };

  const getBudgetLabel = (budget: string) => {
    const labels: { [key: string]: string } = {
      'under_500': 'Under $500',
      '500_1000': '$500 - $1,000',
      '1000_2500': '$1,000 - $2,500',
      '2500_5000': '$2,500 - $5,000',
      '5000_10000': '$5,000 - $10,000',
      'over_10000': 'Over $10,000'
    };
    return labels[budget] || budget;
  };

  const getTravelersLabel = (travelers: string) => {
    const labels: { [key: string]: string } = {
      '1': 'Solo Traveler',
      '2': '2 People',
      '3': '3 People',
      '4': '4 People',
      '5': '5 People',
      '6_plus': '6+ People'
    };
    return labels[travelers] || travelers;
  };

  const getDurationLabel = (duration: string) => {
    const labels: { [key: string]: string } = {
      'weekend': 'Weekend (2-3 days)',
      'short': 'Short Trip (4-7 days)',
      'medium': '1-2 Weeks',
      'long': '2-4 Weeks',
      'extended': 'Over a Month'
    };
    return labels[duration] || duration;
  };
  
  const handleSavePlan = () => {
    toast({
      title: "Plan Saved",
      description: "Your travel plan has been saved successfully.",
    });
  };
  
  const handleExportPDF = () => {
    toast({
      title: "Exporting PDF",
      description: "Your travel plan is being exported as PDF.",
    });
    
    // In a real implementation, this would generate and download a PDF
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = '#';
      a.download = 'travel_plan.pdf';
      a.click();
      
      toast({
        title: "PDF Exported",
        description: "Your travel plan PDF has been downloaded.",
      });
    }, 1500);
  };
  
  const handleModifyPlan = () => {
    toast({
      title: "Modify Plan",
      description: "Please tell me what you'd like to change about the plan.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>

          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm text-gray-600">Welcome, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar - Mobile Responsive */}
      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Left Sidebar - Vertical Accordion Menu - Hidden on mobile */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 overflow-hidden hidden md:block`}>
          <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-2`}>
            {/* Travel Topics Accordion */}
            {sidebarCollapsed ? (
              <button 
                onClick={() => setSidebarCollapsed(false)}
                className="w-full p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-center"
                title="Travel Topics"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            ) : (
              <details className="group">
                <summary className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors list-none">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-gray-900">Travel Topics</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </summary>
                <div className="mt-2 ml-8 space-y-2">
                <button 
                  onClick={() => handleSendMessage("Tell me about destination research and how to choose the best places to visit")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Destination Research
                </button>
                <button 
                  onClick={() => handleSendMessage("Help me plan my travel budget and find ways to save money")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Budget Planning
                </button>
                <button 
                  onClick={() => handleSendMessage("What should I know about travel safety and health precautions?")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Safety & Health
                </button>
                <button 
                  onClick={() => handleSendMessage("Tell me about local culture and customs I should be aware of")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Local Culture
                </button>
                <button 
                  onClick={() => handleSendMessage("What are the best transportation options for my trip?")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Transportation
                </button>
                <button 
                  onClick={() => handleSendMessage("Help me find the best accommodation options")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Accommodation
                </button>
                </div>
              </details>
            )}

            {/* Travel Planning Accordion */}
            {sidebarCollapsed ? (
              <button 
                onClick={() => setSidebarCollapsed(false)}
                className="w-full p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-center"
                title="Personalized Planning"
              >
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </button>
            ) : (
              <details className="group">
                <summary className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors list-none">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="font-medium text-gray-900">Personalized Planning</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </summary>
              <div className="mt-2 ml-8 space-y-2">
                <button 
                  onClick={() => setShowTravelForm(true)}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Create New Trip
                </button>
                <button 
                  onClick={() => handleSendMessage("Show me my saved itineraries and past trips")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Saved Itineraries
                </button>
                <button 
                  onClick={() => handleSendMessage("Help me set up my travel preferences and interests")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Travel Preferences
                </button>
                <button 
                  onClick={() => handleSendMessage("Review my past trips and travel history")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Past Trips
                </button>
                </div>
              </details>
            )}

            {/* Travel Resources Accordion */}
            {sidebarCollapsed ? (
              <button 
                onClick={() => setSidebarCollapsed(false)}
                className="w-full p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-center"
                title="Travel Resources"
              >
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </button>
            ) : (
              <details className="group">
                <summary className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors list-none">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="font-medium text-gray-900">Travel Resources</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </summary>
              <div className="mt-2 ml-8 space-y-2">
                <button 
                  onClick={() => handleSendMessage("Give me comprehensive travel guides for popular destinations")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Travel Guides
                </button>
                <button 
                  onClick={() => handleSendMessage("Create a customized packing list for my trip")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Packing Lists
                </button>
                <button 
                  onClick={() => handleSendMessage("Share useful travel tips and insider advice")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Travel Tips
                </button>
                <button 
                  onClick={() => handleSendMessage("Help me understand currency exchange and money matters")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Currency Exchange
                </button>
                </div>
              </details>
            )}

            {/* User Management Accordion */}
            {sidebarCollapsed ? (
              <button 
                onClick={() => setSidebarCollapsed(false)}
                className="w-full p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-center"
                title="My Account"
              >
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            ) : (
              <details className="group">
                <summary className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors list-none">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium text-gray-900">My Account</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </summary>
              <div className="mt-2 ml-8 space-y-2">
                <button 
                  onClick={() => handleSendMessage("Show me my travel preferences and settings")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Preferences</span>
                </button>
                <button 
                  onClick={() => handleSendMessage("Show me all my saved trips and travel plans")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>Saved Trips</span>
                </button>
                <button 
                  onClick={() => handleSendMessage("Help me manage my travel companions and group settings")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>Companions</span>
                </button>
                <button 
                  onClick={() => handleSendMessage("Show me my chat history and previous conversations")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Chat History</span>
                </button>
                <button 
                  onClick={() => handleSendMessage("Open my travel scrapbook and memory collection")}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Scrapbook</span>
                </button>
                </div>
              </details>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile Menu Button */}
          <div className="md:hidden p-2 border-b bg-white">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="font-medium">Menu</span>
            </button>
          </div>

          {/* Mobile Sidebar Overlay */}
          {showMobileMenu && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
              <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Menu</h2>
                    <button
                      onClick={() => setShowMobileMenu(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Mobile menu content - copy sidebar content here */}
                <div className="p-4 space-y-2">
                  {/* Travel Topics for Mobile */}
                  <details className="group">
                    <summary className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors list-none">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-gray-900">Travel Topics</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </summary>
                    <div className="mt-2 ml-8 space-y-2">
                      <button 
                        onClick={() => {
                          handleSendMessage("Tell me about destination research and how to choose the best places to visit");
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        Destination Research
                      </button>
                      <button 
                        onClick={() => {
                          handleSendMessage("Help me plan my travel budget and find ways to save money");
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        Budget Planning
                      </button>
                      <button 
                        onClick={() => {
                          handleSendMessage("What should I know about travel safety and health precautions?");
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        Safety & Health
                      </button>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          )}

          {/* Chat Interface - At the top after header */}
          <div className="flex-1 min-h-0">
            {/* Show travel form if details are required */}
            {(showTravelForm || (requireTravelDetails && !savedTravelDetails)) && (
              <div className="p-2 md:p-4 border-b bg-gray-50">
                <TravelForm 
                  onSubmit={handleTravelFormSubmit} 
                  onClose={() => setShowTravelForm(false)}
                />
              </div>
            )}

            {/* Travel Planner Interface with Chat History - Full Height */}
            <div className="h-full">
              <TravelPlannerInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                onSavePlan={handleSavePlan}
                onExportPDF={handleExportPDF}
                onModifyPlan={handleModifyPlan}
                isLoading={isPending}
                travelContext={travelContext}
                currentSessionId={currentSessionId}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Travel Form Modal */}
      {showTravelForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Plan Your Perfect Trip</h2>
                <button
                  onClick={() => setShowTravelForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <TravelForm 
                onSubmit={handleTravelFormSubmit}
                onClose={() => setShowTravelForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
