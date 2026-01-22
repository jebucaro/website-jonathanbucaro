---
title: 'Guide to Enable WSL2'
date: 2020-09-14T19:56:03-06:00
image: 'images/cover.webp'
tags: [windows, wsl]
draft: false
description: 'Learn how to install WSL2 on your Windows PC and explore Linux system capabilities right on your desktop'
slug: 'guide-enable-wsl2'
---

Windows Subsystem for Linux (WSL) is a feature introduced in Windows 10 that allows you to run Linux applications directly in Windows through an intermediate compatibility layer. WSL2 brings significant improvements over the first version, including faster performance and better compatibility with more complex Linux applications.

{{< gallery caption="Ubuntu 24.04 on WSL2" >}}
{{< gallery-image src="images/wsl2-ubuntu-lts.webp" alt="Running Ubuntu inside Windows 11" >}}
{{< /gallery >}}

## 📌 Requirements

An updated operating system is required, at minimum Windows 10 with the May 2020 Update (version 2004 or later), or Windows 11. You can verify this by choosing `Settings` from the gear icon in the Start menu, then selecting `System` and finally `About`. Near the bottom, you will find the `Windows specifications` panel.

Additionally, WSL2 requires hardware virtualization support enabled in BIOS. This option is usually labeled `Virtualization Technology` or `VTx`.

## 🛠️ Setup and Installation

### Install WSL

You can now install everything needed to run WSL with a single command.

{{< callout important >}}
Run these commands in a terminal with administrator privileges.
{{< /callout >}}

```powershell
wsl --install
```

This command will enable all required components to run WSL and install the Ubuntu Linux distribution by default.

You must restart your computer to complete the WSL installation.

{{< callout tip >}}
This command only works if WSL is not already installed.
{{< /callout >}}

To view the list of available Linux distributions, run this command:

```powershell
wsl --list --online
```

```text
The following is a list of valid distributions that can be installed.
Install using 'wsl.exe --install <Distro>'.

NAME                            FRIENDLY NAME
AlmaLinux-8                     AlmaLinux OS 8
AlmaLinux-9                     AlmaLinux OS 9
AlmaLinux-Kitten-10             AlmaLinux OS Kitten 10
AlmaLinux-10                    AlmaLinux OS 10
Debian                          Debian GNU/Linux
FedoraLinux-42                  Fedora Linux 42
SUSE-Linux-Enterprise-15-SP6    SUSE Linux Enterprise 15 SP6
SUSE-Linux-Enterprise-15-SP7    SUSE Linux Enterprise 15 SP7
Ubuntu                          Ubuntu
Ubuntu-24.04                    Ubuntu 24.04 LTS
archlinux                       Arch Linux
kali-linux                      Kali Linux Rolling
openSUSE-Tumbleweed             openSUSE Tumbleweed
openSUSE-Leap-15.6              openSUSE Leap 15.6
Ubuntu-18.04                    Ubuntu 18.04 LTS
Ubuntu-20.04                    Ubuntu 20.04 LTS
Ubuntu-22.04                    Ubuntu 22.04 LTS
OracleLinux_7_9                 Oracle Linux 7.9
OracleLinux_8_7                 Oracle Linux 8.7
OracleLinux_9_1                 Oracle Linux 9.1
```

If you want to install a specific distribution, use this command:

```powershell
wsl --install -d <DistroName>
```

### Set your username and password in Linux

After the Linux distribution installation via WSL completes, open the distribution (Ubuntu by default) from the Start menu. You will be prompted to create a Username and Password for your Linux distribution.

- This Username and Password are specific to each Linux distribution you install and are unrelated to your Windows user account.
- Note that when typing your password, no characters will appear on screen. This “blind typing” is normal and intentional.
- When you create your Username and Password, this account will become your default user for the distribution and will automatically log in when you launch it.
- This account will have administrator privileges on Linux, allowing you to execute administrative commands using sudo (Super User Do).
- Each Linux distribution running in WSL maintains its own user accounts and passwords. You must create a user account each time you add a new distribution, reinstall it, or reset it.

### Change or reset your password

To change or reset your password, open your Linux distribution and enter the following command:

```bash
passwd
```

You will be asked to enter your current password, then a new password, and finally to confirm the new password.

If you forget your Linux distribution password:

- Open PowerShell and access your default WSL distribution as root with the command:

```powershell
wsl -u root
```

- To change the password in a distribution that is not your default, replace Debian below with your target distribution’s name:

```powershell
wsl -d Debian -u root
```

- Once inside the WSL distribution as root via PowerShell, run this command to change the password:

```bash
passwd <username>
```

where `<username>` is the user account name whose password you want to reset.

- You will be prompted to enter and confirm a new UNIX password. After a message confirming the password update, exit WSL inside PowerShell by running:

```bash
exit
```

## Update and upgrade packages

It is recommended to regularly update and upgrade your packages using your distribution’s package manager. For Ubuntu or Debian, use:

```bash
sudo apt update && sudo apt upgrade
```

Windows does not automatically update or upgrade your Linux distributions. This is a task most Linux users prefer to control manually.

## Visual Studio Code WSL Extension

This extension allows you to open any directory inside WSL and take advantage of VS Code’s features and functionality. You can install the extension from the {{< extlink href="<https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl>" >}}Visual Studio Marketplace{{< /extlink >}}.

{{< gallery caption="Microsoft's extension for VS Code" >}}
{{< gallery-image src="images/wsl-extension.webp" alt="Extension for Visual Studio Code to enable the integration with WSL" >}}
{{< /gallery >}}

Once installed, restart Visual Studio Code.

The extension lets you run Visual Studio Code and explore the contents of your current directory in WSL by running the command:

```bash
code .
```

---

WSL logo by Microsoft Corporation, Public domain, via {{< extlink href="<https://commons.wikimedia.org/wiki/File:Windows_Subsystem_for_Linux_logo.png>" >}}Wikimedia Commons{{< /extlink >}}
