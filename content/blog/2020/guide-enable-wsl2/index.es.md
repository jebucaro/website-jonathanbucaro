---
title: 'Guía para habilitar WSL2'
date: 2020-09-14T19:56:03-06:00
image: 'images/cover.png'
tags: [windows, wsl]
draft: false
description: 'Aprende cómo instalar WSL2 en tu PC con Windows y explora capacidades del sistema Linux directamente en tu escritorio'
slug: 'guide-enable-wsl2'
---

Windows Subsystem for Linux (WSL) es una funcionalidad introducida en Windows 10 que te permite ejecutar aplicaciones de Linux directamente en Windows mediante una capa intermedia de compatibilidad. WSL2 trae mejoras importantes sobre la primera versión, incluyendo mejor rendimiento y mayor compatibilidad con aplicaciones de Linux más complejas.

{{< gallery caption="Ubuntu 24.04 en WSL2" >}}
{{< gallery-image src="images/wsl2-ubuntu-lts.webp" alt="Ejecutando Ubuntu dentro de Windows 11" >}}
{{< /gallery >}}

## 📌 Requisitos

Se requiere un sistema operativo actualizado, como mínimo Windows 10 con la actualización de mayo de 2020 (versión 2004 o posterior), o Windows 11. Puedes verificarlo eligiendo `Settings` desde el ícono de engranaje en el menú de Inicio, luego seleccionando `System` y por último `About`. Cerca de la parte inferior encontrarás el panel `Windows specifications`.

Además, WSL2 requiere soporte de virtualización por hardware habilitado en el BIOS. Esta opción normalmente aparece como `Virtualization Technology` o `VTx`.

## 🛠️ Configuración e instalación

### Instala WSL

Ahora puedes instalar todo lo necesario para ejecutar WSL con un solo comando.

{{< callout important >}}
Ejecuta estos comandos en una terminal con privilegios de administrador.
{{< /callout >}}

```powershell
wsl --install
```

Este comando habilita todos los componentes necesarios para ejecutar WSL e instala la distribución de Linux Ubuntu por defecto.

Debes reiniciar tu computadora para completar la instalación de WSL.

{{< callout tip >}}
Este comando solo funciona si WSL no está instalado previamente.
{{< /callout >}}

Para ver la lista de distribuciones de Linux disponibles, ejecuta este comando:

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

Si quieres instalar una distribución específica, usa este comando:

```powershell
wsl --install -d <DistroName>
```

### Configura tu usuario y contraseña en Linux

Después de que termine la instalación de la distribución de Linux mediante WSL, abre la distribución (Ubuntu por defecto) desde el menú de Inicio. Se te pedirá crear un Username y Password para tu distribución de Linux.

- Este Username y Password son específicos de cada distribución de Linux que instales y no están relacionados con tu cuenta de usuario de Windows.
- Toma en cuenta que, al escribir tu contraseña, no aparecerán caracteres en pantalla. Esta “escritura a ciegas” es normal e intencional.
- Cuando creas tu Username y Password, esta cuenta se convierte en tu usuario por defecto de la distribución e iniciará sesión automáticamente al abrirla.
- Esta cuenta tendrá privilegios de administrador en Linux, lo que te permite ejecutar comandos administrativos usando sudo (Super User Do).
- Cada distribución de Linux que corre en WSL mantiene sus propias cuentas y contraseñas. Debes crear una cuenta de usuario cada vez que agregues una nueva distribución, la reinstales o la restablezcas.

### Cambia o restablece tu contraseña

Para cambiar o restablecer tu contraseña, abre tu distribución de Linux y ejecuta el siguiente comando:

```bash
passwd
```

Se te pedirá ingresar tu contraseña actual, luego una nueva contraseña y finalmente confirmar la nueva contraseña.

Si olvidaste la contraseña de tu distribución de Linux:

- Abre PowerShell y accede a tu distribución WSL por defecto como root con el comando:

```powershell
wsl -u root
```

- Para cambiar la contraseña en una distribución que no es la que tienes por defecto, reemplaza Debian abajo por el nombre de tu distribución objetivo:

```powershell
wsl -d Debian -u root
```

- Ya dentro de la distribución WSL como root desde PowerShell, ejecuta este comando para cambiar la contraseña:

```bash
passwd <username>
```

donde `<username>` es el nombre de la cuenta de usuario cuya contraseña quieres restablecer.

- Se te pedirá ingresar y confirmar una nueva contraseña UNIX. Después de un mensaje confirmando la actualización de la contraseña, sal de WSL en PowerShell ejecutando:

```bash
exit
```

## Actualiza y mejora paquetes

Se recomienda actualizar y mejorar tus paquetes regularmente usando el gestor de paquetes de tu distribución. Para Ubuntu o Debian, usa:

```bash
sudo apt update && sudo apt upgrade
```

Windows no actualiza ni mejora automáticamente tus distribuciones de Linux. Esta es una tarea que la mayoría de usuarios de Linux prefiere controlar manualmente.

## Extensión WSL de Visual Studio Code

Esta extensión te permite abrir cualquier directorio dentro de WSL y aprovechar las funciones y características de VS Code. Puedes instalarla desde el {{< extlink href="https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl" >}}Visual Studio Marketplace{{< /extlink >}}.

{{< gallery caption="La extensión de Microsoft para VS Code" >}}
{{< gallery-image src="images/wsl-extension.webp" alt="Extensión para Visual Studio Code que habilita la integración con WSL" >}}
{{< /gallery >}}

Una vez instalada, reinicia Visual Studio Code.

La extensión te permite ejecutar Visual Studio Code y explorar el contenido de tu directorio actual en WSL ejecutando el comando:

```bash
code .
```

---

Logo de WSL por Microsoft Corporation, Dominio Público, via {{< extlink href="https://commons.wikimedia.org/wiki/File:Windows_Subsystem_for_Linux_logo.png" >}}Wikimedia Commons{{< /extlink >}}
