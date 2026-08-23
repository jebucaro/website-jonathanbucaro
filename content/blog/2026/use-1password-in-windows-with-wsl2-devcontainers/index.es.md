---
title: 'Usa 1Password en Windows con Dev Containers en WSL2'
slug: 'use-1password-in-windows-with-wsl2-dev-containers'
date: 2026-01-15T06:57:56-06:00
description: 'Una guía paso a paso para configurar 1Password como tu agente unificado de SSH y firma de Git en Windows, WSL2 y VS Code Dev Containers.'
draft: false
tags: [windows, wsl]
image: 'images/cover.png'
---

## Por qué importa

Mover tu desarrollo a Dev Containers te da flexibilidad y aislamiento, pero rompe la configuración estándar basada en el montaje de WSL para 1Password si tus Dev Containers se crean desde WSL. Esta guía tiende un puente del agente SSH de 1Password desde Windows hacia tus contenedores usando un socket, para que la firma biométrica de Git funcione en todas partes sin exponer tus llaves privadas.

El desarrollo moderno en Windows llegó a un punto ideal: el rendimiento nativo de Linux de WSL2 combinado con el aislamiento limpio y reproducible de Dev Containers. Pero esa arquitectura por capas muchas veces deja las credenciales de seguridad varadas, y tender un puente de 1Password hacia el stack te deja usar el hardware biométrico de tu máquina Windows (Windows Hello) para autenticarte dentro de entornos Linux aislados, sin dispersar llaves privadas en varios sistemas de archivos virtuales.

## El problema

Si trabajas estrictamente en WSL2, es tentador apuntar tu `.gitconfig` al binario de 1Password en Windows vía el montaje `/mnt/c/`. Eso funciona en apariencia, pero es frágil y se rompe en cuanto te mueves hacia un flujo de trabajo basado en contenedores:

- Referenciar `op-ssh-sign.exe` directamente en tu `.gitconfig` de WSL funciona localmente, pero esa ruta no existe dentro de un Dev Container.
- Los contenedores están aislados por diseño, no tienen acceso a los montajes del sistema de archivos de tu host Windows ni a sus named pipes.
- Distintos entornos de desarrollo tienen distintos puntos de montaje, lo que vuelve las rutas hardcodeadas una pesadilla de mantenimiento.

{{< callout warning >}} Administrar llaves SSH separadas para tu host y tus contenedores aumenta tu superficie de ataque y vuelve la rotación de llaves una pesadilla. {{< /callout >}}

## La solución

Usando `socat` y `npiperelay`, creas un socket Unix que conecta tu entorno Linux con el agente de 1Password en Windows. Eso te da firma biométrica para commits y push a GitHub, GitLab o Azure DevOps con Windows Hello, sin llaves privadas guardadas en `~/.ssh/` en Linux, con aislamiento por bóveda (1Password solo comparte las llaves que tú decidas exponer al agente), y una sola configuración de Git que funciona igual en Windows, WSL y dentro de cualquier Dev Container.

Para ver cómo encajan las piezas:

{{< figure-dynamic
    light-src="images/1password-ssh-agent-architecture-light.svg"
    dark-src="images/1password-ssh-agent-architecture-dark.svg"
    alt="1Password SSH agent system architecture"
    title="System Architecture" >}}

## Inicio rápido

### Prerrequisitos

- Git for Windows instalado y ya configuraste tu {{< extlink href="https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup" >}}nombre de usuario y correo global{{< /extlink >}}
- 1Password 8+ para Windows (con Windows Hello configurado).
- WSL 2 con `systemd` habilitado. Si instalaste Ubuntu con `wsl --install`, tendrás systemd habilitado por defecto; de lo contrario sigue la {{< extlink href="https://learn.microsoft.com/en-us/windows/wsl/systemd" >}}documentación oficial{{< /extlink >}}.
- `npiperelay.exe` descargado y agregado a tu Windows `%PATH%`. Sigue las instrucciones del repo oficial de {{< extlink href="https://github.com/jstarks/npiperelay" >}}npiperelay{{< /extlink >}} o descarga el {{< extlink href="https://github.com/jstarks/npiperelay/releases" >}}release{{< /extlink >}} y descomprímelo en algún lugar de tu `%PATH%`. Este tutorial crea una carpeta `bin` dentro del home de Windows y extrae `npiperelay.exe` ahí.

