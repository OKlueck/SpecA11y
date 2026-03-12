export function parsePxValue(value: string): number {
  if (!value.endsWith('px')) return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

export function parsePercentage(value: string): number {
  if (!value.endsWith('%')) return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num / 100;
}

export function isHidden(display: string, visibility: string, opacity: string): boolean {
  if (display === 'none') return true;
  if (visibility === 'hidden' || visibility === 'collapse') return true;
  if (opacity === '0') return true;
  return false;
}

export function parseFontSize(fontSize: string): { value: number; unit: string } {
  const match = fontSize.match(/^([\d.]+)\s*([a-z%]+)$/i);
  if (!match) return { value: 0, unit: '' };
  return { value: parseFloat(match[1]), unit: match[2] };
}
