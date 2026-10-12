---
title: 'Turn Your Scripts and CLIs into AI-Native Tools with Skills'
slug: 'ai-native-clis-with-skills'
subtitle: 'My AWS Community Day Guatemala 2026 talk: how to give an AI agent a short guide to the scripts and CLIs you already have, with pokecli as the demo.'
description: 'How to turn your scripts and CLIs into AI-native tools with a SKILL.md, from my AWS Community Day Guatemala 2026 talk, with pokecli as a working example.'
date: 2026-10-10T15:05:00-06:00
draft: false
image: 'images/cover.png'
work-types: ['Talk']
talk:
    event: 'AWS Community Day Guatemala 2026'
    venue: 'Salón Fuego, Universidad Rafael Landívar'
    location: 'Guatemala City, Guatemala'
    endDate: '2026-10-10T15:55:00-06:00'
    language: 'es'
    repo: 'jebucaro/pokecli'
---

I opened my talk at AWS Community Day Guatemala 2026 asking who has felt that if they aren't using the newest, biggest agent framework, they've already fallen behind. Then I asked what they do first when production goes down. We tail a log, run a query, or write a script. Nobody said they'd build an agent.

That gap is what the talk was about. The scripts and CLIs you already have can become tools an agent uses, and what's usually missing is a short guide, a `SKILL.md`, that tells the agent when to reach for them and how. This page is the written version of the talk, which I gave in Spanish, along with `pokecli`, the CLI I used for the demo. The idea started as an internal talk at work called _Make Your CLI Tools AI-Native with SKILL.md_, and the feedback from that one made it clear I needed a practical example people could inspect and reuse, which is where pokecli comes in.

## The agent decides, the script executes

Here's what a lot of us do today. Something breaks, we paste half a log into a chat, the model answers "I think the error is...", and we go check whether that's true. We're asking the model to calculate things that should have been programmed, so the answers change from run to run, the model only sees part of the context, and when it fills the gaps it can make things up.

Flip the roles. The agent decides what to run and when, a deterministic CLI does the work and returns structured output, and the agent reads that output and answers. `SKILL.md` is the manual that connects the two, and you don't need a server or any new infrastructure for it.

Before writing any code, write down 2 or 3 real use cases. For each one, note what the user would say, the steps it takes, and the result you expect. This is the one I used in the talk:

```text
Use case: Orders report per customer
Trigger:  "how many orders did customer X have?"
          "sales report for this month"
Steps:
  1. report orders --user-id X --from ... --format json
  2. Calculate totals / compare periods
Result:   Real numbers + the command that was used
```

These map almost one to one onto the skill you'll write later. Parameters become flags, the user's phrases become the trigger, and the steps become examples. The tool already exists, and the skill adds the know-how about when and how to use it.

## The four pillars

I boiled the process down to four pillars. They work the same for a Python script, a Node CLI, or a bash wrapper around an internal API.

### Make it deterministic

Most scripts start like this, with everything hardcoded:

```python
# report.py
conn = connect("prod-db.internal")
rows = query("SELECT * FROM orders WHERE user_id = 4821")
print(rows)
```

An agent can't do much with that. Turn every value that changes into a flag, and make the environment and the output format explicit:

```bash
report orders \
  --user-id 4821 \
  --env prod \
  --format json
```

That change is about 80% of the work. A CLI that works well for an agent is one that would also work well in a pipeline, so the checklist will look familiar:

{{< callout note >}}

- Every value that changes is an argument or a flag.
- Errors are actionable and say which values are accepted.
- Output is structured, for example `--format json|table|csv`.
- Data goes to stdout, logs and errors go to stderr.
- Exit codes mean something: `0` ok, `1` error, `2` wrong usage.
- Nothing is interactive. A prompt waiting for input leaves the agent hanging.
- Anything that deletes or modifies data gets `--dry-run` or `--yes`, so nobody runs a DELETE in prod over a misunderstanding.

{{< /callout >}}

And please don't write the argument parsing by hand. In Python, Typer, Click, or argparse will do it for you, and in Node, Commander.js, yargs, or oclif. Distribution is one command either way: `uv tool install` for Python, `npm i -g` for Node. With Typer, the report command above is just a function:

```python
@app.command()
def orders(user_id: int, env: str = "dev", format: str = "table"):
    ...
```

### Give it a trigger the agent can find

