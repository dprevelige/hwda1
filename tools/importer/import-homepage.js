/* eslint-disable */
/* global WebImporter */

import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import tabsParser from './parsers/tabs.js';
import columnsParser from './parsers/columns.js';

import honeywellCleanupTransformer from './transformers/honeywell-cleanup.js';
import honeywellSectionsTransformer from './transformers/honeywell-sections.js';

const parsers = {
  'hero': heroParser,
  'cards': cardsParser,
  'tabs': tabsParser,
  'columns': columnsParser,
};

const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Honeywell corporate homepage with hero, product categories, news, and promotional content',
  urls: [
    'https://www.honeywell.com/us/en',
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        'main > div:nth-child(3) .cmp-section-container-preview-mode',
      ],
    },
    {
      name: 'cards',
      instances: [
        'main > div:nth-child(4) .responsivegrid.bg-transparent',
        'main > div:nth-child(6) .filtered-list-component',
      ],
    },
    {
      name: 'tabs',
      instances: [
        '.cmp-leftrail-enhanced',
      ],
    },
    {
      name: 'columns',
      instances: [
        'main > div:nth-child(8) .cmp-section-container-preview-mode',
        'main > div:nth-child(9) .cmp-call-to-action',
      ],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero Banner',
      selector: 'main > div:nth-child(3)',
      style: 'dark',
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'section-2-mega-trends',
      name: 'Mega Trends Cards',
      selector: 'main > div:nth-child(4)',
      style: null,
      blocks: ['cards'],
      defaultContent: ['main > div:nth-child(4) .sectiontitle h2', 'main > div:nth-child(4) .cmp-text h6'],
    },
    {
      id: 'section-3-what-we-do',
      name: 'What We Do Industries',
      selector: 'main > div:nth-child(5)',
      style: 'dark',
      blocks: ['tabs'],
      defaultContent: ['main > div:nth-child(5) .sectiontitle h2'],
    },
    {
      id: 'section-4-whats-new',
      name: 'Whats New News Cards',
      selector: 'main > div:nth-child(6)',
      style: null,
      blocks: ['cards'],
      defaultContent: ['main > div:nth-child(6) .sectiontitle h2'],
    },
    {
      id: 'section-5-digitalization',
      name: 'Industrial Digitalization',
      selector: 'main > div:nth-child(7)',
      style: 'grey',
      blocks: ['tabs'],
      defaultContent: ['main > div:nth-child(7) .sectiontitle h2', 'main > div:nth-child(7) .cmp-text p'],
    },
    {
      id: 'section-6-forge',
      name: 'Forge Feature',
      selector: 'main > div:nth-child(8)',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'section-7-contact',
      name: 'Contact CTA Strip',
      selector: 'main > div:nth-child(9)',
      style: 'dark',
      blocks: ['columns'],
      defaultContent: [],
    },
  ],
};

const transformers = [
  honeywellCleanupTransformer,
  honeywellSectionsTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
