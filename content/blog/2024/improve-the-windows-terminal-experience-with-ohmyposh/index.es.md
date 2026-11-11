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

Me gusta una terminal que se vea bien y me muestre lo que necesito de un vistazo, así que cada vez que configuro una máquina con Windows hago los mismos pasos: PowerShell 7, Windows Terminal, Oh My Posh con una Nerd Font y unas cuantas herramientas de línea de comandos. Los apunté para poder repetirlos, y para que tú también puedas, aunque nunca hayas personalizado una terminal.

## Instalar PowerShell

{{< gallery >}}
{{< gallery-image src="images/windows-terminal-windows-powershell.png" alt="Windows Terminal ejecutando el Windows PowerShell integrado con su prompt predeterminado" >}}
{{< /gallery >}}

Windows trae el Windows PowerShell viejo. Oh My Posh funciona mejor con el PowerShell 7 actual, que es multiplataforma.

Yo lo instalo con Winget porque es rápido, pero también lo puedes bajar de la {{< extlink href="https://www.microsoft.com/store/productId/9MZ1SNWT0N5D?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}.

Desde una ventana de Windows PowerShell, ejecuta:

```powershell
winget install Microsoft.PowerShell -s winget
```

## Configurar Windows Terminal

Desde la actualización de Windows 11 22H2, Windows Terminal es la terminal predeterminada. Si no la tienes, instálala con Winget o desde la {{< extlink href="https://www.microsoft.com/store/productId/9N0DX20HK701?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}:

```powershell
winget install Microsoft.WindowsTerminal -s winget
```

### Configurar Windows Terminal como la aplicación de terminal predeterminada

Abre Windows Terminal, haz clic derecho en la barra de título (fuera de las pestañas) o haz clic en la flecha hacia abajo junto a la última pestaña y selecciona “Settings”. También puedes presionar `Ctrl + ,` para abrir la configuración directamente.

Busca la sección **Startup**. A la derecha, configura **PowerShell** como el Perfil predeterminado y **Windows Terminal** como la Aplicación de terminal predeterminada, y haz clic en “Save”.

{{< gallery >}}
{{< gallery-image src="images/windows-terminal-startup-configuration.png" alt="Configuración de inicio de Windows Terminal con PowerShell como perfil predeterminado y Windows Terminal como aplicación de terminal predeterminada" >}}
{{< /gallery >}}

### Configurar la política de ejecución de scripts en PowerShell

Por defecto, Windows de escritorio usa la política “Restricted”, que deja correr comandos sueltos pero no scripts, y Oh My Posh necesita scripts. “RemoteSigned” deja correr scripts locales y solo pide que los descargados estén firmados, y para la mayoría de casos es suficiente.

Corre esto en PowerShell:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

Para confirmar que funcionó:

```powershell
Get-ExecutionPolicy
```

Deberías ver:

```text
RemoteSigned
```

## Instalar y configurar Oh My Posh

Esta es la pieza principal. Es muy personalizable y tiene una comunidad grande detrás.

Instálalo con Winget. Desde PowerShell, ejecuta:

```powershell
winget install JanDeDobbeleer.OhMyPosh -s winget
```

Una vez instalado, abre una nueva pestaña de PowerShell para que todo cargue correctamente.

Para actualizar Oh My Posh más adelante, ejecuta:

```powershell
winget upgrade JanDeDobbeleer.OhMyPosh -s winget
```

### Instalar una fuente

Oh My Posh usa Nerd Fonts, fuentes normales modificadas para incluir íconos. Sin una, los íconos de tu prompt se ven como cuadros.

Primero, explora las fuentes disponibles:

```powershell
oh-my-posh font list
```

Esto imprime un nombre de fuente por línea, así que puedes filtrarlo para buscar algo específico:

```powershell
oh-my-posh font list | findstr /i mono
```

Oh My Posh recomienda la familia “Meslo”, que incluye “Meslo LGM NF”.

Una vez que elijas un nombre de la lista, instálala:

```powershell
oh-my-posh font install meslo
```

Las fuentes siempre se instalan para tu usuario actual, así que no necesitas una terminal elevada. También puedes instalar directamente desde una URL o un archivo zip local, por ejemplo `oh-my-posh font install https://example.com/font.zip`.

### Configurar Windows Terminal para usar una Nerd Font

Abre el archivo JSON de configuración de Windows Terminal presionando `Ctrl + Shift + ,` o desde "Settings > Open JSON file".

Busca la sección "profiles" > "defaults" y agrega esto:

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

Guarda y la fuente de tu terminal se actualizará.

### Configurar la terminal de Visual Studio Code para usar una Nerd Font

En Visual Studio Code, configura la terminal integrada para usar la Nerd Font. Abre la configuración (`Ctrl + ,`), busca "Integrated: Font Family", y reemplaza el valor con `MesloLGM Nerd Font`.

### Configurar PowerShell para usar Oh My Posh

Ahora dile a PowerShell que cargue Oh My Posh cada vez que abras una terminal.

Abre tu perfil con tu editor favorito, por ejemplo:

```powershell
code $PROFILE
```

Agrega esta línea y guarda:

```powershell
oh-my-posh init pwsh --strict | Invoke-Expression
```

La opción `--strict` hace que el prompt encuentre `oh-my-posh` a través de tu `PATH`. Sin ella, el script de inicio apunta a la carpeta exacta de instalación, y como `winget upgrade` elimina la versión anterior, tu prompt dejaría de funcionar después de una actualización.

Recarga tu perfil:

```powershell
. $PROFILE
```

Deberías ver que tu prompt cambia de una vez a algo como esto:

{{< gallery >}}
{{< gallery-image src="images/windows-terminal-ohmyposh.png" alt="Prompt de PowerShell con el tema predeterminado de Oh My Posh mostrando la carpeta actual y la rama de Git" >}}
{{< /gallery >}}

### Elegir un tema

Oh My Posh incluye varios temas integrados. Puedes explorarlos en la {{< extlink href="https://ohmyposh.dev/docs/themes" >}}documentación de temas de Oh My Posh{{< /extlink >}}.

Elige el que te guste y pon su nombre (sin extensión) en la línea de tu perfil de PowerShell. Por ejemplo, para el tema minimalista “zash”, la línea queda así:

```powershell
oh-my-posh init pwsh --strict --config "zash" | Invoke-Expression
```

Esto descarga y guarda en caché el tema al iniciar la terminal, así que necesitas conexión a internet la primera vez. Si prefieres quedarte con una copia local para modificarla, expórtala a un archivo:

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

Si quieres volver al tema predeterminado, solo usa:

```powershell
oh-my-posh init pwsh --strict | Invoke-Expression
```

## Otras herramientas que instalo

### PSReadLine

PSReadLine se encarga de la edición de la línea de comandos en PowerShell: resaltado de sintaxis, historial, sugerencias y atajos de teclado. PowerShell 7 ya lo incluye, así que no necesitas instalar nada, y obtienes mucho sin configurar nada:

- Resaltado de sintaxis para comandos y argumentos
- Sugerencias de tu historial mientras escribes, presiona `Right arrow` para aceptar una
- `Ctrl + R` para buscar en tu historial
- `Alt + H` para ver la ayuda del parámetro bajo el cursor
- `Ctrl + arrow keys` para moverte por palabras
- `Ctrl + L` para limpiar la pantalla

Algunos ajustes lo mejoran todavía más. Abre tu perfil de PowerShell:

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

La primera línea desactiva el pitido, por ejemplo cuando presionas Backspace en una línea vacía. Las otras dos cambian las flechas arriba y abajo para buscar en tu historial según lo que ya escribiste. Escribe `git`, presiona `Up` y solo recorrerás tus comandos `git` anteriores. En una línea vacía, las flechas funcionan como siempre.

Revisa todos los key bindings con:

```powershell
Get-PSReadLineKeyHandler
```

Documentación oficial en el {{< extlink href="https://github.com/PowerShell/PSReadLine" >}}repo de PSReadLine en GitHub{{< /extlink >}}

### fastfetch

`fastfetch` muestra información del sistema (SO, software, hardware) junto al logo de tu sistema operativo en un formato claro y ordenado.

Instálalo con:

```powershell
winget install Fastfetch-cli.Fastfetch
```

Abre una nueva pestaña de PowerShell y ejecuta:

```powershell
fastfetch
```

{{< gallery >}}
{{< gallery-image src="images/fastfetch.png" alt="Windows Terminal mostrando la salida de fastfetch con información del sistema incluyendo SO, CPU, RAM y detalles de hardware" >}}
{{< /gallery >}}

Más info en el {{< extlink href="https://github.com/fastfetch-cli/fastfetch" >}}repo de fastfetch en GitHub{{< /extlink >}}.

### bat

`bat` es un clon de `cat` que agrega resaltado de sintaxis e integración con Git.

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

En Windows, instala `less` también para paginar:

```powershell
winget install jftuga.less
```

Uso y detalles en el {{< extlink href="https://github.com/sharkdp/bat" >}}repo de bat en GitHub{{< /extlink >}} y en el {{< extlink href="https://github.com/jftuga/less-Windows" >}}repo de less-Windows{{< /extlink >}}.

### eza

`eza` es una alternativa moderna a `ls` con colores, metadata, reconocimiento de symlinks y soporte para estado de Git.

Instálalo con:

```powershell
winget install eza-community.eza
```

Abre una nueva pestaña de PowerShell para empezar a usarlo.

{{< gallery >}}
{{< gallery-image src="images/eza.png" alt="Windows Terminal mostrando eza listando el contenido de un directorio con colores, metadatos e indicadores de estado de Git" >}}
{{< /gallery >}}

Mira opciones y docs en el {{< extlink href="https://github.com/eza-community/eza#command-line-options" >}}repo de eza en GitHub{{< /extlink >}}.

## Si algo no funciona

**¿Los íconos aparecen como cuadros o no se muestran?**
Asegúrate de haber seleccionado la Nerd Font en todas tus terminales. A veces necesitas cerrar por completo y volver a abrir las apps para que la fuente se aplique.

**¿No puedes ejecutar scripts?**
Asegúrate de haber cambiado la política de ejecución con `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force` y de estar usando PowerShell, no CMD ni Windows PowerShell. Las instalaciones a nivel sistema pueden requerir permisos de administrador.

**¿El prompt no cambia después de la configuración?**
Verifica que el comando de Oh My Posh esté al final de tu archivo `$PROFILE` y que hayas recargado tu perfil (`. $PROFILE`). Si editaste tu perfil pero no ves cambios, ejecuta `. $PROFILE` manualmente.

---

Foto de {{< extlink href="https://unsplash.com/@imsunnyhassan?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Sunny Hassan{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/a-screenshot-of-a-computer-reaKJPg2qKg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
