import React, { useState, useEffect } from 'react';
import { WelcomeCard } from '@/components/WelcomeCard';
import { ChatInterface } from '@/components/ChatInterface';
import { Message } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { sendMessageToAI } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { PopularDestinations } from '@/components/PopularDestinations';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
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
  
  // Mutation for sending messages to the AI
  const { mutate, isPending } = useMutation({
    mutationFn: async (newMessage: string) => {
      return await sendMessageToAI(messages, newMessage);
    },
    onSuccess: (aiMessage) => {
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
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
  
  const handleSendMessage = (message: string) => {
    // Add user message to the chat
    const userMessage: Message = {
      role: 'user',
      content: message
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // Hide welcome card after first message
    setShowWelcome(false);
    
    // Send message to AI
    mutate(message);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
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
    <>
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
      />
      
      <PopularDestinations />
    </>
  );
}
