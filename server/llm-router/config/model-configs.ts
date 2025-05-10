import { ModelConfig } from '../models/types';

export const defaultModelConfigs: ModelConfig[] = [
  {
    provider: 'openai',
    name: 'gpt-4o',  // Updated to newest model
    capabilities: {
      speed: 8,
      knowledge: 9,
      reasoning: 9,
      creativity: 9
    },
    costPerInputToken: 0.000005,
    costPerOutputToken: 0.000015,
    maxContextTokens: 128000
  },
  {
    provider: 'anthropic',
    name: 'claude-3-7-sonnet-20250219',  // Using latest Anthropic model
    capabilities: {
      speed: 8,
      knowledge: 8,
      reasoning: 8,
      creativity: 8
    },
    costPerInputToken: 0.000005,
    costPerOutputToken: 0.000015,
    maxContextTokens: 200000
  },
  {
    provider: 'google',
    name: 'gemini-2.0-flash',  // Using latest Gemini model
    capabilities: {
      speed: 10,
      knowledge: 7,
      reasoning: 7,
      creativity: 7
    },
    costPerInputToken: 0.000001,
    costPerOutputToken: 0.000002,
    maxContextTokens: 128000
  }
];