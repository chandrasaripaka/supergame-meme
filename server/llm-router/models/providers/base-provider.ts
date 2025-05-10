// Base provider interface that all LLM providers must implement
import { LLMResponse, RequestOptions } from '../types';

export interface LLMProvider {
  generateCompletion(prompt: string, options?: RequestOptions): Promise<LLMResponse>;
}