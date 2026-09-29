/**
 * Extract headings (h2, h3) from HTML and generate slug IDs for TOC and anchor linking.
 * SEO-critical for multi-section blogs.
 */
export type TocItem = { id: string; text: string; level: 2 | 3 };

function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function slugify(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isLikelyHeading(line: string): boolean {
  const plain = line.trim();
  if (!plain) return false;
  if (/^#{1,3}\s+/.test(plain)) return true;
  if (/^\d+[.)]\s+/.test(plain)) return false;
  if (plain.length > 110) return false;
  if (/^[A-Z0-9\s&\-—|:.'’"]+$/.test(plain) && plain.split(/\s+/).length <= 14) return true;
  if (/^[\u{1F300}-\u{1FAFF}]\s+/u.test(plain)) return true;
  if (/[.!?]$/.test(plain) && plain.split(/\s+/).length <= 8) return true;
  if (/^[A-Z][\w\s&'’\-]+[—:-][\w\s&'’\-]+$/.test(plain)) return true;
  if (/:$/.test(plain)) return true;
  if (/^(seo meta|faqs?|what is|why |who is|the leira experience|ready to|meet the|your intimate confidence|introducing leira)/i.test(plain)) return true;
  const words = plain.split(/\s+/).length;
  return words >= 3 && words <= 14;
}

function stripListPrefix(line: string): string {
  return line
    .replace(/^[-*•]\s+/, "")
    .replace(/^[✓✔]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/^[\u{1F300}-\u{1FAFF}]\s+/u, "")
    .trim();
}

function formatInline(text: string): string {
  let out = escapeHtml(text.trim());
  // Markdown-style emphasis from admin content
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/__(.+?)__/g, "<strong>$1</strong>");
  out = out.replace(/\*(.+?)\*/g, "<em>$1</em>");
  out = out.replace(/_(.+?)_/g, "<em>$1</em>");
  return out;
}

function stripTags(text: string): string {
  return decodeHtmlEntities(
    String(text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
  );
}

function looksLikeH2(text: string): boolean {
  const plain = stripTags(text);
  if (!plain) return false;
  // FAQ questions should stay as smaller subheadings, not large section headings.
  if (/[?]$/.test(plain)) return false;
  if (/^\d+[.)]\s+/.test(plain)) return false;
  if (plain.length > 120) return false;
  const words = plain.split(/\s+/).length;
  if (words < 4 || words > 16) return false;
  return /^(what is|why |who is|the leira experience|ready to|meet the|your intimate confidence|introducing leira|where can i buy|faqs?)/i.test(
    plain
  );
}

function looksLikeH3(text: string): boolean {
  const plain = stripTags(text);
  if (!plain) return false;
  // Numbered step titles (…): keep as <p><strong> inside <ol> — see normalizeSegment()
  if (/^\s*\d+[.)]\s/.test(plain)) return false;
  if (/^[✓✔]\s+/.test(plain)) return false;
  if (/^no\s+/i.test(plain)) return false;
  if (plain.length > 90) return false;
  const words = plain.split(/\s+/).length;
  if (words < 2 || words > 12) return false;
  const lower = plain.toLowerCase();
  if (/^[\u{1F300}-\u{1FAFF}]\s+/u.test(plain)) return true;
  if (/^[A-Z0-9][A-Za-z0-9\s&'’\-—:]+$/.test(plain) && !/[.!?]$/.test(plain)) return true;
  if (/^[A-Za-z0-9\s&'’\-]+[—:-][A-Za-z0-9\s&'’\-]+$/.test(plain)) return true;
  if (/^(100%|ph-|edible-grade|gentle |mood uplift|natural odour|natural odor|soothes|cooling|pH-)/i.test(plain))
    return true;
  if (
    lower.includes("botanical") ||
    lower.includes("compromise") ||
    lower.includes("formula") ||
    lower.includes("skin-safe") ||
    lower.includes("cooling sensation") ||
    lower.includes("mood uplift") ||
    lower.includes("mental clarity")
  ) {
    return true;
  }
  // Generic fallback for short standalone section labels in admin content
  if (words <= 10 && plain.length <= 85 && !plain.includes(",")) return true;
  if (words <= 6 && /[.!?]$/.test(plain)) return true;
  return false;
}

function isGoldHeading(text: string): boolean {
  const plain = stripTags(text);
  const lower = plain.toLowerCase();
  if (!plain) return false;
  if (/^[\u{1F300}-\u{1FAFF}]\s+/u.test(plain)) return true; // emoji-led subheading
  // FAQ questions (? ) use tone-blue — see isBlueFaqHeading
  if (
    lower.includes("jasmine") ||
    lower.includes("damask rose") ||
    lower.includes("ylang-ylang") ||
    lower.includes("ylang ylang")
  ) {
    return true;
  }
  return false;
}

/**
 * Blue subheadings (Word convention): FAQ questions + mid-section labels.
 * Keep conservative — do NOT match maroon titles like
 * "Why India's First Intimate Perfume Matters".
 */
function isBlueSubheading(text: string): boolean {
  const plain = stripTags(text).trim();
  if (!plain) return false;
  if (/[?]$/.test(plain)) return true;
  const lower = plain.toLowerCase();
  if (
    lower.startsWith("choosing ingredients") ||
    lower.startsWith("earning the trust") ||
    lower.includes("nature had already perfected")
  ) {
    return true;
  }
  // Short FAQ-style labels without "?" — only Is/Can/Does/Are…
  if (/^(is|can|does|are|will|should)\s+/i.test(plain) && plain.length <= 100) {
    return true;
  }
  return false;
}

function headingToneClass(text: string): string {
  if (isGoldHeading(text)) return ' class="tone-gold"';
  return ' class="tone-blue"';
}

function emphasizeLeadLabelInParagraph(inner: string): string {
  if (!inner) return inner;
  if (/<\s*strong\b/i.test(inner)) return inner;
  return inner.replace(
    /^\s*([A-Za-z][A-Za-z0-9&'’\-\s]{1,42}):\s+/,
    (_m, label) => `<strong>${label}:</strong> `
  );
}

function normalizeParagraphTagsInFragment(fragment: string): string {
  if (!fragment) return fragment;
  return fragment.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (_full, attrs, inner) => {
    const text = stripTags(inner);
    if (!text) return `<p${attrs || ""}>${inner}</p>`;
    if (looksLikeH2(text)) return `<h2>${inner}</h2>`;
    if (looksLikeH3(text)) {
      return `<h3${headingToneClass(text)}>${inner}</h3>`;
    }
    return `<p${attrs || ""}>${emphasizeLeadLabelInParagraph(inner)}</p>`;
  });
}

/** Inside lists, never promote <p> → <h2>/<h3> (short lines become real headings and lose pink step styling). */
function normalizeParagraphTagsNoPromotion(fragment: string): string {
  if (!fragment) return fragment;
  return fragment.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (_full, attrs, inner) => {
    return `<p${attrs || ""}>${emphasizeLeadLabelInParagraph(inner)}</p>`;
  });
}

/**
 * Apply paragraph heuristics outside <ol>/<ul>, but keep list markup unchanged (flat lists).
 */
function normalizeSegment(fragment: string): string {
  if (!fragment) return fragment;
  const listRegex = /<(ol|ul)\b[^>]*>[\s\S]*?<\/\1>/gi;
  const out: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = listRegex.exec(fragment)) !== null) {
    out.push(normalizeParagraphTagsInFragment(fragment.slice(last, m.index)));
    out.push(normalizeParagraphTagsNoPromotion(m[0]));
    last = m.index + m[0].length;
  }
  out.push(normalizeParagraphTagsInFragment(fragment.slice(last)));
  return out.join("");
}

/**
 * Keep <table>...</table> verbatim so <th>/<td> and admin styling are not broken.
 * Paragraph→heading heuristics must not run inside table cells.
 * Also mark FAQ <h3> questions as tone-blue so they don't inherit brand maroon.
 */
function normalizeExistingHtml(rawHtml: string): string {
  if (!rawHtml) return rawHtml;
  const tableRegex = /<table\b[^>]*>[\s\S]*?<\/table>/gi;
  const out: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = tableRegex.exec(rawHtml)) !== null) {
    out.push(normalizeSegment(rawHtml.slice(last, m.index)));
    out.push(m[0]);
    last = m.index + m[0].length;
  }
  out.push(normalizeSegment(rawHtml.slice(last)));
  let html = demoteMisleveledSubheadings(out.join(""));
  html = applyBlueSubheadTones(html);
  return linkifyLeiraDomain(html);
}

