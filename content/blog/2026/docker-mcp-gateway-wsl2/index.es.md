---
title: 'Corre Docker MCP Gateway en WSL2 sin Docker Desktop'
slug: 'docker-mcp-gateway-wsl2-without-docker-desktop'
date: 2026-11-22T10:00:00-06:00
description: 'Corre el Docker MCP Gateway sobre Docker Engine en WSL2, lee los secretos desde un service account de 1Password de solo lectura y conéctalo a Claude Code.'
image: 'images/cover.png'
draft: false
tags: [windows, wsl, ai-tools, security]
---

Lo que más extrañé al pasar de Docker Desktop a Docker Engine fue el {{< extlink href="https://docs.docker.com/ai/mcp-catalog-and-toolkit/get-started/" >}}MCP Gateway{{< /extlink >}}. Pensaba que solo venía con Desktop, el cual ya no uso (en mi [post de 1Password](/es/blog/use-1password-in-windows-with-wsl2-dev-containers/) cuento la razón). Y era justo lo que buscaba: que los servidores MCP de mis agentes corrieran en contenedores aislados, sin dejar el token de GitHub en texto plano en algún archivo de configuración. Para mi sorpresa, el gateway es un plugin open source del CLI de Docker y corre sin problema sobre Docker Engine dentro de WSL2.

En el camino encontré varias guías con comandos que no funcionaban, así que aquí te comparto lo que sí me funcionó: Claude Code conectado al gateway, con el token de GitHub saliendo de **1Password** y sin que el agente pueda ver el resto de mis vaults. Lo probé con Docker Engine 29.10 y `docker mcp` v0.44.3.

{{< figure-dynamic
    light-src="images/docker-mcp-gateway-architecture-light.svg"
    dark-src="images/docker-mcp-gateway-architecture-dark.svg"
    alt="Arquitectura de Docker MCP Gateway en WSL2: Claude Code arranca el wrapper mcp-gateway, que lee el token de GitHub por medio de op.exe en Windows y un service account de 1Password de solo lectura, y luego corre el gateway y el contenedor github-official."
    title="Arquitectura del sistema"
    caption="El wrapper lee el token de GitHub de un vault que solo ve el service account, se detiene si el token viene vacío y después arranca el gateway." >}}

## Lo que necesitas

- Docker Engine 29 o más reciente en tu distro de WSL2.
- 1Password para Windows y su CLI, instalados con la {{< extlink href="https://www.1password.dev/cli/get-started#windows-3" >}}guía oficial{{< /extlink >}}, con la integración con la app de escritorio activada.
- {{< extlink href="https://docs.anthropic.com/en/docs/claude-code/overview" >}}Claude Code{{< /extlink >}} instalado en WSL.
- Una cuenta de GitHub donde puedas crear un fine-grained personal access token.

## Instala el plugin

El plugin de MCP Gateway es un solo binario que va en la carpeta de plugins del CLI de Docker:

```bash
mkdir -p ~/.docker/cli-plugins
curl -sL https://github.com/docker/mcp-gateway/releases/download/v0.44.3/docker-mcp-linux-amd64.tar.gz \
  | tar -xz -C ~/.docker/cli-plugins docker-mcp
docker mcp version
```

Debería mostrar `v0.44.3`. Revisa la {{< extlink href="https://github.com/docker/mcp-gateway/releases" >}}página de releases{{< /extlink >}} por si hay algo más nuevo, y usa `linux-arm64` si estás en ARM.

## Escoge un servidor para probar

Escogí el servidor oficial de GitHub porque necesita un secreto y también acceso a la red. El catálogo de Docker es una imagen OCI, así que descarga el catálogo y busca `github-official` (escribe `/github-official` en `less`):

```bash
docker mcp catalog pull mcp/docker-mcp-catalog
docker mcp catalog show mcp/docker-mcp-catalog | less
```

Algunos ejemplos usan un servidor que se llama solo `github`, pero el catálogo lo marca como "GitHub (Archived)". En la entrada de `github-official` ves el secreto que espera, `github.personal_access_token`, que llega al contenedor como `GITHUB_PERSONAL_ACCESS_TOKEN`.

## Encuentra op.exe desde WSL

