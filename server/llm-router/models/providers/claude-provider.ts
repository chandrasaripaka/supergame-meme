// Anthropic Claude provider implementation
import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider } from './base-provider';
import { LLMResponse, RequestOptions } from '../types';

export class ClaudeProvider implements LLMProvider {
  private client: Anthropic;
  
  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey
    });
  }
  
  async generateCompletion(prompt: string, options: RequestOptions = {}): Promise<LLMResponse> {
    try {
      const model = options.model || 'claude-3-7-sonnet-20250219'; // Default to newest model
      
      const response = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens || 1024,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature ?? 0.7,
        top_p: options.topP ?? 1,
        system: 'You are a helpful AI travel concierge that assists with travel planning and recommendations.'
      });
      
      // Calculate token usage from the response
      const usage = {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
      };
      
      return {
        text: response.content[0].text,
        model,
        provider: 'anthropic',
        usage,
        metadata: {
          id: response.id,
          type: response.type
        }
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Claude API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}