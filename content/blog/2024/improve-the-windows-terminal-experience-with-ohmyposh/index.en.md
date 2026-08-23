---
title: 'Improve the Windows Terminal with Oh My Posh'
date: 2024-06-30T17:20:10-06:00
lastmod: 2026-08-13T00:00:00Z
image: 'images/cover.png'
tags: [windows, powershell]
draft: false
description: "I'll guide you step-by-step through the process of setting up Windows Terminal and Oh My Posh."
slug: 'improve-the-windows-terminal-experience-with-ohmyposh'
---

Customizing your terminal can make a huge difference in your productivity and comfort as a developer. One of the most popular tools to personalize the prompt on Windows is Oh My Posh, which allows you to add attractive visual themes and extra features in both PowerShell and Windows Terminal.

In this article, I’ll walk you through step-by-step how to transform your Windows terminal with Oh My Posh. Don’t worry if you’ve never customized anything before, I’ll take you from installing PowerShell all the way to making your terminal look completely different.

## Install PowerShell

![Windows PowerShell](images/windows-terminal-windows-powershell.webp 'Windows Terminal with Windows PowerShell')

Are you still using the old version of PowerShell that comes with Windows? To fully benefit from Oh My Posh, it’s essential to have the latest cross-platform version.

My favorite way to install PowerShell is with Winget because it’s fast and easy, but you can also get it from the {{< extlink href="https://www.microsoft.com/store/productId/9MZ1SNWT0N5D?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}. Your choice!

From a Windows PowerShell window, run:

```powershell
winget install Microsoft.PowerShell -s winget
```

## Configure Windows Terminal

Since the Windows 11 22H2 update, Windows Terminal is the default terminal. If you don’t have it installed, you can easily install it via Winget or from the {{< extlink href="https://www.microsoft.com/store/productId/9N0DX20HK701?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}:

```powershell
winget install Microsoft.WindowsTerminal -s winget
```

Once it's installed, continue with the setup below.

### Set Windows Terminal as the default terminal application

Open Windows Terminal, right-click on the title bar (outside the tabs) or click the down arrow next to the last tab and select “Settings.” You can also press `Ctrl + ,` to open settings directly.

Find the **Startup** section. On the right, set **PowerShell** as the Default Profile and **Windows Terminal** as the Default Terminal Application, then click “Save.”

![Default Terminal Application](images/windows-terminal-startup-configuration.webp 'Windows Terminal Configuration')

### Configure PowerShell script execution policy

PowerShell’s default policies control whether scripts or commands can run. On a Windows desktop, the policy is usually set to “Restricted,” which allows running single commands but not scripts. On Windows Server, the “RemoteSigned” policy lets you run local scripts and commands but requires downloaded scripts to be digitally signed.

For most cases, “RemoteSigned” is enough. Run this command in PowerShell:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

To confirm it worked:

```powershell
Get-ExecutionPolicy
```

You should see:

```text
RemoteSigned
```

## Install and configure Oh My Posh

Oh My Posh is the star of this tutorial. It’s highly customizable, looks great, and has a large community behind it.

I recommend installing it via Winget, but it’s also available in the {{< extlink href="https://www.microsoft.com/store/productId/9N0DX20HK701?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}.

From PowerShell, run:

```powershell
winget install JanDeDobbeleer.OhMyPosh -s winget
```

Once installed, open a new PowerShell tab so everything loads properly.

### Install a font

Oh My Posh is designed to use Nerd Fonts. Nerd Fonts are popular fonts patched to include icons, so you need to install a Nerd Font to see the special icons in Oh My Posh.

First, browse the available fonts:

```powershell
oh-my-posh font list
```

This prints one font name per line, so you can pipe it to search for something specific, for example `oh-my-posh font list | findstr /i mono`. Oh My Posh recommends the “Meslo” font family, which includes “Meslo LGM NF.”

![Install Meslo Nerd Font](images/windows-terminal-install-nerd-font.webp 'Install Meslo Nerd Font')

Once you’ve picked a name from the list, install it:

```powershell
oh-my-posh font install meslo
```

Fonts always install for your current user, so there’s no need for an elevated terminal. You can also install directly from a URL or a local zip file, for example `oh-my-posh font install https://example.com/font.zip`.

### Configure Windows Terminal to use a Nerd Font

Open Windows Terminal’s settings JSON file by pressing `Ctrl + Shift + ,` or via "Settings > Open JSON file".

Find the "profiles" > "defaults" section and add this:

```json
{
    "profiles": {
        "defaults": {
            "font": {
                "face": "MesloLGM Nerd Font"
            }
        }
    }
}
```

Save, and your terminal font will update.

### Configure Visual Studio Code terminal to use a Nerd Font

In Visual Studio Code, configure the integrated terminal to use the Nerd Font. Open settings (`Ctrl + ,`), search for "Integrated: Font Family", and replace the value with `MesloLGM Nerd Font`.

### Configure PowerShell to use Oh My Posh

Let’s tell PowerShell to load Oh My Posh whenever you start a terminal.

Open your profile with your favorite editor, for example:

```powershell
code $PROFILE
```

Add this line and save:

```powershell
oh-my-posh init pwsh | Invoke-Expression
```

Reload your profile:

```powershell
. $PROFILE
```

Done! You should see your prompt change immediately to something like this:

![Oh My Posh](images/windows-terminal-ohmyposh.webp 'PowerShell with Oh My Posh')

### Set a theme

Oh My Posh comes with several built-in themes. You can explore them in the {{< extlink href="https://ohmyposh.dev/docs/themes" >}}Oh My Posh themes documentation{{< /extlink >}}.

Pick one you like, then reference it by name (no extension) in your PowerShell profile line. For example, if you like the minimalist “zash” theme, update the line to:

```powershell
oh-my-posh init pwsh --config "zash" | Invoke-Expression
```

This downloads and caches the theme on shell start, so you’ll need an internet connection the first time. If you’d rather keep a local copy to tweak, export it to a file instead:

```powershell
oh-my-posh config export --config zash --output ~/zash.omp.json
```

Then point your profile line to that file, `--config "~/zash.omp.json"`.

Save and reload:

```powershell
. $PROFILE
```

Enjoy your new look!

![Oh My Posh Zash Theme](images/windows-terminal-ohmyposh-zash.webp 'Oh My Posh Zash Theme')

If you want to revert to the default theme, just use:

```powershell
oh-my-posh init pwsh | Invoke-Expression
```

## Level up by installing these modules and apps

### PSReadLine

If you want features common in bash, like syntax highlighting, history search, and key customization, PSReadLine is for you. It makes PowerShell’s command line editing more interactive and user-friendly.

Install the pre-release (more features, might have bugs):

```powershell
Install-Module PSReadLine -AllowPrerelease -Force
```

Or the stable version:

```powershell
Install-Module PSReadLine
```

Then edit your PowerShell profile:

```powershell
code $PROFILE
```

Add at the top of your profile:

```powershell
Import-Module PSReadLine
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
Set-PSReadLineKeyHandler -Key Tab -Function Complete
```

Save and reload:

```powershell
. $PROFILE
```

The benefits of the configuration include:

- Syntax highlighting for commands and arguments
- Command history and tab completion
- Configurable keyboard shortcuts
- Search history with up/down arrows, respecting typed text
- `Ctrl + arrow keys` to move by words
- `Ctrl + L` to clear the screen

Check key bindings with:

```powershell
Get-PSReadLineKeyHandler
```

Official docs at the {{< extlink href="https://github.com/PowerShell/PSReadLine" >}}PSReadLine GitHub repo{{< /extlink >}}

### winfetch

`winfetch` is a PowerShell script that displays system information (OS, software, hardware) in a clean, readable layout.

To install:

```powershell
Install-Script winfetch
```

Confirm both prompts by pressing `Y`. Once installed, run:

```powershell
winfetch
```

![Windows Terminal showing winfetch output with system information including OS, CPU, RAM, and hardware details](images/winfetch.webp 'winfetch')

More info at the {{< extlink href="https://github.com/lptstr/winfetch" >}}winfetch GitHub repo{{< /extlink >}}

{{< callout tip >}}
winfetch hasn’t seen a commit in a while. If you want a similar tool that’s still actively maintained, check out {{< extlink href="https://github.com/fastfetch-cli/fastfetch" >}}fastfetch{{< /extlink >}}.
{{< /callout >}}

### bat

`bat` is a clone of `cat` that adds syntax highlighting and Git integration.

Install with:

```powershell
winget install sharkdp.bat
```

![Windows Terminal showing bat displaying a file with syntax highlighting and line numbers](images/bat.webp 'bat')

In Windows, install `less` as well for paging:

```powershell
winget install jftuga.less
```

Usage and details at the {{< extlink href="https://github.com/sharkdp/bat" >}}bat GitHub repo{{< /extlink >}} and the {{< extlink href="https://github.com/jftuga/less-Windows" >}}less-Windows repo{{< /extlink >}}.

### eza

`eza` is a modern alternative to `ls` with colors, metadata, symlink recognition, and Git status support.

Install with:

```powershell
winget install eza-community.eza
```

Open a new PowerShell tab to start using it.

![Windows Terminal showing eza listing directory contents with colors, metadata, and Git status indicators](images/eza.webp 'eza')

See options and docs at the {{< extlink href="https://github.com/eza-community/eza#command-line-options" >}}eza GitHub repo{{< /extlink >}}.

---

You now have a terminal that’s both powerful and good-looking, from a few config changes.

{{< callout tip>}}
Playing with your work environment is about feeling comfortable and happy while you create.
{{< /callout >}}

Keep exploring new themes, combos, and tools!

---

**Icons showing as squares or not displaying?**
Make sure you’ve selected the Nerd Font in all your terminals. Sometimes you need to fully close and reopen apps for the font to apply.

**Can’t run scripts?**
Ensure you’ve changed the execution policy with `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force` and that you’re using PowerShell, not CMD or Windows PowerShell. System-wide installs may require admin rights.

**Prompt not changing after setup?**
Check that the Oh My Posh command is at the end of your `$PROFILE` file and that you have reloaded your profile (`. $PROFILE`). If you edited your profile but don’t see changes, run `. $PROFILE` manually.

---

Photo by {{< extlink href="https://unsplash.com/@imsunnyhassan?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Sunny Hassan{{< /extlink >}} on {{< extlink href="https://unsplash.com/photos/a-screenshot-of-a-computer-reaKJPg2qKg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