El CLI de 1Password para Linux no se puede comunicar con la app de 1Password en Windows, así que desde WSL te toca llamar al `op.exe` de Windows. En mi caso no estaba en el `PATH` de WSL y tuve que buscarlo en PowerShell:

```powershell
(Get-Command op.exe).Source
```

Convierte esa ruta al formato de WSL y guárdala en una variable (ejecútalo desde WSL):

```bash {hl_lines=[1]}
OP="$(wslpath 'C:\Users\<you>\...\op.exe')"
"$OP" --version
echo "$OP"
```

Anota lo que imprime el comando `echo`, lo vas a necesitar en el wrapper. Deja esta terminal abierta para la siguiente sección o, si abres otra, vuelve a definir `OP`.

Los programas de Windows que llamas desde WSL terminan cada línea de su salida con `\r\n`, por eso los valores se limpian con `tr -d '\r'`. Tampoco ven tus variables de entorno de Linux, a menos que las agregues a `WSLENV`.

## Separa los tokens de tus vaults principales

Podrías leer el token con tu sesión normal de `op`, pero la integración con la app de escritorio le da al CLI acceso a toda tu cuenta. Según el {{< extlink href="https://www.1password.dev/cli/app-integration-security" >}}modelo de seguridad{{< /extlink >}} de 1Password, ese acceso también llega a los sub-shells, así que un agente que corre comandos desde esa terminal podría leer cualquier cosa de la cuenta si llega a ejecutar `op.exe`.

En lugar de eso seguí el {{< extlink href="https://www.1password.dev/sdks/ai-agent" >}}tutorial de 1Password para agentes de IA{{< /extlink >}}, que propone un vault solo para el agente y un service account que únicamente pueda leerlo. Su guía de {{< extlink href="https://www.1password.dev/get-started/secure-ai-access" >}}acceso seguro para IA{{< /extlink >}} agrega que el secreto solo debería llegar al proceso que lo necesita, nunca al modelo ni a un archivo de configuración. El wrapper de más adelante sigue esa idea y manda el token directo al contenedor del servidor de GitHub, sin pasar por Claude Code.

Los service accounts vienen en todos los planes, y en 1Password, Families y Teams el límite es de 1,000 lecturas por hora. El wrapper hace una sola lectura cada vez que arranca.

