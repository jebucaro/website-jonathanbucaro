# Hugo Personal Site - Content Structure

## Directory Structure

```text
content/
├── about/              # About page bundle
│   ├── index.md       # About page content
│   └── images/        # About page images
├── blog/              # Blog posts
│   ├── _index.md      # Blog index
│   ├── 2019/          # Posts by year
│   │   └── scrum-master-certified/
│   │       ├── index.md
│   │       └── images/
│   ├── 2020/
│   │   └── guide-enable-wsl2/
│   │       ├── index.md
│   │       └── images/
│   ├── 2021/
│   │   ├── get-contacts-profile-picture-inside-manychat/
│   │   └── scrum-product-owner-certified/
│   ├── 2024/
│   │   ├── aws-certified-cloud-practitioner/
│   │   ├── improve-the-windows-terminal-experience-with-ohmyposh/
│   │   └── kmp/
│   └── 2025/
│       ├── create-knowledge-graph-from-text-with-gemini/
│       ├── discover-the-importance-of-keeping-a-work-log/
│       └── personal-impressions-about-gpt-5/
│           ├── index.md
│           ├── charts/
│           └── images/
└── projects/          # Project portfolio
    ├── _index.md      # Projects index
    └── erp-system/    # Individual project bundle
        ├── index.md
        └── images/
            └── cover.jpg.placeholder
```

## Content Guidelines

### File Naming Convention

- Use **page bundles** (directories with `index.md`) for content with associated assets
- Use standard `.md` extension for all content files
- Use descriptive directory names that reflect URL slugs
- Co-locate images and resources with content in the same directory
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

- Organize by year in subdirectories (e.g., `2024/`, `2025/`)
- Each post is a **page bundle** with its own directory containing:
    - `index.md` - The post content
    - `images/` - Post-specific images (co-located with content)
    - `charts/` - Optional charts/data visualizations (when needed)
- Use descriptive directory names that reflect the post slug
- Include proper front matter with tags and categories
- Images are referenced relative to the post's directory

### Projects Structure

- Each project is a **page bundle** with its own directory
- Structure:
    - `project-name/index.md` - Project content
    - `project-name/images/` - Project images and assets
    - Use `.placeholder` files for images not yet added (e.g., `cover.jpg.placeholder`)
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
