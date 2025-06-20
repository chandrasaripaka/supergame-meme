import React, { useState, useEffect } from 'react';
import { WelcomeCard } from '@/components/WelcomeCard';
import { ChatInterface } from '@/components/ChatInterface';
import { TravelQuickForm, BudgetBreakdown, DestinationSuggestions } from '@/components/TravelFormComponents';
import { Message } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { sendMessageToAI } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { PopularDestinations } from '@/components/PopularDestinations';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTravelForm, setShowTravelForm] = useState(false);
  const [travelContext, setTravelContext] = useState<any>(null);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Travel Concierge powered by advanced AI models. I can help you plan your perfect trip. Just tell me where you'd like to go, your budget, and what you enjoy doing when you travel.",
      modelInfo: {
        provider: "system",
        model: "dynamic-llm-router",
        note: "Dynamic LLM Router"
      }
    }
  ]);
  
  const { toast } = useToast();

  // Check for chat session restoration on component mount
  useEffect(() => {
    const restoreSessionId = localStorage.getItem('restoreChatSession');
    if (restoreSessionId) {
      localStorage.removeItem('restoreChatSession');
      restoreChatSession(parseInt(restoreSessionId));
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
    setTravelContext(formData);
    setShowTravelForm(false);
    
    // Create a summary message with travel details
    const travelSummary = `Perfect! Here are your travel details:
    
🌍 Destination: ${formData.destination}
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
    <div className="min-h-screen bg-white">
      {/* Perplexity-style centered layout */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with clean, minimal banner */}
        <div className="pt-12 pb-8 text-center border-b border-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your AI Travel Concierge
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Ask anything about travel planning
          </p>
        </div>
        
        {/* Main feed-style content area */}
        <div className="py-8 pb-20">
          {/* Welcome accordion */}
          {showWelcome && (
            <div className="mb-8">
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <details className="group" open>
                  <summary className="px-6 py-5 cursor-pointer hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between list-none">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">Welcome to WanderNotes</h3>
                      <p className="text-gray-600 mt-1">Get started with personalized travel planning</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 transition-transform duration-300 group-open:rotate-180 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 border-t border-gray-200 bg-white">
                    <div className="pt-4">
                      <WelcomeCard 
                        onSuggestionClick={handleSuggestionClick}
                        visible={showWelcome}
                      />
                    </div>
                  </div>
                </details>
              </div>
            </div>
          )}
          
          {/* Chat Interface - Clean minimal design */}
          <div className="space-y-6">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onSavePlan={handleSavePlan}
              onExportPDF={handleExportPDF}
              onModifyPlan={handleModifyPlan}
              isLoading={isPending}
              showFormByDefault={!currentSessionId}
            />
          </div>
          
          {/* Budget Breakdown - Accordion style */}
          {travelContext && travelContext.budget && (
            <div className="mt-8">
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <details className="group">
                  <summary className="px-6 py-5 cursor-pointer hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between list-none">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">Budget Breakdown</h3>
                      <p className="text-gray-600 mt-1">View your travel budget allocation</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 transition-transform duration-300 group-open:rotate-180 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 border-t border-gray-200 bg-white">
                    <div className="pt-4">
                      <BudgetBreakdown budget={travelContext.budget} />
                    </div>
                  </div>
                </details>
              </div>
            </div>
          )}
          
          {/* Popular Destinations - Accordion style */}
          <div className="mt-8">
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <details className="group">
                <summary className="px-6 py-5 cursor-pointer hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between list-none">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">Popular Destinations</h3>
                    <p className="text-gray-600 mt-1">Explore trending travel spots and get inspired</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 transition-transform duration-300 group-open:rotate-180 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 border-t border-gray-200 bg-white">
                  <div className="pt-4">
                    <PopularDestinations />
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating "Ask a question" button - Perplexity style */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => setShowTravelForm(!showTravelForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="font-medium">Ask a question</span>
        </button>
      </div>
    </div>
  );
}
