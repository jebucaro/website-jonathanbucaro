---
title: 'Auditing Developer Machines for Supply Chain Exposure with Bumblebee'
slug: 'bumblebee'
date: 2026-05-27T19:53:56+00:00
description: 'A practical walkthrough of Bumblebee, the open-source read-only scanner from Perplexity that tells you which developer machines carry a specific package version without invoking any package manager.'
draft: false
tags: [security, supply-chain, cli]
image: 'images/cover.png'
---

## Why I looked at this

Supply-chain incidents have been a recurring pattern in 2026. In March, `axios@1.14.1` and `axios@0.30.4` shipped with an injected dependency that ran a platform-specific remote access trojan during installation. In May, 84 malicious artifacts across 42 `@tanstack/*` packages reached npm through a GitHub Actions compromise. Both were caught quickly, but in the hours between "advisory published" and "all machines confirmed clean," the same question kept coming up: which developer machines have the affected version installed right now?

An SBOM tells you what shipped in a production artifact. An EDR tells you what ran or touched the network. Neither gives you a fast, read-only answer about the lockfiles, toolchain installs, and extension manifests scattered across developer laptops. Grepping by hand only works if you know where every lockfile lives, and asking developers to check their own machines only works if you have time to collect the answers.

I have a `~/code` directory with several projects under it: a Hugo site, a Go CLI, a couple of Python utilities. I wanted to see what Bumblebee could tell me about that tree and how it works internally. {{< extlink href="https://www.perplexity.ai/hub/blog/perplexity-is-open-sourcing-bumblebee" >}}Perplexity open-sourced it in May 2026{{< /extlink >}} under the Apache 2.0 license.

The information a scanner needs already exists on disk, just spread across dozens of files in a different format per ecosystem: `package-lock.json` for npm, `pnpm-lock.yaml` for pnpm, `go.sum` for Go, `*.dist-info/METADATA` for Python, and so on.

## What it is

Bumblebee is a single static Go binary with no unusual dependencies. It runs, scans, emits output, and exits, with no daemon and no state between runs.

The core constraint is that it's read-only. It never invokes a package manager, never reads source files, and never makes network calls during a scan; it only reads the metadata files package managers leave on disk. That matters because one class of supply-chain attack relies on malicious post-install scripts, and a scanner that never invokes a package manager can't trigger them.

The output is NDJSON, one JSON record per line to stdout by default. Each record carries a `record_type`:

- `package`: one discovered installation
- `finding`: a match against the exposure catalog
- `scan_summary`: the run terminator with aggregate counts
- `diagnostic`: written to stderr only, never to the records sink

## Quick start

### Install

Follow the installation instructions in the {{< extlink href="https://www.perplexity.ai/hub/blog/perplexity-is-open-sourcing-bumblebee" >}}Bumblebee announcement{{< /extlink >}} to get the binary for your platform. Building from source requires Go 1.25 or later.

{{< callout note >}}
Bumblebee runs on macOS and Linux only. Windows is not supported in v0.1.
{{< /callout >}}

{{< callout important >}}
Several commands below pipe output to `jq` for readable terminal output. Install it first: on macOS run `brew install jq`, on Linux use your package manager (`apt install jq`, `dnf install jq`, etc.).
{{< /callout >}}

### Run a baseline scan

The baseline profile covers global toolchain installs, editor extensions (VS Code, Cursor, Windsurf, VSCodium), MCP configuration files, and browser extension profiles. It does not walk project directories.

A full toolchain produces hundreds of records, so pipe the output to a file or a downstream system rather than reading it line by line:

```bash
bumblebee scan --profile baseline > baseline-$(date +%Y%m%d).ndjson
```

To just check the summary in the terminal:

```bash
bumblebee scan --profile baseline | jq 'select(.record_type == "scan_summary")'
```

### Run a project scan

The project profile walks a fixed set of development directories: `~/code`, `~/src`, `~/Developer`, `~/Projects`, and `~/workspace`. All 11 ecosystem parsers run.

```bash
bumblebee scan --profile project
```

{{< callout note >}}
The project profile only looks in those five directory names. If your dev tree lives somewhere else (for example `~/Development`), use the deep profile with an explicit root:

