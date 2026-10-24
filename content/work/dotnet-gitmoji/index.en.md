---
title: 'dotnet-gitmoji: Gitmoji Commits for .NET Teams'
slug: 'dotnet-gitmoji'
subtitle: 'A .NET tool that puts the gitmoji convention in every commit, with a hook that travels with the repo and reaches each teammate through a plain dotnet restore. No Node.js required.'
date: 2026-04-24T10:30:00Z
lastmod: 2026-10-24T00:00:00Z
draft: false
image: 'images/cover.png'
description: 'dotnet-gitmoji brings gitmoji commits to .NET teams: a Husky.Net hook that travels with the repo, reaches every teammate through dotnet restore, and needs no Node.js.'
work-types: ['Project']
artifact: 'cli-tool'
schemaType: SoftwareApplication
---

## Why it exists

Be honest, your team's git log probably looks something like this:

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

Nobody can tell from that list what changed, which commit fixed a bug, or which one broke the build. {{< extlink href="https://gitmoji.dev" >}}gitmoji{{< /extlink >}} is a small convention that fixes this: every commit title starts with one emoji that says what kind of change it is. 🐛 fixes a bug, ✨ adds a feature, ♻️ refactors code, 📝 updates docs. The history becomes something you can scan, and because many gitmojis also carry a semver hint (✨ is a minor, 🐛 a patch, 💥 a major), the log tells you what the next release contains.

A convention only works if people follow it, and nobody follows one from memory for long. It needs a commit hook that asks for the emoji at the moment you commit. That hook also has to live in the repo, otherwise it only exists on the machine of whoever installed it. The existing gitmoji tooling solves this for JavaScript projects, but it assumes Node.js, and a .NET team shouldn't have to provision Node on every machine just to share a commit hook.

`dotnet-gitmoji` is my answer to that. It is a .NET tool, published on {{< extlink href="https://www.nuget.org/packages/dotnet-gitmoji" >}}NuGet{{< /extlink >}}, that installs a `prepare-commit-msg` hook through {{< extlink href="https://alirezanet.github.io/Husky.Net/" >}}Husky.Net{{< /extlink >}}. The hook, the pinned tool versions, and the MSBuild target that installs them are all committed to the repo, so a teammate who clones it and runs `dotnet restore`, or simply opens the solution in Visual Studio or Rider, gets the gitmoji picker on their next commit. The whole convention stays inside the .NET SDK, NuGet, and MSBuild.

{{< github repo="jebucaro/dotnet-gitmoji" >}}

<!-- VIDEO: uncomment this section and replace VIDEO_ID once the YouTube upload exists.

## See it in action

The two-minute walkthrough below follows the setup straight from the README, then shows a teammate joining the repo.

<p><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/VIDEO_ID" title="dotnet-gitmoji: setup and daily use" style="border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></p>

-->

## Try it in five steps

Run these once in your repo. After you commit the result, every teammate gets the hook without doing anything. You need the .NET 10 SDK, plus Git for Windows on Windows, since the hook runs under Git Bash.

**1. Add both tools to the local tool manifest.**

```sh
dotnet new tool-manifest   # skip if the repo already has a dotnet-tools.json
dotnet tool install Husky
dotnet tool install dotnet-gitmoji
```

The manifest pins both tool versions for the whole team.

**2. Initialize Husky.Net.**

```sh
dotnet tool run husky install
```

This points Git's `core.hooksPath` at the `.husky/` folder.

**3. Install the gitmoji hook.**

```sh
dotnet tool run dotnet-gitmoji init --mode shell
```

It adds a `prepare-commit-msg` hook to `.husky/`, a plain text file that is safe to commit.

**4. Add the MSBuild target.** Create `Directory.Build.targets` at the repo root:

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

It runs `dotnet tool restore` and `dotnet husky install` whenever someone restores, builds, or opens the project, which is what installs the hook for every teammate. Why it hooks `BeforeTargets` instead of the more obvious `AfterTargets="Restore"` is one of the stories below.

