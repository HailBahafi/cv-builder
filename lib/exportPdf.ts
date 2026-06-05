/**
 * Builds an ATS-friendly, single-column PDF with a REAL text layer using jsPDF
 * text primitives (not html2canvas rasterization). The resulting PDF has
 * selectable, extractable text so Applicant Tracking Systems can parse it.
 *
 * Note: jsPDF's built-in fonts are Latin-only and do not shape Arabic, so this
 * exporter targets Latin-script CVs. For Arabic, use the DOCX export, which
 * Word renders and ATS systems parse correctly.
 */
import { jsPDF } from "jspdf";
import type { Run } from "./cvDocModel";
import { parseCvToDoc } from "./cvDocModel";

const MARGIN = 15; // mm
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;

function runsToText(runs: Run[]): string {
  return runs.map((r) => r.text).join("");
}

function anyBold(runs: Run[]): boolean {
  return runs.length > 0 && runs.every((r) => r.bold);
}

export function buildCvPdfBlob(markdown: string, headlineTitle: string | undefined): Blob {
  const doc = parseCvToDoc(markdown, headlineTitle);
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_H - MARGIN) {
      pdf.addPage();
      y = MARGIN;
    }
  };

  const writeWrapped = (
    text: string,
    opts: { size: number; style?: "normal" | "bold" | "italic"; color?: [number, number, number]; indent?: number; gap?: number; align?: "left" | "center" },
  ) => {
    const { size, style = "normal", color = [34, 34, 34], indent = 0, gap = 1.2, align = "left" } = opts;
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(color[0], color[1], color[2]);
    const lineH = size * 0.3528 * 1.25; // pt -> mm * line spacing
    const maxW = CONTENT_W - indent;
    const lines = pdf.splitTextToSize(text, maxW) as string[];
    for (const line of lines) {
      ensureSpace(lineH);
      if (align === "center") {
        pdf.text(line, PAGE_W / 2, y, { align: "center" });
      } else {
        pdf.text(line, MARGIN + indent, y);
      }
      y += lineH;
    }
    y += gap;
  };

  // Name
  if (doc.name) {
    writeWrapped(doc.name, { size: 20, style: "bold", color: [17, 17, 17], align: "center", gap: 1 });
  }
  // Title
  if (doc.title) {
    writeWrapped(doc.title, { size: 11.5, color: [68, 68, 68], align: "center", gap: 1 });
  }
  // Contacts
  if (doc.contacts.length > 0) {
    writeWrapped(doc.contacts.join("  •  "), { size: 9, color: [85, 85, 85], align: "center", gap: 2.5 });
  }

  for (const section of doc.sections) {
    ensureSpace(10);
    // Section heading + underline
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.setTextColor(30, 30, 30);
    pdf.text(section.heading.toUpperCase(), MARGIN, y);
    y += 1.8;
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.2);
    pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 3.2;

    for (const block of section.blocks) {
      if (block.type === "row") {
        const leftText = runsToText(block.left);
        const rightText = runsToText(block.right);
        const lineH = 10 * 0.3528 * 1.25;
        ensureSpace(lineH);
        pdf.setFontSize(10);
        // left
        pdf.setFont("helvetica", anyBold(block.left) ? "bold" : "normal");
        pdf.setTextColor(17, 17, 17);
        const leftLines = pdf.splitTextToSize(leftText, CONTENT_W * 0.62) as string[];
        pdf.text(leftLines, MARGIN, y);
        // right (same baseline as first left line)
        if (rightText) {
          pdf.setFont("helvetica", block.right.some((r) => r.italic) ? "italic" : "normal");
          pdf.setTextColor(85, 85, 85);
          pdf.text(rightText, PAGE_W - MARGIN, y, { align: "right" });
        }
        y += lineH * leftLines.length + 0.8;
      } else if (block.type === "bullet") {
        const text = runsToText(block.runs);
        const lineH = 10 * 0.3528 * 1.25;
        ensureSpace(lineH);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(51, 51, 51);
        pdf.text("•", MARGIN + 1, y);
        const lines = pdf.splitTextToSize(text, CONTENT_W - 5) as string[];
        lines.forEach((line, i) => {
          ensureSpace(lineH);
          pdf.text(line, MARGIN + 5, y);
          if (i < lines.length - 1) y += lineH;
        });
        y += lineH + 0.6;
      } else {
        writeWrapped(runsToText(block.runs), {
          size: 10,
          style: anyBold(block.runs) ? "bold" : "normal",
          color: [51, 51, 51],
          gap: 1,
        });
      }
    }
  }

  return pdf.output("blob");
}

/** Plain text cover letter -> text-layer PDF (paragraphs only). */
export function buildCoverLetterPdfBlob(content: string): Blob {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN + 4;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(30, 30, 30);
  const lineH = 11 * 0.3528 * 1.45;

  const paragraphs = content.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  for (const para of paragraphs) {
    const clean = para
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/[*_#>`]/g, "")
      .replace(/\s*\n\s*/g, " ")
      .trim();
    if (!clean) continue;
    const lines = pdf.splitTextToSize(clean, CONTENT_W) as string[];
    for (const line of lines) {
      if (y + lineH > PAGE_H - MARGIN) {
        pdf.addPage();
        y = MARGIN + 4;
      }
      pdf.text(line, MARGIN, y);
      y += lineH;
    }
    y += lineH * 0.6;
  }

  return pdf.output("blob");
}
