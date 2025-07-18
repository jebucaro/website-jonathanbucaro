# Hugo Personal Site - Content Structure

## Directory Structure

```text
content/
├── about.md             # About page
├── blog/                # Blog posts
│   ├── _index.md       # Blog index
│   ├── 2019/           # Posts by year
│   ├── 2020/
│   ├── 2021/
│   ├── 2024/
│   └── 2025/
└── projects/           # Project portfolio
    ├── _index.md       # Projects index
    └── project-name.md # Individual projects
```

## Content Guidelines

### File Naming Convention

- Use standard `.md` extension for all content
- Use descriptive slugs in URLs
- No language suffixes required (English-only site)

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

- Organize by year in subdirectories
- Use descriptive filenames
- Include proper front matter with tags and categories

### Projects Structure

- Each project should have both English and Spanish versions
- Include project metadata in front matter
- Use consistent naming and structure

## Configuration

### Localized Strings

All user-facing strings are now stored in `config/_default/params.yaml` under the `strings` section:

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

### Theme SCSS Override

- The site uses the Hilton theme with custom SCSS overrides
- Main SCSS file imports theme styles: `@import "themes/hilton/assets/sass/main";`
- Add custom styles below the theme import in `assets/sass/main.scss`
- Hugo automatically processes SCSS files through Hugo Pipes
- The theme's `head.html` looks for `sass/main.scss` (not `scss/`)

### CSS Processing

- SCSS is compiled to CSS during Hugo build
- Minification and fingerprinting applied in production
- Source maps enabled in development mode
- Final CSS output: `public/css/main.css`
