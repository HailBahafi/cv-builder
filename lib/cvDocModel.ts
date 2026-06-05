/**
 * Parses the generated CV markdown (which mixes Markdown with raw HTML split
 * rows — see lib/cvMarkdownFormat.ts) into a flat, single-column structured
 * model. Both the DOCX exporter (lib/exportDocx.ts) and the text-PDF exporter
 * (lib/exportPdf.ts) build from this model so the downloaded files contain
 * real, selectable text that an ATS can parse — unlike the rasterized
 * html2pdf preview export.
 */

export interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export type Block =
  | { type: "paragraph"; runs: Run[] }
  | { type: "bullet"; runs: Run[] }
  /** Two-sided line: left label + right meta (e.g. Title / Dates, Company / Location). */
  | { type: "row"; left: Run[]; right: Run[] };

export interface Section {
  heading: string;
  blocks: Block[];
}

export interface CvDoc {
  name: string;
  title: string;
  /** Contact items already split on the middle-dot separator. */
  contacts: string[];
  sections: Section[];
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function decodeEntities(s: string): string {
  return s.replace(/&[a-zA-Z#0-9]+;/g, (m) => HTML_ENTITIES[m] ?? m);
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

/** Markdown links -> "text" (drop the URL), then collapse whitespace. */
function stripMarkdownLinks(s: string): string {
  return s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

/** Parses inline **bold** / *italic* (and __ / _) into styled runs. */
export function parseInline(input: string): Run[] {
  const text = stripMarkdownLinks(input);
  const runs: Run[] = [];
  // Tokenize on bold/italic markers.
  const re = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      runs.push({ text: text.slice(last, m.index) });
    }
    if (m[2] !== undefined) {
      runs.push({ text: m[2], bold: true });
    } else if (m[4] !== undefined) {
      runs.push({ text: m[4], italic: true });
    }
    last = re.lastIndex;
  }
  if (last < text.length) {
    runs.push({ text: text.slice(last) });
  }
  return runs.filter((r) => r.text.length > 0);
}

/** Extracts inner text of each top-level <span> in an HTML split-row line. */
function parseRowLine(line: string): { left: Run[]; right: Run[] } | null {
  const spans = [...line.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/gi)];
  if (spans.length === 0) return null;
  const leftHtml = spans[0]?.[1] ?? "";
  const rightHtml = spans[1]?.[1] ?? "";
  const leftBold = /<strong/i.test(leftHtml);
  const rightBold = /<strong/i.test(rightHtml);
  const leftText = stripTags(leftHtml);
  const rightText = stripTags(rightHtml);
  if (!leftText && !rightText) return null;
  return {
    left: leftText ? [{ text: leftText, bold: leftBold }] : [],
    right: rightText ? [{ text: rightText, bold: rightBold, italic: !rightBold }] : [],
  };
}

/**
 * Parses CV markdown into the export model.
 * @param headlineTitle optional override for the ### role headline (from AI extract).
 */
export function parseCvToDoc(markdown: string, headlineTitle?: string): CvDoc {
  const doc: CvDoc = { name: "", title: "", contacts: [], sections: [] };
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  let current: Section | null = null; // null => still in the header region
  let pendingRow: { left: Run[]; right: Run[] } | null = null;

  const flushRow = () => {
    if (pendingRow && current) {
      current.blocks.push({ type: "row", ...pendingRow });
    }
    pendingRow = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushRow();
      continue;
    }

    // Section heading
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      flushRow();
      current = { heading: stripTags(h2[1]).replace(/[#*]/g, "").trim(), blocks: [] };
      doc.sections.push(current);
      continue;
    }

    // Name
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1 && !current) {
      doc.name = stripTags(h1[1]);
      continue;
    }

    // Role headline
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      if (!current) {
        doc.title = headlineTitle?.trim() || stripTags(h3[1]);
      } else {
        // Sub-heading inside a section (e.g. a sub-role) -> bold paragraph.
        current.blocks.push({ type: "paragraph", runs: [{ text: stripTags(h3[1]), bold: true }] });
      }
      continue;
    }

    // Raw HTML split rows (Experience / Education two-line headers)
    if (/^<div/i.test(line) || /<span[^>]*>/i.test(line)) {
      const row = parseRowLine(line);
      if (row) {
        // Two consecutive rows belong to the same entry; keep them as separate
        // rows so left/right alignment is preserved in both exporters.
        if (current) {
          flushRow();
          current.blocks.push({ type: "row", ...row });
        }
        continue;
      }
      // Unknown HTML -> fall through as stripped text below.
    }

    // Bullet
    const bullet = line.match(/^[-*+]\s+(.+)$/);
    if (bullet) {
      flushRow();
      const runs = parseInline(bullet[1]);
      if (current) current.blocks.push({ type: "bullet", runs });
      continue;
    }

    // Horizontal rule -> ignore
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line)) {
      flushRow();
      continue;
    }

    // Plain paragraph / contact line
    flushRow();
    const plain = stripTags(line);
    if (!plain) continue;

    if (!current) {
      // Header region: treat as a contact line, split on middle dot / pipe.
      plain
        .split(/\s*[·|]\s*/)
        .map((p) => stripMarkdownLinks(p).trim())
        .filter(Boolean)
        .forEach((c) => doc.contacts.push(c));
    } else {
      current.blocks.push({ type: "paragraph", runs: parseInline(plain) });
    }
  }

  flushRow();
  if (headlineTitle?.trim()) doc.title = headlineTitle.trim();
  return doc;
}
