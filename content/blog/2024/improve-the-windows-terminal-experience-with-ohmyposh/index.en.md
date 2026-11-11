---
title: 'Improve the Windows Terminal with Oh My Posh'
date: 2024-06-30T17:20:10-06:00
lastmod: 2026-11-03T00:00:00Z
image: 'images/cover.png'
tags: [windows, powershell]
draft: false
description: "I'll guide you step-by-step through the process of setting up Windows Terminal and Oh My Posh."
slug: 'improve-the-windows-terminal-experience-with-ohmyposh'
---

I wanted my Windows terminal to look good and show more at a glance, so I set it up with PowerShell 7, Windows Terminal, Oh My Posh with a Nerd Font, and a few command-line tools. I wrote the steps down so I could repeat them, and so you can too, even if you've never customized a terminal before.

## Install PowerShell

{{< gallery >}}
{{< gallery-image src="images/windows-terminal-windows-powershell.png" alt="Windows Terminal running the built-in Windows PowerShell with its default prompt" >}}
{{< /gallery >}}

Windows ships with the old Windows PowerShell. Oh My Posh works best with the current cross-platform PowerShell 7.

I install it with Winget because it's quick, but you can also get it from the {{< extlink href="https://www.microsoft.com/store/productId/9MZ1SNWT0N5D?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}.

From a Windows PowerShell window, run:

```powershell
winget install Microsoft.PowerShell -s winget
```

## Configure Windows Terminal