The agent never reads your code. It reads your `description`, the one frontmatter field that's always loaded, and uses it to decide whether your skill applies to the request in front of it. Compare these two:

```yaml
# Too vague
description: Reporting tool.

# Useful
description: Generates order, sales, and user reports from the platform database. Use it when the user asks for metrics, reports, totals by date, or information about a specific customer that the platform doesn't show.
```

I think of the description as SEO for your tool, where the reader is an agent. {{< extlink href="https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf?hsLang=en" >}}Anthropic's guide to building skills{{< /extlink >}} has the rules I follow:

- Say what it does, when to use it, and its main capabilities.
- Include phrases users would really say, and file types if they matter.
- Stay under 1024 characters and avoid `<` and `>`, because it goes into the system prompt.
- Use a kebab-case `name` that matches the folder, without "claude" or "anthropic" in it.
- Add negative triggers when the skill shows up where it shouldn't, like "Do NOT use for general finance questions".

### Show it the way

Examples teach the agent how your tool gets used. Each one has three parts: the request a user would make, the exact command with its flags, and the expected output, so the agent can notice when something went wrong.

```markdown
## Examples

**User:** "How many orders did customer 4821 have this month?"

    report orders --user-id 4821 --from 2026-09-01 --format json

**Expected output:**

    {"user_id": 4821, "total_orders": 12, "total_amount": 3450.00}
```

Then document the sad path as error, cause, and fix:

```markdown
## Troubleshooting

**Error:** exit 2, "user not found"
**Cause:** the ID doesn't exist in that environment
**Fix:** confirm the ID with the user and check which --env was used
```

Keep the instructions specific. "Validate the data before continuing" leaves the agent guessing what validating means. "Run `report validate --input file.csv`, and if it fails, check that dates are YYYY-MM-DD and the required fields are present" gives it something to do. Anthropic's guide sums it up: "Code is deterministic; language interpretation isn't."

### Package it in SKILL.md

A skill is a folder with a `SKILL.md` inside:

```text
.claude/skills/
└── orders-report/
    ├── SKILL.md       # required
    ├── scripts/       # your CLI or wrappers
    ├── references/    # docs loaded on demand
    └── assets/        # templates, schemas
```

Put it in `./.claude/skills` for one project or in `~/.claude/skills` to have it everywhere. A few details trip people up. The file has to be named exactly `SKILL.md`, the folder is kebab-case (`orders-report`, never `Orders Report` or `orders_report`), and the README belongs at the root of your repo, outside the skill folder.

This scales because of progressive disclosure, where the agent loads the skill in layers:

1. The frontmatter `name` and `description` are always loaded, which is just enough to decide whether the skill applies.
2. The `SKILL.md` body loads when the skill fires. Keep it under 5,000 words.
3. Files in `references/` load only when the agent needs them, and anything in `scripts/` gets executed without entering the context at all.

For a CLI skill I'd always add the optional `allowed-tools` field. In pokecli it looks like this:

```yaml
allowed-tools: Bash(pokecli:*)
```

It tells Claude Code that the skill may run `pokecli` commands and nothing else, so the skill also works as a safety boundary. I didn't invent this shape, by the way. I copied it from Microsoft's {{< extlink href="https://github.com/microsoft/playwright-cli" >}}Playwright CLI{{< /extlink >}} skill, which keeps the trigger small, the body focused, and the extra detail in reference files.

## Quick start with pokecli

`pokecli` is the CLI I built to demo all of this. It's a small, typed Python CLI for PokeAPI that covers Pokémon, moves, abilities, items, types, and evolutions, with a local cache so repeat lookups don't hit the network. Here's how to get it running with the skill installed.

### Install the CLI with `uv`

{{< callout important>}}
This requires `uv` to be installed on your machine first. To install `uv`, you can follow {{< extlink href="https://docs.astral.sh/uv/getting-started/installation/" >}}the guide on the Astral site{{< /extlink >}}.
{{< /callout >}}

```bash
uv tool install git+https://github.com/jebucaro/pokecli
```

### Install the Claude skill

```bash
pokecli install --skills
```

{{< gallery caption="pokecli installation and SKILL.md" >}}
{{< gallery-image src="images/uv-install-pokecli.webp" alt="Install pokecli using the package manager uv." >}}
{{< gallery-image src="images/pokecli-install-skills.webp" alt="Install pokecli skills using the install command." >}}
{{< /gallery >}}

