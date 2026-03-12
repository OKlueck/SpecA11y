export function getUniqueSelector(element: string, index: number): string {
  const tag = element.toLowerCase();
  return `${tag}:nth-of-type(${index + 1})`;
}

export function truncateHTML(html: string, maxLength = 200): string {
  if (html.length <= maxLength) return html;
  return html.slice(0, maxLength) + '...';
}

export const INTERACTIVE_ELEMENTS = new Set([
  'a', 'button', 'input', 'select', 'textarea', 'details', 'summary',
]);

export const HEADING_ELEMENTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

export const FORM_ELEMENTS = ['input', 'select', 'textarea', 'button'];

export const SECTIONING_ELEMENTS = ['article', 'aside', 'nav', 'section'];

export function isInteractiveElement(tagName: string): boolean {
  return INTERACTIVE_ELEMENTS.has(tagName.toLowerCase());
}

export const VALID_AUTOCOMPLETE_VALUES = new Set([
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
  'address-level4',
  'address-level3',
  'address-level2',
  'address-level1',
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
]);
