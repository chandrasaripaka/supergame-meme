// Dynamic LLM Router for AI Travel Concierge
// Routes prompts to the best available AI model based on capabilities and availability

export interface RequestOptions {
  minCapability?: {
    reasoning?: number;
    knowledge?: number;
    creativity?: number;
  };
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export interface LLMResponse {
  text: string;
  provider: string;
  model: string;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

interface ModelCapabilities {
  reasoning: number;
  knowledge: number;
  creativity: number;
  available: boolean;
}

// Model capabilities mapping
const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  'openai:gpt-4o': {
    reasoning: 9,
    knowledge: 9,
    creativity: 8,
    available: true
  },
  'google:gemini-2.0-flash-exp': {
    reasoning: 8,
    knowledge: 8,
    creativity: 9,
    available: true
  },
  'google:gemini-1.5-pro': {
    reasoning: 7,
    knowledge: 8,
    creativity: 7,
    available: true
  }
};

class LLMRouter {
  private providers: Map<string, any> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private async initializeProviders() {
    try {
      // Initialize OpenAI
      if (process.env.OPENAI_API_KEY) {
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        this.providers.set('openai', openai);
        console.log('LLMRouter: Initialized OpenAI provider');
      }

      // Initialize Gemini
      if (process.env.GEMINI_API_KEY) {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.providers.set('google', genAI);
        console.log('LLMRouter: Initialized Gemini provider');
      }

      const providerNames = Array.from(this.providers.keys());
      console.log(`LLMRouter: Initialized with providers: ${providerNames.join(', ')}`);
    } catch (error) {
      console.error('LLMRouter: Error initializing providers:', error);
    }
  }

  private selectBestModel(options: RequestOptions = {}): string {
    const { minCapability = {} } = options;
    const { reasoning = 0, knowledge = 0, creativity = 0 } = minCapability;

    // Filter models that meet the minimum requirements
    const eligibleModels = Object.entries(MODEL_CAPABILITIES)
      .filter(([_, capabilities]) => 
        capabilities.available &&
        capabilities.reasoning >= reasoning &&
        capabilities.knowledge >= knowledge &&
        capabilities.creativity >= creativity
      )
      .sort((a, b) => {
        // Sort by overall capability score (weighted average)
        const scoreA = a[1].reasoning * 0.4 + a[1].knowledge * 0.4 + a[1].creativity * 0.2;
        const scoreB = b[1].reasoning * 0.4 + b[1].knowledge * 0.4 + b[1].creativity * 0.2;
        return scoreB - scoreA;
      });

    if (eligibleModels.length === 0) {
      // Fallback to the best available model
      const fallback = Object.entries(MODEL_CAPABILITIES)
        .filter(([_, capabilities]) => capabilities.available)
        .sort((a, b) => {
          const scoreA = a[1].reasoning + a[1].knowledge + a[1].creativity;
          const scoreB = b[1].reasoning + b[1].knowledge + b[1].creativity;
          return scoreB - scoreA;
        })[0];
      
      return fallback ? fallback[0] : 'openai:gpt-4o';
    }

    return eligibleModels[0][0];
  }

  private async callOpenAI(prompt: string, options: RequestOptions): Promise<LLMResponse> {
    const openai = this.providers.get('openai');
    if (!openai) {
      throw new Error('OpenAI provider not initialized');
    }

    const messages = [{ role: 'user', content: prompt }];
    const requestOptions: any = {
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
    };

    if (options.responseFormat === 'json') {
      requestOptions.response_format = { type: 'json_object' };
    }

    const response = await openai.chat.completions.create(requestOptions);
    
    return {
      text: response.choices[0].message.content || '',
      provider: 'OpenAI',
      model: 'gpt-4o',
      tokenUsage: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      }
    };
  }

  private async callGemini(prompt: string, options: RequestOptions): Promise<LLMResponse> {
    const genAI = this.providers.get('google');
    if (!genAI) {
      throw new Error('Gemini provider not initialized');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const generationConfig = {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxTokens || 2048,
    };

    if (options.responseFormat === 'json') {
      generationConfig.responseMimeType = 'application/json';
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    return {
      text: result.response.text(),
      provider: 'Google',
      model: 'gemini-2.0-flash-exp',
    };
  }

  async routePrompt(prompt: string, options: RequestOptions = {}): Promise<LLMResponse> {
    const selectedModel = this.selectBestModel(options);
    const [provider] = selectedModel.split(':');

    try {
      switch (provider) {
        case 'openai':
          return await this.callOpenAI(prompt, options);
        case 'google':
          return await this.callGemini(prompt, options);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`LLMRouter: Error with ${selectedModel}:`, error);
      
      // Try fallback to OpenAI if it wasn't the first choice
      if (provider !== 'openai' && this.providers.has('openai')) {
        console.log('LLMRouter: Falling back to OpenAI');
        try {
          return await this.callOpenAI(prompt, options);
        } catch (fallbackError) {
          console.error('LLMRouter: Fallback to OpenAI also failed:', fallbackError);
        }
      }
      
      // Try fallback to Gemini if it wasn't the first choice
      if (provider !== 'google' && this.providers.has('google')) {
        console.log('LLMRouter: Falling back to Gemini');
        try {
          return await this.callGemini(prompt, options);
        } catch (fallbackError) {
          console.error('LLMRouter: Fallback to Gemini also failed:', fallbackError);
        }
      }

      throw error;
    }
  }
}

// Create and export a singleton instance
const router = new LLMRouter();

export async function routePrompt(prompt: string, options?: RequestOptions): Promise<LLMResponse> {
  return router.routePrompt(prompt, options);
}

export default router;