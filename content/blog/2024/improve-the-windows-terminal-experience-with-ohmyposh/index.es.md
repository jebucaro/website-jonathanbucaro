---
title: 'Mejora Windows Terminal con Oh My Posh'
date: 2024-06-30T17:20:10-06:00
lastmod: 2026-08-13T00:00:00Z
image: 'images/cover.png'
tags: [windows, powershell]
draft: false
description: 'Te guío paso a paso para configurar Windows Terminal y Oh My Posh.'
slug: 'improve-the-windows-terminal-experience-with-ohmyposh'
---

Personalizar tu terminal puede marcar una gran diferencia en tu productividad y comodidad como desarrollador. Una de las herramientas más populares para personalizar el prompt en Windows es Oh My Posh, que te permite agregar temas visuales atractivos y funciones extra tanto en PowerShell como en Windows Terminal.

En este artículo, te guío paso a paso para transformar tu terminal de Windows con Oh My Posh. No te preocupes si nunca has personalizado nada antes; te llevo desde la instalación de PowerShell hasta dejar tu terminal con un aspecto completamente distinto.

## Instalar PowerShell

![Windows PowerShell](images/windows-terminal-windows-powershell.webp 'Windows Terminal con Windows PowerShell')

¿Todavía estás usando la versión antigua de PowerShell que viene con Windows? Para aprovechar al máximo Oh My Posh, es clave tener la versión más reciente y multiplataforma.

