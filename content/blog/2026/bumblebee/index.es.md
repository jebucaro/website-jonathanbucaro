---
title: 'Auditando Máquinas de Desarrollo para Exposición en la Cadena de Suministro con Bumblebee'
slug: 'bumblebee'
date: 2026-05-27T19:53:56+00:00
description: 'Un recorrido práctico por Bumblebee, el escáner de solo lectura de código abierto de Perplexity que te dice qué máquinas de desarrollo tienen una versión específica de un paquete instalada sin invocar ningún gestor de paquetes.'
draft: false
tags: [security, supply-chain, cli]
image: 'images/cover.png'
---

## Por qué lo revisé

Los incidentes de cadena de suministro han sido un patrón recurrente en 2026. En marzo, `axios@1.14.1` y `axios@0.30.4` se publicaron con una dependencia inyectada que ejecutaba un troyano de acceso remoto específico de plataforma durante la instalación. En mayo, 84 artefactos maliciosos en 42 paquetes `@tanstack/*` llegaron a npm a través de un compromiso de GitHub Actions. Ambos se detectaron rápido, pero en las horas entre "aviso publicado" y "todas las máquinas confirmadas limpias," seguía apareciendo la misma pregunta: ¿qué máquinas de desarrollo tienen la versión afectada instalada ahora mismo?

Un SBOM te dice qué se incluyó en un artefacto de producción. Un EDR te dice qué ejecutó o tocó la red. Ninguno te da una respuesta rápida y de solo lectura sobre los lockfiles, instalaciones de herramientas y manifiestos de extensiones dispersos en las laptops de los desarrolladores. Buscar a mano solo funciona si sabes dónde vive cada lockfile, y pedirle a cada desarrollador que revise su propia máquina solo funciona si tienes tiempo para recopilar las respuestas.

Tengo un directorio `~/code` con varios proyectos: un sitio Hugo, un CLI en Go, un par de utilitarios en Python. Quería ver qué podía decirme Bumblebee sobre ese árbol y cómo funciona por dentro. {{< extlink href="https://www.perplexity.ai/hub/blog/perplexity-is-open-sourcing-bumblebee" >}}Perplexity lo publicó como código abierto en mayo de 2026{{< /extlink >}} bajo la licencia Apache 2.0.

La información que necesita un escáner ya existe en disco, solo está repartida en docenas de archivos con un formato distinto por ecosistema: `package-lock.json` para npm, `pnpm-lock.yaml` para pnpm, `go.sum` para Go, `*.dist-info/METADATA` para Python, y así.

## Qué es

Bumblebee es un binario estático en Go sin dependencias fuera de lo común. Ejecuta, escanea, emite salida y termina, sin demonio ni estado entre ejecuciones.

La restricción central es que es de solo lectura. Nunca invoca un gestor de paquetes, nunca lee archivos fuente y nunca hace llamadas de red durante un escaneo, solo lee los archivos de metadatos que los gestores de paquetes dejan en disco. Esto importa porque una clase de ataques a la cadena de suministro se basa en scripts maliciosos post-instalación, y un escáner que nunca invoca un gestor de paquetes no puede activarlos.

La salida es NDJSON, un registro JSON por línea a stdout por defecto. Cada registro lleva un campo `record_type`:

- `package`: una instalación descubierta
- `finding`: una coincidencia con el catálogo de exposición
- `scan_summary`: el terminador de ejecución con conteos agregados
- `diagnostic`: escrito solo en stderr, nunca al flujo de registros

## Inicio rápido

### Instalación

Sigue las instrucciones del {{< extlink href="https://www.perplexity.ai/hub/blog/perplexity-is-open-sourcing-bumblebee" >}}anuncio de Bumblebee{{< /extlink >}} para obtener el binario de tu plataforma. Compilarlo desde el código fuente requiere Go 1.25 o posterior.

{{< callout note >}}
Bumblebee solo funciona en macOS y Linux. Windows no está soportado en v0.1.
{{< /callout >}}

