// Verifies the homepage hero in public/ after a build: no hero image
// preload (the small byline photo is not the LCP element, so a preload would
// only compete with critical resources), the <h1> holds only the headline,
// and the terminal card lists the latest work items for that language,
// newest first, at most five, with short linkTitle names and local links.
// Works on both minified (unquoted attributes) and unminified output.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = 'public';
const MAX_ITEMS = 5;
const LANGS = {
    en: {
        file: 'index.html',
        workDir: 'work',
        hrefPrefix: '/work/',
        h1: 'I build software products end to end.',
        label: 'Latest work',
        firstHref: '/work/ai-native-clis-with-skills/',
        firstText: 'AI-native CLIs with Skills',
    },
    es: {
        file: 'es/index.html',
        workDir: 'es/work',
        hrefPrefix: '/es/work/',
        h1: 'Construyo productos de software de punta a punta.',
        label: 'Trabajo reciente',
        firstHref: '/es/work/clis-ai-native-con-skills/',
        firstText: 'CLIs AI-native con skills',
    },
};

const failures = [];
const fail = (file, msg) => failures.push(`${file}: ${msg}`);
const text = (html) =>
    html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
const attr = (name, tag) =>
    new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')
        .exec(tag)
        ?.slice(1)
        .find((v) => v !== undefined);
const hasClass = (tag, cls) =>
    (attr('class', tag) ?? '').split(/\s+/).includes(cls);

// Opening tags carrying a class, with the inner HTML of the element up to its
// matching close tag (simple depth count on the same tag name).
function elementsWithClass(html, cls) {
    const out = [];
    const open = /<([a-z0-9]+)\b[^>]*>/gi;
    for (const m of html.matchAll(open)) {
        if (!hasClass(m[0], cls)) continue;
        const name = m[1].toLowerCase();
        const re = new RegExp(`<(/?)${name}\\b[^>]*>`, 'gi');
        re.lastIndex = m.index + m[0].length;
        let depth = 1;
        let end = html.length;
        for (const t of html
            .slice(re.lastIndex)
            .matchAll(new RegExp(re.source, 'gi'))) {
            depth += t[1] ? -1 : 1;
            if (depth === 0) {
                end = re.lastIndex + t.index;
                break;
            }
        }
        out.push({ tag: m[0], inner: html.slice(m.index + m[0].length, end) });
    }
    return out;
}

function workPageCount(dir) {
    const full = join(PUBLIC_DIR, dir);
    if (!existsSync(full)) return 0;
    return readdirSync(full, { withFileTypes: true }).filter(
        (e) => e.isDirectory() && existsSync(join(full, e.name, 'index.html')),
    ).length;
}

for (const [lang, cfg] of Object.entries(LANGS)) {
    const file = cfg.file;
    const full = join(PUBLIC_DIR, file);
    if (!existsSync(full)) {
        fail(file, 'missing');
        continue;
    }
    const html = readFileSync(full, 'utf8');

    for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
        if (attr('rel', tag) === 'preload' && attr('as', tag) === 'image')
            fail(file, 'hero image preload still present');
    }

    const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    if (h1s.length !== 1) fail(file, `expected 1 <h1>, found ${h1s.length}`);
    else if (text(h1s[0][1]) !== cfg.h1)
        fail(file, `<h1> is ${JSON.stringify(text(h1s[0][1]))}`);

    const terminal = elementsWithClass(html, 'terminal')[0];
    if (!terminal) {
        fail(file, 'missing .terminal');
        continue;
    }
    if (attr('aria-label', terminal.tag) !== cfg.label)
        fail(
            file,
            `.terminal aria-label is ${attr('aria-label', terminal.tag)}`,
        );
    if (!text(terminal.inner).includes('$ ls work --latest'))
        fail(file, 'terminal command line missing');

    const items = elementsWithClass(terminal.inner, 'terminal__item');
    const expected = Math.min(MAX_ITEMS, workPageCount(cfg.workDir));
    if (items.length !== expected)
        fail(
            file,
            `expected ${expected} terminal items, found ${items.length}`,
        );
    items.forEach((item, i) => {
        const a = /<a\b[^>]*>([\s\S]*?)<\/a>/i.exec(item.inner);
        const href = a ? attr('href', a[0]) : undefined;
        const date = text(
            elementsWithClass(item.inner, 'terminal__date')[0]?.inner ?? '',
        );
        if (!href?.startsWith(cfg.hrefPrefix))
            fail(
                file,
                `item ${i} href ${href} does not start with ${cfg.hrefPrefix}`,
            );
        if (!/^\d{4}-\d{2}$/.test(date))
            fail(file, `item ${i} date ${JSON.stringify(date)} is not YYYY-MM`);
        if (i === 0) {
            if (href !== cfg.firstHref)
                fail(file, `first item href is ${href}`);
            if (text(a?.[1] ?? '') !== cfg.firstText)
                fail(
                    file,
                    `first item text is ${JSON.stringify(text(a?.[1] ?? ''))}`,
                );
            if (date !== '2026-10') fail(file, `first item date is ${date}`);
        }
    });

    const avatar = elementsWithClass(html, 'hero__avatar')[0];
    const img = avatar && /<img\b[^>]*>/i.exec(avatar.inner)?.[0];
    if (!img) fail(file, 'missing .hero__avatar <img>');
    else {
        if (!attr('width', img) || !attr('height', img))
            fail(file, 'avatar <img> lacks width/height');
        if (attr('fetchpriority', img) === 'high')
            fail(file, 'avatar <img> has fetchpriority=high');
    }

    if (lang === 'en') {
        const meta = (prop) =>
            (html.match(/<meta\b[^>]*>/gi) ?? []).find(
                (t) => attr('property', t) === prop,
            );
        const og = meta('og:image');
        if (!og || !attr('content', og).endsWith('.jpg'))
            fail(file, 'og:image is not the 1200x630 jpg crop');
        if (attr('content', meta('og:image:width') ?? '') !== '1200')
            fail(file, 'og:image:width is not 1200');
    }
}

for (const gone of [
    'scripts/check-hero-preload.mjs',
    'layouts/_partials/functions/hero-sizes.html',
]) {
    if (existsSync(gone)) fail(gone, 'should be deleted');
}

if (failures.length) {
    console.error(`Hero check failed (${failures.length}):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
}
console.log('Hero check passed.');
