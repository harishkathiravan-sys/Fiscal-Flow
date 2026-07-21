import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../../config/env';
import type { AiProvider, AiMessage, AiCompletionOptions } from '../ai.types';

// ─── Gemini Provider ────────────────────────

export class GeminiProvider implements AiProvider {
  private genAI: GoogleGenerativeAI;
  name = 'gemini' as const;

  constructor() {
    const apiKey = env.GEMINI_API_KEY || env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async complete(messages: AiMessage[], options: AiCompletionOptions = {}): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: options.model || 'gemini-2.0-flash',
    });

    // Convert messages to Gemini format
    const systemMsg = messages.find((m) => m.role === 'system');
    const chatMsgs = messages.filter((m) => m.role !== 'system');

    const chat = model.startChat({
      history: chatMsgs.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      systemInstruction: systemMsg?.content,
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 2000,
      },
    });

    const lastMsg = chatMsgs[chatMsgs.length - 1];
    const result = await chat.sendMessage(lastMsg.content);
    return result.response.text();
  }

  async completeJson<T = any>(
    messages: AiMessage[],
    options: AiCompletionOptions = {},
  ): Promise<T> {
    // Add JSON instruction to system prompt
    const jsonMessages = messages.map((m, i) => {
      if (i === 0 && m.role === 'system') {
        return {
          ...m,
          content: `${m.content}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, just the JSON object.`,
        };
      }
      return m;
    });

    const text = await this.complete(jsonMessages, options);

    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Gemini response');
    }

    return JSON.parse(jsonMatch[0]) as T;
  }
}
