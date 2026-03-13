import type { ProviderConfig, LLMProvider } from '../types.js';
import { createAnthropicProvider } from './anthropic.js';
import { createOpenAIProvider } from './openai.js';
import { createOllamaProvider } from './ollama.js';

export function createProvider(config: ProviderConfig): LLMProvider {
  switch (config.provider) {
    case 'anthropic':
      return createAnthropicProvider({
        apiKey: config.apiKey,
        model: config.model,
      });
    case 'openai':
      return createOpenAIProvider({
        apiKey: config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
      });
    case 'ollama':
      return createOllamaProvider({
        model: config.model,
        baseUrl: config.baseUrl,
      });
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}
