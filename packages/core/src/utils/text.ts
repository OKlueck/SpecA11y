export function isEmptyOrWhitespace(text: string): boolean {
  return text.trim().length === 0;
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function hasVisualContent(html: string): boolean {
  const withoutTags = html.replace(/<[^>]*>/g, ' ');
  if (withoutTags.trim().length > 0) return true;
  if (/<img\s[^>]*alt\s*=\s*"[^"]+"/i.test(html)) return true;
  if (/<img\s[^>]*alt\s*=\s*'[^']+'/i.test(html)) return true;
  return false;
}

export function extractTextFromHTML(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export const LANG_CODES = new Set([
  'en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'ru', 'zh', 'ja',
  'ko', 'ar', 'hi', 'pl', 'sv', 'da', 'no', 'fi', 'cs', 'tr',
  'el', 'he', 'th', 'vi', 'uk', 'ro', 'hu', 'bg', 'hr', 'sk',
  'sl', 'sr', 'lt', 'lv', 'et',
]);

export function isValidLangCode(code: string): boolean {
  const primary = code.split('-')[0].toLowerCase();
  return LANG_CODES.has(primary);
}
