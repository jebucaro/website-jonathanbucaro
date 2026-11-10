// Verifies the site's identity structured data in public/ after a build:
// every JSON-LD block parses, Home and About carry the one canonical Person
// node (plus WebSite / ProfilePage), and every other schema block points to
// that Person by @id instead of re-declaring an unlinked author. Spanish
// pages must reuse the English Person URLs so search engines see one person.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const PUBLIC_DIR = 'public';
const SITE = 'https://jonathanbucaro.com/';
const PERSON_ID = `${SITE}#person`;
const PERSON_NAME = 'Jonathan Búcaro';
const SAME_AS = [
    'https://github.com/jebucaro',
    'https://www.linkedin.com/in/jonathanbucaro/',
    'https://www.nuget.org/profiles/jebucaro',
    'https://dev.to/jebucaro',
    'https://www.tinytooltown.com/authors/jebucaro/',
];
const HOME_PAGES = ['index.html', 'es/index.html'];
const ABOUT_PAGES = ['about/index.html', 'es/about/index.html'];
const BIO_MARKER = {
    en: 'I build software end to end',
    es: 'Construyo software desde el problema de negocio hasta operarlo en producción',
};

const failures = [];
const fail = (file, msg) => failures.push(`${file}: ${msg}`);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function htmlFiles(dir) {
    const out = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) out.push(...htmlFiles(full));
        else if (entry.name.endsWith('.html')) out.push(full);
    }
    return out;
}

function jsonLdNodes(file, html) {
    const nodes = [];
    const re =
        /<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
    for (const [, raw] of html.matchAll(re)) {
        if (/&amp;|&#/.test(raw)) fail(file, 'JSON-LD contains HTML entities');
        let data;
        try {
            data = JSON.parse(raw);
        } catch (err) {
            fail(file, `JSON-LD does not parse: ${err.message}`);
            continue;
        }
        nodes.push(...(data['@graph'] ?? [data]));
    }
    return nodes;
}

const byType = (nodes, type) => nodes.find((n) => n['@type'] === type);

function checkPerson(file, person, lang) {
    if (!person) return fail(file, 'missing full Person node');
    const expect = {
        '@id': PERSON_ID,
        name: PERSON_NAME,
        url: SITE,
        mainEntityOfPage: `${SITE}about/`,
        jobTitle: 'Senior Software Engineer',
        sameAs: SAME_AS,
        alternateName: ['Jonathan Bucaro', 'jebucaro'],
    };
    for (const [key, value] of Object.entries(expect)) {
        if (!same(person[key], value))
            fail(file, `Person.${key} is ${JSON.stringify(person[key])}`);
    }
    if (person.address?.addressCountry !== 'GT')
        fail(file, 'Person.address.addressCountry is not GT');
    // Both are named on the About page (en and es).
    const orgs = {
        worksFor: {
            '@type': 'Organization',
            name: 'HTEC',
            url: 'https://htec.com/',
        },
        alumniOf: {
            '@type': 'CollegeOrUniversity',
            name: 'Universidad Mariano Gálvez de Guatemala',
            url: 'https://umg.edu.gt/',
        },
    };
    for (const [key, value] of Object.entries(orgs)) {
        if (!same(person[key], value))
            fail(file, `Person.${key} is ${JSON.stringify(person[key])}`);
    }
    if (!String(person.description ?? '').includes(BIO_MARKER[lang]))
        fail(file, `Person.description is not the ${lang} bio`);
}

function checkRef(file, label, ref) {
    if (ref?.['@id'] !== PERSON_ID)
        fail(file, `${label} does not reference ${PERSON_ID}`);
    if (ref?.name !== PERSON_NAME)
        fail(file, `${label}.name is ${JSON.stringify(ref?.name)}`);
    const extra = Object.keys(ref ?? {}).filter(
        (k) => !['@type', '@id', 'name', 'url'].includes(k),
    );
    if (extra.length)
        fail(
            file,
            `${label} adds ${extra.join(', ')} to the shared Person @id`,
        );
}

for (const full of htmlFiles(PUBLIC_DIR)) {
    const file = relative(PUBLIC_DIR, full);
    const html = readFileSync(full, 'utf8');
    const nodes = jsonLdNodes(file, html);
    const lang = file.startsWith('es/') ? 'es' : 'en';
    const fullPersons = nodes.filter(
        (n) => n['@type'] === 'Person' && 'sameAs' in n,
    );

    if (HOME_PAGES.includes(file)) {
        const site = byType(nodes, 'WebSite');
        // One WebSite node per language, so one @id never carries two urls.
        const siteId = `${SITE}${lang === 'es' ? 'es/' : ''}#website`;
        if (site?.['@id'] !== siteId)
            fail(file, `WebSite @id is not ${siteId}`);
        if (site?.publisher?.['@id'] !== PERSON_ID)
            fail(file, 'WebSite.publisher does not reference Person');
        checkPerson(file, fullPersons[0], lang);
    } else if (ABOUT_PAGES.includes(file)) {
        const page = byType(nodes, 'ProfilePage');
        const canonical = /<link rel="?canonical"? href="?([^"\s>]+)/.exec(
            html,
        )?.[1];
        if (!page) fail(file, 'missing ProfilePage node');
        else {
            if (page.mainEntity?.['@id'] !== PERSON_ID)
                fail(file, 'ProfilePage.mainEntity does not reference Person');
            if (page.url !== canonical)
                fail(
                    file,
                    `ProfilePage.url ${page.url} != canonical ${canonical}`,
                );
        }
        checkPerson(file, fullPersons[0], lang);
    } else if (fullPersons.length > 0) {
        fail(file, 'full Person node outside Home/About');
    }

    for (const post of nodes.filter((n) => n['@type'] === 'BlogPosting')) {
        checkRef(file, 'BlogPosting.author', post.author);
        checkRef(file, 'BlogPosting.publisher', post.publisher);
        if (post['@id'] !== `${post.url}#article`)
            fail(file, `BlogPosting @id is ${JSON.stringify(post['@id'])}`);
        if (post.mainEntityOfPage !== post.url)
            fail(file, 'BlogPosting.mainEntityOfPage is not its url');
    }
    for (const work of nodes.filter((n) =>
        ['CreativeWork', 'SoftwareApplication'].includes(n['@type']),
    )) {
        checkRef(file, `${work['@type']}.author`, work.author);
        if (work.recordedAt)
            checkRef(file, 'Event.performer', work.recordedAt.performer);
    }
}

