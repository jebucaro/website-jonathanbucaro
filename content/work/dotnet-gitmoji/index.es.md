---
title: 'dotnet-gitmoji: commits con gitmoji para equipos .NET'
slug: 'dotnet-gitmoji'
subtitle: 'Una herramienta .NET que pone la convención gitmoji en cada commit, con un hook que viaja con el repositorio y llega a cada persona del equipo con un simple dotnet restore. Sin Node.js.'
date: 2026-04-24T10:30:00Z
lastmod: 2026-10-31T00:00:00Z
draft: false
image: 'images/cover.png'
description: 'dotnet-gitmoji lleva los commits con gitmoji a equipos .NET: un hook de Husky.Net que viaja con el repositorio, llega a todo el equipo con dotnet restore y no necesita Node.js.'
work-types: ['Project']
artifact: 'cli-tool'
schemaType: SoftwareApplication
---

## Por qué existe

Cuando un equipo avanza rápido, los títulos de commit tienden a verse más o menos así:

```text
9e79328 fix for real this time
3fba982 final fix
b9d9153 wip 2
d2c6acd Update appsettings.json
f6c8590 fix build
7afe3cf changes
3d45706 asdf
ee9a912 fix
0bcc0d1 wip
66ae352 Update Program.cs
```

Cada uno tenía sentido para quien lo escribió, pero leídos después como lista, cuesta saber qué cambió, qué commit arregló un bug o cuál rompió el build. {{< extlink href="https://gitmoji.dev" >}}gitmoji{{< /extlink >}} es una convención pequeña que ayuda con esto: el título de cada commit empieza con un emoji que dice qué tipo de cambio es.

- 🐛 corrige un bug
- ✨ agrega una funcionalidad
- ♻️ refactoriza código
- 📝 actualiza documentación

El historial se vuelve algo que puedes recorrer de un vistazo, y como muchos gitmojis también indican su impacto en semver (✨ es un minor, 🐛 un patch, 💥 un major), el log te dice qué trae el siguiente release.

> Una convención solo funciona si la gente la sigue, y nadie sigue una de memoria por mucho tiempo.

Por eso necesita un hook de commit que pida el emoji justo en el momento de hacer commit. Ese hook además tiene que vivir en el repositorio, si no, solo existe en la máquina de quien lo instaló. Las herramientas de gitmoji que ya existen resuelven esto para proyectos JavaScript, pero asumen Node.js, y un equipo .NET no debería tener que instalar Node en cada máquina solo para compartir un hook de commit.

{{< callout note >}}
`dotnet-gitmoji` es mi respuesta a eso. Es una herramienta .NET, publicada en {{< extlink href="https://www.nuget.org/packages/dotnet-gitmoji" >}}NuGet{{< /extlink >}}, que instala un hook `prepare-commit-msg` a través de {{< extlink href="https://alirezanet.github.io/Husky.Net/" >}}Husky.Net{{< /extlink >}}. El hook, las versiones fijadas de las herramientas y el target de MSBuild que las instala quedan versionados en el repositorio, así que alguien del equipo que lo clona y ejecuta `dotnet restore`, o simplemente abre la solución en Visual Studio o Rider, obtiene el picker de gitmoji en su siguiente commit. Toda la convención se queda dentro del SDK de .NET, NuGet y MSBuild.
{{< /callout >}}

{{< github repo="jebucaro/dotnet-gitmoji" >}}

## Míralo en acción

El recorrido de dos minutos sigue la configuración tal como está en el README y luego muestra a alguien del equipo uniéndose al repositorio.

<p><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/fve0Xpdbdjk?rel=0" title="dotnet-gitmoji: configuración y uso diario" style="border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></p>

## Pruébalo en cinco pasos

Ejecuta estos pasos una sola vez en tu repositorio. Después de hacer commit del resultado, todo el equipo obtiene el hook sin hacer nada. Necesitas el SDK de .NET 10 y, en Windows, Git for Windows, porque el hook corre bajo Git Bash.

**1. Agrega ambas herramientas al tool manifest local.**

```sh
dotnet new tool-manifest   # skip if the repo already has a dotnet-tools.json
dotnet tool install Husky
dotnet tool install dotnet-gitmoji
```

