import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

type ContactKind = "phone" | "email" | "linkedin" | "github" | "web" | "location";

const SPLIT_RE = /\s*·\s*/;

function digitCount(s: string): number {
  return (s.match(/\d/g) ?? []).length;
}

export function classifyContactText(raw: string): ContactKind {
  const s = raw.trim();
  if (!s) return "location";
  if (/\S+@\S+\.\S+/.test(s)) return "email";
  if (/linkedin\.com/i.test(s)) return "linkedin";
  if (/github\.com/i.test(s)) return "github";
  const digits = digitCount(s);
  if (digits >= 8 && digits <= 18 && !s.includes("@")) {
    if (/^[+()\d\s.-]+$/.test(s) || /^\+?\d[\d\s().-]+$/.test(s)) return "phone";
  }
  if (/^https?:\/\//i.test(s)) {
    if (/linkedin\.com/i.test(s)) return "linkedin";
    if (/github\.com/i.test(s)) return "github";
    return "web";
  }
  if (/\.(com|net|org|io|dev|app|co|me)\b/i.test(s) && !/\s/.test(s)) return "web";
  return "location";
}

export function classifyContactHref(href: string): ContactKind {
  const h = href.trim().toLowerCase();
  if (h.startsWith("mailto:")) return "email";
  if (h.startsWith("tel:")) return "phone";
  if (/linkedin\.com/.test(h)) return "linkedin";
  if (/github\.com/.test(h)) return "github";
  if (/^https?:\/\//.test(h)) return "web";
  return "location";
}

function IconSvg({ kind, color }: { kind: ContactKind; color: string }) {
  const common = {
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (kind) {
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
      );
    case "email":
      return (
        <svg {...common}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <path d="M22 6l-10 7L2 6" />
        </svg>
      );
    case "linkedin":
      return (
        <svg width={12} height={12} viewBox="0 0 24 24" aria-hidden fill={color}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
        </svg>
      );
    case "github":
      return (
        <svg {...common}>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
        </svg>
      );
    case "web":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
  }
}

function textContent(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (isValidElement(node)) return textContent((node as ReactElement<{ children?: ReactNode }>).props.children);
  return "";
}

function segmentWrap(
  key: number,
  kind: ContactKind,
  iconColor: string,
  textColor: string,
  fontSize: string,
  content: ReactNode,
  linkHref?: string,
  linkUnderline = "rgba(0,0,0,0.12)",
): ReactElement {
  const inner =
    linkHref !== undefined ? (
      <a
        href={linkHref}
        style={{ color: textColor, textDecoration: "none", borderBottom: `1px solid ${linkUnderline}` }}
      >
        {content}
      </a>
    ) : (
      <span style={{ color: textColor }}>{content}</span>
    );

  return (
    <span
      key={key}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        margin: "0 8px 2px 0",
        verticalAlign: "middle",
        fontSize,
      }}
    >
      <span style={{ display: "flex", flexShrink: 0, lineHeight: 0 }}>
        <IconSvg kind={kind} color={iconColor} />
      </span>
      {inner}
    </span>
  );
}

/** Parses header contact lines: splits on middle dot · and prefixes inline SVG icons. */
export function renderContactHeaderChildren(
  children: ReactNode,
  iconColor: string,
  textColor: string,
  fontSize: string,
  linkUnderline = "rgba(0,0,0,0.12)",
): ReactNode[] {
  const out: ReactNode[] = [];
  let key = 0;

  const pushTextSegments = (raw: string) => {
    raw.split(SPLIT_RE).forEach((part) => {
      const s = part.trim();
      if (!s) return;
      const kind = classifyContactText(s);
      out.push(segmentWrap(key++, kind, iconColor, textColor, fontSize, s, undefined, linkUnderline));
    });
  };

  Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      pushTextSegments(String(child));
      return;
    }
    if (isValidElement(child) && child.type === "a") {
      const props = child.props as { href?: string; children?: ReactNode };
      const href = props.href ?? "";
      const label = props.children;
      const kind = classifyContactHref(href);
      const display = textContent(label) || href;
      out.push(
        segmentWrap(key++, kind, iconColor, textColor, fontSize, display, href || undefined, linkUnderline),
      );
      return;
    }
    if (isValidElement(child)) {
      pushTextSegments(textContent(child));
      return;
    }
  });

  return out;
}
