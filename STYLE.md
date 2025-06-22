# Style Migration Plan: sec-website-bun → Astro Site

## Overview
This document tracks the migration of visual styles from the new Bun/React design (running on port 3002) to the current Astro site, while preserving the existing content structure and architecture.

## Key Style Differences Identified

### Current Astro Site
- Uses complex TailwindCSS configuration with custom theme system
- Heebo/Signika fonts from Google Fonts  
- Multi-color theme (light/dark mode support)
- Component-based styling architecture

### New Bun Design (Target Style)
- Simple TailwindCSS 4.0 with minimal config
- Times New Roman serif typography
- Red primary color (#ED3238) on black background
- Pixelated image rendering
- 90s-style button effects (inset borders)
- Full-screen hero layout with background blend modes

## Migration Tasks

### ✅ Phase 1: Analysis Complete
- [x] Analyze current Astro site structure and styling approach
- [x] Examine new design files in ../sec-website-bun to understand style differences
- [x] Compare styling systems (current TailwindCSS vs new design approach)
- [x] Identify key visual differences (typography, colors, layout, components)
- [x] Create migration plan for transferring styles while preserving content structure

### ✅ Phase 2: Core Style Updates
- [x] **Update Color Scheme** (src/config/theme.json:3-30)
  - Replace primary color with #ED3238
  - Change body background to black (#000000)
  - Update text colors to white/light variants
  - Preserve dark mode functionality

- [x] **Typography System**
  - Replace Google Fonts with Times New Roman serif stack
  - Update font sizing for larger, bolder headings
  - Maintain responsive text sizing
  - Update Base.astro font loading

### ✅ Phase 3: Visual Effects & Components
- [x] **Visual Effects**
  - Add pixelated image rendering styles
  - Implement 90s-style button components with inset borders
  - Add background blend mode support for hero images

- [x] **Component Styling**
  - Update button styles with retro inset effects
  - Enhance navigation with new visual hierarchy
  - Maintain accessibility and responsive behavior

### ✅ Phase 4: Layout Updates
- [x] **Layout Updates**
  - Convert hero section to full-screen layout
  - Update grid systems for new content arrangement
  - Preserve existing Astro component structure
  - Ensure responsive behavior is maintained

### ✅ Phase 5: Testing & Refinement  
- [x] Navigation removed from hero section for clean full-screen layout
- [x] Background image displaying with correct blend mode
- [x] Black background and white text applied throughout
- [x] Retro button styling implemented and working
- [x] Core style migration complete

### 📋 Remaining Tasks (Optional)
- [ ] Cross-browser testing  
- [ ] Mobile responsiveness verification
- [ ] Accessibility audit
- [ ] Performance impact assessment

## File Locations to Modify

### Core Style Files
- `src/config/theme.json` - Color scheme and typography
- `src/layouts/Base.astro` - Font loading and base layout
- `src/styles/main.css` - Main stylesheet entry point
- `src/styles/base.css` - Base styles
- `src/styles/components.css` - Component styles
- `src/styles/buttons.css` - Button components

### Key Components
- `src/layouts/partials/Header.astro` - Header styling
- `src/layouts/partials/Footer.astro` - Footer styling
- Hero section components in `src/pages/index.astro`

## Design Principles to Maintain
1. **Content Structure**: Keep all existing content and structure intact
2. **Accessibility**: Maintain WCAG compliance
3. **Performance**: Preserve or improve loading performance
4. **Responsive Design**: Ensure mobile-first responsive behavior
5. **SEO**: Maintain existing SEO optimization

## Notes
- The new design uses a bold, retro-modern aesthetic with high contrast
- Button styling mimics 90s software UI with inset border effects
- Typography is intentionally simple with Times New Roman serif
- Images use pixelated rendering for a retro computing feel
- Background blend modes create unique visual effects in the hero section