```bash
bumblebee scan --profile deep --root ~/Development > scan-$(date +%Y%m%d).ndjson
bumblebee scan --profile deep --root ~/Development | jq 'select(.record_type == "scan_summary")'
```

{{< /callout >}}

### Check for a specific exposure

The Bumblebee repository includes a `threat_intel/` directory with pre-built catalog files for documented supply-chain incidents. If you built from source, the directory is already in your repository root. If you installed a pre-built binary, download the repository separately to get the catalogs, then point `--exposure-catalog` at the absolute path.

`--findings-only` suppresses the full package stream, so the output stays limited to matches and readable in a terminal:

```bash
bumblebee scan --profile deep --root ~/code \
  --exposure-catalog /path/to/bumblebee-repo/threat_intel/ \
  --findings-only \
  | jq '.'
```

You can also write your own catalog JSON using the format described in the project README.

## How it works inside

### The three profiles

Profile selection is the primary way to balance scan breadth against runtime cost.

<div class="table-container">
  <table>
    <tr><th>Profile</th><th>What it walks</th><th>Typical cadence</th><th>Use for</th></tr>
    <tr><td><code>baseline</code></td><td>Global and user-level toolchain installs, editor extensions, MCP config directories, browser extension profiles. No project trees.</td><td>Every 15 min or at login</td><td>Fleet-wide toolchain and tool inventory</td></tr>
    <tr><td><code>project</code></td><td>Configured development directories: <code>~/code</code>, <code>~/src</code>, <code>~/Developer</code>, <code>~/Projects</code>, <code>~/workspace</code>. All ecosystems apply.</td><td>Daily</td><td>Per-project lockfile and dependency inventory</td></tr>
    <tr><td><code>deep</code></td><td>Any explicit <code>--root</code> path, including bare home directories. Requires at least one <code>--root</code> argument.</td><td>On demand</td><td>Incident-response sweeps against a specific advisory</td></tr>
  </table>
</div>

`baseline` and `project` refuse bare home roots: passing `$HOME` or `/home/alice` to either one gets rejected. Only `deep` accepts a bare home root.

### Filesystem walk

Before dispatching any file to a parser, the walker applies a default exclusion list:

- Credential directories: `.ssh`, `.aws`, `.kube`, `.gnupg`, `.docker`
- VCS internals: `.git`, `.hg`
- macOS system caches: `Library/Caches`, `Library/Mail`, `Library/Messages`
- Browser application data outside the enumerated extension profile paths

Symlink loops are detected via inode tracking rather than path comparison, so the walk terminates correctly on any directory tree. Permission errors (`EACCES`, `EPERM`) emit a debug-level diagnostic and continue. Missing optional roots emit an info-level diagnostic. You can add extra directories to skip with `--exclude`.

### Ecosystem parsers

The scanner initializes 11 ecosystem-specific parsers at startup. As the walker visits files, it matches each filename against a dispatch table and sends matches to the right parser through a worker pool (default concurrency 4, configurable with `--concurrency`). Each parser opens only the specific file it receives; it never walks a directory or calls a package manager.

<div class="table-container">
  <table>
    <tr><th>File</th><th>Parser</th><th>Source type</th></tr>
    <tr><td><code>package-lock.json</code>, <code>npm-shrinkwrap.json</code></td><td>npm</td><td><code>npm-lockfile</code></td></tr>
    <tr><td><code>pnpm-lock.yaml</code></td><td>pnpm</td><td><code>pnpm-lockfile</code></td></tr>
    <tr><td><code>yarn.lock</code></td><td>yarn</td><td><code>yarn-lockfile</code></td></tr>
    <tr><td><code>bun.lock</code></td><td>bun</td><td><code>bun-lockfile</code></td></tr>
    <tr><td><code>node_modules/&lt;pkg&gt;/package.json</code></td><td>npm</td><td><code>npm-node_modules</code></td></tr>
    <tr><td><code>*.dist-info/METADATA</code></td><td>pypi</td><td><code>pypi-dist-info</code></td></tr>
    <tr><td><code>go.sum</code></td><td>go</td><td><code>go-sum</code></td></tr>
    <tr><td><code>go.mod</code></td><td>go</td><td><code>go-mod</code></td></tr>
    <tr><td><code>Gemfile.lock</code></td><td>rubygems</td><td><code>gemfile-lock</code></td></tr>
    <tr><td><code>composer.lock</code></td><td>composer</td><td><code>composer-lockfile</code></td></tr>
    <tr><td><code>claude_desktop_config.json</code>, <code>mcp.json</code>, <code>.mcp.json</code>, <code>~/.gemini/settings.json</code></td><td>mcp</td><td><code>mcp-config</code></td></tr>
    <tr><td><code>package.json</code> inside <code>.vscode/extensions/…</code></td><td>editor-ext</td><td><code>editor-extension</code></td></tr>
    <tr><td><code>manifest.json</code> inside a Chromium extension profile</td><td>browser-ext</td><td><code>chromium-extension</code></td></tr>
  </table>
