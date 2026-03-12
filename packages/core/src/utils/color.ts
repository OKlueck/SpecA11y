export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export function parseColor(color: string): RGB | null {
  // Handle rgb(r, g, b) and rgba(r, g, b, a)
  const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
  }

  // Handle hex (#rgb, #rrggbb)
  const hexMatch = color.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  return null;
}

export function parseColorWithAlpha(color: string): RGBA | null {
  // Handle rgba(r, g, b, a) and rgb(r, g, b)
  const rgbaMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    };
  }

  // Handle hex (#rgb, #rgba, #rrggbb, #rrggbbaa)
  const hexMatch = color.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + 'ff';
    } else if (hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    } else if (hex.length === 6) {
      hex = hex + 'ff';
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: parseInt(hex.slice(6, 8), 16) / 255,
    };
  }

  return null;
}

/** Alpha-composite foreground over background using standard "over" operator */
export function alphaComposite(fg: RGBA, bg: RGBA): RGBA {
  const outA = fg.a + bg.a * (1 - fg.a);
  if (outA === 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  return {
    r: Math.round((fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / outA),
    g: Math.round((fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / outA),
    b: Math.round((fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / outA),
    a: outA,
  };
}

/**
 * Browser-evaluable function that walks up the DOM to compute
 * the effective background color by compositing semi-transparent layers.
 * Returns an rgba() string, or null if background-image prevents resolution.
 *
 * This function is self-contained — no Node imports — because it
 * runs inside page.evaluate().
 */
export function getEffectiveBackgroundColor(el: Element): string | null {
  interface LayerRGBA { r: number; g: number; b: number; a: number }

  function parseBgColor(raw: string): LayerRGBA {
    const m = raw.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (m) {
      return {
        r: parseInt(m[1]),
        g: parseInt(m[2]),
        b: parseInt(m[3]),
        a: m[4] !== undefined ? parseFloat(m[4]) : 1,
      };
    }
    // Default: transparent
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  function composite(fg: LayerRGBA, bg: LayerRGBA): LayerRGBA {
    const outA = fg.a + bg.a * (1 - fg.a);
    if (outA === 0) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: Math.round((fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / outA),
      g: Math.round((fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / outA),
      b: Math.round((fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / outA),
      a: outA,
    };
  }

  // Collect layers from element up to root
  const layers: LayerRGBA[] = [];
  let current: Element | null = el;

  while (current) {
    const style = window.getComputedStyle(current);

    // If there's a background-image (gradient or url), we can't resolve
    const bgImage = style.getPropertyValue('background-image');
    if (bgImage && bgImage !== 'none') {
      return null;
    }

    const bgRaw = style.getPropertyValue('background-color');
    const layer = parseBgColor(bgRaw);
    layers.push(layer);

    // Stop if this layer is fully opaque
    if (layer.a >= 1) break;

    current = current.parentElement;
  }

  // Start from the deepest ancestor and composite forward
  // Default backdrop: white opaque
  let result: LayerRGBA = { r: 255, g: 255, b: 255, a: 1 };

  for (let i = layers.length - 1; i >= 0; i--) {
    result = composite(layers[i], result);
  }

  return `rgba(${result.r}, ${result.g}, ${result.b}, ${result.a})`;
}

/** Relative luminance per WCAG 2.x definition */
export function relativeLuminance(color: RGB): number {
  const [rs, gs, bs] = [color.r / 255, color.g / 255, color.b / 255].map(c =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** Contrast ratio per WCAG 2.x (returns value between 1 and 21) */
export function contrastRatio(fg: RGB, bg: RGB): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
