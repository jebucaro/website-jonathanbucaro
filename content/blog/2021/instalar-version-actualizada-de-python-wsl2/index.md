---
title: "Instala una version actualizada de Python en WSL2"
date: 2021-03-05T16:45:06-06:00
image: "/blog/instalar-version-actualizada-de-python-wsl2/images/cover.webp"
tags: [windows, wsl, python]
draft: false
description: "Accede a una versión de Python actualizada en Ubuntu en WSL2 con estos sencillos pasos."
---
Ubuntu LTS 20.04 trae por defecto instalado Python 3.8, esta distribución fue la que escogí en su momento para crear mi ambiente en WSL2. Algo similar ocurre en Ubuntu LTS 22.04 en donde la versión de Python es la 3.10.

Puede que te encuentres ante la necesidad de actualizar la versión de Python en Ubuntu. A continuación detallo los pasos sencillos para instalar una nueva versión de Python en Ubuntu en WSL.

## ➕ Agrega el repositorio PPA de deadsnakes

Actualizar a la última versión es bastante sencillo gracias al repositorio PPA de deadsnakes quienes mantienen las últimas versiones de Python empaquetadas para Ubuntu.

```bash
sudo add-apt-repository ppa:deadsnakes/ppa
```
Al agregar el repositorio se muestra un mensaje de confirmación. Adicionalmente muestra que paquetes estarán disponibles al agregar el repositorio. Presiona Enter para confirmar.

Procede a actualizar el listado de paquetes.

```bash
sudo apt update
```

## 💾 Instala una nueva versión de Python

Instala una versión de Python actualizada según tus necesidades. En este caso instalaré la versión 3.11.

```bash
sudo apt install python3.11 python3.11-venv
```

## ✅ Comprobación

Para validar la instalación podemos utilizar el comando `which`, el cual nos permitirá ubicar el lugar en donde se encuentra instalada cada versión de Python.

```bash
which python3; which python3.11
```

```text
/usr/bin/python3
/usr/bin/python3.11
```

Adicionalmente puedes comprobar la versión de Python

```bash
python3 --version; python3.11 --version
```

```
Python 3.10
Python 3.11.4
```

## 👀 Cambios en el modo de operación

Como te podrás haber dado cuenta en la forma en la que se realizó la comprobación, para hacer uso de Python 3.11 debes utilizar el comando `python3.11` en lugar de `python3` o `python`.

Es decir que para poder crear tus ambientes virtuales con `venv`, debes realizarlo de la siguiente manera.

```bash
python3.11 -m venv .venv
```

Ahora ya dispones de la última versión estable de Python en WSL2 usuando Ubuntu.

## ⚠️ Consideraciones Adicionales

Según la descripción en el <a href="https://launchpad.net/~deadsnakes/+archive/ubuntu/ppa" target="_blank">PPA de deadsnakes ➡</a>, los paquetes proveídos poseen algunas modificacioens. Los paquetes siguen los patrones de debian y a menudo no incluyen una distribución completa de python con solo `apt install python#.#`. Aquí hay una lista de paquetes que pueden ser útiles junto con la instalación predeterminada:

+ `python#.#-dev`: incluye encabezados de desarrollo para construir extensiones de C
+ `python#.#-venv`: provee la librería estandar, modulo `venv`
+ `python#.#-distutils`: provee la librería estandar, modulo `distutils`
+ `python#.#-lib2to3`: provee la utilidad `2to3-#.#` así como también la librería estandar, modulo `lib2to3`
+ `python#.#-gdbm`: provee la librería estandar, modulo `dbm.gnu`
+ `python#.#-tk`: provee la librería estandar, modulo `tkinter`


---
Foto de <a href="https://unsplash.com/es/@davidclode?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="nofollow, noreferrer">David Clode</a> en <a href="https://unsplash.com/es/fotos/5uU8HSpfwkI?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="nofollow, noreferrer">Unsplash</a>
  