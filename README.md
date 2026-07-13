# Jonathan Búcaro Website

Personal website built with Hugo and deployed to Firebase Hosting.

## Requirements

- Node.js 24+ (`.nvmrc` is set to `v24`)
- pnpm 10+
- Hugo (extended)

## Dev container (recommended)

A dev container is available at `.devcontainer/devcontainer.json`. It provides Node.js 24 and Hugo extended — no local tooling required beyond VS Code and a container runtime. It works with Docker Desktop (Windows/macOS) or Docker/Podman (Linux); Podman users should set `"dev.containers.dockerPath": "podman"` in their VS Code user settings.

**Git, SSH, and commit signing**
VS Code copies your host `~/.gitconfig` into the container automatically, and forwards your local SSH agent — so SSH auth and SSH commit signing work with keys held in 1Password (or any other agent) without extra setup:

- Windows: enable **Settings → Developer → Use the SSH agent** in 1Password (or run the Windows OpenSSH `ssh-agent` service).
- Linux/macOS: make sure `SSH_AUTH_SOCK` points at your agent (1Password sets this up when its SSH agent is enabled).

Host-OS-specific programs in your gitconfig (e.g. `op-ssh-sign`, a Windows `ssh.exe` path) can't run inside the container, so `containerEnv` overrides `core.sshCommand` and `gpg.ssh.program` with `GIT_CONFIG_*` variables; signing goes through the forwarded agent instead (`ssh-keygen -Y sign`). Private keys never enter the container. Without an agent, everything except SSH push/pull and signing still works.

**node_modules**
Lives in a named Docker volume for native-speed installs (bind mounts are slow on Windows/macOS). The `node_modules/` directory on the host stays empty; run `pnpm install` on the host if you also work outside the container.

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