{{< callout important >}}
Varios comandos abajo envían la salida a `jq` para que sea legible en la terminal. Instálalo antes: en macOS ejecuta `brew install jq`, en Linux usa tu gestor de paquetes (`apt install jq`, `dnf install jq`, etc.).
{{< /callout >}}

### Ejecuta un escaneo baseline

El perfil baseline cubre las instalaciones globales de la cadena de herramientas, extensiones del editor (VS Code, Cursor, Windsurf, VSCodium), archivos de configuración MCP y perfiles de extensiones del navegador. No recorre directorios de proyectos.

Una máquina con la cadena de herramientas completa produce cientos de registros, así que redirígelos a un archivo o a un sistema downstream en vez de leerlos línea por línea:

```bash
bumblebee scan --profile baseline > baseline-$(date +%Y%m%d).ndjson
```

Para ver solo el resumen en la terminal:

```bash
bumblebee scan --profile baseline | jq 'select(.record_type == "scan_summary")'
```

### Ejecuta un escaneo de proyectos

El perfil project recorre un conjunto fijo de directorios de desarrollo: `~/code`, `~/src`, `~/Developer`, `~/Projects` y `~/workspace`. Corren los 11 parsers de ecosistemas.

```bash
bumblebee scan --profile project
```

{{< callout note >}}
El perfil project solo busca en esos cinco nombres de directorio. Si tu árbol de desarrollo vive en otro lugar (por ejemplo `~/Development`), usa el perfil deep con un root explícito:

```bash
bumblebee scan --profile deep --root ~/Development > scan-$(date +%Y%m%d).ndjson
bumblebee scan --profile deep --root ~/Development | jq 'select(.record_type == "scan_summary")'
```

{{< /callout >}}

### Verifica una exposición específica

El repositorio de Bumblebee incluye un directorio `threat_intel/` con catálogos ya construidos para incidentes de cadena de suministro documentados. Si compilaste desde el código fuente, el directorio ya está en la raíz de tu repositorio. Si instalaste un binario ya compilado, descarga el repositorio aparte para obtener los catálogos y apunta `--exposure-catalog` a la ruta absoluta.

`--findings-only` suprime el flujo completo de paquetes, así que la salida se limita a las coincidencias y se mantiene legible en la terminal sin redirigir a un archivo:

```bash
bumblebee scan --profile deep --root ~/code \
  --exposure-catalog /ruta/al/repositorio-bumblebee/threat_intel/ \
  --findings-only \
  | jq '.'
```

También puedes escribir tu propio JSON de catálogo usando el formato descrito en el README del proyecto.

## Cómo funciona por dentro

### Los tres perfiles

La selección de perfil es la forma principal de equilibrar la amplitud del escaneo contra el costo de ejecución.

<div class="table-container">
  <table>
    <tr><th>Perfil</th><th>Qué recorre</th><th>Cadencia típica</th><th>Para qué usarlo</th></tr>
    <tr><td><code>baseline</code></td><td>Instalaciones globales y de usuario de la cadena de herramientas, extensiones del editor, directorios de configuración MCP, perfiles de extensiones del navegador. Sin árboles de proyectos.</td><td>Cada 15 min o al iniciar sesión</td><td>Inventario de herramientas a nivel de flota</td></tr>
    <tr><td><code>project</code></td><td>Directorios de desarrollo configurados: <code>~/code</code>, <code>~/src</code>, <code>~/Developer</code>, <code>~/Projects</code>, <code>~/workspace</code>. Todos los ecosistemas aplican.</td><td>Diariamente</td><td>Inventario de lockfiles y dependencias por proyecto</td></tr>
    <tr><td><code>deep</code></td><td>Cualquier ruta <code>--root</code> explícita, incluyendo directorios home completos. Requiere al menos un argumento <code>--root</code>.</td><td>Bajo demanda</td><td>Barridos de respuesta a incidentes contra un aviso específico</td></tr>
  </table>
</div>

`baseline` y `project` rechazan roots de home completos: si le pasas `$HOME` o `/home/alice` a cualquiera de los dos, el CLI lo rechaza. Solo `deep` acepta un home root completo.

