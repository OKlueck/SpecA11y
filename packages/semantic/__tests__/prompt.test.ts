import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserPrompt } from '../src/prompt.js';
import type { AssessmentContext } from '../src/types.js';

describe('buildSystemPrompt', () => {
  it('contains JSON format instruction', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('verdict');
    expect(prompt).toContain('JSON');
  });
});

describe('buildUserPrompt', () => {
  const baseContext: AssessmentContext = {
    ruleId: 'img-alt-quality',
    ruleName: 'Image alt text should be meaningful',
    wcagCriteria: ['1.1.1'],
    element: {
      html: '<img src="photo.jpg" alt="image">',
      selector: 'img',
      textContent: 'image',
    },
    message: 'Image has generic alt text "image"',
  };

  it('generates img-alt-quality prompt with alt text', () => {
    const prompt = buildUserPrompt(baseContext);
    expect(prompt).toContain('"image"');
    expect(prompt).toContain('alt text');
  });

  it('includes screenshot hint when screenshot is present', () => {
    const ctx = { ...baseContext, screenshot: 'base64data' };
    const prompt = buildUserPrompt(ctx);
    expect(prompt).toContain('screenshot');
  });

  it('generates link-name-quality prompt', () => {
    const ctx: AssessmentContext = {
      ...baseContext,
      ruleId: 'link-name-quality',
      ruleName: 'Link text should describe purpose',
      element: { html: '<a href="/">click here</a>', selector: 'a', accessibleName: 'click here' },
      message: 'Link has generic text "click here"',
    };
    const prompt = buildUserPrompt(ctx);
    expect(prompt).toContain('click here');
    expect(prompt).toContain('link');
  });

  it('generates label-quality prompt', () => {
    const ctx: AssessmentContext = {
      ...baseContext,
      ruleId: 'label-quality',
      element: { html: '<input aria-label="field">', selector: 'input', accessibleName: 'field' },
      message: 'Form field has generic label "field"',
    };
    const prompt = buildUserPrompt(ctx);
    expect(prompt).toContain('field');
    expect(prompt).toContain('label');
  });

  it('uses default prompt for unknown rules', () => {
    const ctx: AssessmentContext = {
      ...baseContext,
      ruleId: 'unknown-rule',
      ruleName: 'Some unknown rule',
    };
    const prompt = buildUserPrompt(ctx);
    expect(prompt).toContain('Some unknown rule');
    expect(prompt).toContain('accessible');
  });
});
