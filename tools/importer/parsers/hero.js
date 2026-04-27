/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero variant.
 * Base block: hero
 * Source: https://www.honeywell.com/us/en
 * Selector: main > div:nth-child(3) .cmp-section-container-preview-mode
 * Generated: 2026-04-27
 *
 * Target table structure (from block library):
 *   Row 1: background image
 *   Row 2: content cell (heading, subheading/description, CTA links)
 *
 * Source structure:
 *   - Background image is in inline style on .cmp-section-container-preview-mode
 *   - Heading: h1 inside .cmp-text
 *   - Description: p.desc inside .cmp-text
 *   - CTA: a inside .cmp-call-to-action
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Row 1: Background image ---
  // Background image is set via inline style on the element itself or a child container.
  // Extract the URL from the style attribute and create an img element.
  const bgContainer = element.matches('.cmp-section-container-preview-mode')
    ? element
    : element.querySelector('.cmp-section-container-preview-mode, [style*="background"]');

  if (bgContainer) {
    const styleAttr = bgContainer.getAttribute('style') || '';
    const bgMatch = styleAttr.match(/url\(([^)]+)\)/);
    if (bgMatch) {
      let bgUrl = bgMatch[1].replace(/['"]/g, '').trim();
      // Ensure the URL has a protocol
      if (bgUrl.startsWith('//')) {
        bgUrl = `https:${bgUrl}`;
      }
      const img = document.createElement('img');
      img.src = bgUrl;
      img.alt = bgContainer.getAttribute('alt') || '';
      cells.push([img]);
    }
  }

  // --- Row 2: Content cell (heading, description, CTAs) ---
  const contentCell = [];

  // Heading: h1 (or fallback to h2, h3) inside .cmp-text or directly in element
  const heading = element.querySelector('.cmp-text h1, .cmp-text h2, h1, h2');
  if (heading) {
    // Clone heading to clean up inline color styles (not needed in EDS)
    const cleanHeading = heading.cloneNode(true);
    // Remove span wrappers with inline color styles, keeping text content
    const spans = cleanHeading.querySelectorAll('span[style]');
    spans.forEach((span) => {
      while (span.firstChild) {
        span.parentNode.insertBefore(span.firstChild, span);
      }
      span.remove();
    });
    contentCell.push(cleanHeading);
  }

  // Description: p.desc or general paragraph in .cmp-text
  const description = element.querySelector('.cmp-text p.desc, .cmp-text p:not(:empty)');
  if (description) {
    contentCell.push(description);
  }

  // CTA links: from .cmp-call-to-action or fallback to general anchor tags
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-call-to-action a, .cta a, a.cta-primary, a.cta-secondary'),
  );
  // Deduplicate by href to avoid double-selecting
  const seenHrefs = new Set();
  ctaLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && !seenHrefs.has(href)) {
      seenHrefs.add(href);
      // Clean up the link text (remove nested divs like .anchor-text)
      const anchorTextDiv = link.querySelector('.anchor-text');
      if (anchorTextDiv) {
        link.textContent = anchorTextDiv.textContent.trim();
      }
      contentCell.push(link);
    }
  });

  if (contentCell.length > 0) {
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
