# Jonathan Búcaro Website

Personal website built with Hugo and deployed to Firebase Hosting.

## Requirements

- Node.js 24+ (`fnm` reads the version from `.nvmrc`)
- pnpm 12 (pinned in `package.json` under `packageManager`)
- Hugo (extended)

Sass is compiled with Dart Sass, which `pnpm install` provides through the `sass-embedded` package. Run Hugo through pnpm (`pnpm dev`, `pnpm build`, or `pnpm exec hugo ...`); a bare `hugo` command can't find Dart Sass and fails to build the stylesheet.

## Local development

On Windows, initialize `fnm` when PowerShell starts by adding this line to `$PROFILE`:

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```

Open a new terminal, then run:

```bash
fnm use
node --version
pnpm install
pnpm dev
```

## Useful scripts

- `pnpm build` - Production build
- `pnpm build:staging` - Staging build
- `pnpm check` - Format + Markdown lint checks
- `pnpm fix` - Format + Markdown lint auto-fixes
- `pnpm clean` - Remove `public/` and `resources/`
- `pnpm validate` - Check + build

After a build, CI also runs these checks against `public/`:

- `node scripts/check-csp-hashes.mjs` - Inline script hashes match the Content Security Policy
- `node scripts/check-hero-preload.mjs` - The homepage hero preload matches its image `srcset`

## Deployment

GitHub Actions builds and checks every pull request and deploys it to a Firebase Hosting preview channel. Merges to `main` deploy to the live site.
