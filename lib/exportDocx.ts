/**
 * Builds an ATS-friendly, single-column .docx from the CV doc model.
 * DOCX is the most reliably parsed format for Applicant Tracking Systems:
 * real text, standard fonts, no columns, no images.
 */
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";
import type { Run } from "./cvDocModel";
import { parseCvToDoc } from "./cvDocModel";

const FONT = "Calibri";
const RIGHT_TAB = 9020; // ~ A4 width minus 1" margins, in twips

function toRuns(runs: Run[], rtl: boolean, opts?: { color?: string; size?: number }): TextRun[] {
  return runs.map(
    (r) =>
      new TextRun({
        text: r.text,
        bold: r.bold,
        italics: r.italic,
        font: FONT,
        rightToLeft: rtl,
        color: opts?.color,
        size: opts?.size,
      }),
  );
}

export async function buildCvDocxBlob(markdown: string, headlineTitle: string | undefined, language: "ar" | "en"): Promise<Blob> {
  const doc = parseCvToDoc(markdown, headlineTitle);
  const rtl = language === "ar";
  const align = rtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const children: Paragraph[] = [];

  // Name
  if (doc.name) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: rtl,
        spacing: { after: 40 },
        children: [new TextRun({ text: doc.name, bold: true, font: FONT, size: 36, rightToLeft: rtl })],
      }),
    );
  }

  // Role headline
  if (doc.title) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: rtl,
        spacing: { after: 60 },
        children: [new TextRun({ text: doc.title, font: FONT, size: 24, color: "444444", rightToLeft: rtl })],
      }),
    );
  }

  // Contacts (single centered line)
  if (doc.contacts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: rtl,
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: doc.contacts.join("  •  "),
            font: FONT,
            size: 18,
            color: "555555",
            rightToLeft: rtl,
          }),
        ],
      }),
    );
  }

  for (const section of doc.sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: align,
        bidirectional: rtl,
        spacing: { before: 220, after: 60 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999", space: 2 } },
        children: [
          new TextRun({
            text: section.heading.toUpperCase(),
            bold: true,
            font: FONT,
            size: 22,
            color: "222222",
            rightToLeft: rtl,
          }),
        ],
      }),
    );

    for (const block of section.blocks) {
      if (block.type === "row") {
        // left + right on one line via a trailing right-aligned tab stop
        children.push(
          new Paragraph({
            bidirectional: rtl,
            spacing: { after: 20 },
            tabStops: [{ type: rtl ? TabStopType.LEFT : TabStopType.RIGHT, position: RIGHT_TAB }],
            children: [
              ...toRuns(block.left, rtl),
              new TextRun({ text: "\t", font: FONT }),
              ...toRuns(block.right, rtl, { color: "555555" }),
            ],
          }),
        );
      } else if (block.type === "bullet") {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            bidirectional: rtl,
            alignment: align,
            spacing: { after: 20 },
            children: toRuns(block.runs, rtl),
          }),
        );
      } else {
        children.push(
          new Paragraph({
            bidirectional: rtl,
            alignment: align,
            spacing: { after: 40 },
            children: toRuns(block.runs, rtl),
          }),
        );
      }
    }
  }

  const document = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
        children,
      },
    ],
  });

  return Packer.toBlob(document);
}

/** Plain markdown cover letter -> .docx (paragraphs only). */
export async function buildCoverLetterDocxBlob(content: string, language: "ar" | "en"): Promise<Blob> {
  const rtl = language === "ar";
  const align = rtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const paragraphs = content.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  const children: Paragraph[] = [];

  for (const para of paragraphs) {
    const clean = para
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/[*_#>`]/g, "")
      .replace(/\s*\n\s*/g, " ")
      .trim();
    if (!clean) continue;
    children.push(
      new Paragraph({
        alignment: align,
        bidirectional: rtl,
        spacing: { after: 160, line: 320 },
        children: [new TextRun({ text: clean, font: FONT, size: 22, rightToLeft: rtl })],
      }),
    );
  }

  const document = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
        children,
      },
    ],
  });

  return Packer.toBlob(document);
}
