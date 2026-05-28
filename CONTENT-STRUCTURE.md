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
└── projects/                 # Project portfolio
    ├── _index.en.md          # Projects index (English)
    ├── _index.es.md          # Projects index (Spanish)
    └── project-name/         # Individual project bundle
        ├── index.en.md
        ├── index.es.md
        ├── images/
        └── sessions/         # Optional: used with the agent-session shortcode
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
categories: ['category']
---
```

### Blog Posts Organization

- Organize by year in subdirectories (e.g., `2024/`, `2025/`, `2026/`)
- Each post is a **page bundle** with its own directory containing:
    - `index.en.md` / `index.es.md` - The post content in each language
    - `images/` - Post-specific images (co-located with content)
    - `charts/` - Optional: data files used by the `chart` shortcode
- Use descriptive directory names that reflect the post slug
- Include proper front matter with tags and categories
- Images are referenced relative to the post's directory

### Projects Structure

- Each project is a **page bundle** with its own directory
- Structure:
    - `project-name/index.en.md` / `project-name/index.es.md` - Project content in each language
    - `project-name/images/` - Project images and assets
    - `project-name/sessions/` - Optional: agent session files used by the `agent-session` shortcode
- Include project metadata in front matter
- Use consistent naming and structure

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
