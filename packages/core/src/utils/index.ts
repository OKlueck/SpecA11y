export { computeAccessibleName } from './accname.js';

export { parseColor, parseColorWithAlpha, alphaComposite, getEffectiveBackgroundColor, relativeLuminance, contrastRatio } from './color.js';
export type { RGB, RGBA } from './color.js';

export {
  getUniqueSelector,
  truncateHTML,
  INTERACTIVE_ELEMENTS,
  HEADING_ELEMENTS,
  FORM_ELEMENTS,
  SECTIONING_ELEMENTS,
  isInteractiveElement,
  VALID_AUTOCOMPLETE_VALUES,
} from './dom.js';

export {
  parsePxValue,
  parsePercentage,
  isHidden,
  parseFontSize,
} from './css.js';

export {
  rectsOverlap,
  rectContains,
  rectArea,
  overlapArea,
  isOffscreen,
  distance,
} from './geometry.js';
export type { Rect } from './geometry.js';

export {
  isEmptyOrWhitespace,
  normalizeWhitespace,
  hasVisualContent,
  extractTextFromHTML,
  LANG_CODES,
  isValidLangCode,
} from './text.js';

export {
  decodePNG,
  getPixel,
  countDifferentPixels,
  averageColor,
  sampleBorderPixels,
} from './visual.js';
export type { PixelData } from './visual.js';

export {
  ARIA_ROLES,
  VALID_ARIA_ATTRS,
  isValidRole,
  isAbstractRole,
  getRequiredAttrs,
  getSupportedAttrs,
  getRequiredChildren,
  getRequiredParent,
  isValidAriaAttr,
  getImplicitRole,
  getImplicitAriaAttrs,
} from './aria.js';
export type { AriaRoleDefinition } from './aria.js';