El manifest fija las versiones de ambas herramientas para todo el equipo.

**2. Inicializa Husky.Net.**

```sh
dotnet tool run husky install
```

Esto apunta el `core.hooksPath` de Git a la carpeta `.husky/`.

**3. Instala el hook de gitmoji.**

```sh
dotnet tool run dotnet-gitmoji init --mode shell
```

Agrega un hook `prepare-commit-msg` a `.husky/`, un archivo de texto plano que puedes versionar sin problema.

**4. Agrega el target de MSBuild.** Crea un archivo llamado `Directory.Build.targets` en la raíz del repositorio, junto a `.husky/` y `dotnet-tools.json`, aunque tu solución esté en una subcarpeta. Si el repositorio ya tiene uno, agrega el `PropertyGroup` y el `Target` de abajo dentro de su `<Project>` existente.

```xml
<Project>
  <PropertyGroup>
    <HuskyRoot Condition="'$(HuskyRoot)' == ''">$(MSBuildThisFileDirectory)</HuskyRoot>
    <HuskyToolManifest Condition="'$(HuskyToolManifest)' == '' and Exists('$(HuskyRoot)dotnet-tools.json')">$(HuskyRoot)dotnet-tools.json</HuskyToolManifest>
    <HuskyToolManifest Condition="'$(HuskyToolManifest)' == ''">$(HuskyRoot).config/dotnet-tools.json</HuskyToolManifest>
  </PropertyGroup>
  <Target Name="Husky" BeforeTargets="Restore;CollectPackageReferences" Condition="'$(HUSKY)' != 0"
          Inputs="$(HuskyToolManifest)"
          Outputs="$(HuskyRoot).husky/_/install.stamp">
    <Exec Command="dotnet tool restore"
          StandardOutputImportance="Low" StandardErrorImportance="High" />
    <Exec Command="dotnet husky install"
          StandardOutputImportance="Low" StandardErrorImportance="High"
          WorkingDirectory="$(HuskyRoot)" />
    <Touch Files="$(HuskyRoot).husky/_/install.stamp" AlwaysCreate="true"
           Condition="Exists('$(HuskyRoot).husky/_')" />
    <ItemGroup>
      <FileWrites Include="$(HuskyRoot).husky/_/install.stamp" />
    </ItemGroup>
  </Target>
</Project>
```

MSBuild encuentra `Directory.Build.targets` subiendo desde la carpeta de cada proyecto, así que un solo archivo en la raíz cubre todos los proyectos del repositorio (a menos que una subcarpeta tenga el suyo, que entonces debe importar el de la raíz). El target además usa su propia carpeta, `$(MSBuildThisFileDirectory)`, para ubicar `.husky/` y el tool manifest, y por eso tiene que estar junto a ellos.

Ejecuta `dotnet tool restore` y `dotnet husky install` cada vez que alguien hace restore, build o abre el proyecto, y eso es lo que instala el hook para todo el equipo. Por qué se engancha con `BeforeTargets` en lugar del más obvio `AfterTargets="Restore"` es una de las historias de más abajo.

**5. Haz commit de todo.**

```sh
git add dotnet-tools.json .husky/ Directory.Build.targets
git commit -m "chore: add dotnet-gitmoji hook"
```

El hook ya está activo, así que este mismo commit pasa por el picker.

A partir de aquí, cada `git commit` abre un picker con fuzzy search. Escribe `bug` y la lista se reduce a 🐛, con un panel debajo que explica qué significa y su impacto en semver: "Fix a bug.", un patch. Presiona Enter, confirma el título y el commit queda como `🐛 Fix login redirect`. Tu historial anterior se queda como estaba, y cada commit desde la configuración en adelante sigue la convención.

{{< callout tip >}}
Quien clone el repositorio no repite ninguno de estos pasos: un `dotnet restore` y el picker se abre en su siguiente commit.
{{< /callout >}}

## Lo que aprendí construyéndola

El picker es la parte que la gente ve, pero la mayor parte del trabajo en una herramienta tan pequeña es la plomería entre Git, la terminal y MSBuild. Estos cuatro problemas fueron los que más me enseñaron.

### El hook que perdió su terminal

