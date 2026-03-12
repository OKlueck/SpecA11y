import type { Rule, RuleResult } from '../../types.js';

export const landmarkUnique: Rule = {
  meta: {
    id: 'landmark-unique',
    name: 'Landmarks must have a unique accessible name when multiple of the same role exist',
    description: 'When multiple landmarks share the same role, each must have a unique accessible name via aria-label or aria-labelledby.',
    wcagCriteria: ['1.3.1'],
    severity: 'moderate',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const landmarkData = await context.evaluate(() => {
      const landmarkSelectors = [
        'header:not(article header):not(aside header):not(main header):not(nav header):not(section header)',
        'footer:not(article footer):not(aside footer):not(main footer):not(nav footer):not(section footer)',
        'main', 'nav', 'aside', 'section[aria-label], section[aria-labelledby]',
        '[role="banner"]', '[role="contentinfo"]', '[role="main"]',
        '[role="navigation"]', '[role="complementary"]', '[role="region"]',
        '[role="search"]', '[role="form"]',
      ];

      const roleMap: Record<string, Array<{ selector: string; name: string; html: string }>> = {};

      function getImplicitRole(el: Element): string | null {
        const tag = el.tagName.toLowerCase();
        const explicitRole = el.getAttribute('role');
        if (explicitRole) return explicitRole;
        if (tag === 'header') return 'banner';
        if (tag === 'footer') return 'contentinfo';
        if (tag === 'main') return 'main';
        if (tag === 'nav') return 'navigation';
        if (tag === 'aside') return 'complementary';
        if (tag === 'section') return 'region';
        return null;
      }

      function getAccessibleName(el: Element): string {
        const label = el.getAttribute('aria-label');
        if (label) return label.trim();
        const labelledBy = el.getAttribute('aria-labelledby');
        if (labelledBy) {
          const parts = labelledBy.split(/\s+/).map(id => {
            const ref = document.getElementById(id);
            return ref ? (ref.textContent || '').trim() : '';
          });
          return parts.join(' ').trim();
        }
        return '';
      }

      function getUniqueSelector(el: Element): string {
        if (el.id) return `#${el.id}`;
        const tag = el.tagName.toLowerCase();
        const parent = el.parentElement;
        if (!parent) return tag;
        const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
        if (siblings.length === 1) return `${getUniqueSelector(parent)} > ${tag}`;
        const index = siblings.indexOf(el) + 1;
        return `${getUniqueSelector(parent)} > ${tag}:nth-of-type(${index})`;
      }

      const seen = new Set<Element>();
      for (const sel of landmarkSelectors) {
        const elements = document.querySelectorAll(sel);
        for (const el of elements) {
          if (seen.has(el)) continue;
          seen.add(el);
          const role = getImplicitRole(el);
          if (!role) continue;
          if (!roleMap[role]) roleMap[role] = [];
          const outerHTML = el.outerHTML.slice(0, 200);
          roleMap[role].push({
            selector: getUniqueSelector(el),
            name: getAccessibleName(el),
            html: outerHTML,
          });
        }
      }

      return roleMap;
    });

    for (const [role, landmarks] of Object.entries(landmarkData)) {
      if (landmarks.length <= 1) continue;

      const names = landmarks.map(l => l.name);
      const hasEmpty = names.some(n => n === '');
      const hasDuplicates = new Set(names).size !== names.length;

      for (const landmark of landmarks) {
        if (landmark.name === '' || (hasDuplicates && names.filter(n => n === landmark.name).length > 1)) {
          results.push({
            ruleId: 'landmark-unique',
            type: 'violation',
            message: landmark.name === ''
              ? `Multiple "${role}" landmarks exist but this one has no accessible name. Add a unique aria-label or aria-labelledby.`
              : `Multiple "${role}" landmarks share the name "${landmark.name}". Each must have a unique accessible name.`,
            element: {
              selector: landmark.selector,
              html: landmark.html,
            },
          });
        } else {
          results.push({
            ruleId: 'landmark-unique',
            type: 'pass',
            message: `Landmark "${role}" has a unique accessible name "${landmark.name}".`,
            element: {
              selector: landmark.selector,
              html: landmark.html,
            },
          });
        }
      }
    }

    return results;
  },
};
