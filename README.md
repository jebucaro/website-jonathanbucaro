# Jonathan Búcaro Website

Personal website built with Hugo and deployed to Firebase Hosting.

## Requirements

- Node.js 24+ (`fnm` reads the version from `.nvmrc`)
- pnpm 10+
- Hugo (extended)

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

## Deployment

GitHub Actions builds, checks, and deploys to Firebase Hosting on pull requests and merges to `main`.
