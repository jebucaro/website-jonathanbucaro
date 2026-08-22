---
title: 'Making a Python CLI AI Native With SKILL.md'
slug: 'making-a-python-cli-ai-native-with-skill-md'
date: 2026-03-23T17:15:45+00:00
lastmod: 2026-08-13T00:00:00Z
description: 'Learn how to make a Python CLI AI-native by adding a SKILL.md for Claude Code, using pokecli as a practical example inspired by the Playwright CLI pattern.'
draft: false
tags: [python, ai-tools, claude]
image: 'images/cover.png'
---

## Why I built this

I recently gave an internal tech talk at work called **_Make Your CLI Tools AI-Native with SKILL.md_**. The feedback told me the idea landed, but it also made one thing clear: I needed a practical example people could inspect and reuse. This post is that example.

I like CLIs that do one thing well, and `pokecli` is a good example of that. It has a clean command surface, clear output, and a workflow that feels natural in the terminal.

{{< gallery caption="pokecli help command" >}}
{{< gallery-image src="images/pokecli-help.webp" alt="Windows Terminal showing the result of running pokecli's help command" >}}
{{< /gallery >}}

{{< gallery caption="pokecli pokemon and move commands" >}}
{{< gallery-image src="images/pokecli-pokemon.webp" alt="Windows Terminal showing the result of running pokecli's pokemon command to get the data of Charizard" >}}
{{< gallery-image src="images/pokecli-move.webp" alt="Windows Terminal showing the result of running pokecli's move command to ge the data of Flamethrower and Thunderbolt" >}}
{{< /gallery >}}

You do not need to redesign a CLI to make it more useful for an AI agent. In many cases the missing piece is a compact guide that tells the agent when to use the tool, which commands exist, and how to apply them safely.

## The problem a skill fixes

CLI help text is great for humans, but an agent that only sees raw help output has to keep re-answering the same questions during a task: which resource groups exist, which commands support `--no-cache`, which output formats are available, how image downloads work, which cache commands are safe to run. That means the model spends part of its context budget re-learning the tool instead of solving the user's request.

A skill turns a CLI into a smaller, more direct interface for an agent. For Claude Code it usually has three layers:

1. **Frontmatter**: the skill name, description, and allowed tools, read every time to decide whether the skill should trigger
2. **SKILL.md body**: the command guide the agent reads once the skill fires
3. **References**: extra docs loaded only when the main file is not enough

The frontmatter does the triggering work, the body gives the agent a short command map, and the references hold the field-level detail that only matters in a few cases. That is the pattern I applied to pokecli, and it is also the pattern behind Microsoft's {{< extlink href="https://github.com/microsoft/playwright-cli" >}}Playwright CLI{{< /extlink >}} skill: keep the always-loaded trigger small, keep the body focused, and push extra detail into reference files only when needed.

<span id="quick-start"></span>

## Quick start

### Install the CLI with `uv`

{{< callout important>}}
This requires `uv` to be installed on your machine first. To install `uv`, you can follow {{< extlink href="https://docs.astral.sh/uv/getting-started/installation/" >}}the guide on the Astral site{{< /extlink >}}.
{{< /callout >}}

```bash
uv tool install git+https://github.com/jebucaro/pokecli
```

You can later uninstall the tool by running:

```bash
uv tool uninstall pokecli
```

### Install the Claude skill

```bash
pokecli install --skills
```

{{< gallery caption="pokecli installation and SKILL.md" >}}
{{< gallery-image src="images/uv-install-pokecli.webp" alt="Install pokecli using the package manager uv." >}}
{{< gallery-image src="images/pokecli-install-skills.webp" alt="Install pokecli skills using the install command." >}}
{{< /gallery >}}

You could also copy the skill files into place by hand or with a small script. I added `install --skills` to make the example complete and easy to run.

### Optional: local dev setup

```bash
git clone https://github.com/jebucaro/pokecli
cd pokecli
uv sync
uv run pokecli --help
```

pokecli still has obvious top-level command groups like `pokemon`, `berry`, `item`, `move`, `location`, `game`, `image`, and `cache`, but the repo now groups many lower-level resources under those families instead of surfacing them all as flat top-level commands. The important pattern for the skill is not the exact top-level count, it is that most resources support `get <name_or_id>` and `list`, while Pokemon adds extra navigation commands like `moves`, `species`, `evolution`, `encounters`, and `forms`.

### Test the CLI before writing the skill

Add `uv run` before each command if you are testing locally with the dev setup.

```bash
pokecli pokemon get pikachu
pokecli berry list --limit 5
pokecli pokemon image 25 -o /tmp/pikachu.png
pokecli cache stats
```

{{< callout note >}}
The skill does not replace the CLI documentation. It gives Claude Code a smaller and more useful entry point into the same command surface.
{{< /callout >}}

Once installed, Claude Code gets a much clearer picture of how to use the tool: when to reach for `pokecli`, which commands belong to each resource, which flags are shared across `get` commands, how to download sprites, and how to inspect and clear the local cache.

