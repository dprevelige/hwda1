var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const cells = [];
    const bgContainer = element.matches(".cmp-section-container-preview-mode") ? element : element.querySelector('.cmp-section-container-preview-mode, [style*="background"]');
    if (bgContainer) {
      const styleAttr = bgContainer.getAttribute("style") || "";
      const bgMatch = styleAttr.match(/url\(([^)]+)\)/);
      if (bgMatch) {
        let bgUrl = bgMatch[1].replace(/['"]/g, "").trim();
        if (bgUrl.startsWith("//")) {
          bgUrl = `https:${bgUrl}`;
        }
        const img = document2.createElement("img");
        img.src = bgUrl;
        img.alt = bgContainer.getAttribute("alt") || "";
        cells.push([img]);
      }
    }
    const contentCell = [];
    const heading = element.querySelector(".cmp-text h1, .cmp-text h2, h1, h2");
    if (heading) {
      const cleanHeading = heading.cloneNode(true);
      const spans = cleanHeading.querySelectorAll("span[style]");
      spans.forEach((span) => {
        while (span.firstChild) {
          span.parentNode.insertBefore(span.firstChild, span);
        }
        span.remove();
      });
      contentCell.push(cleanHeading);
    }
    const description = element.querySelector(".cmp-text p.desc, .cmp-text p:not(:empty)");
    if (description) {
      contentCell.push(description);
    }
    const ctaLinks = Array.from(
      element.querySelectorAll(".cmp-call-to-action a, .cta a, a.cta-primary, a.cta-secondary")
    );
    const seenHrefs = /* @__PURE__ */ new Set();
    ctaLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && !seenHrefs.has(href)) {
        seenHrefs.add(href);
        const anchorTextDiv = link.querySelector(".anchor-text");
        if (anchorTextDiv) {
          link.textContent = anchorTextDiv.textContent.trim();
        }
        contentCell.push(link);
      }
    });
    if (contentCell.length > 0) {
      cells.push(contentCell);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document: document2 }) {
    let cardItems = Array.from(element.querySelectorAll(":scope .responsivegrid.bg-transparent"));
    if (cardItems.length === 0) {
      cardItems = Array.from(element.querySelectorAll(".filtered-list-component .cmp-image, .filtered-list-component .card, .filtered-list-component > div"));
    }
    if (cardItems.length === 0) {
      cardItems = [element];
    }
    const cells = [];
    cardItems.forEach((card) => {
      const desktopImg = card.querySelector(".image_desktop img, .cmp-image img, img");
      const textContainer = card.querySelector(".cmp-text, .text .cmp-text");
      const categoryLink = textContainer ? textContainer.querySelector("p a, a") : card.querySelector("p a, a:not(.cmp-image__link)");
      const description = textContainer ? textContainer.querySelector("h6, h5, h4, h3, h2") : card.querySelector("h6, h5, h4, h3, h2");
      if (!desktopImg && !categoryLink && !description) return;
      const imageCell = [];
      if (desktopImg) {
        const img = document2.createElement("img");
        img.src = desktopImg.src || desktopImg.getAttribute("src");
        img.alt = desktopImg.alt || desktopImg.getAttribute("alt") || "";
        imageCell.push(img);
      }
      const textCell = [];
      if (categoryLink) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = categoryLink.href || categoryLink.getAttribute("href") || "";
        a.textContent = categoryLink.textContent.trim();
        p.append(a);
        textCell.push(p);
      }
      if (description) {
        const heading = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = description.textContent.trim();
        heading.append(strong);
        textCell.push(heading);
      }
      if (imageCell.length > 0 || textCell.length > 0) {
        cells.push([
          imageCell.length > 0 ? imageCell : "",
          textCell.length > 0 ? textCell : ""
        ]);
      }
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs.js
  function parse3(element, { document: document2 }) {
    const tabNav = element.querySelector('ul.nav-tabs, ul[role="tablist"]');
    const tabContentContainer = element.querySelector('.tab-content, [id*="tabs-content"]');
    const cells = [];
    if (tabNav && tabContentContainer) {
      const tabLinks = Array.from(tabNav.querySelectorAll('a[data-leftrail-item], a[data-toggle="tab"]'));
      const tabPanes = Array.from(tabContentContainer.querySelectorAll(":scope > .tab-pane"));
      tabLinks.forEach((tabLink, index) => {
        const label = tabLink.getAttribute("data-leftrail-item") || tabLink.textContent.trim();
        let pane = tabPanes[index];
        if (!pane) {
          const hrefId = tabLink.getAttribute("href");
          if (hrefId && hrefId.startsWith("#")) {
            pane = tabContentContainer.querySelector(`.tab-pane${hrefId}, .tab-pane[id="${hrefId.slice(1)}"]`);
          }
        }
        if (pane) {
          const contentContainer = document2.createElement("div");
          const textElements = Array.from(pane.querySelectorAll(".cmp-text p"));
          textElements.forEach((p) => {
            const text = p.textContent.trim().replace(/ /g, "").trim();
            if (!text || p.querySelector("span.body-xl-bold") || p.querySelector("br[_rte_temp_br]")) return;
            const link = p.querySelector("a[href]");
            if (link) {
              const cleanLink = document2.createElement("a");
              cleanLink.href = link.getAttribute("href");
              cleanLink.textContent = link.textContent.replace(/[➔→►▸]/g, "").trim();
              const linkP = document2.createElement("p");
              linkP.appendChild(cleanLink);
              contentContainer.appendChild(linkP);
            } else {
              const descP = document2.createElement("p");
              descP.textContent = text;
              contentContainer.appendChild(descP);
            }
          });
          cells.push([label, contentContainer]);
        } else {
          cells.push([label, ""]);
        }
      });
    } else {
      const accordionItems = Array.from(element.querySelectorAll(".left-rail-accordion__container"));
      accordionItems.forEach((item) => {
        const titleEl = item.querySelector(".left-rail-accordion__title");
        const label = titleEl ? titleEl.textContent.trim() : "";
        const contentEl = item.querySelector(".left-rail-accordion__content");
        if (contentEl) {
          const contentContainer = document2.createElement("div");
          const textElements = Array.from(contentEl.querySelectorAll(".cmp-text p"));
          textElements.forEach((p) => {
            const text = p.textContent.trim().replace(/ /g, "").trim();
            if (!text || p.querySelector("span.body-xl-bold") || p.querySelector("br[_rte_temp_br]")) return;
            const link = p.querySelector("a[href]");
            if (link) {
              const cleanLink = document2.createElement("a");
              cleanLink.href = link.getAttribute("href");
              cleanLink.textContent = link.textContent.replace(/[➔→►▸]/g, "").trim();
              const linkP = document2.createElement("p");
              linkP.appendChild(cleanLink);
              contentContainer.appendChild(linkP);
            } else {
              const descP = document2.createElement("p");
              descP.textContent = text;
              contentContainer.appendChild(descP);
            }
          });
          cells.push([label, contentContainer]);
        } else {
          cells.push([label, ""]);
        }
      });
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse4(element, { document: document2 }) {
    const cells = [];
    const sectionContainer = element.matches(".cmp-section-container-preview-mode") ? element : element.querySelector(".cmp-section-container-preview-mode");
    if (sectionContainer) {
      const style = sectionContainer.getAttribute("style") || "";
      const bgMatch = style.match(/url\(([^)]+)\)/);
      const textCol = [];
      const heading = sectionContainer.querySelector(".cmp-text h5, .cmp-text h4, .cmp-text h3, .cmp-text h2");
      if (heading) textCol.push(heading);
      const description = sectionContainer.querySelector(".cmp-text p");
      if (description) textCol.push(description);
      const ctaLink = sectionContainer.querySelector(".cmp-call-to-action a");
      if (ctaLink) {
        const link = document2.createElement("a");
        link.href = ctaLink.getAttribute("href") || "";
        const anchorText = ctaLink.querySelector(".anchor-text");
        link.textContent = anchorText ? anchorText.textContent.trim() : ctaLink.textContent.trim();
        textCol.push(link);
      }
      const imageCol = [];
      if (bgMatch) {
        let imgSrc = bgMatch[1].replace(/^['"]|['"]$/g, "");
        if (imgSrc.startsWith("//")) imgSrc = `https:${imgSrc}`;
        const img = document2.createElement("img");
        img.src = imgSrc;
        img.alt = sectionContainer.getAttribute("alt") || "";
        imageCol.push(img);
      }
      cells.push([textCol, imageCol]);
    } else {
      const columnContainers = element.querySelectorAll(':scope > .aem-Grid > .responsivegrid[class*="aem-GridColumn--default--6"]');
      if (columnContainers.length >= 2) {
        const row = [];
        columnContainers.forEach((col) => {
          const colContent = [];
          const textElements = col.querySelectorAll(".cmp-text p");
          textElements.forEach((p) => {
            colContent.push(p);
          });
          const colCta = col.querySelector(".cmp-call-to-action a");
          if (colCta) {
            const link = document2.createElement("a");
            link.href = colCta.getAttribute("href") || "";
            const anchorText = colCta.querySelector(".anchor-text");
            link.textContent = anchorText ? anchorText.textContent.trim() : colCta.textContent.trim();
            colContent.push(link);
          }
          row.push(colContent);
        });
        cells.push(row);
      } else {
        const allText = element.querySelectorAll(".cmp-text p, .cmp-text h1, .cmp-text h2, .cmp-text h3, .cmp-text h4, .cmp-text h5, .cmp-text h6");
        const allCtas = element.querySelectorAll(".cmp-call-to-action a");
        const content = [];
        allText.forEach((el) => content.push(el));
        allCtas.forEach((a) => {
          const link = document2.createElement("a");
          link.href = a.getAttribute("href") || "";
          const anchorText = a.querySelector(".anchor-text");
          link.textContent = anchorText ? anchorText.textContent.trim() : a.textContent.trim();
          content.push(link);
        });
        cells.push([content]);
      }
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/honeywell-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".htmlcontent.parbase"]);
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT, null, false);
      const comments = [];
      while (walker.nextNode()) {
        comments.push(walker.currentNode);
      }
      comments.forEach((comment) => comment.remove());
    }
    if (hookName === TransformHook.afterTransform) {
      const textDivs = element.querySelectorAll(":scope > div.text");
      textDivs.forEach((div) => {
        if (!div.textContent.trim()) {
          div.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, [".accordion__title-icon"]);
      element.querySelectorAll("[data-analytics-v2]").forEach((el) => {
        el.removeAttribute("data-analytics-v2");
      });
      element.querySelectorAll("[data-cmp-hook-image]").forEach((el) => {
        el.removeAttribute("data-cmp-hook-image");
      });
    }
  }

  // tools/importer/transformers/honeywell-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function resolveSection(element, selector) {
    let el = element.querySelector(selector);
    if (el) return el;
    const match = selector.match(/div:nth-child\((\d+)\)/);
    if (!match) return null;
    const contentGrid = element.querySelector(
      "div.root.responsivegrid > div.aem-Grid > div.responsivegrid.aem-GridColumn > div.aem-Grid"
    );
    if (contentGrid) {
      el = contentGrid.querySelector(`:scope > div:nth-child(${match[1]})`);
      if (el) return el;
    }
    const doc = element.ownerDocument || document;
    el = doc.querySelector(`main > div.root.responsivegrid > div.aem-Grid > div.responsivegrid.aem-GridColumn > div.aem-Grid > div:nth-child(${match[1]})`);
    return el;
  }
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const doc = element.ownerDocument || document;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const sectionEl = resolveSection(element, section.selector);
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (i > 0) {
          const hr = doc.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero": parse,
    "cards": parse2,
    "tabs": parse3,
    "columns": parse4
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Honeywell corporate homepage with hero, product categories, news, and promotional content",
    urls: [
      "https://www.honeywell.com/us/en"
    ],
    blocks: [
      {
        name: "hero",
        instances: [
          "main > div:nth-child(3) .cmp-section-container-preview-mode"
        ]
      },
      {
        name: "cards",
        instances: [
          "main > div:nth-child(4) .responsivegrid.bg-transparent",
          "main > div:nth-child(6) .filtered-list-component"
        ]
      },
      {
        name: "tabs",
        instances: [
          ".cmp-leftrail-enhanced"
        ]
      },
      {
        name: "columns",
        instances: [
          "main > div:nth-child(8) .cmp-section-container-preview-mode",
          "main > div:nth-child(9) .cmp-call-to-action"
        ]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Hero Banner",
        selector: "main > div:nth-child(3)",
        style: "dark",
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-2-mega-trends",
        name: "Mega Trends Cards",
        selector: "main > div:nth-child(4)",
        style: null,
        blocks: ["cards"],
        defaultContent: ["main > div:nth-child(4) .sectiontitle h2", "main > div:nth-child(4) .cmp-text h6"]
      },
      {
        id: "section-3-what-we-do",
        name: "What We Do Industries",
        selector: "main > div:nth-child(5)",
        style: "dark",
        blocks: ["tabs"],
        defaultContent: ["main > div:nth-child(5) .sectiontitle h2"]
      },
      {
        id: "section-4-whats-new",
        name: "Whats New News Cards",
        selector: "main > div:nth-child(6)",
        style: null,
        blocks: ["cards"],
        defaultContent: ["main > div:nth-child(6) .sectiontitle h2"]
      },
      {
        id: "section-5-digitalization",
        name: "Industrial Digitalization",
        selector: "main > div:nth-child(7)",
        style: "grey",
        blocks: ["tabs"],
        defaultContent: ["main > div:nth-child(7) .sectiontitle h2", "main > div:nth-child(7) .cmp-text p"]
      },
      {
        id: "section-6-forge",
        name: "Forge Feature",
        selector: "main > div:nth-child(8)",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-7-contact",
        name: "Contact CTA Strip",
        selector: "main > div:nth-child(9)",
        style: "dark",
        blocks: ["columns"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
