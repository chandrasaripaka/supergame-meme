import { getWeather } from "./weather";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the AI providers for primary and backup services
const primaryAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const backupAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Interface for packing list preferences
export interface PackingListPreferences {
  destination: string;
  duration: number;
  activities: string[];
  preferences: {
    travelStyle?: "light" | "moderate" | "prepared" | string;
    hasChildren?: boolean;
    hasPets?: boolean;
    hasSpecialEquipment?: boolean;
    specialDietary?: boolean;
    medicalNeeds?: boolean;
    isBusinessTrip?: boolean;
  };
}

// Interface for a packing list item
export interface PackingItem {
  id: string;
  name: string;
  category: string; 
  quantity: number;
  essential: boolean;
  weatherDependent?: boolean;
  activityDependent?: string;
}

// Interface for packing list response
export interface PackingList {
  destination: string;
  categories: Array<{
    name: string;
    items: PackingItem[];
  }>;
  essentials: PackingItem[];
  weatherSpecific: PackingItem[];
  activitySpecific: PackingItem[];
}

/**
 * Generate a tailored packing list based on destination, weather, and preferences
 */
export async function generatePackingList(preferences: PackingListPreferences): Promise<PackingList> {
  try {
    // Attempt to get weather data for the destination to inform packing decisions
    let weatherData = null;
    try {
      weatherData = await getWeather(preferences.destination);
      console.log(`Weather data fetched for ${preferences.destination}`);
    } catch (error: any) {
      console.log(`Could not fetch weather data for ${preferences.destination}: ${error.message || String(error)}`);
    }

    // Try to use primary AI first, then fall back to backup AI if necessary
    try {
      return await generatePackingListWithPrimaryAI(preferences, weatherData);
    } catch (error) {
      console.log("Primary AI failed for packing list generation, falling back to backup AI:", error);
      return await generatePackingListWithBackupAI(preferences, weatherData);
    }
  } catch (error: any) {
    console.error("Error generating packing list:", error);
    throw new Error(`Failed to generate packing list: ${error.message || String(error)}`);
  }
}

/**
 * Generate packing list using primary AI service
 */
async function generatePackingListWithPrimaryAI(
  preferences: PackingListPreferences,
  weatherData: any = null
): Promise<PackingList> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    // Create prompt with all the necessary information
    let promptContent = `Generate a detailed, personalized packing list for a trip to ${preferences.destination} for ${preferences.duration} days.

Trip information:
- Destination: ${preferences.destination}
- Duration: ${preferences.duration} days
- Planned Activities: ${preferences.activities.join(", ")}
- Travel Style: ${preferences.preferences.travelStyle || "moderate"}
${preferences.preferences.hasChildren ? "- Traveling with children" : ""}
${preferences.preferences.hasPets ? "- Traveling with pets" : ""}
${preferences.preferences.specialDietary ? "- Has special dietary needs" : ""}
${preferences.preferences.medicalNeeds ? "- Has medical needs" : ""}
${preferences.preferences.isBusinessTrip ? "- This is a business trip" : ""}
`;

    // Add weather information if available
    if (weatherData) {
      promptContent += `\nWeather Information:
- Current Temperature: ${weatherData.current.temp_c}°C
- Weather Conditions: ${weatherData.current.condition.text}
- Humidity: ${weatherData.current.humidity}%
`;

      if (weatherData.forecast && weatherData.forecast.forecastday) {
        promptContent += "- Forecast:\n";
        weatherData.forecast.forecastday.forEach((day: any, index: number) => {
          promptContent += `  * Day ${index + 1}: High ${day.day.maxtemp_c}°C, Low ${day.day.mintemp_c}°C, ${day.day.condition.text}\n`;
        });
      }
    }

    promptContent += `\nPlease organize the packing list into the following categories:
1. Clothing
2. Toiletries & Personal Care
3. Electronics & Gadgets
4. Travel Documents & Money
5. Accessories
6. Destination-Specific Items
7. Activity-Specific Items
8. Weather-Specific Items
9. Health & Medical
10. Miscellaneous

For each item, specify:
- The item name
- The category it belongs to
- Recommended quantity
- Whether it's essential or optional
- If it's weather-dependent or activity-dependent

Format your response as a JSON object with the following structure:
{
  "destination": "Destination Name",
  "categories": [
    {
      "name": "Category Name",
      "items": [
        {
          "id": "unique-id",
          "name": "Item Name",
          "category": "Category Name",
          "quantity": Number,
          "essential": Boolean,
          "weatherDependent": Boolean,
          "activityDependent": "Activity name or null"
        }
      ]
    }
  ],
  "essentials": [ /* Most essential items across categories */ ],
  "weatherSpecific": [ /* Weather-dependent items */ ],
  "activitySpecific": [ /* Activity-dependent items */ ]
}

Ensure the response is valid JSON without any markdown formatting or extra text.`;

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptContent }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        responseMimeType: "application/json",
      },
    });

    const response = result.response;
    const text = response.text();
    
    try {
      // Parse the response into the PackingList structure
      const parsedResponse = JSON.parse(text);
      
      // Validate the response has the required structure
      if (!parsedResponse.destination || !parsedResponse.categories) {
        throw new Error("Generated packing list is missing required fields");
      }
      
      return parsedResponse as PackingList;
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      throw new Error("Generated packing list was not in the expected format");
    }
  } catch (error) {
    console.error("Error generating packing list with Gemini:", error);
    throw error;
  }
}