{{< gallery caption="" >}}
{{< gallery-video src="images/pokecli-skill-in-action-claude-code.webm" alt="Claude Code using SKILL.md to interact with pokecli." >}}
{{< /gallery >}}

<span id="results"></span>

## The pokecli skill up close

The current `SKILL.md` in the repo is about 180 lines: frontmatter, a short "Agent rule," a quick start, a decision tree, and a commands section. Instead of pasting the whole file, here are the three pieces worth reading closely.

### Frontmatter and the agent rule

```yaml
---
name: pokecli
description: Queries Pokemon, moves, items, abilities, types, locations, game data, forms, machines, encounters, evolutions, and other PokeAPI-backed resources via the pokecli CLI. Use when the user needs Pokemon stats, move info, type matchups, catch locations, evolution chains, sprite downloads, regional or generation data, or cache management. Also use when the user mentions pokecli, pokedex, or PokeAPI.
allowed-tools: Bash(pokecli:*)
user-invocable: false
---
## Agent rule

Use the canonical command path shown in this skill. Human aliases exist, but agents should prefer explicit commands like `pokemon get`, `move get`, and `game region get`.

If a memorized command fails, check `pokecli --help` or the subgroup help before guessing.
```

The description carries both the tool's purpose and the trigger phrases a user might actually say, like `pokedex`, `Pokemon stats`, or `download sprites`. I added the agent rule after `pokecli` grew a shorter, human-typed command layer (more on that below): once a CLI offers two valid ways to phrase the same request, the skill needs to say which one an agent should default to.

### A slice of the decision tree

The full table has close to thirty rows, one per resource the CLI covers. A slice of it:

| User intent                        | Command                                   |
| ---------------------------------- | ----------------------------------------- |
| Pokemon stats, types, abilities    | `pokecli pokemon get <name>`              |
| Can this Pokemon learn move X?     | `pokecli pokemon can-learn <name> <move>` |
| Full evolution chain for a Pokemon | `pokecli pokemon evolution <name>`        |
| Type matchups                      | `pokecli type get <name>`                 |
| TM or HM lookup                    | `pokecli game machine get <id>`           |

Anything not listed falls back to the uniform `get <name_or_id>` contract, so the table only needs to call out the intents that map somewhere less obvious.

### Human aliases

```bash
pokecli pokemon pikachu
pokecli move thunderbolt
pokecli pokemon where pikachu
pokecli pokemon evo eevee
```

These are the shorter, human-typed forms. The skill lists them separately from the decision tree so the agent recognizes them in a user's message instead of treating them as unsupported syntax.

And this is the folder layout Claude Code should end up loading:

```text
.claude/
└── skills/
    └── pokecli/
        ├── SKILL.md
        └── references/
            ├── api-fields.md
            └── workflows.md
```

<span id="how-it-works"></span>

## How it works

The nice part of this pattern is that it stays close to the tool itself. You are not inventing a new interface, you are reorganizing the CLI into an agent-friendly guide.

### The install flow

Installing `pokecli` with `uv tool install` and then running `pokecli install --skills` does not generate a new skill from scratch. It copies the skill files that already ship inside the installed package into the place Claude Code expects: `~/.claude/skills/pokecli/SKILL.md`, `references/api-fields.md`, and `references/workflows.md`. That matters because the user does not need the repo checked out locally, the installed tool already has what it needs.

### `allowed-tools`: the safety layer

This line matters more than it looks:

```yaml
allowed-tools: Bash(pokecli:*)
```

It tells Claude Code the skill is allowed to run `pokecli` commands, but not arbitrary shell commands. That is a good default for a task-focused skill: it is not just a convenience layer, it is also a boundary.

### The body: a cheat sheet, not a tutorial

The body should read like a cheat sheet for an agent: short sections, command groups that mirror the CLI, examples that can be copied and run, no long theory in the middle of the command list. Inside each top-level group, the skill shows the operations that matter most, such as `get`, `list`, `moves`, `download`, `stats`, and `clear`, while nested resources like `pokemon form`, `move damage-class`, `location area`, and `game region` stay close to their parent families. Detail that does not belong in that cheat sheet, like what `base_experience` means or which sprite variants exist, goes into `references/api-fields.md` instead; multi-step recipes go into `references/workflows.md`.

### Human aliases: one class, no duplicated commands

Partway through this project, pokecli grew a second, shorter way to type the same commands: `pokecli pokemon pikachu` instead of `pokecli pokemon get pikachu`. That is not a duplicated command tree, it is one small `TyperGroup` subclass that rewrites an unmatched first argument into `get` before Typer resolves it:

```python
class ResourceGroup(TyperGroup):
    def resolve_command(self, ctx, args):
        if args:
            first = args[0]
            if not first.startswith("-") and first not in self.commands:
                args = ["get", *args]
        return super().resolve_command(ctx, args)
```

For the skill, this means Claude Code now has two valid ways to phrase the same request. The `SKILL.md` handles that by keeping the decision tree canonical, `pokemon get <name>`, and listing the aliases separately, so the agent has a default and does not have to guess which form is safer to script against.

## Side-by-side comparison

