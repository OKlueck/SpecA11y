import type { Rule, RuleResult } from '../../types.js';

export const keyboardInputBlocked: Rule = {
  meta: {
    id: 'keyboard-input-blocked',
    name: 'Pages must not block keyboard input globally',
    description:
      'Detects keydown/keypress event listeners on document or body that call preventDefault(), which blocks all keyboard input.',
    wcagCriteria: ['2.1.1'],
    severity: 'critical',
    confidence: 'likely',
    type: 'interactive',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    // Strategy: temporarily intercept addEventListener to detect blanket keyboard blocking,
    // then simulate a keypress and check if default was prevented.
    const isBlocked: { keydown: boolean; keypress: boolean } = await context.page.evaluate(() => {
      const result = { keydown: false, keypress: false };

      // Test by dispatching a synthetic key event and checking if it gets prevented
      for (const eventType of ['keydown', 'keypress'] as const) {
        const event = new KeyboardEvent(eventType, {
          key: 'Tab',
          code: 'Tab',
          keyCode: 9,
          bubbles: true,
          cancelable: true,
        });

        document.dispatchEvent(event);

        if (event.defaultPrevented) {
          result[eventType] = true;
        }
      }

      return result;
    });

    if (isBlocked.keydown || isBlocked.keypress) {
      const blockedEvents = [
        isBlocked.keydown ? 'keydown' : null,
        isBlocked.keypress ? 'keypress' : null,
      ].filter(Boolean).join(' and ');

      results.push({
        ruleId: 'keyboard-input-blocked',
        type: 'violation',
        message:
          `Page has a ${blockedEvents} event listener that calls preventDefault() globally, ` +
          `blocking keyboard input. This prevents keyboard-only users from navigating or interacting with the page.`,
      });
    } else {
      results.push({
        ruleId: 'keyboard-input-blocked',
        type: 'pass',
        message: 'Page does not globally block keyboard input.',
      });
    }

    return results;
  },
};
