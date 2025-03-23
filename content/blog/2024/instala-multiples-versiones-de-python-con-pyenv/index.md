---
title: 'Instala múltiples versiones de Python con pyenv'
date: 2024-03-29T09:32:54-06:00
image: '/blog/instala-multiples-versiones-de-python-con-pyenv/images/cover.webp'
tags: [windows, linux, python]
draft: false
description: 'pyenv es una herramienta simple y discreta que permite cambiar fácilmente entre multiples versiones de Python.'
---

Como desarrollador te verás en el escenario de trabajar en múltiples proyectos, estos proyectos puede que requieran diferentes versiones de librerías y diferentes versiones de Python. Administrar tanto el ambiente virtual como la versión de Python es una necesidad.

La herramienta que te sugiero utilizar es `pyenv` para entornos Unix o `pyenv-win` en caso te encuentres utilizando Windows.

## 📜 Tabla de Contenido

- [⚙️ Guía de Instalación](#guia-de-instalacion)
    - [🪟 Windows 11](#instalacion-en-windows-11)
    - [🐧 Linux](#instalacion-en-linux)
- [🔨 Uso general de pyenv](#uso-general-de-pyenv)
- [👣 Siguientes pasos](#siguientes-pasos)

## <span id="guia-de-instalacion"></span> ⚙️ Guía de Instalación

### <span id="instalacion-en-windows-11"></span> 🪟 Instalación en Windows 11

Abre una nueva ventana de PowerShell y ejecuta el siguiente comando:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/pyenv-win/pyenv-win/master/pyenv-win/install-pyenv-win.ps1" -OutFile "./install-pyenv-win.ps1"; &"./install-pyenv-win.ps1"
```

El comando leerá el contenido del script desde el repositorio y lo almacenará en un archivo dentro de tu carpeta actual, por último procederá a ejecutarlo.

En el caso de no tener habilitado la ejecución de scripts, abre una una nueva ventana de PowerShell con privilegios de Administrador y ejecuta la siguiente instrucción, esto te permitirá ejecutar scripts creados en tu equipo y scripts remotos únicamente si estos poseen una firma segura.

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

Podrás comprobar la instalación en una nueva ventana de PowerShell ejecutando el comando `pyenv`.

```text
@hola ➜ ~ pyenv
pyenv 3.1.1

Usage: pyenv <command> [<args>]

Some useful pyenv commands are:
   commands     List all available pyenv commands
   duplicate    Creates a duplicate python environment
   local        Set or show the local application-specific Python version
   global       Set or show the global Python version
   shell        Set or show the shell-specific Python version
   install      Install a Python version using python-build
   uninstall    Uninstall a specific Python version
   update       Update the cached version DB
   rehash       Rehash pyenv shims (run this after installing executables)
   vname        Show the current Python version
   version      Show the current Python version and its origin
   version-name Show the current Python version
   versions     List all Python versions available to pyenv
   exec         Runs an executable by first preparing PATH so that the selected Python
   which        Display the full path to an executable
   whence       List all Python versions that contain the given executable

See `pyenv help <command>' for information on a specific command.
For full documentation, see: https://github.com/pyenv-win/pyenv-win#readme
```

### <span id="instalacion-en-linux"></span> 🐧 Instalación en Linux

En Linux, `pyenv` compila el código fuente de la versión de Python que instales con esta herramienta, por lo que es necesario contar con las dependencias de compilación de Python como prerequisito. Puedes obtener mayor información en la <a href="https://github.com/pyenv/pyenv/wiki#suggested-build-environment" target="_blank" rel="nofollow">wiki de pyenv, ambiente de compilación sugerido ➡</a>.

Dependencias para Debian, Ubuntu y Mint

```bash
sudo apt update; sudo apt install build-essential libssl-dev zlib1g-dev \
libbz2-dev libreadline-dev libsqlite3-dev curl \
libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
```

Dependiencias para Fedora

```bash
dnf install make gcc patch zlib-devel bzip2 bzip2-devel readline-devel sqlite sqlite-devel openssl-devel tk-devel libffi-devel xz-devel libuuid-devel gdbm-libs libnsl2
```

Una vez se posean las dependencias de compilación, la instalación automática de `pyenv` en Linux consiste en ejecutar el siguiente comando. Puedes obtener mayor información en el <a href="https://github.com/pyenv/pyenv-installer" target="_blank" rel="nofollow">repositorio de pyenv-installer ➡</a>.

```bash
curl https://pyenv.run | bash
```

Finalmente, dependiendo de si usas bash o zsh, debes realizar la configuración para `pyenv`. Puedes obtener mayor información en la documentación <a href="https://github.com/pyenv/pyenv?tab=readme-ov-file#set-up-your-shell-environment-for-pyenv" target="_blank" rel="nofollow">configura tu ambiente de Shell para pyenv ➡</a>.

Bash

```bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
```

Zsh

```bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo '[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc
```

Recarga tu terminal o abre una nueva, comprueba la instalación con el siguiente comando.

```text
➜  ~ pyenv
pyenv 2.3.36
Usage: pyenv <command> [<args>]

Some useful pyenv commands are:
   --version   Display the version of pyenv
   activate    Activate virtual environment
   commands    List all available pyenv commands
   deactivate   Deactivate virtual environment
   doctor      Verify pyenv installation and development tools to build pythons.
   exec        Run an executable with the selected Python version
   global      Set or show the global Python version(s)
   help        Display help for a command
   hooks       List hook scripts for a given pyenv command
   init        Configure the shell environment for pyenv
   install     Install a Python version using python-build
   latest      Print the latest installed or known version with the given prefix
   local       Set or show the local application-specific Python version(s)
   prefix      Display prefixes for Python versions
   rehash      Rehash pyenv shims (run this after installing executables)
   root        Display the root directory where versions and shims are kept
   shell       Set or show the shell-specific Python version
   shims       List existing pyenv shims
   uninstall   Uninstall Python versions
   update      Update pyenv, its plugins including the list of available versions
   version     Show the current Python version(s) and its origin
   version-file   Detect the file that sets the current pyenv version
   version-name   Show the current Python version
   version-origin   Explain how the current Python version is set
   versions    List all Python versions available to pyenv
   virtualenv   Create a Python virtualenv using the pyenv-virtualenv plugin
   virtualenv-delete   Uninstall a specific Python virtualenv
   virtualenv-init   Configure the shell environment for pyenv-virtualenv
   virtualenv-prefix   Display real_prefix for a Python virtualenv version
   virtualenvs   List all Python virtualenvs found in `$PYENV_ROOT/versions/*'.
   whence      List all Python versions that contain the given executable
   which       Display the full path to an executable

See `pyenv help <command>' for information on a specific command.
For full documentation, see: https://github.com/pyenv/pyenv#readme
```

## <span id="uso-general-de-pyenv"></span> 🔨 Uso general de pyenv

Lista todas las versiones de Python que puedes instalar con `pyenv`.

```bash
pyenv install --list
```

```text
2.4-win32
2.4.1-win32
2.4.2-win32
2.4.3c1-win32
2.4.3-win32
2.4.4-win32
...
3.13.0a1-win32
3.13.0a1-arm
3.13.0a1
3.13.0a2-arm
3.13.0a2-win32
3.13.0a2
```

Instala una versión específica de Python. En este ejemplo, procederé a descargar la versión 3.11.7.

```bash
pyenv install 3.11.7
```

En Windows, `pyenv` descarga el instalador y lo ejecuta.

```text
:: [Info] ::  Mirror: https://www.python.org/ftp/python
:: [Downloading] ::  3.11.7 ...
:: [Downloading] ::  From https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe
:: [Downloading] ::  To   C:\Users\hola\.pyenv\pyenv-win\install_cache\python-3.11.7-amd64.exe
:: [Installing] ::  3.11.7 ...
:: [Info] :: completed! 3.11.7
```

En Linux, `pyenv` descarga el fuente de Python y lo compila. Dependerá de los recursos de tu equipo el tiempo que demore este proceso.

```text
Downloading Python-3.11.7.tar.xz...
-> https://www.python.org/ftp/python/3.11.7/Python-3.11.7.tar.xz
Installing Python-3.11.7...
Installed Python-3.11.7 to /home/hola/.pyenv/versions/3.11.7
```

Lista todas las versiones de Python que has instalado con `pyenv`.

```bash
pyenv versions
```

Windows

```text
  3.11.7
```

Linux

```text
* system
  3.11.7
```

Asigna una versión de Python como global.

```bash
pyenv global 3.11.7
```

Este comando no devuelve resultado si este es exitoso, por lo que puedes comprobar la versión de Python de la siguiente forma.

```bash
python3 --version
```

```text
Python 3.11.7
```

Adicionalmente, puedes comprobar la versión que actualmente se encuentre configurada como global, se mostrará un asterisco (\*) a la izquierda de la versión configurada como global.

```bash
pyenv versions
```

Windows

```text
* 3.11.7 (set by C:\Users\hola\.pyenv\pyenv-win\version)
```

Linux

```text
  system
* 3.11.7 (set by /home/hola/.pyenv/version)
```

Puedes descargar multiples versiones de Python y asignar como global la que uses frecuentente, sin embargo, para especificar una versión por proyecto, te sugiero ingresar a la carpeta del proyecto y ejecutar.

```bash
pyenv local [version]
```

El comando creará un archivo `.python-version` con la versión especificada, mientras te encuentres en esa carpeta, la versión de Python a utilizar corresponderá a la versión local.

## <span id="siguientes-pasos"></span> 👣 Siguientes pasos

Te sugiero familiarizarte con la herramienta `pyenv` e investigar más a fondo las funcionalidades que esta provee. Un sitio con una guía muy completa es <a href="https://realpython.com/intro-to-pyenv/" target="_blank" rel="nofollow"> Real Python ➡</a>.

---

Foto de <a href="https://unsplash.com/es/@carlosirineu?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="nofollow, noreferrer">Carlos Irineu da Costa</a> en <a href="https://unsplash.com/es/fotos/fotografia-en-escala-de-grises-de-herramientas-metalicas-eMc0lpn1P60?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="nofollow, noreferrer">Unsplash</a>
