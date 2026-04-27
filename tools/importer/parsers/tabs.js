/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs variant.
 * Base block: tabs
 * Source: https://www.honeywell.com/us/en
 * Generated: 2026-04-27 (v2)
 *
 * Source structure: .cmp-leftrail-enhanced with ul.nav-tabs for tab labels
 * and .tab-pane divs for tab content. Each tab pane contains a title (body-xl-bold),
 * description paragraph, and CTA link. A mobile accordion (.left-rail-accordion)
 * duplicates the content and should be skipped.
 *
 * Target: Tabs block with 2 columns per row — tab label (col 1), tab content (col 2).
 */
export default function parse(element, { document }) {
  // Try desktop tab structure first (left-rail with nav-tabs)
  const tabNav = element.querySelector('ul.nav-tabs, ul[role="tablist"]');
  const tabContentContainer = element.querySelector('.tab-content, [id*="tabs-content"]');

  const cells = [];

  if (tabNav && tabContentContainer) {
    // Desktop left-rail tab structure
    const tabLinks = Array.from(tabNav.querySelectorAll('a[data-leftrail-item], a[data-toggle="tab"]'));
    const tabPanes = Array.from(tabContentContainer.querySelectorAll(':scope > .tab-pane'));

    tabLinks.forEach((tabLink, index) => {
      // Extract tab label from data attribute or text content
      const label = tabLink.getAttribute('data-leftrail-item') || tabLink.textContent.trim();

      // Find the matching tab pane by index or by href matching the pane id
      let pane = tabPanes[index];
      if (!pane) {
        const hrefId = tabLink.getAttribute('href');
        if (hrefId && hrefId.startsWith('#')) {
          pane = tabContentContainer.querySelector(`.tab-pane${hrefId}, .tab-pane[id="${hrefId.slice(1)}"]`);
        }
      }

      if (pane) {
        // Build content for this tab from the pane
        const contentContainer = document.createElement('div');

        // Extract description text (non-empty paragraphs that are not just whitespace/br)
        const textElements = Array.from(pane.querySelectorAll('.cmp-text p'));
        textElements.forEach((p) => {
          const text = p.textContent.trim().replace(/ /g, '').trim();
          // Skip empty paragraphs, whitespace-only paragraphs, and title paragraphs (body-xl-bold)
          if (!text || p.querySelector('span.body-xl-bold') || p.querySelector('br[_rte_temp_br]')) return;

          // Check if paragraph contains a CTA link
          const link = p.querySelector('a[href]');
          if (link) {
            // Create a clean link element
            const cleanLink = document.createElement('a');
            cleanLink.href = link.getAttribute('href');
            // Clean up the link text (remove arrow symbols)
            cleanLink.textContent = link.textContent.replace(/[➔→►▸]/g, '').trim();
            const linkP = document.createElement('p');
            linkP.appendChild(cleanLink);
            contentContainer.appendChild(linkP);
          } else {
            // Regular description paragraph
            const descP = document.createElement('p');
            descP.textContent = text;
            contentContainer.appendChild(descP);
          }
        });

        cells.push([label, contentContainer]);
      } else {
        // Pane not found, just use the label
        cells.push([label, '']);
      }
    });
  } else {
    // Fallback: try accordion structure (.left-rail-accordion)
    const accordionItems = Array.from(element.querySelectorAll('.left-rail-accordion__container'));

    accordionItems.forEach((item) => {
      const titleEl = item.querySelector('.left-rail-accordion__title');
      const label = titleEl ? titleEl.textContent.trim() : '';
      const contentEl = item.querySelector('.left-rail-accordion__content');

      if (contentEl) {
        const contentContainer = document.createElement('div');

        const textElements = Array.from(contentEl.querySelectorAll('.cmp-text p'));
        textElements.forEach((p) => {
          const text = p.textContent.trim().replace(/ /g, '').trim();
          if (!text || p.querySelector('span.body-xl-bold') || p.querySelector('br[_rte_temp_br]')) return;

          const link = p.querySelector('a[href]');
          if (link) {
            const cleanLink = document.createElement('a');
            cleanLink.href = link.getAttribute('href');
            cleanLink.textContent = link.textContent.replace(/[➔→►▸]/g, '').trim();
            const linkP = document.createElement('p');
            linkP.appendChild(cleanLink);
            contentContainer.appendChild(linkP);
          } else {
            const descP = document.createElement('p');
            descP.textContent = text;
            contentContainer.appendChild(descP);
          }
        });

        cells.push([label, contentContainer]);
      } else {
        cells.push([label, '']);
      }
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
