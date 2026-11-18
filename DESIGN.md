---
name: Jonathan Búcaro
description: A product engineer's working notebook, with one highlighter and a terminal that's always on.
colors:
    highlighter-yellow: '#ffc71d'
    highlighter-yellow-bright: '#ffd34e'
    ink: '#111111'
    paper: '#ffffff'
    paper-gray: '#eaecef'
    paper-mist: '#e4e6eb'
    pencil-gray: '#767676'
    code-label-gray: '#57606a'
    night: '#111016'
    night-panel: '#22222a'
    night-panel-raised: '#27272f'
    night-rule: '#2f3135'
    moon-gray: '#9e9e9e'
    chalk: '#f0f0f0'
    terminal-bg: '#282c34'
    terminal-chrome: '#1f1f1f'
    terminal-fg: '#dcdfe4'
    terminal-muted: '#9da5b4'
    terminal-prompt: '#e5c07b'
    terminal-command: '#98c379'
    terminal-blue: '#61afef'
    terminal-cyan: '#56b6c2'
    terminal-purple: '#c678dd'
    callout-blue: '#4d65dc'
    callout-green: '#2db47d'
    callout-yellow: '#f1c40f'
    callout-orange: '#e67e22'
    callout-red: '#e74c3c'
    callout-night: '#23272f'
typography:
    display:
        fontFamily: 'Noto Sans Display, Noto Sans Display Fallback, Arial, Helvetica Neue, Helvetica, sans-serif'
        fontSize: '72px'
        fontWeight: 800
        lineHeight: 1.05
        letterSpacing: '-1.5px'
    headline:
        fontFamily: 'Noto Sans Display, Noto Sans Display Fallback, Arial, Helvetica Neue, Helvetica, sans-serif'
        fontSize: '48px'
        fontWeight: 700
        lineHeight: 1.1
    title:
        fontFamily: 'Noto Sans Display, Noto Sans Display Fallback, Arial, Helvetica Neue, Helvetica, sans-serif'
        fontSize: '24px'
        fontWeight: 700
        lineHeight: 1.2
    nav:
        fontFamily: 'Noto Sans Display, Noto Sans Display Fallback, Arial, Helvetica Neue, Helvetica, sans-serif'
        fontSize: '20px'
        fontWeight: 700
        lineHeight: 1
    body:
        fontFamily: 'Noto Sans Display, Noto Sans Display Fallback, Arial, Helvetica Neue, Helvetica, sans-serif'
        fontSize: '18px'
        fontWeight: 400
        lineHeight: 1.7
    body-article:
        fontFamily: 'Noto Sans Display, Noto Sans Display Fallback, Arial, Helvetica Neue, Helvetica, sans-serif'
        fontSize: '19px'
        fontWeight: 400
        lineHeight: 1.75
    label:
        fontFamily: 'Noto Sans Display, Noto Sans Display Fallback, Arial, Helvetica Neue, Helvetica, sans-serif'
        fontSize: '12px'
        fontWeight: 700
        lineHeight: 1
        letterSpacing: '1.6px'
    mono:
        fontFamily: 'Cascadia Code, Cascadia Mono, ui-monospace, Consolas, Menlo, monospace'
        fontSize: '13px'
        fontWeight: 400
        lineHeight: 1.75
rounded:
    xs: '4px'
    sm: '8px'
    terminal: '10px'
    md: '12px'
    lg: '16px'
    xl: '24px'
    band: '40px'
    pill: '999px'
    circle: '50%'
spacing:
    base: '16px'
    block: '32px'
    section-head: '48px'
    header: '60px'
    section: '100px'
