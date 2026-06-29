/**
 * generate-icons.mjs - Rasterize the app cup logo (app-icon.svg) into PNGs.
 *
 * The source of truth is public/app-icon.svg (the same GiTrophyCup used on the
 * home page, on a PSG blue->red gradient). This script renders it to every PNG
 * size the manifest / iOS / favicons need. Run after editing the SVG:
 *
 *   node scripts/generate-icons.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, '..', 'public');

const svg = readFileSync(resolve(publicDir, 'app-icon.svg'), 'utf8');

/** size in px -> output filename (all square) */
const TARGETS = [
  [512, 'app-icon-512.png'],
  [192, 'app-icon-192.png'],
  [180, 'apple-touch-icon.png'],
  [32, 'favicon-32x32.png'],
  [16, 'favicon-16x16.png'],
];

for (const [size, name] of TARGETS) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const png = resvg.render().asPng();
  writeFileSync(resolve(publicDir, name), png);
  console.log(`✓ ${name} (${size}x${size}, ${(png.length / 1024).toFixed(1)} KB)`);
}

console.log('Done. Icons regenerated from app-icon.svg.');
