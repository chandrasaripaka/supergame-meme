// Main export file for LLM Router
import { LLMRouter } from './services/llm-router';
import { OpenAIProvider } from './models/providers/openai-provider';
import { ClaudeProvider } from './models/providers/claude-provider';
import { GeminiProvider } from './models/providers/gemini-provider';
import { defaultModelConfigs } from './config/model-configs';
import type { RequestOptions, LLMResponse } from './models/types';

// Initialize the router
const router = new LLMRouter();

// Initialize providers and register them
const openaiKey = process.env.OPENAI_API_KEY;
const claudeKey = process.env.ANTHROPIC_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (openaiKey) {
  console.log('LLMRouter: Initializing OpenAI provider');
  const openaiProvider = new OpenAIProvider(openaiKey);
  router.registerProviders([
    { provider: openaiProvider, config: defaultModelConfigs.find(m => m.provider === 'openai')! }
  ]);
}

if (claudeKey) {
  console.log('LLMRouter: Initializing Claude provider');
  const claudeProvider = new ClaudeProvider(claudeKey);
  router.registerProviders([
    { provider: claudeProvider, config: defaultModelConfigs.find(m => m.provider === 'anthropic')! }
  ]);
}

if (geminiKey) {
  console.log('LLMRouter: Initializing Gemini provider');
  const geminiProvider = new GeminiProvider(geminiKey);
  router.registerProviders([
    { provider: geminiProvider, config: defaultModelConfigs.find(m => m.provider === 'google')! }
  ]);
}

// Check for available providers
const availableProviders = [
  openaiKey ? 'OpenAI' : null,
  claudeKey ? 'Claude (Anthropic)' : null,
  geminiKey ? 'Gemini (Google)' : null
].filter(Boolean);

if (availableProviders.length === 0) {
  console.warn('LLMRouter: No API keys provided for any LLM providers. Router will not function.');
} else {
  console.log(`LLMRouter: Initialized with providers: ${availableProviders.join(', ')}`);
}

// Export the router instance
export async function routePrompt(prompt: string, options: RequestOptions = {}): Promise<LLMResponse> {
  return router.processPrompt(prompt, options);
}

// Re-export types
export type { 
  RequestOptions,
  LLMResponse,
  ModelConfig,
  ModelCapabilities,
  TaskComplexity
} from './models/types';

// Export for extensibility
export { LLMRouter, OpenAIProvider, ClaudeProvider, GeminiProvider, defaultModelConfigs };