`install --skills` doesn't generate anything. The `SKILL.md` and its reference files ship inside the package, and the command copies them into `~/.claude/skills/pokecli/`, so you don't need the repo checked out. You could copy the files by hand, I added the command so the example is easy to run.

The CLI has twelve top-level groups, including `pokemon`, `move`, `item`, `type`, `game`, and `cache`. The skill doesn't need that whole inventory, only the shape: most resources support `get <name_or_id>` and `list`, and `pokemon` adds commands like `moves`, `evolution`, and `encounters`.

{{< callout note >}}
The skill does not replace the CLI documentation. It gives Claude Code a smaller and more useful entry point into the same command surface.
{{< /callout >}}

Once it's installed, Claude Code knows when to reach for `pokecli`, which commands belong to each resource, and which output format to ask for:

{{< gallery caption="" >}}
{{< gallery-video src="images/pokecli-skill-in-action-claude-code.webm" alt="Claude Code using SKILL.md to interact with pokecli." >}}
{{< /gallery >}}

## pokecli up close

{{< gallery caption="pokecli help command" >}}
{{< gallery-image src="images/pokecli-help.webp" alt="Windows Terminal showing the result of running pokecli's help command" >}}
{{< /gallery >}}

The `SKILL.md` in the repo is 192 lines, and all four pillars show up in it. These are the parts worth a closer look.

### Frontmatter and the agent rule

```yaml
---
name: pokecli
description: Queries Pokemon, moves, items, abilities, types, locations, game data, forms, machines, encounters, evolutions, and other PokeAPI-backed resources via the pokecli CLI. Use when the user needs Pokemon stats, move info, type matchups, catch locations, evolution chains, sprite downloads, regional or generation data, or cache management. Also use when the user mentions pokecli, pokedex, or PokeAPI.
allowed-tools: Bash(pokecli:*)
user-invocable: false
---
```

The description carries the tool's purpose and the phrases a user might type, like `pokedex`, `Pokemon stats`, or `download sprites`. Then the body opens with the rule the agent should apply before anything else:

```text
## Agent rule

Use the canonical command path shown in this skill. Human aliases exist, but agents should prefer explicit commands like `pokemon get`, `move get`, and `game region get`.

If a memorized command fails, check `pokecli --help` or the subgroup help before guessing.

Always use `--format toon` for token-efficient output. This produces compact key:value output optimized for LLM context windows (~40% smaller than JSON). Only use `--format json` when the next step explicitly includes `jq` or another parser. Do not use `--format table` — it contains Rich markup that wastes tokens.
```

Each of those rules is there because the agent would otherwise guess wrong. The first two showed up after pokecli grew shorter commands for humans. Once a CLI offers two valid ways to ask for the same thing, the skill has to say which one is the default.

### TOON output

pokecli has three output formats. Humans get a Rich table, but its markup burns tokens, and so does all of JSON's punctuation. So I added a third output for agents, TOON, a compact notation that comes out roughly 40% smaller than JSON:

```text
## TOON output format

The `--format toon` output uses Token-Optimized Object Notation:
- Single resources show as `label:` followed by indented `key: value` pairs
- Lists show as `label[count]{fields}:` followed by indented comma-separated rows
- Every response ends with `help[]` hints for next steps
- Aggregates like `count`, `total_moves`, `methods` appear as top-level keys
```

The `help[]` hints are my favorite part: `pokemon get pikachu` ends by suggesting `pokemon moves` and `pokemon evolution`, so the output teaches the agent the next command. Writing the skill is what pushed me to add it. Once I wrote a rule about token cost, I could see the tool had no output mode worth recommending.

### Human aliases

{{< challenge >}}
{{< challenge-problem >}}
Agents do best with one explicit, canonical command per task, but typing `pokecli pokemon get pikachu` by hand every time is more than a terminal session needs.
{{< /challenge-problem >}}
{{< challenge-decision >}}
Rather than register a second set of commands, `commands/_group.py` defines a small `TyperGroup` subclass that rewrites an unmatched first argument into `get` before Typer resolves it:

```python
class ResourceGroup(TyperGroup):
    """Allow `pokecli pokemon pikachu` as a shortcut for `pokecli pokemon get pikachu`."""

    def resolve_command(self, ctx: typer.Context, args: list[str]):
        if args:
            first = args[0]
            if not first.startswith("-") and first not in self.commands:
                args = ["get", *args]
        return super().resolve_command(ctx, args)
```

