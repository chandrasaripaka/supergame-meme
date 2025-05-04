import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Type for travel plan response
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

// Function to generate a travel plan using backup AI model
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
      }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "system",
          content:
            "You are an expert travel planner AI that creates detailed, realistic travel itineraries. Always provide accurate cost estimates and realistic recommendations. Format your response as JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from backup AI");
    }

    // Parse and validate the response
    const travelPlan = JSON.parse(content) as TravelPlan;
    return travelPlan;

  } catch (error: unknown) {
    console.error("Error generating travel plan with backup AI model:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate travel plan: ${errorMessage}`);
  }
}

// Function to continue a conversation with the AI
export async function continueTravelConversation(
  messages: Array<{ role: string; content: string }>,
  newMessage: string,
  weatherData: any = null
): Promise<string> {
  try {
    // Prepare system message content
    let systemContent = `You are an AI travel concierge that helps plan personalized travel experiences. You provide helpful, friendly advice about destinations, activities, accommodations, and local customs. Always be conversational but focused on travel planning.`;
    
    // Add weather data if available
    if (weatherData) {
      const location = weatherData.location?.name || "the location";
      const temp = weatherData.current?.temp_c;
      const condition = weatherData.current?.condition?.text;
      const forecast = weatherData.forecast?.forecastday || [];
      
      systemContent += `\n\nImportant: I've checked the current weather for ${location}:\n`;
      systemContent += `Current temperature: ${temp}°C\n`;
      systemContent += `Current conditions: ${condition}\n`;
      
      if (forecast.length > 0) {
        systemContent += `Forecast for the next ${forecast.length} days:\n`;
        forecast.forEach((day: any, index: number) => {
          systemContent += `- Day ${index + 1}: High ${day.day.maxtemp_c}°C, Low ${day.day.mintemp_c}°C, ${day.day.condition.text}\n`;
        });
      }
      
      systemContent += `\nPlease incorporate this weather information into your travel advice and be sure to mention the weather in a properly formatted weather code block in your response.\n`;
    }
    
    // Add the new user message to the conversation
    const conversationHistory = [
      {
        role: "system" as const,
        content: systemContent + `

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

*Tip: The Museum Pass can save you money if visiting multiple museums.*`,
      },
      ...messages.map(msg => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content
      })),
      { role: "user" as const, content: newMessage },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversationHistory,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error: unknown) {
    console.error("Error continuing conversation with backup AI model:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to continue conversation: ${errorMessage}`);
  }
}