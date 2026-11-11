---
title: 'Usa 1Password en Windows con Dev Containers en WSL2'
slug: 'use-1password-in-windows-with-wsl2-dev-containers'
date: 2026-01-15T06:57:56-06:00
description: 'Una guía paso a paso para configurar 1Password como tu agente unificado de SSH y firma de Git en Windows, WSL2 y VS Code Dev Containers.'
draft: false
tags: [windows, wsl]
image: 'images/cover.png'
---

Cuando pasé todo mi desarrollo a Dev Containers dentro de WSL2, también saqué Docker de Windows: corre dentro de la distro de WSL, así mi código queda aislado del lado de Windows. El problema fue firmar los commits. Uso el agente SSH de 1Password en Windows con Windows Hello, y el truco de siempre, apuntar el `.gitconfig` a `op-ssh-sign.exe` por `/mnt/c/`, solo funciona en WSL. Dentro de un contenedor esa ruta no existe, y los contenedores no ven los montajes ni los named pipes de Windows.

La solución es un puente pequeño: `socat` y `npiperelay` exponen el agente de 1Password de Windows como un socket Unix en WSL, y los contenedores usan ese socket. Así firmas con Windows Hello para GitHub, GitLab o Azure DevOps, sin llaves privadas en `~/.ssh/` en Linux, exponiendo solo las bóvedas que tú decidas, y con una sola configuración de Git que funciona igual en Windows, WSL y cualquier Dev Container. Además te ahorras andar manejando llaves separadas para cada ambiente.

{{< figure-dynamic
    light-src="images/1password-ssh-agent-architecture-light.svg"
    dark-src="images/1password-ssh-agent-architecture-dark.svg"
    alt="1Password SSH agent system architecture"
    title="System Architecture" >}}

## Configuración

### Prerrequisitos

- Git for Windows instalado, con tu {{< extlink href="https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup" >}}nombre de usuario y correo global{{< /extlink >}} ya configurados
- 1Password 8+ para Windows (con Windows Hello configurado).
- WSL 2 con `systemd` habilitado. Si instalaste Ubuntu con `wsl --install`, systemd ya viene habilitado; si no, sigue la {{< extlink href="https://learn.microsoft.com/en-us/windows/wsl/systemd" >}}documentación oficial{{< /extlink >}}.
- `npiperelay.exe` descargado y agregado a tu Windows `%PATH%`. Sigue las instrucciones del repo oficial de {{< extlink href="https://github.com/jstarks/npiperelay" >}}npiperelay{{< /extlink >}} o descarga el {{< extlink href="https://github.com/jstarks/npiperelay/releases" >}}release{{< /extlink >}} y descomprímelo en algún lugar de tu `%PATH%`. Yo creo una carpeta `bin` en mi home de Windows y ahí extraigo `npiperelay.exe`.

### Paso 1: configura el host de Windows

En 1Password, ve a **Settings > Developer** y marca **Use the 1Password SSH agent**, como explica la {{< extlink href="https://developer.1password.com/docs/ssh/get-started/" >}}guía de 1Password{{< /extlink >}}.

**Tip de seguridad**: en la configuración del agente puedes limitar qué bóvedas comparte, para no exponer tus llaves personales al ambiente de desarrollo. Mira la {{< extlink href="https://developer.1password.com/docs/ssh/agent/config/#from-the-1password-app" >}}configuración del archivo del agente{{< /extlink >}}.

Abre Windows PowerShell y revisa que el agente funcione:

```powershell
ssh-add -l
```

Si te salen tus llaves, el lado de Windows ya está listo.

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

```text
cat <<EOT > ~/.config/systemd/user/1password-ssh-agent.service
[Unit]
Description=Bridge 1Password SSH Agent from Windows

[Service]
Type=simple
ExecStart=/usr/bin/socat -d -d UNIX-LISTEN:"/tmp/1password-agent.sock",fork EXEC:"/mnt/c/Users/[username]/bin/npiperelay.exe -ei -s //./pipe/openssh-ssh-agent",nofork
ExecStop=rm -f /tmp/1password-agent.sock
Restart=Always

[Install]
WantedBy=default.target
EOT
```

