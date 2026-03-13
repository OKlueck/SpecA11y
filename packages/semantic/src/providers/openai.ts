import type { LLMProvider, AssessmentContext, SemanticAnnotation } from '../types.js';
import { buildSystemPrompt, buildUserPrompt } from '../prompt.js';
import { parseResponse } from '../parse.js';

const DEFAULT_MODEL = 'gpt-4o-mini';

export function createOpenAIProvider(options: {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}): LLMProvider {
  const model = options.model || DEFAULT_MODEL;

  return {
    name: 'openai',
    model,

    async assess(context: AssessmentContext): Promise<SemanticAnnotation> {
      let OpenAI: new (opts: { apiKey?: string; baseURL?: string }) => {
        chat: {
          completions: {
            create: (params: Record<string, unknown>) => Promise<{
              choices: Array<{ message: { content: string | null } }>;
            }>;
          };
        };
      };

      try {
        const mod = await import('openai');
        OpenAI = mod.default ?? mod.OpenAI;
      } catch {
        throw new Error(
          'Install openai to use the OpenAI provider: pnpm add openai',
        );
      }

      const client = new OpenAI({
        apiKey: options.apiKey || process.env.OPENAI_API_KEY,
        baseURL: options.baseUrl,
      });

      const userContent: Array<Record<string, unknown>> = [];

      if (context.screenshot) {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: `data:image/png;base64,${context.screenshot}`,
            detail: 'low',
          },
        });
      }

      userContent.push({
        type: 'text',
        text: buildUserPrompt(context),
      });

      const response = await client.chat.completions.create({
        model,
        max_tokens: 300,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: userContent },
        ],
      });

      const text = response.choices[0]?.message?.content || '';
      return parseResponse(text, 'openai', model);
    },
  };
}
