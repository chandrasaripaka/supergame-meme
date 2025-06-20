// AI Service that uses the LLM Router for travel plans and conversations
import { routePrompt } from '../llm-router';
import type { RequestOptions, LLMResponse } from '../llm-router';
import { getHotelRecommendations, getEventRecommendations } from './hotel-recommendations';

// Type for travel plan response (shared with existing services)
interface TravelPlan {
  destination: string;
  duration: number;
  budget: number;
  remainingBudget: number;
  weather: {
    temp: string;
    condition: string;
  };
  days: Array<{
    day: number;
    title: string;
    activities: Array<{
      type: string;
      description: string;
      cost: number;
    }>;
  }>;
  budgetBreakdown: {
    accommodation: number;
    food: number;
    activities: number;
    transportation: number;
    miscellaneous: number;
  };
  recommendations: Array<{
    name: string;
    rating: number;
    description: string;
  }>;
}

// Function to generate a travel plan using the dynamic LLM Router
export async function generateTravelPlan(
  destination: string,
  duration: number,
  budget: number,
  interests: string[],
  startDate?: string
): Promise<TravelPlan> {
  try {
    const prompt = `
      Generate a detailed travel plan for a ${duration}-day trip to ${destination} with a budget of $${budget}.
      The traveler is interested in: ${interests.join(", ")}.
      ${startDate ? `The trip will start on ${startDate}.` : ""}
      
      Please provide a comprehensive itinerary with the following information in JSON format:
      1. Day-by-day activities with estimated costs
      2. Budget breakdown (accommodation, food, activities, transportation, miscellaneous)
      3. Recommendations for places to visit based on the interests
      4. Estimated remaining budget
      
      Format the response as a valid JSON object with the following structure:
      {
        "destination": string,
        "duration": number,
        "budget": number,
        "remainingBudget": number,
        "weather": { "temp": string, "condition": string },
        "days": [
          {
            "day": number,
            "title": string,
            "activities": [
              {
                "type": string, // One of: accommodation, food, activity, transportation
                "description": string,
                "cost": number
              }
            ]
          }
        ],
        "budgetBreakdown": {
          "accommodation": number,
          "food": number,
          "activities": number,
          "transportation": number,
          "miscellaneous": number
        },
        "recommendations": [
          {
            "name": string,
            "rating": number,
            "description": string
          }
        ]
      }`;

    // Set up options to prefer models with good reasoning and knowledge
    const options: RequestOptions = {
      minCapability: { reasoning: 7, knowledge: 7 },
      temperature: 0.2, // Lower temperature for more structured output
      maxTokens: 2048
    };

    // Route the prompt to the best available model
    const response = await routePrompt(prompt, options);
    
    // Log which model was used
    console.log(`Travel plan generated using ${response.provider}:${response.model}`);
    
    // Parse and validate the response
    try {
      const content = response.text;
      const jsonContent = extractJSONFromText(content);
      const travelPlan = JSON.parse(jsonContent) as TravelPlan;
      return travelPlan;
    } catch (parseError: any) {
      console.error("Error parsing AI response as JSON:", parseError);
      console.error("Raw response:", response.text);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

  } catch (error: any) {
    console.error("Error generating travel plan with LLM Router:", error);
    throw new Error(`Failed to generate travel plan: ${error.message}`);
  }
}

// Function to continue a conversation with the AI using the dynamic LLM Router
export async function continueTravelConversation(
  messages: Array<{ role: string; content: string }>,
  newMessage: string,
  weatherData: any = null
): Promise<{ text: string, modelInfo: { provider: string, model: string } }> {
  try {
    // Extract destination from the conversation
    const destination = extractDestinationFromMessage(newMessage);
    let hotelRecommendations: any[] = [];
    let eventRecommendations: any[] = [];
    
    // Get specific hotel and event recommendations if destination is identified
    if (destination) {
      hotelRecommendations = getHotelRecommendations(destination);
      eventRecommendations = getEventRecommendations(destination);
    }
    
    // Prepare system message content
    let systemContent = `You are an AI travel concierge that helps plan personalized travel experiences. You provide helpful, friendly advice about destinations, activities, accommodations, and local customs. Always be conversational but focused on travel planning.
    
    When recommending hotels and activities, use ONLY the specific authentic recommendations provided in the context below. Do not invent or suggest any hotels, restaurants, or activities not listed here.`;

    // Add specific hotel recommendations if available
    if (hotelRecommendations.length > 0) {
      systemContent += `\n\nAuthentic hotel recommendations for ${destination}:\n`;
      hotelRecommendations.forEach((hotel, index) => {
        systemContent += `${index + 1}. **${hotel.name}** (${hotel.brand})\n`;
        systemContent += `   - Location: ${hotel.address}, ${hotel.district}\n`;
        systemContent += `   - Rating: ${hotel.rating}/5\n`;
        systemContent += `   - Price Range: $${hotel.priceRange.min}-${hotel.priceRange.max} ${hotel.priceRange.currency} per night\n`;
        systemContent += `   - Category: ${hotel.category}\n`;
        systemContent += `   - Amenities: ${hotel.amenities.join(', ')}\n`;
        systemContent += `   - Highlights: ${hotel.highlights.join(', ')}\n\n`;
      });
    }

    // Add specific event recommendations if available
    if (eventRecommendations.length > 0) {
      systemContent += `\n\nAuthentic activity and event recommendations for ${destination}:\n`;
      eventRecommendations.forEach((event, index) => {
        systemContent += `${index + 1}. **${event.name}** (${event.type})\n`;
        systemContent += `   - Venue: ${event.venue}\n`;
        systemContent += `   - Duration: ${event.duration}\n`;
        systemContent += `   - Price Range: $${event.priceRange.min}-${event.priceRange.max} ${event.priceRange.currency}\n`;
        systemContent += `   - Category: ${event.category}\n`;
        systemContent += `   - Description: ${event.description}\n`;
        systemContent += `   - Highlights: ${event.highlights.join(', ')}\n\n`;
      });
    }
    
    // Add weather data if available
    if (weatherData) {
      const location = weatherData.location?.name || "the location";
      const temp = weatherData.current?.temp_c;
      const condition = weatherData.current?.condition?.text;
      const forecast = weatherData.forecast?.forecastday || [];
      
      systemContent += `\\n\\nImportant: I've checked the current weather for ${location}:\\n`;
      systemContent += `Current temperature: ${temp}°C\\n`;
      systemContent += `Current conditions: ${condition}\\n`;
      
      if (forecast.length > 0) {
        systemContent += `Forecast for the next ${forecast.length} days:\\n`;
        forecast.forEach((day: any, index: number) => {
          systemContent += `- Day ${index + 1}: High ${day.day.maxtemp_c}°C, Low ${day.day.mintemp_c}°C, ${day.day.condition.text}\\n`;
        });
      }
    }
    
    systemContent += `\\n\\nIMPORTANT: Format ALL travel responses using this professional itinerary structure:

## [Destination] Travel Itinerary
**Dates:** [Travel dates]
**Destination:** [Full destination name]
**Purpose:** [Brief description of trip purpose]
**Budget:** [Budget range]
**Travelers:** [Number of travelers]

---

### **Day 1: [Date] — [Activity Theme]**
- **Morning:**
  - [Activity description with specific details]
  - *[Photography/Travel Tips in italics]*
- **Afternoon:**
  - [Activity description]
- **Evening:**
  - [Activity description]
- **Overnight:** [Accommodation details]

### **Day 2: [Date] — [Activity Theme]**
[Continue same format]

---

## **[Section Title] & Tips**
- **[Category]:** [Detailed information with specific recommendations]
- **[Equipment/Preparation]:** [Specific items and preparation advice]
- **[Timing]:** [Best times and scheduling advice]

---

## **Estimated Budget Breakdown**
| Item                   | Estimated Cost (USD) |
|------------------------|---------------------|
| [Category] | $[Range]          |
| [Category] | $[Range]           |
| **Total**              | **$[Total Range]**     |

---

## **Summary**
[Brief summary paragraph that ties together the experience and value proposition]

Use this EXACT structure for all detailed travel responses. CRITICAL: You MUST include ALL sections:
1. Complete itinerary header with dates, destination, purpose, budget, travelers
2. ALL daily breakdowns (do not stop at Day 8 - complete the full itinerary)
3. Flight options section with multiple choices for outbound and return flights
4. Interactive day-wise activities with multiple options for morning, afternoon, and evening
5. Tips and recommendations section
6. REQUIRED budget breakdown table with specific costs
7. REQUIRED summary paragraph

IMPORTANT: Include realistic flight options and multiple activity choices for each time slot of each day. Users should be able to select from different airlines, times, and activity types.

Never truncate your response. Always complete the full itinerary structure including flights, activities, budget table and summary at the end.`;
    
    // Build the full prompt with message history
    let fullPrompt = systemContent + "\\n\\n";
    
    // Only include the last 10 messages to avoid context window limits
    const recentMessages = messages.slice(-10);
    
    // Add conversation history
    recentMessages.forEach(msg => {
      const role = msg.role === 'user' ? 'Traveler' : 'AI Travel Concierge';
      fullPrompt += `${role}: ${msg.content}\\n\\n`;
    });
    
    // Add the new message
    fullPrompt += `Traveler: ${newMessage}\\n\\nAI Travel Concierge:`;
    
    // Set up options for conversation (prefer faster models with good creativity)
    const options: RequestOptions = {
      minCapability: { creativity: 7 },
      temperature: 0.7, // Higher temperature for creative conversation
      maxTokens: 4096 // Increased token limit for complete responses including all sections
    };
    
    // Route the prompt to the best available model
    const response = await routePrompt(fullPrompt, options);
    
    // Log which model was used
    console.log(`Travel conversation continued using ${response.provider}:${response.model}`);
    
    // Return both the text and model info
    return {
      text: response.text,
      modelInfo: {
        provider: response.provider,
        model: response.model
      }
    };
  } catch (error: any) {
    console.error("Error continuing conversation with LLM Router:", error);
    throw new Error(`Failed to continue conversation: ${error.message}`);
  }
}

// Helper function to extract destination from user message
function extractDestinationFromMessage(message: string): string | null {
  const commonDestinations = [
    'new york', 'tokyo', 'london', 'paris', 'rome', 'barcelona', 'amsterdam', 
    'berlin', 'sydney', 'bangkok', 'singapore', 'hong kong', 'seoul', 'madrid',
    'vienna', 'prague', 'budapest', 'lisbon', 'dublin', 'copenhagen'
  ];
  
  const lowercaseMessage = message.toLowerCase();
  
  for (const destination of commonDestinations) {
    if (lowercaseMessage.includes(destination)) {
      return destination;
    }
  }
  
  return null;
}

// Helper function to extract JSON from text (useful for JSON responses)
function extractJSONFromText(text: string): string {
  // Try to find JSON inside markdown code blocks first
  const markdownMatch = text.match(/\`\`\`(?:json)?\s*(\{[\s\S]*\})\s*\`\`\`/);
  if (markdownMatch) {
    return markdownMatch[1];
  }
  
  // Try to find starting and ending brackets for JSON object
  const startIdx = text.indexOf('{');
  const endIdx = text.lastIndexOf('}');
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return text.substring(startIdx, endIdx + 1);
  }
  
  // If we couldn't extract JSON, return the whole text
  return text;
}