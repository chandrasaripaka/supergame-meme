import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

async function testGemini() {
  try {
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    
    // List available models
    console.log("Attempting to list available models...");
    try {
      // @ts-ignore - SDK might not have this method exposed but we'll try
      const models = await genAI.listModels();
      console.log("Available models:", models);
    } catch (error) {
      console.log("Could not list models, this function might not be available in the SDK");
    }

    // Try different model names
    const modelNames = [
      "gemini-pro",
      "gemini-1.0-pro",
      "gemini-1.5-pro",
      "gemini-pro-vision"
    ];

    for (const modelName of modelNames) {
      try {
        console.log(`\nTesting model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, what can you tell me about planning a trip to Paris?");
        console.log(`Model ${modelName} response: ${result.response.text()}`);
        console.log(`✅ Success with model: ${modelName}`);
      } catch (error: any) {
        console.error(`❌ Error with model ${modelName}:`, error?.message || String(error));
      }
    }

  } catch (error) {
    console.error("Main error:", error);
  }
}

testGemini();