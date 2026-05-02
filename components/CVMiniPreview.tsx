"use client";

import type { Template } from "@/types";

interface CVMiniPreviewProps {
  template: Template;
}

export default function CVMiniPreview({ template }: CVMiniPreviewProps) {
  const isTwoCol = ["double-column", "high-performer", "stylish"].includes(template.id);

  if (template.id === "executive") {
    return (
      <svg width="100%" viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="150" fill="#ffffff" rx="3" />
        <rect x="8" y="10" width="58" height="5" rx="1" fill={template.header} opacity="0.9" />
        <rect x="8" y="18" width="38" height="2.5" rx="1" fill="#aaa" />
        <rect x="8" y="24" width="100" height="1.2" rx="0.5" fill="#bbb" />
        <rect x="8" y="29" width="104" height="1.5" rx="0.5" fill={template.accent} />
        <rect x="8" y="34" width="20" height="2" rx="0.5" fill={template.accent} />
        <rect x="8" y="37" width="104" height="0.5" fill={template.accent} opacity="0.35" />
        <rect x="8" y="40" width="100" height="1.5" rx="0.5" fill="#e2e2e2" />
        <rect x="8" y="43" width="85" height="1.5" rx="0.5" fill="#e2e2e2" />
        <rect x="8" y="50" width="24" height="2" rx="0.5" fill={template.accent} />
        <rect x="8" y="53" width="104" height="0.5" fill={template.accent} opacity="0.35" />
        <rect x="8" y="56" width="95" height="1.5" rx="0.5" fill="#e2e2e2" />
        <rect x="8" y="59" width="80" height="1.5" rx="0.5" fill="#e2e2e2" />
        <rect x="8" y="62" width="90" height="1.5" rx="0.5" fill="#e2e2e2" />
        <rect x="8" y="69" width="22" height="2" rx="0.5" fill={template.accent} />
        <rect x="8" y="72" width="104" height="0.5" fill={template.accent} opacity="0.35" />
        <rect x="8" y="75" width="70" height="1.5" rx="0.5" fill="#e2e2e2" />
        <rect x="8" y="78" width="90" height="1.5" rx="0.5" fill="#e2e2e2" />
        <rect x="8" y="81" width="65" height="1.5" rx="0.5" fill="#e2e2e2" />
        <rect x="8" y="88" width="18" height="2" rx="0.5" fill={template.accent} />
        <rect x="8" y="91" width="104" height="0.5" fill={template.accent} opacity="0.35" />
        <rect x="8" y="94" width="88" height="1.5" rx="0.5" fill="#e2e2e2" />
        <rect x="8" y="97" width="75" height="1.5" rx="0.5" fill="#e2e2e2" />
      </svg>
    );
  }

  return (
    <svg width="100%" viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="150" fill="#ffffff" rx="3" />
      {isTwoCol && <rect x="0" y="0" width="40" height="150" fill="#f4f4f8" />}
      <rect x="0" y="0" width="120" height="28" fill={template.header} />
      <rect x="8" y="8" width="45" height="4" rx="1" fill="rgba(255,255,255,0.9)" />
      <rect x="8" y="17" width="30" height="2.5" rx="1" fill="rgba(255,255,255,0.5)" />
      {template.id === "timeline" && (
        <>
          <circle cx="14" cy="55" r="3" fill={template.accent} opacity="0.3" />
          <circle cx="14" cy="55" r="1.5" fill={template.accent} />
          <line x1="14" y1="58" x2="14" y2="78" stroke={template.accent} strokeWidth="1" opacity="0.25" />
          <circle cx="14" cy="81" r="3" fill={template.accent} opacity="0.3" />
          <circle cx="14" cy="81" r="1.5" fill={template.accent} />
        </>
      )}
      {!isTwoCol ? (
        <>
          <rect x="8" y="35" width="18" height="2" rx="0.5" fill={template.accent} />
          <rect x="8" y="40" width="104" height="1.5" rx="0.5" fill="#e2e2e2" />
          <rect x="8" y="43" width="90" height="1.5" rx="0.5" fill="#e2e2e2" />
          <rect x="8" y="46" width="75" height="1.5" rx="0.5" fill="#e2e2e2" />
          <rect x="8" y="54" width="18" height="2" rx="0.5" fill={template.accent} />
          <rect x="8" y="59" width="104" height="1.5" rx="0.5" fill="#e2e2e2" />
          <rect x="8" y="62" width="88" height="1.5" rx="0.5" fill="#e2e2e2" />
          <rect x="8" y="65" width="70" height="1.5" rx="0.5" fill="#e2e2e2" />
          <rect x="8" y="73" width="18" height="2" rx="0.5" fill={template.accent} />
          <rect x="8" y="78" width="100" height="1.5" rx="0.5" fill="#e2e2e2" />
          <rect x="8" y="81" width="85" height="1.5" rx="0.5" fill="#e2e2e2" />
        </>
      ) : (
        <>
          <rect x="44" y="33" width="16" height="2" rx="0.5" fill={template.accent} />
          <rect x="44" y="38" width="70" height="1.5" rx="0.5" fill="#e2e2e2" />
          <rect x="44" y="41" width="60" height="1.5" rx="0.5" fill="#e2e2e2" />
          <rect x="44" y="44" width="50" height="1.5" rx="0.5" fill="#e2e2e2" />
          <rect x="44" y="52" width="16" height="2" rx="0.5" fill={template.accent} />
          <rect x="44" y="57" width="68" height="1.5" rx="0.5" fill="#e2e2e2" />
          <rect x="44" y="60" width="55" height="1.5" rx="0.5" fill="#e2e2e2" />
          <rect x="5" y="33" width="30" height="2" rx="0.5" fill={template.accent} />
          <rect x="5" y="38" width="30" height="1.5" rx="0.5" fill="#d0d0d0" />
          <rect x="5" y="41" width="25" height="1.5" rx="0.5" fill="#d0d0d0" />
          <rect x="5" y="48" width="18" height="1.5" rx="0.5" fill={template.accent} opacity="0.6" />
          <rect x="5" y="51" width="30" height="1.5" rx="0.5" fill="#d0d0d0" />
          <rect x="5" y="54" width="22" height="1.5" rx="0.5" fill="#d0d0d0" />
        </>
      )}
    </svg>
  );
}
