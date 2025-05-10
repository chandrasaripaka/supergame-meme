// Gemini provider implementation
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider } from './base-provider';
import { LLMResponse, RequestOptions } from '../types';

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenerativeAI;
  
  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }
  
  async generateCompletion(prompt: string, options: RequestOptions = {}): Promise<LLMResponse> {
    try {
      const model = options.model || 'gemini-2.0-flash'; // Default to newest model
      
      const genModel = this.client.getGenerativeModel({ model });
      
      // Calculate approximate token count for usage reporting (rough estimate)
      const promptTokens = Math.ceil(prompt.length / 4);
      
      const response = await genModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          topP: options.topP ?? 1,
          topK: options.topK ?? 40,
          maxOutputTokens: options.maxTokens
        },
      });
      
      const text = response.response.text();
      const completionTokens = Math.ceil(text.length / 4);
      
      return {
        text,
        model,
        provider: 'google',
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens
        },
        metadata: {
          finishReason: response.response.promptFeedback?.blockReason || 'STOP'
        }
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}