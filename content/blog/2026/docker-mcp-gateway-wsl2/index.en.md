---
title: 'Run Docker MCP Gateway in WSL2 without Docker Desktop'
slug: 'docker-mcp-gateway-wsl2-without-docker-desktop'
date: 2026-11-22T16:00:00-06:00
description: 'Run the Docker MCP Gateway on Docker Engine in WSL2, read secrets from a read-only 1Password service account, and connect it to Claude Code.'
draft: false
tags: [windows, wsl, ai-tools, security]
---

MCP servers give an AI agent tools, and every tool needs access to something: a GitHub token, an API key, your file system. Docker's {{< extlink href="https://docs.docker.com/ai/mcp-catalog-and-toolkit/get-started/" >}}MCP Gateway{{< /extlink >}} runs each server in its own container with limited privileges, CPU, memory and network, and hands it only the secrets it declares. That isolation is what I wanted for my agents, and I assumed it was a Docker Desktop feature, since that's where the MCP Toolkit lives.

It isn't. The gateway is the open source `docker mcp` CLI plugin, and it runs on plain Docker Engine. I don't use Docker Desktop (I explained why in my [1Password with WSL2 Dev Containers post]({{< relref "blog/2026/use-1password-in-windows-with-wsl2-devcontainers" >}})), so everything here runs on Docker Engine inside WSL2 on Windows 11.

The guides I found for this setup had wrong commands and missed a few traps, so every step below was tested on Docker Engine 29.10 with `docker mcp` v0.44.3. At the end you'll have Claude Code connected to the gateway, running the official GitHub MCP server in a container, with its token read from a 1Password service account that can only see one vault.

{{< figure-dynamic
    light-src="images/docker-mcp-gateway-architecture-light.svg"
    dark-src="images/docker-mcp-gateway-architecture-dark.svg"
    alt="Docker MCP Gateway on WSL2 architecture"
    title="System Architecture" >}}

## Setup

### Prerequisites

- Docker Engine 29 or later installed in your WSL2 distro (not Docker Desktop).
- 1Password for Windows and the 1Password CLI for Windows, installed with the {{< extlink href="https://www.1password.dev/cli/get-started#windows-3" >}}official guide{{< /extlink >}}, with the desktop app integration turned on.
- {{< extlink href="https://docs.anthropic.com/en/docs/claude-code/overview" >}}Claude Code{{< /extlink >}} installed in WSL.
- A GitHub account where you can create a fine-grained personal access token.

### Step 1: install the plugin

The plugin is a single binary that goes in the Docker CLI plugins folder:

```bash
mkdir -p ~/.docker/cli-plugins
curl -sL https://github.com/docker/mcp-gateway/releases/download/v0.44.3/docker-mcp-linux-amd64.tar.gz \
  | tar -xz -C ~/.docker/cli-plugins docker-mcp
docker mcp version
```

It should print `v0.44.3`. Check the {{< extlink href="https://github.com/docker/mcp-gateway/releases" >}}releases page{{< /extlink >}} for a newer version, and use `linux-arm64` on ARM.

{{< callout warning >}}
Some guides download from `releases/latest/download/docker-mcp-linux-amd64`. That URL returns a 404: every release is marked as a pre-release, so GitHub has no "latest", and the asset is a `.tar.gz`, not a bare binary.
{{< /callout >}}

### Step 2: skip the Docker Desktop check

Out of the box, some `docker mcp` commands look for Docker Desktop and fail with "Docker Desktop is not running" even though the daemon is up. The project's README documents the switch for WSL2 and Docker CE:

```bash
export DOCKER_MCP_IN_CONTAINER=1
```

Add it to your `~/.zshrc` or `~/.bashrc` for interactive use. The wrapper in Step 6 sets it on its own.

### Step 3: pick a server from the catalog

Docker's catalog is an OCI image. Pull it and look up the GitHub server:

```bash
docker mcp catalog pull mcp/docker-mcp-catalog
docker mcp catalog show mcp/docker-mcp-catalog | less
```

Search for `github-official` (type `/github-official` in `less`). The entry tells you the two things you need: the secret name (`github.personal_access_token`, passed to the container as `GITHUB_PERSONAL_ACCESS_TOKEN`) and the hosts the container is allowed to reach: `api.github.com`, `github.com` and `raw.githubusercontent.com`. Nothing else.