// Spot checks so a template that stops emitting schema entirely can't pass.
for (const [file, type] of [
    ['blog/bumblebee/index.html', 'BlogPosting'],
    ['work/ai-native-clis-with-skills/index.html', 'CreativeWork'],
]) {
    const full = join(PUBLIC_DIR, file);
    if (!existsSync(full)) fail(file, 'expected page is missing');
    else if (!byType(jsonLdNodes(file, readFileSync(full, 'utf8')), type))
        fail(file, `missing ${type}`);
}
const talk = join(PUBLIC_DIR, 'work/ai-native-clis-with-skills/index.html');
if (existsSync(talk)) {
    const work = byType(
        jsonLdNodes('talk', readFileSync(talk, 'utf8')),
        'CreativeWork',
    );
    if (!work?.recordedAt)
        fail(
            'work/ai-native-clis-with-skills/index.html',
            'missing recordedAt Event',
        );
}

// /llms.txt: English only, summary = English bio, every link is a built page.
function checkLlmsTxt() {
    const file = 'llms.txt';
    const full = join(PUBLIC_DIR, file);
    if (existsSync(join(PUBLIC_DIR, 'es', file)))
        fail('es/llms.txt', 'should not be generated');
    if (!existsSync(full)) return fail(file, 'missing');
    const text = readFileSync(full, 'utf8');
    const lines = text.split('\n');
    if (lines[0] !== `# ${PERSON_NAME}`)
        fail(file, `first line is ${JSON.stringify(lines[0])}`);
    if (/&amp;|&#/.test(text)) fail(file, 'contains HTML entities');
    const home = jsonLdNodes(
        'index.html',
        readFileSync(join(PUBLIC_DIR, 'index.html'), 'utf8'),
    );
    const bio = home.find((n) => n['@id'] === PERSON_ID)?.description;
    if (!bio || !lines.includes(`> ${bio}`))
        fail(file, 'summary is not the English bio');
    // Nothing between the summary and the first section: free prose there
    // drifts into claims the site's content doesn't back.
    const summaryAt = lines.indexOf(`> ${bio}`);
    const aboutAt = lines.indexOf('## About');
    if (lines.slice(summaryAt + 1, aboutAt).some((l) => l.trim() !== ''))
        fail(file, 'unexpected prose between summary and ## About');
    const sections = lines.filter((l) => l.startsWith('## '));
    if (
        !same(sections, [
            '## About',
            '## Work',
            '## Writing',
            '## Profiles',
            '## Optional',
        ])
    ) {
        fail(file, `sections are ${JSON.stringify(sections)}`);
    }
    const profiles =
        text.split('## Profiles')[1]?.split('## Optional')[0] ?? '';
    for (const url of SAME_AS)
        if (!profiles.includes(`](${url})`))
            fail(file, `Profiles missing ${url}`);
    for (const [, url] of text.matchAll(
        /\]\((https:\/\/jonathanbucaro\.com\/[^)]*)\)/g,
    )) {
        const path = url.slice(SITE.length);
        const target =
            path === '' || path.endsWith('/')
                ? join(PUBLIC_DIR, path, 'index.html')
                : join(PUBLIC_DIR, path);
        if (!existsSync(target))
            fail(file, `link does not resolve to a built page: ${url}`);
    }
    if (
        !/## Work\n(?:.*\n)*?- \[.+\]\(https:\/\/jonathanbucaro\.com\/work\//.test(
            text,
        )
    )
        fail(file, 'no work items listed');
    if (
        !/## Writing\n(?:.*\n)*?- \[.+\]\(https:\/\/jonathanbucaro\.com\/blog\//.test(
            text,
        )
    )
        fail(file, 'no posts listed');
}
checkLlmsTxt();

// robots.txt: one root sitemap (an index of both languages), no es copy.
// 404: never indexed.
function checkRobotsAndNotFound() {
    const robots = join(PUBLIC_DIR, 'robots.txt');
    if (!existsSync(robots)) fail('robots.txt', 'missing');
    else {
        const sitemaps = readFileSync(robots, 'utf8')
            .split('\n')
            .filter((l) => l.startsWith('Sitemap:'));
        if (!same(sitemaps, [`Sitemap: ${SITE}sitemap.xml`]))
            fail('robots.txt', `Sitemap lines are ${JSON.stringify(sitemaps)}`);
    }
    if (existsSync(join(PUBLIC_DIR, 'es', 'robots.txt')))
        fail('es/robots.txt', 'should not be generated');
    const notFound = join(PUBLIC_DIR, '404.html');
    if (
        !existsSync(notFound) ||
        !/<meta name="?robots"? content="?noindex/.test(
            readFileSync(notFound, 'utf8'),
        )
    )
        fail('404.html', 'missing robots noindex');
}
checkRobotsAndNotFound();

if (failures.length) {
    console.error(`Structured data check failed (${failures.length}):`);
    for (const f of [...new Set(failures)]) console.error(`  - ${f}`);
    process.exit(1);
}
console.log('Structured data check passed.');
