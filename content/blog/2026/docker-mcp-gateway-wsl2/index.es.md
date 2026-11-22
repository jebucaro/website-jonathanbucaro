---
title: 'Corre Docker MCP Gateway en WSL2 sin Docker Desktop'
slug: 'docker-mcp-gateway-en-wsl2-sin-docker-desktop'
date: 2026-11-22T10:00:00-06:00
description: 'Corre el Docker MCP Gateway sobre Docker Engine en WSL2, lee los secretos desde un service account de 1Password de solo lectura y conéctalo a Claude Code.'
draft: false
tags: [windows, wsl, ai-tools, security]
---

Quería que los servidores MCP de mis agentes corrieran en contenedores, aislados, y sin el token de GitHub en texto plano en un archivo de configuración. El {{< extlink href="https://docs.docker.com/ai/mcp-catalog-and-toolkit/get-started/" >}}MCP Gateway{{< /extlink >}} de Docker hace exactamente eso, pero asumí que solo venía con Docker Desktop, que no uso (expliqué por qué en mi [post de 1Password](/es/blog/use-1password-in-windows-with-wsl2-dev-containers/)). No es así: el gateway es un plugin open source del CLI de Docker, y corre sobre Docker Engine dentro de WSL2.

Mientras investigaba encontré varias guías para este setup, y algunos de sus comandos no funcionaban. Así es como me quedó funcionando, con Claude Code conectado y el token saliendo de 1Password sin acceso al resto de mis vaults. Lo probé con Docker Engine 29.10 y `docker mcp` v0.44.3.

{{< figure-dynamic
    light-src="images/docker-mcp-gateway-architecture-light.svg"
    dark-src="images/docker-mcp-gateway-architecture-dark.svg"
    alt="Arquitectura de Docker MCP Gateway en WSL2"
    title="Arquitectura del sistema" >}}

## Lo que necesitas

- Docker Engine 29 o más reciente en tu distro de WSL2.
- 1Password para Windows y el CLI de 1Password para Windows, instalado con la {{< extlink href="https://www.1password.dev/cli/get-started#windows-3" >}}guía oficial{{< /extlink >}}, con la integración con la app de escritorio activada.
- {{< extlink href="https://docs.anthropic.com/en/docs/claude-code/overview" >}}Claude Code{{< /extlink >}} instalado en WSL.
- Una cuenta de GitHub donde puedas crear un fine-grained personal access token.

## Instala el plugin

El plugin es un solo binario que va en la carpeta de plugins del CLI de Docker:

```bash
mkdir -p ~/.docker/cli-plugins
curl -sL https://github.com/docker/mcp-gateway/releases/download/v0.44.3/docker-mcp-linux-amd64.tar.gz \
  | tar -xz -C ~/.docker/cli-plugins docker-mcp
docker mcp version
```

Te imprime `v0.44.3`. Las guías que encontré descargan desde `releases/latest/download/...`, y esa URL da 404: todos los releases en la {{< extlink href="https://github.com/docker/mcp-gateway/releases" >}}página de releases{{< /extlink >}} están marcados como pre-release, así que GitHub no tiene un "latest", y el archivo es un `.tar.gz`. Revisa esa página por si hay versiones más nuevas, y usa `linux-arm64` si estás en ARM.

Algunos comandos de `docker mcp` también buscan Docker Desktop y fallan con "Docker Desktop is not running" aunque el daemon esté corriendo. El README del proyecto documenta la variable que se salta esa verificación en WSL2 y Docker CE:

```bash
export DOCKER_MCP_IN_CONTAINER=1
```

Agrégala a tu `~/.zshrc` o `~/.bashrc` si la quieres en tu terminal. El wrapper de más abajo la define por su cuenta.

## Escoge el servidor de GitHub

El catálogo de Docker es una imagen OCI. Descárgala y busca `github-official` (escribe `/github-official` en `less`):

```bash
docker mcp catalog pull mcp/docker-mcp-catalog
docker mcp catalog show mcp/docker-mcp-catalog | less
```

También hay un servidor llamado solo `github`, que usan algunos ejemplos, pero el catálogo lo marca como "GitHub (Archived)". La entrada de `github-official` te dice qué secreto espera (`github.personal_access_token`, que llega al contenedor como `GITHUB_PERSONAL_ACCESS_TOKEN`) y qué hosts necesita: `api.github.com`, `github.com` y `raw.githubusercontent.com`. El gateway solo aplica esa lista cuando lo corres con `--block-network`, que viene apagado por defecto, así que el wrapper lo activa.

## Encuentra op.exe desde WSL