**5. Commit everything.**

```sh
git add dotnet-tools.json .husky/ Directory.Build.targets   # or .config/dotnet-tools.json on older SDKs
git commit -m "chore: add dotnet-gitmoji hook"
```

The hook is already active, so this very commit goes through the picker.

From here on, every `git commit` opens a fuzzy picker. Type `bug` and the list narrows to 🐛, with a panel below explaining what it means and its semver impact: "Fix a bug.", a patch. Press Enter, confirm the title, and the commit lands as `🐛 Fix login redirect`. A teammate who clones the repo repeats none of these steps: one `dotnet restore` and the picker opens on their next commit. Your old history stays the way it was, and every commit from the setup onward follows the convention.

## What I learned building it

The picker is the part people see, but most of the work in a tool this small is the plumbing between Git, the terminal, and MSBuild. These four problems taught me the most.

### The hook that lost its terminal

{{< challenge >}}
{{< challenge-problem >}}
Git runs `prepare-commit-msg` with stdin redirected away from the terminal. That is reasonable for a hook that only edits a file, but this one needs to ask you a question, and Spectre.Console refuses to draw an interactive prompt when it can't read keystrokes. Without a fix, the hook fails on the very first commit.
{{< /challenge-problem >}}
{{< challenge-decision >}}
gitmoji-cli fixes this in the shell, with `exec < /dev/tty` at the top of the hook script. That doesn't work here, because Husky.Net writes the hook script, not dotnet-gitmoji, so the tool has to fix it from the inside. As the first thing `Program.Main` does, `TtyConsoleInput.TryReopenStdin()` swaps the process's own stdin handle for the terminal device, before any code reads `Console.IsInputRedirected`. On Unix it opens `/dev/tty` and duplicates it onto file descriptor 0. On Windows it opens `CONIN$` and sets it as the standard input handle. When stdin already is a terminal, as it is when you run the tool by hand, the call changes nothing.

The lesson I keep from this one: a Git hook is not your terminal session. Whatever a hook needs from the user, it has to go and get explicitly.
{{< /challenge-decision >}}
{{< /challenge >}}

### The tool manifest is the team's contract

{{< challenge >}}
{{< challenge-problem >}}
A .NET tool can be installed globally, once per machine, or locally, pinned in the repo's `dotnet-tools.json`. A global install is convenient, but it means every teammate runs whatever version they happened to install, and a hook that behaves differently from one machine to the next is worse than no hook at all.
{{< /challenge-problem >}}
{{< challenge-decision >}}
The setup is local-first on purpose. The tool manifest is committed with the repo, so it works as a contract: everyone who restores gets the same Husky.Net and the same `dotnet-gitmoji`, and bumping the version is a reviewed change like any other. Global installs still work for personal use across repos, but the docs treat them as the exception.

The hook has to call the tool correctly either way, so `init` checks at generation time which kind of install it is looking at. It walks up from the repo root looking for `.config/dotnet-tools.json` or a root-level `dotnet-tools.json` (.NET 10 creates the second, older SDKs the first) and checks whether `dotnet-gitmoji` is listed there:

```csharp
// GitService.cs
private async Task<string> BuildShellHookCommandAsync()
{
    bool isLocal = await IsLocalToolManifestAsync();
    string invocation = isLocal ? DotnetGitmojiLocalInvocation : DotnetGitmojiTaskName;
    return $"{invocation} \"$1\" \"$2\"";
}
```

A local install gets `dotnet tool run dotnet-gitmoji` in the script, a global one gets plain `dotnet-gitmoji`.
{{< /challenge-decision >}}
{{< /challenge >}}

### The restore target that never fired