### Recorrido del sistema de archivos

Antes de enviar cualquier archivo a un parser, el walker aplica una lista de exclusión predeterminada:

- Directorios de credenciales: `.ssh`, `.aws`, `.kube`, `.gnupg`, `.docker`
- Internos de VCS: `.git`, `.hg`
- Cachés del sistema en macOS: `Library/Caches`, `Library/Mail`, `Library/Messages`
- Datos de aplicación del navegador fuera de las rutas de perfil de extensión enumeradas

Los bucles de enlaces simbólicos se detectan mediante seguimiento de inodos en vez de comparación de rutas, así que el recorrido termina correctamente en cualquier árbol de directorios. Los errores de permisos (`EACCES`, `EPERM`) emiten un diagnóstico de nivel debug y continúan. Los roots opcionales faltantes emiten un diagnóstico de nivel info. Puedes agregar directorios adicionales para omitir con `--exclude`.

### Parsers de ecosistemas

El escáner inicializa 11 parsers específicos por ecosistema al arrancar. Mientras el walker visita archivos, compara cada nombre contra una tabla de despacho y envía las coincidencias al parser correspondiente a través de un pool de workers (concurrencia predeterminada de 4, configurable con `--concurrency`). Cada parser abre solo el archivo específico que recibe, nunca recorre un directorio ni llama a un gestor de paquetes.

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

El flag `--ecosystem` restringe qué parsers están activos en una ejecución, útil para escaneos dirigidos o ajuste de rendimiento.

### Tipos de registros y qué contienen

Cada registro lleva un encabezado común: `record_type`, `record_id`, `schema_version`, `scanner_name`, `scanner_version`, `run_id`, `scan_time` y `endpoint` (hostname, OS, arquitectura, nombre de usuario).

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

El campo `has_lifecycle_scripts` (solo npm, pnpm y yarn) indica si el paquete define hooks de instalación, no si esos hooks se ejecutaron durante el escaneo. Significa que se ejecutarían si el paquete se instalara a través de un gestor de paquetes, algo que importa al clasificar la exposición.

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

Un registro `scan_summary` siempre se emite al final. Su campo `status` es `complete`, `partial` (si se alcanzó `--max-duration` o el escaneo se interrumpió) o `error`. Los receptores solo deberían promover una ejecución al estado actual después de `status=complete`, para que una ejecución interrumpida no sobrescriba un resultado válido anterior.

### Deduplicación

A cada registro `package` se le asigna un `record_id`: un hash SHA-256 de una tupla de identidad canónica con ecosistema, nombre normalizado, versión, archivo fuente, perfil, tipo de root y algunos otros campos. Si dos parsers encuentran el mismo paquete lógico en la misma ejecución (por ejemplo, uno que aparece tanto en `package-lock.json` como en `node_modules/`), solo se emite el primero. Como el `record_id` es estable entre ejecuciones, el mismo paquete observado de forma idéntica en escaneos consecutivos produce el mismo ID, así que los receptores pueden usarlo como clave de deduplicación para tablas de estado actual.

### Coincidencia con el catálogo de exposición

Cuando le pasas `--exposure-catalog`, cada registro `package` aceptado se compara con el catálogo usando coincidencia exacta de `(ecosystem, normalized_name, version)`, sin rangos semver ni coincidencia difusa. Una coincidencia produce un registro `finding` por cada entrada del catálogo que coincide. El repositorio de Bumblebee incluye un directorio `threat_intel/` con catálogos mantenidos a partir de reportes públicos de cadena de suministro, así que apunta `--exposure-catalog` a ese directorio o a cualquier archivo JSON de catálogo que escribas tú.

## Escanear múltiples proyectos

El perfil deep acepta cualquier directorio como root, lo que lo hace la opción correcta para escanear un árbol de desarrollo sin importar cómo se llame. Pasa tu directorio de desarrollo con `--root` y Bumblebee recorre todo lo que haya debajo. Cada registro `package` lleva `root_kind: "project_root"` y un `source_file` con la ruta absoluta, así puedes saber exactamente de qué proyecto viene cada dependencia.