{{< callout note >}}
Use `github-official`. The catalog also has a server named `github`, which some examples still use, but it's listed as "GitHub (Archived)".
{{< /callout >}}

### Step 4: reach op.exe from WSL

The 1Password CLI for Linux can't talk to the 1Password app on Windows, so from WSL you call the Windows `op.exe` through interop. It's usually not on the WSL `PATH`. In PowerShell, find where it is:

```powershell
(Get-Command op.exe).Source
```

Then convert that path in WSL and keep it in a variable for the next steps:

```bash
OP="$(wslpath 'C:\Users\<you>\...\op.exe')"
"$OP" --version
```

Two things to keep in mind with any Windows program called from WSL: its output ends lines with `\r\n`, so pipe values through `tr -d '\r'`, and it doesn't see your Linux environment variables unless you list them in `WSLENV`. That second one matters in the next step.

### Step 5: give the agent its own vault

The simple option is to read the token with your normal `op` session. Don't. The desktop app integration authorizes the CLI for your **whole account**, and on Linux and macOS that authorization extends to sub-shells of the terminal (see 1Password's {{< extlink href="https://www.1password.dev/cli/app-integration-security" >}}security model{{< /extlink >}}). An agent running shell commands from that session can read any item you have, not just the GitHub token.

Instead, follow 1Password's {{< extlink href="https://www.1password.dev/sdks/ai-agent" >}}guidance for AI agents{{< /extlink >}}: a dedicated vault and a service account that can only read it. Service accounts are included in every plan, with rate limits (1,000 reads per hour outside Business), and the wrapper only reads once per start.

