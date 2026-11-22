---
title: 'Run Docker MCP Gateway in WSL2 without Docker Desktop'
slug: 'docker-mcp-gateway-wsl2-without-docker-desktop'
date: 2026-11-22T10:00:00-06:00
description: 'Run the Docker MCP Gateway on Docker Engine in WSL2, read secrets from a read-only 1Password service account, and connect it to Claude Code.'
draft: false
tags: [windows, wsl, ai-tools, security]
---

I wanted my agents' MCP servers running in containers, isolated, without the GitHub token sitting in plain text in a config file. Docker's {{< extlink href="https://docs.docker.com/ai/mcp-catalog-and-toolkit/get-started/" >}}MCP Gateway{{< /extlink >}} does exactly that, but I assumed it only came with Docker Desktop, which I don't use (I explained why in my [1Password post](/blog/use-1password-in-windows-with-wsl2-dev-containers/)). It doesn't: the gateway is an open source plugin for the Docker CLI, and it runs on Docker Engine inside WSL2.

While I was investigating, I found several guides for this setup, and some of their commands didn't work. This is how it ended up working for me, with Claude Code connected and the token coming from 1Password without access to the rest of my vaults. I tested it with Docker Engine 29.10 and `docker mcp` v0.44.3.

{{< figure-dynamic
    light-src="images/docker-mcp-gateway-architecture-light.svg"
    dark-src="images/docker-mcp-gateway-architecture-dark.svg"
    alt="Docker MCP Gateway on WSL2 architecture"
    title="System Architecture" >}}

## What you need

- Docker Engine 29 or later in your WSL2 distro.
- 1Password for Windows and the 1Password CLI for Windows, installed with the {{< extlink href="https://www.1password.dev/cli/get-started#windows-3" >}}official guide{{< /extlink >}}, with the desktop app integration turned on.
- {{< extlink href="https://docs.anthropic.com/en/docs/claude-code/overview" >}}Claude Code{{< /extlink >}} installed in WSL.
- A GitHub account where you can create a fine-grained personal access token.

## Install the plugin

The plugin is a single binary that goes in the Docker CLI plugins folder:

```bash
mkdir -p ~/.docker/cli-plugins
curl -sL https://github.com/docker/mcp-gateway/releases/download/v0.44.3/docker-mcp-linux-amd64.tar.gz \
  | tar -xz -C ~/.docker/cli-plugins docker-mcp
docker mcp version
```

It prints `v0.44.3`. The guides I found download from `releases/latest/download/...`, and that URL returns a 404: every release on the {{< extlink href="https://github.com/docker/mcp-gateway/releases" >}}releases page{{< /extlink >}} is marked as a pre-release, so GitHub has no "latest", and the file is a `.tar.gz`. Check that page for newer versions, and use `linux-arm64` on ARM.

Some `docker mcp` commands also look for Docker Desktop and fail with "Docker Desktop is not running" even when the daemon is up. The project's README documents the variable that skips that check on WSL2 and Docker CE:

```bash
export DOCKER_MCP_IN_CONTAINER=1
```

Add it to your `~/.zshrc` or `~/.bashrc` if you want it in your terminal. The wrapper further down sets it on its own.

## Pick the GitHub server

Docker's catalog is an OCI image. Pull it and look for `github-official` (type `/github-official` in `less`):

```bash
docker mcp catalog pull mcp/docker-mcp-catalog
docker mcp catalog show mcp/docker-mcp-catalog | less
```

There's also a server named just `github`, which some examples use, but the catalog lists it as "GitHub (Archived)". The `github-official` entry tells you the secret it expects (`github.personal_access_token`, which reaches the container as `GITHUB_PERSONAL_ACCESS_TOKEN`) and the hosts it needs: `api.github.com`, `github.com` and `raw.githubusercontent.com`. The gateway only enforces that list when you run it with `--block-network`, which is off by default, so the wrapper turns it on.

## Find op.exe from WSL

The 1Password CLI for Linux can't talk to the 1Password app on Windows, so from WSL you call the Windows `op.exe` through interop. It wasn't on my WSL `PATH`, so I looked it up in PowerShell:

```powershell
(Get-Command op.exe).Source
```

Then convert that path in WSL and keep it in a variable:

```bash
OP="$(wslpath 'C:\Users\<you>\...\op.exe')"
"$OP" --version
echo "$OP"
```

Keep the path that `echo` prints, the wrapper needs it. Run the next section in the same terminal, or set `OP` again in a new one. Two things to keep in mind with Windows programs called from WSL: their output ends lines with `\r\n`, so values need `tr -d '\r'`, and they don't see your Linux environment variables unless you list them in `WSLENV`.

## Give the agent its own vault

The easy option is to read the token with your normal `op` session, and I didn't want that. The desktop app integration authorizes the CLI for your whole account, and according to 1Password's {{< extlink href="https://www.1password.dev/cli/app-integration-security" >}}security model{{< /extlink >}} that authorization extends to sub-shells of the terminal. An agent running commands from that session could read any item I have.

So I followed 1Password's {{< extlink href="https://www.1password.dev/sdks/ai-agent" >}}guidance for AI agents{{< /extlink >}}: a vault only for the agent and a service account that can only read it. Service accounts are included in every plan. The 1Password, Families and Teams plans allow 1,000 reads per hour, and the wrapper reads once each time it starts.

1. In the 1Password app, create a vault named **AI Agents**.
2. Create a {{< extlink href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token" >}}fine-grained personal access token{{< /extlink >}} on GitHub with only the repositories and permissions you want the agent to have, and save it in that vault as an **API Credential** named **GitHub PAT**.
3. Create the service account, which uses your normal session one last time:

```bash
"$OP" service-account create "Claude Code MCP Gateway" --vault "AI Agents:read_items" --expires-in 90d
```

It prints a token that starts with `ops_` only once. Save it to a file only you can read, without leaving it in your shell history (this works in bash and zsh), and clear your terminal afterwards:

```bash
mkdir -p ~/.config/mcp-gateway
(umask 077; printf 'Token: '; read -rs t; printf '%s' "$t" > ~/.config/mcp-gateway/op-service-account-token; echo)
chmod 600 ~/.config/mcp-gateway/op-service-account-token
```

Then check what the service account can see:

```bash
OP_SERVICE_ACCOUNT_TOKEN="$(<~/.config/mcp-gateway/op-service-account-token)" \
  WSLENV=OP_SERVICE_ACCOUNT_TOKEN/w "$OP" vault list </dev/null
```

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
```

Only the AI Agents vault. When I ran the same command without `WSLENV=...`, it listed every vault in my account: `op.exe` never got the token and quietly fell back to the desktop app. The `/w` flag passes the variable from WSL to Windows only.

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    Private
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
xxxxxxxxxxxxxxxxxxxxxxxxxx    Work
xxxxxxxxxxxxxxxxxxxxxxxxxx    Shared
```

## The wrapper

MCP clients start a server by running a command directly, without a shell, so the secret handling goes in a small script. I saved it as `~/.local/bin/mcp-gateway`. Replace the `op.exe` path with yours and run `chmod +x` on it:

```bash
#!/usr/bin/env bash
# Docker MCP Gateway on WSL2 Docker Engine, no Docker Desktop.
set -euo pipefail

export DOCKER_MCP_IN_CONTAINER=1

OP="${MCP_OP_EXE:-/mnt/c/path/to/op.exe}"
VAULT="${MCP_OP_VAULT:-AI Agents}"
SA_TOKEN_FILE="${MCP_OP_SA_TOKEN_FILE:-$HOME/.config/mcp-gateway/op-service-account-token}"

# op.exe only sees WSL variables listed in WSLENV (/w = WSL to Windows).
OP_SERVICE_ACCOUNT_TOKEN="$(<"$SA_TOKEN_FILE")"
export OP_SERVICE_ACCOUNT_TOKEN
export WSLENV="${WSLENV:+$WSLENV:}OP_SERVICE_ACCOUNT_TOKEN/w"

# </dev/null: op.exe must not read the MCP client's stdin.
GITHUB_TOKEN="$("$OP" read "op://$VAULT/GitHub PAT/credential" </dev/null | tr -d '\r')"
if [[ -z $GITHUB_TOKEN ]]; then
  echo "mcp-gateway: could not read the GitHub token from 1Password" >&2
  exit 1
fi
unset OP_SERVICE_ACCOUNT_TOKEN

exec docker mcp gateway run \
  --servers "${MCP_SERVERS:-github-official}" \
  --block-network \
  --secrets <(printf 'github.personal_access_token=%s\n' "$GITHUB_TOKEN") \
  "$@"
```

The gateway reads `--secrets` once when it starts, so a process substitution works and the GitHub token never touches the disk. The service account token is removed before the gateway starts, so neither the gateway nor its containers get it.

The `</dev/null` came from the first time I connected Claude Code: it waited 30 seconds and gave up. `op.exe` was inheriting the stdin that Claude Code uses to talk to the gateway, and it swallowed the first message. The empty-token check is there because the gateway doesn't complain when it can't read a secrets file, it just starts without the secret. For the same reason I don't use `--watch`: a reload would read the secrets again from a stream that's already been read.

Docker's docs organize servers into profiles, but `--profile` can't be combined with `--secrets`, and on Docker Engine profile secrets depend on the {{< extlink href="https://github.com/docker/secrets-engine" >}}Secrets Engine{{< /extlink >}}, which is still experimental there. With `--servers` I skip profiles, and the gateway turns off its dynamic tools.

A dry run starts the server, lists its tools and exits:

```bash
mcp-gateway --dry-run --verbose 2>&1 | grep -E 'TOKEN|tools listed'
```

```text
    - GITHUB_PERSONAL_ACCESS_TOKEN: gith****
  - Running ghcr.io/github/github-mcp-server with [run --rm -i --init --security-opt no-new-privileges --cpus 1 --memory 2Gb --pull never ... --network docker-mcp-proxies-int ... -e https_proxy=docker-mcp-l7proxy-...:8080 -e GITHUB_PERSONAL_ACCESS_TOKEN]
> 46 tools listed in 3.426928878s
```

If you don't see the masked `gith****`, the token didn't arrive.

## Connect Claude Code

```bash
claude mcp add --scope user MCP_DOCKER -- mcp-gateway
claude mcp list
```

```text
MCP_DOCKER: mcp-gateway  - ✔ Connected
```

After restarting Claude Code, the GitHub tools show up under `/mcp`.

## What this protects and what it doesn't

The GitHub server runs with `no-new-privileges`, one CPU and 2 GB of memory. The token is passed by name (`-e GITHUB_PERSONAL_ACCESS_TOKEN`), so the value doesn't show up in the process list. With `--block-network`, the container sits on an internal Docker network (`docker-mcp-proxies-int`) with no route out, and reaches the internet through an L7 proxy that only allows the three GitHub hosts. That adds about two seconds to startup. The gateway also blocks secrets in tool calls and responses by default (`--block-secrets`).

It doesn't isolate the agent itself. The service account token file can be read by anything running as my user, Claude Code included. Anyone with access to the Docker socket can run `docker inspect` on the container and read the GitHub token, and Claude Code can run `docker`. `op.exe` with the desktop integration is also still there, behind 1Password's approval prompt; once the service account exists, you can turn off **Integrate with 1Password CLI** in **Settings > Developer** if nothing else you use needs it.

What I gain is that a leak costs much less: a fine-grained GitHub token that expires and read access to a vault that only holds that token, not my whole 1Password account. The gateway's `--tools` flag and the GitHub server's read-only mode can narrow it further. Isolating the agent itself is what {{< extlink href="https://docs.docker.com/ai/sandboxes/" >}}Docker Sandboxes{{< /extlink >}} is for, and 1Password's {{< extlink href="https://1password.com/blog/introducing-1password-credential-broker" >}}Credential Broker{{< /extlink >}} looks like a way to drop the service account token. I haven't tried either yet.