Mi forma favorita de instalar PowerShell es con Winget porque es rápido y fácil, pero también lo puedes obtener desde la {{< extlink href="https://www.microsoft.com/store/productId/9MZ1SNWT0N5D?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}. ¡Tú decides!

Desde una ventana de Windows PowerShell, ejecuta:

```powershell
winget install Microsoft.PowerShell -s winget
```

## Configurar Windows Terminal

Desde la actualización de Windows 11 22H2, Windows Terminal es la terminal predeterminada. Si no la tienes instalada, la puedes instalar fácilmente con Winget o desde la {{< extlink href="https://www.microsoft.com/store/productId/9N0DX20HK701?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}:

```powershell
winget install Microsoft.WindowsTerminal -s winget
```

Una vez instalado, sigamos con la configuración.

### Configurar Windows Terminal como la aplicación de terminal predeterminada

Abre Windows Terminal, haz clic derecho en la barra de título (fuera de las pestañas) o haz clic en la flecha hacia abajo junto a la última pestaña y selecciona “Settings”. También puedes presionar `Ctrl + ,` para abrir la configuración directamente.

Busca la sección **Startup**. A la derecha, configura **PowerShell** como el Perfil predeterminado y **Windows Terminal** como la Aplicación de terminal predeterminada, y haz clic en “Save”.

![Aplicación de terminal predeterminada](images/windows-terminal-startup-configuration.webp 'Configuración de Windows Terminal')

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

## Instalar y configurar Oh My Posh

Oh My Posh es la estrella de este tutorial. Es muy personalizable, se ve muy bien y tiene una comunidad enorme detrás.

Recomiendo instalarlo con Winget, pero también está disponible en la {{< extlink href="https://www.microsoft.com/store/productId/9N0DX20HK701?ocid=pdpshare" >}}Microsoft Store{{< /extlink >}}.

Desde PowerShell, ejecuta:

```powershell
winget install JanDeDobbeleer.OhMyPosh -s winget
```

Una vez instalado, abre una nueva pestaña de PowerShell para que todo cargue correctamente.

### Instalar una fuente

Oh My Posh está diseñado para usar Nerd Fonts. Nerd Fonts son fuentes populares “parchadas” para incluir íconos, así que necesitas instalar una Nerd Font para ver los íconos especiales en Oh My Posh.

Primero, explora las fuentes disponibles:

```powershell
oh-my-posh font list
```

Esto imprime un nombre de fuente por línea, así que puedes filtrarlo para buscar algo específico, por ejemplo `oh-my-posh font list | findstr /i mono`. Oh My Posh recomienda la familia “Meslo”, que incluye “Meslo LGM NF”.

![Instalar Meslo Nerd Font](images/windows-terminal-install-nerd-font.webp 'Instalar Meslo Nerd Font')

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

Vamos a decirle a PowerShell que cargue Oh My Posh cada vez que inicies una terminal.

Abre tu perfil con tu editor favorito, por ejemplo:

```powershell
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

### Elegir un tema

Oh My Posh incluye varios temas integrados. Puedes explorarlos en la {{< extlink href="https://ohmyposh.dev/docs/themes" >}}documentación de temas de Oh My Posh{{< /extlink >}}.

Elige el que te guste y haz referencia a él por nombre (sin extensión) en la línea de tu perfil de PowerShell. Por ejemplo, si te gusta el tema minimalista “zash”, actualiza la línea a:

```powershell
oh-my-posh init pwsh --config "zash" | Invoke-Expression
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

¡Disfruta tu nuevo look!

![Tema zash de Oh My Posh](images/windows-terminal-ohmyposh-zash.webp 'Tema zash de Oh My Posh')

Si quieres volver al tema predeterminado, solo usa:

```powershell
oh-my-posh init pwsh | Invoke-Expression
```

## Sube de nivel instalando estos módulos y apps

### PSReadLine

Si quieres funciones comunes en bash, como resaltado de sintaxis, búsqueda en el historial y personalización de teclas, PSReadLine es para ti. Mejora la edición de la línea de comandos en PowerShell para que sea más interactiva y amigable.

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

### winfetch

`winfetch` es un script de PowerShell que muestra información del sistema (SO, software, hardware) en un formato claro y ordenado.

Para instalar:

```powershell
Install-Script winfetch
```

Confirma ambos mensajes presionando `Y`. Una vez instalado, ejecuta:

```powershell
winfetch
```

![Windows Terminal mostrando la salida de winfetch con información del sistema incluyendo SO, CPU, RAM y detalles de hardware](images/winfetch.webp 'winfetch')

Más info en el {{< extlink href="https://github.com/lptstr/winfetch" >}}repo de winfetch en GitHub{{< /extlink >}}

{{< callout tip >}}
winfetch no ha recibido commits en un buen tiempo. Si buscas una herramienta similar que siga manteniéndose activamente, revisa {{< extlink href="https://github.com/fastfetch-cli/fastfetch" >}}fastfetch{{< /extlink >}}.
{{< /callout >}}

### bat

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

### eza

`eza` es una alternativa moderna a `ls` con colores, metadata, reconocimiento de symlinks y soporte para estado de Git.

Instálalo con:

```powershell
winget install eza-community.eza
```

Abre una nueva pestaña de PowerShell para empezar a usarlo.

![Windows Terminal mostrando eza listando el contenido de un directorio con colores, metadatos e indicadores de estado de Git](images/eza.webp 'eza')

Mira opciones y docs en el {{< extlink href="https://github.com/eza-community/eza#command-line-options" >}}repo de eza en GitHub{{< /extlink >}}.

---

Ahora tienes una terminal potente y con estilo, a partir de unos pocos cambios de configuración.

{{< callout tip>}}
Jugar con tu entorno de trabajo se trata de sentirte cómodo y feliz mientras creas.
{{< /callout >}}

¡Sigue explorando nuevos temas, combinaciones y herramientas!

---

**¿Los íconos aparecen como cuadros o no se muestran?**
Asegúrate de haber seleccionado la Nerd Font en todas tus terminales. A veces necesitas cerrar por completo y volver a abrir las apps para que la fuente se aplique.

**¿No puedes ejecutar scripts?**
Asegúrate de haber cambiado la política de ejecución con `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force` y de estar usando PowerShell, no CMD ni Windows PowerShell. Las instalaciones a nivel sistema pueden requerir permisos de administrador.

**¿El prompt no cambia después de la configuración?**
Verifica que el comando de Oh My Posh esté al final de tu archivo `$PROFILE` y que hayas recargado tu perfil (`. $PROFILE`). Si editaste tu perfil pero no ves cambios, ejecuta `. $PROFILE` manualmente.

---

Foto de {{< extlink href="https://unsplash.com/@imsunnyhassan?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Sunny Hassan{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/a-screenshot-of-a-computer-reaKJPg2qKg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