components:
    button-primary:
        backgroundColor: '{colors.ink}'
        textColor: '{colors.paper}'
        typography: '{typography.title}'
        rounded: '{rounded.md}'
        padding: '20px 40px'
    button-primary-hover:
        backgroundColor: '{colors.highlighter-yellow}'
        textColor: '{colors.ink}'
    button-accent:
        backgroundColor: '{colors.highlighter-yellow}'
        textColor: '{colors.ink}'
        rounded: '{rounded.md}'
        padding: '20px 40px'
    tag-chip:
        backgroundColor: '{colors.paper-gray}'
        textColor: '{colors.ink}'
        typography: '{typography.label}'
        rounded: '{rounded.xs}'
        padding: '8px 12px'
    tag-chip-hover:
        backgroundColor: '{colors.highlighter-yellow}'
        textColor: '{colors.ink}'
    work-card-image:
        backgroundColor: '{colors.paper-gray}'
        rounded: '{rounded.lg}'
    work-band:
        backgroundColor: '{colors.paper-gray}'
        rounded: '{rounded.band}'
        padding: '60px 0 80px'
    language-link:
        textColor: '{colors.ink}'
        rounded: '{rounded.sm}'
        padding: '0 12px'
        height: '44px'
    theme-toggle:
        backgroundColor: '{colors.paper-gray}'
        rounded: '{rounded.circle}'
        size: '44px'
    callout:
        backgroundColor: '{colors.paper-gray}'
        textColor: '{colors.ink}'
        rounded: '{rounded.md}'
        padding: '24px 32px 24px 56px'
    terminal:
        backgroundColor: '{colors.terminal-bg}'
        textColor: '{colors.terminal-fg}'
        typography: '{typography.mono}'
        rounded: '{rounded.terminal}'
        padding: '16px 18px 18px'
---

# Design System: Jonathan Búcaro

## Overview

**Creative North Star: "The Engineer's Notebook"**

The site reads like a working engineer's notebook: clean pages of plain type, one highlighter for what matters, and real artifacts pasted in. The personality comes from those artifacts (a live-looking terminal, code blocks, talk photos, project covers), not from decoration. A reader should feel they are looking at someone's actual work, kept tidy, rather than at a marketing site.

Density is relaxed: 18px body text with a 1.7 line height, 32px between blocks, 100px between homepage sections, and a 780px reading column for posts and work write-ups. One sans family carries everything from the 72px hero headline to 12px uppercase labels. The only other voice is the monospace inside the terminal and code.

Corners are friendly and rounded throughout (8 to 16px on most surfaces, 40px on the homepage work band), which softens an otherwise strict black-white-yellow palette. Light and dark themes are equal citizens; dark mode is a deep violet-tinted night (`night`), not pure black. The system explicitly rejects hype and SaaS gloss: no gradients, glows, glassmorphism, or anything that reads as a product launch page.

**Key Characteristics:**

- One accent, Highlighter Yellow, used as a fill or underline, never as body text on paper.
- One type family (Noto Sans Display, self-hosted variable 400 to 700) plus a local-only monospace.
- Flat tonal layers for depth; the hero terminal is the only element that floats.
- Friendly rounded corners on every contained surface.
- An always-dark Windows Terminal window (One Half Dark) as the homepage signature.

## Colors

A near-monochrome notebook (ink on paper by day, chalk on night by night) with a single warm highlighter, plus a fixed terminal palette and five semantic callout colors.

### Primary

- **Highlighter Yellow** (`highlighter-yellow`): the one brand accent. Fills the accent button, the hover state of the primary button, tag chips on hover, text selection, the active-nav dot, the current-language border, the 2px link-underline sweep on post titles and in the mobile nav, the blockquote's opening mark, the hero avatar ring and the callout's default left rule. In dark mode it also becomes the primary button's resting fill, brightening to **Highlighter Yellow Bright** (`highlighter-yellow-bright`) on hover.

### Neutral

- **Ink** (`ink`): light-mode text, headings, links and the primary button fill.
- **Paper** (`paper`): light-mode page background.
- **Paper Gray** (`paper-gray`): light-mode panels, borders, table stripes, code background, tag chips, the work band, and image placeholders.
- **Paper Mist** (`paper-mist`): the second panel tone, used only for the tag hover on article cards.
- **Pencil Gray** (`pencil-gray`): secondary text in light mode (hero meta, captions).
- **Code Label Gray** (`code-label-gray`): the language label on code blocks in light mode.
- **Night** (`night`): dark-mode page background, with a faint violet cast.
- **Night Panel** (`night-panel`) and **Night Panel Raised** (`night-panel-raised`): dark-mode panels, code backgrounds, table rows and the dropdown menu.
- **Night Rule** (`night-rule`): dark-mode borders.
- **Moon Gray** (`moon-gray`): dark-mode body and secondary text.
- **Chalk** (`chalk`): dark-mode headings and links.

