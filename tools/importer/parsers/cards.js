/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards variant.
 * Base block: cards
 * Source: https://www.honeywell.com/us/en
 * Generated: 2026-04-27
 *
 * Extracts card items from Honeywell's grid layout.
 * Each card has an image and text content (category label + description).
 * Produces a Cards block table with one row per card: [image, text content].
 */
export default function parse(element, { document }) {
  // Find all individual card containers within the element.
  // Instance 1 (Mega Trends): cards are div.responsivegrid.bg-transparent children
  // Instance 2 (What's New): cards may be within .filtered-list-component
  let cardItems = Array.from(element.querySelectorAll(':scope .responsivegrid.bg-transparent'));

  // Fallback: if no .responsivegrid.bg-transparent found, try .filtered-list-component items
  // or generic card-like repeating children with images
  if (cardItems.length === 0) {
    cardItems = Array.from(element.querySelectorAll('.filtered-list-component .cmp-image, .filtered-list-component .card, .filtered-list-component > div'));
  }

  // If element itself is a single card (parser called per-card), treat element as the card
  if (cardItems.length === 0) {
    cardItems = [element];
  }

  const cells = [];

  cardItems.forEach((card) => {
    // Extract image: prefer desktop image, fall back to any img
    const desktopImg = card.querySelector('.image_desktop img, .cmp-image img, img');

    // Extract text content
    const textContainer = card.querySelector('.cmp-text, .text .cmp-text');
    const categoryLink = textContainer
      ? textContainer.querySelector('p a, a')
      : card.querySelector('p a, a:not(.cmp-image__link)');
    const description = textContainer
      ? textContainer.querySelector('h6, h5, h4, h3, h2')
      : card.querySelector('h6, h5, h4, h3, h2');

    // Skip cards that have no meaningful content (neither image nor text)
    if (!desktopImg && !categoryLink && !description) return;

    // Build the image cell
    const imageCell = [];
    if (desktopImg) {
      // Create a clean image element preserving src and alt
      const img = document.createElement('img');
      img.src = desktopImg.src || desktopImg.getAttribute('src');
      img.alt = desktopImg.alt || desktopImg.getAttribute('alt') || '';
      imageCell.push(img);
    }

    // Build the text cell with category label + description
    const textCell = [];
    if (categoryLink) {
      // Preserve the link as a paragraph with anchor
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = categoryLink.href || categoryLink.getAttribute('href') || '';
      a.textContent = categoryLink.textContent.trim();
      p.append(a);
      textCell.push(p);
    }
    if (description) {
      // Preserve the heading element with its text content
      const heading = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = description.textContent.trim();
      heading.append(strong);
      textCell.push(heading);
    }

    // Only add the row if we have content in at least one cell
    if (imageCell.length > 0 || textCell.length > 0) {
      cells.push([
        imageCell.length > 0 ? imageCell : '',
        textCell.length > 0 ? textCell : '',
      ]);
    }
  });

  // If no cards were found/extracted, do not create an empty block
  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