Recarga systemd, y luego habilita y arranca el puente:

```bash
systemctl --user daemon-reload
systemctl --user enable --now 1password-ssh-agent.service
```

Revisa que se haya creado el socket:

```bash
ls -la /tmp/1password-agent.sock
```

Para que `ssh-add` y Git encuentren el puente, configura `SSH_AUTH_SOCK` en el perfil de tu shell (`~/.bashrc` o `~/.zshrc`). Lo puedes agregar así:

```bash
# This appends the export line safely to the end of your profile
echo 'export SSH_AUTH_SOCK=/tmp/1password-agent.sock' >> ~/.bashrc
```

O agrega esta línea a mano al final del archivo:

```bash
export SSH_AUTH_SOCK=/tmp/1password-agent.sock
```

Luego recarga tu perfil:

```bash
# For Bash
source ~/.bashrc

# For Zsh
source ~/.zshrc
```

### Paso 3: configura la firma y verificación de Git

Para que Git firme y verifique las firmas en tu máquina, no solo en GitHub, necesitas un archivo de firmantes permitidos ("Allowed Signers") y una llave de firma que coincida con la que te da 1Password.

Corre `ssh-add -L` en WSL y copia la llave pública completa (por ejemplo, `ssh-ed25519 AAA...`). Tiene que ser la misma que pongas en Git para que la firma funcione:

```bash
git config --global gpg.format ssh
git config --global user.signingkey "YOUR_SSH_ED25519_PUBLIC_KEY_STRING"
git config --global commit.gpgsign true
```

Crea el archivo Allowed Signers para que Git pueda verificar tus propias firmas. Cambia el correo y la llave por los tuyos:

```bash
# Add yourself to the allowed signers
echo "$(git config --global user.email) YOUR_SSH_ED25519_PUBLIC_KEY_STRING" > ~/.ssh/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

Por último, crea `$HOME/.ssh/config` con el reenvío del agente:

```text
Host *
  ForwardAgent yes
  IdentityAgent /tmp/1password-agent.sock
```

## Cómo funciona

{{< figure-dynamic
    light-src="images/1password-ssh-authentication-flow-light.svg"
    dark-src="images/1password-ssh-authentication-flow-dark.svg"
    alt="1Password SSH agent authentication flow"
    title="Authentication Flow" >}}

## Comprueba que funciona

Haz un commit, apruébalo con Windows Hello y corre:

```bash
git log --show-signature
```

{{< gallery caption="Firma al crear el commit" >}}
{{< gallery-image src="images/1password-access-requested.webp" alt="1Password solicitará acceso a la llave" >}}
{{< gallery-image src="images/windows-hello.webp" alt="Autoriza con Windows Hello" >}}
{{< /gallery >}}

{{< gallery caption="Verificar resultados" >}}
{{< gallery-image src="images/git-signature-verification-inside-dev-container.webp" alt="Ejemplo de una buena firma ssh" >}}
{{< /gallery >}}

Deberías ver: `Good "git" signature for [email] with ED25519 key ...`

Escribí esto cuando lo que buscaba era firmar mis propios commits desde los contenedores. Hoy, con más de mi trabajo hecho con agentes, replantearía esta configuración, pero en su momento fue la forma de tener mis dev containers aislados y seguir firmando cada commit.

---

Foto por {{< extlink href="https://unsplash.com/@cos592?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Cosmin Andrei Buzamat{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/stacked-colorful-shipping-containers-with-a-blue-crane-ZH-R-3DgVK8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}

Inspirado por {{< extlink href="https://xebia.com/blog/elevate-your-git-security-signing-github-commits-with-1password-in-windows-wsl-and-containers/" >}}el artículo de Marius Boden «Git Security: Signing GitHub Commits with 1Password in Windows WSL and Containers»{{< /extlink >}} en {{< extlink href="https://xebia.com/blog/" >}}Xebia{{< /extlink >}}
