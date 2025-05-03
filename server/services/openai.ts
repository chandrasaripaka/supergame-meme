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

// Function to generate a travel plan using OpenAI
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
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
      throw new Error("Empty response from OpenAI");
    }

    // Parse and validate the response
    const travelPlan = JSON.parse(content) as TravelPlan;
    return travelPlan;

  } catch (error) {
    console.error("Error generating travel plan with OpenAI:", error);
    throw new Error(`Failed to generate travel plan: ${error.message}`);
  }
}

// Function to continue a conversation with the AI
export async function continueTravelConversation(
  messages: Array<{ role: string; content: string }>,
  newMessage: string
): Promise<string> {
  try {
    // Add the new user message to the conversation
    const conversationHistory = [
      {
        role: "system",
        content: "You are an AI travel concierge that helps plan personalized travel experiences. You provide helpful, friendly advice about destinations, activities, accommodations, and local customs. Always be conversational but focused on travel planning.",
      },
      ...messages,
      { role: "user", content: newMessage },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: conversationHistory,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error continuing conversation with OpenAI:", error);
    throw new Error(`Failed to continue conversation: ${error.message}`);
  }
}
