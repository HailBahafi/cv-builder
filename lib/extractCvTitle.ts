/** First ### line in markdown (CV headline under the name), ATS-safe length. */
export function extractTitle(markdown: string): string {
  const match = markdown.match(/^###\s+(.+)$/m);
  if (!match) return "";
  let title = match[1].trim();

  if (title.includes("|")) {
    title = title
      .split("|")
      .slice(0, 2)
      .map((s) => s.trim())
      .join(" — ");
  }

  if (title.length > 60) {
    title = title.substring(0, 60).replace(/\s+\S*$/, "").trim();
  }

  return title;
}

/** Rewrites the first ### line so the stored CV matches the shortened headline. */
export function normalizeMarkdownHeadline(markdown: string): string {
  const title = extractTitle(markdown);
  if (!title) return markdown;
  return markdown.replace(/^###\s+.+$/m, `### ${title}`);
}