{{< challenge >}}
{{< challenge-problem >}}
The whole team story depends on one moment: a teammate clones the repo, runs `dotnet restore`, and the hook gets installed. My first MSBuild target hooked `AfterTargets="Restore"`, which looks like exactly the right place, and it silently never ran. When you restore a solution, which is what a plain `dotnet restore` does at a repo root that has one, NuGet restores every project from the solution level and never runs each project's own `Restore` target. No error, no warning, just a teammate with no hook and no idea why.
{{< /challenge-problem >}}
{{< challenge-decision >}}
The target now hooks `BeforeTargets="Restore;CollectPackageReferences"`. `CollectPackageReferences` runs for every project during both restore and build, so the target fires either way. An `Inputs`/`Outputs` pair keeps it incremental: it only reruns when `dotnet-tools.json` changes or after `dotnet clean`. It is also why the setup doesn't use `husky attach` as a shortcut, since Husky.Net 0.9.1 writes an `AfterTargets="Restore"` target and hardcodes `.config/dotnet-tools.json`, which .NET 10 no longer creates.

This fix has a cost, and I'd rather name it. Because the target runs before restore, a repo with a private NuGet feed behind a credential helper can run `dotnet tool restore` before the helper has signed in, and fail the restore. Those developers set `HUSKY=0` and install the hook once by hand. Husky.Net made the opposite trade-off, which is tracked in {{< extlink href="https://github.com/alirezanet/Husky.Net/issues/176" >}}Husky.Net #176{{< /extlink >}}. For a tool whose entire promise is "clone, restore, commit", a hook that never fires on solution restore was the worse failure.
{{< /challenge-decision >}}
{{< /challenge >}}

### Config split by who owns it

{{< challenge >}}
{{< challenge-problem >}}
`.gitmojirc.json` is committed and shared by the whole team, which is right for settings like emoji versus shortcode output, title length, or scopes. A terminal color theme is different: it is a personal preference, and background and color support vary from machine to machine. Putting `theme` in the shared file means either imposing one person's colors on everyone or turning it into a source of pointless merge churn.
{{< /challenge-problem >}}
{{< challenge-decision >}}
I split configuration by ownership rather than by file format. The repo config is the single source for everything that must be identical across the team. The personal global config at `~/.dotnet-gitmoji/config.json` holds exactly one setting, `theme`, and nothing else. Theme resolution never takes the theme from the repo file: it checks the `DOTNET_GITMOJI_THEME` environment variable, then the global config, then falls back to the built-in default. A key in the wrong file is ignored with a note on stderr instead of being half applied, so a mistake is visible rather than surprising.

The general rule I took from it: before deciding where a setting lives, ask who should be able to change it.
{{< /challenge-decision >}}
{{< /challenge >}}

## Where to go next

This page covers why the tool exists and the shortest path to a first commit. The {{< extlink href="https://github.com/jebucaro/dotnet-gitmoji#readme" >}}full documentation{{< /extlink >}}<!-- SITE: switch to https://dotnet-gitmoji.com once live --> covers the rest: joining a repo that already uses it, the interactive `config` wizard and every `.gitmojirc.json` key, color themes, client mode for personal workflows, the task-runner mode, and the commands for listing, searching, and updating the gitmoji catalog.

## Links

1. Documentation: {{< extlink href="https://github.com/jebucaro/dotnet-gitmoji#readme" >}}dotnet-gitmoji README{{< /extlink >}}<!-- SITE: switch to https://dotnet-gitmoji.com once live -->
2. Repository: {{< extlink href="https://github.com/jebucaro/dotnet-gitmoji" >}}dotnet-gitmoji{{< /extlink >}}
3. NuGet package: {{< extlink href="https://www.nuget.org/packages/dotnet-gitmoji" >}}dotnet-gitmoji{{< /extlink >}}
4. gitmoji convention: {{< extlink href="https://gitmoji.dev" >}}gitmoji.dev{{< /extlink >}}
5. Husky.Net: {{< extlink href="https://alirezanet.github.io/Husky.Net/" >}}Husky.Net{{< /extlink >}}

---

Photo by {{< extlink href="https://unsplash.com/@timwitzdam?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Tim Witzdam{{< /extlink >}} on {{< extlink href="https://unsplash.com/photos/animal-emojis-on-a-smartphone-screen-bXIdCmicMOc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
