# Jonathan Búcaro Website

Personal website built with Hugo and deployed to Firebase Hosting.

## Requirements

- Node.js 24+ (`.nvmrc` is set to `v24`)
- pnpm 10+
- Hugo (extended)

## Dev container (recommended)

A dev container is available at `.devcontainer/devcontainer.json`. It provides Node.js 24 and Hugo extended — no local tooling required beyond VS Code and a container runtime.

The configuration assumes **Podman** and **1Password SSH agent**. If your setup differs:

**Using Docker instead of Podman**
Point the VS Code Dev Containers extension to Docker by setting `"docker.dockerPath": "docker"` in your VS Code user settings, or configure `DOCKER_HOST` to your Docker socket. No changes to `devcontainer.json` are needed.

**Not using 1Password**
Remove the two 1Password-specific mounts and the `SSH_AUTH_SOCK` env from `devcontainer.json`:

```json
"mounts": [
    // remove these two lines:
    "source=/opt/1Password/op-ssh-sign,target=/opt/1Password/op-ssh-sign,type=bind,readonly",
    "source=${localEnv:HOME}/.1password/agent.sock,target=/root/.1password/agent.sock,type=bind",
    // keep this one:
    "source=${localEnv:HOME}/.gitconfig,target=/root/.gitconfig-host,type=bind,readonly"
],
// remove this block entirely:
"remoteEnv": {
    "SSH_AUTH_SOCK": "/root/.1password/agent.sock"
}
```

To forward your system SSH agent instead, add this to `remoteEnv`:

```json
"remoteEnv": {
    "SSH_AUTH_SOCK": "${localEnv:SSH_AUTH_SOCK}"
}
```

## Local development (without dev container)

```bash
nvm use
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
