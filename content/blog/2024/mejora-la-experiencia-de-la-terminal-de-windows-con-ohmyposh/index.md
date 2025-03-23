---
title: 'Mejora la terminal de Windows con Oh My Posh'
date: 2024-06-30T17:20:10-06:00
image: '/blog/mejora-la-experiencia-de-la-terminal-de-windows-con-ohmyposh/images/cover.webp'
tags: [windows, powershell]
draft: false
description: 'Te orientaré a través del proceso de configuración de la terminal de Windows y Oh My Posh'
---

Personalizar el entorno de trabajo puede marcar una gran diferencia en la productividad y comodidad de un desarrollador. Una de las herramientas más populares para personalizar el prompt del terminal en Windows es `Oh My Posh`. Esta herramienta permite añadir temas visuales atractivos y funcionales a `PowerShell` y `Windows Terminal`, mejorando no solo el aspecto visual, sino también la funcionalidad del terminal.

En este artículo, te guiaré paso a paso sobre cómo instalar y configurar `Oh My Posh` en tu sistema `Windows`, aprovechando al máximo las capacidades de `PowerShell` y `Windows Terminal`.

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

![Windows PowerShell](./images/windows-terminal-windows-powershell.webp 'Windows Terminal with Windows PowerShell')

`Windows 11` usa por defecto `Windows PowerShell` la cual se encuentra basada en `.Net Framework`, para hacer uso de `Oh My Posh` debes instalar la versión de `PowerShell` multiplataforma. Existen diversas formas de realizar la instalación, puedes obtenerlo desde la <a href="https://www.microsoft.com/store/productId/9MZ1SNWT0N5D?ocid=pdpshare" target="_blank" rel="nofollow">`Tienda de Windows` ➡</a> o por medio de `WinGet`. Personalmente, prefiero hacer uso de `Winget`, por lo que desde una ventana de `Windows PowerShell` ejecuta la siguiente instrucción.

```cmd
winget install Microsoft.PowerShell -s winget
```

<span id="configura-windows-terminal"></span>

## 💻 Configura Windows Terminal

A partir de `Windows 11 22H2`, la terminal por defecto es `Windows Terminal`, si ya tienes instalada la terminal de Windows puedes continuar con el siguiente paso, de lo contrario, puedes obtenerla desde la <a href="https://www.microsoft.com/store/productId/9N0DX20HK701?ocid=pdpshare" target="_blank" rel="nofollow">`Tienda de Windows` ➡</a> o por medio de `WinGet`.

```cmd
winget install Microsoft.WindowsTerminal -s winget
```

<span id="terminal-por-defecto"></span>

### Establece Windows Terminal como la aplicación de terminal por defecto

Una vez instalada la Terminal de Windows, puedes ingresar a las configuraciones haciendo clic derecho sobre un espacio en blanco de la barra de título de la terminal (no sobre la pestaña), o haciendo clic sobre la flecha hacia abajo (v) al lado de la última pestaña en la terminal y selecciona la opción `Settings`, o presionando la combinación de teclas `Ctrl + ,`

En las configuraciones de la terminal escoge la sección `Startup`. Del lado derecho en `Default Profile` escoge `PowerShell`. En `Default Terminal Application`, escoge la opción `Windows Terminal`. Haz clic en `Save`.

![Default Terminal Application](./images/windows-terminal-startup-configuration.webp 'Windows Terminal Configuration')

A partir de este momento, utiliza la terminal de Windows con `PowerShell` para ejecutar todas las instrucciones.

<span id="ejecucion-de-scripts"></span>

### Configura la política de ejecución de scripts de PowerShell

PowerShell se encuentra configurado de manera predeterminada con políticas que permiten o restringen la ejecución de comandos o scripts. Para una computadora de escritorio con Windows tiene asignada la política `Restricted`, la cual permite la ejecución de comandos individuales pero no permite scripts. En un Servidor de Windows la política `RemoteSigned` permite la ejecución de scripts y comandos locales, sin embargo, requiere una firma digital para los scripts y configuraciones descargadas de internet.

En lo personal, la configuración `RemoteSigned` ha sido más que suficiente para la mayoría de ocasiones. En `PowerShell` ejecuta el siguiente comando.

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

Si el cambio de política se ejecuta de forma satisfactoria, no mostrará resultado alguno. Para poder visualizar el cambio, ejecuta el siguiente comando.

```powershell
Get-ExecutionPolicy
```

El resultado esperado será

```text
RemoteSigned
```

<span id="instala-y-configura-ohmyposh"></span>

## 🤖 Instala y configura Oh My Posh

