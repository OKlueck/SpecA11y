import type { Rule, RuleResult } from '../../types.js';

/**
 * Lightweight trigram-based language detection.
 *
 * We use the most distinctive trigrams for each supported language.
 * This avoids an external dependency while being accurate enough for
 * page-level detection (where we have plenty of text).
 */

const LANGUAGE_TRIGRAMS: Record<string, string[]> = {
  de: [' de', 'en ', 'er ', 'die', 'und', 'der', 'ein', 'ich', 'den', 'sch', 'che', 'ung', 'eit', 'ine', 'ber', 'ver', 'cht', 'gen', 'auf', 'das'],
  en: [' th', 'the', 'he ', 'ing', 'and', ' an', 'ion', 'tio', 'ed ', ' in', 'ent', 'hat', 'his', 'tha', 'ere', 'for', 'ati', 'ter', ' is', 'you'],
  fr: [' de', 'es ', 'le ', 'ent', ' le', 'de ', ' la', 'ion', 'la ', 'les', 'ons', 'que', 'ait', ' co', 'tio', 'eur', 'men', ' pa', 'ous', 'des'],
  es: [' de', 'de ', 'os ', ' la', 'la ', 'ión', 'ent', ' en', 'el ', 'ció', ' el', 'en ', 'que', ' co', 'aci', 'ion', 'es ', 'con', 'nte', 'sta'],
  it: [' di', 'che', 'la ', ' de', ' la', 'ell', 'ion', 'lla', 'one', 'ato', 'ent', 'per', 'azi', 'zio', ' in', ' pe', 'le ', 'del', 'con', 'tta'],
  nl: [' de', 'de ', 'en ', 'an ', 'het', ' he', ' va', 'van', 'een', ' ee', 'er ', 'aar', ' in', 'nde', 'oor', ' ge', 'ing', 'der', 'and', 'den'],
  pt: [' de', 'de ', 'os ', 'ção', 'ent', ' da', 'ão ', ' co', 'ade', 'que', ' do', 'das', ' a ', 'dos', 'nte', ' pa', 'ica', 'ara', 'est', 'men'],
  pl: [' ni', 'nie', 'prz', 'rze', 'owa', 'ych', 'icz', ' po', 'nia', 'sta', 'prz', ' do', ' si', ' je', 'sze', 'ego', 'kie', 'ost', ' na', 'ie '],
  tr: [' bi', 'lar', 'bir', 'ler', 'eri', ' ka', 'an ', 'ini', 'ın ', 'ara', 'nda', 'ası', 'aya', 'ile', 'yor', 'dır', 'dan', 'rin', 'ine', 'ınd'],
};

const MIN_TEXT_LENGTH = 50;

function extractTrigrams(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  const lower = text.toLowerCase().replace(/\s+/g, ' ');
  for (let i = 0; i < lower.length - 2; i++) {
    const tri = lower.substring(i, i + 3);
    counts.set(tri, (counts.get(tri) ?? 0) + 1);
  }
  return counts;
}

function detectLanguage(text: string): { lang: string; score: number } | null {
  if (text.length < MIN_TEXT_LENGTH) return null;

  const trigrams = extractTrigrams(text);
  let bestLang = '';
  let bestScore = 0;

  for (const [lang, langTrigrams] of Object.entries(LANGUAGE_TRIGRAMS)) {
    let score = 0;
    for (const tri of langTrigrams) {
      score += trigrams.get(tri) ?? 0;
    }
    if (score > bestScore) {
      bestScore = score;
      bestLang = lang;
    }
  }

  if (!bestLang || bestScore === 0) return null;

  // Normalize score relative to text length
  const normalizedScore = bestScore / (text.length / 100);
  return { lang: bestLang, score: normalizedScore };
}

export const langMismatch: Rule = {
  meta: {
    id: 'lang-mismatch',
    name: 'Page language should match actual content language',
    description:
      'Detects when the declared lang attribute does not match the actual language of the page text content.',
    wcagCriteria: ['3.1.1'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
    tags: ['semantic', 'heuristic'],
  },

  async run(context): Promise<RuleResult[]> {
    const lang = await context.getAttribute('html', 'lang');

    // No lang attribute — caught by html-has-lang rule
    if (!lang || !lang.trim()) return [];

    const declaredLang = lang.trim().toLowerCase().split('-')[0];

    // Only check languages we support
    if (!LANGUAGE_TRIGRAMS[declaredLang] && !Object.keys(LANGUAGE_TRIGRAMS).includes(declaredLang)) {
      return [{
        ruleId: 'lang-mismatch',
        type: 'pass',
        message: `Language "${lang}" is not in the detection dictionary — skipping heuristic check.`,
      }];
    }

    // Extract visible text from body
    const bodyText: string = await context.page.locator('body').evaluate((body) => {
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style' || tag === 'noscript') {
            return NodeFilter.FILTER_REJECT;
          }
          const style = window.getComputedStyle(parent);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });

      const parts: string[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const text = node.textContent?.trim();
        if (text) parts.push(text);
      }
      return parts.join(' ');
    });

    if (bodyText.length < MIN_TEXT_LENGTH) {
      return [{
        ruleId: 'lang-mismatch',
        type: 'pass',
        message: 'Not enough text content for reliable language detection.',
      }];
    }

    const detected = detectLanguage(bodyText);
    if (!detected) {
      return [{
        ruleId: 'lang-mismatch',
        type: 'pass',
        message: 'Could not reliably detect content language.',
      }];
    }

    if (detected.lang === declaredLang) {
      return [{
        ruleId: 'lang-mismatch',
        type: 'pass',
        message: `Declared language "${lang}" matches detected content language.`,
      }];
    }

    // Only flag if detection confidence is reasonable
    if (detected.score < 3) {
      return [{
        ruleId: 'lang-mismatch',
        type: 'pass',
        message: `Detection confidence too low to determine mismatch (score: ${detected.score.toFixed(1)}).`,
      }];
    }

    return [{
      ruleId: 'lang-mismatch',
      type: 'warning',
      message: `Page declares lang="${lang}" but content appears to be in "${detected.lang}". Verify that the lang attribute matches the actual page language.`,
    }];
  },
};