/**
 * If a Word blue subheading was pasted as <h2>, demote to <h3>
 * so it stays smaller than maroon section titles.
 */
function demoteMisleveledSubheadings(html: string): string {
  if (!html) return html;
  return html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (full, attrs, inner) => {
    if (!isBlueSubheading(inner)) return full;
    let nextAttrs = String(attrs || "");
    nextAttrs = nextAttrs
      .replace(/\s*class=(["'])(.*?)\1/i, (_m: string, q: string, cls: string) => {
        const cleaned = cls
          .split(/\s+/)
          .filter((c) => c && c !== "tone-gold" && c !== "tone-blue" && c !== "blog-hero-subtitle")
          .concat("tone-blue")
          .join(" ");
        return ` class=${q}${cleaned}${q}`;
      })
      .replace(/\s*style=(["'])(.*?)\1/gi, "");
    if (!/\bclass=/i.test(nextAttrs)) {
      nextAttrs = `${nextAttrs} class="tone-blue"`;
    }
    return `<h3${nextAttrs}>${inner}</h3>`;
  });
}

/** All subheads (h3) default to tone-blue; keep gold / INCI boxes as-is. */
function applyBlueSubheadTones(html: string): string {
  if (!html) return html;
  return html.replace(/<h3([^>]*)>([\s\S]*?)<\/h3>/gi, (full, attrs, inner) => {
    const attrStr = String(attrs || "");
    if (/\b(tone-gold|inci-name)\b/i.test(attrStr)) return full;
    if (isGoldHeading(inner)) return full;

    let nextAttrs = attrStr;
    nextAttrs = nextAttrs
      .replace(/\s*class=(["'])(.*?)\1/i, (_m: string, q: string, cls: string) => {
        const cleaned = cls
          .split(/\s+/)
          .filter((c) => c && c !== "tone-gold" && c !== "tone-blue")
          .concat("tone-blue")
          .join(" ");
        return ` class=${q}${cleaned}${q}`;
      })
      .replace(/\s*style=(["'])(.*?)\1/gi, "");
    if (!/\bclass=/i.test(nextAttrs)) {
      nextAttrs = `${nextAttrs} class="tone-blue"`;
    }
    return `<h3${nextAttrs}>${inner}</h3>`;
  });
}

/** Backlink: turn bare leiraindia.com into https://leiraindia.com */
function linkifyLeiraDomain(html: string): string {
  if (!html) return html;
  const placeholder: string[] = [];
  // Protect existing tags (and already-linked anchors) so we only linkify text nodes
  const withPlaceholders = html.replace(/<[^>]+>/g, (m) => {
    placeholder.push(m);
    return `\u0000TAG${placeholder.length - 1}\u0000`;
  });
  const linked = withPlaceholders.replace(
    /\b((?:https?:\/\/)?(?:www\.)?leiraindia\.com(?:\/[^\s<"']*)?)\b/gi,
    (match) => {
      const href = /^https?:\/\//i.test(match)
        ? match
        : `https://${match.replace(/^www\./i, "")}`;
      const label = match.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    }
  );
  return linked.replace(/\u0000TAG(\d+)\u0000/g, (_m, i) => placeholder[Number(i)] || "");
}

const HTMLISH_TAG_RE =
  /<\s*(p|h1|h2|h3|h4|ul|ol|li|blockquote|br|strong|em|table|thead|tbody|tr|th|td|caption|colgroup|col|div|section|article|hr|figure|figcaption|span|a|img|code|pre)\b/i;

/**
 * Converts plain text blog content into semantic HTML.
 * If content already contains HTML tags, it is returned unchanged.
 */
export function normalizeBlogContent(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  if (HTMLISH_TAG_RE.test(raw)) {
    return normalizeExistingHtml(raw);
  }

  const blocks = raw
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const html: string[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    const single = lines.length === 1 ? lines[0] : "";
    if (single) {
      if (/^###\s+/.test(single)) {
        const content = single.replace(/^###\s+/, "");
        const toneClass = headingToneClass(content);
        html.push(`<h3${toneClass}>${formatInline(content)}</h3>`);
        continue;
      }
      if (/^##\s+/.test(single)) {
        html.push(`<h2>${formatInline(single.replace(/^##\s+/, ""))}</h2>`);
        continue;
      }
      if (/^#\s+/.test(single)) {
        html.push(`<h2>${formatInline(single.replace(/^#\s+/, ""))}</h2>`);
        continue;
      }
      if (isLikelyHeading(single)) {
        html.push(`<h2>${formatInline(single.replace(/:$/, ""))}</h2>`);
      } else {
        html.push(`<p>${formatInline(single)}</p>`);
      }
      continue;
    }

    const bulletBlock = lines.every((l) => /^([-*•]\s+|[✓✔]\s+|[\u{1F300}-\u{1FAFF}]\s+)/u.test(l));
    if (bulletBlock) {
      const isCheckList = lines.every((l) => /^[✓✔]\s+/.test(l));
      html.push(
        `<ul${isCheckList ? ' class="check-list"' : ""}>${lines
          .map((line) => `<li>${formatInline(stripListPrefix(line))}</li>`)
          .join("")}</ul>`
      );
      continue;
    }

    const orderedListBlock = lines.every((l) => /^\d+[.)]\s+/.test(l));
    if (orderedListBlock) {
      html.push(
        `<ol>${lines
          .map((line) => `<li>${formatInline(stripListPrefix(line))}</li>`)
          .join("")}</ol>`
      );
      continue;
    }

    const kvBlock = lines.every((l) => l.includes(":") && l.length <= 220);
    if (kvBlock) {
      html.push(
        `<ul>${lines
          .map((line) => {
            const [k, ...rest] = line.split(":");
            const key = formatInline((k || "").trim());
            const val = formatInline(rest.join(":").trim());
            return `<li><strong>${key}:</strong> ${val}</li>`;
          })
          .join("")}</ul>`
      );
      continue;
    }

    if (lines.length >= 2 && isLikelyHeading(lines[0])) {
      const heading = formatInline(lines[0].replace(/:$/, ""));
      const toneClass = headingToneClass(lines[0]);
      const body = lines
        .slice(1)
        .map((line) => `<p>${formatInline(line)}</p>`)
        .join("");
      if (looksLikeH2(lines[0])) {
        html.push(`<h2>${heading}</h2>${body}`);
      } else {
        html.push(`<h3${toneClass}>${heading}</h3>${body}`);
      }
      continue;
    }

    const quoteBlock = lines.every((l) => /^["'“”‘’]/.test(l) || /["'“”‘’]$/.test(l));
    if (quoteBlock) {
      html.push(
        `<blockquote>${lines
          .map((line) => formatInline(line.replace(/^["'“”‘’]+/, "").replace(/["'“”‘’]+$/, "")))
          .join(" ")}</blockquote>`
      );
      continue;
    }

    html.push(lines.map((line) => `<p>${formatInline(line)}</p>`).join(""));
  }

  // Final pass to promote heading-like paragraphs consistently,
  // even when source text has mixed formatting patterns.
  return normalizeExistingHtml(html.join("\n"));
}

export function extractTocFromHtml(html: string): TocItem[] {
  if (!html || typeof html !== "string") return [];
  const toc: TocItem[] = [];
  const regex = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  const seen = new Set<string>();
  while ((m = regex.exec(html)) !== null) {
    const level = parseInt(m[1], 10) as 2 | 3;
    const headingInner = String(m[2] || "");
    const rawText = decodeHtmlEntities(stripTags(headingInner));
    if (!rawText) continue;
    let id = slugify(rawText);
    if (!id) id = `section-${toc.length + 1}`;
    if (seen.has(id)) {
      let n = 1;
      while (seen.has(`${id}-${n}`)) n++;
      id = `${id}-${n}`;
    }
    seen.add(id);
    toc.push({ id, text: rawText, level });
  }
  return toc;
}

/**
 * Inject id attributes into h2/h3 in HTML so TOC links work (document order).
 */
export function injectHeadingIds(html: string, toc: TocItem[]): string {
  if (!html || toc.length === 0) return html;
  let i = 0;
  return html.replace(/<h([23])(\s[^>]*)?>/g, (match, level) => {
    const item = toc[i++];
    if (!item) return match;
    const attrs = (match.match(/\s[^>]*/) || [""])[0];
    if (attrs.includes("id=")) return match;
    return `<h${level} id="${item.id}"${attrs}>`;
  });
}