</div>

The `--ecosystem` flag restricts which parsers are active for a run, useful for targeted scans or performance tuning.

### Record types and what they carry

Every record carries a common header: `record_type`, `record_id`, `schema_version`, `scanner_name`, `scanner_version`, `run_id`, `scan_time`, and `endpoint` (hostname, OS, arch, username).

A `package` record represents one discovered installation:

```json
{
    "record_type": "package",
    "ecosystem": "npm",
    "package_name": "axios",
    "normalized_name": "axios",
    "version": "1.14.1",
    "source_file": "/home/alice/code/myapp/package-lock.json",
    "source_type": "npm-lockfile",
    "confidence": "high",
    "has_lifecycle_scripts": false,
    "root_kind": "project_root",
    "profile": "deep"
}
```

The `has_lifecycle_scripts` field (npm, pnpm, and yarn only) tells you whether the package defines install hooks, not whether those hooks ran during the scan. It means they would run if the package were installed through a package manager, which matters when triaging exposure.

A `finding` record is emitted when a package matches the exposure catalog. It carries all identifying fields from the package record plus `catalog_id`, `catalog_name`, `severity`, and `evidence`:

```json
{
    "record_type": "finding",
    "ecosystem": "npm",
    "package_name": "axios",
    "version": "1.14.1",
    "source_file": "/home/alice/code/myapp/package-lock.json",
    "catalog_name": "axios supply chain compromise March 2026",
    "severity": "critical",
    "evidence": "exact name+version match (version=1.14.1)"
}
```

A `scan_summary` record is always emitted last. Its `status` field is `complete`, `partial` (if `--max-duration` was reached or the scan was interrupted), or `error`. Receivers should only promote a run to current state after `status=complete`, so an interrupted run doesn't overwrite a valid previous result.

### Deduplication

Every `package` record gets a `record_id`, a SHA-256 hash of a canonical identity tuple: ecosystem, normalized name, version, source file, profile, root kind, and a few other fields. If two parsers encounter the same logical package in the same run (for example, one that appears in both `package-lock.json` and `node_modules/`), only the first is emitted. Because the `record_id` is stable across runs, the same package observed identically on consecutive scans produces the same ID, so receivers can use it as a deduplication key for current-state tables.

### Exposure catalog matching

When `--exposure-catalog` is provided, every accepted `package` record is matched against the catalog using exact `(ecosystem, normalized_name, version)` matching: no semver ranges, no fuzzy matching. A match produces one `finding` record per matching catalog entry. The Bumblebee repository ships a `threat_intel/` directory with pre-built catalogs maintained from public supply-chain reporting, so point `--exposure-catalog` at that directory or at any individual JSON catalog file you write yourself.

## Scanning multiple projects

The deep profile accepts any directory as a root, which makes it the right choice for scanning a dev tree regardless of how it's named. Pass your development directory with `--root` and Bumblebee walks everything under it. Each `package` record carries `root_kind: "project_root"` and a `source_file` with the absolute path, so you can tell exactly which project a dependency came from.

To get a flat view of everything installed across all your projects:

```bash
bumblebee scan --profile deep --root ~/code \
  | jq -r 'select(.record_type == "package") | [.ecosystem, .package_name, .version, .source_file] | @tsv'
```

