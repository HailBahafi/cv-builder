"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import type { Template } from "@/types";

interface CVRendererProps {
  content: string;
  template: Template | null;
}

const SIDEBAR_KEYWORDS = [
  "contact", "skills", "languages", "certifications",
  "interests", "references", "links", "tools", "profile",
  "مهارات", "لغات", "اهتمامات", "تواصل", "شهادات",
];

const TWO_COL_TEMPLATES = ["double-column", "high-performer", "stylish"];

function makeComponents(accent: string): Components {
  return {
    h1: ({ children }) => (
      <h1 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "800", color: "#111" }}>{children}</h1>
    ),
    h2: ({ children }) => (
      <div style={{ borderBottom: `2px solid ${accent}`, marginTop: "16px", marginBottom: "6px", paddingBottom: "2px" }}>
        <h2 style={{ margin: 0, fontSize: "10px", fontWeight: "700", color: accent, textTransform: "uppercase", letterSpacing: "0.12em" }}>
          {children}
        </h2>
      </div>
    ),
    h3: ({ children }) => (
      <h3 style={{ margin: "8px 0 1px 0", fontSize: "12px", fontWeight: "700", color: "#111" }}>{children}</h3>
    ),
    p: ({ children }) => (
      <p style={{ margin: "2px 0", fontSize: "11px", color: "#444", lineHeight: "1.5" }}>{children}</p>
    ),
    ul: ({ children }) => (
      <ul style={{ margin: "3px 0 6px 0", paddingLeft: "16px" }}>{children}</ul>
    ),
    li: ({ children }) => (
      <li style={{ fontSize: "11px", color: "#444", lineHeight: "1.6", marginBottom: "1px" }}>{children}</li>
    ),
    strong: ({ children }) => (
      <strong style={{ fontWeight: "700", color: "#111" }}>{children}</strong>
    ),
    em: ({ children }) => <em style={{ color: "#555" }}>{children}</em>,
  };
}

const headerComponents: Components = {
  h1: ({ children }) => (
    <h1 style={{ margin: "0 0 6px 0", fontSize: "26px", fontWeight: "800", color: "#fff", lineHeight: 1.2 }}>
      {children}
    </h1>
  ),
  h2: () => null,
  h3: ({ children }) => (
    <h3 style={{ margin: "2px 0", fontSize: "13px", fontWeight: "400", color: "rgba(255,255,255,0.82)" }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ margin: "2px 0", fontSize: "11.5px", color: "rgba(255,255,255,0.78)" }}>{children}</p>
  ),
  ul: ({ children }) => <ul style={{ listStyle: "none", padding: 0, margin: "4px 0" }}>{children}</ul>,
  li: ({ children }) => (
    <li style={{ display: "inline-block", fontSize: "11px", color: "rgba(255,255,255,0.75)", marginRight: "14px" }}>
      {children}
    </li>
  ),
  strong: ({ children }) => <strong style={{ color: "#fff", fontWeight: "700" }}>{children}</strong>,
};

function splitContent(content: string): { header: string; body: string } {
  const idx = content.indexOf("\n## ");
  if (idx === -1) return { header: "", body: content };
  return { header: content.slice(0, idx), body: content.slice(idx) };
}

