# Lighthouse Report Summary & Recommendations

This document provides a summary of the findings from the `lighthouse.pdf` report and offers recommendations for improving your site's performance, particularly regarding image optimization in Astro.

## Lighthouse Report Summary

It was not possible to parse the full details from the provided PDF report. However, key performance metrics were extracted from a link within the report. The analysis was for a mobile device.

### Performance Metrics

| Metric                         | Value     | Rating            |
| :----------------------------- | :-------- | :---------------- |
| First Contentful Paint (FCP)   | 2.0s      | Needs Improvement |
| Largest Contentful Paint (LCP) | **11.3s** | Poor              |
| Speed Index (SI)               | 2.0s      | Good              |
| Time to Interactive (TTI)      | **11.4s** | Poor              |
| Total Blocking Time (TBT)      | 0ms       | Good              |
| Cumulative Layout Shift (CLS)  | 0         | Good              |

### Analysis

The most critical performance issues are the **Largest Contentful Paint (LCP)** and **Time to Interactive (TTI)**.

- **Largest Contentful Paint (LCP)** of 11.3 seconds is very high. A good LCP score is below 2.5 seconds. This metric marks the point in the page load timeline when the page's main content has likely loaded. A slow LCP means users perceive the page as slow.
- **Time to Interactive (TTI)** of 11.4 seconds is also very high. A good TTI is under 3.8 seconds. TTI measures how long it takes a page to become fully interactive. A long TTI can be frustrating for users as they can see the content but cannot interact with it.

Given the nature of these metrics, it is highly likely that large, unoptimized images are a primary cause of the poor performance scores.

## Recommendations

### Performance Improvements

The main focus should be on improving LCP and TTI. A significant contributor to poor LCP is large images.

### Astro Best Practices for Image Optimization

Your project uses Astro v5, which has a powerful built-in image optimization system (`astro:assets`). To leverage it, you should store images that need optimization inside the `src` directory. The `public` directory should be used for images that do not need optimization or must have a fixed URL. You already have `sharp` installed, which is the default image optimizer for Astro.

**1. Store images in `src/assets`:**
Create a directory like `src/assets/images` and place your images there. This allows Astro to process and optimize them during the build.

**2. Using images in `.astro` files:**
Use the built-in `<Image />` component from `astro:assets`. This component will generate optimized versions of your images.

```astro
---
// src/components/MyComponent.astro
import { Image } from 'astro:assets';
import myImage from '../assets/images/my-image.png';
---

<h2>My Optimized Image</h2>
<Image src={myImage} alt="A description of my image." />
```

You can also specify dimensions and format:

```astro
<Image src={myImage} width={300} format="webp" alt="A description." />
```

**3. Using images in Markdown (`.md`) files:**
Astro automatically optimizes images referenced with the standard Markdown syntax if they are located in the `src` directory.

For example, in `src/pages/posts/my-post.md`:

```markdown
# My Blog Post

Here is an image that will be optimized by Astro:

![An example image](./images/another-image.jpg)
```

In this example, `another-image.jpg` should be located in `src/pages/posts/images/another-image.jpg`. Relative paths are resolved correctly.

By following these best practices, your images will be automatically optimized at build time, which should significantly improve your LCP and overall performance score.
