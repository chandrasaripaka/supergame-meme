import { Message } from "@/types";
import { saveMessage } from "@/lib/api";

// Function to send a message to the backend which will call AI
export async function sendMessageToAI(
  messages: Message[],
  newMessage: string,
  userId?: number,
  tripId?: number
): Promise<Message> {
  // Save the user message first
  const userMessage: Message = {
    role: "user",
    content: newMessage,
    userId,
    tripId
  };
  
  // Save user message to the backend if user is logged in
  if (userId) {
    await saveMessage(userMessage);
  }
  
  // Prepare the conversation history
  const conversationHistory = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  
  // Call the backend to get the AI response
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [...conversationHistory, { role: "user", content: newMessage }],
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Create the AI response message
  const aiMessage: Message = {
    role: "assistant",
    content: data.content,
    userId,
    tripId
  };
  
  // Save AI message to the backend if user is logged in
  if (userId) {
    await saveMessage(aiMessage);
  }
  
  return aiMessage;
}

// Helper function to extract travel intent from conversation
export function extractTravelIntent(messages: Message[]): {
  destination?: string;
  duration?: number;
  budget?: number;
  interests?: string[];
  startDate?: string;
} {
  // This is a simplified implementation. In a production app,
  // this would likely use NLP or send to the backend for processing.
  let travelIntent: {
    destination?: string;
    duration?: number;
    budget?: number;
    interests?: string[];
    startDate?: string;
  } = {
    destination: undefined,
    duration: undefined,
    budget: undefined,
    interests: undefined,
    startDate: undefined
  };
  
  // Look through user messages for travel intent
  const userMessages = messages.filter(msg => msg.role === 'user');
  
  for (const msg of userMessages) {
    // Look for destination mentions
    const destinationMatch = msg.content.match(/(?:to|in|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (destinationMatch && !travelIntent.destination) {
      travelIntent.destination = destinationMatch[1];
    }
    
    // Look for duration mentions
    const durationMatch = msg.content.match(/(\d+)(?:-|\s+)day(?:s)?/);
    if (durationMatch && !travelIntent.duration) {
      travelIntent.duration = parseInt(durationMatch[1]);
    }
    
    // Look for budget mentions
    const budgetMatch = msg.content.match(/\$(\d+(?:,\d+)*)/);
    if (budgetMatch && !travelIntent.budget) {
      travelIntent.budget = parseInt(budgetMatch[1].replace(/,/g, ''));
    }
    
    // Look for interests
    const interestsMatch = msg.content.match(/(?:interest(?:ed)? in|enjoy|love)\s+([^.,:;!?]+)/i);
    if (interestsMatch && !travelIntent.interests) {
      const interests = interestsMatch[1].split(/(?:,|and|\s+)/);
      travelIntent.interests = interests.filter(i => i.trim().length > 2);
    }
  }
  
  return travelIntent;
}