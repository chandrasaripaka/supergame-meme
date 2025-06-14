import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { ChatResponseWithCharts } from "./ChatResponseWithCharts";
import { Message } from "@/types";

interface TravelChatInterfaceProps {
  onClose?: () => void;
}

export function TravelChatInterface({ onClose }: TravelChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Quick suggestions based on travel context
  const suggestions = [
    "Find flights to Tokyo under $800",
    "Best hotels in Paris for 3 nights", 
    "Plan a 5-day budget trip to Thailand",
    "Show me popular destinations this month"
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
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content || data.message || 'I received your message.',
        data: data.data,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [
        ...prev,
        { role: 'user', content: inputValue, timestamp: new Date().toISOString() },
        assistantMessage
      ]);
      setInputValue("");
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast({
        title: "Connection Error",
        description: "Please check your connection and try again.",
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

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 shadow-xl z-50 bg-white dark:bg-gray-900">
        <CardHeader className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex flex-row items-center justify-between">
          <h3 className="text-sm font-medium">Travel Assistant</h3>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setIsMinimized(false)} className="h-6 w-6 p-0 text-white hover:bg-white/20">
              <Maximize2 className="w-3 h-3" />
            </Button>
            {onClose && (
              <Button size="sm" variant="ghost" onClick={onClose} className="h-6 w-6 p-0 text-white hover:bg-white/20">
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl bg-white dark:bg-gray-900 border-0">
      {/* Header */}
      <CardHeader className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI Travel Assistant</h2>
            <p className="text-blue-100 text-sm">Get instant travel recommendations and bookings</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white text-xs">
              Online
            </Badge>
            <Button size="sm" variant="ghost" onClick={() => setIsMinimized(true)} className="h-8 w-8 p-0 text-white hover:bg-white/20">
              <Minimize2 className="w-4 h-4" />
            </Button>
            {onClose && (
              <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0 text-white hover:bg-white/20">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Chat Messages */}
      <CardContent className="p-0">
        <div 
          ref={chatContainerRef}
          className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
        >
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Ready to Plan Your Trip?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ask me about flights, hotels, destinations, or get personalized travel recommendations
              </p>
              
              {/* Suggestions */}
              <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-3 text-left bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-lg text-sm border border-gray-200 dark:border-gray-600 transition-colors"
                  >
                    {suggestion}
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
              <span className="text-sm">Finding the best options...</span>
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
                placeholder="Ask about flights, hotels, destinations..."
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
        </div>
      </CardContent>
    </Card>
  );
}