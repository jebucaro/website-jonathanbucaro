# Jonathan Búcaro Website

Personal website built with Hugo and deployed to Firebase Hosting.

## Requirements

- Node.js 24+ (`.nvmrc` is set to `v24`)
- npm 11+
- Hugo (extended)

## Local development

```bash
nvm use
npm ci
npm run dev
```

## Useful scripts

- `npm run build` - Production build
- `npm run build:staging` - Staging build
- `npm run check` - Format + Markdown lint checks
- `npm run validate` - Check + build

## Deployment

GitHub Actions builds, checks, and deploys to Firebase Hosting on pull requests and merges to `main`.
