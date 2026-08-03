// Computes CSS font fallback overrides so local Arial renders at the same
// geometry as Noto Sans Display, eliminating layout shift on font swap.
// Formula: https://developer.chrome.com/blog/font-fallbacks (size-adjust from
// average glyph width; ascent/descent/line-gap scaled by it).
import { openSync } from 'fontkit';

const font = openSync('static/fonts/noto-sans-display-v30-latin-wght.woff2');
const upem = font.unitsPerEm;
// Arial reference metrics (Monotype Arial: unitsPerEm 2048, OS/2 xAvgCharWidth 904)
const arialAvg = 904 / 2048;
const notoAvg = font['OS/2'].xAvgCharWidth / upem;
const sizeAdjust = notoAvg / arialAvg;
const pct = (v) => `${(v * 100).toFixed(2)}%`;

console.log(`size-adjust: ${pct(sizeAdjust)};`);
console.log(`ascent-override: ${pct(font.ascent / upem / sizeAdjust)};`);
console.log(
    `descent-override: ${pct(Math.abs(font.descent) / upem / sizeAdjust)};`,
);
console.log(`line-gap-override: ${pct(font.lineGap / upem / sizeAdjust)};`);
