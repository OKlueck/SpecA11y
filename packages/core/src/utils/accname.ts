/**
 * Accessible Name Computation (accName 1.2 spec)
 *
 * This module exports a self-contained browser-side function that implements
 * the full Accessible Name and Description Computation algorithm.
 * It is designed to be serialized into page.evaluate() — it must NOT import
 * any Node modules or external files.
 */

/**
 * Returns a browser-side function that computes the accessible name for an element.
 * Usage: page.evaluate(computeAccessibleName, element)
 */
export function computeAccessibleName(element: Element): string {
  // --- Roles that support "name from contents" ---
  const NAME_FROM_CONTENTS_ROLES = new Set([
    'button', 'cell', 'checkbox', 'columnheader', 'gridcell',
    'heading', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
    'option', 'radio', 'row', 'rowheader', 'switch', 'tab',
    'tooltip', 'treeitem',
  ]);

  // --- Get the effective role of an element ---
  function getRole(el: Element): string | null {
    const explicit = el.getAttribute('role')?.trim().split(/\s+/)[0];
    if (explicit) return explicit;
    return getImplicitRoleForElement(el);
  }

  function getImplicitRoleForElement(el: Element): string | null {
    const tag = el.tagName.toLowerCase();
    switch (tag) {
      case 'a':
      case 'area':
        return el.hasAttribute('href') ? 'link' : null;
      case 'article': return 'article';
      case 'aside': return 'complementary';
      case 'body': return 'document';
      case 'button': return 'button';
      case 'datalist': return 'listbox';
      case 'dd': return 'definition';
      case 'details': return 'group';
      case 'dfn':
      case 'dt': return 'term';
      case 'dialog': return 'dialog';
      case 'fieldset': return 'group';
      case 'figure': return 'figure';
      case 'footer': return 'contentinfo';
      case 'form': return null; // needs accessible name to be 'form'
      case 'h1': case 'h2': case 'h3':
      case 'h4': case 'h5': case 'h6': return 'heading';
      case 'header': return 'banner';
      case 'hr': return 'separator';
      case 'img': return el.getAttribute('alt') === '' ? 'presentation' : 'img';
      case 'input': {
        const type = (el.getAttribute('type') || 'text').toLowerCase();
        switch (type) {
          case 'button': case 'image': case 'reset': case 'submit': return 'button';
          case 'checkbox': return 'checkbox';
          case 'radio': return 'radio';
          case 'range': return 'slider';
          case 'number': return 'spinbutton';
          case 'search': return 'searchbox';
          default: return 'textbox';
        }
      }
      case 'li': return 'listitem';
      case 'main': return 'main';
      case 'math': return 'math';
      case 'menu': return 'list';
      case 'meter': return 'meter';
      case 'nav': return 'navigation';
      case 'ol': case 'ul': return 'list';
      case 'optgroup': return 'group';
      case 'option': return 'option';
      case 'output': return 'status';
      case 'progress': return 'progressbar';
      case 'section': return null;
      case 'select': {
        const size = el.getAttribute('size');
        const multiple = el.hasAttribute('multiple');
        if (multiple || (size !== null && parseInt(size, 10) > 1)) return 'listbox';
        return 'combobox';
      }
      case 'summary': return null;
      case 'table': return 'table';
      case 'tbody': case 'tfoot': case 'thead': return 'rowgroup';
      case 'td': return 'cell';
      case 'textarea': return 'textbox';
      case 'th': {
        const scope = el.getAttribute('scope')?.toLowerCase();
        return scope === 'row' ? 'rowheader' : 'columnheader';
      }
      case 'tr': return 'row';
      default: return null;
    }
  }

  // --- Check if an element is hidden from the accessibility tree ---
  function isHiddenFromAT(el: Element): boolean {
    if (el.getAttribute('aria-hidden') === 'true') return true;
    if (!(el instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return true;
    return false;
  }

  // --- Find associated <label> elements for a form control ---
  function getLabelsFor(el: Element): Element[] {
    const labels: Element[] = [];
    const id = el.getAttribute('id');
    if (id) {
      const doc = el.ownerDocument;
      const explicitLabels = doc.querySelectorAll(`label[for="${CSS.escape(id)}"]`);
      explicitLabels.forEach(l => labels.push(l));
    }
    // Wrapping label
    const parent = el.closest('label');
    if (parent && !labels.includes(parent)) {
      labels.push(parent);
    }
    return labels;
  }

  // --- Main accName computation ---
  function computeName(
    el: Element,
    visitedIds: Set<string>,
    isLabelledByTraversal: boolean,
    isNameFromContentsTraversal: boolean,
  ): string {
    // Step 1: Hidden check
    // If the element is hidden and we are NOT processing it as part of an
    // aria-labelledby reference, return empty.
    if (!isLabelledByTraversal && !isNameFromContentsTraversal && isHiddenFromAT(el)) {
      return '';
    }

    // Step 2A: aria-labelledby
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy && !isLabelledByTraversal) {
      const ids = labelledBy.trim().split(/\s+/);
      const parts: string[] = [];
      for (const id of ids) {
        if (visitedIds.has(id)) continue;
        const ref = el.ownerDocument.getElementById(id);
        if (!ref) continue;
        const newVisited = new Set(visitedIds);
        newVisited.add(id);
        // When traversing via labelledby, allow "name from contents" regardless of role
        const text = computeName(ref, newVisited, true, false);
        if (text) parts.push(text);
      }
      const result = parts.join(' ').trim();
      if (result) return result;
    }

    // Step 2B: aria-label
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim();
    }

    // Step 2C: Native host language features
    const tag = el.tagName.toLowerCase();

    // <input type="image">
    if (tag === 'input' && (el as HTMLInputElement).type === 'image') {
      const alt = el.getAttribute('alt');
      if (alt && alt.trim()) return alt.trim();
      const val = (el as HTMLInputElement).value;
      if (val && val.trim()) return val.trim();
      const title = el.getAttribute('title');
      if (title && title.trim()) return title.trim();
      return 'Submit Query'; // default per spec
    }

    // <img>, <area> — alt attribute
    if (tag === 'img' || tag === 'area') {
      const alt = el.getAttribute('alt');
      if (alt !== null) return alt.trim();
    }

    // Form controls: <input> (not hidden), <textarea>, <select>
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      const inputType = tag === 'input' ? (el as HTMLInputElement).type : '';

      // Skip hidden inputs
      if (tag === 'input' && inputType === 'hidden') {
        return '';
      }

      // Try associated <label> elements
      const labels = getLabelsFor(el);
      if (labels.length > 0) {
        const labelParts: string[] = [];
        for (const label of labels) {
          const newVisited = new Set(visitedIds);
          const text = computeNameFromContents(label, newVisited, isLabelledByTraversal, el);
          if (text) labelParts.push(text);
        }
        const labelName = labelParts.join(' ').trim();
        if (labelName) return labelName;
      }

      // For inputs: placeholder, then title
      if (tag === 'input') {
        const placeholder = el.getAttribute('placeholder');
        if (placeholder && placeholder.trim()) return placeholder.trim();
        const title = el.getAttribute('title');
        if (title && title.trim()) return title.trim();
      }

      // For textarea: placeholder, then title
      if (tag === 'textarea') {
        const placeholder = el.getAttribute('placeholder');
        if (placeholder && placeholder.trim()) return placeholder.trim();
        const title = el.getAttribute('title');
        if (title && title.trim()) return title.trim();
      }

      // For select: title
      if (tag === 'select') {
        const title = el.getAttribute('title');
        if (title && title.trim()) return title.trim();
      }
    }

    // <button>: name from contents (handled in step 2D)

    // <fieldset>: use <legend>
    if (tag === 'fieldset') {
      const legend = el.querySelector('legend');
      if (legend) {
        const newVisited = new Set(visitedIds);
        const text = computeNameFromContents(legend, newVisited, isLabelledByTraversal);
        if (text) return text;
      }
    }

    // <figure>: use <figcaption>
    if (tag === 'figure') {
      const caption = el.querySelector('figcaption');
      if (caption) {
        const newVisited = new Set(visitedIds);
        const text = computeNameFromContents(caption, newVisited, isLabelledByTraversal);
        if (text) return text;
      }
    }

    // <table>: use <caption>
    if (tag === 'table') {
      const caption = el.querySelector('caption');
      if (caption) {
        const newVisited = new Set(visitedIds);
        const text = computeNameFromContents(caption, newVisited, isLabelledByTraversal);
        if (text) return text;
      }
    }

    // <output>: associated label
    if (tag === 'output') {
      const labels = getLabelsFor(el);
      if (labels.length > 0) {
        const labelParts: string[] = [];
        for (const label of labels) {
          const newVisited = new Set(visitedIds);
          const text = computeNameFromContents(label, newVisited, isLabelledByTraversal, el);
          if (text) labelParts.push(text);
        }
        const labelName = labelParts.join(' ').trim();
        if (labelName) return labelName;
      }
    }

    // Step 2D: Name from contents
    const role = getRole(el);
    const supportsNameFromContents = role !== null && NAME_FROM_CONTENTS_ROLES.has(role);

    if (supportsNameFromContents || isLabelledByTraversal || isNameFromContentsTraversal) {
      const text = computeNameFromContents(el, new Set(visitedIds), isLabelledByTraversal);
      if (text) return text;
    }

    // Step 2E: title attribute as last resort
    const title = el.getAttribute('title');
    if (title && title.trim()) return title.trim();

    // Step 2F: placeholder as final fallback for inputs/textareas
    if (tag === 'input' || tag === 'textarea') {
      const placeholder = el.getAttribute('placeholder');
      if (placeholder && placeholder.trim()) return placeholder.trim();
    }

    return '';
  }

  /**
   * Compute name from the element's text content descendants.
   * @param skipChild - optional element to skip (used when computing label text
   *                    to avoid recursing back into the labeled control)
   */
  function computeNameFromContents(
    el: Element,
    visitedIds: Set<string>,
    isLabelledByTraversal: boolean,
    skipChild?: Element,
  ): string {
    const parts: string[] = [];

    for (const child of Array.from(el.childNodes)) {
      if (child === skipChild) continue;

      // Text node
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || '';
        if (text.trim()) {
          parts.push(text);
        }
        continue;
      }

      // Element node
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childEl = child as Element;

        // Skip elements hidden from AT (unless traversing via labelledby)
        if (!isLabelledByTraversal && isHiddenFromAT(childEl)) {
          continue;
        }

        const childTag = childEl.tagName.toLowerCase();

        // <br> adds a space
        if (childTag === 'br') {
          parts.push(' ');
          continue;
        }

        // Embedded controls within name-from-contents computation
        if (childTag === 'input') {
          const input = childEl as HTMLInputElement;
          const type = input.type.toLowerCase();
          if (type === 'button' || type === 'submit' || type === 'reset') {
            parts.push(input.value || '');
          } else if (type === 'image') {
            const alt = input.getAttribute('alt');
            parts.push(alt || input.value || 'Submit Query');
          } else if (type !== 'hidden') {
            parts.push(input.value || input.placeholder || '');
          }
          continue;
        }

        if (childTag === 'select') {
          const select = childEl as HTMLSelectElement;
          const selectedOptions = Array.from(select.selectedOptions);
          const optionText = selectedOptions.map(o => o.textContent?.trim() || '').join(' ');
          parts.push(optionText);
          continue;
        }

        if (childTag === 'textarea') {
          const textarea = childEl as HTMLTextAreaElement;
          parts.push(textarea.value || '');
          continue;
        }

        // Recurse into child element
        const childName = computeName(childEl, visitedIds, isLabelledByTraversal, true);
        if (childName) {
          parts.push(childName);
        }
      }
    }

    // Also include CSS ::before and ::after pseudo-element content
    if (el instanceof HTMLElement) {
      const before = window.getComputedStyle(el, '::before').content;
      if (before && before !== 'none' && before !== 'normal') {
        // Strip quotes from CSS content strings
        const cleaned = before.replace(/^["']|["']$/g, '');
        if (cleaned.trim()) {
          parts.unshift(cleaned);
        }
      }

      const after = window.getComputedStyle(el, '::after').content;
      if (after && after !== 'none' && after !== 'normal') {
        const cleaned = after.replace(/^["']|["']$/g, '');
        if (cleaned.trim()) {
          parts.push(cleaned);
        }
      }
    }

    // Flatten and normalize whitespace
    const result = parts.join('').replace(/\s+/g, ' ').trim();
    return result;
  }

  // --- Entry point ---
  return computeName(element, new Set<string>(), false, false);
}
