# Chatterboxed Design System

## 1. Design direction

Chatterboxed is a consumer messaging application with a privacy-first visual identity.

The design combines dark, restrained surfaces with a playful violet accent and subtle mint details.

The intended experience is:

- **Private:** Calm, understated, and trustworthy.
- **Approachable:** Friendly and expressive without being childish.
- **Consumer-ready:** Polished, cohesive, and comfortable for everyday use.
- **Distinctive:** Recognizable through its color, typography, and interaction patterns.

The application should feel like a messaging product, not a generic SaaS dashboard.

## 2. Component foundation

Chatterboxed uses shadcn/ui with the Maia preset.

Maia is the required preset for the project. Its rounded corners, component styling, and consumer-oriented visual language should be preserved.

The design system customizes Maia through Chatterboxed-specific colors, typography, and interaction rules.

Do not replace Maia with another preset or introduce a competing component library without approval.

### Adding components

Run from `<chatterbox-repo-root>/frontend`:

```bash
npx shadcn@latest add <component>
```

New components should follow the existing Maia configuration and use the application's semantic design tokens.

## 3. Color palette

The primary palette is Midnight Violet.

The dark theme is the default. The light theme uses the same visual identity with appropriately adjusted surfaces, text, and semantic colors.

### Core palette

| Token | Hex | Purpose |
|---|---|---|
| Background | `#101116` | Main dark application background |
| Surface | `#181B24` | Sidebar, conversation list, and panels |
| Elevated surface | `#202431` | Menus, dialogs, and hover states |
| Border | `#303545` | Dividers and component outlines |
| Primary text | `#F1F2F7` | Headings and primary content |
| Secondary text | `#A4A9B8` | Timestamps, descriptions, and metadata |
| Primary accent | `#A78BFA` | Primary actions, active states, and links |
| Accent hover | `#B8A5FF` | Hover state for primary actions |
| Accent pressed | `#8B75E8` | Pressed state for primary actions |
| Accent foreground | `#171321` | Text and icons on violet buttons |
| Success / secure | `#8FDCC4` | Positive status indicators and secure-state UI |
| Pop | `#FF7EB6` | Small, high-energy brand accent (not a state color) |

### Semantic colors

| Token | Hex | Purpose |
|---|---|---|
| Warning | `#F3C879` | Connection issues and pending actions |
| Error | `#FF8585` | Failed messages and destructive actions |
| Info | `#93B8FF` | Informational notices |

Semantic colors communicate application state. They should not be used as arbitrary decoration.

### Brand colors

Violet (primary) and mint (success) are the two anchor colors of the visual identity. Pop pink is the third color, sitting roughly opposite mint on the color wheel. Use it sparingly for moments of energy, such as illustration accents. It is not a semantic color and must never signal state.

## 4. Theme compatibility

Chatterboxed must support dark and light modes from the beginning.

Dark mode is the default, but light mode must be a fully supported and intentional design.

All components must use semantic tokens rather than hardcoded theme-specific colors.

### Dark theme

| Token | Value |
|---|---|
| `background` | `#101116` |
| `foreground` | `#F1F2F7` |
| `card` | `#181B24` |
| `card-foreground` | `#F1F2F7` |
| `popover` | `#202431` |
| `popover-foreground` | `#F1F2F7` |
| `primary` | `#A78BFA` |
| `primary-foreground` | `#171321` |
| `secondary` | `#202431` |
| `secondary-foreground` | `#F1F2F7` |
| `muted` | `#202431` |
| `muted-foreground` | `#A4A9B8` |
| `accent` | `#202431` |
| `accent-foreground` | `#F1F2F7` |
| `border` | `#303545` |
| `input` | `#303545` |
| `ring` | `#A78BFA` |
| `success` | `#8FDCC4` |
| `warning` | `#F3C879` |
| `destructive` | `#FF8585` |
| `info` | `#93B8FF` |
| `pop` | `#FF7EB6` |

### Light theme

| Token | Value |
|---|---|
| `background` | `#F7F7FB` |
| `foreground` | `#20202B` |
| `card` | `#FFFFFF` |
| `card-foreground` | `#20202B` |
| `popover` | `#FFFFFF` |
| `popover-foreground` | `#20202B` |
| `primary` | `#7457D9` |
| `primary-foreground` | `#FFFFFF` |
| `secondary` | `#EFEDF7` |
| `secondary-foreground` | `#30284A` |
| `muted` | `#EFEDF7` |
| `muted-foreground` | `#686779` |
| `accent` | `#EFEDF7` |
| `accent-foreground` | `#30284A` |
| `border` | `#E0DDEB` |
| `input` | `#E0DDEB` |
| `ring` | `#7457D9` |
| `success` | `#287D67` |
| `warning` | `#94621B` |
| `destructive` | `#C23D4B` |
| `info` | `#3A63B8` (provisional) |
| `pop` | `#D6338A` (provisional) |