Para obtener una vista plana de todo lo instalado en todos tus proyectos:

```bash
bumblebee scan --profile deep --root ~/code \
  | jq -r 'select(.record_type == "package") | [.ecosystem, .package_name, .version, .source_file] | @tsv'
```

Para árboles de desarrollo grandes la salida puede ser extensa, así que redirígela a un archivo para revisarla con calma:

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

Para verificar todos los proyectos en busca de versiones comprometidas conocidas en un solo paso, apunta el escaneo al directorio `threat_intel/` del repositorio de Bumblebee. Con `--findings-only` el flujo se limita a las coincidencias:

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
El perfil deep recorre toda la ruta root que le des, sujeto solo a la lista de exclusión predeterminada y cualquier flag `--exclude` que agregues. En un directorio home, cubre cada árbol de proyectos, instalación de herramientas y archivo de configuración que pueda alcanzar. Eso es intencional para respuesta a incidentes, pero tarda más que un escaneo project o baseline.
{{< /callout >}}

En macOS, el flag `--all-users` expande los escaneos baseline y project a cada home `/Users/<name>` sin requerir un home root completo, así una sola invocación desplegada por MDM cubre todas las cuentas de desarrollador en una máquina.

## Compromisos honestos

<div class="table-container">
  <table>
    <tr><th>Lo que ganas</th><th>Lo que pierdes</th></tr>
    <tr><td>Escaneo de solo lectura: sin riesgo de activar scripts post-instalación durante el análisis</td><td>Solo coincidencia de versión exacta: sin rangos semver, sin expresiones comodín</td></tr>
    <tr><td>Funciona completamente desde estado en disco: sin acceso a registros, sin llamadas de red</td><td>Solo macOS y Linux en v0.1: sin soporte para Windows</td></tr>
    <tr><td>Cubre configuraciones de MCP y herramientas de IA que ningún otro escáner inventaría hoy</td><td>La programación es responsabilidad del operador: cron, launchd o MDM (Bumblebee no gestiona la cadencia por sí mismo)</td></tr>
    <tr><td><code>record_id</code> estable entre ejecuciones hace que la deduplicación sea trivial para receptores downstream</td><td>El catálogo de exposición debe mantenerse: el escáner solo es tan útil como las entradas del catálogo que incluye o que tú mantienes actualizadas</td></tr>
    <tr><td>NDJSON se conecta limpiamente a jq, bases de datos o cualquier endpoint HTTP</td><td>Existen registros <code>confidence: medium</code> o <code>confidence: low</code> para metadatos parciales: la atribución de versión es menos certera en esos casos</td></tr>
  </table>
</div>

## Reflexión final

Lo que me gusta de Bumblebee es que se mantiene limitado. No intenta reemplazar tu EDR ni tu pipeline de SBOM, responde una pregunta desde el estado en disco sin ejecutar nada.

Ese enfoque limitado es lo que lo hace práctico para correr en un horario o incorporarlo a un flujo de respuesta a incidentes: un escaneo termina, emite un `scan_summary` con `status=complete` y sale, y las herramientas downstream manejan el resto.

Si tienes un directorio de desarrollo con varios proyectos, vale la pena correr `bumblebee scan --profile deep --root ~/code` y pasarlo por `jq` una vez solo para ver el panorama completo. Puede que encuentres versiones que no esperabas todavía ancladas en lockfiles antiguos.

¿Qué ecosistemas o tipos de configuración te gustaría ver en una versión futura? Me pregunto si la cobertura de Cargo o Maven cambiaría qué tan útil es esto para equipos que trabajan principalmente con Rust o el ecosistema JVM. Escríbeme en {{< extlink href="https://www.linkedin.com/in/jonathanbucaro/" >}}LinkedIn{{< /extlink >}}.

---

Foto de {{< extlink href="https://unsplash.com/@kai_wenzel?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Kai Wenzel{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/yellow-and-black-wasp-RDstSU6vp6A?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