### Terminal (fixed, theme-independent)

The One Half Dark scheme: **Terminal Background** (`terminal-bg`) inside a **Terminal Chrome** (`terminal-chrome`) title bar, **Terminal Foreground** (`terminal-fg`) text, **Prompt** (`terminal-prompt`), **Command** (`terminal-command`), **Blue** (`terminal-blue`) for languages, link underlines and focus, **Cyan** (`terminal-cyan`) for flags, **Purple** (`terminal-purple`) for item types, and **Muted** (`terminal-muted`) for dates and descriptions. One Half's red is deliberately unused: it measures 4.38:1 on the terminal background, below AA.

### Semantic (callouts and status only)

**Callout Blue** (note), **Callout Green** (tip, and the "updated" badge), **Callout Yellow** (important), **Callout Orange** (warning), **Callout Red** (caution), and **Callout Night** (`callout-night`, the dark-mode callout panel). They appear only as a callout's left rule or a status badge, never as decoration.

### Named Rules

**The One Highlighter Rule.** Highlighter Yellow is the only brand accent. No second accent color sits beside it; semantic callout colors stay inside callouts and status badges.

**The Highlighter Never Writes Rule.** Yellow is a fill behind dark ink (12:1) or a 2 to 3px stroke, underline or dot. Never use it as text on Paper: it measures 1.56:1.

**The Always-Dark Terminal Rule.** The terminal keeps its fixed One Half Dark palette in both site themes. It never reads theme tokens.

## Typography

**Display Font:** Noto Sans Display (fallback: "Noto Sans Display Fallback", a size-adjusted local Arial, then Helvetica, sans-serif)
**Body Font:** Noto Sans Display (same stack)
**Label/Mono Font:** Cascadia Code (fallbacks: Cascadia Mono, ui-monospace, Consolas, Menlo, monospace), local only

**Character:** One humanist sans at every size, from a tight, heavy display headline to airy reading text, so the voice stays consistent and only weight, size and tracking create hierarchy. The monospace appears only where a machine is talking.

### Hierarchy

- **Display** (800, 72px stepping to 60px under 1400px and 36px on phones, line height 1.05, -1.5px tracking): the homepage hero headline only.
- **Headline** (700, 48px stepping to 36px and 24px on phones, line height 1.1): post and page titles; section titles use the same size at line height 1 and -0.5px tracking. Work-page titles run larger at 56px.
- **Title** (700, 24px, line height 1.2): card titles for work items and articles. Content h2 to h4 run 28, 24 and 20px.
- **Nav** (700, 20px, line height 1): desktop navigation links; 24px in the mobile drawer.
- **Body** (400, 18px stepping to 17px and 16px, line height 1.7): default page text.
- **Body Article** (400, 19px stepping to 18px and 17px, line height 1.75): posts and pages, in a 780px column, with `text-wrap: pretty` on paragraphs and `balance` on h1 to h3.
- **Label** (700, 11 to 12px, 1.6px tracking, uppercase): post meta, work-hero meta, card labels and nav section labels, usually at 60% opacity of the text color.
- **Mono** (13px, 11px on phones, line height 1.75): the hero terminal; code blocks use 14px.

### Named Rules

**The One Family Rule.** Noto Sans Display sets every word of UI and prose. Don't add a second display or body face; the monospace is only for terminal and code, and it is never downloaded.

**The Weight Ladder Rule.** Hierarchy is built from weight (400, 700, 800), size and tracking. Color stays Ink or Chalk for every heading level.

## Layout

A 12-column flex grid (`.row`/`.col`, with `col-d-*`, `col-t-*` and `col-m-*` modifiers) inside a centered container that steps down by breakpoint: 1300px wide, then 1000px under 1400px, 740px under 1024px, 560px under 768px, and 480px under 576px, with 16px side gutters (20px on phones). The breakpoints are wide 1400px, desktop 1024px, tablet 768px and mobile 576px; the mobile nav drawer takes over at 1024px.

