import OpenAI from 'openai';
import { env } from '../../../config/env';
import type { AiProvider, AiMessage, AiCompletionOptions } from '../ai.types';

// ─── OpenAI Provider ────────────────────────

export class OpenAiProvider implements AiProvider {
  private client: OpenAI;
  name = 'openai' as const;

  constructor() {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async complete(messages: AiMessage[], options: AiCompletionOptions = {}): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options.model || 'gpt-4o',
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 2000,
    });

    return response.choices[0]?.message?.content || '';
  }

  async completeJson<T = any>(
    messages: AiMessage[],
    options: AiCompletionOptions = {},
  ): Promise<T> {
    const response = await this.client.chat.completions.create({
      model: options.model || 'gpt-4o',
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      response_format: { type: 'json_object' },
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 2000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content) as T;
  }
}
