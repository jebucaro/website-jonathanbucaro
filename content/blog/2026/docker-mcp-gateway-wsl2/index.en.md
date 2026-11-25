---
title: 'Run Docker MCP Gateway in WSL2 without Docker Desktop'
slug: 'docker-mcp-gateway-wsl2-without-docker-desktop'
date: 2026-11-22T10:00:00-06:00
description: 'Run the Docker MCP Gateway on Docker Engine in WSL2, read secrets from a read-only 1Password service account, and connect it to Claude Code.'
draft: false
tags: [windows, wsl, ai-tools, security]
---

I wanted my agents' MCP servers running in isolated containers, without my GitHub token sitting in plain text in some config file. Docker's {{< extlink href="https://docs.docker.com/ai/mcp-catalog-and-toolkit/get-started/" >}}MCP Gateway{{< /extlink >}} does exactly that, but I assumed it needed Docker Desktop, which I don't use (I explained why in my [1Password post](/blog/use-1password-in-windows-with-wsl2-dev-containers/)). I was wrong. The gateway is just an open source plugin for the Docker CLI, and Docker Engine inside WSL2 runs it fine.

A few guides I found had commands that didn't work for me, so this is the setup that did. Claude Code talks to the gateway, and the gateway gets the GitHub token from 1Password through an account that can't see the rest of my vaults. I tested it with Docker Engine 29.10 and `docker mcp` v0.44.3.

{{< figure-dynamic
    light-src="images/docker-mcp-gateway-architecture-light.svg"
    dark-src="images/docker-mcp-gateway-architecture-dark.svg"
    alt="Docker MCP Gateway on WSL2 architecture: Claude Code starts the mcp-gateway wrapper, which reads the GitHub token through Windows op.exe and a read-only 1Password service account, then runs the gateway and the github-official container."
    title="System architecture"
    caption="The wrapper reads the GitHub token from a vault only the service account can see, fails if the token is empty, and then starts the gateway." >}}

## What you need

- Docker Engine 29 or later in your WSL2 distro.
- 1Password for Windows and its CLI, installed with the {{< extlink href="https://www.1password.dev/cli/get-started#windows-3" >}}official guide{{< /extlink >}}, with the desktop app integration turned on.
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

## Pick a server to test with

I tested with GitHub's official server because it needs both a secret and network access. Docker's catalog is an OCI image, so pull it and search for `github-official` (type `/github-official` in `less`):

```bash
docker mcp catalog pull mcp/docker-mcp-catalog
docker mcp catalog show mcp/docker-mcp-catalog | less
```

Some examples use a server called just `github`, but the catalog marks it as "GitHub (Archived)". The `github-official` entry also lists the secret it expects, `github.personal_access_token`, which the container gets as `GITHUB_PERSONAL_ACCESS_TOKEN`.

## Find op.exe from WSL

The Linux 1Password CLI can't talk to the 1Password app on Windows, so from WSL you call the Windows `op.exe` instead. It wasn't on my WSL `PATH`, so I looked it up in PowerShell:

```powershell
(Get-Command op.exe).Source
```

Convert that path to WSL format and keep it in a variable:

```bash
OP="$(wslpath 'C:\Users\<you>\...\op.exe')"
"$OP" --version
echo "$OP"
```

Write down what `echo` prints, the wrapper needs it. Keep this terminal open for the next section, or set `OP` again in a new one.

Windows programs called from WSL end their output lines with `\r\n`, which is why you'll see `tr -d '\r'` all over this post. They also can't see your Linux environment variables unless you list them in `WSLENV`.

## Give the agent its own vault

You could read the token with your normal `op` session, but the desktop app integration authorizes the CLI for your whole account. According to 1Password's {{< extlink href="https://www.1password.dev/cli/app-integration-security" >}}security model{{< /extlink >}}, that authorization carries over to sub-shells, so an agent running commands from that terminal could read anything in my account.

So I followed 1Password's {{< extlink href="https://www.1password.dev/sdks/ai-agent" >}}tutorial for AI agents{{< /extlink >}} instead, which comes down to a vault just for the agent and a service account that can only read it. Their {{< extlink href="https://www.1password.dev/get-started/secure-ai-access" >}}secure AI access{{< /extlink >}} guide adds that the secret should only reach the process that needs it and stay out of the model and any config file. Here that process is the GitHub server's container, and Claude Code never sees the token.

Every plan includes service accounts. On the 1Password, Families and Teams plans you get 1,000 reads per hour, and the wrapper uses one each time it starts.

