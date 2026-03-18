import { inflateSync } from 'zlib';
import type { RGB } from './color.js';

export interface PixelData {
  width: number;
  height: number;
  /** RGBA pixel data, 4 bytes per pixel, row-major */
  data: Uint8Array;
}

// ── PNG Decoder (minimal, 8-bit RGBA only — Playwright output) ──────

function paethPredictor(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/** Parse a PNG buffer into raw RGBA pixel data. Uses Node.js zlib only. */
export function decodePNG(buffer: Buffer): PixelData {
  // Verify PNG signature
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) {
    if (buffer[i] !== sig[i]) throw new Error('Not a valid PNG');
  }

  let width = 0;
  let height = 0;
  let colorType = 6;
  const idatChunks: Buffer[] = [];
  let offset = 8;

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const bitDepth = data[8];
      colorType = data[9];
      if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
        throw new Error(`Unsupported PNG format: bitDepth=${bitDepth}, colorType=${colorType}. Only 8-bit RGB/RGBA supported.`);
      }
    } else if (type === 'IDAT') {
      idatChunks.push(Buffer.from(data));
    } else if (type === 'IEND') {
      break;
    }

    offset += 12 + length; // 4 (length) + 4 (type) + length + 4 (CRC)
  }

  const compressed = Buffer.concat(idatChunks);
  const raw = inflateSync(compressed);

  // colorType 2 = RGB (3 bytes/pixel), colorType 6 = RGBA (4 bytes/pixel)
  const srcBpp = colorType === 2 ? 3 : 4;
  const srcStride = width * srcBpp;
  // Decode filtered rows into source-format buffer first
  const srcPixels = new Uint8Array(width * height * srcBpp);

  for (let y = 0; y < height; y++) {
    const filterByte = raw[y * (srcStride + 1)];
    const rowStart = y * (srcStride + 1) + 1;
    const outRow = y * srcStride;

    for (let x = 0; x < srcStride; x++) {
      const curr = raw[rowStart + x];
      const a = x >= srcBpp ? srcPixels[outRow + x - srcBpp] : 0;
      const b = y > 0 ? srcPixels[outRow - srcStride + x] : 0;
      const c = x >= srcBpp && y > 0 ? srcPixels[outRow - srcStride + x - srcBpp] : 0;

      let val: number;
      switch (filterByte) {
        case 0: val = curr; break;                          // None
        case 1: val = (curr + a) & 0xff; break;             // Sub
        case 2: val = (curr + b) & 0xff; break;             // Up
        case 3: val = (curr + ((a + b) >> 1)) & 0xff; break; // Average
        case 4: val = (curr + paethPredictor(a, b, c)) & 0xff; break; // Paeth
        default: val = curr;
      }
      srcPixels[outRow + x] = val;
    }
  }

  // Output is always RGBA (4 bytes/pixel)
  if (srcBpp === 4) {
    return { width, height, data: srcPixels };
  }

  // Convert RGB → RGBA
  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0, j = 0; i < srcPixels.length; i += 3, j += 4) {
    pixels[j] = srcPixels[i];
    pixels[j + 1] = srcPixels[i + 1];
    pixels[j + 2] = srcPixels[i + 2];
    pixels[j + 3] = 255; // fully opaque
  }

  return { width, height, data: pixels };
}

/** Get the RGBA color at a specific pixel coordinate. */
export function getPixel(img: PixelData, x: number, y: number): RGB & { a: number } {
  const i = (y * img.width + x) * 4;
  return { r: img.data[i], g: img.data[i + 1], b: img.data[i + 2], a: img.data[i + 3] };
}

/** Count pixels that differ between two same-size images beyond a color-distance threshold. */
export function countDifferentPixels(a: PixelData, b: PixelData, threshold = 25): number {
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error('Images must have the same dimensions');
  }
  let count = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const dr = Math.abs(a.data[i] - b.data[i]);
    const dg = Math.abs(a.data[i + 1] - b.data[i + 1]);
    const db = Math.abs(a.data[i + 2] - b.data[i + 2]);
    if (dr + dg + db > threshold) count++;
  }
  return count;
}

/** Get the average color of a rectangular region within an image. */
export function averageColor(img: PixelData, x: number, y: number, w: number, h: number): RGB {
  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  const x2 = Math.min(x + w, img.width);
  const y2 = Math.min(y + h, img.height);
  const x1 = Math.max(0, x);
  const y1 = Math.max(0, y);

  for (let py = y1; py < y2; py++) {
    for (let px = x1; px < x2; px++) {
      const i = (py * img.width + px) * 4;
      rSum += img.data[i];
      gSum += img.data[i + 1];
      bSum += img.data[i + 2];
      count++;
    }
  }

  if (count === 0) return { r: 0, g: 0, b: 0 };
  return {
    r: Math.round(rSum / count),
    g: Math.round(gSum / count),
    b: Math.round(bSum / count),
  };
}

/** Sample pixels along the border of a bounding box region. Returns array of RGB values. */
export function sampleBorderPixels(
  img: PixelData,
  x: number, y: number, w: number, h: number,
  borderWidth = 2,
): RGB[] {
  const colors: RGB[] = [];
  const x1 = Math.max(0, x);
  const y1 = Math.max(0, y);
  const x2 = Math.min(x + w, img.width);
  const y2 = Math.min(y + h, img.height);

  for (let py = y1; py < y2; py++) {
    for (let px = x1; px < x2; px++) {
      const inBorder =
        px < x1 + borderWidth || px >= x2 - borderWidth ||
        py < y1 + borderWidth || py >= y2 - borderWidth;
      if (inBorder) {
        const i = (py * img.width + px) * 4;
        colors.push({ r: img.data[i], g: img.data[i + 1], b: img.data[i + 2] });
      }
    }
  }

  return colors;
}
