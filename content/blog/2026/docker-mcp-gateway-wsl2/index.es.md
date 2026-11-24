---
title: 'Corre Docker MCP Gateway en WSL2 sin Docker Desktop'
slug: 'docker-mcp-gateway-wsl2-without-docker-desktop'
date: 2026-11-22T10:00:00-06:00
description: 'Corre el Docker MCP Gateway sobre Docker Engine en WSL2, lee los secretos desde un service account de 1Password de solo lectura y conéctalo a Claude Code.'
draft: false
tags: [windows, wsl, ai-tools, security]
---

Quería que los servidores MCP de mis agentes corrieran en contenedores, aislados, y sin el token de GitHub en texto plano en un archivo de configuración. El {{< extlink href="https://docs.docker.com/ai/mcp-catalog-and-toolkit/get-started/" >}}MCP Gateway{{< /extlink >}} de Docker hace exactamente eso, pero asumí que solo venía con Docker Desktop, que no uso (expliqué por qué en mi [post de 1Password](/es/blog/use-1password-in-windows-with-wsl2-dev-containers/)). Me equivoqué. El gateway es un plugin open source del CLI de Docker y corre sobre Docker Engine dentro de WSL2.

Mientras investigaba encontré varias guías para este setup, y algunos de sus comandos no funcionaban. Al final me quedó funcionando con Claude Code conectado al gateway y el token obtenido de 1Password, sin que el agente tenga acceso al resto de mis vaults. Lo probé con Docker Engine 29.10 y `docker mcp` v0.44.3.

{{< figure-dynamic
    light-src="images/docker-mcp-gateway-architecture-light.svg"
    dark-src="images/docker-mcp-gateway-architecture-dark.svg"
    alt="Arquitectura de Docker MCP Gateway en WSL2: Claude Code arranca el wrapper mcp-gateway, que lee el token de GitHub por medio de op.exe en Windows y un service account de 1Password de solo lectura, y luego corre el gateway y el contenedor github-official."
    title="Arquitectura del sistema"
    caption="El wrapper lee el token de GitHub de un vault que solo ve el service account, se detiene si el token viene vacío y después arranca el gateway." >}}

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

Debería imprimir `v0.44.3`. Revisa la {{< extlink href="https://github.com/docker/mcp-gateway/releases" >}}página de releases{{< /extlink >}} por si hay versiones más nuevas, y usa `linux-arm64` si estás en ARM.

Algunos comandos de `docker mcp` también buscan Docker Desktop y fallan con "Docker Desktop is not running" aunque el daemon esté corriendo. El README del proyecto documenta una variable de entorno para saltarse esa verificación en WSL2 y Docker CE:

```bash
export DOCKER_MCP_IN_CONTAINER=1
```

Agrégala a tu `~/.zshrc` o `~/.bashrc` si quieres tenerla disponible en tu terminal. El wrapper que vamos a crear más abajo ya la define por su cuenta.

## Prueba la configuración con el servidor de GitHub

Para probar toda la configuración usé el servidor oficial de GitHub, porque necesita un secreto y también acceso a la red. El catálogo de Docker es una imagen OCI. Descárgala y busca `github-official` (escribe `/github-official` en `less`):

```bash
docker mcp catalog pull mcp/docker-mcp-catalog
docker mcp catalog show mcp/docker-mcp-catalog | less
```

También hay un servidor llamado solo `github`, que usan algunos ejemplos, pero el catálogo lo marca como "GitHub (Archived)". La entrada de `github-official` te dice qué secreto espera (`github.personal_access_token`, que llega al contenedor como `GITHUB_PERSONAL_ACCESS_TOKEN`).

## Encuentra op.exe desde WSL

El CLI de 1Password para Linux no puede hablar con la app de 1Password en Windows, así que desde WSL llamas al `op.exe` de Windows por medio de interop. No estaba en el `PATH` de mi WSL, así que lo busqué en PowerShell:

```powershell
(Get-Command op.exe).Source
```

Después convierte esa ruta al formato de WSL y guárdala en una variable:

```bash
OP="$(wslpath 'C:\Users\<you>\...\op.exe')"
"$OP" --version
echo "$OP"
```

