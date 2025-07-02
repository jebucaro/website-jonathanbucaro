# Hugo Personal Site - Content Structure

## Directory Structure

```text
content/
├── about.en.md           # English about page
├── about.es.md           # Spanish about page
├── blog/                 # Blog posts
│   ├── _index.en.md     # Blog index (English)
│   ├── _index.es.md     # Blog index (Spanish)
│   ├── 2019/            # Posts by year
│   ├── 2020/
│   ├── 2021/
│   ├── 2024/
│   └── 2025/
└── projects/            # Project portfolio
    ├── _index.en.md     # Projects index (English)
    ├── _index.es.md     # Projects index (Spanish)
    ├── project-name.en.md
    └── project-name.es.md
```

## Content Guidelines

### File Naming Convention

- Use filename suffixes for translations: `.en.md`, `.es.md`
- Use `translationKey` in front matter to link translations
- Use descriptive slugs in URLs

### Front Matter Structure

```yaml
---
title: 'Page Title'
date: 2025-01-01T00:00:00-06:00
draft: false
translationKey: 'unique-key'
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
- Use consistent naming across languages

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
