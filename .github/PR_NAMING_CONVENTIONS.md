# PR & Commit Naming Conventions

## Title Format

```text
:<gitmoji>: <brief description>
```

**Rules:**

- Max 72 characters
- Lowercase description
- Use present tense (add, fix, update)
- Be specific but concise

## Gitmoji Categories

### Content & Posts

| Gitmoji     | Use Case                         | Example                                      |
| ----------- | -------------------------------- | -------------------------------------------- |
| `:bento:`   | Restructure/reorganize content   | `:bento: restructure GPT-5 post for clarity` |
| `:memo:`    | Add/update documentation or text | `:memo: update about page content`           |
| `:pencil2:` | Fix typos or minor text changes  | `:pencil2: fix typo in blog post title`      |

### Features & Functionality

| Gitmoji      | Use Case                 | Example                                      |
| ------------ | ------------------------ | -------------------------------------------- |
| `:sparkles:` | Add new feature          | `:sparkles: add mermaid diagram support`     |
| `:zap:`      | Performance improvements | `:zap: optimize cache headers for assets`    |
| `:recycle:`  | Refactor code            | `:recycle: improve mermaid utils resilience` |

### UI & Styling

| Gitmoji      | Use Case                         | Example                                    |
| ------------ | -------------------------------- | ------------------------------------------ |
| `:lipstick:` | Update UI/styles                 | `:lipstick: add dark mode theme variables` |
| `:art:`      | Improve structure/format of code | `:art: simplify mermaid diagram styles`    |
| `:iphone:`   | Responsive design work           | `:iphone: fix mobile navigation layout`    |

### Fixes & Maintenance

| Gitmoji              | Use Case                | Example                                         |
| -------------------- | ----------------------- | ----------------------------------------------- |
| `:bug:`              | Fix bugs                | `:bug: fix image loading resource error`        |
| `:adhesive_bandage:` | Simple/non-critical fix | `:adhesive_bandage: adjust link color contrast` |
| `:ambulance:`        | Critical hotfix         | `:ambulance: fix broken deployment pipeline`    |

### Configuration & Dependencies

| Gitmoji             | Use Case              | Example                                           |
| ------------------- | --------------------- | ------------------------------------------------- |
| `:wrench:`          | Config file changes   | `:wrench: configure markdown linting rules`       |
| `:heavy_plus_sign:` | Add dependency        | `:heavy_plus_sign: add mermaid package`           |
| `:arrow_up:`        | Update dependency     | `:arrow_up: update Hugo to v0.120.0`              |
| `:lock:`            | Security improvements | `:lock: update dependencies with vulnerabilities` |

### Assets & Media

| Gitmoji   | Use Case            | Example                                  |
| --------- | ------------------- | ---------------------------------------- |
| `:bento:` | Add/update assets   | `:bento: add cover image for GPT-5 post` |
| `:fire:`  | Remove files/assets | `:fire: remove unused portfolio images`  |

## PR Title Examples by Category

### Blog Posts

```text
:bento: improve GPT-5 impressions post structure and readability
:memo: add new post about Hugo optimization tips
:pencil2: fix typos in knowledge graph article
```

### Website Features

```text
:sparkles: add search functionality to blog
:zap: optimize image loading with lazy loading
:recycle: refactor navigation component structure
```

### Portfolio Updates

```text
:bento: add new project showcase with images
:lipstick: redesign portfolio card layout
:memo: update project descriptions and links
```

### Configuration & Tools

```text
:wrench: configure markdownlint for ATX-style headings
:heavy_plus_sign: add prettier for code formatting
:arrow_up: update npm dependencies to latest versions
```

### Bug Fixes

```text
:bug: fix broken internal links in blog posts
:bug: resolve mobile menu toggle issue
:adhesive_bandage: adjust footer spacing on mobile
```

### Security & Performance

```text
:lock: update dependencies with security vulnerabilities
:zap: implement browser caching for static assets
:green_heart: fix CI/CD pipeline configuration
```

## Commit Message Guidelines

### Structure

```text
:<gitmoji>: <brief description>

[Optional detailed explanation]
- Bullet points for specifics
- Why the change was made
- Any relevant context
```

### Example

```text
:sparkles: add mermaid diagram support

Integrate mermaid.js for rendering diagrams in blog posts:
- Add mermaid package as dependency
- Create render hook for fenced code blocks
- Implement theme-aware styling
- Add conditional loading based on page usage

This enables technical documentation with flowcharts and diagrams
without requiring external image generation tools.
```

## Quick Reference

**Content**: `:bento:` `:memo:` `:pencil2:`
**Features**: `:sparkles:` `:zap:` `:recycle:`
**UI/Style**: `:lipstick:` `:art:` `:iphone:`
**Fixes**: `:bug:` `:adhesive_bandage:` `:ambulance:`
**Config**: `:wrench:` `:heavy_plus_sign:` `:arrow_up:`
**Security**: `:lock:` `:green_heart:`
