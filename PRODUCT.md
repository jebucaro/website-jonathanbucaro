# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally (confirmed 2026-11-18). Neither is optimized at the other's expense.

- **Hiring managers and founders** who reach the site through a search engine or an AI assistant, asking things like "who can help me bring AI into my business?" or "who can move our legacy app to a modern stack?". Their job: decide whether Jonathan can take software end to end (business problem, build or modernization, production) and whether to contact him.
- **Fellow developers** who arrive at a blog post, a talk page, or one of his tools (dotnet-gitmoji, banguat, pokecli). Their job: learn something specific, follow a working example, or adopt the tool.

Both audiences read in English or Spanish; LATAM readers often search the English role titles.

## Product Purpose

Jonathan Búcaro's personal site: a findable, verifiable record of who he is, what he builds, and how he thinks. It exists for career resilience, so the right people can find and recommend him if full-time employment ends. It is not a freelance storefront. Success means a person or an AI agent can correctly answer "who is Jonathan Búcaro, what does he do, and what has he shipped?" from the site alone, and that developers find the writing and tools useful on their own terms.

## Positioning

A product engineer who takes software from the business problem to running it in production (including on-call), with the technical depth shown, not summarized. The claims rest on things a reader can inspect: open-source tools he built and decided end to end, talks he gave, and thirteen years of modernizing critical financial systems at Banco G&T Continental, then product engineering for Cognits clients (now HTEC).

## Operating Context

- Readers land mostly on deep pages (posts, work items, talks) from search or AI citations, not on the homepage.
- Machine readers count as much as human ones: JSON-LD Person/WebSite/ProfilePage graph, `BlogPosting`, `CreativeWork`/`SoftwareApplication`, talk `Event`, and `/llms.txt`. Structured data must reflect visible content.
- Bilingual: English default, Spanish at `/es/`, with per-file slugs. Spanish is written, not translated.
- Light and dark color schemes, following the system setting by default.
- Content types: blog posts (2019 to now), work items classified as `Project` or `Talk` (plus the archetype's `Case Study`), each with an optional `artifact` such as `cli-tool`; About page; tags.

## Capabilities and Constraints

- Hugo (extended) static site, layouts and Sass at the repo root, no theme; deployed to Firebase Hosting with PR preview channels.
- Strict CSP: `script-src 'self'` plus `cdn.jsdelivr.net`; every inline script needs its hash in `firebase.json`.
- CI gates: Prettier, markdownlint, Hugo build, CSP hash check, hero check (no image preload, headline-only `<h1>`, terminal listing of the latest work), structured data check, and Nu HTML Checker with errors only.
- Production CSS is inlined in `<head>`; performance (Lighthouse, mobile) is an ongoing priority.
- Planned end-of-2026 redesign will move Sass to `@use`/`@forward`; `sass-embedded` stays on its current major version until then.
- UI strings live in `i18n/`; no hardcoded UI text in layouts (the 404 page is the documented exception).

## Brand Commitments

- Name: Jonathan Búcaro; handle `@jebucaro`. Lead identity "product engineer", formal title "Senior Software Engineer" kept alongside it. Spanish copy keeps the English role names.
- Findable, not selling: no "hire me", availability, or freelance language anywhere. The "Get in Touch" contact link is fine.
- No inflated titles (for example "forward deployed engineer") and no invented product decisions. Product-engineer claims rest on his own tools (dotnet-gitmoji, banguat, pokecli) and on scoping client requirements and proposals at Cognits.
- Voice: first person, plain, no hype. No em dashes in prose; use commas. Spanish uses Guatemalan tú, personal but measured.
- "Planeswalker" (Magic: The Gathering) appears only as a personal closing line on the About page, never in taglines.
- Assets: `/images/logo.png`, `/images/profile.webp`.

## Evidence on Hand

- Work: `content/work/dotnet-gitmoji/` (Project, cli-tool), `content/work/ai-native-clis-with-skills/` (Talk, AWS Community Day Guatemala 2026, sold out, repo `jebucaro/pokecli`).
- Homepage terminal repos: dotnet-gitmoji, banguat, pokecli (`params.en.yaml` → `terminal_repos`).
- About page photos and recognitions: G&T Continental Top Talent 2022-2023, Cognits "Passion to Grow" 2024 Q2, becoming full-time at Cognits 2025 (`content/about/images/`).
- Blog posts from 2019 to 2026 (`content/blog/`), plus certifications (Scrum Master, Scrum Product Owner, AWS Cloud Practitioner).
- Profiles: GitHub, LinkedIn, NuGet, dev.to, Tiny Tool Town.
- **Absent, must not be fabricated:** testimonials (the `testimonial_item` entries in `params.yaml` are theme placeholders and the section is disabled), client logos or names beyond those stated on the About page, metrics, and case studies of client systems that haven't been written.

## Product Principles

1. **Verifiable over impressive.** Every claim points to something a reader can open: a repo, a talk, a post, a named employer.
2. **Depth stays visible.** Product framing sits on top of the engineering detail; it never replaces it.
3. **Serve both readers at once.** A page that convinces a hiring manager should still teach a developer something, and the reverse.
4. **Legible to machines.** Structured data and `/llms.txt` match what is on the page, so search engines and AI assistants describe him accurately.
5. **Two languages, one voice.** Spanish and English are equal citizens, each written natively.

## Accessibility & Inclusion

WCAG 2.2 AA in both color schemes and both languages: contrast, full keyboard operation, visible focus, respect for `prefers-reduced-motion`, and correct `lang` attributes.
