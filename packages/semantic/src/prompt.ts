import type { AssessmentContext } from './types.js';

const SYSTEM_PROMPT = `You are an accessibility expert evaluating the semantic quality of web content.
You will be given an HTML element and its context. Assess whether the content is meaningful and accessible.

Respond ONLY with valid JSON in this exact format:
{"verdict":"good|poor|unclear","confidence":0.0-1.0,"explanation":"...","suggestion":"..."}

- verdict: "good" if the content is meaningful, "poor" if it is generic/unhelpful, "unclear" if you cannot determine
- confidence: your certainty from 0.0 to 1.0
- explanation: one sentence explaining your assessment
- suggestion: optional improvement suggestion (omit if verdict is "good")`;

const RULE_PROMPTS: Record<string, (ctx: AssessmentContext) => string> = {
  'img-alt-quality': (ctx) => {
    const alt = ctx.element.textContent || '(empty)';
    const base = `Assess this image alt text: "${alt}"\nHTML: ${ctx.element.html}`;
    return ctx.screenshot
      ? `${base}\n\nAn image screenshot is attached. Does the alt text accurately describe what the image shows?`
      : `${base}\n\nDoes this alt text meaningfully describe the image content or purpose?`;
  },

  'link-name-quality': (ctx) => {
    const text = ctx.element.accessibleName || ctx.element.textContent || '(empty)';
    return `Assess this link text: "${text}"\nHTML: ${ctx.element.html}\n\nDoes this text clearly describe where the link goes or what it does? Consider the surrounding HTML context.`;
  },

  'label-quality': (ctx) => {
    const label = ctx.element.accessibleName || ctx.element.textContent || '(empty)';
    return `Assess this form field label: "${label}"\nHTML: ${ctx.element.html}\n\nDoes this label clearly describe what data the user should enter?`;
  },

  'lang-mismatch': (ctx) =>
    `${ctx.message}\n\nBased on the warning message, is this a genuine language mismatch that should be fixed?`,

  'button-name': (ctx) => {
    const name = ctx.element.accessibleName || ctx.element.textContent || '(empty)';
    return `Assess this button name: "${name}"\nHTML: ${ctx.element.html}\n\nDoes this name clearly describe what action the button performs?`;
  },

  'document-title': (ctx) =>
    `The page title is: "${ctx.element.textContent}"\n\nDoes this title meaningfully describe the page content?`,

  'video-caption-quality': (ctx) =>
    `${ctx.message}\n\nBased on the warning message, does this video have functioning captions?`,

  'frame-title': (ctx) => {
    const title = ctx.element.textContent || '(empty)';
    return `Assess this iframe title: "${title}"\nHTML: ${ctx.element.html}\n\nDoes this title meaningfully describe the iframe content?`;
  },

  'empty-heading': (ctx) => {
    const text = ctx.element.textContent || '(empty)';
    return `Assess this heading text: "${text}"\nHTML: ${ctx.element.html}\n\nDoes this heading meaningfully describe the section it introduces?`;
  },
};

const DEFAULT_PROMPT = (ctx: AssessmentContext) =>
  `Assess the accessibility quality of this element:\nRule: ${ctx.ruleName}\nWCAG: ${ctx.wcagCriteria.join(', ')}\nHTML: ${ctx.element.html}\nWarning: ${ctx.message}\n\nIs this element semantically meaningful and accessible?`;

export function buildSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

export function buildUserPrompt(context: AssessmentContext): string {
  const promptFn = RULE_PROMPTS[context.ruleId] ?? DEFAULT_PROMPT;
  return promptFn(context);
}