### Paso 1: configura el host de Windows

En 1Password, ve a **Settings > Developer** y marca **Use the 1Password SSH agent**, siguiendo la {{< extlink href="https://developer.1password.com/docs/ssh/get-started/" >}}guía de 1Password{{< /extlink >}}.

**Tip de seguridad**: en la configuración del agente puedes restringir el acceso a bóvedas específicas para que las llaves personales no queden expuestas a tu entorno de desarrollo. Revisa la {{< extlink href="https://developer.1password.com/docs/ssh/agent/config/#from-the-1password-app" >}}configuración del archivo del agente{{< /extlink >}}.

Abre Windows PowerShell y verifica que el agente esté funcionando:

```powershell
ssh-add -l
```

Si ves tus llaves, la capa del host está lista.

### Paso 2: crea el puente en WSL

Instala `socat` en WSL para manejar el reenvío del socket:

```bash
sudo apt update && sudo apt install socat -y
```

Crea el directorio local del usuario para servicios systemd si aún no existe:

```bash
mkdir -p ~/.config/systemd/user/
```

Crea el archivo del servicio que inicia el puente cada vez que inicias sesión en WSL. Reemplaza `[username]` con tu usuario real de Windows:

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

Recarga el administrador de systemd, luego habilita e inicia el puente:

```bash
systemctl --user daemon-reload
systemctl --user enable --now 1password-ssh-agent.service
```

Confirma que el puente creó el socket Unix:

```bash
ls -la /tmp/1password-agent.sock
```

Para que `ssh-add` y Git encuentren el puente, configura la variable de entorno `SSH_AUTH_SOCK` en el perfil de tu shell (`~/.bashrc` o `~/.zshrc`). Puedes agregarla automáticamente:

```bash
# This appends the export line safely to the end of your profile
echo 'export SSH_AUTH_SOCK=/tmp/1password-agent.sock' >> ~/.bashrc
```

O agrega esta línea manualmente al final de tu archivo de perfil:

```bash
export SSH_AUTH_SOCK=/tmp/1password-agent.sock
```

Por último, recarga tu perfil:

```bash
# For Bash
source ~/.bashrc

# For Zsh
source ~/.zshrc
```

### Paso 3: configura la firma y verificación de Git

Para que Git firme y verifique firmas localmente, no solo en GitHub, necesitas un archivo de firmantes permitidos ("Allowed Signers") y una llave de firma que coincida con lo que 1Password entrega.

Ejecuta `ssh-add -L` en WSL y copia la cadena completa de la llave pública (por ejemplo, `ssh-ed25519 AAA...`). Debe coincidir con tu configuración de Git para que la firma funcione:

```bash
git config --global gpg.format ssh
git config --global user.signingkey "YOUR_SSH_ED25519_PUBLIC_KEY_STRING"
git config --global commit.gpgsign true
```

Crea el archivo Allowed Signers para que Git pueda verificar tus propias firmas localmente. Reemplaza el correo y la llave por los tuyos:

```bash
# Add yourself to the allowed signers
echo "$(git config --global user.email) YOUR_SSH_ED25519_PUBLIC_KEY_STRING" > ~/.ssh/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

Por último, crea `$HOME/.ssh/config` con el reenvío del agente configurado:

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

## Verificar resultados

Para comprobar si tu configuración está firmando y verificando correctamente, crea un commit y luego ejecuta:

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

---

Foto por {{< extlink href="https://unsplash.com/@hdbernd?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Bernd Dittrich{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/a-large-container-ship-in-a-body-of-water-yfQfmji31fY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}

Inspirado por {{< extlink href="https://xebia.com/blog/elevate-your-git-security-signing-github-commits-with-1password-in-windows-wsl-and-containers/" >}}el artículo de Marius Boden «Git Security: Signing GitHub Commits with 1Password in Windows WSL and Containers»{{< /extlink >}} en {{< extlink href="https://xebia.com/blog/" >}}Xebia{{< /extlink >}}
