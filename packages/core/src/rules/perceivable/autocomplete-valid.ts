import type { Rule, RuleResult } from '../../types.js';

const VALID_AUTOCOMPLETE_TOKENS = new Set([
  'name',
  'honorific-prefix',
  'given-name',
  'additional-name',
  'family-name',
  'honorific-suffix',
  'nickname',
  'email',
  'username',
  'new-password',
  'current-password',
  'one-time-code',
  'organization-title',
  'organization',
  'street-address',
  'address-line1',
  'address-line2',
  'address-line3',
  'address-level1',
  'address-level2',
  'address-level3',
  'address-level4',
  'country',
  'country-name',
  'postal-code',
  'cc-name',
  'cc-given-name',
  'cc-additional-name',
  'cc-family-name',
  'cc-number',
  'cc-exp',
  'cc-exp-month',
  'cc-exp-year',
  'cc-csc',
  'cc-type',
  'transaction-currency',
  'transaction-amount',
  'language',
  'bday',
  'bday-day',
  'bday-month',
  'bday-year',
  'sex',
  'tel',
  'tel-country-code',
  'tel-national',
  'tel-area-code',
  'tel-local',
  'tel-extension',
  'impp',
  'url',
  'photo',
  'off',
  'on',
]);

export const autocompleteValid: Rule = {
  meta: {
    id: 'autocomplete-valid',
    name: 'Autocomplete attributes must have valid values',
    description: 'Ensures autocomplete attributes on form fields use valid autocomplete tokens.',
    wcagCriteria: ['1.3.5'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const fields = await context.querySelectorAll('[autocomplete]');

    for (const field of fields) {
      const autocomplete = await field.getAttribute('autocomplete');

      if (!autocomplete || autocomplete.trim() === '') {
        results.push({
          ruleId: 'autocomplete-valid',
          type: 'violation',
          message: 'Autocomplete attribute is empty.',
          element: {
            selector: field.selector,
            html: await field.getOuterHTML(),
            boundingBox: await field.getBoundingBox(),
          },
        });
        continue;
      }

      const tokens = autocomplete.trim().toLowerCase().split(/\s+/);
      const invalidTokens: string[] = [];

      for (const token of tokens) {
        // Allow section-* tokens (e.g. section-billing)
        if (token.startsWith('section-')) {
          continue;
        }
        // Allow shipping/billing as address type modifiers
        if (token === 'shipping' || token === 'billing') {
          continue;
        }
        if (!VALID_AUTOCOMPLETE_TOKENS.has(token)) {
          invalidTokens.push(token);
        }
      }

      if (invalidTokens.length > 0) {
        results.push({
          ruleId: 'autocomplete-valid',
          type: 'violation',
          message: `Autocomplete attribute contains invalid tokens: ${invalidTokens.join(', ')}.`,
          element: {
            selector: field.selector,
            html: await field.getOuterHTML(),
            boundingBox: await field.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'autocomplete-valid',
          type: 'pass',
          message: 'Autocomplete attribute has valid values.',
          element: {
            selector: field.selector,
            html: await field.getOuterHTML(),
            boundingBox: await field.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
