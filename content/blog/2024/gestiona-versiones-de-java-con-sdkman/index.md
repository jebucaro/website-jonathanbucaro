---
title: "Gestiona diferentes versiones de Java con SDKMAN"
date: 2024-03-19T13:40:42-06:00
image: "/blog/sdkman/images/cover.webp"
tags: [java]
draft: false
description: "Piensa en SDKMAN como tu amigable herramienta de trabajo, lista para simplificar la gestión de SDK para ti."
---

Ha llegado el día en el que debo trabajar con Java. Adiconalmente me he visto en la necesidad de alternar entre distintas versiones, buscando, me he encontrado con esta útil herramienta llamada SDKMAN.

> SDKMAN permite administrar múltiples SDKs en sistemas Unix.

En mi caso lo utilizo para poder administrar diferentes SDKs de Java.

## 📌 Precondiciones

El script de instalación de SDKMAN necesita tener instalado previamente `bash`, `zip`, `unzip`, `curl`.

En mi caso, utilizo Ubuntu LTS 22.04 en WSL2, únicamente me vi en la necesidad de instalar `zip`, `unzip` y `curl`.

```bash
sudo apt install zip unzip curl
```

## ⚙️ Instalación

La instalación es bastante sencilla, ejecuta la siguiente instrucción:

```bash
curl -s "https://get.sdkman.io" | bash 
```

Al finalizar la instalción, se solicitará abrir una nueva terminal o ejecutar un comando por medio de `source`.

Comprueba la instalación ejecutando

```bash
sdk version
```

El resultado deberá ser similar al siguiente:

```text
SDKMAN!
script: 5.18.2
native: 0.4.6
```

## 🛠️ Uso básico de SDKMAN

### Listar las diferentes versiones de Java disponibles

```bash
sdk list java
```

Mostrará un listado en columnas, en mi caso necesito utilizar Open JDK 21 por lo que utilizaré la versión `21.0.2` de `Java.net`. El identificador que corresponde es `21.0.2-open`.

```text
================================================================================
Available Java Versions for Linux 64bit
================================================================================
 Vendor        | Use | Version      | Dist    | Status     | Identifier
--------------------------------------------------------------------------------
 Corretto      |     | 21.0.2       | amzn    |            | 21.0.2-amzn
               |     | 21.0.1       | amzn    |            | 21.0.1-amzn
               |     | 17.0.10      | amzn    |            | 17.0.10-amzn
               |     | 17.0.9       | amzn    |            | 17.0.9-amzn
               |     | 11.0.22      | amzn    |            | 11.0.22-amzn
               |     | 11.0.21      | amzn    |            | 11.0.21-amzn
               |     | 8.0.402      | amzn    |            | 8.0.402-amzn
               |     | 8.0.392      | amzn    |            | 8.0.392-amzn
 Dragonwell    |     | 17.0.10      | albba   |            | 17.0.10-albba
               |     | 17.0.9       | albba   |            | 17.0.9-albba
```

```text
 Java.net      |     | 23.ea.14     | open    |            | 23.ea.14-open
               |     | 23.ea.13     | open    |            | 23.ea.13-open
               |     | 23.ea.12     | open    |            | 23.ea.12-open
               |     | 23.ea.11     | open    |            | 23.ea.11-open
               |     | 23.ea.10     | open    |            | 23.ea.10-open
               |     | 23.ea.8      | open    |            | 23.ea.8-open
               |     | 23.ea.7      | open    |            | 23.ea.7-open
               |     | 23.ea.6      | open    |            | 23.ea.6-open
               |     | 23.ea.5      | open    |            | 23.ea.5-open
               |     | 23.ea.4      | open    |            | 23.ea.4-open
               |     | 23.ea.3      | open    |            | 23.ea.3-open
               |     | 23.ea.2      | open    |            | 23.ea.2-open
               |     | 23.ea.1      | open    |            | 23.ea.1-open
               |     | 22           | open    |            | 22-open
               |     | 22.ea.36     | open    |            | 22.ea.36-open
               |     | 22.ea.35     | open    |            | 22.ea.35-open
               |     | 22.ea.34     | open    |            | 22.ea.34-open
               |     | 22.ea.33     | open    |            | 22.ea.33-open
               |     | 22.ea.32     | open    |            | 22.ea.32-open
               |     | 22.ea.31     | open    |            | 22.ea.31-open
               |     | 22.ea.30     | open    |            | 22.ea.30-open
               |     | 22.ea.29     | open    |            | 22.ea.29-open
               |     | 22.ea.28     | open    |            | 22.ea.28-open
               |     | 22.ea.27     | open    |            | 22.ea.27-open
               |     | 22.ea.26     | open    |            | 22.ea.26-open
               |     | 21.ea.35     | open    |            | 21.ea.35-open
               |     | 21.0.2       | open    |            | 21.0.2-open
```

