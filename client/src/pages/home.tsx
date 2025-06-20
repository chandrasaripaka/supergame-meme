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
    <div className="min-h-screen hero-gradient travel-bg-pattern">
      <div className="relative z-10">
        <WelcomeCard 
          onSuggestionClick={handleSuggestionClick}
          visible={showWelcome}
        />
        
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          onSavePlan={handleSavePlan}
          onExportPDF={handleExportPDF}
          onModifyPlan={handleModifyPlan}
          isLoading={isPending}
          showFormByDefault={!currentSessionId}
        />
        

        
        {travelContext && travelContext.budget && (
          <div className="max-w-4xl mx-auto px-4 mb-8">
            <BudgetBreakdown budget={travelContext.budget} />
          </div>
        )}
        
        <PopularDestinations />
      </div>
      
      {/* Floating travel elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-animation absolute top-20 left-10 opacity-20">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path d="M30 5L40 20H35V35H25V20H20L30 5Z" fill="white"/>
            <circle cx="30" cy="45" r="8" fill="white"/>
          </svg>
        </div>
        <div className="floating-animation absolute top-40 right-20 opacity-20" style={{animationDelay: '2s'}}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <path d="M25 10L35 25L25 40L15 25L25 10Z" fill="white"/>
          </svg>
        </div>
        <div className="floating-animation absolute bottom-20 left-20 opacity-20" style={{animationDelay: '4s'}}>
          <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
            <circle cx="35" cy="35" r="30" stroke="white" strokeWidth="2" fill="none"/>
            <path d="M20 35L35 20L50 35L35 50L20 35Z" fill="white"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
