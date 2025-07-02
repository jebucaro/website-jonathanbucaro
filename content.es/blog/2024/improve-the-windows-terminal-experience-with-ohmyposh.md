---
title: 'Mejora la terminal de Windows con Oh My Posh'
date: 2024-06-30T17:20:10-06:00
image: '/images/blog/2024/improve-the-windows-terminal-experience-with-ohmyposh/cover.webp'
tags: [windows, powershell]
draft: false
description: 'Te orientaré a través del proceso de configuración de la terminal de Windows y Oh My Posh'
translationKey: '2024-improve-the-windows-terminal-experience-with-ohmyposh'
slug: 'mejora-la-experiencia-de-la-terminal-de-windows-con-ohmyposh'
aliases: ['/blog/mejora-la-experiencia-de-la-terminal-de-windows-con-ohmyposh/']
---

Personalizar tu terminal puede marcar una gran diferencia en tu productividad y comodidad como desarrollador. Una de las herramientas más populares para personalizar el prompt en Windows es Oh My Posh, que permite añadir temas visuales atractivos y funcionalidades extra tanto en PowerShell como en Windows Terminal.

En este artículo te acompaño, paso a paso, para que puedas transformar tu terminal de Windows con Oh My Posh. No te preocupes si nunca has personalizado nada antes: iré contigo desde instalar PowerShell hasta dejar tu terminal, literalmente, irreconocible. ¿Listo para darle estilo y funciones pro a tu consola habitual? ¡Vamos!

## 📜 Tabla de Contenido

