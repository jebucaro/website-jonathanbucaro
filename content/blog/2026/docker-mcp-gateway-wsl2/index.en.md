---
title: 'Run Docker MCP Gateway in WSL2 without Docker Desktop'
slug: 'docker-mcp-gateway-wsl2-without-docker-desktop'
date: 2026-11-22T10:00:00-06:00
description: 'Run the Docker MCP Gateway on Docker Engine in WSL2, read secrets from a read-only 1Password service account, and connect it to Claude Code.'
draft: false
tags: [windows, wsl, ai-tools, security]
---

I wanted my agents' MCP servers running in containers, isolated, without the GitHub token sitting in plain text in a config file. Docker's {{< extlink href="https://docs.docker.com/ai/mcp-catalog-and-toolkit/get-started/" >}}MCP Gateway{{< /extlink >}} does exactly that, but I assumed it only came with Docker Desktop, which I don't use (I explained why in my [1Password post](/blog/use-1password-in-windows-with-wsl2-dev-containers/)). It doesn't: the gateway is an open source plugin for the Docker CLI, and it runs on Docker Engine inside WSL2.

While I was investigating, I found several guides for this setup, and some of their commands didn't work. In the end I got Claude Code connected to the gateway, with the token fetched from 1Password and without the agent having access to the rest of my vaults. I tested it with Docker Engine 29.10 and `docker mcp` v0.44.3.

{{< figure-dynamic
    light-src="images/docker-mcp-gateway-architecture-light.svg"
    dark-src="images/docker-mcp-gateway-architecture-dark.svg"
    alt="Docker MCP Gateway on WSL2 architecture: Claude Code starts the mcp-gateway wrapper, which reads the GitHub token through Windows op.exe and a read-only 1Password service account, then runs the gateway and the github-official container."
    title="System architecture"
    caption="The wrapper reads the GitHub token from a vault only the service account can see, fails if the token is empty, and then starts the gateway." >}}

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

It should print `v0.44.3`. Check the {{< extlink href="https://github.com/docker/mcp-gateway/releases" >}}releases page{{< /extlink >}} for newer versions, and use `linux-arm64` if you're on ARM.

Some `docker mcp` commands also look for Docker Desktop and fail with "Docker Desktop is not running" even when the daemon is up. The project's README documents an environment variable to skip that check on WSL2 and Docker CE:

```bash
export DOCKER_MCP_IN_CONTAINER=1
```

Add it to your `~/.zshrc` or `~/.bashrc` if you want it available in your terminal. The wrapper we'll create further down already sets it on its own.

## Test the setup with the GitHub server

To test the whole setup I used GitHub's official server, because it needs both a secret and network access. Docker's catalog is an OCI image. Pull it and look for `github-official` (type `/github-official` in `less`):

```bash
docker mcp catalog pull mcp/docker-mcp-catalog
docker mcp catalog show mcp/docker-mcp-catalog | less
```

There's also a server named just `github`, which some examples use, but the catalog lists it as "GitHub (Archived)". The `github-official` entry tells you the secret it expects (`github.personal_access_token`, which reaches the container as `GITHUB_PERSONAL_ACCESS_TOKEN`).

## Find op.exe from WSL

The 1Password CLI for Linux can't talk to the 1Password app on Windows, so from WSL you call the Windows `op.exe` through interop. It wasn't on my WSL `PATH`, so I looked it up in PowerShell:

```powershell
(Get-Command op.exe).Source
```

Then convert that path to WSL format and save it in a variable:

```bash
OP="$(wslpath 'C:\Users\<you>\...\op.exe')"
"$OP" --version
echo "$OP"
```

Save the path that `echo` prints, because the wrapper needs it. Run the next section in the same terminal, or set `OP` again in a new one. Windows programs called from WSL end their output lines with `\r\n`, so you need to clean values with `tr -d '\r'`. They also don't see your Linux environment variables unless you list them in `WSLENV`.

## Give the agent its own vault

You could read the token with your normal `op` session, but I decided against it. The desktop app integration authorizes the CLI for your whole account, and according to 1Password's {{< extlink href="https://www.1password.dev/cli/app-integration-security" >}}security model{{< /extlink >}} that authorization extends to sub-shells of the terminal. An agent running commands from that session could read any item in my account.

So I followed 1Password's {{< extlink href="https://www.1password.dev/sdks/ai-agent" >}}guidance for AI agents{{< /extlink >}}: a vault only for the agent and a service account that can only read it. Service accounts are included in every plan. The 1Password, Families and Teams plans allow 1,000 reads per hour, and the wrapper only does one read each time it starts.

