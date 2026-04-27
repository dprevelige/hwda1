/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns variant.
 * Base block: columns
 * Source: https://www.honeywell.com/us/en
 * Generated: 2026-04-27
 *
 * Handles two layout patterns:
 * 1. Forge Feature: Background image section with text overlay card (h5 + p + CTA),
 *    mapped as two columns: [text content] | [background image]
 * 2. Contact CTA Strip: Side-by-side responsive grid columns, each with title + description + CTA,
 *    mapped as two columns: [col1 content] | [col2 content]
 */
export default function parse(element, { document }) {
  const cells = [];

  // Pattern 1: cmp-section-container-preview-mode with background image
  // This pattern has a background image in inline style and a text card overlay
  const sectionContainer = element.matches('.cmp-section-container-preview-mode')
    ? element
    : element.querySelector('.cmp-section-container-preview-mode');

  if (sectionContainer) {
    // Extract background image from inline style
    const style = sectionContainer.getAttribute('style') || '';
    const bgMatch = style.match(/url\(([^)]+)\)/);

    // Build text content column (heading + description + CTA)
    const textCol = [];
    const heading = sectionContainer.querySelector('.cmp-text h5, .cmp-text h4, .cmp-text h3, .cmp-text h2');
    if (heading) textCol.push(heading);

    const description = sectionContainer.querySelector('.cmp-text p');
    if (description) textCol.push(description);

    const ctaLink = sectionContainer.querySelector('.cmp-call-to-action a');
    if (ctaLink) {
      // Create a proper link element with the anchor text
      const link = document.createElement('a');
      link.href = ctaLink.getAttribute('href') || '';
      const anchorText = ctaLink.querySelector('.anchor-text');
      link.textContent = anchorText ? anchorText.textContent.trim() : ctaLink.textContent.trim();
      textCol.push(link);
    }

    // Build image column from background image
    const imageCol = [];
    if (bgMatch) {
      let imgSrc = bgMatch[1].replace(/^['"]|['"]$/g, '');
      if (imgSrc.startsWith('//')) imgSrc = `https:${imgSrc}`;
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = sectionContainer.getAttribute('alt') || '';
      imageCol.push(img);
    }

    cells.push([textCol, imageCol]);
  } else {
    // Pattern 2: Side-by-side responsive grid columns (e.g., Contact CTA Strip)
    // Look for direct child responsive grid containers that are half-width columns
    const columnContainers = element.querySelectorAll(':scope > .aem-Grid > .responsivegrid[class*="aem-GridColumn--default--6"]');

    if (columnContainers.length >= 2) {
      const row = [];
      columnContainers.forEach((col) => {
        const colContent = [];

        // Extract text content (titles and descriptions)
        const textElements = col.querySelectorAll('.cmp-text p');
        textElements.forEach((p) => {
          colContent.push(p);
        });

        // Extract CTA link
        const colCta = col.querySelector('.cmp-call-to-action a');
        if (colCta) {
          const link = document.createElement('a');
          link.href = colCta.getAttribute('href') || '';
          const anchorText = colCta.querySelector('.anchor-text');
          link.textContent = anchorText ? anchorText.textContent.trim() : colCta.textContent.trim();
          colContent.push(link);
        }

        row.push(colContent);
      });
      cells.push(row);
    } else {
      // Fallback: treat entire element content as a single column
      const allText = element.querySelectorAll('.cmp-text p, .cmp-text h1, .cmp-text h2, .cmp-text h3, .cmp-text h4, .cmp-text h5, .cmp-text h6');
      const allCtas = element.querySelectorAll('.cmp-call-to-action a');
      const content = [];
      allText.forEach((el) => content.push(el));
      allCtas.forEach((a) => {
        const link = document.createElement('a');
        link.href = a.getAttribute('href') || '';
        const anchorText = a.querySelector('.anchor-text');
        link.textContent = anchorText ? anchorText.textContent.trim() : a.textContent.trim();
        content.push(link);
      });
      cells.push([content]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
