import * as base64 from 'base64-js';
import jpeg from 'jpeg-js';

export interface DecodedImage {
  width: number;
  height: number;
  data: Uint8Array; // RGBA flat array [R, G, B, A, R, G, B, A, ...]
}

/**
 * Decodes a base64-encoded JPEG image into raw RGBA pixel data.
 */
export function decodeBase64Jpeg(base64Str: string): DecodedImage {
  const cleanBase64 = base64Str.includes(',') ? base64Str.split(',')[1] : base64Str;
  const rawBytes = base64.toByteArray(cleanBase64);
  const decoded = jpeg.decode(rawBytes, { useTArray: true, formatAsRGBA: true });

  return {
    width: decoded.width,
    height: decoded.height,
    data: decoded.data as Uint8Array,
  };
}

/**
 * Retrieves the luminance (0..255) at pixel coordinate (x, y).
 */
export function getPixelLuminance(image: DecodedImage, x: number, y: number): number {
  const px = Math.max(0, Math.min(image.width - 1, Math.floor(x)));
  const py = Math.max(0, Math.min(image.height - 1, Math.floor(y)));
  const idx = (py * image.width + px) * 4;

  const r = image.data[idx];
  const g = image.data[idx + 1];
  const b = image.data[idx + 2];

  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Samples average luminance and variance in a rectangular region [x0, y0, x1, y1].
 */
export function sampleRegionLuminance(
  image: DecodedImage,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): { mean: number; variance: number } {
  let sum = 0;
  let sumSq = 0;
  let count = 0;

  const stepX = Math.max(1, Math.floor((x1 - x0) / 10));
  const stepY = Math.max(1, Math.floor((y1 - y0) / 10));

  for (let y = y0; y < y1; y += stepY) {
    for (let x = x0; x < x1; x += stepX) {
      const lum = getPixelLuminance(image, x, y);
      sum += lum;
      sumSq += lum * lum;
      count++;
    }
  }

  if (count === 0) return { mean: 128, variance: 0 };

  const mean = sum / count;
  const variance = Math.max(0, sumSq / count - mean * mean);

  return { mean, variance };
}
