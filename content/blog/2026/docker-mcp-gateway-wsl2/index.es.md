---
title: 'Corre Docker MCP Gateway en WSL2 sin Docker Desktop'
slug: 'docker-mcp-gateway-en-wsl2-sin-docker-desktop'
date: 2026-11-22T10:00:00-06:00
description: 'Corre el Docker MCP Gateway sobre Docker Engine en WSL2, lee los secretos desde un service account de 1Password de solo lectura y conéctalo a Claude Code.'
draft: false
tags: [windows, wsl, ai-tools, security]
---

Los servidores MCP le dan herramientas a un agente de IA, y cada herramienta necesita acceso a algo: un token de GitHub, una API key, tu sistema de archivos. El {{< extlink href="https://docs.docker.com/ai/mcp-catalog-and-toolkit/get-started/" >}}MCP Gateway{{< /extlink >}} de Docker corre cada servidor en su propio contenedor, con privilegios, CPU, memoria y red limitados, y le pasa solo los secretos que declara. Ese aislamiento es lo que quería para mis agentes, y asumí que era una función de Docker Desktop, porque ahí es donde vive el MCP Toolkit.

No lo es. El gateway es el plugin open source `docker mcp` del CLI, y corre sobre Docker Engine normal. Yo no uso Docker Desktop (expliqué por qué en mi [post de 1Password con Dev Containers en WSL2](/es/blog/use-1password-in-windows-with-wsl2-dev-containers/)), así que todo esto corre en Docker Engine dentro de WSL2 en Windows 11.

Las guías que encontré para este setup tenían comandos que no funcionan y no mencionaban varias trampas, así que probé cada paso con Docker Engine 29.10 y `docker mcp` v0.44.3. Al final vas a tener Claude Code conectado al gateway, corriendo el servidor MCP oficial de GitHub en un contenedor, con su token leído desde un service account de 1Password que solo puede ver un vault.

{{< figure-dynamic
    light-src="images/docker-mcp-gateway-architecture-light.svg"
    dark-src="images/docker-mcp-gateway-architecture-dark.svg"
    alt="Arquitectura de Docker MCP Gateway en WSL2"
    title="Arquitectura del sistema" >}}

## Configuración

### Prerrequisitos

- Docker Engine 29 o más reciente instalado en tu distro de WSL2 (no Docker Desktop).
- 1Password para Windows y el CLI de 1Password para Windows, instalado con la {{< extlink href="https://www.1password.dev/cli/get-started#windows-3" >}}guía oficial{{< /extlink >}}, con la integración con la app de escritorio activada.
- {{< extlink href="https://docs.anthropic.com/en/docs/claude-code/overview" >}}Claude Code{{< /extlink >}} instalado en WSL.
- Una cuenta de GitHub donde puedas crear un fine-grained personal access token.

### Paso 1: instala el plugin

El plugin es un solo binario que va en la carpeta de plugins del CLI de Docker:

```bash
mkdir -p ~/.docker/cli-plugins
curl -sL https://github.com/docker/mcp-gateway/releases/download/v0.44.3/docker-mcp-linux-amd64.tar.gz \
  | tar -xz -C ~/.docker/cli-plugins docker-mcp
docker mcp version
```

Debería imprimir `v0.44.3`. Revisa la {{< extlink href="https://github.com/docker/mcp-gateway/releases" >}}página de releases{{< /extlink >}} por si hay una versión más nueva, y usa `linux-arm64` si estás en ARM.

{{< callout warning >}}
Algunas guías descargan desde `releases/latest/download/docker-mcp-linux-amd64`. Esa URL da 404: todos los releases están marcados como pre-release, así que GitHub no tiene un "latest", y el archivo es un `.tar.gz`, no el binario directo.
{{< /callout >}}

### Paso 2: sáltate la verificación de Docker Desktop

Por defecto, algunos comandos de `docker mcp` buscan Docker Desktop y fallan con "Docker Desktop is not running" aunque el daemon esté corriendo. El README del proyecto documenta la variable para WSL2 y Docker CE:

```bash
export DOCKER_MCP_IN_CONTAINER=1
```

Agrégala a tu `~/.zshrc` o `~/.bashrc` para usarla en tu terminal. El wrapper del Paso 6 la define por su cuenta.

### Paso 3: escoge un servidor del catálogo

El catálogo de Docker es una imagen OCI. Descárgala y busca el servidor de GitHub:

```bash
docker mcp catalog pull mcp/docker-mcp-catalog
docker mcp catalog show mcp/docker-mcp-catalog | less
```

Busca `github-official` (escribe `/github-official` en `less`). La entrada te dice las dos cosas que necesitas: el nombre del secreto (`github.personal_access_token`, que llega al contenedor como `GITHUB_PERSONAL_ACCESS_TOKEN`) y los hosts a los que el contenedor puede conectarse: `api.github.com`, `github.com` y `raw.githubusercontent.com`. Nada más.

