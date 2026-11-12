// Builds the site in the `llms-fixture` environment, which appends the
// headless page content/llms-fixture/ to llms-full.txt, and compares its
// conversion exactly. Covers what today's posts don't exercise: nested and
// mixed code fences (headings inside stay untouched) and blank-line
// squeezing that must stop at code fences.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EXPECTED = `<!-- markdownlint-disable -->

Intro paragraph.

After three blank lines.

\`\`\`\`markdown
## Heading inside a four-backtick fence
\`\`\`bash
echo hi


echo after two blank lines
\`\`\`
## Still inside the outer fence
\`\`\`\`

#### Real heading

~~~text
\`\`\`
# Inside a tilde fence, not a heading
\`\`\`
~~~

\`\`\`python
# Python comment, not a heading
\`\`\`

###### Deepest heading
`;

const out = mkdtempSync(join(tmpdir(), 'llms-fixture-'));
try {
    execFileSync(
        'pnpm',
        [
            'exec',
            'hugo',
            '--environment',
            'llms-fixture',
            '--quiet',
            '--destination',
            out,
        ],
        { stdio: ['ignore', 'ignore', 'inherit'] },
    );
    const text = readFileSync(join(out, 'llms-full.txt'), 'utf8');
    const actual = text.split('\n## Fixture\n\n')[1];
    if (actual === undefined) {
        console.error('llms fixture check failed: no ## Fixture section');
        process.exit(1);
    }
    if (actual !== EXPECTED) {
        console.error('llms fixture check failed. Expected:\n' + EXPECTED);
        console.error('Actual:\n' + actual);
        process.exit(1);
    }
    console.log('llms fixture check passed.');
} finally {
    rmSync(out, { recursive: true, force: true });
}
