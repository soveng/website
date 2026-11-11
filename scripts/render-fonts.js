// Discover font styles alongside the site CSS instead of through a blocking @import.
export function renderFonts() {
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&amp;family=EB+Garamond:ital,wght@0,400;1,400&amp;display=swap">`;
}
