---
translationKey: '2020-guide-enable-wsl2'
title: 'Guía Habilitar WSL2'
date: 2020-09-14T19:56:03-06:00
image: '/images/blog/2020/guide-enable-wsl2/cover.webp'
tags: [windows, wsl]
draft: false
description: 'Descubre como instalar WSL2 en tu PC Windows y experimenta con las funcionalidades de un sistema Linux en tu escritorio.'
---

Windows Subsystem for Linux (WSL) es una característica introducida en Windows 10 que permite ejecutar aplicaciones de Linux directamente en Windows mediante el uso de una capa intermedia. WSL2 ofrece mejoras significativas en comparación con la primera versión, como por ejemplo, una mayor velocidad y compatibilidad con aplicaciones de Linux más complejas.

{{< gallery images="/images/blog/2020/guide-enable-wsl2/wsl2-ubuntu-lts.webp" captions="Ejecutando Ubuntu dentro de Windows 11" caption="Ubuntu 24.04 en WSL2" >}}

## 📌 Requisitos

Sistema operativo actualizado, como mínimo Windows 10 con la actualización Windows May 2020 cuya versión es 2004 o superior, o Windows 11. Puedes validar este dato escogiendo la opción `Configuración` desde el ícono de la tuerca en el menú de Inicio, luego selecciona la opción `Sistema` y posteriormente `Acerca de`. En la parte inferior se encontrará un panel con las `Especificaciones de Windows`.

Adicionalmente WSL2 requiere que el soporte a la virtualización de hardware se encuentre habilitada en el Bios. Usualmente se encuentra bajo la opción llamada `Virtualization Technology` o `VTx`.

## 🛠️ Configuración e Instalación

### Instala WSL

Ahora es posible instalar todo lo que necesitas para correr WSL en un solo comando.

{{< callout important >}}
Ejecuta estos comandos en una terminal con privilegios de administrador.
{{< /callout >}}

```powershell
wsl --install
```

Este comando habilitará todas las funcionalidades requeridas para ejecutar WSL e instalará la distribución de Linux Ubuntu.

Debes reiniciar tu equipo para completar la instalación de WSL.

{{< callout tip>}}
Este comando funciona sólo si aún no tienes WSL instalado.
{{< /callout >}}

Para ver la lista de distribuciones disponibles, ejecuta el siguiente comando:

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

Si deseas instalar una distribución específica, utiliza el siguiente comando:

```powershell
wsl --install -d <DistroName>
```

### Configura tu nombre de usuario y contraseña en Linux

Una vez que el proceso de instalación de la distribución de Linux con WSL haya finalizado, abre la distribución (por defecto Ubuntu) desde el menú Inicio. Se te pedirá crear un Nombre de Usuario y una Contraseña para tu distribución de Linux.

- Este Nombre de Usuario y Contraseña son específicos para cada distribución de Linux que instales y no tienen relación alguna con tu nombre de usuario de Windows.
- Ten en cuenta que al ingresar la contraseña no verás ningún caracter en pantalla. Esto se conoce como "escritura ciega" y es completamente normal que no se muestre lo que escribes.
- Cuando crees el Nombre de Usuario y la Contraseña, esta cuenta será tu usuario predeterminado para la distribución e iniciará sesión automáticamente al abrirse.
- Esta cuenta tendrá privilegios de administrador en Linux, lo que te permitirá ejecutar comandos administrativos usando sudo (Super User Do).
- Cada distribución de Linux que ejecutes en WSL tiene sus propias cuentas y contraseñas de usuario. Debes configurar una cuenta de usuario de Linux cada vez que agregues una distribución nueva, la reinstales o la restablezcas.

### Cambiar o reiniciar tu contraseña

Para cambiar o reiniciar tu contraseña, abre la distribución de Linux e ingresa el siguiente comando:

```bash
passwd
```

Se te pedirá que ingreses tu contraseña actual, luego tu nueva contraseña, y finalmente que confirmes la nueva contraseña.

Si olvidaste la contraseña de tu distribución de Linux:

- Abre PowerShell y accede como root a tu distribución WSL predeterminada con el comando:

```powershell
wsl -u root
```

- Si necesitas actualizar la contraseña olvidada en una distribución que no es tu predeterminada, utiliza este comando, reemplazando Debian por el nombre de tu distribución objetivo:

```powershell
wsl -d Debian -u root
```

- Una vez hayas entrado a tu distribución WSL con permisos root desde PowerShell, ejecuta este comando para actualizar la contraseña:

```bash
passwd <nombreUsuario>
```

donde `<nombreUsuario>` es el nombre de usuario de la cuenta cuya contraseña olvidaste.

- Se te pedirá ingresar y confirmar una nueva contraseña UNIX. Cuando te confirmen que la contraseña se actualizó correctamente, cierra WSL dentro de PowerShell usando el comando:

```bash
exit
```

## Actualizar y mejorar los paquetes

Es recomendable que actualices y mejores regularmente tus paquetes utilizando el gestor de paquetes preferido para la distribución. En Ubuntu o Debian, usa el siguiente comando:

```bash
sudo apt update && sudo apt upgrade
```

Windows no actualiza ni mejora automáticamente tus distribuciones de Linux. Esta es una tarea que la mayoría de los usuarios de Linux prefieren controlar por sí mismos.

## Extensión WSL de Visual Studio Code

La extensión permite abrir cualquier directorio dentro de WSL y tomar ventaja de las características y funcionalidades de VS Code. Puedes instalar la extensión desde el <a href="https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl" target="_blank" rel="nofollow">Marketplace de Visual Studio ➡</a>.

{{< gallery images="/images/blog/2020/guide-enable-wsl2/wsl-extension.webp" captions="Extensión for Visual Studio Code para habilitar la integración con WSL" caption="Extensión WSL de Microsoft para VS Code" >}}

Una vez instalada la extensión, reinicia Visual Studio Code.

La extensión te permitirá ejecutar Visual Studio Code y explorar el contenido del directorio en el que te encuentres actualmente en WSL al ejecutar el comando:

```bash
code .
```

---

Foto de <a href="https://unsplash.com/es/@eiskonen?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"  target="_blank" rel="nofollow, noreferrer">Hans Eiskonen</a> en <a href="https://unsplash.com/es/fotos/PotGJdsW06k?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="nofollow, noreferrer">Unsplash</a>
