---
title: 'Mejora Windows Terminal con Oh My Posh'
date: 2024-06-30T17:20:10-06:00
image: 'images/cover.png'
tags: [windows, powershell]
draft: false
description: 'Te guío paso a paso para configurar Windows Terminal y Oh My Posh.'
slug: 'improve-the-windows-terminal-experience-with-ohmyposh'
---

Personalizar tu terminal puede marcar una gran diferencia en tu productividad y comodidad como desarrollador. Una de las herramientas más populares para personalizar el prompt en Windows es Oh My Posh, que te permite agregar temas visuales atractivos y funciones extra tanto en PowerShell como en Windows Terminal.

En este artículo, te guío paso a paso para transformar tu terminal de Windows con Oh My Posh. No te preocupes si nunca has personalizado nada antes; te llevo desde la instalación de PowerShell hasta dejar tu terminal literalmente irreconocible. ¿Listo para agregar estilo y funciones de nivel pro a tu consola de siempre? ¡Vamos!

## 📜 Tabla de contenido

- [💾 Instalar PowerShell](#install-powershell)
- [💻 Configurar Windows Terminal](#configure-windows-terminal)
    - [Configurar Windows Terminal como la aplicación de terminal predeterminada](#default-terminal)
    - [Configurar la política de ejecución de scripts en PowerShell](#script-execution)
- [🤖 Instalar y configurar Oh My Posh](#install-and-configure-ohmyposh)
    - [Instalar una fuente](#install-a-font)
    - [Configurar Windows Terminal para usar una Nerd Font](#configure-windows-terminal-nerd-font)
    - [Configurar la terminal de Visual Studio Code para usar una Nerd Font](#configure-vscode-nerd-font)
    - [Configurar PowerShell para usar Oh My Posh](#configure-powershell-ohmyposh)
    - [Elegir y configurar un tema](#configure-ohmyposh-theme)
- [🔝 Sube de nivel con estos módulos y apps](#level-up)
    - [📦 PSReadLine](#psreadline)
    - [📦 winfetch](#winfetch)
    - [📦 bat](#bat)
    - [📦 eza](#eza)

<span id="install-powershell"></span>

## 💾 Instalar PowerShell

![Windows PowerShell](images/windows-terminal-windows-powershell.webp 'Windows Terminal con Windows PowerShell')

¿Todavía estás usando la versión antigua de PowerShell que viene con Windows? Para aprovechar al máximo Oh My Posh, es clave tener la versión más reciente y multiplataforma.

Mi forma favorita de instalar PowerShell es con Winget porque es rápido y fácil, pero también lo puedes obtener desde la {{< extlink href="https://www.microsoft.com/store/productId/9MZ1SNWT0N5D?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}. ¡Tú decides!

Desde una ventana de Windows PowerShell, ejecuta:

```cmd
winget install Microsoft.PowerShell -s winget
```

<span id="configure-windows-terminal"></span>

## 💻 Configurar Windows Terminal

Desde la actualización de Windows 11 22H2, Windows Terminal es la terminal predeterminada. Si no la tienes instalada, la puedes instalar fácilmente con Winget o desde la {{< extlink href="https://www.microsoft.com/store/productId/9N0DX20HK701?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}:

```cmd
winget install Microsoft.WindowsTerminal -s winget
```

¿Ya lo instalaste? ¡Genial! Sigamos con la configuración.

<span id="default-terminal"></span>

### Configurar Windows Terminal como la aplicación de terminal predeterminada

Abre Windows Terminal, haz clic derecho en la barra de título (fuera de las pestañas) o haz clic en la flecha hacia abajo junto a la última pestaña y selecciona “Settings”. También puedes presionar `Ctrl + ,` para abrir la configuración directamente.

Busca la sección **Startup**. A la derecha, configura **PowerShell** como el Perfil predeterminado y **Windows Terminal** como la Aplicación de terminal predeterminada. Haz clic en “Save”. Esto te deja listo para continuar con una buena configuración.

![Aplicación de terminal predeterminada](images/windows-terminal-startup-configuration.webp 'Configuración de Windows Terminal')

<span id="script-execution"></span>

### Configurar la política de ejecución de scripts en PowerShell

Las políticas predeterminadas de PowerShell controlan si se pueden ejecutar scripts o comandos. En un equipo Windows de escritorio, normalmente la política está en “Restricted”, lo que permite ejecutar comandos individuales pero no scripts. En Windows Server, la política “RemoteSigned” permite ejecutar scripts y comandos locales, pero requiere que los scripts descargados estén firmados digitalmente.

Para la mayoría de casos, “RemoteSigned” es suficiente. Ejecuta este comando en PowerShell:

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

<span id="install-and-configure-ohmyposh"></span>

## 🤖 Instalar y configurar Oh My Posh

Oh My Posh es la estrella de este tutorial. Es súper personalizable, se ve increíble y tiene una comunidad enorme detrás. ¿Qué más se puede pedir?

Recomiendo instalarlo con Winget, pero también está disponible en la {{< extlink href="https://www.microsoft.com/store/productId/9N0DX20HK701?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}.

Desde PowerShell, ejecuta:

```cmd
winget install JanDeDobbeleer.OhMyPosh -s winget
```

Una vez instalado, abre una nueva pestaña de PowerShell para que todo cargue correctamente.

<span id="install-a-font"></span>

### Instalar una fuente

Oh My Posh está diseñado para usar Nerd Fonts. Nerd Fonts son fuentes populares “parchadas” para incluir íconos, así que necesitas instalar una Nerd Font para ver los íconos especiales en Oh My Posh.

{{< callout important >}}
Para instalar fuentes en todo el sistema, ejecuta el comando desde una terminal con privilegios de administrador.
{{< /callout >}}

```cmd
oh-my-posh font install
```

Si prefieres instalar solo para tu usuario, agrega `--user` al final.

{{< callout important >}}
El comando debe ejecutarse sin privilegios de administrador.
{{< /callout >}}

```cmd
oh-my-posh font install --user
```

Verás una lista de fuentes; Oh My Posh recomienda la familia “Meslo”, que incluye “Meslo LGM NF”.

![Instalar Meslo Nerd Font](images/windows-terminal-install-nerd-font.webp 'Instalar Meslo Nerd Font')

{{< callout important >}}
También puedes instalarla directamente por nombre (en todo el sistema requiere admin, a nivel usuario no).
{{< /callout >}}

```cmd
oh-my-posh font install meslo
```

Si prefieres instalar solo para tu usuario, agrega `--user` al final y ejecútalo sin privilegios de administrador.

<span id="configure-windows-terminal-nerd-font"></span>

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

<span id="configure-vscode-nerd-font"></span>

### Configurar la terminal de Visual Studio Code para usar una Nerd Font

En Visual Studio Code, configura la terminal integrada para usar la Nerd Font. Abre la configuración (`Ctrl + ,`), busca "Integrated: Font Family", y reemplaza el valor con:

<span id="configure-powershell-ohmyposh"></span>

### Configurar PowerShell para usar Oh My Posh

Vamos a decirle a PowerShell que cargue Oh My Posh cada vez que inicies una terminal.

Abre tu perfil con tu editor favorito, por ejemplo:

```cmd
code $PROFILE
```

Agrega esta línea y guarda:

```powershell
oh-my-posh init pwsh | Invoke-Expression
```

Recarga tu perfil:

```powershell
. $PROFILE
```

¡Listo! Deberías ver que tu prompt cambia de inmediato a algo como esto:

![Oh My Posh](images/windows-terminal-ohmyposh.webp 'PowerShell con Oh My Posh')

<span id="configure-ohmyposh-theme"></span>

### Elegir un tema

Oh My Posh incluye varios temas integrados. Puedes explorarlos en la {{< extlink href="https://ohmyposh.dev/docs/themes" >}}documentación de temas de Oh My Posh{{< /extlink >}}.

Elige el que te guste. Por ejemplo, si te gusta el tema minimalista “zash”, ubica el archivo `zash.omp.json` (normalmente en `$env:POSH_THEMES_PATH/zash.omp.json`) y actualiza la línea de tu perfil de PowerShell a:

```powershell
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH/zash.omp.json" | Invoke-Expression
```

**ACTUALIZACIÓN:** Si has instalado Oh My Posh por medio de Winget, los temas no son descargados como archivos, sin embargo, puedes hacer referencia al tema al indicar el nombre del tema en la configuración, sin incluir la extensión.

```powershell
oh-my-posh init pwsh --config "zash" | Invoke-Expression
```

Guarda y recarga:

```powershell
. $PROFILE
```

¡Disfruta tu nuevo look!

![Tema zash de Oh My Posh](images/windows-terminal-ohmyposh-zash.webp 'Tema zash de Oh My Posh')

Si quieres volver al tema predeterminado, solo usa:

```powershell
oh-my-posh init pwsh | Invoke-Expression
```

<span id="level-up"></span>

## 🔝 Sube de nivel instalando estos módulos y apps

<span id="psreadline"></span>

### 📦 PSReadLine

Si estás en Windows y quieres disfrutar funciones comunes en bash (como resaltado de sintaxis, búsqueda en el historial y personalización de teclas), PSReadLine es para ti. Mejora la edición de la línea de comandos en PowerShell para que sea más interactiva y amigable.

Instala la versión pre-release (más funciones, puede tener bugs):

```powershell
Install-Module PSReadLine -AllowPrerelease -Force
```

O la versión estable:

```powershell
Install-Module PSReadLine
```

Luego edita tu perfil de PowerShell:

```powershell
code $PROFILE
```

Agrega al inicio de tu perfil:

```powershell
Import-Module PSReadLine
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
Set-PSReadLineKeyHandler -Key Tab -Function Complete
```

Guarda y recarga:

```powershell
. $PROFILE
```

Los beneficios de esta configuración incluyen:

- Resaltado de sintaxis para comandos y argumentos
- Historial de comandos y autocompletado con Tab
- Atajos de teclado configurables
- Búsqueda en el historial con flechas arriba/abajo, respetando el texto que ya escribiste
- `Ctrl + arrow keys` para moverte por palabras
- `Ctrl + L` para limpiar la pantalla

Revisa los key bindings con:

```powershell
Get-PSReadLineKeyHandler
```

Documentación oficial en el {{< extlink href="https://github.com/PowerShell/PSReadLine" >}}repo de PSReadLine en GitHub{{< /extlink >}}

<span id="winfetch"></span>

### 📦 winfetch

`winfetch` es un script de PowerShell que muestra información del sistema (SO, software, hardware) de forma bonita y agradable.

Para instalar:

```powershell
Install-Script winfetch
```

Confirma ambos mensajes presionando `Y`. Una vez instalado, ejecuta:

```powershell
winfetch
```

![Windows Terminal mostrando la salida de winfetch con información del sistema incluyendo SO, CPU, RAM y detalles de hardware](images/winfetch.webp 'winfetch')

<span id="bat"></span>

Más info en el {{< extlink href="https://github.com/lptstr/winfetch" >}}repo de winfetch en GitHub{{< /extlink >}}

### 📦 bat

`bat` es un clon de `cat` que agrega resaltado de sintaxis e integración con Git.

Instálalo con:

```powershell
winget install sharkdp.bat
```

![Windows Terminal mostrando bat desplegando un archivo con resaltado de sintaxis y números de línea](images/bat.webp 'bat')

En Windows, instala `less` también para paginar:

```powershell
winget install jftuga.less
```

Uso y detalles en el {{< extlink href="https://github.com/sharkdp/bat" >}}repo de bat en GitHub{{< /extlink >}} y en el {{< extlink href="https://github.com/jftuga/less-Windows" >}}repo de less-Windows{{< /extlink >}}.

<span id="eza"></span>

### 📦 eza

`eza` es una alternativa moderna a `ls` con colores, metadata, reconocimiento de symlinks y soporte para estado de Git.

Instálalo con:

```powershell
winget install eza-community.eza
```

Abre una nueva pestaña de PowerShell para empezar a usarlo.

![Windows Terminal mostrando eza listando el contenido de un directorio con colores, metadatos e indicadores de estado de Git](images/eza.webp 'eza')

Mira opciones y docs en el {{< extlink href="https://github.com/eza-community/eza#command-line-options" >}}repo de eza en GitHub{{< /extlink >}}.

---

¡Felicidades! Ahora tienes una terminal que no solo es potente, sino también con mucho estilo. ¿Quién diría que algo tan simple podría mejorar tanto tu experiencia diaria?

{{< callout tip>}}
Jugar con tu entorno de trabajo se trata de sentirte cómodo y feliz mientras creas.
{{< /callout >}}

Cada pequeño ajuste es un paso hacia un flujo de trabajo más fluido y agradable. ¡Sigue explorando nuevos temas, combinaciones y herramientas!

---

**¿Los íconos aparecen como cuadros o no se muestran?**
Asegúrate de haber seleccionado la Nerd Font en todas tus terminales. A veces necesitas cerrar por completo y volver a abrir las apps para que la fuente se aplique.

**¿No puedes ejecutar scripts?**
Asegúrate de haber cambiado la política de ejecución con `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force` y de estar usando PowerShell, no CMD ni Windows PowerShell. Las instalaciones a nivel sistema pueden requerir permisos de administrador.

**¿El prompt no cambia después de la configuración?**
Verifica que el comando de Oh My Posh esté al final de tu archivo `$PROFILE` y que hayas recargado tu perfil (`. $PROFILE`). Si editaste tu perfil pero no ves cambios, ejecuta `. $PROFILE` manualmente.

---

Foto de {{< extlink href="https://unsplash.com/@imsunnyhassan?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Sunny Hassan{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/a-screenshot-of-a-computer-reaKJPg2qKg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