1. In the 1Password app, create a vault named **AI Agents**.
2. Create a {{< extlink href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token" >}}fine-grained personal access token{{< /extlink >}} on GitHub, limited to the repositories and permissions you want the agent to have. Save it in the new vault as an **API Credential** named **GitHub PAT**.
3. Create the service account. This uses your normal session one last time:

```bash
"$OP" service-account create "Claude Code MCP Gateway" --vault "AI Agents:read_items" --expires-in 90d
```

It prints a token that starts with `ops_` only once. Save it to a file that only you can read, without leaving it in your shell history (this works in bash and zsh):

```bash
mkdir -p ~/.config/mcp-gateway
printf 'Token: '; read -rs t; printf '%s' "$t" > ~/.config/mcp-gateway/op-service-account-token; unset t; echo
chmod 600 ~/.config/mcp-gateway/op-service-account-token
```

Clear your terminal afterwards, since the token is still in the scrollback. Now check what the service account can see:

```bash
OP_SERVICE_ACCOUNT_TOKEN="$(<~/.config/mcp-gateway/op-service-account-token)" \
  WSLENV=OP_SERVICE_ACCOUNT_TOKEN/w "$OP" vault list </dev/null
```

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
```

{{< callout warning >}}
Run the same command without `WSLENV=...` and you get **every** vault in your account. `op.exe` never received the token, so it quietly fell back to the desktop app. The `/w` flag passes the variable from WSL to Windows only; `/u` goes the other way.

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    Private
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
xxxxxxxxxxxxxxxxxxxxxxxxxx    Work
xxxxxxxxxxxxxxxxxxxxxxxxxx    Shared
```

{{< /callout >}}

### Step 6: write the wrapper

MCP clients start a server by running a command directly, without a shell, so the secret handling goes in a small script. Save it as `~/.local/bin/mcp-gateway` (or any folder on your `PATH`), replace the `op.exe` path with yours from Step 4, and run `chmod +x` on it:

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
  --secrets <(printf 'github.personal_access_token=%s\n' "$GITHUB_TOKEN") \
  "$@"
```

The gateway reads `--secrets` once at startup, so a process substitution works and the GitHub token never touches the disk. The service account token is removed from the environment before the gateway starts, so neither the gateway nor its containers inherit it. Test it with a dry run, which starts the server, lists its tools and exits:

```bash
mcp-gateway --dry-run --verbose 2>&1 | grep -E 'TOKEN|tools listed'
```

```text
    - GITHUB_PERSONAL_ACCESS_TOKEN: gith****
  - Running ghcr.io/github/github-mcp-server with [run --rm -i --init --security-opt no-new-privileges --cpus 1 --memory 2Gb --pull never ... -e GITHUB_PERSONAL_ACCESS_TOKEN]
> 46 tools listed in 1.025223625s
```

{{< callout warning >}}
Keep the `</dev/null` on the `op.exe` call. Without it, `op.exe` inherits the stdin that the MCP client uses to talk to the gateway and swallows its first `initialize` message. The dry run still works, because there's no client, but Claude Code times out after 30 seconds.
{{< /callout >}}

{{< callout caution >}}
If the gateway can't read a secrets file, it starts anyway without the secret and doesn't warn you. That's why the wrapper checks the token before starting, and why the dry run's masked `gith****` line is worth looking for. Also leave out `--watch`: a reload would read the secrets again from a stream that's already used up.
{{< /callout >}}

### Step 7: connect Claude Code

Register the wrapper for all your projects and check the connection:

```bash
claude mcp add --scope user MCP_DOCKER -- mcp-gateway
claude mcp list
```

```text
MCP_DOCKER: mcp-gateway  - ✔ Connected
```

Restart Claude Code and the GitHub tools show up under `/mcp`.

## How it works

When Claude Code starts, it runs `mcp-gateway` and talks to it over stdin and stdout. The wrapper passes the service account token to `op.exe`, which reads one item from the AI Agents vault, and then hands the GitHub token to `docker mcp gateway run`. The gateway starts the `github-official` container with:

- `--security-opt no-new-privileges`, `--cpus 1` and `--memory 2Gb`.
- The token as an environment variable passed by name (`-e GITHUB_PERSONAL_ACCESS_TOKEN`), so the value doesn't show up in the process list.
- Network access only to the three GitHub hosts from the catalog.

The gateway also blocks secrets in tool calls and responses by default (`--block-secrets`), and it's the only thing Claude Code sees: one MCP server, whatever runs behind it.

## What the agent can still reach

This setup limits what each MCP server can do. It doesn't sandbox the agent itself, and it's worth being clear about that:

- The service account token file is readable by anything running as your user, including Claude Code.
- Anyone with access to the Docker socket can run `docker inspect` on the GitHub container and read the token from its environment, and Claude Code can run `docker`.

What you gain is a smaller blast radius. If the agent or a tool leaks something, it's a fine-grained, expiring GitHub token and read access to one vault that holds only that token, not your whole 1Password account. You can tighten it further with the gateway's `--tools` flag, which exposes only the tools you list, and with the GitHub server's read-only mode.

Isolating the agent itself is the next step, and that's what {{< extlink href="https://docs.docker.com/ai/sandboxes/" >}}Docker Sandboxes{{< /extlink >}} is for. 1Password's {{< extlink href="https://1password.com/blog/introducing-1password-credential-broker" >}}Credential Broker{{< /extlink >}} also looks like a way to drop the service account token. I haven't tried either yet.

## What about profiles?

Docker's docs organize servers into profiles (`docker mcp profile create`), and you'll see guides combining `--profile` with `--secrets`. On Docker Engine that doesn't work:

- The gateway rejects it: `cannot use --profile with ... --secrets`.
- With profiles, secrets are `se://` references that Docker's Secrets Engine resolves when the container starts. It ships with Docker Desktop; on Docker CE it's a separate, {{< extlink href="https://github.com/docker/secrets-engine" >}}experimental{{< /extlink >}} install that needs a Linux keyring.
- Profiles also have to be enabled first with `docker mcp feature enable profiles`, and a profile created with `--name dev-tools` gets the ID `dev_tools`, which is what the other commands expect.

I stayed with `--servers`, which skips profiles completely. The only thing you give up is dynamic tools, which the gateway turns off with that flag.

## Check that it works

1. `mcp-gateway --dry-run --verbose` shows `gith****` and the tool count.
2. The `vault list` check from Step 5 shows only **AI Agents**.
3. `claude mcp list` shows `MCP_DOCKER` as connected.
4. In Claude Code, `/mcp` lists `MCP_DOCKER` with the GitHub tools.
