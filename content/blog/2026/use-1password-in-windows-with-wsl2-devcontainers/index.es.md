---
title: 'Usa 1Password en Windows con Dev Containers en WSL2'
slug: 'use-1password-in-windows-with-wsl2-dev-containers'
date: 2026-01-15T06:57:56-06:00
lastmod: 2026-11-20T12:00:00-06:00
description: 'Una guía paso a paso para configurar 1Password como tu agente unificado de SSH y firma de Git en Windows, WSL2 y VS Code Dev Containers.'
draft: false
tags: [windows, wsl]
image: 'images/cover.png'
---

Docker Desktop solo es gratis para uso personal, educación, proyectos open source sin fines comerciales y empresas pequeñas, y como contratista mi trabajo no siempre entraba en esos casos. Así que instalé Docker directo en la distro de WSL y pasé todo mi desarrollo a Dev Containers dentro de WSL2, lo que además dejó mi código aislado del lado de Windows. El problema con el que me topé fue firmar los commits. Uso el agente SSH de 1Password en Windows con Windows Hello, y la configuración que encontré apunta el `.gitconfig` a `op-ssh-sign.exe` por `/mnt/c/` o por medio de Interop, pero eso solo funciona en WSL. Dentro de un contenedor esa ruta no existe, y los contenedores no ven los montajes ni los named pipes de Windows.

La solución es un puente pequeño: `socat` y `npiperelay` exponen el agente de 1Password de Windows como un socket Unix en WSL, y los contenedores usan ese socket. Así firmas tus commits con Windows Hello para GitHub, GitLab o Azure DevOps, sin llaves privadas en `~/.ssh/` en Linux, exponiendo solo la llave que tú decidas, y con una sola llave de firma que funciona igual en WSL y en cualquier Dev Container.

Si solo trabajas en WSL, la {{< extlink href="https://developer.1password.com/docs/ssh/integrations/wsl/" >}}integración de 1Password con WSL{{< /extlink >}} es más sencilla. Depende de la interoperabilidad con Windows, que los contenedores no tienen, y por eso aquí armamos el puente.

{{< figure-dynamic
    light-src="images/1password-ssh-agent-architecture-light.svg"
    dark-src="images/1password-ssh-agent-architecture-dark.svg"
    alt="Arquitectura del agente SSH de 1Password"
    title="Arquitectura del sistema" >}}

## Configuración

### Prerrequisitos

- Git en WSL, con tu {{< extlink href="https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup" >}}nombre de usuario y correo global{{< /extlink >}} ya configurados.
- 1Password 8+ para Windows (con Windows Hello configurado).
- WSL 2 con `systemd` habilitado. Si instalaste Ubuntu con `wsl --install`, systemd ya viene habilitado; si no, sigue la {{< extlink href="https://learn.microsoft.com/en-us/windows/wsl/systemd" >}}documentación oficial{{< /extlink >}}.
- `npiperelay`, instalado con winget desde el fork {{< extlink href="https://github.com/albertony/npiperelay" >}}albertony/npiperelay{{< /extlink >}}, que mantiene el proyecto original compilado y con parches. En PowerShell, corre `winget install albertony.npiperelay --source winget`. El servicio del Paso 2 apunta a la ruta de instalación, así que la carpeta no necesita estar en tu `%PATH%`.

### Paso 1: configura el host de Windows

En 1Password, ve a **Settings > Developer** y marca **Use the 1Password SSH agent**, como explica la {{< extlink href="https://developer.1password.com/docs/ssh/get-started/" >}}guía de 1Password{{< /extlink >}}. Marca también **Keep 1Password in the notification area** en **Settings > General**, para que el agente siga corriendo aunque cierres la ventana.

Windows trae su propio agente de OpenSSH, que compite con 1Password por el pipe `\\.\pipe\openssh-ssh-agent`. En un PowerShell como administrador, detenlo y desactívalo. Si el servicio no existe, sáltate esto:

```powershell
Stop-Service ssh-agent
Set-Service ssh-agent -StartupType Disabled
```

Todo lo que llegue al agente le puede pedir que firme, así que expón lo mínimo. Crea en 1Password una llave SSH solo para firmar, en una bóveda solo para desarrollo, y dile al agente que ofrezca únicamente esa. Crea `%LOCALAPPDATA%\1Password\config\ssh\agent.toml`:

```toml
[[ssh-keys]]
item = "Git Signing Key"
vault = "Dev"
```

Cuando este archivo existe, el agente ofrece solo las llaves que lista. Bloquea y desbloquea 1Password para que lo recargue. La {{< extlink href="https://developer.1password.com/docs/ssh/agent/config/" >}}documentación del archivo de configuración{{< /extlink >}} tiene la sintaxis completa.

