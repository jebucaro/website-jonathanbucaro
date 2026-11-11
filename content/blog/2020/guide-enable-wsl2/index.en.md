---
title: 'Guide to Enable WSL2'
date: 2020-09-14T19:56:03-06:00
image: 'images/cover.png'
tags: [windows, wsl]
draft: false
description: 'Learn how to install WSL2 on your Windows PC and explore Linux system capabilities right on your desktop'
slug: 'guide-enable-wsl2'
---

This is how I set up WSL2 on Windows today. I first installed it in 2020, when the process was different, so I've updated this guide to match how it works now. WSL (Windows Subsystem for Linux) lets you run Linux directly on Windows, and WSL2 is faster and works with more Linux apps than the first version.

{{< gallery caption="Ubuntu 24.04 on WSL2" >}}
{{< gallery-image src="images/wsl2-ubuntu-lts.webp" alt="Running Ubuntu inside Windows 11" >}}
{{< /gallery >}}

## Requirements

You need at least Windows 10 version 2004 (the May 2020 Update) or Windows 11. You can check it in `Settings` > `System` > `About`, in the `Windows specifications` panel near the bottom.

WSL2 also needs hardware virtualization enabled in the BIOS, usually labeled `Virtualization Technology` or `VTx`.

## Install

### Install WSL

Everything installs with one command.

{{< callout important >}}
Run these commands in a terminal with administrator privileges.
{{< /callout >}}

```powershell
wsl --install
```

It enables everything WSL needs and installs Ubuntu by default. Restart your computer to finish.

{{< callout tip >}}
This command only works if WSL is not already installed.
{{< /callout >}}

To see which other distributions you can install:

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

And to install a specific one:

```powershell
wsl --install -d <DistroName>
```

### Set your username and password in Linux

When the install finishes, open the distribution (Ubuntu by default) from the Start menu and create a username and password. A few things to know:

- They're only for that distribution and have nothing to do with your Windows account.
- Nothing shows on screen while you type the password. That's normal.
- This becomes the default user and logs in automatically when you open the distribution.
- It has administrator rights through `sudo`.
- Every distribution has its own users, so you create one each time you add, reinstall, or reset a distribution.

### Change or reset your password

To change your password, open the distribution and run:

```bash
passwd
```

It asks for your current password, then the new one twice.

If you forgot it:

- Open PowerShell and enter your default distribution as root:

```powershell
wsl -u root
```

- For a distribution that isn't your default, use its name (Debian in this example):

```powershell
wsl -d Debian -u root
```

- As root, reset the password:

```bash
passwd <username>
```

where `<username>` is the account you want to reset.

- Enter the new password twice, and when it confirms the change, leave WSL:

```bash
exit
```

## Update and upgrade packages

Windows doesn't update your Linux distributions for you, so do it yourself every now and then. On Ubuntu or Debian:

```bash
sudo apt update && sudo apt upgrade
```

## Visual Studio Code WSL Extension

If you use VS Code, install the {{< extlink href="https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl" >}}WSL extension{{< /extlink >}} so you can open any folder inside WSL with all of VS Code's features.

{{< gallery caption="Microsoft's extension for VS Code" >}}
{{< gallery-image src="images/wsl-extension.webp" alt="Extension for Visual Studio Code to enable the integration with WSL" >}}
{{< /gallery >}}

Restart VS Code after installing it. Then, from any folder in WSL, open it with:

```bash
code .
```

---

WSL logo by Microsoft Corporation, Public domain, via {{< extlink href="https://commons.wikimedia.org/wiki/File:Windows_Subsystem_for_Linux_logo.png" >}}Wikimedia Commons{{< /extlink >}}
