"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import type { Language } from "@/types";

interface CoverLetterPreviewProps {
  content: string;
  language: Language;
}

function coverLetterMarkdownComponents(): Components {
  return {
    p: ({ children }) => (
      <p
        style={{
          margin: "0 0 1.25rem 0",
          fontSize: "15px",
          lineHeight: 1.78,
          color: "#334155",
        }}
      >
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong style={{ fontWeight: 600, color: "#0f172a" }}>{children}</strong>
    ),
    em: ({ children }) => <em style={{ color: "#475569", fontStyle: "italic" }}>{children}</em>,
    ul: ({ children }) => (
      <ul
        style={{
          margin: "0 0 1.15rem 0",
          paddingInlineStart: "1.35rem",
          listStyleType: "disc",
          fontSize: "15px",
          lineHeight: 1.72,
          color: "#334155",
        }}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        style={{
          margin: "0 0 1.15rem 0",
          paddingInlineStart: "1.35rem",
          fontSize: "15px",
          lineHeight: 1.72,
          color: "#334155",
        }}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => <li style={{ marginBottom: "0.4rem" }}>{children}</li>,
    h1: ({ children }) => (
      <h1
        style={{
          margin: "0 0 1.5rem 0",
          fontSize: "22px",
          fontWeight: 700,
          color: "#0f172a",
          lineHeight: 1.25,
        }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        style={{
          margin: "2rem 0 0.75rem 0",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#4f46e5",
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        style={{
          margin: "1.25rem 0 0.5rem 0",
          fontSize: "16px",
          fontWeight: 600,
          color: "#0f172a",
        }}
      >
        {children}
      </h3>
    ),
    hr: () => (
      <hr
        style={{
          border: "none",
          borderTop: "1px solid #e2e8f0",
          margin: "1.75rem 0",
        }}
      />
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          margin: "0 0 1.25rem 0",
          paddingInlineStart: "1rem",
          borderInlineStart: "3px solid #c7d2fe",
          color: "#475569",
          fontSize: "15px",
          lineHeight: 1.75,
        }}
      >
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        style={{ color: "#4f46e5", textDecoration: "underline", textUnderlineOffset: "2px" }}
      >
        {children}
      </a>
    ),
  };
}

export default function CoverLetterPreview({ content, language }: CoverLetterPreviewProps) {
  const trimmed = content?.trim() ?? "";
  const isRtl = language === "ar";

  if (!trimmed) {
    return (
      <div
        dir={isRtl ? "rtl" : "ltr"}
        lang={language}
        style={{
          padding: "3rem 2rem",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "15px",
        }}
      >
        {language === "ar" ? "لا يوجد خطاب تقديم بعد." : "No cover letter yet."}
      </div>
    );
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      lang={language}
      style={{
        maxWidth: "38rem",
        margin: "0 auto",
        padding: "2.75rem 2.25rem 3.25rem",
        fontFamily: "Georgia, 'Times New Roman', Times, serif",
        background: "#ffffff",
        color: "#1e293b",
      }}
    >
      <ReactMarkdown components={coverLetterMarkdownComponents()}>{trimmed}</ReactMarkdown>
    </div>
  );
}
