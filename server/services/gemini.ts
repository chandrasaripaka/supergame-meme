import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Type for travel plan response (same as in OpenAI service)
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

// Function to generate a travel plan using Gemini
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
            "rating": number, // Between 1.0 and 5.0
            "description": string
          }
        ]
      }
      
      Ensure the response is a valid JSON that can be parsed with JSON.parse().`;

    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Using newest model as requested
    });

    // Generate system message to add context
    const systemPrompt = "You are an expert travel planner AI that creates detailed, realistic travel itineraries. Always provide accurate cost estimates and realistic recommendations. Format your response as JSON.";
    
    // Generate content
    const result = await model.generateContent([
      systemPrompt,
      prompt
    ]);
    
    const response = result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // Extract JSON content from the response
    // Sometimes Gemini might add markdown formatting or extra text around the JSON
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                     text.match(/```\s*([\s\S]*?)\s*```/) ||
                     [null, text]; // If no markdown, use the whole text
    
    let jsonContent = jsonMatch[1] || text;
    
    // Try to find JSON inside the text if it's not a complete JSON
    if (!jsonContent.trim().startsWith('{')) {
      const possibleJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      if (possibleJson) {
        jsonContent = possibleJson;
      }
    }

    // Parse and validate the response
    try {
      const travelPlan = JSON.parse(jsonContent) as TravelPlan;
      return travelPlan;
    } catch (parseError: any) {
      console.error("Error parsing Gemini response as JSON:", parseError);
      console.error("Raw response:", text);
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError.message}`);
    }

  } catch (error: any) {
    console.error("Error generating travel plan with Gemini:", error);
    throw new Error(`Failed to generate travel plan: ${error.message}`);
  }
}

// Function to continue a conversation with the AI
export async function continueTravelConversation(
  messages: Array<{ role: string; content: string }>,
  newMessage: string,
  weatherData: any = null
): Promise<string> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Using newest model as requested
    });

    // Map OpenAI role format to Gemini's expected format
    // In Gemini, we don't use roles the same way, but we can format our prompt accordingly
    
    // Create the chat context
    let conversationContext = `You are an AI travel concierge that helps plan personalized travel experiences. You provide helpful, friendly advice about destinations, activities, accommodations, and local customs. Always be conversational but focused on travel planning.

Important: Format your responses using markdown for better readability. Follow these formatting guidelines:

1. Use ## for Day headings (e.g., ## Day 1: Paris Exploration)
2. Use ### for section headings (e.g., ### Morning Activities)
3. Use bullet points with emoji prefixes for activities and recommendations:
   - 🏨 For accommodations
   - 🍽️ For restaurants/food
   - 🚶 For walking tours/exploration
   - 🚌 For transportation
   - 🎭 For entertainment
   - 🏛️ For museums/historical sites
   - 💰 For budget information
4. Use **bold** for important information and costs
5. Use *italics* for tips and additional notes
6. For detailed itineraries, use proper markdown tables
7. ALWAYS put budget breakdowns in code blocks for special formatting
8. ALWAYS include properly formatted weather information in code blocks when relevant
9. Use proper indentation for all content to improve readability
10. When mentioning attractions, landmarks, or scenery, include images where possible

Example of good formatting:
## 🗓️ Day 1: Arrival in Paris
- 🏨 **Hotel**: Sofitel Paris ($220/night)
- 🍽️ **Lunch**: Café de Flore ($30 per person)
- 🚶 **Afternoon**: Explore the Latin Quarter
  * Visit Shakespeare & Company bookstore
  * Stroll along Seine River
- 🍽️ **Dinner**: Le Comptoir ($40 per person)
- 💰 **Daily Budget**: $300

*Tip: The Museum Pass can save you money if visiting multiple museums.*

Now respond to the user's query using this markdown formatting style:
\n\n`;
    
    // Add conversation history
    messages.forEach(msg => {
      if (msg.role === "user") {
        conversationContext += `User: ${msg.content}\n`;
      } else if (msg.role === "assistant") {
        conversationContext += `AI: ${msg.content}\n`;
      }
      // We skip 'system' messages as they're already incorporated in the context
    });
    
    // Add weather data if available
    if (weatherData) {
      const location = weatherData.location?.name || "the location";
      const temp = weatherData.current?.temp_c;
      const condition = weatherData.current?.condition?.text;
      const forecast = weatherData.forecast?.forecastday || [];
      
      conversationContext += `\nImportant: I've checked the current weather for ${location}:\n`;
      conversationContext += `Current temperature: ${temp}°C\n`;
      conversationContext += `Current conditions: ${condition}\n`;
      
      if (forecast.length > 0) {
        conversationContext += `Forecast for the next ${forecast.length} days:\n`;
        forecast.forEach((day: any, index: number) => {
          conversationContext += `- Day ${index + 1}: High ${day.day.maxtemp_c}°C, Low ${day.day.mintemp_c}°C, ${day.day.condition.text}\n`;
        });
      }
      
      conversationContext += `\nPlease incorporate this weather information into your travel advice.\n`;
    }
    
    // Add the new user message
    conversationContext += `User: ${newMessage}\n\nAI: `;
    
    // Generate content
    const result = await model.generateContent(conversationContext);
    const response = result.response;
    const text = response.text();
    
    return text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Error continuing conversation with Gemini:", error);
    throw new Error(`Failed to continue conversation: ${error.message}`);
  }
}