El CLI de 1Password para Linux no puede hablar con la app de 1Password en Windows, así que desde WSL llamas al `op.exe` de Windows por medio de Interop. No estaba en el `PATH` de mi WSL, así que lo busqué en PowerShell:

```powershell
(Get-Command op.exe).Source
```

Después convierte esa ruta en WSL y guárdala en una variable:

```bash
OP="$(wslpath 'C:\Users\<you>\...\op.exe')"
"$OP" --version
echo "$OP"
```

Guarda la ruta que imprime el `echo`, porque el wrapper la necesita. Corre la siguiente sección en la misma terminal, o vuelve a definir `OP` en una nueva. Ten en cuenta dos cosas con los programas de Windows que llamas desde WSL: su salida termina las líneas con `\r\n`, así que hay que pasar los valores por `tr -d '\r'`, y no ven tus variables de ambiente de Linux a menos que las pongas en `WSLENV`.

## Dale al agente su propio vault

Lo más fácil es leer el token con tu sesión normal de `op`, y eso no lo quería. La integración con la app de escritorio autoriza al CLI para toda tu cuenta, y según el {{< extlink href="https://www.1password.dev/cli/app-integration-security" >}}modelo de seguridad{{< /extlink >}} de 1Password esa autorización se extiende a los sub-shells de la terminal. Un agente que corre comandos desde esa sesión podría leer cualquier item que tengo.

Así que seguí la {{< extlink href="https://www.1password.dev/sdks/ai-agent" >}}recomendación de 1Password para agentes de IA{{< /extlink >}}: un vault solo para el agente y un service account que solo pueda leerlo. Los service accounts vienen en todos los planes. Los planes 1Password, Families y Teams permiten 1,000 lecturas por hora, y el wrapper lee una vez cada vez que arranca.

