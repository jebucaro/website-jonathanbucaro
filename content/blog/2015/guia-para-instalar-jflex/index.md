---
title: 'Guía para instalar JFlex'
date: 2015-04-11T10:01:20-06:00
image: '/blog/guia-para-instalar-jflex/images/cover.webp'
tags: [java]
draft: false
description: 'JFlex es una herramienta que ofrece una gran cantidad de características para ayudar a crear analizadores léxicos de manera rápida y eficiente.'
---

JFlex es una herramienta de análisis léxico para Java y escrito en Java. Está diseñada para generar analizadores léxicos a partir de una descripción de lenguaje léxico en formato de cadena. El proceso de instalación es bastante sencillo, a continuación se detallan los pasos para poder realizar una instalación exitosa.

## 📌 Comprobar prerrequisitos

En la ventana de comando, ejecuta el siguiente comando para obtener la versión de java que se encuentra instalada actualmente en tu equipo.

```bash
java --version
```

```text
java 19.0.1 2022-10-18
Java(TM) SE Runtime Environment (build 19.0.1+10-21)
Java HotSpot(TM) 64-Bit Server VM (build 19.0.1+10-21, mixed mode, sharing)
```

Si java se encuentra instalado y configurado correctamente, el resultado de mostrará la información de la versión de java instalada en el equipo. De lo contrario deberás verificar la instalación. Normalmente se debe a que no se ha agregado la carpeta bin de java al path de las variables de entorno.

## 📦 Descargar JFlex

Visita el sitio de JFlex y <a href="https://jflex.de/download.html" target="_blank" rel="nofollow" title="Sitio de descargas de JFlex">descarga ➡</a> el archivo comprimido correspondiente a la última versión de JFlex.

## 🔧 Configurar JFlex

Extrae el contenido del archivo a un directorio la cual será considerado como el directorio de instalación. En este ejemplo se utilizará el drive C. El contenido de la versión descargada en este ejemplo es la 1.8.2.

```text
    C:\jflex\
        +--bin\                        (start scripts)
        +--doc\                        (FAQ and manual)
        +--examples\
            +--byaccj\                 (calculator example for BYacc/J)
            +--cup-maven\              (calculator example for cup and maven)
            +--interpreter\            (interpreter example for cup)
            +--java\                   (Java lexer specification)
            +--simple\                 (example scanner with no parser)
            +--standalone-maven\       (a simple standalone scanner,
                                        built with maven)
            +--zero-reader\            (Readers that return 0 characters)
        +--lib\                        (precompiled classes)
        +--src\
            +--main\
                +--config\             (PMD source analyzer configuration)
                +--cup\                (JFlex parser spec)
                +--java\
                    +--jflex\          (source code of JFlex)
                        +--anttask\    (source code of JFlex Ant Task)
                        +--gui\        (source code of JFlex UI classes)
                        +--unicode\    (source code for Unicode properties)
                +--jflex\              (JFlex scanner spec)
                +--resources\          (messages and default skeleton file)
            +--test\                   (unit tests)
```

Ubica en el directorio de instalación el archivo `jflex.bat` en el directorio `bin`.

Edita el archivo `bin\jflex.bat` de tal forma que `JFLEX_HOME` contenga la ruta hacia el directorio en donde fue instalado JFlex. De haber seguido los pasos de esta guía, no es necesario realizar modificaciones al archivo.

Como detalle adicional, en caso si necesites modificar el archivo `bin\jflex.bat`, según recomendación de JFlex, no se debe agregar una diagonal invertida al final de la ruta que se define en `JFLEX_HOME`.

Por último, incluye el directorio `c:\jflex\bin` al final del `Path` en las variables de entorno.

## ✅ Comprobar instalación

Para verificar que se haya instalado y configurado correctamente JFlex, se procede a ejecutar el siguiente comando en la ventana de comando.

```bash
jflex --version
```

Si todo se encuentra en orden, al ejecutar el comando se mostrará un mensaje indicando la versión que descargaste de JFlex. En este caso la 1.8.2.

```text
This is JFlex 1.8.2
```

---

Foto de <a href="https://unsplash.com/es/@egorghetto?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="nofollow, noreferrer">Eduardo Gorghetto</a> en <a href="https://unsplash.com/es/fotos/vJ3KldG86Eo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="nofollow, noreferrer">Unsplash</a>
