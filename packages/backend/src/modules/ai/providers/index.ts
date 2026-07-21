import { env } from '../../../config/env';
import type { AiProvider } from '../ai.types';
import { OpenAiProvider } from './openai';
import { GeminiProvider } from './gemini';

// ─── Provider Factory ───────────────────────

let cachedProvider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (cachedProvider) return cachedProvider;

  const provider = env.AI_PROVIDER || 'openai';

  try {
    if (provider === 'gemini' && env.GEMINI_API_KEY) {
      cachedProvider = new GeminiProvider();
    } else if (env.OPENAI_API_KEY) {
      cachedProvider = new OpenAiProvider();
    } else if (env.GEMINI_API_KEY) {
      cachedProvider = new GeminiProvider();
    } else {
      throw new Error('No AI provider configured. Set OPENAI_API_KEY or GEMINI_API_KEY.');
    }
  } catch {
    throw new Error(`Failed to initialize AI provider "${provider}". Check your API keys.`);
  }

  return cachedProvider;
}