1. In the 1Password app, create a vault named **AI Agents**.
2. Create a {{< extlink href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token" >}}fine-grained personal access token{{< /extlink >}} on GitHub with only the repositories and permissions you want the agent to have. Save it in that vault as an **API Credential** named **GitHub PAT**.
3. Create the service account. This is the last time you use your normal `op` session:

```bash
"$OP" service-account create "Claude Code MCP Gateway" --vault "AI Agents:read_items" --expires-in 90d
```

The command shows the token (it starts with `ops_`) only once. Save it to a file only you can read, without leaving it in your shell history, and clear your terminal afterwards:

```bash
mkdir -p ~/.config/mcp-gateway
(umask 077; printf 'Token: '; read -rs t; printf '%s' "$t" > ~/.config/mcp-gateway/op-service-account-token; echo)
chmod 600 ~/.config/mcp-gateway/op-service-account-token
```

Now check what the service account can see:

```bash
OP_SERVICE_ACCOUNT_TOKEN="$(<~/.config/mcp-gateway/op-service-account-token)" \
  WSLENV=OP_SERVICE_ACCOUNT_TOKEN/w "$OP" vault list </dev/null
```

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
```

Only AI Agents shows up.

{{< callout important >}}
Without `WSLENV=...`, the same command listed every vault in my account. `op.exe` never got the token and quietly fell back to the desktop app integration. The `/w` makes the variable pass from WSL to Windows only.
{{< /callout >}}

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    Private
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
xxxxxxxxxxxxxxxxxxxxxxxxxx    Work
xxxxxxxxxxxxxxxxxxxxxxxxxx    Shared
```

## The wrapper

MCP clients start each server by running a command directly, without a shell, so the secret handling goes in a small script. I saved it as `~/.local/bin/mcp-gateway`. Replace the `op.exe` path with yours and run `chmod +x` on it:

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

`DOCKER_MCP_IN_CONTAINER=1` tells the gateway it isn't running under Docker Desktop. Without it, `gateway run` starts no servers and lists 0 tools, also without an error.

The gateway reads `--secrets` once at startup, so a process substitution is enough and the GitHub token never touches the disk. The script also unsets the service account token before starting the gateway, which keeps it away from the gateway and its containers. I added the `</dev/null` after my first try with Claude Code hung for 30 seconds and gave up, because `op.exe` was inheriting the stdin Claude Code uses to talk to the gateway and swallowed the first message.

{{< callout warning >}}
The gateway doesn't complain when it can't read a secrets file. It just starts without the secret, which is why the wrapper checks that the token isn't empty.
{{< /callout >}}

I also skip `--watch`. On a reload the gateway reads the secrets again from a stream that's already empty, so it comes back up without the token.

Docker's docs configure servers through profiles (`docker mcp gateway run --profile <name>`), but they assume Docker Desktop. On Docker Engine, profiles read secrets from Docker's {{< extlink href="https://github.com/docker/secrets-engine" >}}Secrets Engine{{< /extlink >}}, which is still experimental there and needs D-Bus plus a keyring like GNOME Keyring. A WSL distro doesn't ship either by default, so it crashes, and the gateway won't take `--secrets` and `--profile` together anyway. That leaves `--servers`, which is what the wrapper uses.

You do lose the gateway's dynamic tools (`mcp-find`, `mcp-add`, `code-mode`), which let the agent add servers from the catalog mid-conversation. I'm fine with that, I'd rather an agent holding my tokens stick to a fixed list.

| Configuration                    | Result       | Why                                                         |
| -------------------------------- | ------------ | ----------------------------------------------------------- |
| `--servers` + `--secrets <(...)` | What I use   | The stream is read once at startup. No dynamic tools.       |
| `--watch` + `--secrets <(...)`   | Avoid it     | On reload, the gateway reads a stream that's already empty. |
| `--profile` + `--secrets`        | Doesn't work | The two flags can't be combined.                            |
| `--profile` + Secrets Engine     | Not yet      | Still experimental on Docker Engine.                        |

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

Restart Claude Code and the GitHub tools show up under `/mcp`.

## Add other servers from the catalog

The catalog has more than 300 servers. These two commands list them and show what one needs:

```bash
docker mcp catalog server ls mcp/docker-mcp-catalog
docker mcp catalog server inspect mcp/docker-mcp-catalog brave | less
```

The `secrets` field in the `inspect` output tells you which secrets the server expects. With or without secrets, adding a server means editing the wrapper.

If it doesn't need a secret, just add it to the `--servers` default, separated by a comma. I tried it with DuckDuckGo's search server:

```bash
  --servers "${MCP_SERVERS:-github-official,duckduckgo}" \
```

If it does, save the credential in the AI Agents vault first. Then read it with `op.exe` after the GitHub token check, and add one line per secret to `--secrets`. For Brave Search, which expects `brave.api_key`, the diff looks like this:

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

Run `mcp-gateway --dry-run --verbose` again and you should see `BRAVE_API_KEY` masked like the GitHub token. Then restart Claude Code to pick up the new servers.

## Use the same vault for your CLIs

I use the `gh` CLI more than the GitHub MCP server. I had it wired to a zsh function that read the token from my Private vault through the desktop app, which is the same account-wide access I just avoided for the gateway. My SSH keys were already scoped: `agent.toml` makes the 1Password SSH agent offer only my signing key, as I set up in the [1Password post](/blog/use-1password-in-windows-with-wsl2-dev-containers/). That file only applies to the SSH agent, though. `op read` goes through the CLI integration, which can see the whole account. Claude Code runs `gh` through that function too, so I moved it to the service account.

I created a second fine-grained token for the CLI, saved it in AI Agents as **GitHub CLI**, and added this to `~/.zshenv`:

```zsh
# Read one item through the read-only "AI Agents" service account.
_op_agent_read() {
  local op_bin="${MCP_OP_EXE:-/mnt/c/path/to/op.exe}" sa
  sa="$(<"$HOME/.config/mcp-gateway/op-service-account-token")" || return 1
  OP_SERVICE_ACCOUNT_TOKEN="$sa" WSLENV="${WSLENV:+$WSLENV:}OP_SERVICE_ACCOUNT_TOKEN/w" \
    "$op_bin" read "$1" </dev/null 2>/dev/null | tr -d '\r'
}

typeset -g _GH_TOKEN_CACHE=""
gh() {
  if [[ -z $GH_TOKEN && -z $_GH_TOKEN_CACHE ]]; then
    _GH_TOKEN_CACHE="$(_op_agent_read 'op://AI Agents/GitHub CLI/credential')"
    if [[ -z $_GH_TOKEN_CACHE ]]; then
      print -u2 "gh: could not read 'GitHub CLI' from the AI Agents vault"
      return 1
    fi
  fi
  GH_TOKEN="${GH_TOKEN:-$_GH_TOKEN_CACHE}" command gh "$@"
}
```

It goes in `.zshenv` instead of `.zshrc` so non-interactive shells get it too, and those are the ones Claude Code opens. The token sits in a variable that isn't exported, so only `gh` receives it. If the read fails, the function errors out instead of falling back to the desktop app. With a separate token I can also give the CLI different permissions than the MCP server and revoke one without breaking the other.

In a new terminal, `gh auth status` should show it's using the token:

```text
github.com
  ✓ Logged in to github.com account <you> (GH_TOKEN)
```

Other CLIs follow the same pattern, for example `npm() { NPM_TOKEN="$(_op_agent_read 'op://AI Agents/npm/credential')" command npm "$@" }`. Just remember the agent can read anything in AI Agents, so only put tokens there that you're fine with it using.

With the desktop app, 1Password asked me to approve before handing over the token, which is how 1Password recommends running CLIs through its shell plugins. Now the agent can use `gh` without asking me, and the token's permissions are the only limit. Commands like `timeout gh` or `xargs gh` also skip the function because they call the binary directly, so they run without a token.

## What this protects and what it doesn't

The GitHub server runs with `no-new-privileges`, one CPU and 2 GB of memory. The token is passed by name (`-e GITHUB_PERSONAL_ACCESS_TOKEN`), so it doesn't show up in the process list, and `--block-secrets` (on by default) blocks secrets in tool calls and responses. The token stays in memory and inside the container, so there's no copy in Claude Code's config, my dotfiles or a `.env` file.

Anything running as my user can read the service account token file, Claude Code included. Claude Code can also run `docker`, and anyone with access to the Docker socket can `docker inspect` the container and read the GitHub token. `op.exe` with the desktop integration is still there too, guarded only by 1Password's approval prompt. Once the service account works, you can turn off **Integrate with 1Password CLI** in **Settings > Developer** if nothing else depends on it.

If the agent reads an issue or README with hidden instructions (prompt injection), it can call the GitHub tools with whatever the token allows, without ever seeing the token.

| Layer                                      | What it limits                                             | What it still allows                                   |
| ------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------ |
| AI Agents vault + service account          | The agent can only read the items in that vault            | Any process running as my user can read the token file |
| Fine-grained GitHub PAT                    | Which repositories and operations the token has            | The agent can use everything the token does allow      |
| Server container                           | The server image can't read my files                       | The container has internet access                      |
| `no-new-privileges`, CPU and memory limits | Privilege escalation and resource use inside the container | Claude Code itself runs without any of these limits    |
| `--block-secrets`                          | Secrets showing up in tool calls and responses             | `docker inspect` on the container shows the token      |
| `--tools` and read-only mode               | Which GitHub tools the agent can call                      | A prompt injection can still use the allowed tools     |

If something leaks, what's exposed is a fine-grained token that expires and read access to a vault that only holds the agent's tokens. The token's permissions set the ceiling, and you can lower it with the gateway's `--tools` flag or the GitHub server's read-only mode.

1Password also recommends short-lived tokens, and these aren't (the service account lasts 90 days and the GitHub tokens last as long as you set), so give them a short expiry. Nothing audits what the agent reads either, unless you check the {{< extlink href="https://support.1password.com/reports/" >}}service account usage report{{< /extlink >}} yourself.

To isolate the agent itself there's {{< extlink href="https://docs.docker.com/ai/sandboxes/" >}}Docker Sandboxes{{< /extlink >}}, and 1Password's {{< extlink href="https://1password.com/blog/introducing-1password-credential-broker" >}}Credential Broker{{< /extlink >}} looks like a way to drop the service account token entirely. I haven't tried either yet.