Guarda la ruta que imprime el `echo`, porque el wrapper la necesita. Corre la siguiente sección en la misma terminal, o vuelve a definir `OP` en una nueva. Ten en cuenta dos cosas con los programas de Windows que llamas desde WSL: su salida termina cada línea con `\r\n`, así que hay que limpiar los valores con `tr -d '\r'`, y no ven tus variables de entorno de Linux a menos que las pongas en `WSLENV`.

## Dale al agente su propio vault

Lo más fácil sería leer el token con tu sesión normal de `op`, pero preferí no hacerlo así. La integración con la app de escritorio autoriza al CLI para toda tu cuenta, y según el {{< extlink href="https://www.1password.dev/cli/app-integration-security" >}}modelo de seguridad{{< /extlink >}} de 1Password esa autorización se extiende a los sub-shells de la terminal. Un agente que corre comandos desde esa sesión podría leer cualquier item de mi cuenta.

Así que seguí la {{< extlink href="https://www.1password.dev/sdks/ai-agent" >}}recomendación de 1Password para agentes de IA{{< /extlink >}}: un vault solo para el agente y un service account que solo pueda leerlo. Los service accounts están incluidos en todos los planes. Los planes 1Password, Families y Teams permiten 1,000 lecturas por hora, y el wrapper solo hace una lectura cada vez que arranca.

