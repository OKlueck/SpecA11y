import type { Rule, RuleResult } from '../../types.js';

export const accessibleAuth: Rule = {
  meta: {
    id: 'accessible-auth',
    name: 'Authentication must not rely on cognitive function tests',
    description: 'Checks login forms allow paste in password fields and flags CAPTCHA without accessible alternatives.',
    wcagCriteria: ['3.3.8'],
    severity: 'serious',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const issues = await context.evaluate(() => {
      const found: Array<{ selector: string; html: string; issue: string }> = [];

      // Check password fields that block paste
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      for (const input of passwordInputs) {
        const onpaste = input.getAttribute('onpaste');
        if (onpaste && /return\s*false|preventDefault/.test(onpaste)) {
          found.push({
            selector: 'input[type="password"]' + (input.id ? `#${input.id}` : ''),
            html: input.outerHTML.slice(0, 200),
            issue: 'paste-blocked',
          });
        }
      }

      // Check for CAPTCHA
      const images = document.querySelectorAll('img');
      for (const img of images) {
        const src = img.getAttribute('src') ?? '';
        const alt = img.getAttribute('alt') ?? '';
        const className = img.className ?? '';
        if (/captcha/i.test(src) || /captcha/i.test(alt) || /captcha/i.test(className)) {
          found.push({
            selector: 'img' + (img.id ? `#${img.id}` : ''),
            html: img.outerHTML.slice(0, 200),
            issue: 'captcha',
          });
        }
      }

      // Check for reCAPTCHA/hCaptcha iframes
      const iframes = document.querySelectorAll('iframe');
      for (const iframe of iframes) {
        const src = iframe.getAttribute('src') ?? '';
        if (/captcha|recaptcha|hcaptcha/i.test(src)) {
          found.push({
            selector: 'iframe' + (iframe.id ? `#${iframe.id}` : ''),
            html: iframe.outerHTML.slice(0, 200),
            issue: 'captcha',
          });
        }
      }

      return found;
    });

    for (const item of issues) {
      if (item.issue === 'paste-blocked') {
        results.push({
          ruleId: 'accessible-auth',
          type: 'warning',
          message: 'Password field blocks paste. Users should be able to use password managers.',
          element: { selector: item.selector, html: item.html },
        });
      } else {
        results.push({
          ruleId: 'accessible-auth',
          type: 'warning',
          message: 'CAPTCHA detected. Ensure an accessible alternative (audio, email verification) is available.',
          element: { selector: item.selector, html: item.html },
        });
      }
    }

    return results;
  },
};
