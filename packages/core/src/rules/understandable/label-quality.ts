import type { Rule, RuleResult } from '../../types.js';

const INPUT_SELECTOR =
  'input:not([type="hidden"]):not([type="submit"]):not([type="reset"]):not([type="button"]):not([type="image"]), select, textarea';

const GENERIC_LABEL_PATTERNS: RegExp[] = [
  /^field$/i,
  /^feld$/i,
  /^input$/i,
  /^eingabe$/i,
  /^text$/i,
  /^value$/i,
  /^wert$/i,
  /^enter$/i,
  /^type here$/i,
  /^hier eingeben$/i,
  /^form$/i,
  /^formular$/i,
  /^data$/i,
  /^daten$/i,
  /^label$/i,
  /^placeholder$/i,
  /^required$/i,
  /^pflichtfeld$/i,
  /^\*$/,
  /^\.$/,
];

export const labelQuality: Rule = {
  meta: {
    id: 'label-quality',
    name: 'Form labels should be descriptive',
    description:
      'Checks that form element labels are not generic placeholders like "field", "input", or "text".',
    wcagCriteria: ['3.3.2'],
    severity: 'moderate',
    confidence: 'likely',
    type: 'dom',
    tags: ['semantic', 'heuristic'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll(INPUT_SELECTOR);

    for (const el of elements) {
      const name = await el.getAccessibleName();
      const trimmed = name.trim();

      // Skip elements without label (caught by label rule)
      if (!trimmed) continue;

      const element = {
        selector: el.selector,
        html: await el.getOuterHTML(),
        boundingBox: await el.getBoundingBox(),
      };

      const isGeneric = GENERIC_LABEL_PATTERNS.some((p) => p.test(trimmed));
      if (isGeneric) {
        results.push({
          ruleId: 'label-quality',
          type: 'warning',
          message: `Form field has generic label "${trimmed}". Use a descriptive label that explains what data is expected.`,
          element,
        });
        continue;
      }

      // Single character labels
      if (trimmed.length === 1) {
        results.push({
          ruleId: 'label-quality',
          type: 'warning',
          message: `Form field label is only one character: "${trimmed}". This is likely not descriptive enough.`,
          element,
        });
        continue;
      }

      results.push({
        ruleId: 'label-quality',
        type: 'pass',
        message: 'Form field label appears to be descriptive.',
        element,
      });
    }

    return results;
  },
};