The spacing rhythm is built from a 16px base: 32px below every block element, 48px under section intros, 60px header padding (40px on tablet, 32px on phones), and 100px between homepage sections (80px under 1024px). Section intros are centered with a 530px max width; reading content is a single 780px column, and images marked `#wide` break out to full viewport width.

The homepage hero is a two-column grid (1.1fr text, 1fr terminal, 64px gap) that stacks to byline, headline, description, terminal and then the button below 1024px. Work items fill a 3-up card grid, switching to a 2fr, 1fr, 1fr featured layout above 1400px when there are 4 or 5 items. The work-page head pairs a 4:5 cover (40% width) with its title, stacking to a 16:9 cover under 1024px.

**The Reading Column Rule.** Long-form text never exceeds the 780px column; everything wider is an image or a deliberate full-bleed break.

## Elevation & Depth

The system is flat. Depth comes from tonal layering: Paper Gray (or Night Panel) panels sit on Paper (or Night), and borders use the same tone. Shadows at rest are reserved for the hero terminal, which floats as the page's one physical object. Cards respond to hover with a 6px lift and a 4% image zoom (0.5s ease), and both are switched off under `prefers-reduced-motion`.

### Shadow Vocabulary

- **Terminal lift** (`box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18)`): the hero terminal only.
- **Menu float** (`box-shadow: 0 15px 40px 5px rgba(20, 20, 20, 0.07)`): the desktop dropdown menu, which overlays content.
- **Whisper** (`box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04)`): callouts, challenge blocks and GitHub cards. It is faint enough to read as a tonal edge rather than lift; GitHub cards deepen it on hover (`0 4px 16px rgba(0, 0, 0, 0.08)`).

### Named Rules

**The Flat Paper Rule.** Surfaces are flat at rest. Only the terminal floats; card lift is a response to hover, never a resting state, and it disappears under reduced motion.

## Shapes

Friendly, rounded rectangles everywhere, with corner radius growing with the size of the surface: 4px on tag chips, 8px on post images, the language switcher and dropdowns, 10px on the terminal, 12px on buttons and callouts, 16px on work-card covers, 24px on the work-page cover, and 40px on the homepage work band (28px on tablet, 20px on phones). Circles mark controls and identity: the 44px theme toggle, the avatar, and the 6px nav dot. Pills appear only on status badges. Images are clipped to their container's radius; full-bleed `#wide` images and opened lightbox images drop to square corners.

**The Scale-Matched Corner Rule.** The bigger the surface, the rounder the corner. A new component picks the radius of the nearest existing surface of its size.

## Components

### Buttons

Friendly and solid: generous padding, a rounded 12px corner, and instant color changes.

- **Shape:** gently rounded (12px).
- **Primary:** Ink fill with Paper text, 20px by 40px padding, 16px bold. In dark mode the resting fill is Highlighter Yellow with Night text.
- **Hover / Focus:** the fill switches to Highlighter Yellow with Ink text (Highlighter Yellow Bright in dark mode) over 0.2s. Color only, with no sliding fills or movement.
- **Accent (default `.button`):** a Highlighter Yellow fill with Ink text.
- **Small / Big:** small tightens the horizontal padding to 24px; big goes full width.

### Chips

- **Style:** Paper Gray fill, uppercase 11px label at weight 500, 4px corners, 8px by 12px padding on post heads (4px by 12px on cards).
- **State:** on hover, post tags switch to a Highlighter Yellow fill with Ink text; card tags switch to Paper Mist.

### Cards / Containers

- **Corner Style:** square-cropped covers with 16px corners on work cards and 8px on article cards.
- **Background:** the cover sits on a Paper Gray placeholder; the caption below has no container.
- **Shadow Strategy:** none at rest; a 6px lift and 4% image zoom on hover (see Elevation & Depth).
- **Caption:** an uppercase 11px label at 60% opacity, then a 24px bold title whose underline fades in on hover (1.5px thickness, 3px offset).
- **Work band:** on the homepage, work cards sit inside a Paper Gray band with 40px corners, inset 32px from the viewport edges.