1. En la app de 1Password, crea un vault llamado **AI Agents**.
2. Crea un {{< extlink href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token" >}}fine-grained personal access token{{< /extlink >}} en GitHub solo con los repositorios y permisos que quieres que tenga el agente, y guárdalo en ese vault como un **API Credential** llamado **GitHub PAT**.
3. Crea el service account, que usa tu sesión normal por última vez:

```bash
"$OP" service-account create "Claude Code MCP Gateway" --vault "AI Agents:read_items" --expires-in 90d
```

Imprime un token que empieza con `ops_` una sola vez. Guárdalo en un archivo que solo tú puedas leer, sin dejarlo en el historial de tu shell (esto funciona en bash y en zsh), y limpia tu terminal después:

```bash
mkdir -p ~/.config/mcp-gateway
(umask 077; printf 'Token: '; read -rs t; printf '%s' "$t" > ~/.config/mcp-gateway/op-service-account-token; echo)
chmod 600 ~/.config/mcp-gateway/op-service-account-token
```

Luego revisa qué puede ver el service account:

```bash
OP_SERVICE_ACCOUNT_TOKEN="$(<~/.config/mcp-gateway/op-service-account-token)" \
  WSLENV=OP_SERVICE_ACCOUNT_TOKEN/w "$OP" vault list </dev/null
```

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
```

Solo el vault AI Agents. Cuando corrí el mismo comando sin `WSLENV=...`, me listó todos los vaults de mi cuenta: `op.exe` nunca recibió el token y regresó a la app de escritorio sin avisar. El `/w` al final de la variable hace que pase solo de WSL a Windows.

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    Private
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
xxxxxxxxxxxxxxxxxxxxxxxxxx    Work
xxxxxxxxxxxxxxxxxxxxxxxxxx    Shared
```

## El wrapper

Los clientes MCP arrancan un servidor corriendo un comando directo, sin shell, así que el manejo de secretos va en un script pequeño. Yo lo guardé como `~/.local/bin/mcp-gateway`. Cambia la ruta de `op.exe` por la tuya y córrele `chmod +x`:

```bash
#!/usr/bin/env bash
# Docker MCP Gateway on WSL2 Docker Engine, no Docker Desktop.
set -euo pipefail

export DOCKER_MCP_IN_CONTAINER=1

OP="${MCP_OP_EXE:-/mnt/c/path/to/op.exe}"
VAULT="${MCP_OP_VAULT:-AI Agents}"
SA_TOKEN_FILE="${MCP_OP_SA_TOKEN_FILE:-$HOME/.config/mcp-gateway/op-service-account-token}"

# op.exe only sees WSL variables listed in WSLENV (/w = WSL to Windows).
OP_SERVICE_ACCOUNT_TOKEN="$(<"$SA_TOKEN_FILE")"
export OP_SERVICE_ACCOUNT_TOKEN
export WSLENV="${WSLENV:+$WSLENV:}OP_SERVICE_ACCOUNT_TOKEN/w"

# </dev/null: op.exe must not read the MCP client's stdin.
GITHUB_TOKEN="$("$OP" read "op://$VAULT/GitHub PAT/credential" </dev/null | tr -d '\r')"
if [[ -z $GITHUB_TOKEN ]]; then
  echo "mcp-gateway: could not read the GitHub token from 1Password" >&2
  exit 1
fi
unset OP_SERVICE_ACCOUNT_TOKEN

exec docker mcp gateway run \
  --servers "${MCP_SERVERS:-github-official}" \
  --block-network \
  --secrets <(printf 'github.personal_access_token=%s\n' "$GITHUB_TOKEN") \
  "$@"
```

El gateway lee `--secrets` una sola vez al arrancar, así que un process substitution funciona y el token de GitHub nunca se escribe en disco. El token del service account se quita antes de que arranque el gateway, así que ni el gateway ni sus contenedores lo reciben.

El `</dev/null` salió de la primera vez que conecté Claude Code: se quedó esperando 30 segundos y falló. `op.exe` estaba heredando el stdin que Claude Code usa para hablar con el gateway, y se comía el primer mensaje. La revisión del token vacío está porque el gateway no se queja cuando no puede leer un archivo de secretos, solo arranca sin el secreto. Por lo mismo no uso `--watch`: al recargar volvería a leer los secretos de un stream que ya se leyó.

La documentación de Docker organiza los servidores en profiles, pero `--profile` no se puede combinar con `--secrets`, y en Docker Engine los secretos de los profiles dependen del {{< extlink href="https://github.com/docker/secrets-engine" >}}Secrets Engine{{< /extlink >}}, que ahí todavía es experimental. Con `--servers` me salto los profiles, y el gateway apaga sus dynamic tools.

Un dry run arranca el servidor, lista sus herramientas y termina:

```bash
mcp-gateway --dry-run --verbose 2>&1 | grep -E 'TOKEN|tools listed'
```

```text
    - GITHUB_PERSONAL_ACCESS_TOKEN: gith****
  - Running ghcr.io/github/github-mcp-server with [run --rm -i --init --security-opt no-new-privileges --cpus 1 --memory 2Gb --pull never ... --network docker-mcp-proxies-int ... -e https_proxy=docker-mcp-l7proxy-...:8080 -e GITHUB_PERSONAL_ACCESS_TOKEN]
> 46 tools listed in 3.426928878s
```

Si no ves el `gith****` enmascarado, el token no llegó.

## Conecta Claude Code

```bash
claude mcp add --scope user MCP_DOCKER -- mcp-gateway
claude mcp list
```

```text
MCP_DOCKER: mcp-gateway  - ✔ Connected
```

Después de reiniciar Claude Code, las herramientas de GitHub aparecen en `/mcp`.

## Qué protege y qué no

El servidor de GitHub corre con `no-new-privileges`, un CPU y 2 GB de memoria. El token se pasa por nombre (`-e GITHUB_PERSONAL_ACCESS_TOKEN`), así que el valor no aparece en la lista de procesos. Con `--block-network`, el contenedor queda en una red interna de Docker (`docker-mcp-proxies-int`) sin salida directa, y llega a internet por medio de un proxy L7 que solo permite los tres hosts de GitHub. Eso le agrega unos dos segundos al arranque. El gateway también bloquea secretos en las llamadas y respuestas de las herramientas por defecto (`--block-secrets`).

Lo que no hace es aislar al agente. El archivo con el token del service account lo puede leer cualquier proceso que corra con mi usuario, Claude Code incluido. Cualquiera con acceso al socket de Docker puede correr `docker inspect` sobre el contenedor y leer el token de GitHub, y Claude Code puede correr `docker`. `op.exe` con la integración de escritorio también sigue ahí, detrás del aviso de aprobación de 1Password; ya con el service account creado, puedes apagar **Integrate with 1Password CLI** en **Settings > Developer** si nada más de lo que usas lo necesita.

Lo que gano es que una filtración cuesta mucho menos: un token de GitHub fine-grained que expira y acceso de lectura a un vault que solo tiene ese token, no toda mi cuenta de 1Password. El parámetro `--tools` del gateway y el modo de solo lectura del servidor de GitHub lo pueden cerrar más. Aislar al agente es para lo que está {{< extlink href="https://docs.docker.com/ai/sandboxes/" >}}Docker Sandboxes{{< /extlink >}}, y el {{< extlink href="https://1password.com/blog/introducing-1password-credential-broker" >}}Credential Broker{{< /extlink >}} de 1Password parece una forma de prescindir del token del service account. Todavía no he probado ninguno de los dos.
