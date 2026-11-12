---
title: 'Auditing Developer Machines for Supply Chain Exposure with Bumblebee'
slug: 'bumblebee'
date: 2026-05-27T19:53:56+00:00
description: 'A practical walkthrough of Bumblebee, the open-source read-only scanner from Perplexity that tells you which developer machines carry a specific package version without invoking any package manager.'
draft: false
tags: [security, supply-chain, cli]
image: 'images/cover.png'
---

In March, `axios@1.14.1` and `axios@0.30.4` shipped with an injected dependency that ran a remote access trojan during installation. In May, 84 malicious artifacts across 42 `@tanstack/*` packages reached npm through a GitHub Actions compromise. Both were caught quickly, but every time it happens the same question comes up: does my machine have the affected version installed right now?

An SBOM tells you what shipped to production, and an EDR tells you what ran. Neither tells you what's sitting in the lockfiles, toolchains, and extensions on a developer laptop. So when I came across Bumblebee, which {{< extlink href="https://www.perplexity.ai/hub/blog/perplexity-is-open-sourcing-bumblebee" >}}Perplexity open-sourced in May 2026{{< /extlink >}} under Apache 2.0, I ran it against my own machine to see whether any of my projects were affected.

## What I found

I pointed it at `~/dev`, where all my projects live, with the deep profile, the catalogs of known compromised packages, and `--findings-only`:

```bash
bumblebee scan --profile deep --root ~/dev \
  --exposure-catalog /path/to/bumblebee-repo/threat_intel/ \
  --findings-only
```

It came back clean:

```json
{"record_type":"diagnostic","time":"2026-05-27T16:37:10.17948167Z","level":"info","message":"scan complete: profile=deep status=complete files_considered=150020 records=0 findings=0 suppressed=6784 duplicates=211 diagnostics=2 timed_out=false duration=482.417235ms"}
{
  "record_type": "scan_summary",
  "schema_version": "0.1.0",
  "scanner_name": "bumblebee",
  "scanner_version": "v0.1.2",
  "scan_time": "2026-05-27T16:37:09.696848715Z",
  "end_time": "2026-05-27T16:37:10.179392926Z",
  "endpoint": {
    "hostname": "<redacted>",
    "os": "linux",
    "arch": "amd64",
    "username": "<redacted>",
    "uid": "<redacted>"
  },
  "profile": "deep",
  "status": "complete",
  "roots": [
    {
      "path": "/home/<redacted>/dev",
      "kind": "unknown"
    }
  ],
  "counts": {
    "finding": 0,
    "package": 0
  },
  "package_records_emitted": 0,
  "package_records_suppressed": 6784,
  "findings_emitted": 0,
  "duplicates": 211,
  "diagnostics_count": 2,
  "files_considered": 150020,
  "timed_out": false,
  "duration_ms": 482
}
```

It looked at 150,020 files and found 6,784 package installations, and none of them matched the catalog. Those packages show up as "suppressed" because `--findings-only` only prints matches. The whole thing took under half a second. The two diagnostics were harmless: a permission-denied on a `.containers` folder inside one project, and an MCP config file it couldn't parse any servers from.

## What it is

Bumblebee is a single static Go binary. It runs, scans, prints, and exits, with no daemon and no state between runs.

The part I like most is that it's read-only. It never calls a package manager, never reads source code, and never touches the network; it only reads the metadata files package managers leave on disk (`package-lock.json`, `pnpm-lock.yaml`, `go.sum`, `*.dist-info/METADATA`, and so on). That matters because a lot of these attacks live in post-install scripts, and a scanner that never runs a package manager can't trigger them.

Output is NDJSON, one record per line: `package` for each installation found, `finding` for each catalog match, `scan_summary` at the end, and `diagnostic` on stderr.

## Try it on your machine

Get the binary for your platform from the {{< extlink href="https://www.perplexity.ai/hub/blog/perplexity-is-open-sourcing-bumblebee" >}}Bumblebee announcement{{< /extlink >}}, or build it with Go 1.25 or later. It runs on macOS and Linux only; v0.1 doesn't support Windows. The examples below use `jq` to make the output readable, so install it first (`brew install jq` on macOS, or `apt install jq` / `dnf install jq` on Linux).

There are three profiles:

<div class="table-container">
  <table>
    <tr><th>Profile</th><th>What it walks</th><th>Typical cadence</th><th>Use for</th></tr>
    <tr><td><code>baseline</code></td><td>Global and user-level toolchain installs, editor extensions, MCP config directories, browser extension profiles. No project trees.</td><td>Every 15 min or at login</td><td>Fleet-wide toolchain and tool inventory</td></tr>
    <tr><td><code>project</code></td><td>Configured development directories: <code>~/code</code>, <code>~/src</code>, <code>~/Developer</code>, <code>~/Projects</code>, <code>~/workspace</code>. All ecosystems apply.</td><td>Daily</td><td>Per-project lockfile and dependency inventory</td></tr>
    <tr><td><code>deep</code></td><td>Any explicit <code>--root</code> path, including bare home directories. Requires at least one <code>--root</code> argument.</td><td>On demand</td><td>Incident-response sweeps against a specific advisory</td></tr>
  </table>
</div>

A baseline scan of your tools and extensions produces hundreds of records, so send it to a file, or just look at the summary:

```bash
bumblebee scan --profile baseline > baseline-$(date +%Y%m%d).ndjson
```

```bash
bumblebee scan --profile baseline | jq 'select(.record_type == "scan_summary")'
```

The project profile only looks in those five folder names:

```bash
bumblebee scan --profile project
```

If your projects live somewhere else, like my `~/dev`, use the deep profile with an explicit root. This gives you a flat list of every package across all your projects, with the file it came from:

```bash
bumblebee scan --profile deep --root ~/dev \
  | jq -r 'select(.record_type == "package") | [.ecosystem, .package_name, .version, .source_file] | @tsv'
```

Add `--ecosystem npm` (or another ecosystem) to narrow it down.

To check against known incidents, get the `threat_intel/` folder from the Bumblebee repo (it's already there if you built from source) and point `--exposure-catalog` at it, like I did above. You can also write your own catalog JSON with the format in the README. If something matches, you get a record like this:

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

For incident response you can sweep a whole home directory with deep. Only `deep` accepts a bare home root; `baseline` and `project` reject it. Expect it to take longer, since it walks everything it can reach:

```bash
bumblebee scan --profile deep \
  --root /home/alice \
  --exposure-catalog axios-advisory.json \
  --findings-only
```

On macOS, `--all-users` runs baseline and project scans across every `/Users/<name>` home, so one MDM-deployed command covers every account on the machine.

## How it works

The walker skips credential folders (`.ssh`, `.aws`, `.kube`, `.gnupg`, `.docker`), VCS internals, macOS caches, and browser data outside extension profiles. You can add your own with `--exclude`. It detects symlink loops by inode, and permission errors just become a diagnostic, which is what I saw in my scan.

Each file it finds goes to one of 11 parsers by filename: npm, pnpm, yarn, bun, `node_modules`, Python `dist-info`, `go.sum` and `go.mod`, `Gemfile.lock`, `composer.lock`, MCP configs (Claude Desktop, `mcp.json`, Gemini settings), and VS Code-style and Chromium extensions. They run in a worker pool (4 by default, `--concurrency` to change it), and each parser only opens the file it's given.

Every package gets a stable `record_id`, a SHA-256 of its identity, so the same package seen from `package-lock.json` and `node_modules/` is reported once (the 211 duplicates in my summary), and the same ID shows up across runs. For npm, pnpm, and yarn, `has_lifecycle_scripts` tells you whether the package defines install hooks, not whether they ran. Catalog matching is exact on ecosystem, name, and version, with no semver ranges or fuzzy matching. The `scan_summary` always comes last, and its `status` is `complete`, `partial` (if it hit `--max-duration` or was interrupted), or `error`, so only trust a run that says `complete`.

## Limits

- Exact versions only, no ranges.
- macOS and Linux only in v0.1.
- It doesn't schedule itself; that's on you with cron, launchd, or MDM.
- It's only as good as the catalog, so someone has to keep it current.
- Records with `confidence: medium` or `low` come from partial metadata, so their version is less certain.

What I like is that it stays narrow. It doesn't try to replace your EDR or SBOM, it answers one question from what's on disk without running anything, and in my case the answer was the one I wanted.

---

Photo by {{< extlink href="https://unsplash.com/@kai_wenzel?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Kai Wenzel{{< /extlink >}} on {{< extlink href="https://unsplash.com/photos/yellow-and-black-wasp-RDstSU6vp6A?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