For large dev trees the output can be long, so redirect it to a file to inspect at leisure:

```bash
bumblebee scan --profile deep --root ~/code \
  | jq -r 'select(.record_type == "package") | [.ecosystem, .package_name, .version, .source_file] | @tsv' \
  > packages-$(date +%Y%m%d).tsv
```

To narrow to a specific ecosystem:

```bash
bumblebee scan --profile deep --root ~/code --ecosystem npm \
  | jq -r 'select(.record_type == "package") | [.package_name, .version, .source_file] | @tsv'
```

To check all projects for known-compromised versions in one pass, point the scan at the `threat_intel/` directory from the Bumblebee repository. With `--findings-only` the stream stays limited to matches:

```bash
bumblebee scan --profile deep --root ~/code \
  --exposure-catalog /path/to/bumblebee-repo/threat_intel/ \
  --findings-only \
  | jq '.'
```

If the summary shows `findings_emitted: 0`, none of the projects under your dev directory match the catalog. If findings appear, each one gives you the exact file, ecosystem, version, and severity.

### Incident response with the deep profile

If you need to sweep a home directory directly, use the deep profile. It accepts bare home roots and any explicit `--root` path:

```bash
bumblebee scan --profile deep \
  --root /home/alice \
  --exposure-catalog axios-advisory.json \
  --findings-only
```

{{< callout warning >}}
The deep profile walks the entire root path you provide, subject only to the default exclusion list and any `--exclude` flags you add. On a home directory it covers every project tree, toolchain install, and config file it can reach. That's intentional for incident response, but it takes longer than a project or baseline scan.
{{< /callout >}}

On macOS, the `--all-users` flag expands baseline and project scans across every `/Users/<name>` home without requiring a bare home root, so a single MDM-deployed invocation can cover every developer account on a machine.

## Honest trade-offs

<div class="table-container">
  <table>
    <tr><th>What you gain</th><th>What you lose</th></tr>
    <tr><td>Read-only scan: no risk of triggering post-install scripts during analysis</td><td>Exact-version matching only: no semver ranges, no wildcard expressions</td></tr>
    <tr><td>Works entirely from on-disk state: no registry access, no network calls</td><td>macOS and Linux only in v0.1: no Windows support</td></tr>
    <tr><td>Covers MCP and AI tool configs that no other scanner currently inventories</td><td>Scheduling is the operator's responsibility: cron, launchd, or MDM (Bumblebee does not manage cadence itself)</td></tr>
    <tr><td>Stable <code>record_id</code> across runs makes deduplication trivial for downstream receivers</td><td>The exposure catalog must be maintained: the scanner is only as useful as the catalog entries it ships with or that you keep current</td></tr>
    <tr><td>NDJSON pipes cleanly to jq, databases, or any HTTP endpoint</td><td><code>confidence: medium</code> or <code>confidence: low</code> records exist for partial metadata: version attribution is less certain in those cases</td></tr>
  </table>
</div>

## Final thoughts

What I like about Bumblebee is that it stays narrow. It doesn't try to replace your EDR or your SBOM pipeline, it answers one question from on-disk state without executing anything.

That narrowness is what makes it practical to run on a schedule or drop into an incident response workflow: a scan finishes, emits a `scan_summary` with `status=complete`, and exits, and downstream tooling handles the rest.

If you have a development directory with several projects under it, running `bumblebee scan --profile deep --root ~/code` and piping through `jq` is worth doing once just to see the full picture. You may find versions you didn't expect still pinned in older lockfiles.

What ecosystems or config types would you want to see added to a future version? I'm curious whether Cargo or Maven coverage would change how useful this is for teams that are primarily Rust or JVM shops. Let me know on {{< extlink href="https://www.linkedin.com/in/jonathanbucaro/" >}}LinkedIn{{< /extlink >}}.

---

Photo by {{< extlink href="https://unsplash.com/@kai_wenzel?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Kai Wenzel{{< /extlink >}} on {{< extlink href="https://unsplash.com/photos/yellow-and-black-wasp-RDstSU6vp6A?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
