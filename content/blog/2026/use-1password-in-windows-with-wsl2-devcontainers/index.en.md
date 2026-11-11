---
title: 'Use 1password in Windows with WSL2 Dev Containers'
slug: 'use-1password-in-windows-with-wsl2-dev-containers'
date: 2026-01-15T06:57:56-06:00
description: 'A step-by-step guide to configuring 1Password as your unified SSH and Git signing agent across Windows, WSL2, and VS Code Dev Containers.'
draft: false
tags: [windows, wsl]
image: 'images/cover.png'
---

When I moved all my development into Dev Containers inside WSL2, I also moved Docker out of Windows: it runs inside the WSL distro, so my code stays isolated from the Windows side. The catch was signing commits. I use the 1Password SSH agent on Windows with Windows Hello, and the usual trick of pointing `.gitconfig` at `op-ssh-sign.exe` through `/mnt/c/` only works in WSL itself. Inside a container that path doesn't exist, and containers can't see Windows mounts or named pipes.

The fix is a small bridge: `socat` and `npiperelay` expose the Windows 1Password agent as a Unix socket in WSL, and the containers use that socket. You get biometric signing with Windows Hello for GitHub, GitLab, or Azure DevOps, no private keys in `~/.ssh/` on Linux, only the vaults you choose exposed to the agent, and one Git config that works the same on Windows, WSL, and in any Dev Container. You also don't end up managing separate keys for every environment.

{{< figure-dynamic
    light-src="images/1password-ssh-agent-architecture-light.svg"
    dark-src="images/1password-ssh-agent-architecture-dark.svg"
    alt="1Password SSH agent system architecture"
    title="System Architecture" >}}

## Setup

### Prerequisites

- Git for Windows installed and you have configured your {{< extlink href="https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup" >}}global user name and email{{< /extlink >}}
- 1Password 8+ for Windows (with Windows Hello configured).
- WSL 2 with `systemd` enabled. If you installed Ubuntu via `wsl --install`, systemd is enabled by default; otherwise follow the {{< extlink href="https://learn.microsoft.com/en-us/windows/wsl/systemd" >}}official documentation{{< /extlink >}}.
- `npiperelay.exe` downloaded and added to your Windows `%PATH%`. Follow the instructions in the {{< extlink href="https://github.com/jstarks/npiperelay" >}}npiperelay{{< /extlink >}} repo, or download the {{< extlink href="https://github.com/jstarks/npiperelay/releases" >}}release{{< /extlink >}} and unzip it somewhere on your `%PATH%`. I create a `bin` folder in my Windows home and extract `npiperelay.exe` there.

### Step 1: configure the Windows host

In 1Password, go to **Settings > Developer** and check **Use the 1Password SSH agent**, following the official {{< extlink href="https://developer.1password.com/docs/ssh/get-started/" >}}1Password guide{{< /extlink >}}.

**Security tip**: under the agent settings, you can restrict access to specific vaults so personal keys aren't exposed to your dev environment. See the official {{< extlink href="https://developer.1password.com/docs/ssh/agent/config/#from-the-1password-app" >}}agent config file docs{{< /extlink >}}.

Open a Windows PowerShell and verify the agent is working:

```powershell
ssh-add -l
```

If you see your keys, the host layer is ready.

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

```text
cat <<EOT > ~/.config/systemd/user/1password-ssh-agent.service
[Unit]
Description=Bridge 1Password SSH Agent from Windows

[Service]
Type=simple
ExecStart=/usr/bin/socat -d -d UNIX-LISTEN:"/tmp/1password-agent.sock",fork EXEC:"/mnt/c/Users/[username]/bin/npiperelay.exe -ei -s //./pipe/openssh-ssh-agent",nofork
ExecStop=rm -f /tmp/1password-agent.sock
Restart=Always

[Install]
WantedBy=default.target
EOT
```

Reload the systemd manager, then enable and start the bridge:

```bash
systemctl --user daemon-reload
systemctl --user enable --now 1password-ssh-agent.service
```

Confirm the bridge created the Unix socket:

```bash
ls -la /tmp/1password-agent.sock
```

For `ssh-add` and Git to find the bridge, set the `SSH_AUTH_SOCK` environment variable in your shell profile (`~/.bashrc` or `~/.zshrc`). You can append it automatically:

```bash
# This appends the export line safely to the end of your profile
echo 'export SSH_AUTH_SOCK=/tmp/1password-agent.sock' >> ~/.bashrc
```

Or add this line manually to the end of your profile file:

```bash
export SSH_AUTH_SOCK=/tmp/1password-agent.sock
```

Then reload your profile:

```bash
# For Bash
source ~/.bashrc

# For Zsh
source ~/.zshrc
```

### Step 3: configure Git signing and verification

For Git to sign and verify signatures locally, not just on GitHub, you need an "Allowed Signers" file and a signing key that matches what 1Password provides.

Run `ssh-add -L` in WSL and copy the public key string (for example `ssh-ed25519 AAA...`). It must match your Git config for signing to work:

```bash
git config --global gpg.format ssh
git config --global user.signingkey "YOUR_SSH_ED25519_PUBLIC_KEY_STRING"
git config --global commit.gpgsign true
```

Create the allowed signers file so Git can verify your own signatures locally. Replace the email and key with your own:

```bash
# Add yourself to the allowed signers
echo "$(git config --global user.email) YOUR_SSH_ED25519_PUBLIC_KEY_STRING" > ~/.ssh/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

Finally, create `$HOME/.ssh/config` with agent forwarding configured:

```text
Host *
  ForwardAgent yes
  IdentityAgent /tmp/1password-agent.sock
```

## How it works

{{< figure-dynamic
    light-src="images/1password-ssh-authentication-flow-light.svg"
    dark-src="images/1password-ssh-authentication-flow-dark.svg"
    alt="1Password SSH agent authentication flow"
    title="Authentication Flow" >}}

## Check that it works

Create a commit, approve it with Windows Hello, and run:

```bash
git log --show-signature
```

{{< gallery caption="Signed commit" >}}
{{< gallery-image src="images/1password-access-requested.webp" alt="1Password will ask to allow the use of the ssh key" >}}
{{< gallery-image src="images/windows-hello.webp" alt="Authorize with Windows Hello" >}}
{{< /gallery >}}

{{< gallery caption="Verifying Results" >}}
{{< gallery-image src="images/git-signature-verification-inside-dev-container.webp" alt="Example of good ssh signature" >}}
{{< /gallery >}}

You should see: `Good "git" signature for [email] with key ...`

I wrote this when the goal was signing my own commits from containers. Today, with more of my work being agent-driven, I'd rethink this setup, but at the time it was how I kept my dev containers isolated and still signed every commit.

---

Photo by {{< extlink href="https://unsplash.com/@cos592?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Cosmin Andrei Buzamat{{< /extlink >}} on {{< extlink href="https://unsplash.com/photos/stacked-colorful-shipping-containers-with-a-blue-crane-ZH-R-3DgVK8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}

Inspired by {{< extlink href="https://xebia.com/blog/elevate-your-git-security-signing-github-commits-with-1password-in-windows-wsl-and-containers/" >}}Marius Boden's article Elevate Your Git Security: Signing GitHub Commits with 1Password in Windows WSL and Containers{{< /extlink >}} on {{< extlink href="https://xebia.com/blog/" >}}Xebia{{< /extlink >}}
