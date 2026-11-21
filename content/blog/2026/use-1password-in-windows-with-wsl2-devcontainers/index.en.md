---
title: 'Use 1Password in Windows with WSL2 Dev Containers'
slug: 'use-1password-in-windows-with-wsl2-dev-containers'
date: 2026-01-15T06:57:56-06:00
lastmod: 2026-11-20T12:00:00-06:00
description: 'A step-by-step guide to configuring 1Password as your unified SSH and Git signing agent across Windows, WSL2, and VS Code Dev Containers.'
draft: false
tags: [windows, wsl]
image: 'images/cover.png'
---

Docker Desktop is only free for personal use, education, non-commercial open source and small businesses, and as a contractor my work didn't always fit those cases. So I installed Docker directly in the WSL distro and moved all my development into Dev Containers inside WSL2, which also kept my code isolated from the Windows side. The problem I ran into was signing commits. I use the 1Password SSH agent on Windows with Windows Hello, and the setup I found points `.gitconfig` at `op-ssh-sign.exe` through `/mnt/c/` or through interop, but that only works in WSL itself. Inside a container that path doesn't exist, and containers can't see Windows mounts or named pipes.

The fix is a small bridge: `socat` and `npiperelay` expose the Windows 1Password agent as a Unix socket in WSL, and the containers use that socket. You get biometric signing with Windows Hello for GitHub, GitLab, or Azure DevOps, no private keys in `~/.ssh/` on Linux, only the key you choose exposed by the agent, and one signing key that works the same in WSL and in any Dev Container.

If you only work in WSL, 1Password's own {{< extlink href="https://developer.1password.com/docs/ssh/integrations/wsl/" >}}WSL integration{{< /extlink >}} is simpler. It relies on Windows interop, which containers don't have, so here we build the bridge.

{{< figure-dynamic
    light-src="images/1password-ssh-agent-architecture-light.svg"
    dark-src="images/1password-ssh-agent-architecture-dark.svg"
    alt="1Password SSH agent system architecture"
    title="System Architecture" >}}

## Setup

### Prerequisites

- Git in WSL, with your {{< extlink href="https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup" >}}global user name and email{{< /extlink >}} configured.
- 1Password 8+ for Windows (with Windows Hello configured).
- WSL 2 with `systemd` enabled. If you installed Ubuntu via `wsl --install`, systemd is enabled by default; otherwise follow the {{< extlink href="https://learn.microsoft.com/en-us/windows/wsl/systemd" >}}official documentation{{< /extlink >}}.
- `npiperelay`, installed with winget from the {{< extlink href="https://github.com/albertony/npiperelay" >}}albertony/npiperelay{{< /extlink >}} fork, which keeps the original project built and patched. In PowerShell, run `winget install albertony.npiperelay --source winget`. The service file in Step 2 points to the install path, so the folder doesn't need to be on your `%PATH%`.

### Step 1: configure the Windows host

In 1Password, go to **Settings > Developer** and check **Use the 1Password SSH agent**, following the official {{< extlink href="https://developer.1password.com/docs/ssh/get-started/" >}}1Password guide{{< /extlink >}}. Also check **Keep 1Password in the notification area** under **Settings > General**, so the agent keeps running when you close the window.

Windows ships its own OpenSSH agent, which competes with 1Password for the `\\.\pipe\openssh-ssh-agent` pipe. In an administrator PowerShell, stop it and disable it. If the service doesn't exist, skip this:

```powershell
Stop-Service ssh-agent
Set-Service ssh-agent -StartupType Disabled
```

Anything that can reach the agent can ask it to sign, so expose as little as possible. Create an SSH key in 1Password just for signing, in a vault just for development, and tell the agent to offer only that key. Create `%LOCALAPPDATA%\1Password\config\ssh\agent.toml`:

```toml
[[ssh-keys]]
item = "Git Signing Key"
vault = "Dev"
```

Once this file exists the agent offers only the keys it lists. Lock and unlock 1Password to reload it. The {{< extlink href="https://developer.1password.com/docs/ssh/agent/config/" >}}agent config docs{{< /extlink >}} cover the full syntax.