{{< challenge >}}
{{< challenge-problem >}}
Git ejecuta `prepare-commit-msg` con stdin redirigido lejos de la terminal. Eso tiene sentido para un hook que solo edita un archivo, pero este necesita hacerte una pregunta, y Spectre.Console se niega a dibujar un prompt interactivo cuando no puede leer las teclas. Sin un arreglo, el hook falla en el primer commit.
{{< /challenge-problem >}}
{{< challenge-decision >}}
gitmoji-cli lo resuelve en el shell, con `exec < /dev/tty` al inicio del script del hook. Eso no funciona aquí, porque el script del hook lo escribe Husky.Net, no dotnet-gitmoji, así que la herramienta tiene que resolverlo desde adentro. Como primera acción de `Program.Main`, `TtyConsoleInput.TryReopenStdin()` reemplaza el handle de stdin del propio proceso por el dispositivo de la terminal, antes de que cualquier código lea `Console.IsInputRedirected`. En Unix abre `/dev/tty` y lo duplica sobre el descriptor de archivo 0. En Windows abre `CONIN$` y lo establece como handle de entrada estándar. Cuando stdin ya es una terminal, como pasa cuando ejecutas la herramienta a mano, la llamada no cambia nada.

La lección que me llevo de este: un hook de Git no es tu sesión de terminal. Lo que un hook necesite del usuario, tiene que ir a buscarlo de forma explícita.
{{< /challenge-decision >}}
{{< /challenge >}}

### El tool manifest es el contrato del equipo

{{< challenge >}}
{{< challenge-problem >}}
Una .NET tool se puede instalar de forma global, una vez por máquina, o local, fijada en el `dotnet-tools.json` del repositorio. La instalación global es cómoda, pero significa que cada persona del equipo ejecuta la versión que le tocó instalar, y un hook que se comporta distinto de una máquina a otra es peor que no tener hook.
{{< /challenge-problem >}}
{{< challenge-decision >}}
La configuración es local primero, a propósito. El tool manifest se versiona con el repositorio, así que funciona como un contrato: todos los que hacen restore obtienen el mismo Husky.Net y el mismo `dotnet-gitmoji`, y subir de versión es un cambio revisado como cualquier otro. La instalación global sigue funcionando para uso personal entre repositorios, pero la documentación la trata como la excepción.

El hook tiene que llamar a la herramienta correctamente en cualquier caso, así que `init` revisa al generar el script qué tipo de instalación tiene enfrente. Sube desde la raíz del repositorio buscando `.config/dotnet-tools.json` o un `dotnet-tools.json` en la raíz (.NET 10 crea el segundo, los SDKs anteriores el primero) y revisa si `dotnet-gitmoji` aparece ahí:

```csharp
// GitService.cs
private async Task<string> BuildShellHookCommandAsync()
{
    bool isLocal = await IsLocalToolManifestAsync();
    string invocation = isLocal ? DotnetGitmojiLocalInvocation : DotnetGitmojiTaskName;
    return $"{invocation} \"$1\" \"$2\"";
}
```

Una instalación local recibe `dotnet tool run dotnet-gitmoji` en el script, una global recibe simplemente `dotnet-gitmoji`.
{{< /challenge-decision >}}
{{< /challenge >}}

### El target de restore que nunca se ejecutó

{{< challenge >}}
{{< challenge-problem >}}
Toda la historia de equipo depende de un momento: alguien clona el repositorio, ejecuta `dotnet restore` y el hook queda instalado. Mi primer target de MSBuild se enganchaba con `AfterTargets="Restore"`, que parece justo el lugar correcto, y en silencio nunca se ejecutaba. Cuando haces restore de una solución, que es lo que hace un `dotnet restore` normal en la raíz de un repositorio que tiene una, NuGet restaura todos los proyectos desde el nivel de la solución y nunca ejecuta el target `Restore` de cada proyecto. Sin error, sin advertencia, solo una persona del equipo sin hook y sin idea de por qué.
{{< /challenge-problem >}}
{{< challenge-decision >}}
Ahora el target se engancha con `BeforeTargets="Restore;CollectPackageReferences"`. `CollectPackageReferences` se ejecuta para cada proyecto tanto en restore como en build, así que el target corre en ambos casos. Un par `Inputs`/`Outputs` lo mantiene incremental: solo vuelve a correr cuando cambia `dotnet-tools.json` o después de un `dotnet clean`. También es la razón por la que la configuración no usa `husky attach` como atajo, porque Husky.Net 0.9.1 escribe un target `AfterTargets="Restore"` y deja fijo `.config/dotnet-tools.json`, que .NET 10 ya no crea.