Para 1Password, todas las peticiones que pasan por el puente vienen de `npiperelay.exe`, así que una sola aprobación cubre todo lo que use el socket en WSL hasta que termine la sesión. Si te aguantas un Windows Hello en cada commit, elige la opción de aprobación por petición en **Settings > Developer**, y nunca marques **Approve for all applications** en un aviso. La {{< extlink href="https://developer.1password.com/docs/ssh/agent/security/" >}}documentación de seguridad del agente{{< /extlink >}} explica las opciones.

Abre Windows PowerShell y revisa que el agente funcione:

```powershell
ssh-add -l
```

Deberías ver solo tu llave de firma.

### Paso 2: crea el puente en WSL

Instala `socat` en WSL, que es el que pasa el socket de un lado al otro:

```bash
sudo apt update && sudo apt install socat -y
```

Crea la carpeta de servicios de systemd de tu usuario si todavía no existe:

```bash
mkdir -p ~/.config/systemd/user/
```

Crea el servicio que levanta el puente cada vez que entras a WSL. Cambia `[username]` por tu usuario de Windows:

```bash
cat <<EOT > ~/.config/systemd/user/1password-ssh-agent.service
[Unit]
Description=Bridge 1Password SSH Agent from Windows

[Service]
Type=simple
ExecStart=/usr/bin/socat -d -d UNIX-LISTEN:%t/1password-agent.sock,fork,mode=600,unlink-early EXEC:"/mnt/c/Users/[username]/AppData/Local/Microsoft/WinGet/Packages/albertony.npiperelay_Microsoft.Winget.Source_8wekyb3d8bbwe/npiperelay.exe -ei -s //./pipe/openssh-ssh-agent",nofork
ExecStopPost=-/usr/bin/rm -f %t/1password-agent.sock
Restart=always

[Install]
WantedBy=default.target
EOT
```

`%t` es tu directorio de runtime (`/run/user/<uid>`), que solo usa tu usuario. `mode=600` deja el socket solo para ti, y `unlink-early` borra un socket que haya quedado de antes para que el servicio reinicie sin problemas.

Recarga systemd, y luego habilita y arranca el puente:

```bash
systemctl --user daemon-reload
systemctl --user enable --now 1password-ssh-agent.service
```

Revisa que se haya creado el socket. El listado debe empezar con `srw-------`:

```bash
ls -la "$XDG_RUNTIME_DIR/1password-agent.sock"
```

Para que `ssh-add` y Git encuentren el puente, configura `SSH_AUTH_SOCK` en el perfil de tu shell. Este comando agrega la línea solo si todavía no está. Si usas Zsh, cambia `~/.bashrc` por `~/.zshrc`:

```bash
grep -qxF 'export SSH_AUTH_SOCK="$XDG_RUNTIME_DIR/1password-agent.sock"' ~/.bashrc || echo 'export SSH_AUTH_SOCK="$XDG_RUNTIME_DIR/1password-agent.sock"' >> ~/.bashrc
```

Luego recarga tu perfil (`source ~/.bashrc` o `source ~/.zshrc`) y comprueba que WSL ve la misma llave que PowerShell:

```bash
ssh-add -l
```

### Paso 3: configura la firma y verificación de Git

Para firmar, Git necesita una llave de firma que coincida con la que te da 1Password. Para verificar las firmas en tu máquina, no solo en GitHub, también necesitas un archivo de firmantes permitidos ("Allowed Signers").

Corre `ssh-add -L` en WSL y copia la llave pública completa (por ejemplo, `ssh-ed25519 AAA...`). Tiene que ser la misma que pongas en Git para que la firma funcione:

```bash
git config --global gpg.format ssh
git config --global user.signingkey "YOUR_SSH_ED25519_PUBLIC_KEY_STRING"
git config --global commit.gpgsign true
```

Crea el archivo Allowed Signers para que Git pueda verificar tus propias firmas. Cambia la llave por la tuya:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "$(git config --global user.email) YOUR_SSH_ED25519_PUBLIC_KEY_STRING" >> ~/.ssh/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

Agrega la misma llave pública a GitHub como **Signing Key**. Es una entrada aparte de una Authentication Key, aunque sea la misma llave. Si quieres que GitHub rechace commits sin firma, agrega un ruleset o una protección de rama que exija commits firmados.

No necesitas un `~/.ssh/config` para esto, y no actives `ForwardAgent`: con el reenvío activo, cualquier servidor al que te conectes puede usar tu agente mientras dure la conexión. Si lo necesitas para un servidor de confianza, actívalo solo para ese host.

Firmar en el propio Windows es otra configuración: en la app de 1Password abre la llave, elige **Configure Commit Signing** y pega el fragmento en tu `.gitconfig` de Windows.

### Paso 4: úsalo en un Dev Container