From 1Password's side, every request through the bridge comes from `npiperelay.exe`, so one approval covers everything in WSL that uses the socket until the session ends. If you can live with a Windows Hello prompt on each commit, choose the per-request approval option under **Settings > Developer**, and never tick **Approve for all applications** on a prompt. The {{< extlink href="https://developer.1password.com/docs/ssh/agent/security/" >}}agent security docs{{< /extlink >}} describe the options.

Open a Windows PowerShell and verify the agent is working:

```powershell
ssh-add -l
```

You should see only your signing key.

### Step 2: create the WSL bridge

Install `socat` in WSL to handle the socket relay:

```bash
sudo apt update && sudo apt install socat -y
```

Create the local user directory for systemd services if it doesn't already exist:

```bash
mkdir -p ~/.config/systemd/user/
```

Create the service file that starts the bridge whenever you log into WSL. Replace `[username]` with your actual Windows username:

```bash
cat <<EOT > ~/.config/systemd/user/1password-ssh-agent.service
[Unit]
Description=Bridge 1Password SSH Agent from Windows

[Service]
Type=simple
ExecStart=/usr/bin/socat -d -d UNIX-LISTEN:%t/1password-agent.sock,fork,mode=600,unlink-early EXEC:"/mnt/c/Users/[username]/AppData/Local/Microsoft/WinGet/Packages/albertony.npiperelay_Microsoft.Winget.Source_8wekyb3d8bbwe/npiperelay.exe -ei -s //./pipe/openssh-ssh-agent",nofork
ExecStopPost=-/usr/bin/rm -f %t/1password-agent.sock
Restart=always

[Install]
WantedBy=default.target
EOT
```

`%t` is your runtime directory (`/run/user/<uid>`), which only your user can use. `mode=600` limits the socket to you, and `unlink-early` removes a leftover socket so the service restarts cleanly.

Reload the systemd manager, then enable and start the bridge:

```bash
systemctl --user daemon-reload
systemctl --user enable --now 1password-ssh-agent.service
```

Confirm the bridge created the socket. The listing should start with `srw-------`:

```bash
ls -la "$XDG_RUNTIME_DIR/1password-agent.sock"
```

For `ssh-add` and Git to find the bridge, set `SSH_AUTH_SOCK` in your shell profile. This appends the line only if it isn't there yet. Use `~/.zshrc` instead of `~/.bashrc` if you use Zsh:

```bash
grep -qxF 'export SSH_AUTH_SOCK="$XDG_RUNTIME_DIR/1password-agent.sock"' ~/.bashrc || echo 'export SSH_AUTH_SOCK="$XDG_RUNTIME_DIR/1password-agent.sock"' >> ~/.bashrc
```

Then reload your profile (`source ~/.bashrc` or `source ~/.zshrc`) and check that WSL sees the same key as PowerShell:

```bash
ssh-add -l
```

### Step 3: configure Git signing and verification

To sign, Git needs a signing key that matches what 1Password provides. To verify signatures locally, not just on GitHub, you also need an "Allowed Signers" file.

Run `ssh-add -L` in WSL and copy the public key string (for example `ssh-ed25519 AAA...`). It must match your Git config for signing to work:

```bash
git config --global gpg.format ssh
git config --global user.signingkey "YOUR_SSH_ED25519_PUBLIC_KEY_STRING"
git config --global commit.gpgsign true
```

Create the allowed signers file so Git can verify your own signatures locally. Replace the key with your own:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "$(git config --global user.email) YOUR_SSH_ED25519_PUBLIC_KEY_STRING" >> ~/.ssh/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

Add the same public key to GitHub as a **Signing Key**. It's a separate entry from an Authentication Key, even for the same key. If you want GitHub to reject unsigned commits, add a ruleset or branch protection that requires signed commits.

You don't need a `~/.ssh/config` for this, and don't turn on `ForwardAgent`: it lets every server you connect to use your agent while you're connected. If you need it for one server you trust, enable it for that host only.

Signing on Windows itself is a separate setup: in the 1Password app, open the key, choose **Configure Commit Signing**, and paste the snippet into your Windows `.gitconfig`.

### Step 4: use it in a Dev Container

The Dev Containers extension forwards your SSH agent into the container and copies your `.gitconfig` on startup. You don't need to mount the socket. It forwards whatever `SSH_AUTH_SOCK` points to in the VS Code server running in WSL, so:

- Open your project from WSL (`code .` from a WSL terminal), not from a Windows path.
- The bridge must be running before you open the container. If you just added `SSH_AUTH_SOCK` to your profile, close VS Code and open it again.
- The container needs `openssh-client`, because Git signs with `ssh-keygen`, and `ssh-add` lets you check the agent. Most Dev Container images include it. If yours doesn't, add `RUN apt-get update && apt-get install -y openssh-client` to the Dockerfile.

Your copied `.gitconfig` points `gpg.ssh.allowedSignersFile` at the full WSL path of `~/.ssh/allowed_signers` (your shell expanded `~` in Step 3), and that path doesn't exist in the container. Signing still works, but `git log --show-signature` can't verify. You could bind-mount the file, but then the container won't start for anyone who doesn't have it, like a contributor or GitHub Codespaces, and the target depends on the container user. Instead, rebuild the file inside the container from the config VS Code already copied. Save this as `.devcontainer/allowed-signers.sh`:

```sh
#!/bin/sh
set -eu

[ "$(git config --global gpg.format || true)" = ssh ] || exit 0
key="$(git config --global user.signingkey || true)"
key="${key#key::}"
case "$key" in "~/"*) key="$HOME/${key#\~/}" ;; esac
if [ -f "$key" ]; then key="$(cat "$key" 2>/dev/null)" || exit 0; fi
case "$key" in ssh-* | ecdsa-* | sk-*) ;; *) exit 0 ;; esac
email="$(git config --global user.email)" || exit 0
nl='
'
case "$email$key" in *"$nl"*) exit 0 ;; esac

file="$HOME/.ssh/allowed_signers"
mkdir -p "$HOME/.ssh"
rm -f "$file"
printf '%s %s\n' "$email" "$key" >"$file"
git config --global gpg.ssh.allowedSignersFile "$file"
```

Run it every time VS Code attaches, after it copies your `.gitconfig`:

```jsonc
{
    "postAttachCommand": "sh .devcontainer/allowed-signers.sh",
}
```

The script does nothing unless Git signs with an SSH key, so contributors and Codespaces never notice it. The file it writes only trusts your own signing key, which is all you need to verify your commits.

Inside the container, run `ssh-add -l`. You should see the same key as in WSL. If VS Code connects before the bridge is up, run `loginctl enable-linger $USER` in WSL so your systemd user services start with WSL.

Anything running inside a container that gets the agent can ask it to sign, so only use this with containers you trust.

## How it works

{{< figure-dynamic
    light-src="images/1password-ssh-authentication-flow-light.svg"
    dark-src="images/1password-ssh-authentication-flow-dark.svg"
    alt="1Password SSH agent authentication flow"
    title="Authentication Flow" >}}

## Check that it works

Create a commit, approve it with Windows Hello if 1Password asks, and run:

```bash
git log --show-signature
```

{{< gallery caption="Signed commit" >}}
{{< gallery-image src="images/1password-access-requested.webp" alt="1Password will ask to allow the use of the ssh key" >}}
{{< gallery-image src="images/windows-hello.webp" alt="Authorize with Windows Hello" >}}
{{< /gallery >}}

{{< gallery caption="Verifying results" >}}
{{< gallery-image src="images/git-signature-verification-inside-dev-container.webp" alt="Example of good SSH signature" >}}
{{< /gallery >}}

You should see: `Good "git" signature for [email] with ED25519 key ...`

---

Photo by {{< extlink href="https://unsplash.com/@cos592?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Cosmin Andrei Buzamat{{< /extlink >}} on {{< extlink href="https://unsplash.com/photos/stacked-colorful-shipping-containers-with-a-blue-crane-ZH-R-3DgVK8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}

Inspired by {{< extlink href="https://xebia.com/blog/elevate-your-git-security-signing-github-commits-with-1password-in-windows-wsl-and-containers/" >}}Marius Boden's article Elevate Your Git Security: Signing GitHub Commits with 1Password in Windows WSL and Containers{{< /extlink >}} on {{< extlink href="https://xebia.com/blog/" >}}Xebia{{< /extlink >}}