Este arreglo tiene un costo, y prefiero nombrarlo. Como el target corre antes del restore, un repositorio con un feed privado de NuGet detrás de un credential helper puede ejecutar `dotnet tool restore` antes de que el helper inicie sesión, y hacer fallar el restore. Esas personas definen `HUSKY=0` e instalan el hook una vez a mano. Husky.Net tomó la decisión opuesta, que se sigue en {{< extlink href="https://github.com/alirezanet/Husky.Net/issues/176" >}}Husky.Net #176{{< /extlink >}}. Para una herramienta cuya promesa completa es "clona, haz restore, haz commit", un hook que nunca se ejecuta en el restore de una solución era la peor falla.
{{< /challenge-decision >}}
{{< /challenge >}}

### Configuración dividida según a quién pertenece

{{< challenge >}}
{{< challenge-problem >}}
`.gitmojirc.json` se versiona y lo comparte todo el equipo, lo cual es correcto para ajustes como la salida en emoji o shortcode, la longitud del título o los scopes. Un tema de color de terminal es distinto: es una preferencia personal, y el fondo y el soporte de color varían de máquina a máquina. Poner `theme` en el archivo compartido significa imponerle a todos los colores de una sola persona, o convertirlo en una fuente de conflictos de merge sin sentido.
{{< /challenge-problem >}}
{{< challenge-decision >}}
Dividí la configuración según a quién pertenece en lugar de por formato de archivo. La configuración del repositorio es la única fuente para todo lo que debe ser idéntico en el equipo. La configuración global personal en `~/.dotnet-gitmoji/config.json` guarda exactamente un ajuste, `theme`, y nada más. La resolución del tema nunca toma el tema del archivo del repositorio: revisa la variable de entorno `DOTNET_GITMOJI_THEME`, después la configuración global, y por último usa el valor por defecto incluido. Una clave en el archivo equivocado se ignora con una nota en stderr en lugar de aplicarse a medias, así un error queda a la vista en vez de sorprender.

La regla general que me llevé: antes de decidir dónde vive un ajuste, pregúntate quién debería poder cambiarlo.
{{< /challenge-decision >}}
{{< /challenge >}}

## A dónde ir después

Esta página cubre por qué existe la herramienta y el camino más corto a un primer commit. {{< extlink href="https://dotnet-gitmoji.com" >}}dotnet-gitmoji.com{{< /extlink >}} es la casa de la herramienta, con la configuración inicial, cómo unirse a un repositorio que ya la usa, el uso diario y el asistente `config` con sus opciones principales. Para cada clave de `.gitmojirc.json`, los temas de color, el modo cliente para flujos personales, el modo task-runner y la lista completa de comandos, ve al {{< extlink href="https://github.com/jebucaro/dotnet-gitmoji#readme" >}}README{{< /extlink >}}.

## Enlaces

1. Sitio web: {{< extlink href="https://dotnet-gitmoji.com" >}}dotnet-gitmoji.com{{< /extlink >}}
2. Referencia completa: {{< extlink href="https://github.com/jebucaro/dotnet-gitmoji#readme" >}}README de dotnet-gitmoji{{< /extlink >}}
3. Repositorio: {{< extlink href="https://github.com/jebucaro/dotnet-gitmoji" >}}dotnet-gitmoji{{< /extlink >}}
4. Paquete NuGet: {{< extlink href="https://www.nuget.org/packages/dotnet-gitmoji" >}}dotnet-gitmoji{{< /extlink >}}
5. Convención gitmoji: {{< extlink href="https://gitmoji.dev" >}}gitmoji.dev{{< /extlink >}}
6. Husky.Net: {{< extlink href="https://alirezanet.github.io/Husky.Net/" >}}Husky.Net{{< /extlink >}}

---

Foto por {{< extlink href="https://unsplash.com/@timwitzdam?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Tim Witzdam{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/animal-emojis-on-a-smartphone-screen-bXIdCmicMOc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