La extensión Dev Containers reenvía tu agente SSH al contenedor y copia tu `.gitconfig` al arrancar. No hace falta montar el socket. Reenvía lo que apunte `SSH_AUTH_SOCK` en el servidor de VS Code que corre en WSL, así que:

- Abre el proyecto desde WSL (`code .` en una terminal de WSL), no desde una ruta de Windows.
- El puente tiene que estar corriendo antes de abrir el contenedor. Si acabas de agregar `SSH_AUTH_SOCK` a tu perfil, cierra VS Code y ábrelo otra vez.
- El contenedor necesita `openssh-client`, porque Git firma con `ssh-keygen`, y con `ssh-add` revisas el agente. La mayoría de las imágenes de Dev Containers ya lo traen. Si la tuya no, agrega `RUN apt-get update && apt-get install -y openssh-client` al Dockerfile.

Tu `.gitconfig` copiado apunta `gpg.ssh.allowedSignersFile` a la ruta completa de `~/.ssh/allowed_signers` en WSL (tu terminal expandió `~` en el Paso 3), y esa ruta no existe en el contenedor. Firmar sigue funcionando, pero `git log --show-signature` no puede verificar. Podrías montar el archivo, pero entonces el contenedor no arranca para quien no lo tenga, como alguien que quiera contribuir o GitHub Codespaces, y el destino depende del usuario del contenedor. Mejor arma el archivo dentro del contenedor con la configuración que VS Code ya copió. Guarda esto como `.devcontainer/allowed-signers.sh`:

```sh
#!/bin/sh
set -eu

[ "$(git config --global gpg.format || true)" = ssh ] || exit 0
key="$(git config --global user.signingkey || true)"
key="${key#key::}"
case "$key" in "~/"*) key="$HOME/${key#\~/}" ;; esac
if [ -f "$key" ]; then key="$(cat "$key" 2>/dev/null)" || exit 0; fi
case "$key" in ssh-* | ecdsa-* | sk-*) ;; *) exit 0 ;; esac
email="$(git config --global user.email)" || exit 0
nl='
'
case "$email$key" in *"$nl"*) exit 0 ;; esac

file="$HOME/.ssh/allowed_signers"
mkdir -p "$HOME/.ssh"
rm -f "$file"
printf '%s %s\n' "$email" "$key" >"$file"
git config --global gpg.ssh.allowedSignersFile "$file"
```

Córrelo cada vez que VS Code se conecte, después de que copie tu `.gitconfig`:

```jsonc
{
    "postAttachCommand": "sh .devcontainer/allowed-signers.sh",
}
```

El script no hace nada a menos que Git firme con una llave SSH, así que ni quienes contribuyen ni Codespaces se enteran. El archivo que genera solo confía en tu propia llave de firma, y con eso basta para verificar tus commits.

Dentro del contenedor, corre `ssh-add -l`. Deberías ver la misma llave que en WSL. Si VS Code se conecta antes de que el puente esté arriba, corre `loginctl enable-linger $USER` en WSL para que tus servicios de usuario de systemd arranquen junto con WSL.

Cualquier código dentro de un contenedor que reciba el agente le puede pedir que firme, así que úsalo solo con contenedores en los que confíes.

## Cómo funciona

{{< figure-dynamic
    light-src="images/1password-ssh-authentication-flow-light.svg"
    dark-src="images/1password-ssh-authentication-flow-dark.svg"
    alt="Flujo de autenticación del agente SSH de 1Password"
    title="Flujo de autenticación" >}}

## Comprueba que funciona

Haz un commit, apruébalo con Windows Hello si 1Password te lo pide y corre:

```bash
git log --show-signature
```

{{< gallery caption="Firma al crear el commit" >}}
{{< gallery-image src="images/1password-access-requested.webp" alt="1Password solicitará acceso a la llave" >}}
{{< gallery-image src="images/windows-hello.webp" alt="Autoriza con Windows Hello" >}}
{{< /gallery >}}

{{< gallery caption="Verificar resultados" >}}
{{< gallery-image src="images/git-signature-verification-inside-dev-container.webp" alt="Ejemplo de una buena firma SSH" >}}
{{< /gallery >}}

Deberías ver: `Good "git" signature for [email] with ED25519 key ...`

---

Foto por {{< extlink href="https://unsplash.com/@cos592?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Cosmin Andrei Buzamat{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/stacked-colorful-shipping-containers-with-a-blue-crane-ZH-R-3DgVK8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}

Inspirado por {{< extlink href="https://xebia.com/blog/elevate-your-git-security-signing-github-commits-with-1password-in-windows-wsl-and-containers/" >}}el artículo de Marius Boden «Elevate Your Git Security: Signing GitHub Commits with 1Password in Windows WSL and Containers»{{< /extlink >}} en {{< extlink href="https://xebia.com/blog/" >}}Xebia{{< /extlink >}}
