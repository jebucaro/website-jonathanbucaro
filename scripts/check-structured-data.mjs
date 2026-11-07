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
    es: 'Construyo software de punta a punta',
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
    if ('worksFor' in person)
        fail(file, 'Person.worksFor must wait for the About rewrite');
    if (!String(person.description ?? '').includes(BIO_MARKER[lang]))
        fail(file, `Person.description is not the ${lang} bio`);
}

function checkRef(file, label, ref) {
    if (ref?.['@id'] !== PERSON_ID)
        fail(file, `${label} does not reference ${PERSON_ID}`);
    if (ref?.name !== PERSON_NAME)
        fail(file, `${label}.name is ${JSON.stringify(ref?.name)}`);
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
        if (site?.['@id'] !== `${SITE}#website`)
            fail(file, 'missing WebSite node');
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

if (failures.length) {
    console.error(`Structured data check failed (${failures.length}):`);
    for (const f of [...new Set(failures)]) console.error(`  - ${f}`);
    process.exit(1);
}
console.log('Structured data check passed.');
