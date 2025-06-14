import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, MapPin, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Message } from "@/types";
import { ChatResponseWithCharts } from "./ChatResponseWithCharts";

interface ModernChatInterfaceProps {
  onNewChat?: () => void;
}

export function ModernChatInterface({ onNewChat }: ModernChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Quick action suggestions
  const quickActions = [
    { icon: MapPin, text: "Plan a trip to Tokyo", color: "bg-blue-100 text-blue-700" },
    { icon: Calendar, text: "Weekend getaway ideas", color: "bg-green-100 text-green-700" },
    { icon: DollarSign, text: "Budget travel to Europe", color: "bg-purple-100 text-purple-700" },
    { icon: TrendingUp, text: "Best time to visit Bali", color: "bg-orange-100 text-orange-700" },
  ];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: 'user', content: message }
          ]
        })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: inputValue },
        { role: 'assistant', content: data.content, data: data.data }
      ]);
      setInputValue("");
      setIsLoading(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;
    
    setIsLoading(true);
    sendMessageMutation.mutate(inputValue);
  };

  const handleQuickAction = (text: string) => {
    setInputValue(text);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      if (isListening) {
        recognition.start();
      }

      return () => {
        recognition.stop();
      };
    }
  }, [isListening, toast]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Travel Assistant</h2>
            <p className="text-blue-100 text-sm">Plan your perfect journey with AI</p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            Online
          </Badge>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
      >
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Start Your Travel Adventure
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ask me anything about travel planning, destinations, or get personalized recommendations
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.text)}
                  className={`${action.color} p-3 rounded-lg text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2`}
                >
                  <action.icon className="w-4 h-4" />
                  {action.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatResponseWithCharts key={index} message={message} />
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about destinations, flights, hotels, or planning tips..."
              className="pr-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              disabled={isLoading}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setIsListening(!isListening)}
              disabled={isLoading}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-red-500" />
              ) : (
                <Mic className="w-4 h-4 text-gray-500" />
              )}
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Input hints */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="outline" className="text-xs">Try: "Plan 5 days in Paris"</Badge>
          <Badge variant="outline" className="text-xs">Or: "Cheap flights to Thailand"</Badge>
          <Badge variant="outline" className="text-xs">Or: "Best hotels in Tokyo"</Badge>
        </div>
      </div>
    </div>
  );
}