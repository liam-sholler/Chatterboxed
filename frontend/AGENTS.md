# Chatterboxed Frontend Guidelines

## Project

Chatterboxed is a consumer messaging application with a privacy-first identity and a dark-by-default visual design.

The frontend uses React, TypeScript, Tailwind CSS, and shadcn/ui.

## Design philosophy

Chatterboxed should feel like a polished consumer messaging product: approachable, slightly playful, and trustworthy.

The visual direction combines:
- The restrained, privacy-focused atmosphere of Element.
- The approachable, expressive personality of a consumer messaging application.
- The consistency and usability of a well-maintained design system.

The interface should feel welcoming without becoming childish, and professional without feeling corporate.

## Design priorities

1. Conversation readability and usability come first.
2. Privacy and security should feel reassuring, not intimidating.
3. Use color, typography, spacing, and interaction to establish personality.
4. Keep the interface visually consistent across all pages and components.
5. Prefer familiar interaction patterns over unnecessary novelty.
6. Make the application feel responsive, polished, and consumer-ready.

## Design system

- Use shadcn/ui components as the primary component foundation.
- Always select the Maia preset when initializing or configuring the shadcn design system.
- Maia's rounded corners, component styling, and consumer-oriented appearance are intentional parts of the design direction.
- Follow the design tokens and theme rules in `docs/DESIGN.md`.
- Reuse existing components and design tokens before introducing new ones.
- Do not introduce another component library without approval.

To add a shadcn component, run the following from `<chatterbox-repo-root>/frontend`:

```bash
npx shadcn@latest add <component>
```

Preserve the existing Maia configuration when adding components.

## Theme compatibility

The application must support dark and light modes.

- Dark mode is the default.
- Light mode must remain a fully supported, intentional design.
- All colors must use semantic design tokens rather than hardcoded theme-specific values.
- Components must adapt to the active theme automatically.
- New components must work in both themes.
- Keep the design system extensible for future custom themes.

Do not assume that the current dark palette will be the only palette used by the application.

## Implementation rules

- Use the existing component library and design tokens.
- Do not introduce arbitrary colors, spacing, radii, or typography styles when existing tokens are appropriate.
- Do not hardcode colors directly into components when a semantic token exists.
- Do not introduce gradients or shadows without a clear design purpose.
- Stylistic animation is welcome in moderation. Keep it subtle, limit it to a few elements per screen, and never use it to carry meaning.
- Avoid excessive decoration, unnecessary borders, and visual clutter.
- Preserve keyboard accessibility, visible focus states, and appropriate color contrast.
- Respect reduced-motion preferences.
- Keep components reusable and maintainable.
- Avoid unnecessary abstractions and excessive component fragmentation.

## Before implementing a new page or component

1. Review `DESIGN.md`.
2. Identify existing components and tokens that can be reused.
3. Follow established layout, typography, and interaction patterns.
4. Ensure the implementation supports dark and light modes.
5. Verify accessibility and responsive behavior.
6. Check that the result feels consistent with the Chatterboxed design philosophy.

## Good Hygiene

Review implementations for:
- Incorrect or inconsistent design tokens.
- Unnecessary components or abstractions.
- Broken responsive layouts.
- Inaccessible interactions.
- Theme-specific hardcoded colors.
- Inconsistent component behavior.
- Unnecessary dependencies.

Prefer extending existing patterns over introducing new ones.
