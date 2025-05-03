import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import 'dotenv/config';

// Create a simple express server just for testing
const app = express();
const port = 5001; // Use a different port than the main app

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.get('/', async (req, res) => {
  res.send(`
    <h1>Gemini API Test</h1>
    <p>Use the buttons below to test different models:</p>
    <button onclick="testModel('gemini-2.0-flash')">Test gemini-2.0-flash</button>
    <button onclick="testModel('gemini-pro')">Test gemini-pro</button>
    <button onclick="testModel('gemini-1.5-pro')">Test gemini-1.5-pro</button>
    <div id="result" style="margin-top: 20px; border: 1px solid #ccc; padding: 10px;"></div>
    
    <script>
      async function testModel(modelName) {
        document.getElementById('result').innerHTML = 'Testing ' + modelName + '...';
        try {
          const response = await fetch('/test-model?model=' + modelName);
          const data = await response.json();
          document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        } catch (error) {
          document.getElementById('result').innerHTML = 'Error: ' + error.message;
        }
      }
    </script>
  `);
});

app.get('/test-model', async (req, res) => {
  const modelName = req.query.model as string || 'gemini-2.0-flash';
  
  try {
    console.log(`Testing model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Simple test prompt
    const result = await model.generateContent("Hello, what can you tell me about planning a trip to Paris?");
    const response = result.response.text();
    
    res.json({
      success: true,
      model: modelName,
      response: response
    });
  } catch (error: any) {
    console.error(`Error with model ${modelName}:`, error?.message || error);
    res.status(500).json({
      success: false,
      model: modelName,
      error: error?.message || String(error)
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});