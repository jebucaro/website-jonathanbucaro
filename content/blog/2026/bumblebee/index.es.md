---
title: 'Auditando Máquinas de Desarrollo para Exposición en la Cadena de Suministro con Bumblebee'
slug: 'bumblebee'
date: 2026-05-27T19:53:56+00:00
description: 'Un recorrido práctico por Bumblebee, el escáner de solo lectura de código abierto de Perplexity que te dice qué máquinas de desarrollo tienen una versión específica de un paquete instalada sin invocar ningún gestor de paquetes.'
draft: false
tags: [security, supply-chain, cli]
image: 'images/cover.png'
---

En marzo, `axios@1.14.1` y `axios@0.30.4` salieron con una dependencia inyectada que instalaba un troyano de acceso remoto. En mayo, 84 artefactos maliciosos en 42 paquetes `@tanstack/*` llegaron a npm por un compromiso de GitHub Actions. Los dos se detectaron rápido, pero cada vez que pasa algo así sale la misma pregunta: ¿mi máquina tiene instalada la versión afectada ahorita?

Un SBOM te dice qué se fue a producción, y un EDR te dice qué se ejecutó. Ninguno te dice qué hay en los lockfiles, las herramientas y las extensiones de la laptop de un desarrollador. Así que cuando me encontré con Bumblebee, que {{< extlink href="https://www.perplexity.ai/hub/blog/perplexity-is-open-sourcing-bumblebee" >}}Perplexity liberó como código abierto en mayo de 2026{{< /extlink >}} con licencia Apache 2.0, lo corrí en mi propia máquina para ver si alguno de mis proyectos estaba afectado.

## Lo que encontré

Lo apunté a `~/dev`, donde tengo todos mis proyectos, con el perfil deep, los catálogos de paquetes comprometidos conocidos y `--findings-only`:

```bash
bumblebee scan --profile deep --root ~/dev \
  --exposure-catalog /path/to/bumblebee-repo/threat_intel/ \
  --findings-only
```

Salió limpio:

```json
{"record_type":"diagnostic","time":"2026-05-27T16:37:10.17948167Z","level":"info","message":"scan complete: profile=deep status=complete files_considered=150020 records=0 findings=0 suppressed=6784 duplicates=211 diagnostics=2 timed_out=false duration=482.417235ms"}
{
  "record_type": "scan_summary",
  "schema_version": "0.1.0",
  "scanner_name": "bumblebee",
  "scanner_version": "v0.1.2",
  "scan_time": "2026-05-27T16:37:09.696848715Z",
  "end_time": "2026-05-27T16:37:10.179392926Z",
  "endpoint": {
    "hostname": "<redacted>",
    "os": "linux",
    "arch": "amd64",
    "username": "<redacted>",
    "uid": "<redacted>"
  },
  "profile": "deep",
  "status": "complete",
  "roots": [
    {
      "path": "/home/<redacted>/dev",
      "kind": "unknown"
    }
  ],
  "counts": {
    "finding": 0,
    "package": 0
  },
  "package_records_emitted": 0,
  "package_records_suppressed": 6784,
  "findings_emitted": 0,
  "duplicates": 211,
  "diagnostics_count": 2,
  "files_considered": 150020,
  "timed_out": false,
  "duration_ms": 482
}
```

Revisó 150,020 archivos, encontró 6,784 instalaciones de paquetes, y ninguna coincidió con el catálogo. Esos paquetes aparecen como "suppressed" porque `--findings-only` solo imprime las coincidencias. Todo tomó menos de medio segundo. Los dos diagnósticos no eran nada grave: un permiso denegado en una carpeta `.containers` dentro de un proyecto, y un archivo de configuración MCP del que no pudo leer ningún servidor.

## Qué es

Bumblebee es un solo binario estático de Go. Corre, escanea, imprime y termina, sin daemon y sin guardar estado entre corridas.

Lo que más me gusta es que es de solo lectura. Nunca llama a un gestor de paquetes, nunca lee código fuente y nunca sale a la red; solo lee los archivos de metadata que los gestores de paquetes dejan en disco (`package-lock.json`, `pnpm-lock.yaml`, `go.sum`, `*.dist-info/METADATA`, y así). Eso importa porque muchos de estos ataques viven en scripts de post-install, y un escáner que nunca corre un gestor de paquetes no los puede disparar.

La salida es NDJSON, un registro por línea: `package` por cada instalación encontrada, `finding` por cada coincidencia con el catálogo, `scan_summary` al final, y `diagnostic` en stderr.

## Pruébalo en tu máquina

Bájate el binario para tu plataforma desde el {{< extlink href="https://www.perplexity.ai/hub/blog/perplexity-is-open-sourcing-bumblebee" >}}anuncio de Bumblebee{{< /extlink >}}, o compílalo con Go 1.25 o posterior. Solo corre en macOS y Linux; la v0.1 no soporta Windows. Los ejemplos usan `jq` para que la salida se pueda leer, así que instálalo primero (`brew install jq` en macOS, o `apt install jq` / `dnf install jq` en Linux).

Hay tres perfiles:

<div class="table-container">
  <table>
    <tr><th>Perfil</th><th>Qué recorre</th><th>Cadencia típica</th><th>Para qué usarlo</th></tr>
    <tr><td><code>baseline</code></td><td>Instalaciones globales y de usuario de la cadena de herramientas, extensiones del editor, directorios de configuración MCP, perfiles de extensiones del navegador. Sin árboles de proyectos.</td><td>Cada 15 min o al iniciar sesión</td><td>Inventario de herramientas a nivel de flota</td></tr>
    <tr><td><code>project</code></td><td>Directorios de desarrollo configurados: <code>~/code</code>, <code>~/src</code>, <code>~/Developer</code>, <code>~/Projects</code>, <code>~/workspace</code>. Todos los ecosistemas aplican.</td><td>Diariamente</td><td>Inventario de lockfiles y dependencias por proyecto</td></tr>
    <tr><td><code>deep</code></td><td>Cualquier ruta <code>--root</code> explícita, incluyendo directorios home completos. Requiere al menos un argumento <code>--root</code>.</td><td>Bajo demanda</td><td>Barridos de respuesta a incidentes contra un aviso específico</td></tr>
  </table>
</div>

Un escaneo baseline de tus herramientas y extensiones saca cientos de registros, así que mándalo a un archivo, o revisa solo el resumen:

```bash
bumblebee scan --profile baseline > baseline-$(date +%Y%m%d).ndjson
```

```bash
bumblebee scan --profile baseline | jq 'select(.record_type == "scan_summary")'
```

El perfil project solo busca en esas cinco carpetas:

```bash
bumblebee scan --profile project
```

Si tus proyectos están en otro lado, como mi `~/dev`, usa el perfil deep con un root explícito. Esto te da una lista plana de todos los paquetes de todos tus proyectos, con el archivo de donde salió cada uno:

```bash
bumblebee scan --profile deep --root ~/dev \
  | jq -r 'select(.record_type == "package") | [.ecosystem, .package_name, .version, .source_file] | @tsv'
```

Agrégale `--ecosystem npm` (u otro ecosistema) para filtrar.

Para revisar contra incidentes conocidos, bájate la carpeta `threat_intel/` del repo de Bumblebee (si lo compilaste, ya la tienes) y apunta `--exposure-catalog` ahí, como hice arriba. También puedes escribir tu propio catálogo en JSON con el formato del README. Si algo coincide, te sale un registro así:

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

Para respuesta a incidentes puedes barrer un home completo con deep. Solo `deep` acepta un home como root; `baseline` y `project` lo rechazan. Toma en consideración que se tarda más, porque recorre todo lo que alcanza:

```bash
bumblebee scan --profile deep \
  --root /home/alice \
  --exposure-catalog axios-advisory.json \
  --findings-only
```

En macOS, `--all-users` corre los escaneos baseline y project en cada home de `/Users/<name>`, así que un solo comando desplegado por MDM cubre todas las cuentas de la máquina.

## Cómo funciona

El recorrido se salta las carpetas de credenciales (`.ssh`, `.aws`, `.kube`, `.gnupg`, `.docker`), los internos de Git y Mercurial, las cachés de macOS y los datos del navegador fuera de los perfiles de extensiones. Puedes agregar las tuyas con `--exclude`. Detecta ciclos de symlinks por inodo, y los errores de permisos solo quedan como un diagnóstico, que es justo lo que me salió en mi escaneo.

Cada archivo que encuentra va a uno de 11 parsers según el nombre: npm, pnpm, yarn, bun, `node_modules`, `dist-info` de Python, `go.sum` y `go.mod`, `Gemfile.lock`, `composer.lock`, configuraciones MCP (Claude Desktop, `mcp.json`, settings de Gemini) y extensiones tipo VS Code y de Chromium. Corren en un pool de workers (4 por defecto, lo cambias con `--concurrency`), y cada parser solo abre el archivo que le toca.

Cada paquete tiene un `record_id` estable, un SHA-256 de su identidad, así que el mismo paquete visto desde `package-lock.json` y desde `node_modules/` se reporta una sola vez (los 211 duplicados de mi resumen), y el mismo ID se repite entre corridas. En npm, pnpm y yarn, `has_lifecycle_scripts` te dice si el paquete define hooks de instalación, no si se ejecutaron. La coincidencia con el catálogo es exacta por ecosistema, nombre y versión, sin rangos de semver ni coincidencias aproximadas. El `scan_summary` siempre sale de último, y su `status` es `complete`, `partial` (si llegó a `--max-duration` o se interrumpió) o `error`, así que solo confía en una corrida que diga `complete`.

## Limitaciones

- Solo versiones exactas, sin rangos.
- Solo macOS y Linux en la v0.1.
- No se programa solo; eso te toca a ti con cron, launchd o MDM.
- Es tan bueno como el catálogo, así que alguien lo tiene que mantener al día.
- Los registros con `confidence: medium` o `low` vienen de metadata incompleta, así que su versión es menos segura.

Lo que me gusta es que se queda en lo suyo. No intenta reemplazar tu EDR ni tu SBOM, responde una sola pregunta con lo que hay en disco sin ejecutar nada, y en mi caso la respuesta fue la que quería.

---

Foto de {{< extlink href="https://unsplash.com/@kai_wenzel?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Kai Wenzel{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/yellow-and-black-wasp-RDstSU6vp6A?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