/**
 * Generate packing list using OpenAI
 */
async function generatePackingListWithOpenAI(
  preferences: PackingListPreferences,
  weatherData: any = null
): Promise<PackingList> {
  try {
    // Create prompt with all the necessary information
    let systemPrompt = `You are a smart travel assistant specializing in creating personalized packing lists. Generate a detailed packing list for a trip based on the destination, duration, planned activities, and any special preferences.`;

    let userPrompt = `Generate a detailed, personalized packing list for a trip to ${preferences.destination} for ${preferences.duration} days.

Trip information:
- Destination: ${preferences.destination}
- Duration: ${preferences.duration} days
- Planned Activities: ${preferences.activities.join(", ")}
- Travel Style: ${preferences.preferences.travelStyle || "moderate"}
${preferences.preferences.hasChildren ? "- Traveling with children" : ""}
${preferences.preferences.hasPets ? "- Traveling with pets" : ""}
${preferences.preferences.specialDietary ? "- Has special dietary needs" : ""}
${preferences.preferences.medicalNeeds ? "- Has medical needs" : ""}
${preferences.preferences.isBusinessTrip ? "- This is a business trip" : ""}
`;

    // Add weather information if available
    if (weatherData) {
      userPrompt += `\nWeather Information:
- Current Temperature: ${weatherData.current.temp_c}°C
- Weather Conditions: ${weatherData.current.condition.text}
- Humidity: ${weatherData.current.humidity}%
`;

      if (weatherData.forecast && weatherData.forecast.forecastday) {
        userPrompt += "- Forecast:\n";
        weatherData.forecast.forecastday.forEach((day: any, index: number) => {
          userPrompt += `  * Day ${index + 1}: High ${day.day.maxtemp_c}°C, Low ${day.day.mintemp_c}°C, ${day.day.condition.text}\n`;
        });
      }
    }

    userPrompt += `\nPlease organize the packing list into the following categories:
1. Clothing
2. Toiletries & Personal Care
3. Electronics & Gadgets
4. Travel Documents & Money
5. Accessories
6. Destination-Specific Items
7. Activity-Specific Items
8. Weather-Specific Items
9. Health & Medical
10. Miscellaneous

For each item, specify:
- The item name
- The category it belongs to
- Recommended quantity
- Whether it's essential or optional
- If it's weather-dependent or activity-dependent

Your response must be in valid JSON format with the following structure:
{
  "destination": "Destination Name",
  "categories": [
    {
      "name": "Category Name",
      "items": [
        {
          "id": "unique-id",
          "name": "Item Name",
          "category": "Category Name",
          "quantity": Number,
          "essential": Boolean,
          "weatherDependent": Boolean,
          "activityDependent": "Activity name or null"
        }
      ]
    }
  ],
  "essentials": [ /* Most essential items across categories */ ],
  "weatherSpecific": [ /* Weather-dependent items */ ],
  "activitySpecific": [ /* Activity-dependent items */ ]
}`;

    // Generate content with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const text = response.choices[0].message.content;
    
    if (!text) {
      throw new Error("Empty response from OpenAI");
    }
    
    try {
      // Parse the response into the PackingList structure
      const parsedResponse = JSON.parse(text);
      
      // Validate the response has the required structure
      if (!parsedResponse.destination || !parsedResponse.categories) {
        throw new Error("Generated packing list is missing required fields");
      }
      
      return parsedResponse as PackingList;
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      throw new Error("Generated packing list was not in the expected format");
    }
  } catch (error) {
    console.error("Error generating packing list with OpenAI:", error);
    throw error;
  }
}