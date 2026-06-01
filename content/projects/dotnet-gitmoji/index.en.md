---
title: 'dotnet-gitmoji: A Gitmoji CLI for the dotnet World'
subtitle: 'A .NET tool that brings the gitmoji commit convention to Git, with a Husky.Net-managed prepare-commit-msg hook for teams and an interactive client mode for personal workflows.'
date: 2026-04-24T10:30:00Z
draft: false
image: 'images/cover.webp'
description: 'A .NET tool that brings the gitmoji commit convention to Git, with a Husky.Net-managed prepare-commit-msg hook for teams and an interactive client mode for personal workflows.'
categories: ['CLI Tool']
---

## Project Description

`dotnet-gitmoji` is a small .NET 10 tool that brings the [gitmoji](https://gitmoji.dev) commit convention into a .NET workflow. You can install it globally for personal use or pin it in a repo's local tool manifest for team use. From there you get two adoption paths: a `prepare-commit-msg` Git hook managed through Husky.Net, or `dotnet-gitmoji commit` as an interactive replacement for the native Git command. Either way, the tool prompts you for a gitmoji, lets you fuzzy-search the full list, and formats the final commit message.

The shape I care about most is the team workflow. When a repo commits `.config/dotnet-tools.json`, `.husky/`, and `Directory.Build.targets`, a teammate can clone it, run `dotnet restore` or open the solution in Visual Studio or Rider, and get the same gitmoji prompt on the next commit. That keeps the whole convention inside NuGet, MSBuild, and the .NET SDK instead of requiring Node.js just to share a commit hook.

{{< github repo="jebucaro/dotnet-gitmoji" >}}

## Technologies Used

<div class="table-container">
  <table>
    <tr>
      <th>Layer</th>
      <th>Choice</th>
      <th>Why it is in the stack</th>
    </tr>
    <tr>
      <td><strong>Runtime</strong></td>
      <td>.NET 10</td>
      <td>Modern target with first-class global tool support and a stable <code>System.Text.Json</code> baseline.</td>
    </tr>
    <tr>
      <td><strong>Packaging</strong></td>
      <td>.NET tool</td>
      <td>Ships through NuGet as <code>dotnet-gitmoji</code>, and works as either a shared local tool or a personal global install.</td>
    </tr>
    <tr>
      <td><strong>CLI framework</strong></td>
      <td>CliFx</td>
      <td>Declarative command and option attributes, plays well with DI without extra ceremony.</td>
    </tr>
    <tr>
      <td><strong>Terminal UX</strong></td>
      <td>Spectre.Console</td>
      <td>Handles selection prompts, live fuzzy pickers, and colored output.</td>
    </tr>
    <tr>
      <td><strong>Process invocation</strong></td>
      <td>CliWrap</td>
      <td>Wraps every <code>git</code> and <code>dotnet</code> subprocess call with a typed, test-friendly API.</td>
    </tr>
    <tr>
      <td><strong>Composition</strong></td>
      <td>Microsoft.Extensions.DependencyInjection</td>
      <td>Keeps services, validators, and commands wired through a single container.</td>
    </tr>
    <tr>
      <td><strong>HTTP</strong></td>
      <td>Microsoft.Extensions.Http</td>
      <td>Fetches the gitmoji list from <code>gitmoji.dev</code> with a typed <code>HttpClient</code>.</td>
    </tr>
    <tr>
      <td><strong>Testing</strong></td>
      <td>xUnit, NSubstitute, coverlet</td>
      <td>Unit tests for services and validators, plus an integration fixture for the end-to-end tool.</td>
    </tr>
  </table>
</div>

## Architecture

The tool follows a standard CliFx layout. `Program.cs` wires the DI container, CliFx resolves the requested command from the service provider, and the command delegates the real work to a service. Services are interface-first, which is what makes the xUnit and NSubstitute tests cheap to write. The same commit path is reached from both entry points: Git's `prepare-commit-msg` hook and the interactive `commit` command.

{{< figure-dynamic
    light-src="images/dotnet-gitmiji-architecture-light.svg"
    dark-src="images/dotnet-gitmiji-architecture-dark.svg"
    alt="dotnet-gitmoji architecture"
    title="dotnet-gitmoji architecture" >}}

The architecture diagram shows what each layer owns. The sequence diagram below shows what actually runs when you commit. Both entry points converge on `PromptService`, which drives the fuzzy selector and then hands off to `CommitMessageService` to write the result. The only difference is who calls `git commit` at the end: in hook mode Git already has control, so the tool just rewrites the message file; in client mode `GitService` shells out to Git directly.

{{< figure-dynamic
    light-src="images/dotnet-gitmoji-runtime-shape-light.svg"
    dark-src="images/dotnet-gitmoji-runtime-shape-dark.svg"
    alt="dotnet-gitmoji runtime shape"
    title="dotnet-gitmoji runtime shape" >}}

## Key Features

**Hook mode.** `dotnet-gitmoji init --mode shell` installs a Husky.Net-managed `prepare-commit-msg` hook that intercepts every `git commit`. `init --mode task-runner` targets repos that already use Husky.Net's task runner, and the hook skips merge commits, squash merges, amends, and interactive rebases so automated flows are not interrupted.

**Client mode.** `dotnet-gitmoji commit` acts as a drop-in for `git commit`, and also supports `--title`, `--scope`, and `--message` for cases where you want to skip part of the prompt. It is disabled when the hook is already installed, so the emoji never gets applied twice.

**Team onboarding.** The shared path lives in `.config/dotnet-tools.json`, `.husky/`, and `Directory.Build.targets`. In repos with a project file, teammates usually only need `dotnet restore` or an IDE open to restore the tools and re-establish `core.hooksPath` through Husky.Net.

**Fuzzy search and discovery.** `dotnet-gitmoji search <keyword>` and the live picker share the same fuzzy matcher, which searches by emoji name, shortcode, and description. `dotnet-gitmoji list` is the non-interactive way to inspect the full catalog.

**Config surface.** The interactive `config` wizard and repo-level `.gitmojirc.json` expose the same knobs: emoji versus shortcode output, optional scope and message prompts, title capitalization, custom scope suggestions, auto-stage, signed commits, and a custom gitmoji feed URL.

**Config resolution chain.** The tool reads `.gitmojirc.json` from the repo root first (walking up parent directories), then `~/.dotnet-gitmoji/config.json`, then built-in defaults. Team settings live with the repo, personal overrides stay in the home directory.

**Operational commands.** `update` refreshes the cached gitmoji list, and `remove` handles hook teardown. For Husky.Net-managed hooks, `remove` prints the cleanup steps instead of silently editing `.husky/` behind your back.

**Local and global install parity.** The tool detects whether it was installed globally or per-project, and writes the correct invocation (`dotnet-gitmoji` or `dotnet tool run dotnet-gitmoji`) into the generated hook script.

## Technical challenges

{{< challenge >}}
{{< challenge-problem >}}
Git invokes `prepare-commit-msg` with stdin redirected away from the terminal, so Spectre.Console's interactive prompts refuse to draw. Without a fix, the hook fails on the very first commit.
{{< /challenge-problem >}}
{{< challenge-decision >}}
I reopen stdin from the terminal device before any code reads `Console.IsInputRedirected`. The tool does this in `Program.Main` through a `TtyConsoleInput.TryReopenStdin()` helper, which is a harmless no-op when stdin is already a TTY (client mode).

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
A .NET tool can be installed globally or per-project, and the generated hook needs a different command in each case. Hard-coding one breaks the other.
{{< /challenge-problem >}}
{{< challenge-decision >}}
I made `InitCommand` detect the installation kind at hook-generation time and write either `dotnet-gitmoji hook` or `dotnet tool run dotnet-gitmoji hook` into the script. The same logic feeds the Husky.Net shell and task-runner modes, so the three hook paths stay consistent.

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
Running both the hook and `dotnet-gitmoji commit` in the same repo would prefix the emoji twice. Detecting this late, at commit time, is fragile.
{{< /challenge-problem >}}
{{< challenge-decision >}}
I disabled client mode whenever the hook is detected, at the very start of `CommitCommand`. The message explains why and points to `remove` as the opt-out. One tool, one place that writes the emoji.

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

The same tool-manifest detection that powers hook generation also keeps this guard aligned with local installs, so the repo and personal paths stay consistent.

{{< /challenge-decision >}}
{{< /challenge >}}

{{< challenge >}}
{{< challenge-problem >}}
The gitmoji list lives at `gitmoji.dev/api/gitmojis`. Hitting the network on every commit would be slow and fragile, but shipping a stale list penalises teams that want the newest emojis.
{{< /challenge-problem >}}
{{< challenge-decision >}}
I embedded `gitmojis.default.json` as a resource for the offline default, and exposed `dotnet-gitmoji update` to refresh a cached copy under `~/.dotnet-gitmoji/`. `GitmojiProvider` reads cache first, falls back to the embedded default, and only hits HTTP on `update`.
{{< /challenge-decision >}}
{{< /challenge >}}

## What this project demonstrates

<div class="table-container">
  <table>
    <tr>
      <th>Area</th>
      <th>Evidence</th>
    </tr>
    <tr>
      <td><strong>.NET 10 tool packaging</strong></td>
      <td><code>PackAsTool</code>, <code>ToolCommandName</code>, and <code>PackageId</code> in <code>DotnetGitmoji.csproj</code>. Ships to NuGet as <code>dotnet-gitmoji</code> and works as either a local or global tool.</td>
    </tr>
    <tr>
      <td><strong>CLI architecture</strong></td>
      <td>CliFx commands resolved through DI, clean separation between <code>Commands/</code>, <code>Services/</code>, <code>Validators/</code>, and <code>Models/</code>.</td>
    </tr>
    <tr>
      <td><strong>Git interop</strong></td>
      <td>CliWrap wraps every <code>git</code> call, the tool writes <code>prepare-commit-msg</code> hook scripts, and it integrates with Husky.Net's shell and task-runner modes while honoring local versus global installs.</td>
    </tr>
    <tr>
      <td><strong>Team onboarding automation</strong></td>
      <td>Committed <code>.config/dotnet-tools.json</code>, <code>.husky/</code>, and <code>Directory.Build.targets</code> let the hook bootstrap during restore or IDE startup instead of through manual shell setup on every machine.</td>
    </tr>
    <tr>
      <td><strong>Terminal UX</strong></td>
      <td>Spectre.Console selection prompts, fuzzy search by name and shortcode, optional scope and message prompts, and client-mode flags for pre-filling commit data.</td>
    </tr>
    <tr>
      <td><strong>Testability</strong></td>
      <td>Interface-first services, xUnit unit tests, NSubstitute for doubles, and a <code>ToolIntegrationFixture</code> for end-to-end coverage.</td>
    </tr>
    <tr>
      <td><strong>Config layering</strong></td>
      <td>Repo <code>.gitmojirc.json</code>, personal global config under <code>~/.dotnet-gitmoji/</code>, and built-in defaults, resolved in that order, with a <code>config</code> wizard for the personal path.</td>
    </tr>
  </table>
</div>

## Results

<div class="table-container">
  <table>
    <tr>
      <th>Outcome</th>
      <th>Evidence</th>
    </tr>
    <tr>
      <td><strong>Published on NuGet</strong></td>
      <td>The tool is published on NuGet as <a href="https://www.nuget.org/packages/dotnet-gitmoji">dotnet-gitmoji</a>, which keeps installation and updates inside the standard .NET toolchain.</td>
    </tr>
    <tr>
      <td><strong>Removes the Node.js dependency</strong></td>
      <td>A .NET repo that wants the gitmoji convention no longer has to provision Node on every machine. The .NET SDK is enough.</td>
    </tr>
    <tr>
      <td><strong>Team-friendly onboarding</strong></td>
      <td>Repos can commit the tool manifest, Husky.Net hook, and restore target so teammates get the prompt back through restore or IDE startup instead of manual machine-by-machine setup.</td>
    </tr>
    <tr>
      <td><strong>Two adoption paths</strong></td>
      <td>Teams can enforce the <code>prepare-commit-msg</code> hook, while individuals can still use <code>dotnet-gitmoji commit</code> with flags when a repo-wide hook would be too heavy.</td>
    </tr>
    <tr>
      <td><strong>Config travels with the repo</strong></td>
      <td><code>.gitmojirc.json</code> at the repo root is shared through Git. Personal preferences stay under <code>~/.dotnet-gitmoji/</code>, and the interactive wizard fills the same config shape.</td>
    </tr>
  </table>
</div>

The product read is simple: a .NET team can adopt the gitmoji convention without leaving the NuGet and MSBuild toolchain, and the same tool still works as a lighter personal CLI when a repo-wide hook would be too heavy.

## Links

1. Repository: {{< extlink href="https://github.com/jebucaro/dotnet-gitmoji" >}}dotnet-gitmoji{{< /extlink >}}
2. NuGet package: {{< extlink href="https://www.nuget.org/packages/dotnet-gitmoji" >}}dotnet-gitmoji{{< /extlink >}}
3. gitmoji convention: {{< extlink href="https://gitmoji.dev" >}}gitmoji.dev{{< /extlink >}}
4. Husky.Net: {{< extlink href="https://alirezanet.github.io/Husky.Net/" >}}Husky.Net{{< /extlink >}}
