# Hugo Personal Site - Content Structure

## Directory Structure

```text
content/
├── about/                    # About page bundle
│   ├── index.en.md           # About page content (English)
│   ├── index.es.md           # About page content (Spanish)
│   └── images/               # About page images
├── blog/                     # Blog posts
│   ├── _index.en.md          # Blog index (English)
│   ├── _index.es.md          # Blog index (Spanish)
│   ├── 2019/                 # Posts by year
│   │   └── post-slug/
│   │       ├── index.en.md
│   │       ├── index.es.md
│   │       └── images/
│   ├── 2020/ ...
│   ├── 2021/ ...
│   ├── 2024/ ...
│   ├── 2025/ ...
│   └── 2026/                 # Add a new year directory as needed
│       └── post-slug/
│           ├── index.en.md
│           ├── index.es.md
│           ├── images/
│           └── charts/       # Optional: used with the chart shortcode
└── work/                     # Work portfolio: projects and case studies
    ├── _index.en.md          # Work index (English)
    ├── _index.es.md          # Work index (Spanish)
    └── item-name/            # Individual work bundle
        ├── index.en.md
        ├── index.es.md
        ├── images/
        └── sessions/         # Optional: used with the agent-session shortcode
```

Taxonomy term pages live alongside content:

```text
content/
├── tags/                     # Tags index (blog)
│   ├── _index.en.md
│   └── _index.es.md
└── work-types/               # Work type terms (work only)
    └── project/
        ├── _index.en.md
        └── _index.es.md
```

## Content Guidelines

### File Naming Convention

- Use **page bundles** (directories with `index.en.md` / `index.es.md`) for content with associated assets
- All content files use language suffixes: `.en.md` for English, `.es.md` for Spanish
- Section index files follow the same pattern: `_index.en.md` / `_index.es.md`
- Use descriptive directory names that reflect URL slugs
- Co-locate images and resources with content in the same directory

### Front Matter Structure

```yaml
---
title: 'Page Title'
date: 2025-01-01T00:00:00-06:00
draft: false
slug: 'url-slug'
tags: ['tag1', 'tag2']
---
```

`tags` belongs to blog posts. Work items use `work-types` and `artifact` instead, both
described under Work Structure below.

### Blog Posts Organization

- Organize by year in subdirectories (e.g., `2024/`, `2025/`, `2026/`)
- Each post is a **page bundle** with its own directory containing:
    - `index.en.md` / `index.es.md` - The post content in each language
    - `images/` - Post-specific images (co-located with content)
    - `charts/` - Optional: data files used by the `chart` shortcode
- Use descriptive directory names that reflect the post slug
- Include proper front matter with tags
- Images are referenced relative to the post's directory
- Blog posts automatically receive `BlogPosting` JSON-LD structured data — no `schemaType` field is needed

### Work Structure

The `work` section holds two kinds of write-up: projects, which are things built and shown
openly, and case studies, which cover client work at the level of architecture and
decisions without identifying detail. Both live in the same section and are distinguished
by front matter, not by directory.

- Each work item is a **page bundle** with its own directory
- Structure:
    - `item-name/index.en.md` / `item-name/index.es.md` - Content in each language
    - `item-name/images/` - Images and assets
    - `item-name/sessions/` - Optional: agent session files used by the `agent-session` shortcode
- Create new items with `hugo new content work/<name>/index.en.md`, which applies `archetypes/work.md`

Work items are classified along two independent axes:

**`work-types`** is the navigable axis. Exactly one value per item, either `Project` or
`Case Study`. It is a Hugo taxonomy, so it publishes a term page at
`/work-types/<slug>/` listing the items assigned to it, and the value is rendered as a
link on the work item page. Term titles are localized through
`content/work-types/<slug>/_index.{en,es}.md`. A term file is only created once at least
one item uses that term, because an unused term would publish an empty page.

This taxonomy is deliberately separate from `tags`, which blog posts use. A blog post
cannot add terms to `work-types`, and a work item does not appear on tag pages.

**`artifact`** is the non-navigable axis. It narrows the classification, for example
`cli-tool`, and is deliberately **not** a taxonomy: Hugo generates no term page, no URL,
and no sitemap entry for it, and it is always rendered as plain text rather than a link.

```yaml
work-types: ['Project'] # navigable, exactly one
artifact: 'cli-tool' # optional, not navigable
```

The value is a stable lowercase slug, identical in both language files. Its display label
is resolved per language from `work_artifact_<slug>` in `i18n/en.yaml` and `i18n/es.yaml`,
so a single slug yields "CLI Tool" in English and "Herramienta CLI" in Spanish.

Because `artifact` is not a taxonomy, Hugo does not validate it. Allowed slugs are listed
under `work.artifacts` in `config/_default/params.yaml`, and
`layouts/_partials/functions/work-artifact-label.html` fails the build on any value
outside that list. Adding a new artifact means adding the slug to params and a translation
to both i18n files.

Work pages support an optional `schemaType` front matter field that controls JSON-LD
structured data. Set it to `SoftwareApplication` for tools the reader can install and run
(CLI tools, packages, apps). Omit it for case studies and client work — it defaults to
`CreativeWork`.

Work pages also support an optional `featured: true` front matter field that pins an item
to the "spotlight" slot in the homepage's adaptive work grid (used when there are 4 or 5
items). At most one item should be `featured: true` at a time; if none or more than one is
set, the homepage falls back to the most recently dated item.

## Configuration

### Localized Strings

All user-facing strings are stored in `config/_default/params.yaml` under the `strings` section. Language-specific overrides live in `config/_default/params.en.yaml` and `config/_default/params.es.yaml`.

```yaml
strings:
    ui:
        navigation: 'Navigation'
        email: 'Email'
        # ... other UI strings
    sections:
        hero:
            title: "I'm Jonathan 🤓"
            # ... other section strings
```

This approach provides:

- Easy customization without touching theme files
- Theme flexibility for future changes
- Clean separation of content and presentation

## Assets and Styling

### SCSS Structure

```text
assets/
└── sass/
    └── main.scss        # Main SCSS file (overrides theme)
```

### SCSS Override

- Layouts and assets live in the site root (no separate theme directory)
- Add custom styles in `assets/sass/main.scss`
- Hugo automatically processes SCSS files through Hugo Pipes

### CSS Processing

- SCSS is compiled to CSS during Hugo build
- Minification and fingerprinting applied in production
- Source maps enabled in development mode
- Final CSS output: `public/css/main.css`