`Oh My Posh` es un motor de temas para el indicador de cualquier shell, muy personalizable. Puedes obtener `Oh My Posh` desde la <a href="https://apps.microsoft.com/store/detail/XP8K0HKJFRXGCK?ocid=pdpshare" target="_blank" rel="nofollow">`Tienda de Windows` ➡</a> o a través de `WinGet`. Mi preferencia personal es realizarlo por medio de `WinGet`, por lo que en una pestaña de `PowerShell` ejecuta la siguiente instrucción.

```cmd
winget install JanDeDobbeleer.OhMyPosh -s winget
```

Una vez finalizada la instalación, para que el `PATH` sea recargado, inicia una nueva pestaña de `PowerShell` en la Terminal de Windows.

<span id="instala-una-fuente"></span>

### Instala una fuente

`Oh My Posh` se encuentra diseñado para hacer uso de `Nerd Fonts`. `Nerd Fonts` consiste en fuentes populares con parches para incluir iconos, por lo que es necesario instalar una `Nerd Font` para poder visualizar los diferentes iconos en `Oh My Posh`.

Para instalar las fuentes a nivel de sistema, la siguiente instrucción debe ejecutarse en una nueva terminal como administrador.

```cmd
oh-my-posh font install
```

Para instalar las fuentes a nivel de usuario, la instrucción a ejecutarse en una terminal sin privilegios de administrador es la siguiente:

```cmd
oh-my-posh font install --user
```

Al ejecutar el comando, se desplegará una lista con diversas fuentes, `Oh My Posh` recomienda la fuente `Meslo`, la cual incluye la fuente `Meslo LGM NF`.

![Install Meslo Nerd Font](./images/windows-terminal-install-nerd-font.webp 'Install Meslo Nerd Font')

Incluso puedes instalarla de forma directa.

```cmd
oh-my-posh font install meslo
```

Puedes agregar el parámetro `--user` al final para realizar la instalación únicamente para el usuario actual.

<span id="configura-windows-terminal-nerd-font"></span>

### Configura Windows Terminal para usar una Nerd Font

Una vez instalada la `Nerd Font`, debes configurar la `Terminal de Windows` para utilizarla. Esto puede realizarse al modificar las configuraciones de la terminal. La combinación de teclas por defecto es `Ctrl + Shift + ,`. Se abrirá en un editor el archivo `settings.json`, agrega el atributo `font.face` bajo el atributo `defaults` en `profiles`.

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

<span id="configura-visual-studio-code-nerd-font"></span>

### Configura la terminal de Visual Studio Code para usar una Nerd Font

En `Visual Studio Code`, es necesario configurar la terminal integrada para hacer uso de la Nerd Font. Esto puede realizarse ingresando a las configuraciones, la combinación de teclas por defecto es `Ctrl + ,`. En la barra de búsqueda escribe `Integrated: Font Family` o busca en las categorías `Users > Features > Terminal`. Reemplaza el valor existente por `"MesloLGM Nerd Font"`.

<span id="configura-powershell-ohmyposh"></span>

### Configura PowerShell para hacer uso de Oh My Posh

Debido a que estaremos utilizando `Oh My Posh` con `PowerShell`, la configuración necesaria se debe realizar sobre el script del perfil. La ubicación del perfil se encuentra en la ruta de la variable `$PROFILE`. Puedes editarlo haciendo uso de tu editor favorito.

```cmd
code $PROFILE
```

Agrega la siguiente instrucción y guarda los cambios.

```powershell
oh-my-posh init pwsh | Invoke-Expression
```

Una vez guardados los cambios, recarga el perfil para hacer efecto los cambios realizados.

```powershell
. $PROFILE
```

El resultado será similar al siguiente:

![Oh My Posh](./images/windows-terminal-ohmyposh.webp 'PowerShell with Oh My Posh')

<span id="configura-un-tema-ohmyposh"></span>

### Configura un tema

Al instalar `Oh My Posh`, tienes acceso a algunos temas que se encuentran incluidos por defecto. Si deseas visualizar cada tema posible, puedes usar el siguiente comando.

```powershell
Get-PoshThemes
```