### Navigation

- **Desktop:** centered 20px bold links with 48px gaps. Hover shows a 6px dot above the label in the link color; the active page shows it in Highlighter Yellow. Dropdowns open on hover or focus into an 8px-cornered panel with the menu-float shadow, where items get a yellow wash (30% opacity on hover, 70% when active).
- **Mobile (1024px and below):** a full-screen popover drawer with a centered 36px title, 24px links that sweep a 2px yellow underline in on hover, and labeled Preferences and Pages sections. The close control is a 36px Paper Gray circle.
- **Preferences:** the theme toggle is a 44px Paper Gray circle with a sun or moon icon. The language switcher uses 44px-tall, 8px-cornered links; the current language gets a Paper Gray fill, a 2px Highlighter Yellow border and a 20px by 3px yellow bar.

### Callouts

A Paper Gray panel (Callout Night in dark mode) with 12px corners, a 6px left rule in the semantic color, an emoji marker at 22px in a 56px left gutter, and the whisper shadow. Code inside a callout gets its own Paper (or Night Panel) background.

### Post Links and Headings

In-article links are weight 500 with a 1px Paper Gray bottom border that turns Highlighter Yellow on hover; the text color stays Ink. Post-title links sweep a 2px yellow underline in from the left. Heading anchors fade in on hover and show a 2px outline on keyboard focus.

### Hero Terminal (signature)

A static Windows Terminal window in One Half Dark: a 38px Terminal Chrome title bar with a tab (Ubuntu icon and label), a new-tab control and window buttons, then a body with 16px by 18px padding in 13px Cascadia Code. It shows a prompt, two commands, and their output as a subgrid listing (type or language, date, linked title) whose rows are at least 24px tall for touch targets. Links get Terminal Blue underlines and focus outlines. The window has 10px corners and the terminal-lift shadow, and on desktop it is centered against the hero text column at a 420px minimum height. It never changes with the site theme.

## Do's and Don'ts

### Do:

- **Do** use Highlighter Yellow as a fill behind Ink (12:1) or as a 2 to 3px underline, border or dot.
- **Do** build depth from Paper Gray and Night Panel layers; keep the 18% shadow for the terminal alone.
- **Do** match corner radius to surface size (4px chips, 8px images, 12px buttons and callouts, 16px cards, 40px bands).
- **Do** set every word in Noto Sans Display; use the local Cascadia stack only for terminal and code.
- **Do** keep reading text in the 780px column at 19px and 1.75 line height.
- **Do** switch off lift, zoom and reveal motion under `prefers-reduced-motion`, and give interactive controls a visible `:focus-visible` outline (2px with a 2px offset).
- **Do** keep touch targets at least 44px for header controls and 24px for inline rows.

### Don't:

- **Don't** add hype or SaaS gloss: no gradients, glows, glassmorphism, neon, or launch-page drama.
- **Don't** introduce a second brand accent; callout colors stay in callouts and status badges.
- **Don't** set Highlighter Yellow as text on Paper or Paper Gray (1.56:1).
- **Don't** theme the terminal or let it read site color tokens.
- **Don't** add resting shadows to cards, sections or buttons.
- **Don't** use sliding or `::before` fill animations on buttons; hover is a plain color change.

### Known drift (found during documentation, 2026-11-18)

- The global `a:hover` sets link text to Highlighter Yellow, which breaks the Highlighter Never Writes Rule in light mode wherever a component doesn't override it.
- `.hero__avatar` hardcodes `#ffc71d` instead of using `var(--brand-color)`.
- `.section__small__title` reads `--text-alt-color-2`, which is never defined.
- In dark mode, 60%-opacity card labels on Night Panel measure about 3.0:1, and the green "updated" badge text on Paper is about 2.6:1; both are below AA.
- `.callout`, `.label-numbered` and the dropdown are styled through the `.dark-mode` class while the tokens switch on `[dark]`; theme.js sets both, but new code should use the tokens.
