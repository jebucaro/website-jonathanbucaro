---
title: 'Guía para habilitar WSL2'
date: 2020-09-14T19:56:03-06:00
image: 'images/cover.png'
tags: [windows, wsl]
draft: false
description: 'Aprende cómo instalar WSL2 en tu PC con Windows y explora capacidades del sistema Linux directamente en tu escritorio'
slug: 'guide-enable-wsl2'
---

Así es como configuro WSL2 en Windows hoy. La primera vez lo instalé en 2020, cuando el proceso era distinto, así que actualicé esta guía a como funciona ahora. WSL (Windows Subsystem for Linux) te deja correr Linux directo en Windows, y WSL2 es más rápido y funciona con más aplicaciones de Linux que la primera versión.

{{< gallery caption="Ubuntu 24.04 en WSL2" >}}
{{< gallery-image src="images/wsl2-ubuntu-lts.webp" alt="Ejecutando Ubuntu dentro de Windows 11" >}}
{{< /gallery >}}

## Requisitos

Necesitas por lo menos Windows 10 versión 2004 (la actualización de mayo de 2020) o Windows 11. Lo puedes revisar en `Settings` > `System` > `About`, en el panel `Windows specifications` de abajo.

WSL2 también necesita la virtualización por hardware habilitada en el BIOS, que normalmente aparece como `Virtualization Technology` o `VTx`.

## Instalación

### Instala WSL

Todo se instala con un solo comando.

{{< callout important >}}
Ejecuta estos comandos en una terminal con privilegios de administrador.
{{< /callout >}}

```powershell
wsl --install
```

Habilita todo lo que WSL necesita e instala Ubuntu por defecto. Reinicia la computadora para terminar.

{{< callout tip >}}
Este comando solo funciona si WSL no está instalado previamente.
{{< /callout >}}

Para ver qué otras distribuciones puedes instalar:

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

Y para instalar una en específico:

```powershell
wsl --install -d <DistroName>
```

### Configura tu usuario y contraseña en Linux

Cuando termine la instalación, abre la distribución (Ubuntu por defecto) desde el menú de Inicio y crea un usuario y contraseña. Un par de cosas que vale la pena saber:

- Son solo para esa distribución y no tienen nada que ver con tu cuenta de Windows.
- Mientras escribes la contraseña no aparece nada en pantalla. Es normal.
- Ese usuario queda como el predeterminado y entra solo cuando abres la distribución.
- Tiene permisos de administrador con `sudo`.
- Cada distribución tiene sus propios usuarios, así que te toca crear uno cada vez que agregas, reinstalas o reseteas una.

### Cambia o restablece tu contraseña

Para cambiar tu contraseña, abre la distribución y corre:

```bash
passwd
```

Te pide la contraseña actual y luego la nueva dos veces.

Si se te olvidó:

- Abre PowerShell y entra a tu distribución por defecto como root:

```powershell
wsl -u root
```

- Para una distribución que no es la predeterminada, usa su nombre (Debian en este ejemplo):

```powershell
wsl -d Debian -u root
```

- Ya como root, cambia la contraseña:

```bash
passwd <username>
```

donde `<username>` es la cuenta que quieres resetear.

- Escribe la nueva contraseña dos veces, y cuando te confirme el cambio, sal de WSL:

```bash
exit
```

## Actualiza los paquetes

Windows no actualiza tus distribuciones de Linux, así que te toca hacerlo de vez en cuando. En Ubuntu o Debian:

```bash
sudo apt update && sudo apt upgrade
```

## Extensión WSL de Visual Studio Code

Si usas VS Code, instala la {{< extlink href="https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl" >}}extensión de WSL{{< /extlink >}} para abrir cualquier carpeta dentro de WSL con todas las funciones de VS Code.

{{< gallery caption="La extensión de Microsoft para VS Code" >}}
{{< gallery-image src="images/wsl-extension.webp" alt="Extensión para Visual Studio Code que habilita la integración con WSL" >}}
{{< /gallery >}}

Reinicia VS Code después de instalarla. Luego, desde cualquier carpeta en WSL, ábrela con:

```bash
code .
```

---

Logo de WSL por Microsoft Corporation, Dominio Público, via {{< extlink href="https://commons.wikimedia.org/wiki/File:Windows_Subsystem_for_Linux_logo.png" >}}Wikimedia Commons{{< /extlink >}}
