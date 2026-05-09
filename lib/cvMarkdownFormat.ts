/**
 * Shared instructions so the model outputs Experience/Education rows that
 * render as left/right split lines (PDF-safe inline styles).
 */
export const CV_SPLIT_ROW_FORMAT_RULES = `
**Experience — two-line header per job (required):**
- Do NOT use one-line pipes like "Title | Company - dates".
- Immediately after each role's heading block, output these TWO raw HTML lines (copy the structure; replace text only). Use the exact \`style\` attributes so PDF export keeps layout:

<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:8px 0 2px 0;font-size:11px;color:#111;"><span style="flex:1;min-width:0;text-align:start;"><strong>JOB_TITLE_HERE</strong></span><span style="flex-shrink:0;text-align:end;white-space:nowrap;font-weight:400;color:#333;">DATE_RANGE_HERE</span></div>
<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:0 0 8px 0;font-size:11px;color:#333;"><span style="flex:1;min-width:0;text-align:start;color:#1e3a5f;">COMPANY_NAME_HERE</span><span style="flex-shrink:0;text-align:end;font-style:italic;color:#333;">LOCATION_HERE</span></div>

- Then bullet points (- ) for responsibilities as usual.
- For Arabic CVs, use the same HTML structure with Arabic text inside the spans; **LOCATION_HERE** must be Arabic (city, country, حضوري/عن بُعد/هجين) — never leave English like "Riyadh, Saudi Arabia (On-site)" in Arabic-output CVs. The \`text-align:start/end\` spans follow document direction: in RTL the job title stays on the **right** and dates + company/location lines align to the **left** margin.

**Education — degree row + institution row only (required):**
- Do **not** put language proficiency (**Lang:**, Arabic, English, etc.) in Education rows — languages belong only in the separate **## Languages** section (see below).
- For each qualification, output exactly two HTML rows then optional *Focus* line:

<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:8px 0 2px 0;font-size:11px;color:#111;"><span style="flex:1;min-width:0;text-align:start;"><strong>DEGREE_OR_PROGRAM_NAME</strong></span><span style="flex-shrink:0;text-align:end;white-space:nowrap;font-weight:400;color:#333;">YEAR_OR_DATE_RANGE</span></div>
<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:0 0 4px 0;font-size:11px;color:#333;"><span style="flex:1;min-width:0;text-align:start;color:#1e3a5f;">INSTITUTION_AND_CITY</span><span style="flex-shrink:0;text-align:end;font-weight:400;color:#333;">—</span></div>

- Optional next line: plain Markdown in italics for focus/honors only, e.g. *Focus: Software Engineering, Algorithms, ...*

**Languages — own section (required when the CV lists languages):**
- After **## Education** (and all school entries), add a separate section **## Languages** (Arabic CVs: **## اللغات**).
- Use bullets, one language per line, e.g. \`- **Arabic** — Native\` and \`- **English** — Professional\`.
- Never duplicate this block inside Education HTML.

**Rest of CV (Markdown):**
- # full name (one line): for **Arabic-output** CVs, write the full name in **Arabic script** on this line (correct transliteration from the source Latin name, e.g. Hail Bahafi → **هايل باحفي**). Do **not** leave the \`#\` name in English when the rest of the CV is Arabic.
- ### for job title ONLY — must be a single clean line, max 60 characters, no pipe separators (use em dash — between role and one specialty)
  Good: ### Software Developer — Full-Stack & Mobile Engineering
  Bad: ### Software Developer | Frontend & Mobile Engineering | Clean Code, Debugging, Performance Optimization
- Contact: one or two lines; separate items with a middle dot (·). Icons (phone, email, location, web, LinkedIn, GitHub) are added automatically in the preview — do not use Font Awesome or external icon fonts.
- ## section titles (Summary, Experience, Education, **Languages** as its own section, Skills, etc.)
`;

/**
 * Legacy model output used physical left/right in flex rows; under RTL those
 * keep titles on the wrong margin. Logical start/end fixes layout without
 * regenerating the CV.
 */
export function normalizeCvInlineAlignForRtl(markdown: string): string {
  return markdown
    .replace(/text-align:\s*left/gi, "text-align:start")
    .replace(/text-align:\s*right/gi, "text-align:end");
}
