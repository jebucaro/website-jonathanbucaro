---
title: 'Auditing Developer Machines for Supply Chain Exposure with Bumblebee'
slug: 'bumblebee'
date: 2026-05-27T19:53:56+00:00
description: 'A practical walkthrough of Bumblebee, the open-source read-only scanner from Perplexity that tells you which developer machines carry a specific package version without invoking any package manager.'
draft: false
tags: [security, supply-chain, cli]
image: 'images/cover.png'
---

## 🎯 TL;DR

Bumblebee is a single Go binary that walks on-disk package metadata and emits a structured NDJSON stream of what it finds. No package managers are invoked, no network calls are made during scans, and no credentials appear in the output. It answers one specific question: which packages and versions are installed on this developer machine right now?

**Choose your path:**

- 🚀 [Quick Start](#quick-start)
- 🏗️ [How It Works Inside](#how-it-works)
- 📦 [Scan Multiple Projects](#scan-multiple-projects)
- ⚖️ [Honest Trade-offs](#honest-trade-offs)

---

## 🤔 Why I Looked at This

Supply-chain incidents have been a recurring pattern in 2026. Two of them landed close together and kept surfacing the same question for me. In March 2026, `axios@1.14.1` and `axios@0.30.4` were published with an injected dependency that ran a platform-specific remote access trojan during installation. In May 2026, 84 malicious artifacts across 42 `@tanstack/*` packages reached npm through a GitHub Actions compromise.

Neither incident was subtle. Both were caught relatively quickly. But in the hours between "advisory published" and "all machines confirmed clean," the question that kept surfacing was the same: which developer machines have the affected version installed right now?

The usual tools answer different things. An SBOM tells you what shipped in a production artifact. An EDR tells you what ran or touched the network. Neither gives you a fast, read-only answer about the lockfiles, toolchain installs, and extension manifests scattered across developer laptops.

I have a `~/code` directory with several projects living under it: a Hugo site, a Go CLI, a couple of Python utilities. I wanted to understand what Bumblebee could tell me about that tree, and how it works internally. {{< extlink href="https://www.perplexity.ai/hub/blog/perplexity-is-open-sourcing-bumblebee" >}}Perplexity open-sourced it in May 2026{{< /extlink >}} under the Apache 2.0 license.

---

## 💡 The Problem

When an advisory names a specific package and version, the gap between "we know about it" and "we know who is affected" can be surprisingly wide.

Grepping lockfiles by hand works if you know which lockfiles exist and where they are. Asking developers to check their own machines works if you have time and a way to collect the answers. Neither approach is fast or auditable.

The information exists. It is just spread across dozens of files in slightly different formats per ecosystem: `package-lock.json` for npm, `pnpm-lock.yaml` for pnpm, `go.sum` for Go, `*.dist-info/METADATA` for Python, and so on. A scanner that already knows where these files live and how to read them is the faster path.

---

## ✨ The Solution

Bumblebee is a single static binary with no non-standard library dependencies. It runs, scans, emits output, and exits. There is no daemon and no persistent state between runs.

The core constraint is that it is read-only. It never invokes a package manager, never reads source files, and never makes network calls during a scan. It reads only the metadata files that package managers leave on disk. This matters because one class of supply-chain attacks relies on malicious post-install scripts. A scanner that never invokes a package manager cannot trigger them.

The output is NDJSON: one JSON record per line, written to stdout by default. Each record carries a `record_type` field:

- `package`: one discovered installation
- `finding`: a match against the exposure catalog
- `scan_summary`: the run terminator with aggregate counts
- `diagnostic`: written to stderr only, never to the records sink

---

<span id="quick-start"></span>

## 🚀 Quick Start

### Install

Follow the installation instructions in the {{< extlink href="https://www.perplexity.ai/hub/blog/perplexity-is-open-sourcing-bumblebee" >}}Bumblebee announcement{{< /extlink >}} to get the binary for your platform. The tool requires Go 1.25 or later if you are building from source.

{{< callout note >}}
Bumblebee runs on macOS and Linux only. Windows is not supported in v0.1.
{{< /callout >}}

{{< callout important >}}
Several commands below pipe output to `jq` for readable terminal output. Install it before running those commands: on macOS run `brew install jq`, on Linux use your package manager (`apt install jq`, `dnf install jq`, etc.).
{{< /callout >}}

### Run a baseline scan

The baseline profile covers global toolchain installs, editor extensions (VS Code, Cursor, Windsurf, VSCodium), MCP configuration files, and browser extension profiles. It does not walk project directories.

A developer machine with a full toolchain produces hundreds of records. The stream is designed to feed into a file or a downstream system, not to be read line by line in a terminal.

To capture everything for later analysis:

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
The project profile only looks in those five directory names. If your dev tree lives somewhere else (for example `~/Development`), use the deep profile with an explicit root. The output is equally verbose, so save it to a file or check just the summary:

```bash
bumblebee scan --profile deep --root ~/Development > scan-$(date +%Y%m%d).ndjson
bumblebee scan --profile deep --root ~/Development | jq 'select(.record_type == "scan_summary")'
```

{{< /callout >}}

### Check for a specific exposure

The Bumblebee repository includes a `threat_intel/` directory with pre-built catalog files for documented supply-chain incidents. If you built from source the directory is already in your repository root. If you installed a pre-built binary, download the repository separately to get the catalogs, then point `--exposure-catalog` at the absolute path.

Since `--findings-only` suppresses the full package stream, the output is limited to matches and stays readable in a terminal without redirecting to a file:

```bash
bumblebee scan --profile deep --root ~/code \
  --exposure-catalog /path/to/bumblebee-repo/threat_intel/ \
  --findings-only \
  | jq '.'
```

You can also write your own catalog JSON using the format described in the project README.

---

<span id="how-it-works"></span>

## 🏗️ How It Works Inside

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

`baseline` and `project` refuse bare home roots. If you pass `$HOME` or `/home/alice` to either of them, the CLI will reject it. Only `deep` accepts a bare home root.

### Filesystem walk

Before dispatching any file to a parser, the walker applies a default exclusion list:

- Credential directories: `.ssh`, `.aws`, `.kube`, `.gnupg`, `.docker`
- VCS internals: `.git`, `.hg`
- macOS system caches: `Library/Caches`, `Library/Mail`, `Library/Messages`
- Browser application data outside the enumerated extension profile paths

Symlink loops are detected via inode tracking rather than path comparison, so the walk terminates correctly on any directory tree. Permission errors (`EACCES`, `EPERM`) emit a debug-level diagnostic and continue. Missing optional roots emit an info-level diagnostic. You can add extra directories to skip with `--exclude`.

### Ecosystem parsers

The scanner initializes 11 ecosystem-specific parser structs at startup. As the walker visits files, it matches each filename against a dispatch table and sends matching files to the appropriate parser via a worker pool. The default concurrency is 4 workers, configurable with `--concurrency`.

Each parser opens only the specific file it receives. It never walks a directory or calls a package manager.

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

The `--ecosystem` flag restricts which parsers are active for a run, which is useful for targeted scans or performance tuning.

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

The `has_lifecycle_scripts` field (npm, pnpm, and yarn only) tells you whether the package defines install hooks. It does not mean those hooks ran during the scan; it means they would run if the package were installed through a package manager. That distinction matters when triaging exposure.

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

A `scan_summary` record is always emitted last. Its `status` field is `complete`, `partial` (if `--max-duration` was reached or the scan was interrupted), or `error`. Receivers should only promote a run to current state after `status=complete`. That matters for recurring scans where an interrupted run should not overwrite a valid previous result.

### Deduplication

Every `package` record is assigned a `record_id` that is a SHA-256 hash of a canonical identity tuple: ecosystem, normalized name, version, source file, profile, root kind, and a few other fields. If two parsers encounter the same logical package within the same run (for example, a package that appears in both `package-lock.json` and `node_modules/`), only the first is emitted. The `record_id` is stable across runs, so the same package observed identically on consecutive scans produces the same ID. Receivers can use it as a deduplication key when building current-state tables.

### Exposure catalog matching

When `--exposure-catalog` is provided, every accepted `package` record is matched against the catalog using exact `(ecosystem, normalized_name, version)` matching. No semver ranges, no fuzzy matching. A match produces one `finding` record per matching catalog entry. The Bumblebee repository ships a `threat_intel/` directory with pre-built catalogs maintained from public supply-chain reporting — point `--exposure-catalog` at that directory or at any individual JSON catalog file you write yourself.

---

<span id="scan-multiple-projects"></span>

## 📦 Scanning Multiple Projects

The deep profile accepts any directory as a root, which makes it the right choice for scanning a dev tree regardless of how it is named. Pass your development directory with `--root` and Bumblebee walks everything under it. Each `package` record carries `root_kind: "project_root"` and a `source_file` with the absolute path, so you can tell exactly which project a dependency came from.

To get a flat view of everything installed across all your projects:

```bash
bumblebee scan --profile deep --root ~/code \
  | jq -r 'select(.record_type == "package") | [.ecosystem, .package_name, .version, .source_file] | @tsv'
```

For large dev trees the output can be long. Redirect to a file to inspect it at leisure:

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

To check all projects for known-compromised versions in one pass, point the scan at the `threat_intel/` directory from the Bumblebee repository. With `--findings-only` the stream is limited to matches, so the terminal output stays manageable without redirecting to a file:

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
The deep profile walks the entire root path you provide, subject only to the default exclusion list and any `--exclude` flags you add. On a home directory, it will cover every project tree, toolchain install, and config file it can reach. This is intentional for incident response but takes longer than a project or baseline scan.
{{< /callout >}}

On macOS, the `--all-users` flag expands baseline and project scans across every `/Users/<name>` home without requiring a bare home root. That makes it practical for a single MDM-deployed invocation to cover all developer accounts on a machine.

---

<span id="honest-trade-offs"></span>

## ⚖️ Honest Trade-offs

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

---

## 🔑 Key Insights

1. The gap Bumblebee fills is specific: not "what shipped" or "what ran," but "what is installed on this developer machine right now."
2. The read-only design is a deliberate choice. Reading metadata files is slower than asking a package manager directly and deliberately avoids triggering anything the packages define.
3. Three profiles let you match breadth to cost. Baseline covers the global toolchain and AI tool configs. Project covers all projects in your standard dev directories. Deep covers everything when you need it.
4. The exposure catalog decouples threat intelligence from the scanner binary. You can update the catalog and re-run without touching the binary or waiting for a tool update.
5. MCP config coverage matters now. AI coding tools are standard on developer machines, and their configurations are a meaningful attack surface. Bumblebee inventories them the same way it inventories npm packages.

---

## Final Thoughts

What I find useful about Bumblebee is that it is narrow. It does not try to replace your EDR or your SBOM pipeline. It answers one question and it answers it from on-disk state without executing anything.

That narrowness is what makes it practical to run on a schedule or to drop into an incident response workflow. A scan finishes, emits a `scan_summary` with `status=complete`, and exits. Downstream tooling handles the rest.

If you have a development directory with several projects living under it, running `bumblebee scan --profile deep --root ~/code` and piping through `jq` is worth doing once just to see what the full picture looks like. You may find versions you did not expect still pinned in older lockfiles.

What ecosystems or config types would you want to see added to a future version? I am curious whether Cargo or Maven coverage would change how useful this is for teams that are primarily Rust or JVM shops. Let me know on {{< extlink href="https://www.linkedin.com/in/jonathanbucaro/" >}}LinkedIn{{< /extlink >}}.

---

Photo by {{< extlink href="https://unsplash.com/@kai_wenzel?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Kai Wenzel{{< /extlink >}} on {{< extlink href="https://unsplash.com/photos/yellow-and-black-wasp-RDstSU6vp6A?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
