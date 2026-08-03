// Verifies that the homepage's hero preload <link> (imagesrcset/imagesizes)
// is character-identical to the hero <img>'s srcset/sizes, in every built
// language's homepage. Go's html/template percent-encodes unrecognized
// src-named attributes (see layouts/_partials/head.html), so a regression
// there silently breaks the preload without failing the Hugo build; this
// check catches it in CI.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = 'public';

function homepageFiles(dir) {
    // A homepage is index.html directly inside public/ or inside a single
    // language-code directory (public/es/index.html, etc).
    const files = [];
    const top = join(dir, 'index.html');
    try {
        readFileSync(top);
        files.push(top);
    } catch {
        // no root homepage; ignore
    }
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            continue;
        }
        const candidate = join(dir, entry.name, 'index.html');
        try {
            readFileSync(candidate);
            files.push(candidate);
        } catch {
            // not a language homepage dir; ignore
        }
    }
    return files;
}

function attr(name, haystack) {
    const re = new RegExp(`${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
    const match = re.exec(haystack);
    if (!match) {
        return null;
    }
    return match[1] ?? match[2] ?? match[3] ?? null;
}

const failures = [];
let checked = 0;

for (const file of homepageFiles(PUBLIC_DIR)) {
    const html = readFileSync(file, 'utf8').replace(/\n/g, ' ');

    const preloadRe = /<link\b[^>]*rel="?preload"?[^>]*as="?image"?[^>]*>/i;
    const preload = preloadRe.exec(html);
    if (!preload) {
        // Homepage without a hero image preload (hero.enable = false, or a
        // non-raster hero) is not an error for this check.
        continue;
    }

    const imgRe = /<img\b[^>]*src=[^>]*profile[^>]*>/i;
    const img = imgRe.exec(html);
    if (!img) {
        failures.push(`${file}: found a hero preload but no hero <img>`);
        continue;
    }

    checked += 1;

    const preloadSrcset = attr('imagesrcset', preload[0]);
    const preloadSizes = attr('imagesizes', preload[0]);
    const imgSrcset = attr('srcset', img[0]);
    const imgSizes = attr('sizes', img[0]);

    if (/%20/.test(preload[0])) {
        failures.push(
            `${file}: hero preload contains percent-encoding (%20) — ` +
                'imagesrcset must be emitted via safeHTMLAttr, see head.html',
        );
    }
    if (preloadSrcset === null || preloadSrcset !== imgSrcset) {
        failures.push(
            `${file}: imagesrcset drift\n` +
                `  preload: ${preloadSrcset}\n` +
                `  img:     ${imgSrcset}`,
        );
    }
    if (preloadSizes === null || preloadSizes !== imgSizes) {
        failures.push(
            `${file}: imagesizes drift\n` +
                `  preload: ${preloadSizes}\n` +
                `  img:     ${imgSizes}`,
        );
    }
}

if (failures.length > 0) {
    console.error('Hero preload check failed:');
    for (const failure of failures) {
        console.error(`  ${failure}`);
    }
    process.exit(1);
}

console.log(
    `Hero preload check passed: ${checked} homepage(s) with a matching preload/img pair.`,
);