function splitSections(body: string): { sidebar: string; main: string } {
  const sections = body.split(/(?=\n##\s)/);
  const sidebar: string[] = [];
  const main: string[] = [];
  sections.forEach((s) => {
    const m = s.match(/\n##\s+(.+)/);
    const title = (m?.[1] ?? "").toLowerCase();
    if (SIDEBAR_KEYWORDS.some((kw) => title.includes(kw))) {
      sidebar.push(s);
    } else {
      main.push(s);
    }
  });
  return { sidebar: sidebar.join(""), main: main.join("") };
}

export default function CVRenderer({ content, template }: CVRendererProps) {
  const accent = template?.accent ?? "#4f46e5";
  const headerBg = template?.header ?? "#1a1a2e";
  const isTwoCol = TWO_COL_TEMPLATES.includes(template?.id ?? "");

  const { header, body } = splitContent(content);
  const hasHeader = header.trim().length > 0;

  // ── Executive Pro template ──────────────────────────────────────────────
  if (template?.id === "executive") {
    const execHeaderComps: Components = {
      h1: ({ children }) => (
        <h1 style={{ margin: "0 0 4px 0", fontSize: "34px", fontWeight: "800", color: "#111", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
          {children}
        </h1>
      ),
      h2: () => null,
      h3: ({ children }) => (
        <h3 style={{ margin: "2px 0 8px 0", fontSize: "15px", fontWeight: "400", color: "#333", letterSpacing: "0.01em" }}>
          {children}
        </h3>
      ),
      h4: ({ children }) => (
        <h4 style={{ margin: "2px 0 6px 0", fontSize: "14px", fontWeight: "400", color: "#333" }}>{children}</h4>
      ),
      p: ({ children }) => (
        <p style={{ margin: "2px 0", fontSize: "10.5px", color: "#555", lineHeight: 1.6 }}>{children}</p>
      ),
      ul: ({ children }) => <ul style={{ listStyle: "none", padding: 0, margin: "2px 0" }}>{children}</ul>,
      li: ({ children }) => (
        <li style={{ display: "inline", fontSize: "10.5px", color: "#555", marginRight: "8px" }}>{children}</li>
      ),
      strong: ({ children }) => <strong style={{ color: "#333", fontWeight: "600" }}>{children}</strong>,
      em: ({ children }) => <em style={{ color: "#555" }}>{children}</em>,
    };

    const execBodyComps: Components = {
      h1: ({ children }) => (
        <h1 style={{ margin: "8px 0 2px 0", fontSize: "14px", fontWeight: "700", color: "#111" }}>{children}</h1>
      ),
      h2: ({ children }) => (
        <div style={{ marginTop: "20px", marginBottom: "6px" }}>
          <h2 style={{ margin: "0 0 4px 0", fontSize: "11px", fontWeight: "800", color: "#111", textTransform: "uppercase", letterSpacing: "0.13em" }}>
            {children}
          </h2>
          <div style={{ height: "1px", background: "#111" }} />
        </div>
      ),
      h3: ({ children }) => (
        <h3 style={{ margin: "10px 0 1px 0", fontSize: "13px", fontWeight: "700", color: "#111" }}>{children}</h3>
      ),
      h4: ({ children }) => (
        <h4 style={{ margin: "8px 0 1px 0", fontSize: "12.5px", fontWeight: "700", color: "#111" }}>{children}</h4>
      ),
      p: ({ children }) => (
        <p style={{ margin: "2px 0", fontSize: "11px", color: "#333", lineHeight: 1.55 }}>{children}</p>
      ),
      ul: ({ children }) => (
        <ul style={{ margin: "4px 0 8px 0", paddingLeft: "18px" }}>{children}</ul>
      ),
      li: ({ children }) => (
        <li style={{ fontSize: "11px", color: "#333", lineHeight: 1.65, marginBottom: "2px" }}>{children}</li>
      ),
      strong: ({ children }) => (
        <strong style={{ fontWeight: "700", color: "#111" }}>{children}</strong>
      ),
      em: ({ children }) => <em style={{ color: "#555", fontStyle: "italic" }}>{children}</em>,
      hr: () => <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "6px 0" }} />,
    };

    return (
      <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff" }}>
        <div style={{ padding: "32px 36px 16px", textAlign: "center", borderBottom: "1.5px solid #111" }}>
          <ReactMarkdown components={execHeaderComps}>
            {hasHeader ? header : content.split("\n##")[0]}
          </ReactMarkdown>
        </div>
        <div style={{ padding: "6px 36px 32px" }}>
          <ReactMarkdown components={execBodyComps}>
            {hasHeader ? body : ""}
          </ReactMarkdown>
        </div>
      </div>
    );
  }
  // ── end Executive Pro ───────────────────────────────────────────────────

  if (!hasHeader) {
    return (
      <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", padding: "24px" }}>
        <ReactMarkdown components={makeComponents(accent)}>{content}</ReactMarkdown>
      </div>
    );
  }

  if (isTwoCol) {
    const { sidebar, main } = splitSections(body);
    return (
      <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff" }}>
        <div style={{ background: headerBg, padding: "22px 26px" }}>
          <ReactMarkdown components={headerComponents}>{header}</ReactMarkdown>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr" }}>
          <div style={{ background: "#f2f2f7", borderRight: `3px solid ${accent}`, padding: "16px 14px" }}>
            <ReactMarkdown components={makeComponents(accent)}>{sidebar}</ReactMarkdown>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <ReactMarkdown components={makeComponents(accent)}>{main || body}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff" }}>
      <div style={{ background: headerBg, padding: "22px 26px" }}>
        <ReactMarkdown components={headerComponents}>{header}</ReactMarkdown>
      </div>
      <div style={{ padding: "16px 24px" }}>
        <ReactMarkdown components={makeComponents(accent)}>{body}</ReactMarkdown>
      </div>
    </div>
  );
}