1. En la app de 1Password, crea un vault llamado **AI Agents**.
2. Crea un {{< extlink href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token" >}}fine-grained personal access token{{< /extlink >}} en GitHub, solo con los repositorios y permisos que necesita el servidor MCP de GitHub. El agente hereda ese mismo acceso por medio de las herramientas del servidor, así que lo que le des aquí es lo que el agente va a poder hacer. Guárdalo en ese vault como un **API Credential** llamado **GitHub PAT**.
3. Crea el service account. Esta es la última vez que usas tu sesión normal de `op`:

```bash
"$OP" service-account create "Claude Code MCP Gateway" --vault "AI Agents:read_items" --expires-in 90d
```

El comando te muestra el token (empieza con `ops_`) una sola vez. Guárdalo en un archivo que solo tú puedas leer, sin que quede en el historial de tu shell, y limpia la terminal cuando termines:

```bash
mkdir -p ~/.config/mcp-gateway
(umask 077; printf 'Token: '; read -rs t; printf '%s' "$t" > ~/.config/mcp-gateway/op-service-account-token; echo)
chmod 600 ~/.config/mcp-gateway/op-service-account-token
```

Ahora revisa qué puede ver el service account:

```bash
OP_SERVICE_ACCOUNT_TOKEN="$(<~/.config/mcp-gateway/op-service-account-token)" \
  WSLENV=OP_SERVICE_ACCOUNT_TOKEN/w "$OP" vault list </dev/null
```

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
```

Solo debería aparecer AI Agents.

{{< callout important >}}
Sin `WSLENV=...`, el mismo comando me listó todos los vaults de mi cuenta. `op.exe` nunca recibió el token y, sin avisar, usó la integración con la app de escritorio. El `/w` hace que la variable pase solo de WSL a Windows.
{{< /callout >}}

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    Private
xxxxxxxxxxxxxxxxxxxxxxxxxx    AI Agents
xxxxxxxxxxxxxxxxxxxxxxxxxx    Family
xxxxxxxxxxxxxxxxxxxxxxxxxx    Shared
```

## El wrapper

Los clientes MCP arrancan cada servidor ejecutando un comando directamente, sin pasar por un shell, así que el manejo de los secretos va en un script pequeño. Yo lo guardé como `~/.local/bin/mcp-gateway`. Cambia la ruta de `op.exe` por la tuya y ejecuta `chmod +x`:

```bash {hl_lines=[7]}
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

`DOCKER_MCP_IN_CONTAINER=1` le indica al gateway que no está corriendo con Docker Desktop. Sin esa variable, `gateway run` no arranca ningún servidor y lista 0 herramientas, también sin dar ningún error.

El gateway lee lo que le pasas en `--secrets` una sola vez al arrancar, por eso funciona con una sustitución de procesos (process substitution) y el token de GitHub nunca se escribe en disco. Antes de arrancar el gateway, el script borra del entorno el token del service account, y así ni el gateway ni sus contenedores lo reciben. El `</dev/null` lo agregué después de mi primer intento con Claude Code, que se quedó esperando 30 segundos y falló porque `op.exe` heredaba el stdin que Claude Code usa para hablar con el gateway y se comía el primer mensaje.

{{< callout warning >}}
Si el gateway no puede leer un archivo de secretos, no da ningún error y arranca sin el secreto. Por eso el wrapper revisa que el token no venga vacío.
{{< /callout >}}

Por lo mismo no uso el parámetro `--watch`. `<(...)` es un pipe que parece archivo (algo como `/dev/fd/63`) y solo se puede leer una vez. Cuando `--watch` recarga la configuración, el gateway vuelve a leer esa ruta, la encuentra vacía y arranca los servidores sin el token, otra vez sin avisar.

La documentación de Docker configura los servidores con profiles (`docker mcp gateway run --profile <nombre>`), pero asume que tienes Docker Desktop. En Docker Engine, los profiles leen sus secretos del {{< extlink href="https://github.com/docker/secrets-engine" >}}Secrets Engine{{< /extlink >}} de Docker, que ahí todavía es experimental y necesita D-Bus y un keyring como GNOME Keyring. Una distro de WSL no trae ninguno de los dos por defecto, así que ahí se cae. Y aunque los tuviera, el gateway no acepta los parámetros `--secrets` y `--profile` juntos. Por eso el wrapper le pasa los servidores con `--servers`.

Con `--servers` pierdes las dynamic tools del gateway (`mcp-find`, `mcp-add`, `code-mode`), que le permiten al agente agregar servidores del catálogo a media conversación. Como el agente tiene acceso a mis tokens, igual prefiero una lista fija.

| Configuración                    | Resultado      | Por qué                                                                                        |
| -------------------------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| `--servers` + `--secrets <(...)` | La que uso     | El gateway lee el pipe una sola vez al arrancar y con eso le basta. Sin dynamic tools.         |
| `--watch` + `--secrets <(...)`   | Mejor evitarla | Cada recarga vuelve a leer el pipe, lo encuentra vacío y los servidores regresan sin el token. |
| `--profile` + `--secrets`        | No funciona    | Los dos parámetros no se pueden combinar.                                                      |
| `--profile` + Secrets Engine     | Todavía no     | Sigue siendo experimental en Docker Engine.                                                    |

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

Reinicia Claude Code y las herramientas de GitHub van a aparecer en `/mcp`.

## Agrega otros servidores del catálogo

El catálogo tiene más de 300 servidores. Con estos comandos los listas y ves qué necesita cada uno:

```bash
docker mcp catalog server ls mcp/docker-mcp-catalog
docker mcp catalog server inspect mcp/docker-mcp-catalog brave | less
```

En la salida de `inspect`, el campo `secrets` te dice qué secretos espera el servidor. Para agregar cualquiera de ellos editas el wrapper.

Si el contenedor del MCP no necesita ningún secreto, solo agrégalo al valor por defecto de `--servers`, separado por una coma. Yo lo probé con el servidor de búsqueda de DuckDuckGo:

```bash
  --servers "${MCP_SERVERS:-github-official,duckduckgo}" \
```

Si necesita alguno, guarda primero la credencial en la bóveda de AI Agents, léela con `op.exe` justo después de validar el token de GitHub y agrega una línea por secreto en `--secrets`. Para Brave Search, que espera `brave.api_key`, el cambio queda así:

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

Vuelve a correr `mcp-gateway --dry-run --verbose` y deberías ver `BRAVE_API_KEY` enmascarado igual que el token de GitHub. Después reinicia Claude Code para que levante los servidores nuevos.

## Qué protege y qué no

El servidor de GitHub corre con `no-new-privileges`. El token se pasa por nombre (`-e GITHUB_PERSONAL_ACCESS_TOKEN`), así que no aparece en la lista de procesos, y el parámetro `--block-secrets` (activo por defecto) bloquea secretos en las llamadas y respuestas de las herramientas. El token de GitHub no queda en la configuración de Claude Code, ni en mis dotfiles, ni en un `.env`, solo vive en memoria y dentro del contenedor.

Al agente, en cambio, no lo aísla. Claude Code, como cualquier proceso que corra con mi usuario, puede leer el archivo con el token del service account. Y como puede correr `docker`, también puede hacer `docker inspect` al contenedor y ver el token de GitHub, igual que cualquiera con acceso al socket de Docker. `op.exe` con la integración de escritorio sigue ahí, protegido solo por el aviso de aprobación de 1Password. Cuando ya te funcione el service account, puedes apagar **Integrate with 1Password CLI** en **Settings > Developer** si nada más depende de esa configuración.

Y el agente ni siquiera necesita ver el token para usarlo mal. Si lee un issue o un README con instrucciones escondidas (prompt injection), puede llamar a las herramientas de GitHub con todo lo que el token permita.

| Capa                                          | Qué limita                                                                | Qué sigue permitiendo                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Vault AI Agents + service account             | El agente solo puede leer los items de ese vault                          | Cualquier proceso que corra con mi usuario puede leer el archivo del token |
| PAT fine-grained de GitHub                    | Los repositorios y operaciones que tiene el token                         | El agente puede usar todo lo que el token sí permite                       |
| Contenedor del servidor                       | La imagen del servidor no puede leer mis archivos                         | El contenedor tiene acceso a internet                                      |
| `no-new-privileges`, límites de CPU y memoria | La escalada de privilegios y el consumo de recursos dentro del contenedor | Claude Code corre sin ninguno de esos límites                              |
| `--block-secrets`                             | Que aparezcan secretos en las llamadas y respuestas de las herramientas   | `docker inspect` sobre el contenedor muestra el token                      |
| `--tools` y modo de solo lectura              | Qué herramientas de GitHub puede llamar el agente                         | Un prompt injection todavía puede usar las herramientas permitidas         |

Si algo se filtra, lo peor que sale es un token fine-grained que expira y acceso de lectura a un vault que solo tiene los tokens del agente. Hasta ahí llegan los permisos del token, y el parámetro `--tools` del gateway o el modo de solo lectura del servidor de GitHub los pueden recortar todavía más.

El service account dura 90 días y los tokens de GitHub lo que tú les pongas, así que dales una expiración corta y rótalos de vez en cuando.

Para aislar al agente está {{< extlink href="https://docs.docker.com/ai/sandboxes/" >}}Docker Sandboxes{{< /extlink >}}, y el {{< extlink href="https://1password.com/blog/introducing-1password-credential-broker" >}}Credential Broker{{< /extlink >}} de 1Password parece una forma de quitar del todo el token del service account. Todavía no he probado ninguno de los dos. Claude Code también tiene su propio {{< extlink href="https://code.claude.com/docs/en/sandboxing" >}}sandbox{{< /extlink >}} para los comandos que corre con Bash (en WSL2 usa bubblewrap). No rompe esta configuración, porque los servidores MCP corren fuera de él. Eso sí, viene apagado por defecto, y aunque lo actives, Bash puede seguir leyendo el archivo del token hasta que agregues su ruta a `sandbox.filesystem.denyRead`.

---

Foto de {{< extlink href="https://unsplash.com/@nknezevic?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Nikola Knezevic{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/a-dark-tunnel-with-an-open-door-leading-to-a-grassy-field-Q3JcLtECTtE?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
