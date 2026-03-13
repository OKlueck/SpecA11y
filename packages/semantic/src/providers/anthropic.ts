import type { LLMProvider, AssessmentContext, SemanticAnnotation } from '../types.js';
import { buildSystemPrompt, buildUserPrompt } from '../prompt.js';
import { parseResponse } from '../parse.js';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export function createAnthropicProvider(options: {
  apiKey?: string;
  model?: string;
}): LLMProvider {
  const model = options.model || DEFAULT_MODEL;

  return {
    name: 'anthropic',
    model,

    async assess(context: AssessmentContext): Promise<SemanticAnnotation> {
      let Anthropic: new (opts: { apiKey?: string }) => {
        messages: {
          create: (params: Record<string, unknown>) => Promise<{
            content: Array<{ type: string; text?: string }>;
          }>;
        };
      };

      try {
        const mod = await import('@anthropic-ai/sdk');
        Anthropic = mod.default ?? mod.Anthropic;
      } catch {
        throw new Error(
          'Install @anthropic-ai/sdk to use the Anthropic provider: pnpm add @anthropic-ai/sdk',
        );
      }

      const client = new Anthropic({
        apiKey: options.apiKey || process.env.ANTHROPIC_API_KEY,
      });

      const userContent: Array<Record<string, unknown>> = [];

      // Add screenshot for vision if available
      if (context.screenshot) {
        userContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: context.screenshot,
          },
        });
      }

      userContent.push({
        type: 'text',
        text: buildUserPrompt(context),
      });

      const response = await client.messages.create({
        model,
        max_tokens: 300,
        system: buildSystemPrompt(),
        messages: [{ role: 'user', content: userContent }],
      });

      const text = response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('');

      return parseResponse(text, 'anthropic', model);
    },
  };
}
