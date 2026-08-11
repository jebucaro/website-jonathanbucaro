## Purpose

Present the technology stack as approachable capability cards so visitors can understand the client outcomes supported by each technology.

## ADDED Requirements

### Requirement: Grouped technology capability presentation

The home page SHALL present enabled technologies in the three capability groups Backend & Integrations, Web Applications, and Automation, APIs & Content. Each technology SHALL appear in exactly one group and retain its recognizable technology logo and name.

#### Scenario: Visitor views the technology section

- **WHEN** a visitor reaches the home page technology section
- **THEN** the visitor sees the three capability groups and the technologies assigned to each group

#### Scenario: Technology identity is displayed

- **WHEN** a technology card is rendered
- **THEN** its technology name and logo are available to the visitor

### Requirement: Client-outcome descriptions

Each technology card SHALL provide a concise description of the client outcome it supports rather than a framework feature list or technical proficiency claim.

#### Scenario: Visitor reads a technology card

- **WHEN** a visitor accesses a technology card's details
- **THEN** the description explains a deliverable or business-facing outcome supported by that technology

### Requirement: Accessible responsive card details

Technology-card details SHALL be discoverable through pointer hover and keyboard focus on devices that support them. On touch-sized layouts, the technology name and client-outcome description SHALL remain visible without requiring hover. All interactions SHALL remain usable in the configured light and dark color schemes and respect reduced-motion preferences.

#### Scenario: Keyboard user accesses card details

- **WHEN** a keyboard user moves focus to a technology card
- **THEN** the card presents its client-outcome description with a visible focus indication

#### Scenario: Touch visitor views the technology section

- **WHEN** a visitor uses a touch-sized layout
- **THEN** every card displays its technology name and client-outcome description without a hover action

#### Scenario: Visitor prefers reduced motion

- **WHEN** a visitor has enabled reduced-motion preferences
- **THEN** technology-card state changes occur without animated movement