{{< callout note >}}
Usa `github-official`. El catálogo también tiene un servidor llamado `github`, que algunos ejemplos todavía usan, pero aparece como "GitHub (Archived)".
{{< /callout >}}

### Paso 4: llega a op.exe desde WSL

El CLI de 1Password para Linux no puede hablar con la app de 1Password en Windows, así que desde WSL llamas al `op.exe` de Windows por medio de Interop. Normalmente no está en el `PATH` de WSL. En PowerShell, busca dónde quedó:

```powershell
(Get-Command op.exe).Source
```

Después convierte esa ruta en WSL y guárdala en una variable para los siguientes pasos:

```bash
OP="$(wslpath 'C:\Users\<you>\...\op.exe')"
"$OP" --version
```

Ten en cuenta dos cosas con cualquier programa de Windows que llames desde WSL: su salida termina las líneas con `\r\n`, así que pasa los valores por `tr -d '\r'`, y no ve tus variables de ambiente de Linux a menos que las pongas en `WSLENV`. Esto último es importante en el siguiente paso.

### Paso 5: dale al agente su propio vault

Lo más fácil sería leer el token con tu sesión normal de `op`. No lo hagas. La integración con la app de escritorio autoriza al CLI para **toda tu cuenta**, y en Linux y macOS esa autorización se extiende a los sub-shells de la terminal (revisa el {{< extlink href="https://www.1password.dev/cli/app-integration-security" >}}modelo de seguridad{{< /extlink >}} de 1Password). Un agente que corre comandos desde esa sesión puede leer cualquier item que tengas, no solo el token de GitHub.

Mejor sigue la {{< extlink href="https://www.1password.dev/sdks/ai-agent" >}}recomendación de 1Password para agentes de IA{{< /extlink >}}: un vault dedicado y un service account que solo pueda leerlo. Los service accounts vienen en todos los planes, con límites de uso (1,000 lecturas por hora fuera de Business), y el wrapper solo lee una vez cada vez que arranca.

