#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const TITLE = process.argv.slice(2).join(' ').trim();
const MAX_LENGTH = 72;

if (!TITLE) {
    console.error('❌ PR title is required.');
    process.exit(1);
}

const length = Array.from(TITLE).length;
if (length > MAX_LENGTH) {
    console.error(
        `❌ PR title exceeds ${MAX_LENGTH} characters (current: ${length})`,
    );
    process.exit(1);
}

const gitmojiPath = path.join(__dirname, '..', 'gitmojis.json');
let gitmojiData;

try {
    gitmojiData = JSON.parse(fs.readFileSync(gitmojiPath, 'utf8'));
} catch (error) {
    console.error('❌ Unable to load .github/gitmojis.json.');
    console.error(error.message);
    process.exit(1);
}

const gitmojis = Array.isArray(gitmojiData.gitmojis)
    ? gitmojiData.gitmojis
    : [];
const validEmojis = new Set(gitmojis.map((item) => item.emoji));
const validCodes = new Set(gitmojis.map((item) => item.code));

function isValidIntention(intention) {
    return validEmojis.has(intention) || validCodes.has(intention);
}

function parseTitle(title) {
    const firstSpace = title.indexOf(' ');
    if (firstSpace === -1) {
        return { error: 'Missing message after intention.' };
    }

    const intention = title.slice(0, firstSpace);
    const remainder = title.slice(firstSpace + 1).trim();

    if (!remainder) {
        return { error: 'Missing message after intention.' };
    }

    if (!isValidIntention(intention)) {
        return { error: `Unknown or invalid gitmoji: ${intention}` };
    }

    if (remainder.startsWith('(')) {
        const match = remainder.match(/^\(([^)]+)\)(:)?\s+(.+)$/);
        if (!match) {
            return {
                error: 'Invalid scope format. Use (scope) message or (scope): message.',
            };
        }

        return { intention, scope: match[1], message: match[3] };
    }

    const scopeMatch = remainder.match(
        /^([A-Za-z0-9][A-Za-z0-9._/-]*):\s+(.+)$/,
    );
    if (scopeMatch) {
        return { intention, scope: scopeMatch[1], message: scopeMatch[2] };
    }

    return { intention, message: remainder };
}

const parsed = parseTitle(TITLE);

if (parsed.error) {
    console.error(`❌ ${parsed.error}`);
    console.error('\nExpected format:');
    console.error('  <intention> [scope?][:?] <message>');
    console.error('\nExamples:');
    console.error('  ⚡️ Lazyload home screen images.');
    console.error('  :zap: Lazyload home screen images.');
    console.error('  ♻️ (components): Transform classes to hooks');
    console.error('  :recycle: (components): Transform classes to hooks');
    console.error('  ♿️ (account) Improve modals a11y');
    console.error('  :wheelchair: account: Improve modals a11y');
    process.exit(1);
}

if (!parsed.message || !parsed.message.trim()) {
    console.error('❌ Message must be provided after the intention and scope.');
    process.exit(1);
}

console.log('✅ PR title is valid!');
console.log('Format: ✓');
console.log(`Length: ✓ (${length}/${MAX_LENGTH} characters)`);
console.log(`Gitmoji: ✓ ${parsed.intention}`);
