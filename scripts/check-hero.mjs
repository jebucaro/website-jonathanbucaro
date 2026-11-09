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
        label: 'Latest work and open-source code',
        repos: [
            ['dotnet-gitmoji', 'C#', 'Gitmoji commits for .NET teams'],
            ['banguat', 'C#', 'Banguat exchange rates as REST, MCP and CLI'],
            ['pokecli', 'Python', 'Typed PokeAPI CLI with an agent skill'],
        ],
    },
    es: {
        file: 'es/index.html',
        workDir: 'es/work',
        hrefPrefix: '/es/work/',
        h1: 'Construyo productos de software de punta a punta.',
        label: 'Trabajo reciente y código abierto',
        repos: [
            ['dotnet-gitmoji', 'C#', 'Commits con gitmoji para equipos .NET'],
            [
                'banguat',
                'C#',
                'Tipo de cambio del Banguat como REST, MCP y CLI',
            ],
            [
                'pokecli',
                'Python',
                'CLI tipado para PokeAPI con skill para agentes',
            ],
        ],
    },
};

const failures = [];
const fail = (file, msg) => failures.push(`${file}: ${msg}`);
const text = (html) =>
    html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
            String.fromCodePoint(parseInt(n, 16)),
        )
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
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

// Expected listing for a language, derived from the built work pages (so a
// newly published item never needs a script change): each page's JSON-LD
// datePublished, newest first, at most MAX_ITEMS. Returns [{href, month}].
function expectedWork(dir) {
    const full = join(PUBLIC_DIR, dir);
    if (!existsSync(full)) return [];
    return readdirSync(full, { withFileTypes: true })
        .filter(
            (e) =>
                e.isDirectory() && existsSync(join(full, e.name, 'index.html')),
        )
        .map((e) => {
            const page = readFileSync(join(full, e.name, 'index.html'), 'utf8');
            const date = /"datePublished":"([^"]+)"/.exec(page)?.[1] ?? '';
            return {
                href: `/${dir}/${e.name}/`,
                date,
                month: date.slice(0, 7),
            };
        })
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
        .slice(0, MAX_ITEMS);
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

    const list = elementsWithClass(terminal.inner, 'terminal__list')[0];
    // list-style: none drops list semantics in Safari/VoiceOver without it.
    if (!list || attr('role', list.tag) !== 'list')
        fail(file, '.terminal__list needs role="list"');

    const items = elementsWithClass(terminal.inner, 'terminal__item');
    const expected = expectedWork(cfg.workDir);
    if (items.length !== expected.length)
        fail(
            file,
            `expected ${expected.length} terminal items, found ${items.length}`,
        );
    items.forEach((item, i) => {
        const a = /<a\b[^>]*>([\s\S]*?)<\/a>/i.exec(item.inner);
        const href = a ? attr('href', a[0]) : undefined;
        const date = text(
            elementsWithClass(item.inner, 'terminal__date')[0]?.inner ?? '',
        );
        const want = expected[i];
        if (!href?.startsWith(cfg.hrefPrefix))
            fail(
                file,
                `item ${i} href ${href} does not start with ${cfg.hrefPrefix}`,
            );
        if (want && href !== want.href)
            fail(
                file,
                `item ${i} is ${href}, expected ${want.href} (newest first)`,
            );
        if (want && date !== want.month)
            fail(file, `item ${i} date ${date}, expected ${want.month}`);
        if (!text(a?.[1] ?? '')) fail(file, `item ${i} has empty link text`);
    });

    // The stack sentence moved out of the hero; the technologies carousel is
    // now the only visible home for these (and backs Person.knowsAbout).
    const desc = elementsWithClass(html, 'hero__description')[0];
    if (!desc || /day to day|día a día/i.test(text(desc.inner)))
        fail(file, 'hero description still carries the stack sentence');
    const labels = elementsWithClass(html, 'technologies-marquee__label').map(
        (l) => text(l.inner),
    );
    for (const tech of ['Kubernetes', 'Hasura', 'AWS'])
        if (!labels.includes(tech))
            fail(file, `technologies carousel is missing ${tech}`);

    // Tab icon: the Ubuntu logo (inline SVG), not a plain colored dot.
    const tabIcon = elementsWithClass(terminal.inner, 'terminal__tab-icon')[0];
    if (
        !tabIcon ||
        !/<svg\b/i.test(tabIcon.inner) ||
        !/#e95420/i.test(tabIcon.inner)
    )
        fail(file, 'terminal tab is missing the Ubuntu logo icon');
    if (elementsWithClass(terminal.inner, 'terminal__tab-dot').length)
        fail(file, 'terminal tab still uses the plain dot');

    // Second command: the open-source repos, from site config, linking to GitHub.
    if (!text(terminal.inner).includes('$ gh repo list jebucaro --limit 3'))
        fail(file, 'terminal gh repo list command missing');
    const repos = elementsWithClass(terminal.inner, 'terminal__repo');
    if (repos.length !== cfg.repos.length)
        fail(file, `expected ${cfg.repos.length} repos, found ${repos.length}`);
    repos.forEach((repo, i) => {
        const [name, lang, desc] = cfg.repos[i] ?? [];
        const a = /<a\b[^>]*>([\s\S]*?)<\/a>/i.exec(repo.inner);
        const cell = (cls) =>
            text(elementsWithClass(repo.inner, cls)[0]?.inner ?? '');
        if (
            attr('href', a?.[0] ?? '') !== `https://github.com/jebucaro/${name}`
        )
            fail(file, `repo ${i} href is ${attr('href', a?.[0] ?? '')}`);
        if (text(a?.[1] ?? '') !== name)
            fail(file, `repo ${i} name is ${text(a?.[1] ?? '')}`);
        if (cell('terminal__lang') !== lang)
            fail(file, `repo ${i} language is ${cell('terminal__lang')}`);
        if (cell('terminal__desc') !== desc)
            fail(
                file,
                `repo ${i} description is ${JSON.stringify(cell('terminal__desc'))}`,
            );
    });
    for (const l of elementsWithClass(terminal.inner, 'terminal__list'))
        if (attr('role', l.tag) !== 'list')
            fail(file, 'every .terminal__list needs role="list"');

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
