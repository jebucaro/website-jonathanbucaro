// Verifies that every executable inline <script> in the built site has a
// matching sha256 hash allow-listed in firebase.json's script-src CSP.
// Hashes are computed from built output because hugo --minify may rewrite
// inline JS, and browsers hash the delivered bytes. A stale hash fails
// closed (the script is blocked in the browser); this check catches it in CI.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = 'public';
const FIREBASE_CONFIG = 'firebase.json';

// Script types browsers execute; anything else (application/ld+json, ...)
// is a data block that CSP neither executes nor blocks.
const EXECUTABLE_TYPES = new Set([
    '',
    'text/javascript',
    'application/javascript',
    'module',
]);

function htmlFiles(dir) {
    const files = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...htmlFiles(full));
        } else if (entry.name.endsWith('.html')) {
            files.push(full);
        }
    }
    return files;
}

function allowedHashes() {
    const config = JSON.parse(readFileSync(FIREBASE_CONFIG, 'utf8'));
    const hashes = new Set();
    for (const block of config.hosting.headers ?? []) {
        for (const header of block.headers ?? []) {
            if (header.key.toLowerCase() !== 'content-security-policy') {
                continue;
            }
            const scriptSrc = header.value
                .split(';')
                .map((directive) => directive.trim())
                .find((directive) => directive.startsWith('script-src'));
            if (!scriptSrc) {
                continue;
            }
            for (const match of scriptSrc.matchAll(/'(sha256-[^']+)'/g)) {
                hashes.add(match[1]);
            }
        }
    }
    return hashes;
}

function typeAttr(attrs) {
    const match = attrs.match(
        /(?:^|\s)type\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i,
    );
    if (!match) {
        return '';
    }
    return (match[2] ?? match[3] ?? match[4] ?? '').trim().toLowerCase();
}

const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const allowed = allowedHashes();
const missing = new Map();
const seen = new Set();
let inlineCount = 0;

for (const file of htmlFiles(PUBLIC_DIR)) {
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(scriptRe)) {
        const [, attrs, body] = match;
        if (/(?:^|\s)src\s*=/i.test(attrs)) {
            continue;
        }
        if (!EXECUTABLE_TYPES.has(typeAttr(attrs))) {
            continue;
        }
        if (body === '') {
            continue;
        }
        inlineCount += 1;
        const digest = createHash('sha256')
            .update(body, 'utf8')
            .digest('base64');
        const hash = `sha256-${digest}`;
        seen.add(hash);
        if (!allowed.has(hash) && !missing.has(hash)) {
            missing.set(hash, { file, snippet: body.slice(0, 80) });
        }
    }
}

for (const hash of allowed) {
    if (!seen.has(hash)) {
        console.warn(
            `warning: CSP allows '${hash}' but no built inline script matches it (stale?)`,
        );
    }
}

if (missing.size > 0) {
    console.error('Inline scripts missing from firebase.json script-src CSP:');
    for (const [hash, { file, snippet }] of missing) {
        console.error(`  '${hash}'`);
        console.error(`    first seen in ${file}`);
        console.error(`    starts with: ${JSON.stringify(snippet)}`);
    }
    console.error(
        "Add the hash(es) above to script-src in firebase.json (quoted, e.g. 'sha256-...').",
    );
    process.exit(1);
}

console.log(
    `CSP check passed: ${inlineCount} executable inline script(s), ${allowed.size} hash(es) allow-listed.`,
);
