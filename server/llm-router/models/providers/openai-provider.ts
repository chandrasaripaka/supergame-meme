// OpenAI provider implementation
import OpenAI from 'openai';
import { LLMProvider } from './base-provider';
import { LLMResponse, RequestOptions } from '../types';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }
  
  async generateCompletion(prompt: string, options: RequestOptions = {}): Promise<LLMResponse> {
    try {
      const model = options.model || 'gpt-4o'; // Default to newest model
      
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI travel concierge that assists with travel planning and recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        top_p: options.topP ?? 1,
      });
      
      const usage = {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      };
      
      return {
        text: response.choices[0].message.content || '',
        model,
        provider: 'openai',
        usage,
        metadata: {
          id: response.id,
          finish_reason: response.choices[0].finish_reason
        }
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}