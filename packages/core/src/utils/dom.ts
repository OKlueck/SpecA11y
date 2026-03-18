/**
 * Self-contained browser function for use inside page.evaluate().
 * Returns CSS path, accessible name, and role for an element.
 */
export const describeElementFn = `
function describeElement(el) {
  // --- CSS Selector path ---
  function cssPath(node) {
    var parts = [];
    var current = node;
    for (var depth = 0; depth < 3 && current && current !== document.body && current !== document.documentElement; depth++) {
      var tag = current.tagName.toLowerCase();
      if (current.id) {
        parts.unshift(tag + '#' + current.id);
        break;
      }
      var cls = current.className && typeof current.className === 'string'
        ? '.' + current.className.trim().split(/\\s+/).slice(0, 2).join('.')
        : '';
      var parent = current.parentElement;
      var nth = '';
      if (parent) {
        var siblings = parent.children;
        var sameTag = 0, idx = 0;
        for (var i = 0; i < siblings.length; i++) {
          if (siblings[i].tagName === current.tagName) {
            sameTag++;
            if (siblings[i] === current) idx = sameTag;
          }
        }
        if (sameTag > 1) nth = ':nth-of-type(' + idx + ')';
      }
      parts.unshift(tag + cls + nth);
      current = parent;
    }
    return parts.join(' > ');
  }

  // --- Accessible name ---
  function accName(node) {
    var label = node.getAttribute('aria-label');
    if (label) return label.trim().slice(0, 50);
    var labelledBy = node.getAttribute('aria-labelledby');
    if (labelledBy) {
      var parts = labelledBy.split(/\\s+/).map(function(id) {
        var ref = document.getElementById(id);
        return ref ? ref.textContent.trim() : '';
      }).filter(Boolean);
      if (parts.length) return parts.join(' ').slice(0, 50);
    }
    var alt = node.getAttribute('alt');
    if (alt) return alt.trim().slice(0, 50);
    var title = node.getAttribute('title');
    if (title) return title.trim().slice(0, 50);
    var text = node.textContent || '';
    text = text.trim().replace(/\\s+/g, ' ');
    if (text.length > 50) text = text.slice(0, 47) + '...';
    return text || '';
  }

  // --- Role ---
  var IMPLICIT_ROLES = {
    a: 'link', button: 'button', input: 'textbox', select: 'combobox',
    textarea: 'textbox', img: 'img', nav: 'navigation', main: 'main',
    header: 'banner', footer: 'contentinfo', aside: 'complementary',
    form: 'form', table: 'table', ul: 'list', ol: 'list', li: 'listitem',
    h1: 'heading', h2: 'heading', h3: 'heading', h4: 'heading', h5: 'heading', h6: 'heading',
    dialog: 'dialog', details: 'group', summary: 'button', article: 'article',
    section: 'region', td: 'cell', th: 'columnheader', tr: 'row'
  };
  var explicitRole = el.getAttribute('role');
  var tag = el.tagName.toLowerCase();
  var role = explicitRole || IMPLICIT_ROLES[tag] || '';

  return {
    cssSelector: cssPath(el),
    accessibleName: accName(el),
    role: role
  };
}
`;

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