I used Microsoft's {{< extlink href="https://github.com/microsoft/playwright-cli" >}}Playwright CLI{{< /extlink >}} as the reference pattern for this pokecli skill. The goal was not to copy the browser workflow, it was to reuse the same skill shape: a small trigger, a focused command guide, and extra detail moved into reference files.

| Design choice     | Playwright CLI                  | pokecli                                                   |
| ----------------- | ------------------------------- | --------------------------------------------------------- |
| Main trigger      | browser automation tasks        | Pokemon data lookup tasks                                 |
| Tool scope        | `Bash(playwright-cli:*)`        | `Bash(pokecli:*)`                                         |
| Quick start shape | navigate, click, type, press    | get and list data, inspect Pokemon moves, download images |
| Workflow          | navigate, interact, re-snapshot | query, browse, inspect moves, download, cache             |
| Command groups    | browser actions and sessions    | core groups plus grouped nested resource commands         |
| Extra docs        | separate skill references       | `references/api-fields.md` and `references/workflows.md`  |

The commands and use case change, but the structure stays the same, and that is the useful part of the pattern.

<span id="testing-your-skill"></span>

## Testing your skill

{{< extlink href="https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf?hsLang=en" >}}Anthropic's skill guidance{{< /extlink >}} is helpful here: test both triggering and behavior.

Queries that should trigger the skill:

- "Look up Pikachu's stats"
- "Show me berry data from PokeAPI"
- "Download a sprite for Charizard"
- "Compare Thunderbolt and Flamethrower"
- "Use pokecli to browse items"

Queries that should not trigger it:

- "Help me write a Python class"
- "What is the weather today?"
- "Create a spreadsheet"
- "Summarize this meeting transcript"

And functional checks against the real CLI:

```bash
pokecli pokemon get pikachu
pokecli pokemon moves pikachu
pokecli pokemon can-learn pikachu thunderbolt
pokecli berry list --limit 5
pokecli item get master-ball --format json
pokecli move get thunderbolt
pokecli pokemon image 25 -o /tmp/pika.png
pokecli cache clear --resource pokemon
pokecli cache stats
```

If these commands work, the skill examples are grounded in the actual tool.

<span id="build-it-yourself"></span>

## Challenge: build one yourself

If you want to push this further, remove the ready-made pokecli skill and build your own. It's a good test of what Claude can infer from the CLI alone, where it gets stuck, and what kind of guidance actually helps.

First, move the shipped skill out of the way (you can reinstall it later with `pokecli install --skills`):

```bash
rm -rf ~/.claude/skills/pokecli
```

Then make a clean project folder with the local skill path Claude will read:

```bash
mkdir -p pokecli-skill-lab/.claude/skills/pokecli
cd pokecli-skill-lab
```

Inside that folder, create `./.claude/skills/pokecli/SKILL.md`. Do not try to write the perfect skill on the first pass, start with the smallest useful version: frontmatter with `name`, `description`, and `allowed-tools`, a few quick start commands, command groups that match the CLI, a few copyable examples, and optional reference files for deeper detail. You already have a full implementation earlier in this post to use as a reference.

Now start Claude from inside the folder so it can see the local skill:

```bash
claude
```

Try prompts like "Use pokecli to look up Pikachu's stats" or "Download a Charizard sprite with pokecli," then clear the context and try the same prompts without mentioning `pokecli` explicitly.

Watch what Claude gets wrong: if it misses a command group, add it; if it uses the wrong flags, add a working example; if it reaches for generic shell commands instead of `pokecli`, tighten the description and examples. You are not trying to write a long document, you are trying to remove hesitation.

After a few prompts your file will usually get better in obvious ways: trigger phrases you forgot the first time, one or two examples for `image download` and `pokemon moves`, shared flags like `--format json` and `--no-cache`, deep field notes moved into a reference file only if you really need them. That feedback loop is the real lesson. The best `SKILL.md` is not the longest one, it is the one that gives Claude a short path to the right command.

If you want to inspect pokecli itself while you work through this, start with the project README in {{< extlink href="https://github.com/jebucaro/pokecli" >}}pokecli{{< /extlink >}}, the command modules under `src/pokecli/commands/`, the alias logic in `src/pokecli/commands/_group.py`, and the app entry point in `src/pokecli/main.py`.

## Final thoughts

This is the part I find most useful about skills: they do not ask you to rebuild your tooling for AI, they ask you to describe your tooling in a way the agent can use well.

If you already have a CLI with clear commands and predictable output, you are probably closer to an AI-native tool than you think. In many cases the missing piece is not a new protocol, it is a good `SKILL.md`. That is also why I wanted to turn the tech talk into a concrete example, the idea is easier to trust when you can point to a real CLI, a real skill file, and a workflow that maps cleanly from one to the other.

---

Photo by {{< extlink href="https://unsplash.com/@jmanalog?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Jay{{< /extlink >}} on {{< extlink href="https://unsplash.com/photos/shallow-focus-photo-of-pokeball-dkFJST9zZZo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}

Pokémon and Pokémon character names are trademarks of Nintendo.
