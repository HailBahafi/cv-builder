"use client";

import type { CSSProperties } from "react";

type CVHeaderTone = "onLight" | "onDark";

interface CVHeaderProps {
  title: string;
  tone: CVHeaderTone;
}

/** Job headline under the name in the CV document header. */
export default function CVHeader({ title, tone }: CVHeaderProps) {
  const t = title.trim();
  if (!t) return null;

  const style: CSSProperties =
    tone === "onLight"
      ? {
          margin: "2px 0 8px 0",
          fontSize: "15px",
          fontWeight: 400,
          color: "#333",
          letterSpacing: "0.01em",
        }
      : {
          margin: "2px 0",
          fontSize: "13px",
          fontWeight: 400,
          color: "rgba(255,255,255,0.82)",
        };

  return <h3 style={style}>{t}</h3>;
}
