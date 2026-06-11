---
name: Customer Insight Dashboard
description: A role-scoped customer operations workspace
colors:
  primary: "#113247"
  accent: "#00d4aa"
  neutral-bg: "#f3f7f8"
  card-bg: "#ffffff"
  border: "#cfd9dd"
  text: "#1e293b"
  text-secondary: "#64748b"
typography:
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: "1.55"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
---

# Design System: Customer Insight Dashboard

## 1. Overview

**Creative North Star: "The Calm Operational Beacon"**

The Customer Insight Dashboard visual system prioritizes speed, clarity, and task-focused dense information. It supports three distinct operational roles (Director, AM, BD) working in ambient daylight or dim environments, needing to parse complex customer risk, growth, and carrier flow signals in seconds.

The aesthetic philosophy rejects gratuitous decoration, glassmorphism, or neon gradients in favor of clean, solid, semantic grids. Spacing is dense but carefully rhythmed, utilizing contrast and color sparingly to direct focus to the next decision.

**Key Characteristics:**
- Restrained color application with a 90% neutral foundation.
- High-contrast typography optimized for rapid scanning of tabular and metric data.
- State-driven micro-interactions with short, snappy transitions (150ms).

## 2. Colors

The color palette character is deeply neutral-heavy, with semantic accents reserved for state changes and specific risk/growth categorization.

### Primary
- **Deep Slate Blue** (#113247 / oklch(27% 0.05 240)): Used for the primary app header, navigation containers, and primary CTA buttons. Establishes the solid structure of the workspace.

### Secondary
- **Mint Emerald** (#00d4aa / oklch(77% 0.17 165)): The core accent color representing security, healthy state indicators, active selections, and positive growth trends.

### Neutral
- **Slate Ash** (#f3f7f8 / oklch(97% 0.005 240)): The secondary neutral layer used for toolbars, side panels, and content backgrounds to frame the primary cards.
- **Pure White** (#ffffff / oklch(100% 0 0)): Used for card surfaces and inputs, ensuring high readability and contrast.
- **Border Grey** (#cfd9dd / oklch(88% 0.005 240)): Standard divider and outline color.

### Named Rules
**The 10% Accent Rule.** The mint accent is restricted to less than 10% of any screen. Its rarity guarantees that active states and critical signals immediately draw focus.

## 3. Typography

**Display Font:** System Sans-serif stack (Inter, Segoe UI)
**Body Font:** System Sans-serif stack (Inter, Segoe UI)

**Character:** A single, clean system sans-serif family is used across all hierarchies to maintain a familiar, native tool feel and optimize performance.

### Hierarchy
- **Title** (Bold, 22px, 1.2): Used for primary panel headers and main card titles.
- **Body** (Regular, 14px, 1.55): Default text. Max line length is capped at 75ch.
- **Label** (Bold, 11px, 0.08em, Uppercase): Used for field labels, status pills, and table headers.

## 4. Elevation

The system is flat-by-default to prevent visual clutter. Depth is conveyed using subtle border-color contrast and tonal layering instead of heavy shadows.

### Shadow Vocabulary
- **Ambient Focus** (`box-shadow: 0 12px 24px rgba(17,50,71,0.12)`): Applied to active modals, login cards, and dropdowns to separate them from the baseline grid.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows and border shifts appear only in response to interaction (hover, active focus).

## 5. Components

Components are compact and consistent to maximize screen density without inducing cognitive overload.

### Buttons
- **Shape:** Rounded corners (8px radius).
- **Primary:** Dark slate background, white text, 10px 20px padding.
- **Hover / Focus:** Deepens background color slightly, transition duration of 150ms.

### Inputs / Fields
- **Style:** Flat background (#f7fafb), subtle border (#cfd9dd), 10px corner radius.
- **Focus:** Changes border color to Deep Slate Blue with a subtle 3px glow.

### Cards
- **Corner Style:** Rounded corners (12px to 16px radius).
- **Background:** Solid white, thin border (#cfd9dd).

### Navigation
- **Style:** Compact top bar or sidebar, active tabs use a flat dark highlight or accent indicator.

## 6. Do's and Don'ts

### Do:
- **Do** use semantic green/orange/red pills to convey customer status rather than decorative icons.
- **Do** align form inputs and headers to the baseline grid layout.
- **Do** keep text labels sentence-cased.

### Don't:
- **Don't** use border-left greater than 1px as a colored stripe on cards or alerts.
- **Don't** use glassmorphic blur effects or decorative gradients on dashboard containers.
- **Don't** wrap widgets in nested cards; keep the container hierarchy flat.
