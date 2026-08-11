## Context

The Hugo home page currently renders a single flat list from `params.technologies.items`. Each item contains a name and inline SVG and is styled as a 72px icon with a scale-and-fade hover effect. The section already supports responsive sizing and the site exposes light and dark color tokens. See proposal.md and `specs/technology-capability-cards/spec.md` for the motivation and required behavior.

## Goals / Non-Goals

**Goals:**

- Keep technology metadata in the existing site parameters while adding the minimum fields needed for grouping and outcome copy.
- Render semantic capability groups and cards in the Hugo technologies partial.
- Make the default desktop card compact and scannable, with descriptive content revealed by hover or focus.
- Keep all card information visible on touch-sized layouts and honor the existing theme and reduced-motion conventions.

**Non-Goals:**

- Adding links, proficiency ratings, filtering, autoplay, or desktop carousel behavior.
- Changing the home page order, project section, logos section, or technology logos.
- Replacing the existing site color palette or visual design system.

## Decisions

### Extend each technology configuration entry

Add a `group` identifier and an `outcome` string to each existing technology item. The template will render group headings in a defined order and select entries by group.

This keeps the existing inline SVG source and the technology's display metadata together, avoiding a separate data source or duplicated lists. A nested group configuration was considered, but it would require moving all existing SVG entries and make future additions more cumbersome.

### Use semantic non-interactive cards

Render each card as a focusable semantic element containing the inline SVG, name, and outcome. Cards do not navigate anywhere, so a link or button would imply behavior that does not exist. Keyboard focus provides the required non-pointer discovery of the expanded detail state.

The current `title`-only treatment was considered but rejected because native tooltips are inconsistent, unavailable on touch devices, and cannot communicate the outcome copy.

### Reveal detail with CSS and use a mobile-only slider

On devices with hover capability, cards begin as icon-and-name tiles and use `:hover` and `:focus-visible` to reveal the outcome, yellow accent, and a modest lift. At the mobile breakpoint, the outcome remains in normal layout flow and each capability group becomes a one-card `tiny-slider` with touch swipe and dot navigation. The slider is initialized only on mobile and destroyed when the viewport returns to the grid layout.

The site already bundles `tiny-slider`, so the mobile slider adds no dependency and avoids a visible horizontal scrollbar. Flip-card and overlay approaches were rejected because they obscure content and are less usable on touch devices.

### Reuse existing neutral surfaces and design tokens

Cards use existing background, border, heading, and brand-color tokens. They use modest corner radii and shadows, keeping the larger rounded project section visually dominant. Native icon colors remain untouched.

## Risks / Trade-offs

- [Outcome copy makes cards taller and increases section height] -> Keep each description to a single concise client-outcome sentence and use a responsive grid.
- [Browser support for hover differs by input device] -> Treat hover as enhancement only; focus and mobile always expose the content.
- [Mobile slider fails to initialize] -> Keep card content in the server-rendered document and preserve the mobile single-column layout as a functional fallback.
- [Focusable non-control elements can be unexpected] -> Use focus only to reveal equivalent hover content and provide a visible focus treatment; do not attach click behavior.
- [SVG gradient IDs can collide when inline SVGs are repeated] -> Preserve the existing single rendering of each technology and avoid duplicating SVG markup elsewhere in the section.

## Migration Plan

1. Add group and outcome values to every configured technology item.
2. Update the technologies partial and Sass module together.
3. Build the Hugo site and verify desktop hover, keyboard focus, touch-sized layout, light mode, dark mode, and reduced-motion behavior.
4. Roll back by restoring the existing technologies partial, Sass module, and parameter entries; no persisted data or URL changes are involved.