Since the Windows 11 22H2 update, Windows Terminal is the default terminal. If you don’t have it, install it with Winget or from the {{< extlink href="https://www.microsoft.com/store/productId/9N0DX20HK701?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}:

```powershell
winget install Microsoft.WindowsTerminal -s winget
```

### Set Windows Terminal as the default terminal application

Open Windows Terminal, right-click on the title bar (outside the tabs) or click the down arrow next to the last tab and select “Settings.” You can also press `Ctrl + ,` to open settings directly.

Find the **Startup** section. On the right, set **PowerShell** as the Default Profile and **Windows Terminal** as the Default Terminal Application, then click “Save.”

{{< gallery >}}
{{< gallery-image src="images/windows-terminal-startup-configuration.png" alt="Windows Terminal Startup settings with PowerShell as the default profile and Windows Terminal as the default terminal application" >}}
{{< /gallery >}}

### Configure PowerShell script execution policy

By default, Windows desktops use the “Restricted” policy, which runs single commands but not scripts, and Oh My Posh needs scripts. “RemoteSigned” runs local scripts and only requires downloaded ones to be signed, which is enough for most cases.

Run this in PowerShell:

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

This is the main piece. It's very customizable and has a big community behind it.

Install it with Winget. From PowerShell, run:

```powershell
winget install JanDeDobbeleer.OhMyPosh -s winget
```

Once installed, open a new PowerShell tab so everything loads properly.

To update Oh My Posh later, run:

```powershell
winget upgrade JanDeDobbeleer.OhMyPosh -s winget
```

### Install a font

Oh My Posh uses Nerd Fonts, regular fonts patched to include icons. Without one, the icons in your prompt show up as squares.

First, browse the available fonts:

```powershell
oh-my-posh font list
```

This prints one font name per line, so you can pipe it to search for something specific:

```powershell
oh-my-posh font list | findstr /i mono
```

Oh My Posh recommends the “Meslo” font family, which includes “Meslo LGM NF.”

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

Now tell PowerShell to load Oh My Posh every time a terminal starts.

Open your profile with your favorite editor, for example:

```powershell
code $PROFILE
```

Add this line and save:

```powershell
oh-my-posh init pwsh --strict | Invoke-Expression
```

The `--strict` flag makes the prompt find `oh-my-posh` through your `PATH`. Without it, the init script points to the exact install folder, and since `winget upgrade` removes the old version, your prompt would break after an update.

Reload your profile:

```powershell
. $PROFILE
```

You should see your prompt change right away to something like this:

{{< gallery >}}
{{< gallery-image src="images/windows-terminal-ohmyposh.png" alt="PowerShell prompt with the default Oh My Posh theme showing the current folder and Git branch" >}}
{{< /gallery >}}

### Set a theme

Oh My Posh comes with several built-in themes. You can explore them in the {{< extlink href="https://ohmyposh.dev/docs/themes" >}}Oh My Posh themes documentation{{< /extlink >}}.

Pick one you like, then reference it by name (no extension) in your PowerShell profile line. For example, if you like the minimalist “zash” theme, update the line to:

```powershell
oh-my-posh init pwsh --strict --config "zash" | Invoke-Expression
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

{{< gallery >}}
{{< gallery-image src="images/windows-terminal-ohmyposh-zash.png" alt="PowerShell prompt with the Oh My Posh zash theme showing the user, current folder, and Git branch" >}}
{{< /gallery >}}

If you want to revert to the default theme, just use:

```powershell
oh-my-posh init pwsh --strict | Invoke-Expression
```

## A few more tools I install

### PSReadLine

PSReadLine handles command line editing in PowerShell: syntax highlighting, history, suggestions, and keyboard shortcuts. PowerShell 7 already includes it, so there’s nothing to install, and you get a lot without configuring anything:

- Syntax highlighting for commands and arguments
- Suggestions from your history as you type, press `Right arrow` to accept one
- `Ctrl + R` to search your history
- `Alt + H` to show help for the parameter under the cursor
- `Ctrl + arrow keys` to move by words
- `Ctrl + L` to clear the screen

A few settings make it even better. Open your PowerShell profile:

```powershell
code $PROFILE
```

Add these lines at the top:

```powershell
Set-PSReadLineOption -BellStyle None
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
```

Save and reload:

```powershell
. $PROFILE
```

The first line turns off the beep, for example when you press Backspace on an empty line. The other two change the up and down arrows to search your history based on what you’ve already typed. Type `git`, press `Up`, and you’ll only cycle through your previous `git` commands. On an empty line, the arrows work as usual.

Check all key bindings with:

```powershell
Get-PSReadLineKeyHandler
```

Official docs at the {{< extlink href="https://github.com/PowerShell/PSReadLine" >}}PSReadLine GitHub repo{{< /extlink >}}

### fastfetch

`fastfetch` displays system information (OS, software, hardware) next to your OS logo in a clean, readable layout.

Install with:

```powershell
winget install Fastfetch-cli.Fastfetch
```

Open a new PowerShell tab, then run:

```powershell
fastfetch
```

{{< gallery >}}
{{< gallery-image src="images/fastfetch.png" alt="Windows Terminal showing fastfetch output with system information including OS, CPU, RAM, and hardware details" >}}
{{< /gallery >}}

More info at the {{< extlink href="https://github.com/fastfetch-cli/fastfetch" >}}fastfetch GitHub repo{{< /extlink >}}.

### bat

`bat` is a clone of `cat` that adds syntax highlighting and Git integration.

Install with:

```powershell
winget install sharkdp.bat
```

`bat` needs the Visual C++ Redistributable on Windows. If it doesn’t start, install it with:

```powershell
winget install Microsoft.VCRedist.2015+.x64
```

{{< gallery >}}
{{< gallery-image src="images/bat.png" alt="Windows Terminal showing bat displaying a file with syntax highlighting and line numbers" >}}
{{< /gallery >}}

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

{{< gallery >}}
{{< gallery-image src="images/eza.png" alt="Windows Terminal showing eza listing directory contents with colors, metadata, and Git status indicators" >}}
{{< /gallery >}}

See options and docs at the {{< extlink href="https://github.com/eza-community/eza#command-line-options" >}}eza GitHub repo{{< /extlink >}}.

## If something doesn't work

**Icons showing as squares or not displaying?**
Make sure you’ve selected the Nerd Font in all your terminals. Sometimes you need to fully close and reopen apps for the font to apply.

**Can’t run scripts?**
Ensure you’ve changed the execution policy with `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force` and that you’re using PowerShell, not CMD or Windows PowerShell. System-wide installs may require admin rights.

**Prompt not changing after setup?**
Check that the Oh My Posh command is at the end of your `$PROFILE` file and that you have reloaded your profile (`. $PROFILE`). If you edited your profile but don’t see changes, run `. $PROFILE` manually.

---

Photo by {{< extlink href="https://unsplash.com/@imsunnyhassan?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Sunny Hassan{{< /extlink >}} on {{< extlink href="https://unsplash.com/photos/a-screenshot-of-a-computer-reaKJPg2qKg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
