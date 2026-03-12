import type { Rule, RuleResult } from '../../types.js';

export const labelContentNameMismatch: Rule = {
  meta: {
    id: 'label-content-name-mismatch',
    name: 'Visible text must be part of the accessible name',
    description: 'Elements with both visible text and an accessible name (via aria-label) must include the visible text as part of the accessible name, per WCAG 2.5.3 Label in Name.',
    wcagCriteria: ['2.5.3'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
    tags: ['experimental'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll('[aria-label]');

    for (const el of elements) {
      const ariaLabel = await el.getAttribute('aria-label');
      if (!ariaLabel || !ariaLabel.trim()) continue;

      const textContent = await el.getTextContent();
      if (!textContent || !textContent.trim()) continue;

      const visible = await el.isVisible();
      if (!visible) continue;

      const visibleText = textContent.trim().toLowerCase();
      const accessibleName = ariaLabel.trim().toLowerCase();

      if (accessibleName.includes(visibleText)) {
        results.push({
          ruleId: 'label-content-name-mismatch',
          type: 'pass',
          message: 'Accessible name contains the visible text content.',
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'label-content-name-mismatch',
          type: 'violation',
          message: `Visible text "${textContent.trim()}" is not part of the accessible name "${ariaLabel.trim()}". The accessible name must contain the visible text for speech input users.`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
