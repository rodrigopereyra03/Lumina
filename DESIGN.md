---
name: Deep Purple Glass
colors:
  surface: '#170f28'
  surface-dim: '#170f28'
  surface-bright: '#3e3550'
  surface-container-lowest: '#110922'
  surface-container-low: '#1f1731'
  surface-container: '#231b35'
  surface-container-high: '#2e2640'
  surface-container-highest: '#39304b'
  on-surface: '#eaddff'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#eaddff'
  inverse-on-surface: '#352c47'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#c6c6c6'
  on-tertiary: '#2f3131'
  tertiary-container: '#909191'
  on-tertiary-container: '#282a2a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#170f28'
  on-background: '#eaddff'
  surface-variant: '#39304b'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The design system is centered on a **Luxury Tech** aesthetic, blending high-end fashion sensibilities with cutting-edge digital craftsmanship. It evokes a moody, sophisticated atmosphere through the use of deep, atmospheric gradients and refined translucency. 

The primary design movement is **Refined Glassmorphism**. Unlike vibrant, high-energy glass styles, this implementation focuses on subtlety, using high-density backdrop blurs and micro-borders to create a sense of physical weight and premium quality. It targets a discerning audience that appreciates minimalist elegance and architectural depth. The emotional response is one of exclusivity, calm, and technological precision.

## Colors
The palette is rooted in the deep shadows of the "Obsidian Purple" spectrum. 

- **Primary (Electric Violet):** Used sparingly for high-intent actions and critical brand touchpoints. It should feel like a concentrated light source rather than a loud neon.
- **Secondary (Cool Blue):** Provides a calming counterpoint to the purple tones, used for informative states and secondary interactive elements.
- **Neutral (Silver & Soft White):** Text and iconography use a range of silvered grays to maintain low-strain legibility against dark backgrounds without the harshness of pure white.
- **Backgrounds:** Utilize deep, vertical gradients starting from a rich midnight purple and descending into near-black obsidian to create infinite depth.

## Typography
This design system utilizes **Inter** for all roles to maintain a systematic and utilitarian clarity that balances the expressive nature of the glass UI. 

Headlines use tighter letter spacing and heavier weights to anchor the page layouts. Display type should feel architectural and commanding. Body text is set with generous line height to ensure maximum readability against translucent, textured backgrounds. Labels are often set in uppercase with increased letter spacing to provide a "metadata" feel, emphasizing the tech-forward nature of the product.

## Layout & Spacing
The layout follows a **Fixed Grid** model for desktop to maintain a cinematic, curated feel typical of high-end e-commerce.

- **Desktop:** A 12-column grid with a 1280px max-width, centered in the viewport. 
- **Rhythm:** An 8px linear scale governs all padding and margins. 
- **Composition:** Use generous whitespace (negative space) to allow the "glass" containers to breathe. Elements should never feel crowded; the goal is an airy, museum-like presentation of products. 
- **Responsibility:** On mobile, the grid collapses to 4 columns with margins reduced to 20px, while backdrop blur density is maintained to keep the material consistency.

## Elevation & Depth
Depth is the cornerstone of this design system. It is achieved through three specific layers:

1.  **The Void (Background):** The deep purple gradient that sits furthest back.
2.  **The Glass (Containers):** Elements use a `backdrop-filter: blur(30px)` and a highly transparent white fill (`rgba(255, 255, 255, 0.05)`). A 1px solid border (`rgba(255, 255, 255, 0.15)`) acts as a "specular highlight" on the edge of the glass.
3.  **The Shadow:** Deep, expansive shadows with low opacity (`rgba(0, 0, 0, 0.5)`) are used to lift glass cards off the background, creating a multi-layered stack.

Avoid traditional solid-color elevations; every surface must maintain some level of translucency to allow the background gradients to bleed through.

## Shapes
The shape language is **Rounded**, using a consistent 0.5rem (8px) base radius. This strikes a balance between the precision of "Sharp" tech aesthetics and the approachability of modern consumer design. 

Large containers like product cards or modals should use `rounded-xl` (1.5rem) to emphasize the "object-like" quality of the glass panels. Buttons and smaller interactive elements should stick to the base `rounded` or `rounded-lg` values to maintain a crisp look.

## Components
- **Buttons:** Primary buttons use a subtle gradient of Primary-to-Secondary with a white inner glow. Secondary buttons are "Ghost" style: transparent with a 1px border and a subtle hover-state backdrop blur.
- **Cards:** The hallmark of the system. They must feature the 30px blur, the 1px highlight border, and a deep outer shadow. Content inside cards should be padded by at least 24px.
- **Inputs:** Fields are dark and recessed, using a slightly darker translucent fill than the cards. On focus, the 1px border should transition to the Primary Electric Violet.
- **Chips/Badges:** Small, pill-shaped elements with a high-contrast silver text. They should have a minimal background blur to distinguish them from the main glass panels.
- **Lists:** Items are separated by ultra-thin 1px lines (`rgba(255, 255, 255, 0.1)`) rather than heavy blocks, maintaining the lightweight, airy feel of the system.