# Windows 95 Style Enhancement Plan

## Overview
Enhance the retro design with authentic Windows 95 UI components and improve the overall user experience with better navigation and content organization.

## Task List

### ✅ Phase 1: Asset Management
- [x] Find and copy athens.png from sec-website-bun ✓ Found at /src/assets/athens.png
- [x] Copy hike.png for final CTA section ✓ Already copied
- [x] Verify all required assets are available ✓ apple-guy.png, athens.png, hike.png, ocean.png

### ✅ Phase 2: Windows 95 UI Components
- [x] **Create Windows 95 Checkmark Component**
  - Design retro checkbox with inset border styling
  - Replace FaCheck icons in feature lists
  - Maintain pixelated aesthetic

- [x] **Create Windows 95 Card Component**
  - Design card with characteristic raised border effect
  - Apply to testimonials/quotes sections
  - Include proper shadows and borders

### ✅ Phase 3: Navigation Enhancement
- [x] **Implement Sticky Navigation**
  - Create sticky header that appears after hero section
  - Use intersection observer to detect scroll position
  - Style with Windows 95 aesthetic
  - Ensure smooth transition and proper z-index

### ✅ Phase 4: Content Updates
- [x] **Extract Project Showcase Data**
  - Copy project list from sec-website-bun App.tsx (5 projects: Blossom, Zapstore, Nsite, Tollgate, NIP-60: Nutzaps)
  - Update project showcase section with complete data
  - Maintain existing table layout structure

- [x] **Update Images**
  - Replace "How does it work?" image with athens.png
  - Add hike.png to final CTA section
  - Ensure proper pixelated rendering

- [x] **Fix Final CTA Section**
  - Update button styling to use retro button component
  - Add hike image background or inline image
  - Ensure proper layout and responsiveness

### ✅ Phase 5: Typography Refinements
- [x] **Remove Bold from Headers**
  - Update all h1-h6 styles to remove font-bold
  - Keep "SOVEREIGN ENGINEERING" hero title bold
  - Ensure consistency across all sections

### ✅ Phase 6: Implementation Complete
- [x] Windows 95 checkboxes implemented and working
- [x] Windows 95 cards applied to testimonials  
- [x] Sticky navigation with intersection observer
- [x] Project showcase data from sec-website-bun
- [x] Updated images (athens.png, hike.png, ocean.png, apple-guy.png)
- [x] Fixed CTA button styling
- [x] Removed bold from headers (except hero)

### 📋 Testing Checklist (Ready for Review)
- [ ] Test sticky navigation behavior on scroll
- [ ] Verify Windows 95 components render correctly
- [ ] Check responsive behavior on mobile devices
- [ ] Validate image loading and pixelated rendering
- [ ] Test all button interactions and links

## Implementation Notes

### Windows 95 Styling Patterns
- **Raised borders**: `border-t-white border-l-white border-r-gray-600 border-b-gray-600`
- **Inset borders**: `border-t-gray-600 border-l-gray-600 border-r-white border-b-white`
- **Card shadows**: Subtle gray shadows for depth
- **Checkbox styling**: Small square with checkmark on gray background

### Navigation Implementation
- Use Intersection Observer API for scroll detection
- Sticky positioning with appropriate z-index
- Smooth transitions for show/hide behavior
- Maintain accessibility for keyboard navigation

### File Structure
- Create new components in `src/layouts/components/`
- Update existing partials as needed
- Maintain separation of concerns for reusability

## Dependencies
- No new external dependencies required
- Use existing TailwindCSS classes
- Leverage Astro's component system
- Maintain current build process