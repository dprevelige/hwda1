/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Honeywell site-wide cleanup.
 * Removes non-authorable content and cleans up AEM-specific artifacts.
 * All selectors validated against migration-work/cleaned.html from https://www.honeywell.com/us/en
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove empty htmlcontent parbase div (first child of main, line 4 of cleaned.html)
    // Found: <div class="htmlcontent parbase aem-GridColumn aem-GridColumn--default--12">
    WebImporter.DOMUtils.remove(element, ['.htmlcontent.parbase']);

    // Remove AEM Sightly template comments (found throughout cleaned.html as <!-- <sly data-sly-call="..."/> -->)
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT, null, false);
    const comments = [];
    while (walker.nextNode()) {
      comments.push(walker.currentNode);
    }
    comments.forEach((comment) => comment.remove());
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove empty text divs at the bottom of main (lines 3774-3781 of cleaned.html)
    // Found: <div class="text aem-GridColumn aem-GridColumn--default--12"> with no meaningful content
    const textDivs = element.querySelectorAll(':scope > div.text');
    textDivs.forEach((div) => {
      if (!div.textContent.trim()) {
        div.remove();
      }
    });

    // Remove empty accordion icon spans (found in cleaned.html as <span class="accordion__title-icon"></span>)
    WebImporter.DOMUtils.remove(element, ['.accordion__title-icon']);

    // Clean up AEM tracking attributes (found on 15 elements with data-analytics-v2="cta-v2-analytics")
    element.querySelectorAll('[data-analytics-v2]').forEach((el) => {
      el.removeAttribute('data-analytics-v2');
    });

    // Clean up AEM component hook attributes (found on 6 elements with data-cmp-hook-image="link")
    element.querySelectorAll('[data-cmp-hook-image]').forEach((el) => {
      el.removeAttribute('data-cmp-hook-image');
    });
  }
}