The light theme retains the Chatterboxed identity while maintaining appropriate contrast and visual hierarchy.

These values are the initial theme specification. They should be validated against the actual components and adjusted if accessibility testing identifies problems.

### Theme implementation

Use the semantic CSS variables expected by shadcn/ui and the existing Maia configuration.

Theme-specific values belong in the theme definitions, not individual components.

Components should reference semantic tokens such as:

```css
background
foreground
card
primary
muted
border
ring
```

Use the project's existing Tailwind and shadcn conventions to access these tokens.

Avoid hardcoded values such as `bg-[#101116]` or `text-[#F1F2F7]` in application components when a semantic token exists.

The theme system must remain extensible so that additional custom themes can be introduced without rewriting components.

## 5. Typography

Typography should be clean, modern, and highly readable.

- Use a sans-serif typeface for the application.
- Establish a clear hierarchy between page titles, conversation titles, message content, and metadata.
- Prioritize readability over decorative typography.
- Use consistent font weights and line heights.
- Keep timestamps, status indicators, and secondary metadata visually subordinate.
- Avoid excessively small text.

The selected typeface should be defined centrally and applied consistently.

## 6. Layout and spacing

The interface should use a consistent spacing scale and clear information hierarchy.

- Use the spacing conventions established by the existing design system.
- Keep the conversation interface visually organized.
- Avoid excessive whitespace that makes the application feel disconnected.
- Use consistent alignment between navigation, conversation lists, and message content.
- Allow layouts to adapt naturally to smaller screens.
- Avoid arbitrary component dimensions when reusable layout rules are appropriate.

## 7. Shape and component styling

Maia's rounded component styling is an intentional part of the Chatterboxed visual identity.

- Prefer rounded corners over sharp, angular components.
- Use consistent radii across related components.
- Keep buttons, inputs, dialogs, and menus visually cohesive.
- Use subtle borders to distinguish surfaces.
- Avoid excessive shadows and decorative outlines.
- Do not introduce a different shape language for individual pages without a clear reason.

The interface should feel soft and approachable without becoming excessively rounded or visually inflated.

## 8. Messaging interface

Conversation readability is the primary interface priority.

### Message bubbles

- Use a restrained distinction between incoming and outgoing messages.
- Keep message content readable and comfortably spaced.
- Use the primary accent sparingly for outgoing messages.
- Preserve clear visual separation between messages and their metadata.
- Avoid excessive bubble decoration or unnecessary gradients.

### Conversation list

- Make active conversations easy to identify.
- Use clear hierarchy for conversation names, previews, and timestamps.
- Use the primary accent for the active conversation state.
- Keep hover and selection states consistent with the rest of the application.

### Message composer

- Make the composer visually distinct from the conversation history.
- Use a comfortable input area with clear focus and disabled states.
- Make the send action easy to identify.
- Provide appropriate feedback for sending, failure, and pending states.

## 9. Privacy and security indicators

Privacy is a core part of the product identity.

- Use mint for positive security and connection indicators.
- Keep encryption information clear and understandable.
- Avoid excessive security badges or decorative lock icons.
- Do not communicate that a conversation is encrypted unless the underlying implementation supports that claim.
- Distinguish encryption status from delivery status and online presence.

Security information should be reassuring and informative, not distracting.

## 10. Interaction and motion

Interactions should feel responsive and intentional.

- Provide clear hover, focus, active, disabled, loading, and error states.
- Use subtle transitions for state changes.
- Avoid excessive animation and distracting motion.
- Respect reduced-motion preferences.
- Ensure keyboard navigation works throughout the application.
- Preserve visible focus indicators.
- Use consistent interaction patterns across components.

Motion should mostly communicate a state change or provide useful feedback. Stylistic, decorative animation is also welcome in moderation, such as the ambient drift of the auth-page illustration. Keep it slow and subtle, limit it to a few elements per screen, never use it to carry meaning, and always disable it for reduced-motion preferences.

## 11. Accessibility

Accessibility is part of the design system, not a final polishing step.

- Maintain sufficient contrast for text and interactive elements.
- Do not rely on color alone to communicate important information.
- Use semantic HTML and accessible component patterns.
- Ensure keyboard navigation and focus management work correctly.
- Support reduced motion.
- Provide clear labels and accessible names for icon-only controls.
- Test both dark and light themes for contrast and readability.

## 12. Design implementation principles

The design system should remain simple and maintainable.

- Prefer existing design tokens and components.
- Avoid introducing arbitrary colors, spacing, radii, or typography values.
- Avoid unnecessary component abstractions.
- Do not introduce additional UI libraries without approval.
- Keep theme definitions centralized.
- Ensure new components support dark and light modes.
- Preserve the ability to introduce additional themes in the future.

The goal is a cohesive, consumer-ready messaging application that can evolve without requiring a complete redesign of its frontend.
