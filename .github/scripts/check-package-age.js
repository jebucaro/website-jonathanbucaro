#!/usr/bin/env node

import { execSync } from 'child_process';
import https from 'https';

const args = process.argv.slice(2);
const baseBranchIdx = args.indexOf('--base-branch');
const baseBranch = baseBranchIdx !== -1 ? args[baseBranchIdx + 1] : 'main';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getDiff() {
    try {
        return execSync(
            `git diff origin/${baseBranch}...HEAD -- pnpm-lock.yaml`,
            {
                encoding: 'utf8',
            },
        );
    } catch {
        return execSync(`git diff ${baseBranch}...HEAD -- pnpm-lock.yaml`, {
            encoding: 'utf8',
        });
    }
}

function parseNewPackages(diff) {
    const packages = new Set();
    for (const line of diff.split('\n')) {
        // Match "+" lines in the packages: section — format: +  name@version: or +  @scope/name@version:
        const match = line.match(
            /^\+\s{2}((?:@[^/\s]+\/)?[^@\s/]+)@([^:\s(]+):/,
        );
        if (!match) continue;
        const [, name, version] = match;
        if (
            !version.startsWith('file:') &&
            !version.startsWith('workspace:') &&
            !version.startsWith('link:')
        ) {
            packages.add(`${name}@${version}`);
        }
    }
    return [...packages];
}

function fetchPackageTime(name, version) {
    return new Promise((resolve, reject) => {
        const encodedName = name.startsWith('@')
            ? '@' + encodeURIComponent(name.slice(1))
            : name;
        // The per-version endpoint omits the `time` map — only the full
        // packument carries publish timestamps.
        const url = `https://registry.npmjs.org/${encodedName}`;

        https
            .get(
                url,
                { headers: { 'User-Agent': 'pnpm-package-age-check/1.0' } },
                (res) => {
                    let data = '';
                    res.on('data', (chunk) => (data += chunk));
                    res.on('end', () => {
                        if (res.statusCode === 404) {
                            resolve(null);
                            return;
                        }
                        try {
                            resolve(JSON.parse(data).time?.[version] ?? null);
                        } catch {
                            reject(
                                new Error(
                                    `Failed to parse registry response for ${name}@${version}`,
                                ),
                            );
                        }
                    });
                },
            )
            .on('error', reject);
    });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatAge(ms) {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

async function main() {
    console.log(`Checking package publication ages (base: ${baseBranch})\n`);

    let diff;
    try {
        diff = getDiff();
    } catch (err) {
        console.error(`Failed to get git diff: ${err.message}`);
        process.exit(1);
    }

    if (!diff.trim()) {
        console.log('No changes to pnpm-lock.yaml detected.');
        process.exit(0);
    }

    const packages = parseNewPackages(diff);

    if (packages.length === 0) {
        console.log('No new packages detected in pnpm-lock.yaml.');
        process.exit(0);
    }

    console.log(
        `Found ${packages.length} new/updated package(s). Querying npm registry...\n`,
    );

    const violations = [];
    const now = Date.now();

    for (const pkg of packages) {
        const atIdx = pkg.lastIndexOf('@');
        const name = pkg.slice(0, atIdx);
        const version = pkg.slice(atIdx + 1);

        try {
            const time = await fetchPackageTime(name, version);

            if (time === null) {
                console.log(`  SKIP  ${pkg} (not in npm registry)`);
                continue;
            }

            const ageMs = now - new Date(time).getTime();

            if (ageMs < ONE_DAY_MS) {
                violations.push({ pkg, publishedAt: new Date(time), ageMs });
                console.log(
                    `  FAIL  ${pkg} — published ${formatAge(ageMs)} ago`,
                );
            } else {
                console.log(
                    `  OK    ${pkg} — published ${formatAge(ageMs)} ago`,
                );
            }

            await sleep(100);
        } catch (err) {
            console.warn(
                `  WARN  ${pkg} — registry fetch failed: ${err.message}`,
            );
        }
    }

    if (violations.length > 0) {
        console.log(
            `\n✖ ${violations.length} package(s) published less than 24 hours ago:\n`,
        );
        for (const { pkg, publishedAt, ageMs } of violations) {
            console.log(`  • ${pkg}`);
            console.log(`    Published: ${publishedAt.toISOString()}`);
            console.log(`    Age:       ${formatAge(ageMs)}`);
        }
        console.log(
            '\nWait at least 24 hours after a package is published before adding it.',
        );
        process.exit(1);
    }

    console.log(
        '\n✔ All packages meet the 24-hour publication age requirement.',
    );
}

main();
