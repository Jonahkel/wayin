# Copilot Instructions (Concise Version)

This is a **Next.js (App Router) website** using **Tailwind CSS** and optional **shadcn/ui components**. Accessibility and responsiveness are top priorities.

## Accessibility Standards

- Must meet **80%+ WCAG 2.1** compliance:
  - Text & readability: 1.4 & 3.1
  - Keyboard & motor: 2.1 & 2.5
- Target **Lighthouse accessibility score 90+**

## Text & Readability

- 4.5:1 contrast minimum
- Scalable typography (rem/em), support 200% zoom
- Text spacing must not break layout
- Avoid color-only cues
- Use clear, readable language

## Navigation & Motor

- Keyboard accessible elements
- Logical tab order
- Strong visible focus (do not remove outlines)
- Minimum 44x44px touch targets
- Avoid hover-only and precise pointer requirements

## Responsive Design

- Mobile-first layout, Tailwind breakpoints
- Adequate spacing for touch targets
- Navigation and keyboard support across all screen sizes
- Avoid layout shifts that reduce accessibility

## Semantic HTML

- Use semantic elements (`header`, `nav`, `main`, `section`, `footer`)
- `<button>` for actions, `<a>` for links
- Proper form labels, alt text for images
- Include “Skip to main content”
- Use ARIA only when necessary

## Modals

- Trap focus, close on Escape, return focus to trigger

**Guideline:** Prioritize accessibility, clarity, and usability over pixel-perfect visuals.
