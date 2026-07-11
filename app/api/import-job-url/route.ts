import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const FETCH_TIMEOUT_MS = 10000;
const MAX_HTML_BYTES = 5 * 1024 * 1024; // 5 MB

/** Blocks requests to private/loopback/link-local addresses to prevent SSRF via user-supplied URLs. */
function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local")) return true;
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 0) return true;
  }
  if (h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "A job posting URL is required" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "That doesn't look like a valid URL" }, { status: 400 });
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ error: "Only http(s) URLs are supported" }, { status: 400 });
    }
    if (isPrivateHostname(parsed.hostname)) {
      return NextResponse.json({ error: "This URL cannot be fetched" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(parsed.toString(), {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } catch (err) {
      clearTimeout(timeout);
      const message =
        err instanceof Error && err.name === "AbortError"
          ? "The page took too long to respond"
          : "Could not reach that URL";
      return NextResponse.json({ error: message }, { status: 502 });
    }
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: `The page returned an error (HTTP ${res.status}). This site may block automated access — try pasting the description manually.` },
        { status: 502 },
      );
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("html")) {
      return NextResponse.json(
        { error: "That URL did not return a web page. Please paste the description manually." },
        { status: 400 },
      );
    }

    const reader = res.body?.getReader();
    let html = "";
    if (reader) {
      let received = 0;
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        if (received > MAX_HTML_BYTES) {
          reader.cancel();
          return NextResponse.json({ error: "The page is too large to process" }, { status: 413 });
        }
        html += decoder.decode(value, { stream: true });
      }
    } else {
      html = await res.text();
    }

    const dom = new JSDOM(html, { url: parsed.toString() });
    const article = new Readability(dom.window.document).parse();

    const text = article?.textContent?.replace(/\n{3,}/g, "\n\n").trim() ?? "";

    if (!text || text.length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract the job description from this page — the site may require a login (common for LinkedIn) or block automated access. Please paste the description manually.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ text, title: article?.title ?? "" });
  } catch (error: unknown) {
    console.error("Import job URL error:", error);
    const message = error instanceof Error ? error.message : "Failed to import job description";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
