---
title: 'Auditando Máquinas de Desarrollo para Exposición en la Cadena de Suministro con Bumblebee'
slug: 'bumblebee'
date: 2026-05-27T19:53:56+00:00
description: 'Un recorrido práctico por Bumblebee, el escáner de solo lectura de código abierto de Perplexity que te dice qué máquinas de desarrollo tienen una versión específica de un paquete instalada sin invocar ningún gestor de paquetes.'
draft: false
tags: [security, supply-chain, cli]
image: 'images/cover.webp'
---

## 🎯 TL;DR

Bumblebee es un binario Go único que recorre metadatos de paquetes en disco y emite un flujo NDJSON estructurado de lo que encuentra. No se invocan gestores de paquetes, no se realizan llamadas de red durante los escaneos, y no aparecen credenciales en la salida. Responde una pregunta específica: ¿qué paquetes y versiones están instalados en esta máquina de desarrollo ahora mismo?

**Elige tu camino:**

- 🚀 [Inicio rápido](#quick-start)
- 🏗️ [Cómo funciona por dentro](#how-it-works)
- 📦 [Escanear múltiples proyectos](#scan-multiple-projects)
- ⚖️ [Compromisos honestos](#honest-trade-offs)

---

## 🤔 Por qué lo revisé

Los incidentes de cadena de suministro han sido un patrón recurrente en 2026. Dos de ellos ocurrieron muy seguidos y siguieron planteando la misma pregunta. En marzo de 2026, `axios@1.14.1` y `axios@0.30.4` fueron publicados con una dependencia inyectada que ejecutaba un troyano de acceso remoto específico de plataforma durante la instalación. En mayo de 2026, 84 artefactos maliciosos en 42 paquetes `@tanstack/*` llegaron a npm a través de un compromiso de GitHub Actions.

Ningún incidente fue sutil. Ambos se detectaron relativamente rápido. Pero en las horas entre "aviso publicado" y "todas las máquinas confirmadas limpias," la pregunta que seguía apareciendo era la misma: ¿qué máquinas de desarrollo tienen la versión afectada instalada ahora mismo?

Las herramientas habituales responden cosas diferentes. Un SBOM te dice qué se incluyó en un artefacto de producción. Un EDR te dice qué ejecutó o tocó la red. Ninguno te da una respuesta rápida y de solo lectura sobre los lockfiles, instalaciones de herramientas y manifiestos de extensiones dispersos en las laptops de los desarrolladores.

Tengo un directorio `~/code` con varios proyectos viviendo bajo él: un sitio Hugo, un CLI en Go, un par de utilitarios en Python. Quería entender qué podía decirme Bumblebee sobre ese árbol, y cómo funciona internamente. {{< extlink href="https://www.perplexity.ai/hub/blog/perplexity-is-open-sourcing-bumblebee" >}}Perplexity lo publicó como código abierto en mayo de 2026{{< /extlink >}} bajo la licencia Apache 2.0.

---

## 💡 El problema

Cuando un aviso nombra un paquete y versión específicos, la brecha entre "sabemos del problema" y "sabemos quién está afectado" puede ser sorprendentemente amplia.

Buscar manualmente en lockfiles funciona si sabes qué lockfiles existen y dónde están. Pedir a los desarrolladores que revisen sus propias máquinas funciona si tienes tiempo y una forma de recopilar las respuestas. Ninguno de los dos enfoques es rápido ni auditable.

La información existe. Solo está distribuida en docenas de archivos en formatos ligeramente diferentes por ecosistema: `package-lock.json` para npm, `pnpm-lock.yaml` para pnpm, `go.sum` para Go, `*.dist-info/METADATA` para Python, y así sucesivamente. Un escáner que ya sabe dónde viven estos archivos y cómo leerlos es el camino más rápido.

---

## ✨ La solución

Bumblebee es un binario estático único sin dependencias fuera de la biblioteca estándar. Ejecuta, escanea, emite salida y termina. No hay demonio ni estado persistente entre ejecuciones.

La restricción central es que es de solo lectura. Nunca invoca un gestor de paquetes, nunca lee archivos fuente y nunca realiza llamadas de red durante un escaneo. Solo lee los archivos de metadatos que los gestores de paquetes dejan en disco. Esto importa porque una clase de ataques a la cadena de suministro se basa en scripts maliciosos post-instalación. Un escáner que nunca invoca un gestor de paquetes no puede activarlos.

La salida es NDJSON: un registro JSON por línea, escrito en stdout por defecto. Cada registro lleva un campo `record_type`:

- `package`: una instalación descubierta
- `finding`: una coincidencia con el catálogo de exposición
- `scan_summary`: el terminador de ejecución con conteos agregados
- `diagnostic`: escrito solo en stderr, nunca al sink de registros

---

<span id="quick-start"></span>

## 🚀 Inicio rápido

### Instalación

Sigue las instrucciones de instalación en el {{< extlink href="https://www.perplexity.ai/hub/blog/perplexity-is-open-sourcing-bumblebee" >}}anuncio de Bumblebee{{< /extlink >}} para obtener el binario para tu plataforma. La herramienta requiere Go 1.25 o posterior si vas a compilar desde el código fuente.

{{< callout note >}}
Bumblebee solo funciona en macOS y Linux. Windows no está soportado en v0.1.
{{< /callout >}}

{{< callout important >}}
Varios comandos a continuación envían la salida a `jq` para obtener un resultado legible en la terminal. Instálalo antes de ejecutarlos: en macOS ejecuta `brew install jq`, en Linux usa tu gestor de paquetes (`apt install jq`, `dnf install jq`, etc.).
{{< /callout >}}

### Ejecutar un escaneo baseline

El perfil baseline cubre las instalaciones globales de la cadena de herramientas, extensiones del editor (VS Code, Cursor, Windsurf, VSCodium), archivos de configuración MCP y perfiles de extensiones del navegador. No recorre directorios de proyectos.

Una máquina de desarrollo con una cadena de herramientas completa produce cientos de registros. El flujo está diseñado para alimentar un archivo o un sistema downstream, no para leer línea por línea en la terminal.

Para capturar todo para análisis posterior:

```bash
bumblebee scan --profile baseline > baseline-$(date +%Y%m%d).ndjson
```

Para ver solo el resumen en la terminal:

```bash
bumblebee scan --profile baseline | jq 'select(.record_type == "scan_summary")'
```

### Ejecutar un escaneo de proyectos

El perfil project recorre un conjunto fijo de directorios de desarrollo: `~/code`, `~/src`, `~/Developer`, `~/Projects` y `~/workspace`. Los 11 parsers de ecosistemas se ejecutan.

```bash
bumblebee scan --profile project
```

{{< callout note >}}
El perfil project solo busca en esos cinco nombres de directorio. Si tu árbol de desarrollo está en otro lugar (por ejemplo `~/Development`), usa el perfil deep con un root explícito. La salida es igualmente verbosa, así que guárdala en un archivo o filtra solo el resumen:

```bash
bumblebee scan --profile deep --root ~/Development > scan-$(date +%Y%m%d).ndjson
bumblebee scan --profile deep --root ~/Development | jq 'select(.record_type == "scan_summary")'
```

{{< /callout >}}

### Verificar una exposición específica

El repositorio de Bumblebee incluye un directorio `threat_intel/` con archivos de catálogo pre-construidos para incidentes de cadena de suministro documentados. Si compilaste desde el código fuente, el directorio ya está en la raíz de tu repositorio. Si instalaste un binario pre-compilado, descarga el repositorio por separado para obtener los catálogos, luego apunta `--exposure-catalog` a la ruta absoluta.

Como `--findings-only` suprime el flujo completo de paquetes, la salida se limita a las coincidencias y se mantiene legible en la terminal sin redirigir a un archivo:

```bash
bumblebee scan --profile deep --root ~/code \
  --exposure-catalog /ruta/al/repositorio-bumblebee/threat_intel/ \
  --findings-only \
  | jq '.'
```

También puedes escribir tu propio JSON de catálogo usando el formato descrito en el README del proyecto.

---

<span id="how-it-works"></span>

## 🏗️ Cómo funciona por dentro

### Los tres perfiles

La selección de perfil es la forma principal de equilibrar la amplitud del escaneo contra el costo de ejecución.

<div class="table-container">
  <table>
    <tr><th>Perfil</th><th>Qué recorre</th><th>Cadencia típica</th><th>Para qué usarlo</th></tr>
    <tr><td><code>baseline</code></td><td>Instalaciones globales y de usuario de la cadena de herramientas, extensiones del editor, directorios de configuración MCP, perfiles de extensiones del navegador. Sin árboles de proyectos.</td><td>Cada 15 min o al iniciar sesión</td><td>Inventario de herramientas y cadena de herramientas a nivel de flota</td></tr>
    <tr><td><code>project</code></td><td>Directorios de desarrollo configurados: <code>~/code</code>, <code>~/src</code>, <code>~/Developer</code>, <code>~/Projects</code>, <code>~/workspace</code>. Todos los ecosistemas aplican.</td><td>Diariamente</td><td>Inventario de lockfiles y dependencias por proyecto</td></tr>
    <tr><td><code>deep</code></td><td>Cualquier ruta <code>--root</code> explícita, incluyendo directorios home completos. Requiere al menos un argumento <code>--root</code>.</td><td>Bajo demanda</td><td>Barridos de respuesta a incidentes contra un aviso específico</td></tr>
  </table>
</div>

`baseline` y `project` rechazan roots de home completos. Si pasas `$HOME` o `/home/alice` a cualquiera de ellos, el CLI lo rechazará. Solo `deep` acepta un home root completo.

### Recorrido del sistema de archivos

Antes de enviar cualquier archivo a un parser, el walker aplica una lista de exclusión predeterminada:

- Directorios de credenciales: `.ssh`, `.aws`, `.kube`, `.gnupg`, `.docker`
- Internos de VCS: `.git`, `.hg`
- Cachés del sistema macOS: `Library/Caches`, `Library/Mail`, `Library/Messages`
- Datos de aplicación del navegador fuera de las rutas de perfil de extensión enumeradas

Los bucles de enlaces simbólicos se detectan mediante seguimiento de inodos en lugar de comparación de rutas, por lo que el recorrido termina correctamente en cualquier árbol de directorios. Los errores de permisos (`EACCES`, `EPERM`) emiten un diagnóstico de nivel debug y continúan. Los roots opcionales faltantes emiten un diagnóstico de nivel info. Puedes agregar directorios adicionales para omitir con `--exclude`.

### Parsers de ecosistemas

El escáner inicializa 11 structs de parser específicos por ecosistema al arranque. A medida que el walker visita archivos, hace coincidir cada nombre de archivo contra una tabla de despacho y envía los archivos coincidentes al parser apropiado a través de un pool de workers. La concurrencia predeterminada es 4 workers, configurable con `--concurrency`.

Cada parser abre solo el archivo específico que recibe. Nunca recorre un directorio ni llama a un gestor de paquetes.

<div class="table-container">
  <table>
    <tr><th>Archivo</th><th>Parser</th><th>Tipo de fuente</th></tr>
    <tr><td><code>package-lock.json</code>, <code>npm-shrinkwrap.json</code></td><td>npm</td><td><code>npm-lockfile</code></td></tr>
    <tr><td><code>pnpm-lock.yaml</code></td><td>pnpm</td><td><code>pnpm-lockfile</code></td></tr>
    <tr><td><code>yarn.lock</code></td><td>yarn</td><td><code>yarn-lockfile</code></td></tr>
    <tr><td><code>bun.lock</code></td><td>bun</td><td><code>bun-lockfile</code></td></tr>
    <tr><td><code>node_modules/&lt;pkg&gt;/package.json</code></td><td>npm</td><td><code>npm-node_modules</code></td></tr>
    <tr><td><code>*.dist-info/METADATA</code></td><td>pypi</td><td><code>pypi-dist-info</code></td></tr>
    <tr><td><code>go.sum</code></td><td>go</td><td><code>go-sum</code></td></tr>
    <tr><td><code>go.mod</code></td><td>go</td><td><code>go-mod</code></td></tr>
    <tr><td><code>Gemfile.lock</code></td><td>rubygems</td><td><code>gemfile-lock</code></td></tr>
    <tr><td><code>composer.lock</code></td><td>composer</td><td><code>composer-lockfile</code></td></tr>
    <tr><td><code>claude_desktop_config.json</code>, <code>mcp.json</code>, <code>.mcp.json</code>, <code>~/.gemini/settings.json</code></td><td>mcp</td><td><code>mcp-config</code></td></tr>
    <tr><td><code>package.json</code> dentro de <code>.vscode/extensions/…</code></td><td>editor-ext</td><td><code>editor-extension</code></td></tr>
    <tr><td><code>manifest.json</code> dentro de un perfil de extensión de Chromium</td><td>browser-ext</td><td><code>chromium-extension</code></td></tr>
  </table>
</div>

El flag `--ecosystem` restringe qué parsers están activos para una ejecución, útil para escaneos dirigidos o ajuste de rendimiento.

### Tipos de registros y qué contienen

Cada registro lleva un encabezado común: `record_type`, `record_id`, `schema_version`, `scanner_name`, `scanner_version`, `run_id`, `scan_time` y `endpoint` (hostname, OS, arch, nombre de usuario).

Un registro `package` representa una instalación descubierta:

```json
{
    "record_type": "package",
    "ecosystem": "npm",
    "package_name": "axios",
    "normalized_name": "axios",
    "version": "1.14.1",
    "source_file": "/home/alice/code/myapp/package-lock.json",
    "source_type": "npm-lockfile",
    "confidence": "high",
    "has_lifecycle_scripts": false,
    "root_kind": "project_root",
    "profile": "deep"
}
```

El campo `has_lifecycle_scripts` (solo npm, pnpm y yarn) indica si el paquete define hooks de instalación. No significa que esos hooks se ejecutaron durante el escaneo; significa que se ejecutarían si el paquete se instalara a través de un gestor de paquetes. Esa distinción importa al clasificar la exposición.

Un registro `finding` se emite cuando un paquete coincide con el catálogo de exposición. Lleva todos los campos identificadores del registro `package` más `catalog_id`, `catalog_name`, `severity` y `evidence`:

```json
{
    "record_type": "finding",
    "ecosystem": "npm",
    "package_name": "axios",
    "version": "1.14.1",
    "source_file": "/home/alice/code/myapp/package-lock.json",
    "catalog_name": "axios supply chain compromise March 2026",
    "severity": "critical",
    "evidence": "exact name+version match (version=1.14.1)"
}
```

Un registro `scan_summary` siempre se emite al final. Su campo `status` es `complete`, `partial` (si se alcanzó `--max-duration` o el escaneo fue interrumpido) o `error`. Los receptores deben promover una ejecución al estado actual solo después de `status=complete`. Eso importa para escaneos recurrentes donde una ejecución interrumpida no debería sobreescribir un resultado válido anterior.

### Deduplicación

A cada registro `package` se le asigna un `record_id` que es un hash SHA-256 de una tupla de identidad canónica: ecosistema, nombre normalizado, versión, archivo fuente, perfil, tipo de root y algunos otros campos. Si dos parsers encuentran el mismo paquete lógico dentro de la misma ejecución (por ejemplo, un paquete que aparece tanto en `package-lock.json` como en `node_modules/`), solo se emite el primero. El `record_id` es estable entre ejecuciones, por lo que el mismo paquete observado de manera idéntica en escaneos consecutivos produce el mismo ID. Los receptores pueden usarlo como clave de deduplicación al construir tablas de estado actual.

### Coincidencia con el catálogo de exposición

Cuando se proporciona `--exposure-catalog`, cada registro `package` aceptado se compara con el catálogo usando coincidencia exacta de `(ecosystem, normalized_name, version)`. Sin rangos semver, sin coincidencia difusa. Una coincidencia produce un registro `finding` por entrada del catálogo que coincide. El repositorio de Bumblebee incluye un directorio `threat_intel/` con catálogos pre-construidos mantenidos a partir de informes públicos de cadena de suministro. Apunta `--exposure-catalog` a ese directorio o a cualquier archivo JSON de catálogo que escribas tú mismo.

---

<span id="scan-multiple-projects"></span>

## 📦 Escanear múltiples proyectos

El perfil deep acepta cualquier directorio como root, lo que lo hace la opción correcta para escanear un árbol de desarrollo sin importar cómo se llame. Pasa tu directorio de desarrollo con `--root` y Bumblebee recorre todo lo que haya bajo él. Cada registro `package` lleva `root_kind: "project_root"` y un `source_file` con la ruta absoluta al archivo que se leyó. Puedes saber exactamente de qué proyecto proviene una dependencia.

Para obtener una vista plana de todo lo instalado en todos tus proyectos:

```bash
bumblebee scan --profile deep --root ~/code \
  | jq -r 'select(.record_type == "package") | [.ecosystem, .package_name, .version, .source_file] | @tsv'
```

Para árboles de desarrollo grandes la salida puede ser extensa. Redirígela a un archivo para revisarla con calma:

```bash
bumblebee scan --profile deep --root ~/code \
  | jq -r 'select(.record_type == "package") | [.ecosystem, .package_name, .version, .source_file] | @tsv' \
  > packages-$(date +%Y%m%d).tsv
```

Para reducir a un ecosistema específico:

```bash
bumblebee scan --profile deep --root ~/code --ecosystem npm \
  | jq -r 'select(.record_type == "package") | [.package_name, .version, .source_file] | @tsv'
```

Para verificar todos los proyectos en busca de versiones comprometidas conocidas en un solo paso, apunta el escaneo al directorio `threat_intel/` del repositorio de Bumblebee. Con `--findings-only` el flujo se limita a coincidencias, por lo que la salida en la terminal se mantiene manejable sin redirigir a un archivo:

```bash
bumblebee scan --profile deep --root ~/code \
  --exposure-catalog /ruta/al/repositorio-bumblebee/threat_intel/ \
  --findings-only \
  | jq '.'
```

Si el resumen muestra `findings_emitted: 0`, ninguno de los proyectos bajo tu directorio de desarrollo coincide con el catálogo. Si aparecen findings, cada uno te da el archivo exacto, ecosistema, versión y severidad.

### Respuesta a incidentes con el perfil deep

Si necesitas barrer un directorio home directamente, usa el perfil deep. Acepta home roots completos y cualquier ruta `--root` explícita:

```bash
bumblebee scan --profile deep \
  --root /home/alice \
  --exposure-catalog axios-advisory.json \
  --findings-only
```

{{< callout warning >}}
El perfil deep recorre toda la ruta root que proporcionas, sujeta solo a la lista de exclusión predeterminada y cualquier flag `--exclude` que agregues. En un directorio home, cubrirá cada árbol de proyectos, instalación de herramientas y archivo de configuración que pueda alcanzar. Esto es intencional para respuesta a incidentes pero tarda más que un escaneo project o baseline.
{{< /callout >}}

En macOS, el flag `--all-users` expande los escaneos baseline y project por cada home `/Users/<name>` sin requerir un home root completo. Eso lo hace práctico para que una sola invocación desplegada por MDM cubra todas las cuentas de desarrollador en una máquina.

---

<span id="honest-trade-offs"></span>

## ⚖️ Compromisos honestos

<div class="table-container">
  <table>
    <tr><th>Lo que ganas</th><th>Lo que pierdes</th></tr>
    <tr><td>Escaneo de solo lectura: sin riesgo de activar scripts post-instalación durante el análisis</td><td>Solo coincidencia de versión exacta: sin rangos semver, sin expresiones comodín</td></tr>
    <tr><td>Funciona completamente desde estado en disco: sin acceso a registros, sin llamadas de red</td><td>Solo macOS y Linux en v0.1: sin soporte para Windows</td></tr>
    <tr><td>Cubre configuraciones de MCP y herramientas de IA que ningún otro escáner inventaría actualmente</td><td>La programación es responsabilidad del operador: cron, launchd o MDM (Bumblebee no gestiona la cadencia por sí mismo)</td></tr>
    <tr><td><code>record_id</code> estable entre ejecuciones hace que la deduplicación sea trivial para receptores downstream</td><td>El catálogo de exposición debe mantenerse: el escáner solo es tan útil como las entradas del catálogo que incluye o que tú mantienes actualizadas</td></tr>
    <tr><td>NDJSON se conecta limpiamente a jq, bases de datos o cualquier endpoint HTTP</td><td>Existen registros <code>confidence: medium</code> o <code>confidence: low</code> para metadatos parciales: la atribución de versión es menos cierta en esos casos</td></tr>
  </table>
</div>

---

## 🔑 Conclusiones clave

1. La brecha que llena Bumblebee es específica: no "qué se envió" o "qué se ejecutó," sino "qué está instalado en esta máquina de desarrollo ahora mismo."
2. El diseño de solo lectura es una elección deliberada. Leer archivos de metadatos es más lento que preguntarle directamente a un gestor de paquetes y evita deliberadamente activar cualquier cosa que los paquetes definan.
3. Los tres perfiles te permiten ajustar la amplitud al costo. Baseline cubre la cadena de herramientas global y las configuraciones de herramientas de IA. Project cubre todos los proyectos en tus directorios de desarrollo estándar. Deep cubre todo cuando lo necesitas.
4. El catálogo de exposición desacopla la inteligencia de amenazas del binario del escáner. Puedes actualizar el catálogo y volver a ejecutar sin tocar el binario ni esperar una actualización de la herramienta.
5. La cobertura de configuraciones MCP importa ahora. Las herramientas de codificación con IA son estándar en las máquinas de los desarrolladores, y sus configuraciones son una superficie de ataque significativa. Bumblebee las inventaría de la misma manera que inventaría paquetes npm.

---

## Reflexión final

Lo que encuentro útil de Bumblebee es que tiene un enfoque limitado. No intenta reemplazar tu EDR ni tu pipeline de SBOM. Responde una pregunta y la responde desde el estado en disco sin ejecutar nada.

Ese enfoque limitado es lo que lo hace práctico para ejecutar en un horario o para incorporarlo a un flujo de trabajo de respuesta a incidentes. Un escaneo termina, emite un `scan_summary` con `status=complete` y termina. Las herramientas downstream manejan el resto.

Si tienes un directorio de desarrollo con varios proyectos viviendo bajo él, ejecutar `bumblebee scan --profile deep --root ~/code` y pasar por `jq` vale la pena hacerlo una vez solo para ver cómo luce el panorama completo. Puede que encuentres versiones que no esperabas todavía ancladas en lockfiles más antiguos.

¿Qué ecosistemas o tipos de configuración te gustaría ver agregados en una versión futura? Me pregunto si la cobertura de Cargo o Maven cambiaría qué tan útil es esto para equipos que trabajan principalmente con Rust o el ecosistema JVM. Escríbeme en {{< extlink href="https://www.linkedin.com/in/jonathanbucaro/" >}}LinkedIn{{< /extlink >}}.

---

Foto de {{< extlink href="https://unsplash.com/@kai_wenzel?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Kai Wenzel{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/yellow-and-black-wasp-RDstSU6vp6A?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
