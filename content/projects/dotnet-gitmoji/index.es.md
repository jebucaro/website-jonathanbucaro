---
title: 'dotnet-gitmoji: un CLI de gitmoji para el mundo dotnet'
subtitle: 'Una herramienta .NET que lleva la convención de commits de gitmoji a Git, con un hook prepare-commit-msg administrado por Husky.Net para equipos y un modo cliente interactivo para flujos personales.'
date: 2026-04-24T10:30:00Z
draft: false
image: 'images/cover.webp'
description: 'Una herramienta .NET que lleva la convención de commits de gitmoji a Git, con un hook prepare-commit-msg administrado por Husky.Net para equipos y un modo cliente interactivo para flujos personales.'
categories: ['CLI Tool']
---

## Descripción del proyecto

`dotnet-gitmoji` es una pequeña herramienta de .NET 10 que lleva la convención de commits de [gitmoji](https://gitmoji.dev) a un flujo .NET. Puedes instalarla globalmente para uso personal o fijarla en el tool manifest local de un repositorio para uso en equipo. Desde ahí tienes dos caminos de adopción: un hook `prepare-commit-msg` administrado a través de Husky.Net, o `dotnet-gitmoji commit` como reemplazo interactivo del comando nativo de Git. En cualquiera de los dos caminos, la herramienta te pide un gitmoji, te permite hacer fuzzy search sobre la lista completa y formatea el mensaje de commit final.

La forma que más me interesa es el flujo de equipo. Cuando un repositorio deja versionados `.config/dotnet-tools.json`, `.husky/` y `Directory.Build.targets`, un integrante puede clonarlo, ejecutar `dotnet restore` o abrir la solución en Visual Studio o Rider, y obtener el mismo prompt de gitmoji en el siguiente commit. Así toda la convención se queda dentro de NuGet, MSBuild y el SDK de .NET en lugar de depender de Node.js sólo para compartir un hook de commit.

{{< callout note>}}

<strong>Repositorio de GitHub</strong>: {{< extlink href="https://github.com/jebucaro/dotnet-gitmoji" >}}dotnet + git + emoji = dotnet-gitmoji{{< /extlink >}}

{{< /callout >}}

## Tecnologías utilizadas

<div class="table-container">
  <table>
    <tr>
      <th>Capa</th>
      <th>Elección</th>
      <th>Por qué está en el stack</th>
    </tr>
    <tr>
      <td><strong>Runtime</strong></td>
      <td>.NET 10</td>
      <td>Target moderno con soporte de primera para global tools y una línea base estable de <code>System.Text.Json</code>.</td>
    </tr>
    <tr>
      <td><strong>Empaquetado</strong></td>
      <td>.NET tool</td>
      <td>Se publica en NuGet como <code>dotnet-gitmoji</code> y funciona tanto como herramienta local compartida como instalación global personal.</td>
    </tr>
    <tr>
      <td><strong>CLI framework</strong></td>
      <td>CliFx</td>
      <td>Atributos declarativos para comandos y opciones, y juega bien con DI sin configuración adicional.</td>
    </tr>
    <tr>
      <td><strong>UX de terminal</strong></td>
      <td>Spectre.Console</td>
      <td>Manejo de prompts de selección, pickers con fuzzy search en vivo y salida con color.</td>
    </tr>
    <tr>
      <td><strong>Invocación de procesos</strong></td>
      <td>CliWrap</td>
      <td>Envuelve cada llamada a <code>git</code> y <code>dotnet</code> con una API tipada y amigable para tests.</td>
    </tr>
    <tr>
      <td><strong>Composición</strong></td>
      <td>Microsoft.Extensions.DependencyInjection</td>
      <td>Mantiene servicios, validadores y comandos cableados a través de un solo contenedor.</td>
    </tr>
    <tr>
      <td><strong>HTTP</strong></td>
      <td>Microsoft.Extensions.Http</td>
      <td>Trae la lista de gitmoji desde <code>gitmoji.dev</code> con un <code>HttpClient</code> tipado.</td>
    </tr>
    <tr>
      <td><strong>Testing</strong></td>
      <td>xUnit, NSubstitute, coverlet</td>
      <td>Tests unitarios para servicios y validadores, además de un fixture de integración para la herramienta de extremo a extremo.</td>
    </tr>
  </table>
</div>

## Arquitectura

La herramienta sigue la estructura estándar de CliFx. `Program.cs` configura el contenedor de DI, CliFx resuelve el comando pedido desde el service provider, y el comando delega el trabajo real a un servicio. Los servicios son interface-first, y eso es lo que hace que los tests con xUnit y NSubstitute sean fáciles de escribir. Al mismo flujo de commit se accede desde dos puntos de entrada: el hook `prepare-commit-msg` de Git y el comando interactivo `commit`.

{{< figure-dynamic
    light-src="images/dotnet-gitmoji-runtime-shape-light.svg"
    dark-src="images/dotnet-gitmoji-runtime-shape-dark.svg"
    alt="dotnet-gitmoji runtime shape"
    title="dotnet-gitmoji runtime shape" >}}

El diagrama de arquitectura muestra de qué se encarga cada capa. El diagrama de secuencia de abajo muestra qué se ejecuta realmente al hacer un commit. Ambos puntos de entrada convergen en `PromptService`, que controla el selector difuso (fuzzy) y luego delega en `CommitMessageService` la escritura del resultado. La única diferencia está en quién invoca `git commit` al final: en modo hook, Git ya tiene el control, así que la herramienta simplemente reescribe el archivo del mensaje; en modo cliente, `GitService` invoca Git directamente.

{{< figure-dynamic
    light-src="images/dotnet-gitmoji-runtime-shape-light.svg"
    dark-src="images/dotnet-gitmoji-runtime-shape-dark.svg"
    alt="dotnet-gitmoji runtime shape"
    title="dotnet-gitmoji runtime shape" >}}

## Características clave

**Modo hook.** `dotnet-gitmoji init --mode shell` instala un hook `prepare-commit-msg` administrado por Husky.Net que intercepta cada `git commit`. `init --mode task-runner` apunta a repositorios que ya usan el task runner de Husky.Net, y el hook se salta merge commits, squash merges, amends e interactive rebases para no interrumpir los flujos automatizados.

**Modo cliente.** `dotnet-gitmoji commit` actúa como reemplazo directo de `git commit`, y también admite `--title`, `--scope` y `--message` cuando quieres saltarte parte del prompt. Se desactiva cuando el hook ya está instalado, para que el emoji nunca se aplique dos veces.

**Puesta en marcha del equipo.** La ruta compartida vive en `.config/dotnet-tools.json`, `.husky/` y `Directory.Build.targets`. En repositorios con archivo de proyecto, normalmente basta con `dotnet restore` o con abrir el IDE para restaurar las herramientas y volver a establecer `core.hooksPath` a través de Husky.Net.

**Fuzzy search y descubrimiento.** `dotnet-gitmoji search <keyword>` y el picker en vivo comparten el mismo fuzzy matcher, que busca por nombre, shortcode y descripción del emoji. `dotnet-gitmoji list` es la forma no interactiva de inspeccionar el catálogo completo.

**Opciones de configuración.** El asistente interactivo `config` y el `.gitmojirc.json` a nivel repositorio exponen los mismos controles: salida en emoji o shortcode, prompts opcionales de scope y mensaje, capitalización del título, sugerencias de scope personalizadas, auto-stage, commits firmados y una URL personalizada para el feed de gitmojis.

**Cadena de resolución de configuración.** La herramienta lee primero `.gitmojirc.json` desde la raíz del repo (subiendo por los directorios padre), después `~/.dotnet-gitmoji/config.json`, y al final los defaults incluidos. Los ajustes de equipo viajan con el repo, y las preferencias personales se quedan en el home.

**Comandos operativos.** `update` refresca la lista cacheada de gitmojis, y `remove` se encarga del desmontaje del hook. Para hooks administrados por Husky.Net, `remove` imprime los pasos de limpieza en lugar de editar `.husky/` silenciosamente.

**Paridad entre instalación local y global.** La herramienta detecta si fue instalada de forma global o por proyecto, y escribe la invocación correcta (`dotnet-gitmoji` o `dotnet tool run dotnet-gitmoji`) dentro del script de hook generado.

## Retos técnicos

{{< challenge >}}
{{< challenge-problem >}}
Git invoca `prepare-commit-msg` con stdin redirigido lejos de la terminal, así que los prompts interactivos de Spectre.Console se niegan a dibujarse. Sin un arreglo, el hook falla en el primer commit.
{{< /challenge-problem >}}
{{< challenge-decision >}}
En este caso opté por reabrir stdin desde el dispositivo de terminal antes de que cualquier código lea `Console.IsInputRedirected`. La herramienta hace esto dentro de `Program.Main` a través del helper `TtyConsoleInput.TryReopenStdin()`, que es un no-op inocuo cuando stdin ya es un TTY (modo cliente).

```csharp
public static async Task<int> Main(string[] args)
{
    TtyConsoleInput.TryReopenStdin();
    // DI container and CliFx application follow
}
```

{{< /challenge-decision >}}
{{< /challenge >}}

{{< challenge >}}
{{< challenge-problem >}}
Una .NET tool se puede instalar de forma global o por proyecto, y el hook generado necesita un comando distinto en cada caso. Al establecer uno, rompe el otro.
{{< /challenge-problem >}}
{{< challenge-decision >}}
Hice que `InitCommand` detecte el tipo de instalación al momento de generar el hook, y escriba en el script `dotnet-gitmoji hook` o `dotnet tool run dotnet-gitmoji hook`. La misma lógica alimenta los modos shell y task-runner de Husky.Net, así que las tres rutas de hook se mantienen consistentes.

```csharp
// GitService.cs — detects local vs. global tool manifest at hook-generation time
private async Task<bool> IsLocalToolManifestAsync()
{
    var repoRoot = await GetRepositoryRootAsync();
    var manifestPath = Path.Combine(repoRoot, ".config", "dotnet-tools.json");

    if (!File.Exists(manifestPath))
        return false;

    var json = await File.ReadAllTextAsync(manifestPath);
    var node = JsonNode.Parse(json);
    var tools = node?["tools"] as JsonObject;
    return tools?.ContainsKey("dotnet-gitmoji") ?? false;
}

private async Task<string> BuildShellHookCommandAsync()
{
    var isLocal = await IsLocalToolManifestAsync();
    var invocation = isLocal ? "dotnet tool run dotnet-gitmoji" : "dotnet-gitmoji";
    return $"{invocation} \"$1\" \"$2\"";
}
```

{{< /challenge-decision >}}
{{< /challenge >}}

{{< challenge >}}
{{< challenge-problem >}}
Ejecutar tanto el hook como `dotnet-gitmoji commit` en el mismo repositorio haría que el emoji se prefijara dos veces. Detectarlo tan tarde, en el momento del commit, es una solución frágil.
{{< /challenge-problem >}}
{{< challenge-decision >}}
Desactivé el modo cliente cada vez que se detecta el hook, al inicio de `CommitCommand`. El mensaje explica por qué y apunta a `remove` como salida. Una sola herramienta, un solo lugar que escribe el emoji.

```csharp
// CommitCommand.cs — guard at the top of ExecuteAsync
public async ValueTask ExecuteAsync(IConsole console)
{
    if (await _gitService.IsHookInstalledAsync())
    {
        await console.Error.WriteLineAsync(
            "Error: The prepare-commit-msg hook is already configured to use dotnet-gitmoji.\n" +
            "Using both hook mode and client mode would apply the emoji twice.\n\n" +
            "Either:\n" +
            "  • Use 'git commit' and let the hook handle it (hook mode)\n" +
            "  • Remove the hook from .husky/prepare-commit-msg and use 'dotnet-gitmoji commit' (client mode)");
        throw new CommandException("Cannot use client mode while hook is installed.", 1);
    }

    // ... rest of commit flow
}
```

La misma detección del tool manifest que usa la generación del hook también mantiene este guard alineado con las instalaciones locales, para que la ruta del repo y la personal se comporten igual.

{{< /challenge-decision >}}
{{< /challenge >}}

{{< challenge >}}
{{< challenge-problem >}}
La lista de gitmoji vive en `gitmoji.dev/api/gitmojis`. Pegarle a la red en cada commit sería lento y frágil, pero enviar una lista vieja castiga a los equipos que quieren los emojis más nuevos.
{{< /challenge-problem >}}
{{< challenge-decision >}}
Opté por incluir `gitmojis.default.json` como recurso para usarlo como valor predeterminado en modo offline, y expuse `dotnet-gitmoji update` para actualizar una copia en caché en `~/.dotnet-gitmoji/`. `GitmojiProvider` primero lee la caché, recurre al recurso incrustado por defecto y solo hace una petición HTTP durante `update`.
{{< /challenge-decision >}}
{{< /challenge >}}

## Lo que este proyecto demuestra

<div class="table-container">
  <table>
    <tr>
      <th>Área</th>
      <th>Evidencia</th>
    </tr>
    <tr>
      <td><strong>Empaquetado de .NET 10 tool</strong></td>
      <td><code>PackAsTool</code>, <code>ToolCommandName</code> y <code>PackageId</code> en <code>DotnetGitmoji.csproj</code>. Se publica en NuGet como <code>dotnet-gitmoji</code> y funciona como herramienta local o global.</td>
    </tr>
    <tr>
      <td><strong>Arquitectura de CLI</strong></td>
      <td>Comandos de CliFx resueltos a través de DI, con separación limpia entre <code>Commands/</code>, <code>Services/</code>, <code>Validators/</code> y <code>Models/</code>.</td>
    </tr>
    <tr>
      <td><strong>Interop con Git</strong></td>
      <td>CliWrap envuelve cada llamada a <code>git</code>, la herramienta escribe scripts de hook <code>prepare-commit-msg</code>, y se integra con los modos shell y task-runner de Husky.Net respetando instalaciones locales y globales.</td>
    </tr>
    <tr>
      <td><strong>Puesta en marcha del equipo</strong></td>
      <td>Versionar <code>.config/dotnet-tools.json</code>, <code>.husky/</code> y <code>Directory.Build.targets</code> permite que el hook se recupere durante el restore o al abrir el IDE, en vez de depender de pasos manuales en cada máquina.</td>
    </tr>
    <tr>
      <td><strong>UX de terminal</strong></td>
      <td>Prompts de selección con Spectre.Console, fuzzy search por nombre y shortcode, prompts opcionales de scope y mensaje, y flags de modo cliente para prellenar datos del commit.</td>
    </tr>
    <tr>
      <td><strong>Testabilidad</strong></td>
      <td>Servicios interface-first, tests unitarios con xUnit, NSubstitute para dobles y una <code>ToolIntegrationFixture</code> para cobertura de punta a punta.</td>
    </tr>
    <tr>
      <td><strong>Capas de configuración</strong></td>
      <td><code>.gitmojirc.json</code> del repo, config global personal bajo <code>~/.dotnet-gitmoji/</code> y defaults incluidos, resueltos en ese orden, con <code>config</code> como asistente para la ruta personal.</td>
    </tr>
  </table>
</div>

## Resultados

<div class="table-container">
  <table>
    <tr>
      <th>Resultado</th>
      <th>Evidencia</th>
    </tr>
    <tr>
      <td><strong>Publicada en NuGet</strong></td>
      <td>La herramienta se publica en NuGet como <a href="https://www.nuget.org/packages/dotnet-gitmoji">dotnet-gitmoji</a>, lo que mantiene la instalación y las actualizaciones dentro de la cadena estándar de herramientas de .NET.</td>
    </tr>
    <tr>
      <td><strong>Sin dependencia de Node.js</strong></td>
      <td>Un repositorio de .NET que quiere la convención de gitmoji ya no tiene que aprovisionar Node en cada máquina. El .NET SDK es más que suficiente.</td>
    </tr>
    <tr>
      <td><strong>Puesta en marcha amigable para equipos</strong></td>
      <td>Los repositorios pueden versionar el tool manifest, el hook de Husky.Net y el target de restore para que sus integrantes recuperen el prompt a través del restore o de la apertura del IDE, en lugar de configurarlo a mano máquina por máquina.</td>
    </tr>
    <tr>
      <td><strong>Dos caminos de adopción</strong></td>
      <td>Los equipos pueden forzar el hook <code>prepare-commit-msg</code>, mientras que una persona también puede usar <code>dotnet-gitmoji commit</code> con flags cuando un hook a nivel repositorio sería demasiado pesado.</td>
    </tr>
    <tr>
      <td><strong>La configuración viaja con el repositorio</strong></td>
      <td><code>.gitmojirc.json</code> en la raíz se comparte por Git. Las preferencias personales se quedan bajo <code>~/.dotnet-gitmoji/</code>, y el asistente interactivo usa la misma estructura de configuración.</td>
    </tr>
  </table>
</div>

El resultado es simple: un equipo de .NET puede adoptar la convención de gitmoji sin salir de NuGet y MSBuild, y la misma herramienta sigue funcionando como un CLI personal más liviano cuando un hook a nivel repositorio sería demasiado.

## Enlaces

- Repositorio: {{< extlink href="https://github.com/jebucaro/dotnet-gitmoji" >}}dotnet-gitmoji{{< /extlink >}}
- Paquete en NuGet: {{< extlink href="https://www.nuget.org/packages/dotnet-gitmoji" >}}dotnet-gitmoji{{< /extlink >}}
- Convención de gitmoji: {{< extlink href="https://gitmoji.dev" >}}gitmoji.dev{{< /extlink >}}
- Husky.Net: {{< extlink href="https://alirezanet.github.io/Husky.Net/" >}}Husky.Net{{< /extlink >}}

---

Foto por {{< extlink href="https://unsplash.com/@timwitzdam?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Tim Witzdam{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/animal-emojis-on-a-smartphone-screen-bXIdCmicMOc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
