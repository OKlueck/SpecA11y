import type { LLMProvider, AssessmentContext, SemanticAnnotation } from '../types.js';
import { buildSystemPrompt, buildUserPrompt } from '../prompt.js';
import { parseResponse } from '../parse.js';

const DEFAULT_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2';
const DEFAULT_VISION_MODEL = 'llava';

export function createOllamaProvider(options: {
  model?: string;
  baseUrl?: string;
}): LLMProvider {
  const baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
  const model = options.model || DEFAULT_MODEL;

  return {
    name: 'ollama',
    model,

    async assess(context: AssessmentContext): Promise<SemanticAnnotation> {
      // Use vision model if screenshot is provided and no explicit model set
      const activeModel = context.screenshot && !options.model
        ? DEFAULT_VISION_MODEL
        : model;

      const body: Record<string, unknown> = {
        model: activeModel,
        system: buildSystemPrompt(),
        prompt: buildUserPrompt(context),
        stream: false,
        options: { num_predict: 300 },
      };

      if (context.screenshot) {
        body.images = [context.screenshot];
      }

      let response: Response;
      try {
        response = await fetch(`${baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch (err) {
        throw new Error(
          `Cannot connect to Ollama at ${baseUrl}. Is it running? (${err instanceof Error ? err.message : err})`,
        );
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Ollama returned ${response.status}: ${text}`);
      }

      const data = await response.json() as { response: string };
      return parseResponse(data.response, 'ollama', activeModel);
    },
  };
}
