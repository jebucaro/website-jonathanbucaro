# Jonathan Búcaro Website

Personal website built with Hugo and deployed to Firebase Hosting.

## Requirements

- Node.js 24+ (`fnm` reads the version from `.nvmrc`)
- pnpm 12 (pinned in `package.json` under `packageManager`)
- Hugo (extended)

Sass is compiled with Dart Sass, which `pnpm install` provides through the `sass-embedded` package. Run Hugo through pnpm (`pnpm dev`, `pnpm build`, or `pnpm exec hugo ...`); a bare `hugo` command can't find Dart Sass and fails to build the stylesheet.

## Dev Container

`.devcontainer/` has everything above preinstalled (Node 24, pnpm via Corepack, Hugo extended, `openssh-client`). In VS Code, run **Dev Containers: Reopen in Container**; `pnpm install` runs on creation and port 1313 is forwarded for `pnpm dev`. The container keeps its own `node_modules` in a Docker volume, so it never conflicts with the one on your machine.

The Hugo version lives in `.hugo-version`, which CI and the container both read. Bump it there, and match your local Hugo to it.

The container doesn't mount any SSH agent socket. VS Code forwards `SSH_AUTH_SOCK` from WSL on its own, which is how the signing setup in the 1Password blog post reaches the container. `allowed-signers.sh` rebuilds the allowed signers file so signatures verify inside it.

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
- `node scripts/check-hero.mjs` - The homepage hero has no image preload, a headline-only `<h1>`, and a terminal listing the latest work items
- `node scripts/check-structured-data.mjs` - The JSON-LD Person/WebSite/ProfilePage graph and `/llms.txt` are consistent

## Deployment

GitHub Actions builds and checks every pull request and deploys it to a Firebase Hosting preview channel. Merges to `main` deploy to the live site.