1. En la app de 1Password, crea un vault llamado **AI Agents**.
2. Crea un {{< extlink href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token" >}}fine-grained personal access token{{< /extlink >}} en GitHub, limitado a los repositorios y permisos que quieres que tenga el agente. Guárdalo en el vault nuevo como un **API Credential** llamado **GitHub PAT**.
3. Crea el service account. Esto usa tu sesión normal por última vez:

```bash
"$OP" service-account create "Claude Code MCP Gateway" --vault "AI Agents:read_items" --expires-in 90d
```

Imprime un token que empieza con `ops_` una sola vez. Guárdalo en un archivo que solo tú puedas leer, sin dejarlo en el historial de tu shell (esto funciona en bash y en zsh):

```bash
mkdir -p ~/.config/mcp-gateway
printf 'Token: '; read -rs t; printf '%s' "$t" > ~/.config/mcp-gateway/op-service-account-token; unset t; echo
chmod 600 ~/.config/mcp-gateway/op-service-account-token
```

Limpia tu terminal después, porque el token sigue en el scrollback. Ahora revisa qué puede ver el service account:

```bash
OP_SERVICE_ACCOUNT_TOKEN="$(<~/.config/mcp-gateway/op-service-account-token)" \
  WSLENV=OP_SERVICE_ACCOUNT_TOKEN/w "$OP" vault list </dev/null
```

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
```

{{< callout warning >}}
Corre el mismo comando sin `WSLENV=...` y te salen **todos** los vaults de tu cuenta. `op.exe` nunca recibió el token, así que regresó a la app de escritorio sin avisarte. La bandera `/w` pasa la variable solo de WSL a Windows; `/u` va en la dirección contraria.

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    Private
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
xxxxxxxxxxxxxxxxxxxxxxxxxx    Work
xxxxxxxxxxxxxxxxxxxxxxxxxx    Shared
```

{{< /callout >}}

### Paso 6: escribe el wrapper

Los clientes MCP arrancan un servidor corriendo un comando directo, sin shell, así que el manejo de secretos va en un script pequeño. Guárdalo como `~/.local/bin/mcp-gateway` (o en cualquier carpeta de tu `PATH`), cambia la ruta de `op.exe` por la tuya del Paso 4 y córrele `chmod +x`:

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
  --secrets <(printf 'github.personal_access_token=%s\n' "$GITHUB_TOKEN") \
  "$@"
```

El gateway lee `--secrets` una sola vez al arrancar, así que un process substitution funciona y el token de GitHub nunca se escribe en disco. El token del service account se quita del ambiente antes de que arranque el gateway, así que ni el gateway ni sus contenedores lo heredan. Pruébalo con un dry run, que arranca el servidor, lista sus herramientas y termina:

```bash
mcp-gateway --dry-run --verbose 2>&1 | grep -E 'TOKEN|tools listed'
```

```text
    - GITHUB_PERSONAL_ACCESS_TOKEN: gith****
  - Running ghcr.io/github/github-mcp-server with [run --rm -i --init --security-opt no-new-privileges --cpus 1 --memory 2Gb --pull never ... -e GITHUB_PERSONAL_ACCESS_TOKEN]
> 46 tools listed in 1.025223625s
```

{{< callout warning >}}
No quites el `</dev/null` de la llamada a `op.exe`. Sin eso, `op.exe` hereda el stdin que el cliente MCP usa para hablar con el gateway y se come su primer mensaje de `initialize`. El dry run igual funciona, porque no hay cliente, pero Claude Code se queda esperando y falla a los 30 segundos.
{{< /callout >}}

{{< callout caution >}}
Si el gateway no puede leer un archivo de secretos, arranca de todas formas sin el secreto y no te avisa. Por eso el wrapper revisa el token antes de arrancar, y por eso vale la pena buscar la línea `gith****` en el dry run. Tampoco uses `--watch`: al recargar, el gateway volvería a leer los secretos de un stream que ya se consumió.
{{< /callout >}}

### Paso 7: conecta Claude Code

Registra el wrapper para todos tus proyectos y revisa la conexión:

```bash
claude mcp add --scope user MCP_DOCKER -- mcp-gateway
claude mcp list
```

```text
MCP_DOCKER: mcp-gateway  - ✔ Connected
```

Reinicia Claude Code y las herramientas de GitHub aparecen en `/mcp`.

## Cómo funciona

Cuando Claude Code arranca, corre `mcp-gateway` y se comunica con él por stdin y stdout. El wrapper le pasa el token del service account a `op.exe`, que lee un solo item del vault AI Agents, y después le entrega el token de GitHub a `docker mcp gateway run`. El gateway arranca el contenedor de `github-official` con:

- `--security-opt no-new-privileges`, `--cpus 1` y `--memory 2Gb`.
- El token como variable de ambiente pasada por nombre (`-e GITHUB_PERSONAL_ACCESS_TOKEN`), así que el valor no aparece en la lista de procesos.
- Acceso de red solo a los tres hosts de GitHub del catálogo.

El gateway también bloquea secretos en las llamadas y respuestas de las herramientas por defecto (`--block-secrets`), y es lo único que ve Claude Code: un solo servidor MCP, corra lo que corra detrás.

## Lo que el agente todavía puede alcanzar

Este setup limita lo que puede hacer cada servidor MCP. No aísla al agente en sí, y vale la pena tenerlo claro:

- El archivo con el token del service account lo puede leer cualquier proceso que corra con tu usuario, incluido Claude Code.
- Cualquiera con acceso al socket de Docker puede correr `docker inspect` sobre el contenedor de GitHub y leer el token de su ambiente, y Claude Code puede correr `docker`.

Lo que ganas es que el daño posible es mucho menor. Si el agente o una herramienta filtra algo, es un token de GitHub fine-grained que expira y acceso de lectura a un vault que solo tiene ese token, no toda tu cuenta de 1Password. Puedes cerrarlo más con la bandera `--tools` del gateway, que expone solo las herramientas que le indiques, y con el modo de solo lectura del servidor de GitHub.

Aislar al agente es el siguiente paso, y para eso está {{< extlink href="https://docs.docker.com/ai/sandboxes/" >}}Docker Sandboxes{{< /extlink >}}. El {{< extlink href="https://1password.com/blog/introducing-1password-credential-broker" >}}Credential Broker{{< /extlink >}} de 1Password también parece una forma de prescindir del token del service account. Todavía no he probado ninguno de los dos.

## ¿Y los profiles?

La documentación de Docker organiza los servidores en profiles (`docker mcp profile create`), y vas a ver guías que combinan `--profile` con `--secrets`. En Docker Engine eso no funciona:

- El gateway lo rechaza: `cannot use --profile with ... --secrets`.
- Con profiles, los secretos son referencias `se://` que el Secrets Engine de Docker resuelve cuando arranca el contenedor. Viene con Docker Desktop; en Docker CE es una instalación aparte y {{< extlink href="https://github.com/docker/secrets-engine" >}}experimental{{< /extlink >}} que necesita un keyring de Linux.
- Los profiles también hay que activarlos primero con `docker mcp feature enable profiles`, y un profile creado con `--name dev-tools` queda con el ID `dev_tools`, que es lo que esperan los demás comandos.

Yo me quedé con `--servers`, que no usa profiles para nada. Lo único que pierdes son las dynamic tools, que el gateway apaga con esa bandera.

## Comprueba que funciona

1. `mcp-gateway --dry-run --verbose` muestra `gith****` y el conteo de herramientas.
2. La revisión con `vault list` del Paso 5 muestra solo **AI Agents**.
3. `claude mcp list` muestra `MCP_DOCKER` como conectado.
4. En Claude Code, `/mcp` lista `MCP_DOCKER` con las herramientas de GitHub.
