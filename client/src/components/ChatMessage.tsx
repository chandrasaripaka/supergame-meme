import React from 'react';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}
      
      <div className={`chat-message ${isUser ? 'bg-primary text-white' : 'bg-light text-gray-800'} rounded-lg p-3 shadow-sm`}>
        <p>{message.content}</p>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mr-3">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <div className="chat-message bg-light rounded-lg p-3 shadow-sm">
        <div className="typing-indicator flex space-x-1">
          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
        </div>
      </div>
    </div>
  );
}
