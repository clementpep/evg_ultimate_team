/**
 * optimize-assets.mjs - Compress heavy art for mobile.
 *
 *  - public/*_pack.png + *_card.png : foil packs & card templates (~2.5 MB each)
 *  - src/assets/fut_card_*.png       : participant FUT cards (~3 MB each)
 *
 * All are converted to WebP (transparency preserved) capped at a sensible width
 * for a retina phone, bringing each well under ~200 KB. Originals are kept; the
 * app imports the .webp (see futCards.ts / packArt.ts).
 *
 *   node scripts/optimize-assets.mjs
 */

import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, '..', 'public');
const assetsDir = resolve(here, '..', 'src', 'assets');

async function convert(dir, file, width, quality) {
  const src = join(dir, file);
  const out = src.replace(/\.png$/, '.webp');
  const info = await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(out);
  console.log(`✓ ${file} -> ${file.replace(/\.png$/, '.webp')} (${(info.size / 1024).toFixed(0)} KB)`);
}

// Pack art & card templates
for (const file of readdirSync(publicDir).filter((f) => /_(pack|card)\.png$/.test(f))) {
  await convert(publicDir, file, 900, 82);
}

// Participant FUT cards
for (const file of readdirSync(assetsDir).filter((f) => /^fut_card_.*\.png$/.test(f))) {
  await convert(assetsDir, file, 760, 80);
}

console.log('Done optimizing assets.');