Se mostrarán diversos estilos que puedes utilizar. Un ejemplo de todos los temas lo puedes encontrar en la [documentación de temas de <a href="https://ohmyposh.dev/docs/themes" target="_blank" rel="nofollow">`Oh My Posh` ➡</a>.

Una vez hayas encontrado un tema que desees probar, procede a ubicar el nombre del archivo de configuración del tema, puedes ubicarlo al hacer Clic en el nombre del tema en la terminal o en la documentación de temas, el nombre del archivo finaliza con `.omp.json`.

Por ejemplo, para configurar el tema minimalista `zash`, el cual muestra únicamente el nombre del usuario, carpeta actual y rama de git activa en la carpeta, el archivo de configuración del tema corresponde a <a href="https://github.com/JanDeDobbeleer/oh-my-posh/blob/main/themes/zash.omp.json" target="_blank" rel="nofollow">`zash.omp.json` ➡</a>. Ese archivo se encuentra descargado en la ruta `"$env:POSH_THEMES_PATH/zash.omp.json"`, por lo que en tu perfil de `PowerShell` debes modificar la configuración de la siguiente manera.

```powershell
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH/zash.omp.json" | Invoke-Expression
```

Una vez guardados los cambios, recarga el perfil para hacer efecto los cambios realizados.

```powershell
. $PROFILE
```

El resultado será el siguiente:

![Oh My Posh Zash Theme](./images/windows-terminal-ohmyposh-zash.webp 'Oh My Posh Zash Theme')

Explora los diversos temas de `Oh My Posh` y configura el que mejor se adecue a tus necesidades.

En caso necesites regresar al tema por defecto, reemplaza el contenido de la configuración por la siguiente:

```powershell
oh-my-posh init pwsh | Invoke-Expression
```

<span id="sube-de-nivel"></span>

## 🔝 Sube de nivel instalando estos módulos y aplicaciones

<span id="psreadline"></span>

### 📦 PSReadLine

Si usas Windows y quieres aprovechar algunas funciones típicas de bash, como el coloreado de sintaxis, la búsqueda en el historial y la personalización de teclas, te podría interesar `PSReadLine`. Este módulo de `PowerShell` trae una versión de readline con inspiración en `bash` para Windows, mejorando la experiencia de edición en la línea de comandos de `PowerShell`, haciéndola más interactiva y fácil de usar.

Para instalar `PSReadLine` puedes ejecutar el siguiente comando para la versión pre-release, la cual normalmente tendrá más funcionalidades, sin embargo, puede contener algún bug. Personalmente, no he tenido inconvenientes con esta versión.

```powershell
Install-Module PSReadLine -AllowPrerelease -Force
```

O puedes instalar la versión estable.

```powershell
Install-Module PSReadLine
```

Una vez instalada, actualiza tu perfil para activar el módulo.

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

Con la configuración anterior tendrás `PSReadLine` activo con los siguientes beneficios:

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

`winfetch` es un script de `PowerShell` que actúa como una aplicación de línea de comandos que muestra información del sistema. `winfetch` muestra información del sistema operativo, de software y hardware de una forma estética y visualmente placentera.

Para instalar `winfetch` puedes ejecutar el siguiente comando desde una ventana de `PowerShell`:

```powershell
Install-Script winfetch
```

El sistema te pedirá dos confirmaciones, la primera que el script será descargado en una ubicación y esta ubicación será agregada al `path`. La segunda confirmación consiste en si estas seguro de querer instalar el script desde la `PSGallery`. Si estas de acuerdo, procede a confirmar ambas solicitudes con `Y`.

Una vez terminada la instalación, ejecuta la instrucción `winfetch`.

![winfetch](./images/winfetch.webp 'winfetch')

<span id="bat"></span>

Mayor documentación y personalización la puedes encontrar en el <a href="https://github.com/lptstr/winfetch" target="_blank" rel="nofollow">repositorio oficial de winfetch ➡</a>

### 📦 bat

`bat` es un clon de `cat` con resaltado de sintaxis e integración con `Git`.

Puedes instalar `bat` por medio de `WinGet`.

```powershell
winget install sharkdp.bat
```

![bat](./images/bat.webp 'bat')

En Windows adicionalmente deberás instalar otro paquete llamado `less`, el cual permitirá paginar el contenido cuando este sea demasiado grande para caber en la pantalla.

```powershell
winget install jftuga.less
```

Las diversas formas de utilizar `bat` las puedes encontrar en el <a href="https://github.com/sharkdp/bat" target="_blank" rel="nofollow">repositorio oficial de bat ➡</a> y en el <a href="https://github.com/jftuga/less-Windows" target="_blank" rel="nofollow">repositorio oficial de less-Windows ➡</a>.

<span id="eza"></span>

### 📦 eza

`eza` es una alternativa moderna al programa para listar archivos `ls`. Utiliza colores para distinguir tipos de archivos y metadatos. Reconoce `symlinks`, atributos extendidos, y `Git`.

Para instalar `eza` ejecuta el siguiente comando desde `PowerShell`.

```powershell
winget install eza-community.eza
```

Una vez instalado, abre una nueva pestaña de `PowerShell` para poder reconocer el nuevo comando.

![eza](./images/eza.webp 'eza')

Existen distintas opciones para mostrar y filtrar, la documentación la puedes encontrar en el <a href="https://github.com/eza-community/eza#command-line-options" target="_blank" rel="nofollow">repositorio oficial de eza ➡</a>.

---

Foto de <a href="https://unsplash.com/es/@sunriseking?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="nofollow, noreferrer">Sunrise Kingi</a> en <a href="https://unsplash.com/es/fotos/boligrafo-de-clic-plateado-mbLr6NEatMI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="nofollow, noreferrer">Unsplash</a>