Puedes salir de la vista de lista con la tecla `q`.

### Instalar una versión específica de Java

Para instalar una versión específica de Java, envía como parámetro el identificador correspondiente a la versión de Java deseada.

```bash
sdk install java 21.0.2-open
```

SDKMAN procederá a descargar y configurar el SDK como la versión por defecto. Puedes comprobar la instalación de la siguiente manera.

```bash
java --version
```

```text
openjdk 21.0.2 2024-01-16
OpenJDK Runtime Environment (build 21.0.2+13-58)
OpenJDK 64-Bit Server VM (build 21.0.2+13-58, mixed mode, sharing)
```

En caso necesites descargar otra versión unicamente debes ubicar el identificador, por ejemplo, `17.0.9-oracle`.

```bash
sdk install java 17.0.9-oracle
```

En este caso, al finalizar la instalación SDKMAN te consultará si deseas colocar la versión descargada como la versión por defecto.

### Obtener la versión en uso de Java

```bash
sdk current java
```

```text
Using java version 21.0.2-open
```

### Cambiar la versión en uso de Java

#### Cambio en terminal o sesión actual

```bash
sdk use java 17.0.9-oracle
```

```text
Using java version 17.0.9-oracle in this shell.
```

#### Cambio en la versión por defecto

```bash
sdk default java 17.0.9-oracle
```

```text
setting java 17.0.9-oracle as the default version for all shells.
```

## ⬆️ Configura una versión de Java por proyecto con SDKMAN

Considero que el mejor uso que puedes darle a SDKMAN es la configuración por proyecto, de esta forma te aseguras que para el uso del proyecto, se use una versión específica de Java. La configuración del ambiente se realiza por medio de los archivos `.sdkmanrc`.

### Crea un archivo de configuración `.sdkmanrc`

Para esta configuración ingresaré a la carpeta del proyecto, de lo contrario el archivo `.sdkmanrc` será creado en la carpeta donde ejecutes el comando.

```bash
sdk env init
```

```text
.sdkmanrc created.
```

El archivo se poblará automáticamente con la versión en uso. Edita el archivo con la versión de Java deseada para el proyecto. Debes colocar el identificador de la versiób,

```ini
# Enable auto-env through the sdkman_auto_env config
# Add key=value pairs of SDKs to use below
java=21.0.2-open
```

...

```ini
# Enable auto-env through the sdkman_auto_env config
# Add key=value pairs of SDKs to use below
java=17.0.9-oracle
```

### Activa la versión de Java correspondiente al proyecto

Dentro de la carpeta del proyecto, ejecuta el siguiente comando.

```bash
sdk env
```

```text
Using java version 17.0.9-oracle in this shell.
```

### Restaura la versión de Java por defecto

Al terminar de usar la versión de Java del proyecto, puedes restaurar la versión por defecto con el siguiente comando.

```bash
sdk env clear
```

```text
Restored java version to 21.0.2-open (default)
```

## 🏁 Conclusiones

SDKMAN es una elegante herramienta de trabajo para instalar diversos tipos de SDK, incluso cambiar entre distintas versiones. En este artículo se presenta el uso de su funcionalidad enfocada en Java.

Considera explorar los SDKs que se encuentran disponibles en esta herramienta 😉.

---


