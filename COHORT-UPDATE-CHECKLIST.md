# SEC Cohort Update Checklist

## Configuration Changes

### `/src/config/config.json`
- Line 46: Update `meta_image` if using cohort-specific OG image
- Line 47: Update `meta_description` project list

## Content Updates

### `/src/data/website-content.md`
- Line 36: Replace "Applications for SEC-XX are now closed" → "Applications for SEC-YY will open in [DATE]"

### `/src/content/sections/call-to-action.md`
- Line 3: Update title "SEC-XX Announcement Coming Soon.." → "SEC-YY Announcement Coming Soon.."
- Line 5: Remove previous cohort report link or update text
- Line 9: Update form URL `https://sovereignengineering.typeform.com/SEC-XX` → `SEC-YY`
- Line 10: Update dates "SEC-XX will commence in [DATE]" → "SEC-YY will commence in [DATE]"

### `/src/content/faq/-index.md`
- Search and replace all "SEC-XX" → "SEC-YY"
- Update dates in answers
- Update "Applications for SEC-XX are now closed" → "Applications for SEC-YY will open [DATE]"

## Component Updates

### `/src/layouts/components/ProjectShowcase.astro`
- Line 237-238: Update CTA section cohort number
- Line 45: Update comment if needed (currently shows "SEC-01, SEC-02, SEC-03 .. SEC-XX")

## Image Updates

### Social Media Preview
- Replace `/public/images/og-image.png` with new cohort image OR generic branding

### Cohort-Specific Assets
- Keep previous cohort swag images (historical record)
- Add new cohort branding if available

## README Updates

### `/README.md`
- Update to show previous cohort as concluded
- Add link to previous cohort report
- Update current cohort status

## Global Search & Replace

Run these searches across entire codebase:
- "SEC-XX" → "SEC-YY" (excluding swag/historical references)
- Previous cohort dates → New cohort dates
- Application status updates

## Verification Steps

- Check social media preview shows correct cohort
- Verify all forms point to correct typeform
- Confirm FAQ reflects new cohort info
- Test that CTA shows proper messaging

feat: SEC-05 > SEC-06 leftovers & add cohort update checklist for future transitions.
  - Note: social media preview image still shows SEC-05