`pokecli pokemon pikachu` and `pokecli pokemon get pikachu` now run the same function, with no branching inside any command. The packaged `SKILL.md` still tells agents to prefer the canonical form, so the alias stays a convenience for humans.
{{< /challenge-decision >}}
{{< /challenge >}}

The skill also lists the short forms in their own section, with one line of guidance: "These are fine for manual use, but agents should not default to them." That way the agent recognizes `pokecli pokemon pikachu` when a user types it, and still sends the canonical command itself.

Here's a real session in Claude Code, where I asked for Pikachu's stats and then for a comparison of Thunderbolt and Flamethrower:

{{< agent-session "pokecli-demo" >}}

{{< github repo="jebucaro/pokecli" >}}

## When is a skill done?

When you've tested it. There are two things to test. The first is triggering: the skill should load for obvious requests and for paraphrases, and stay quiet for unrelated ones. Aim for around 90% with 10 to 20 phrases. For pokecli, these should trigger it:

- "Look up Pikachu's stats"
- "Show me berry data from PokeAPI"
- "Download a sprite for Charizard"
- "Compare Thunderbolt and Flamethrower"

And these shouldn't:

- "Help me write a Python class"
- "What is the weather today?"
- "Summarize this meeting transcript"

The second is behavior. Run real commands and check the outputs, the errors, and the edge cases:

```bash
pokecli pokemon get pikachu --format toon
pokecli pokemon can-learn pikachu thunderbolt
pokecli item get master-ball --format json
pokecli pokemon image 25 -o /tmp/pika.png
pokecli cache clear --resource pokemon
```

If those work, the skill's examples are grounded in the real tool. Try the first one in all three formats and you'll see why the agent rule picks `toon`.

When something's off, the symptom points at the fix. A skill that doesn't load needs more keywords in the description, one that loads for unrelated requests needs negative triggers, and inconsistent results mean the instructions need work. A handy debugging trick is to ask the agent "When would you use the pokecli skill?" and read what it understood.

Before calling a skill finished, I run through this list:

- [ ] 2 or 3 concrete use cases written down
- [ ] A kebab-case folder with a file named exactly `SKILL.md`
- [ ] Frontmatter between `---` lines, with a kebab-case `name`
- [ ] A `description` that says what and when, under 1024 characters, with no `<` or `>`
- [ ] Actionable instructions, examples, and troubleshooting
- [ ] Reference files linked from `SKILL.md`
- [ ] Tested with obvious requests, paraphrases, and unrelated topics

## Your homework

This is the homework I gave the room for Monday:

1. Pick a script you use every week.
2. Move the hardcoded values into flags and add JSON output.
3. Write a `description` that says what it does and when to use it.
4. Add 2 or 3 examples with their expected output.
5. Save it as `SKILL.md` and try it with your agent.

If you don't have a script handy, use pokecli and write its skill yourself. First, move the shipped skill out of the way (you can reinstall it later with `pokecli install --skills`):

```bash
rm -rf ~/.claude/skills/pokecli
```

Then make a clean project folder with the local skill path Claude will read:

```bash
mkdir -p pokecli-skill-lab/.claude/skills/pokecli
cd pokecli-skill-lab
```

Inside that folder, create `./.claude/skills/pokecli/SKILL.md`, then start Claude from the same directory so it picks up the local skill:

```bash
claude
```

Don't aim for the perfect file on the first pass. Start with the frontmatter and a few commands, try a prompt like "Use pokecli to look up Pikachu's stats", then clear the context and try again without naming pokecli. Watch what Claude gets wrong: if it misses a command group, add it; if it uses the wrong flags, add a working example; if it reaches for generic shell commands, tighten the description. When you're happy with it, compare your file with the one pokecli ships.

The last slide of the talk said you didn't fall behind, and that the scripts you already wrote are your advantage. Make them deterministic, give them a trigger, show the agent the way with examples, and package it all in a `SKILL.md`.

---

Photo by {{< extlink href="https://unsplash.com/@jmanalog?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Jay{{< /extlink >}} on {{< extlink href="https://unsplash.com/photos/shallow-focus-photo-of-pokeball-dkFJST9zZZo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}

Pokémon and Pokémon character names are trademarks of Nintendo.