- [💾 Instala PowerShell](#instala-powershell)
- [💻 Configura Windows Terminal](#configura-windows-terminal)
    - [Establece Windows Terminal como la aplicación de terminal por defecto](#terminal-por-defecto)
    - [Configura la política de ejecución de scripts de PowerShell](#ejecucion-de-scripts)
- [🤖 Instala y configura Oh My Posh](#instala-y-configura-ohmyposh)
    - [Instala una fuente](#instala-una-fuente)
    - [Configura Windows Terminal para usar una Nerd Font](#configura-windows-terminal-nerd-font)
    - [Configura la terminal de Visual Studio Code para usar una Nerd Font](#configura-visual-studio-code-nerd-font)
    - [Configura PowerShell para hacer uso de Oh My Posh](#configura-powershell-ohmyposh)
    - [Configura un tema](#configura-un-tema-ohmyposh)
- [🔝 Sube de nivel con estos módulos y aplicaciones](#sube-de-nivel)
    - [📦 PSReadLine](#psreadline)
    - [📦 winfetch](#winfetch)
    - [📦 bat](#bat)
    - [📦 eza](#eza)

<span id="instala-powershell"></span>

## 💾 Instala PowerShell

![Windows PowerShell](/images/blog/2024/improve-the-windows-terminal-experience-with-ohmyposh/windows-terminal-windows-powershell.webp 'Windows Terminal with Windows PowerShell')

¿Todavía usas la versión antigua de PowerShell que viene con Windows? Para aprovechar Oh My Posh es fundamental tener la versión multiplataforma más reciente.

Mi forma favorita de instalar PowerShell es usando Winget porque es rápido y práctico, pero si prefieres puedes hacerlo desde la <a href="https://www.microsoft.com/store/productId/9MZ1SNWT0N5D?ocid=pdpshare" target="_blank" rel="nofollow">Tienda de Windows ➡</a>. ¡Tú eliges!

Desde una ventana de Windows PowerShell, ejecuta:

```cmd
winget install Microsoft.PowerShell -s winget
```

<span id="configura-windows-terminal"></span>

## 💻 Configura Windows Terminal

Desde la actualización 22H2 de Windows 11, la terminal predeterminada ya es Windows Terminal. Si no la tienes instalada, puedes hacerlo fácilmente desde Winget o desde la <a href="https://www.microsoft.com/store/productId/9N0DX20HK701?ocid=pdpshare" target="_blank" rel="nofollow">Tienda de Windows ➡</a>:

```cmd
winget install Microsoft.WindowsTerminal -s winget
```

¿Ya la tienes? ¡Perfecto! Sigamos con la configuración.

<span id="terminal-por-defecto"></span>

### Establece Windows Terminal como la aplicación de terminal por defecto

Abre la terminal, haz clic derecho en la barra de título (fuera de las pestañas) o haz clic en la flecha hacia abajo que aparece al lado de la última pestaña y elige "Settings". También puedes presionar `Ctrl + ,` para ir directo a la configuración.

Busca la sección "Startup". A la derecha, selecciona "PowerShell" en Default Profile y "Windows Terminal" en "Default Terminal Application". Haz clic en "Save". Así tendrás todo listo para seguir los siguientes pasos usando la mejor configuración.

![Default Terminal Application](/images/blog/2024/improve-the-windows-terminal-experience-with-ohmyposh/windows-terminal-startup-configuration.webp 'Windows Terminal Configuration')

<span id="ejecucion-de-scripts"></span>

### Configura la política de ejecución de scripts de PowerShell

PowerShell se encuentra configurado de manera predeterminada con políticas que permiten o restringen la ejecución de comandos o scripts. Una computadora de escritorio con Windows tiene asignada la política "Restricted", la cual permite la ejecución de comandos individuales pero no permite scripts. En un Servidor de Windows la política "RemoteSigned" permite la ejecución de scripts y comandos locales, sin embargo, requiere una firma digital para los scripts y configuraciones descargadas de internet.

La configuración "RemoteSigned" ha sido más que suficiente para la mayoría de ocasiones. En PowerShell ejecuta el siguiente comando.

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

Para confirmar que el cambio fue exitoso:

```powershell
Get-ExecutionPolicy
```

El resultado esperado será:

```text
RemoteSigned
```

<span id="instala-y-configura-ohmyposh"></span>

## 🤖 Instala y configura Oh My Posh

Oh My Posh es la estrella de este tutorial. Es súper personalizable, bonito y tiene una comunidad enorme detrás. ¿Qué más se puede pedir?

Te recomiendo instalarlo con Winget, pero, como antes, también está disponible en la <a href="https://apps.microsoft.com/store/detail/XP8K0HKJFRXGCK?ocid=pdpshare" target="_blank" rel="nofollow">Tienda de Windows ➡</a>.

Desde PowerShell:

```cmd
winget install JanDeDobbeleer.OhMyPosh -s winget
```

Cuando termine la instalación, abre una nueva pestaña en PowerShell para que todo funcione correctamente.

<span id="instala-una-fuente"></span>

### Instala una fuente

Oh My Posh se encuentra diseñado para hacer uso de Nerd Fonts. Nerd Fonts consiste en fuentes populares con parches para incluir iconos, por lo que es necesario instalar una Nerd Font para poder visualizar los diferentes iconos en Oh My Posh.

{{< callout important >}}
Para instalar las fuentes a nivel de sistema, la siguiente instrucción debe ejecutarse en una nueva terminal como administrador.
{{< /callout >}}

```cmd
oh-my-posh font install
```

¿Prefieres solo para tu usuario? Agrega --user al final.

{{< callout important >}}
La instrucción debe ejecutarse en una terminal sin privilegios de administrador.
{{< /callout >}}

```cmd
oh-my-posh font install --user
```

Al ejecutar el comando, se desplegará una lista con diversas fuentes, Oh My Posh recomienda la fuente "Meslo", la cual incluye la fuente "Meslo LGM NF".

![Install Meslo Nerd Font](/images/blog/2024/improve-the-windows-terminal-experience-with-ohmyposh/windows-terminal-install-nerd-font.webp 'Install Meslo Nerd Font')

También puedes instalarla directamente por nombre. Puedes agregar el parámetro `--user` al final para realizar la instalación únicamente para el usuario actual.

{{< callout important >}}
Para instalar las fuentes a nivel de sistema, la instrucción debe ejecutarse en una nueva terminal como administrador.
{{< /callout >}}

```cmd
oh-my-posh font install meslo
```

<span id="configura-windows-terminal-nerd-font"></span>

### Configura Windows Terminal para usar una Nerd Font

Abre el archivo de configuración de Windows Terminal presionando `Ctrl + Shift + ,` o desde "Settings > Open JSON file".

Busca la sección "profiles > defaults" y bajo ella coloca esto:

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

Guarda los cambios. Tu terminal debería cambiar la fuente.

<span id="configura-visual-studio-code-nerd-font"></span>

### Configura la terminal de Visual Studio Code para usar una Nerd Font

En Visual Studio Code, es necesario configurar la terminal integrada para hacer uso de la Nerd Font. Esto puede realizarse ingresando a las configuraciones, la combinación de teclas por defecto es `Ctrl + ,`. En la barra de búsqueda escribe `Integrated: Font Family` o busca en las categorías "Users > Features > Terminal". Reemplaza el valor existente por `"MesloLGM Nerd Font"`.

<span id="configura-powershell-ohmyposh"></span>

### Configura PowerShell para hacer uso de Oh My Posh

Vamos a decirle a PowerShell que use Oh My Posh cada vez que abras una terminal.

Abre tu perfil con el editor que prefieras, por ejemplo:

```cmd
code $PROFILE
```

Agrega la siguiente instrucción y guarda los cambios.

```powershell
oh-my-posh init pwsh | Invoke-Expression
```

Guarda y recarga el perfil:

```powershell
. $PROFILE
```

¡Listo! Deberías ver el cambio inmediatamente. El resultado será similar al siguiente:

![Oh My Posh](/images/blog/2024/improve-the-windows-terminal-experience-with-ohmyposh/windows-terminal-ohmyposh.webp 'PowerShell with Oh My Posh')

<span id="configura-un-tema-ohmyposh"></span>

### Configura un tema

Al instalar Oh My Posh, tienes acceso a algunos temas que se encuentran incluidos por defecto. Un ejemplo de todos los temas lo puedes encontrar en la <a href="https://ohmyposh.dev/docs/themes" target="_blank" rel="nofollow">documentación de temas de Oh My Posh ➡</a>.

Explora y elige el que más te guste. Por ejemplo, si te gusta el tema minimalista zash, busca el archivo <a href="https://github.com/JanDeDobbeleer/oh-my-posh/blob/main/themes/zash.omp.json" target="_blank" rel="nofollow">`zash.omp.json` ➡</a>. Ese archivo se encuentra descargado en la ruta `"$env:POSH_THEMES_PATH/zash.omp.json"`, por lo que en tu perfil de PowerShell debes modificar la configuración de la siguiente manera.

```powershell
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH/zash.omp.json" | Invoke-Expression
```

Guarda, recarga tu perfil.

```powershell
. $PROFILE
```

El resultado será el siguiente, ¡disfruta tu nuevo look!:

![Oh My Posh Zash Theme](/images/blog/2024/improve-the-windows-terminal-experience-with-ohmyposh/windows-terminal-ohmyposh-zash.webp 'Oh My Posh Zash Theme')

Explora los diversos temas de Oh My Posh y configura el que mejor se adecue a tus necesidades.

En caso necesites regresar al tema por defecto, reemplaza el contenido de la configuración por la siguiente:

```powershell
oh-my-posh init pwsh | Invoke-Expression
```

<span id="sube-de-nivel"></span>

## 🔝 Sube de nivel instalando estos módulos y aplicaciones

<span id="psreadline"></span>

### 📦 PSReadLine

Si usas Windows y quieres aprovechar algunas funciones típicas de bash, como el coloreado de sintaxis, la búsqueda en el historial y la personalización de teclas, te podría interesar PSReadLine. Este módulo trae una versión de readline con inspiración en bash para Windows, mejorando la experiencia de edición en la línea de comandos de PowerShell, haciéndola más interactiva y fácil de usar.

Para instalar PSReadLine ejecuta el siguiente comando para la versión pre-release, la cual normalmente tendrá más funcionalidades, sin embargo, puede contener algún bug.

```powershell
Install-Module PSReadLine -AllowPrerelease -Force
```

O puedes instalar la versión estable.

```powershell
Install-Module PSReadLine
```

Una vez instalada, es necesario modificar tu perfil para activar el módulo.

```powershell
code $PROFILE
```

Coloca al inicio del archivo la siguiente configuración, guarda los cambios.

```powershell
Import-Module PSReadLine
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
Set-PSReadLineKeyHandler -Key Tab -Function Complete
```

Una vez guardados los cambios, refresca tu perfil.

```powershell
. $PROFILE
```

Con la configuración anterior tendrás PSReadLine activo con los siguientes beneficios:

- Tu terminal tendrá colores de sintaxis para los comandos y sus argumentos.
- Historial y completado de comandos.
- Combinaciones de teclas configurables.
- Podrás navegar por el historial con las teclas del cursor arriba y abajo, es decir que si ya escribiste algún texto, buscará el texto ingresado mientras navegas en el historial.
- Presionando la tecla `Ctrl` y las teclas del cursor derecha o izquierda, puedes desplazarte por las palabras de la instrucción.
- Presionando la combinación de teclas `Ctrl + l` puedes limpiar la pantalla de la terminal.

Puedes validar las combinaciones de teclas por defecto con el siguiente comando.

```powershell
Get-PSReadLineKeyHandler
```

La documentación oficial la puedes encontrar en el <a href="https://github.com/PowerShell/PSReadLine" target="_blank" rel="nofollow">repositorio oficial de PSReadLine ➡</a>

<span id="winfetch"></span>

### 📦 winfetch

winfetch es un script de PowerShell que actúa como una aplicación de línea de comandos que muestra información del sistema. winfetch muestra información del sistema operativo, de software y hardware de una forma estética y visualmente placentera.

Para instalar winfetch puedes ejecutar el siguiente comando desde una ventana de PowerShell:

```powershell
Install-Script winfetch
```

El sistema te pedirá dos confirmaciones, la primera que el script será descargado en una ubicación y esta ubicación será agregada al `path`. La segunda confirmación consiste en si estas seguro de querer instalar el script desde la PSGallery. Si estas de acuerdo, procede a confirmar ambas solicitudes con `Y`.

Una vez terminada la instalación, ejecuta la instrucción `winfetch`.

![winfetch](/images/blog/2024/improve-the-windows-terminal-experience-with-ohmyposh/winfetch.webp 'winfetch')

<span id="bat"></span>

Mayor documentación y personalización la puedes encontrar en el <a href="https://github.com/lptstr/winfetch" target="_blank" rel="nofollow">repositorio oficial de winfetch ➡</a>

### 📦 bat

`bat` es un clon del comando `cat` con resaltado de sintaxis e integración con Git.

Puedes instalar `bat` por medio de WinGet.

```powershell
winget install sharkdp.bat
```

![bat](/images/blog/2024/improve-the-windows-terminal-experience-with-ohmyposh/bat.webp 'bat')

En Windows adicionalmente debes instalar otro paquete llamado `less`, el cual permitirá paginar el contenido cuando este sea demasiado grande para caber en la pantalla.

```powershell
winget install jftuga.less
```

Las diversas formas de utilizar `bat` las puedes encontrar en el <a href="https://github.com/sharkdp/bat" target="_blank" rel="nofollow">repositorio oficial de bat ➡</a> y en el <a href="https://github.com/jftuga/less-Windows" target="_blank" rel="nofollow">repositorio oficial de less-Windows ➡</a>.

<span id="eza"></span>

### 📦 eza

`eza` es una alternativa moderna al programa para listar archivos `ls`. Utiliza colores para distinguir tipos de archivos y metadatos. Reconoce symlinks, atributos extendidos, y Git.

Para instalar `eza` ejecuta el siguiente comando desde PowerShell.

```powershell
winget install eza-community.eza
```

Una vez instalado, abre una nueva pestaña de PowerShell para poder reconocer el nuevo comando.

![eza](/images/blog/2024/improve-the-windows-terminal-experience-with-ohmyposh/eza.webp 'eza')

Existen distintas opciones para mostrar y filtrar, la documentación la puedes encontrar en el <a href="https://github.com/eza-community/eza#command-line-options" target="_blank" rel="nofollow">repositorio oficial de eza ➡</a>.

---

¡Felicidades! Ahora tienes una terminal no solo poderosa, sino también con estilo propio. ¿Quién diría que algo tan sencillo puede cambiar tanto tu experiencia diaria?

{{< callout tip>}}
Jugar con tu entorno de trabajo se trata de sentirte cómodo y a gusto mientras creas.
{{< /callout >}}

Cada pequeño ajuste es un paso más hacia un flujo de trabajo más ágil y disfrutable. ¡Sigue explorando y prueba nuevos temas, combinaciones y herramientas!

---

**¿Qué hago si los íconos no se ven bien o aparecen cuadrados?**

Verifica que hayas seleccionado la Nerd Font en todas las terminales. Algunas veces necesitas cerrar y abrir por completo las aplicaciones para que la nueva fuente se aplique.

**¿No puedes ejecutar scripts?**

Asegúrate de haber cambiado la política de ejecución `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force` y de estar usando PowerShell, no CMD y no Windows Powershell. Si instalas scripts o fuentes para todo el sistema, podrías necesitar permisos de administrador.

**¿El prompt no cambia tras instalar todo?**

Revisa que la instrucción de Oh My Posh esté al final de tu archivo de perfil `$PROFILE` y que hayas recargado la terminal. Si editaste tu perfil, pero no ves cambios, ejecuta `. $PROFILE` para aplicar todo de inmediato.

---

Foto de <a href="https://unsplash.com/es/@sunriseking?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="nofollow, noreferrer">Sunrise Kingi</a> en <a href="https://unsplash.com/es/fotos/boligrafo-de-clic-plateado-mbLr6NEatMI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="nofollow, noreferrer">Unsplash</a>
