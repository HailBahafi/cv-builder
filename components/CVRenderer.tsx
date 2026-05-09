"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import type { Language, Template } from "@/types";
import CVHeader from "./CVHeader";
import { renderContactHeaderChildren } from "./contactHeaderIcons";

const rehypePlugins = [rehypeRaw];

interface CVRendererProps {
  content: string;
  template: Template | null;
  /** When set, replaces the ### headline in the rendered CV header (from AI). */
  headlineTitle?: string;
  /** Document language; Arabic uses RTL layout in preview and PDF. */
  language?: Language;
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
      <ul style={{ margin: "3px 0 6px 0", paddingInlineStart: "16px" }}>{children}</ul>
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

function getHeaderComponents(headlineTitle?: string): Components {
  return {
    h1: ({ children }) => (
      <h1 style={{ margin: "0 0 6px 0", fontSize: "26px", fontWeight: "800", color: "#fff", lineHeight: 1.2 }}>
        {children}
      </h1>
    ),
    h2: () => null,
    h3: ({ children }) =>
      headlineTitle?.trim() ? (
        <CVHeader title={headlineTitle.trim()} tone="onDark" />
      ) : (
        <h3 style={{ margin: "2px 0", fontSize: "13px", fontWeight: "400", color: "rgba(255,255,255,0.82)" }}>
          {children}
        </h3>
      ),
    p: ({ children }) => {
    const iconColor = "rgba(255,255,255,0.88)";
    const textColor = "rgba(255,255,255,0.78)";
    const nodes = renderContactHeaderChildren(
      children,
      iconColor,
      textColor,
      "11.5px",
      "rgba(255,255,255,0.35)",
    );
    return (
      <p
        style={{
          margin: "2px 0",
          fontSize: "11.5px",
          color: textColor,
          lineHeight: 1.6,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          rowGap: 2,
        }}
      >
        {nodes.length > 0 ? nodes : children}
      </p>
    );
  },
  ul: ({ children }) => <ul style={{ listStyle: "none", padding: 0, margin: "4px 0" }}>{children}</ul>,
  li: ({ children }) => (
    <li style={{ display: "inline-block", fontSize: "11px", color: "rgba(255,255,255,0.75)", marginInlineEnd: "14px" }}>
      {children}
    </li>
  ),
  strong: ({ children }) => <strong style={{ color: "#fff", fontWeight: "700" }}>{children}</strong>,
  };
}

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

export default function CVRenderer({ content, template, headlineTitle, language = "en" }: CVRendererProps) {
  const accent = template?.accent ?? "#4f46e5";
  const headerBg = template?.header ?? "#1a1a2e";
  const isTwoCol = TWO_COL_TEMPLATES.includes(template?.id ?? "");
  const isRtl = language === "ar";
  const dir = isRtl ? "rtl" : "ltr";

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
      h3: ({ children }) =>
        headlineTitle?.trim() ? (
          <CVHeader title={headlineTitle.trim()} tone="onLight" />
        ) : (
          <h3 style={{ margin: "2px 0 8px 0", fontSize: "15px", fontWeight: "400", color: "#333", letterSpacing: "0.01em" }}>
            {children}
          </h3>
        ),
      h4: ({ children }) => (
        <h4 style={{ margin: "2px 0 6px 0", fontSize: "14px", fontWeight: "400", color: "#333" }}>{children}</h4>
      ),
      p: ({ children }) => {
        const iconColor = "#666666";
        const textColor = "#555555";
        const nodes = renderContactHeaderChildren(children, iconColor, textColor, "10.5px");
        return (
          <p
            style={{
              margin: "2px 0",
              fontSize: "10.5px",
              color: textColor,
              lineHeight: 1.6,
              textAlign: "center",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              rowGap: 2,
            }}
          >
            {nodes.length > 0 ? nodes : children}
          </p>
        );
      },
      ul: ({ children }) => <ul style={{ listStyle: "none", padding: 0, margin: "2px 0" }}>{children}</ul>,
      li: ({ children }) => (
        <li style={{ display: "inline", fontSize: "10.5px", color: "#555", marginInlineEnd: "8px" }}>{children}</li>
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
          <h2
            style={{
              margin: 0,
              paddingBottom: "10px",
              fontSize: "11px",
              fontWeight: "800",
              color: "#111",
              textTransform: "uppercase",
              letterSpacing: "0.13em",
              lineHeight: 1.35,
            }}
          >
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
        <ul style={{ margin: "4px 0 8px 0", paddingInlineStart: "18px" }}>{children}</ul>
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
      <div dir={dir} lang={language} style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff" }}>
        <div style={{ padding: "32px 36px 16px", textAlign: "center", borderBottom: "1.5px solid #111" }}>
          <ReactMarkdown rehypePlugins={rehypePlugins} components={execHeaderComps}>
            {hasHeader ? header : content.split("\n##")[0]}
          </ReactMarkdown>
        </div>
        <div style={{ padding: "6px 36px 32px" }}>
          <ReactMarkdown rehypePlugins={rehypePlugins} components={execBodyComps}>
            {hasHeader ? body : ""}
          </ReactMarkdown>
        </div>
      </div>
    );
  }
  // ── end Executive Pro ───────────────────────────────────────────────────

  if (!hasHeader) {
    return (
      <div dir={dir} lang={language} style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", padding: "24px" }}>
        <ReactMarkdown rehypePlugins={rehypePlugins} components={makeComponents(accent)}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  if (isTwoCol) {
    const { sidebar, main } = splitSections(body);
    return (
      <div dir={dir} lang={language} style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff" }}>
        <div style={{ background: headerBg, padding: "22px 26px" }}>
          <ReactMarkdown rehypePlugins={rehypePlugins} components={getHeaderComponents(headlineTitle)}>
            {header}
          </ReactMarkdown>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr" }}>
          <div style={{ background: "#f2f2f7", borderInlineEnd: `3px solid ${accent}`, padding: "16px 14px" }}>
            <ReactMarkdown rehypePlugins={rehypePlugins} components={makeComponents(accent)}>
              {sidebar}
            </ReactMarkdown>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <ReactMarkdown rehypePlugins={rehypePlugins} components={makeComponents(accent)}>
              {main || body}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} lang={language} style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff" }}>
      <div style={{ background: headerBg, padding: "22px 26px" }}>
        <ReactMarkdown rehypePlugins={rehypePlugins} components={getHeaderComponents(headlineTitle)}>
          {header}
        </ReactMarkdown>
      </div>
      <div style={{ padding: "16px 24px" }}>
        <ReactMarkdown rehypePlugins={rehypePlugins} components={makeComponents(accent)}>
          {body}
        </ReactMarkdown>
      </div>
    </div>
  );
}
