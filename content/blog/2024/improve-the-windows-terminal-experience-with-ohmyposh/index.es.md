---
title: 'Mejora Windows Terminal con Oh My Posh'
date: 2024-06-30T17:20:10-06:00
lastmod: 2026-11-03T00:00:00Z
image: 'images/cover.png'
tags: [windows, powershell]
draft: false
description: 'Te guío paso a paso para configurar Windows Terminal y Oh My Posh.'
slug: 'improve-the-windows-terminal-experience-with-ohmyposh'
---

Quería que mi terminal en Windows se viera bien y me mostrara más información de un vistazo, así que la configuré con PowerShell 7, Windows Terminal, Oh My Posh con una Nerd Font y unas cuantas herramientas de línea de comandos. Apunté los pasos para poder repetirlos, y para que tú también puedas, aunque nunca hayas personalizado una terminal.

## Instala PowerShell

{{< gallery >}}
{{< gallery-image src="images/windows-terminal-windows-powershell.png" alt="Windows Terminal ejecutando el Windows PowerShell integrado con su prompt predeterminado" >}}
{{< /gallery >}}

Windows trae el Windows PowerShell viejo. Oh My Posh funciona mejor con el PowerShell 7 actual, que es multiplataforma.

Yo lo instalo con Winget porque es rápido, pero también lo puedes bajar de la {{< extlink href="https://www.microsoft.com/store/productId/9MZ1SNWT0N5D?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}.

Desde una ventana de Windows PowerShell, corre:

```powershell
winget install Microsoft.PowerShell -s winget
```

## Configura Windows Terminal

Desde la actualización de Windows 11 22H2, Windows Terminal es la terminal predeterminada. Si no la tienes, instálala con Winget o desde la {{< extlink href="https://www.microsoft.com/store/productId/9N0DX20HK701?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}:

```powershell
winget install Microsoft.WindowsTerminal -s winget
```

### Deja Windows Terminal como terminal predeterminada

Abre Windows Terminal, dale clic derecho a la barra de título (fuera de las pestañas) o a la flecha junto a la última pestaña, y entra a “Settings”. También puedes usar `Ctrl + ,`.

En la sección **Startup**, pon **PowerShell** como perfil predeterminado y **Windows Terminal** como aplicación de terminal predeterminada, y dale “Save”.

{{< gallery >}}
{{< gallery-image src="images/windows-terminal-startup-configuration.png" alt="Configuración de inicio de Windows Terminal con PowerShell como perfil predeterminado y Windows Terminal como aplicación de terminal predeterminada" >}}
{{< /gallery >}}

### Cambia la política de ejecución de scripts

Por defecto, Windows de escritorio usa la política “Restricted”, que deja correr comandos sueltos pero no scripts, y Oh My Posh necesita scripts. “RemoteSigned” deja correr scripts locales y solo pide que los descargados estén firmados, y para la mayoría de casos es suficiente.

Corre esto en PowerShell:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

Para revisar que quedó:

```powershell
Get-ExecutionPolicy
```

Deberías ver:

```text
RemoteSigned
```

## Instala y configura Oh My Posh

Esta es la pieza principal. Es muy personalizable y tiene una comunidad grande detrás.

Instálalo con Winget desde PowerShell:

```powershell
winget install JanDeDobbeleer.OhMyPosh -s winget
```

Cuando termine, abre otra pestaña de PowerShell para que agarre los cambios.

Para actualizarlo después:

```powershell
winget upgrade JanDeDobbeleer.OhMyPosh -s winget
```

### Instala una fuente

Oh My Posh usa Nerd Fonts, fuentes normales modificadas para incluir íconos. Sin una, los íconos de tu prompt se ven como cuadros.

Primero mira qué fuentes hay:

```powershell
oh-my-posh font list
```

Te sale un nombre por línea, así que lo puedes filtrar para buscar una en específico:

```powershell
oh-my-posh font list | findstr /i mono
```

Oh My Posh recomienda la familia “Meslo”, que incluye “Meslo LGM NF”.

Cuando ya elegiste una, instálala:

```powershell
oh-my-posh font install meslo
```

Las fuentes se instalan solo para tu usuario, así que no necesitas una terminal como administrador. También puedes instalar desde una URL o un zip local, por ejemplo `oh-my-posh font install https://example.com/font.zip`.

### Usa la Nerd Font en Windows Terminal

Abre el JSON de configuración de Windows Terminal con `Ctrl + Shift + ,` o desde "Settings > Open JSON file".

En la sección "profiles" > "defaults", agrega esto:

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

Guarda y listo, la terminal ya usa la fuente nueva.

### Usa la Nerd Font en la terminal de VS Code

En VS Code, abre la configuración (`Ctrl + ,`), busca "Integrated: Font Family" y cambia el valor a `MesloLGM Nerd Font`.

### Carga Oh My Posh en PowerShell

Ahora dile a PowerShell que cargue Oh My Posh cada vez que abras una terminal.

Abre tu perfil con el editor que uses, por ejemplo:

```powershell
code $PROFILE
```

Agrega esta línea y guarda:

```powershell
oh-my-posh init pwsh --strict | Invoke-Expression
```

La opción `--strict` hace que el prompt encuentre `oh-my-posh` por medio de tu `PATH`. Sin ella, el script apunta a la carpeta exacta de instalación, y como `winget upgrade` borra la versión anterior, el prompt se te rompe después de actualizar.

Recarga tu perfil:

```powershell
. $PROFILE
```

Deberías ver que tu prompt cambia de una vez a algo como esto:

{{< gallery >}}
{{< gallery-image src="images/windows-terminal-ohmyposh.png" alt="Prompt de PowerShell con el tema predeterminado de Oh My Posh mostrando la carpeta actual y la rama de Git" >}}
{{< /gallery >}}

### Elige un tema

Oh My Posh trae varios temas. Los puedes ver en la {{< extlink href="https://ohmyposh.dev/docs/themes" >}}documentación de temas de Oh My Posh{{< /extlink >}}.

Elige el que te guste y pon su nombre (sin extensión) en la línea de tu perfil de PowerShell. Por ejemplo, para el tema minimalista “zash”, la línea queda así:

```powershell
oh-my-posh init pwsh --strict --config "zash" | Invoke-Expression
```

Así el tema se descarga y queda en caché al abrir la terminal, por eso la primera vez necesitas internet. Si prefieres tener una copia local para modificarla, expórtala a un archivo:

```powershell
oh-my-posh config export --config zash --output ~/zash.omp.json
```

Luego apunta la línea de tu perfil a ese archivo, `--config "~/zash.omp.json"`.

Guarda y recarga:

```powershell
. $PROFILE
```

{{< gallery >}}
{{< gallery-image src="images/windows-terminal-ohmyposh-zash.png" alt="Prompt de PowerShell con el tema zash de Oh My Posh mostrando el usuario, la carpeta actual y la rama de Git" >}}
{{< /gallery >}}

Para regresar al tema por defecto:

```powershell
oh-my-posh init pwsh --strict | Invoke-Expression
```

## Otras herramientas que instalo

### PSReadLine

PSReadLine es lo que maneja la edición de la línea de comandos en PowerShell: resaltado de sintaxis, historial, sugerencias y atajos de teclado. Ya viene con PowerShell 7, así que no tienes que instalar nada, y sin configurar nada ya te da bastante:

- Resaltado de sintaxis para comandos y argumentos
- Sugerencias de tu historial mientras escribes, presiona `Right arrow` para aceptar una
- `Ctrl + R` para buscar en tu historial
- `Alt + H` para ver la ayuda del parámetro bajo el cursor
- `Ctrl + arrow keys` para moverte por palabras
- `Ctrl + L` para limpiar la pantalla

Con un par de ajustes queda mejor. Abre tu perfil de PowerShell:

```powershell
code $PROFILE
```

Agrega estas líneas al inicio:

```powershell
Set-PSReadLineOption -BellStyle None
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
```

Guarda y recarga:

```powershell
. $PROFILE
```

La primera línea quita el pitido, por ejemplo cuando le das Backspace a una línea vacía. Las otras dos hacen que las flechas arriba y abajo busquen en tu historial según lo que ya escribiste. Escribe `git`, dale `Up` y solo te van a salir tus comandos `git` anteriores. Con la línea vacía, las flechas funcionan normal.

Para ver todos los atajos:

```powershell
Get-PSReadLineKeyHandler
```

Documentación oficial en el {{< extlink href="https://github.com/PowerShell/PSReadLine" >}}repo de PSReadLine en GitHub{{< /extlink >}}

### fastfetch

`fastfetch` te muestra la información del sistema (SO, software, hardware) al lado del logo de tu sistema operativo.

Instálalo con:

```powershell
winget install Fastfetch-cli.Fastfetch
```

Abre otra pestaña de PowerShell y corre:

```powershell
fastfetch
```

{{< gallery >}}
{{< gallery-image src="images/fastfetch.png" alt="Windows Terminal mostrando la salida de fastfetch con información del sistema incluyendo SO, CPU, RAM y detalles de hardware" >}}
{{< /gallery >}}

Más info en el {{< extlink href="https://github.com/fastfetch-cli/fastfetch" >}}repo de fastfetch en GitHub{{< /extlink >}}.

### bat

`bat` es como `cat`, pero con resaltado de sintaxis e integración con Git.

Instálalo con:

```powershell
winget install sharkdp.bat
```

`bat` necesita el Visual C++ Redistributable en Windows. Si no arranca, instálalo con:

```powershell
winget install Microsoft.VCRedist.2015+.x64
```

{{< gallery >}}
{{< gallery-image src="images/bat.png" alt="Windows Terminal mostrando bat desplegando un archivo con resaltado de sintaxis y números de línea" >}}
{{< /gallery >}}

En Windows instala también `less` para poder paginar:

```powershell
winget install jftuga.less
```

Uso y detalles en el {{< extlink href="https://github.com/sharkdp/bat" >}}repo de bat en GitHub{{< /extlink >}} y en el {{< extlink href="https://github.com/jftuga/less-Windows" >}}repo de less-Windows{{< /extlink >}}.

### eza

`eza` es un reemplazo de `ls` con colores, metadata, symlinks y el estado de Git.

Instálalo con:

```powershell
winget install eza-community.eza
```

Abre otra pestaña de PowerShell y ya lo puedes usar.

{{< gallery >}}
{{< gallery-image src="images/eza.png" alt="Windows Terminal mostrando eza listando el contenido de un directorio con colores, metadatos e indicadores de estado de Git" >}}
{{< /gallery >}}

Mira opciones y docs en el {{< extlink href="https://github.com/eza-community/eza#command-line-options" >}}repo de eza en GitHub{{< /extlink >}}.

## Si algo no funciona

**¿Los íconos aparecen como cuadros o no se muestran?**
Revisa que tengas la Nerd Font seleccionada en todas tus terminales. A veces hay que cerrar la app por completo y volverla a abrir para que agarre la fuente.

**¿No puedes ejecutar scripts?**
Revisa que hayas cambiado la política de ejecución con `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force` y que estés en PowerShell, no en CMD ni en Windows PowerShell. Las instalaciones para todo el sistema pueden pedir permisos de administrador.

**¿El prompt no cambia después de la configuración?**
Revisa que el comando de Oh My Posh esté al final de tu `$PROFILE` y que hayas recargado el perfil (`. $PROFILE`). Si lo editaste y no ves cambios, corre `. $PROFILE` a mano.

---

Foto de {{< extlink href="https://unsplash.com/@imsunnyhassan?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Sunny Hassan{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/a-screenshot-of-a-computer-reaKJPg2qKg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