1. En la app de 1Password, crea un vault llamado **AI Agents**.
2. Crea un {{< extlink href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token" >}}fine-grained personal access token{{< /extlink >}} en GitHub solo con los repositorios y permisos que quieres que tenga el agente, y guárdalo en ese vault como un **API Credential** llamado **GitHub PAT**.
3. Crea el service account. Para esto sí usas tu sesión normal de `op`, por última vez:

```bash
"$OP" service-account create "Claude Code MCP Gateway" --vault "AI Agents:read_items" --expires-in 90d
```

El comando te muestra el token, que empieza con `ops_`, una sola vez. Guárdalo en un archivo que solo tú puedas leer, sin dejarlo en el historial de tu shell (esto funciona en bash y en zsh), y limpia tu terminal después:

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

Solo aparece el vault AI Agents.

{{< callout important >}}
Cuando corrí el mismo comando sin `WSLENV=...`, me listó todos los vaults de mi cuenta (salida abajo): `op.exe` nunca recibió el token y usó la integración con la app de escritorio sin avisar. El `/w` al final de la variable hace que pase solo de WSL a Windows.
{{< /callout >}}

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    Private
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
xxxxxxxxxxxxxxxxxxxxxxxxxx    Work
xxxxxxxxxxxxxxxxxxxxxxxxxx    Shared
```

## El wrapper

Los clientes MCP arrancan cada servidor ejecutando un comando directamente, sin pasar por un shell, así que el manejo de los secretos tiene que ir en un script pequeño. Yo lo guardé como `~/.local/bin/mcp-gateway`. Cambia la ruta de `op.exe` por la tuya y córrele `chmod +x`:

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

El gateway lee `--secrets` una sola vez al arrancar, así que una sustitución de procesos (process substitution) funciona y el token de GitHub nunca se escribe en disco. El script borra el token del service account del entorno antes de arrancar el gateway, así que ni el gateway ni sus contenedores lo reciben.

Agregué el `</dev/null` después de la primera vez que conecté Claude Code: se quedó esperando 30 segundos y falló. `op.exe` estaba heredando el stdin que Claude Code usa para hablar con el gateway, y se comía el primer mensaje.

{{< callout warning >}}
El gateway no da ningún error cuando no puede leer un archivo de secretos. Simplemente arranca sin el secreto, así que el wrapper revisa que el token no venga vacío.
{{< /callout >}}

Por esa misma razón no uso `--watch`: cuando el gateway recarga, vuelve a leer los secretos de un stream que ya se leyó.

La documentación de Docker usa profiles para configurar los servidores. Creas un profile, le agregas servidores y corres `docker mcp gateway run --profile <nombre>`. Esa documentación asume Docker Desktop. En Docker Engine, un profile busca sus secretos en el {{< extlink href="https://github.com/docker/secrets-engine" >}}Secrets Engine{{< /extlink >}} de Docker, cuya integración con Docker Engine todavía es experimental. Necesita D-Bus y un keyring como GNOME Keyring o KWallet, que una distro de WSL no trae configurados por defecto, y sin ellos se cae. Y el gateway tampoco te deja usar `--secrets` junto con `--profile`. Por eso el wrapper no usa profiles y le pasa la lista de servidores directamente con `--servers`. Con `--servers` solo pierdes las dynamic tools del gateway (`mcp-find`, `mcp-add`, `code-mode`), que le permiten al agente buscar en el catálogo y agregar servidores a media conversación. Como el agente tiene acceso a mis tokens, prefiero una lista fija.

| Configuración                    | Resultado      | Por qué                                                                               |
| -------------------------------- | -------------- | ------------------------------------------------------------------------------------- |
| `--servers` + `--secrets <(...)` | La que uso     | El gateway lee el stream una sola vez al arrancar. Las dynamic tools quedan apagadas. |
| `--watch` + `--secrets <(...)`   | Mejor evitarla | Al recargar, el gateway lee un stream que ya está vacío.                              |
| `--profile` + `--secrets`        | No funciona    | Las dos opciones no se pueden combinar.                                               |
| `--profile` + Secrets Engine     | Todavía no     | En Docker Engine el Secrets Engine sigue siendo experimental.                         |

Un dry run arranca el servidor, lista sus herramientas y termina:

```bash
mcp-gateway --dry-run --verbose 2>&1 | grep -E 'TOKEN|tools listed'
```

```text
    - GITHUB_PERSONAL_ACCESS_TOKEN: gith****
  - Running ghcr.io/github/github-mcp-server with [run --rm -i --init --security-opt no-new-privileges --cpus 1 --memory 2Gb --pull never ... -e GITHUB_PERSONAL_ACCESS_TOKEN]
> 46 tools listed in 694.010041ms
```

Si no ves el `gith****` enmascarado, el token no llegó al contenedor.

## Conecta Claude Code

```bash
claude mcp add --scope user MCP_DOCKER -- mcp-gateway
claude mcp list
```

```text
MCP_DOCKER: mcp-gateway  - ✔ Connected
```

Después de reiniciar Claude Code, las herramientas de GitHub aparecen en `/mcp`.

## Agrega otros servidores del catálogo

Cuando el servidor de GitHub ya funciona, puedes agregar otros del catálogo, que tiene más de 300. Para listarlos y ver qué necesita cada uno:

```bash
docker mcp catalog server ls mcp/docker-mcp-catalog
docker mcp catalog server inspect mcp/docker-mcp-catalog brave | less
```

En la salida de `inspect`, el campo `secrets` te dice qué secretos espera el servidor. En los dos casos, el cambio va en el wrapper que guardaste como `~/.local/bin/mcp-gateway`.

Si el servidor no necesita ningún secreto, abre `~/.local/bin/mcp-gateway` y agrégalo al valor por defecto de `MCP_SERVERS` en la línea de `--servers`, separado por una coma. Yo lo probé con el servidor de búsqueda de DuckDuckGo:

```bash
  --servers "${MCP_SERVERS:-github-official,duckduckgo}" \
```

Si sí necesita uno, primero guarda la credencial en el vault AI Agents. Después edita `~/.local/bin/mcp-gateway` en dos partes: lee la credencial con `op.exe` justo después de la validación del token de GitHub, y agrega una línea por cada secreto a la sustitución de procesos de `--secrets`. Para Brave Search, que espera `brave.api_key`, estos son los cambios en `~/.local/bin/mcp-gateway` (las líneas con `+` son nuevas y las que tienen `-` son las que se reemplazan):

```diff
 GITHUB_TOKEN="$("$OP" read "op://$VAULT/GitHub PAT/credential" </dev/null | tr -d '\r')"
 if [[ -z $GITHUB_TOKEN ]]; then
   echo "mcp-gateway: could not read the GitHub token from 1Password" >&2
   exit 1
 fi
+BRAVE_KEY="$("$OP" read "op://$VAULT/Brave Search/credential" </dev/null | tr -d '\r')"
+if [[ -z $BRAVE_KEY ]]; then
+  echo "mcp-gateway: could not read the Brave API key from 1Password" >&2
+  exit 1
+fi
 unset OP_SERVICE_ACCOUNT_TOKEN

 exec docker mcp gateway run \
-  --servers "${MCP_SERVERS:-github-official}" \
-  --secrets <(printf 'github.personal_access_token=%s\n' "$GITHUB_TOKEN") \
+  --servers "${MCP_SERVERS:-github-official,brave}" \
+  --secrets <(printf 'github.personal_access_token=%s\nbrave.api_key=%s\n' "$GITHUB_TOKEN" "$BRAVE_KEY") \
   "$@"
```

Guarda el archivo y vuelve a correr el dry run con `mcp-gateway --dry-run --verbose`: deberías ver `BRAVE_API_KEY` enmascarado igual que el token de GitHub. Después reinicia Claude Code para que levante el gateway con los nuevos servidores.

## Qué protege y qué no

El servidor de GitHub corre con `no-new-privileges`, un CPU y 2 GB de memoria. El token se pasa por nombre (`-e GITHUB_PERSONAL_ACCESS_TOKEN`), así que el valor no aparece en la lista de procesos. El gateway también bloquea secretos en las llamadas y respuestas de las herramientas por defecto (`--block-secrets`). El token no queda en la configuración de Claude Code, ni en mis dotfiles ni en un archivo `.env`. Solo existe en memoria y dentro del contenedor. Y si la imagen del servidor estuviera comprometida, no podría leer mis archivos. Eso sí, tiene acceso a internet, como cualquier contenedor en la red por defecto de Docker.

Pero el agente en sí no queda aislado. El archivo con el token del service account lo puede leer cualquier proceso que corra con mi usuario, Claude Code incluido. Cualquiera con acceso al socket de Docker puede correr `docker inspect` sobre el contenedor y leer el token de GitHub, y Claude Code puede correr `docker`. `op.exe` con la integración de escritorio también sigue disponible, protegido solo por el aviso de aprobación de 1Password. Ya con el service account creado, puedes apagar **Integrate with 1Password CLI** en **Settings > Developer** si ninguna otra herramienta que uses depende de ella. Y el agente ni siquiera necesita ver el token para usarlo mal. Si lee un issue o un README con instrucciones escondidas (prompt injection), puede llamar directamente a las herramientas de GitHub con los permisos que tenga el token.

| Capa                                          | Qué limita                                                                | Qué sigue permitiendo                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Vault AI Agents + service account             | El agente solo puede leer los items de ese vault                          | Cualquier proceso que corra con mi usuario puede leer el archivo del token |
| PAT fine-grained de GitHub                    | Los repositorios y operaciones que tiene el token                         | El agente puede usar todo lo que el token sí permite                       |
| Contenedor del servidor                       | La imagen del servidor no puede leer mis archivos                         | El contenedor tiene acceso a internet                                      |
| `no-new-privileges`, límites de CPU y memoria | La escalada de privilegios y el consumo de recursos dentro del contenedor | Claude Code corre sin ninguno de esos límites                              |
| `--block-secrets`                             | Que aparezcan secretos en las llamadas y respuestas de las herramientas   | `docker inspect` sobre el contenedor muestra el token                      |
| `--tools` y modo de solo lectura              | Qué herramientas de GitHub puede llamar el agente                         | Un prompt injection todavía puede usar las herramientas permitidas         |

Si algo se filtra, se filtra un token de GitHub fine-grained que expira y acceso de lectura a un vault que solo tiene ese token, no toda mi cuenta de 1Password. Por eso cuido tanto los permisos del token. El parámetro `--tools` del gateway y el modo de solo lectura del servidor de GitHub pueden limitarlo todavía más. Para aislar al agente está {{< extlink href="https://docs.docker.com/ai/sandboxes/" >}}Docker Sandboxes{{< /extlink >}}, y el {{< extlink href="https://1password.com/blog/introducing-1password-credential-broker" >}}Credential Broker{{< /extlink >}} de 1Password parece una forma de prescindir del token del service account. Todavía no he probado ninguno de los dos.