1. In the 1Password app, create a vault named **AI Agents**.
2. Create a {{< extlink href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token" >}}fine-grained personal access token{{< /extlink >}} on GitHub with only the repositories and permissions you want the agent to have, and save it in that vault as an **API Credential** named **GitHub PAT**.
3. Create the service account. This step does use your normal `op` session, one last time:

```bash
"$OP" service-account create "Claude Code MCP Gateway" --vault "AI Agents:read_items" --expires-in 90d
```

The command shows you the token, which starts with `ops_`, only once. Save it to a file only you can read, without leaving it in your shell history (this works in bash and zsh), and clear your terminal afterwards:

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

Only the AI Agents vault shows up.

{{< callout important >}}
When I ran the same command without `WSLENV=...`, it listed every vault in my account (output below). `op.exe` never got the token and used the desktop app integration without any warning. The `/w` at the end of the variable makes it pass from WSL to Windows only.
{{< /callout >}}

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    Private
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
xxxxxxxxxxxxxxxxxxxxxxxxxx    Work
xxxxxxxxxxxxxxxxxxxxxxxxxx    Shared
```

## The wrapper

MCP clients start each server by running a command directly, without going through a shell, so the secret handling has to go in a small script. I saved it as `~/.local/bin/mcp-gateway`. Replace the `op.exe` path with yours and run `chmod +x` on it:

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

The gateway reads `--secrets` once when it starts, so a process substitution works and the GitHub token never touches the disk. The script removes the service account token from the environment before starting the gateway, so neither the gateway nor its containers get it.

I added the `</dev/null` after the first time I connected Claude Code, when it waited 30 seconds and gave up. `op.exe` was inheriting the stdin that Claude Code uses to talk to the gateway, and it swallowed the first message.

{{< callout warning >}}
The gateway doesn't throw an error when it can't read a secrets file. It just starts without the secret, so the wrapper checks that the token isn't empty.
{{< /callout >}}

For that same reason I don't use `--watch`: when the gateway reloads, it reads the secrets again from a stream that's already been read.

Docker's docs set up servers through profiles: you create a profile, add servers to it, and run `docker mcp gateway run --profile <name>`. Those docs assume Docker Desktop. On Docker Engine, a profile looks up its secrets in Docker's {{< extlink href="https://github.com/docker/secrets-engine" >}}Secrets Engine{{< /extlink >}}, whose Docker Engine integration is still experimental: it needs D-Bus and a keyring like GNOME Keyring or KWallet, which a WSL distro doesn't have set up by default, and without them it crashes. On top of that, the gateway doesn't let you pass `--secrets` together with `--profile`. So the wrapper skips profiles and lists the servers directly with `--servers`. The only thing you lose is the gateway's dynamic tools (`mcp-find`, `mcp-add`, `code-mode`), which let the agent search the catalog and add servers in the middle of a conversation. Since the agent has access to my tokens, I prefer a fixed list.

| Configuration                    | Result       | Why                                                                  |
| -------------------------------- | ------------ | -------------------------------------------------------------------- |
| `--servers` + `--secrets <(...)` | What I use   | The gateway reads the stream once at startup. Dynamic tools are off. |
| `--watch` + `--secrets <(...)`   | Avoid it     | On reload, the gateway reads a stream that's already empty.          |
| `--profile` + `--secrets`        | Doesn't work | The two flags can't be combined.                                     |
| `--profile` + Secrets Engine     | Not yet      | On Docker Engine the Secrets Engine is still experimental.           |

A dry run starts the server, lists its tools and exits:

```bash
mcp-gateway --dry-run --verbose 2>&1 | grep -E 'TOKEN|tools listed'
```

```text
    - GITHUB_PERSONAL_ACCESS_TOKEN: gith****
  - Running ghcr.io/github/github-mcp-server with [run --rm -i --init --security-opt no-new-privileges --cpus 1 --memory 2Gb --pull never ... -e GITHUB_PERSONAL_ACCESS_TOKEN]
> 46 tools listed in 694.010041ms
```

If you don't see the masked `gith****`, the token didn't reach the container.

## Connect Claude Code

```bash
claude mcp add --scope user MCP_DOCKER -- mcp-gateway
claude mcp list
```

```text
MCP_DOCKER: mcp-gateway  - ✔ Connected
```

After restarting Claude Code, the GitHub tools show up under `/mcp`.

## Add other servers from the catalog

Once the GitHub server works, you can add others from the catalog, which has more than 300. To list them and see what one of them needs:

```bash
docker mcp catalog server ls mcp/docker-mcp-catalog
docker mcp catalog server inspect mcp/docker-mcp-catalog brave | less
```

In the `inspect` output, the `secrets` field tells you which secrets the server expects. Adding a server means editing the wrapper you saved as `~/.local/bin/mcp-gateway`.

If the server doesn't need any secret, open `~/.local/bin/mcp-gateway` and add the server to the default `MCP_SERVERS` value in the `--servers` line, separated by a comma. I tried it with DuckDuckGo's search server:

```bash
  --servers "${MCP_SERVERS:-github-official,duckduckgo}" \
```

If it does need one, save the credential in the AI Agents vault first. Then edit `~/.local/bin/mcp-gateway` in two places: read the credential with `op.exe` right after the GitHub token check, and add one line per secret to the process substitution in `--secrets`. For Brave Search, which expects `brave.api_key`, these are the changes to `~/.local/bin/mcp-gateway` (lines with `+` are new, lines with `-` are the ones they replace):

```diff
 GITHUB_TOKEN="$("$OP" read "op://$VAULT/GitHub PAT/credential" </dev/null | tr -d '\r')"
 if [[ -z $GITHUB_TOKEN ]]; then
   echo "mcp-gateway: could not read the GitHub token from 1Password" >&2
   exit 1
 fi
+BRAVE_KEY="$("$OP" read "op://$VAULT/Brave Search/credential" </dev/null | tr -d '\r')"
+if [[ -z $BRAVE_KEY ]]; then
+  echo "mcp-gateway: could not read the Brave API key from 1Password" >&2
+  exit 1
+fi
 unset OP_SERVICE_ACCOUNT_TOKEN

 exec docker mcp gateway run \
-  --servers "${MCP_SERVERS:-github-official}" \
-  --secrets <(printf 'github.personal_access_token=%s\n' "$GITHUB_TOKEN") \
+  --servers "${MCP_SERVERS:-github-official,brave}" \
+  --secrets <(printf 'github.personal_access_token=%s\nbrave.api_key=%s\n' "$GITHUB_TOKEN" "$BRAVE_KEY") \
   "$@"
```

Save the file and run the dry run again with `mcp-gateway --dry-run --verbose`. You should see `BRAVE_API_KEY` masked just like the GitHub token. Then restart Claude Code so it starts the gateway with the new servers.

## What this protects and what it doesn't

The GitHub server runs with `no-new-privileges`, one CPU and 2 GB of memory. The token is passed by name (`-e GITHUB_PERSONAL_ACCESS_TOKEN`), so the value doesn't show up in the process list. The gateway also blocks secrets in tool calls and responses by default (`--block-secrets`). None of this ends up in Claude Code's config, my dotfiles or a `.env` file. The token only lives in memory and inside the container. And if the server image itself were compromised, it couldn't read my files. It does have internet access, like any container on Docker's default network.

It doesn't isolate the agent itself. The service account token file can be read by anything running as my user, Claude Code included. Anyone with access to the Docker socket can run `docker inspect` on the container and read the GitHub token, and Claude Code can run `docker`. `op.exe` with the desktop integration is also still available, protected only by 1Password's approval prompt. Once the service account exists, you can turn off **Integrate with 1Password CLI** in **Settings > Developer** if no other tool you use depends on it. And the agent doesn't even need to see the token to misuse it: if it reads an issue or a README with hidden instructions (prompt injection), it can call the GitHub tools directly with whatever permissions the token has.

| Layer                                      | What it limits                                             | What it still allows                                   |
| ------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------ |
| AI Agents vault + service account          | The agent can only read the items in that vault            | Any process running as my user can read the token file |
| Fine-grained GitHub PAT                    | Which repositories and operations the token has            | The agent can use everything the token does allow      |
| Server container                           | The server image can't read my files                       | The container has internet access                      |
| `no-new-privileges`, CPU and memory limits | Privilege escalation and resource use inside the container | Claude Code itself runs without any of these limits    |
| `--block-secrets`                          | Secrets showing up in tool calls and responses             | `docker inspect` on the container shows the token      |
| `--tools` and read-only mode               | Which GitHub tools the agent can call                      | A prompt injection can still use the allowed tools     |

If something leaks, the damage stays small: a fine-grained GitHub token that expires, and read access to a vault that only holds that token instead of my whole 1Password account. So the token's permissions set the limit of what a leak can do, and the gateway's `--tools` flag and the GitHub server's read-only mode can narrow it even more. To isolate the agent itself there's {{< extlink href="https://docs.docker.com/ai/sandboxes/" >}}Docker Sandboxes{{< /extlink >}}, and 1Password's {{< extlink href="https://1password.com/blog/introducing-1password-credential-broker" >}}Credential Broker{{< /extlink >}} looks like a way to drop the service account token. I haven't tried either yet.
