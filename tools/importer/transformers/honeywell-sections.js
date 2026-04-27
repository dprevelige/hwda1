/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Honeywell section breaks and section metadata.
 * Inserts <hr> between sections and adds Section Metadata blocks for styled sections.
 * Selectors from page-templates.json, validated against live page structure.
 * Runs in afterTransform only, using payload.template.sections.
 * 7 sections: 6 <hr> breaks needed, 4 Section Metadata blocks (sections with style: dark, dark, grey, dark).
 *
 * Live page structure: main > div.root.responsivegrid > div.aem-Grid > div.responsivegrid > div.aem-Grid
 * The template selectors use "main > div:nth-child(N)" targeting the content grid children.
 * This transformer resolves the content grid container first, then applies nth-child selectors.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

/**
 * Resolves a section selector from the template against the actual DOM.
 * Template selectors use "main > div:nth-child(N)" but the live page nests content
 * inside main > div.root.responsivegrid > div.aem-Grid > div.responsivegrid > div.aem-Grid.
 * This function first tries the selector as-is from element, then falls back to
 * finding the content grid and using the nth-child part relative to it.
 */
function resolveSection(element, selector) {
  // Try direct match first (works if DOM matches cleaned.html structure)
  let el = element.querySelector(selector);
  if (el) return el;

  // Extract nth-child index from selector like "main > div:nth-child(3)"
  const match = selector.match(/div:nth-child\((\d+)\)/);
  if (!match) return null;

  // Find the content grid container (live page structure)
  // Path: main > div.root.responsivegrid > div.aem-Grid > div.responsivegrid.aem-GridColumn > div.aem-Grid
  const contentGrid = element.querySelector(
    'div.root.responsivegrid > div.aem-Grid > div.responsivegrid.aem-GridColumn > div.aem-Grid'
  );
  if (contentGrid) {
    el = contentGrid.querySelector(`:scope > div:nth-child(${match[1]})`);
    if (el) return el;
  }

  // Fallback: try from document with full path
  const doc = element.ownerDocument || document;
  el = doc.querySelector(`main > div.root.responsivegrid > div.aem-Grid > div.responsivegrid.aem-GridColumn > div.aem-Grid > div:nth-child(${match[1]})`);
  return el;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    const doc = element.ownerDocument || document;

    // Process sections in reverse order to avoid shifting indices
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionEl = resolveSection(element, section.selector);
      if (!sectionEl) continue;

      // Add Section Metadata block after the section element if it has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Insert <hr> before the section element (except for the first section)
      if (i > 0) {
        const hr = doc.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
