/**
 * Shared instructions so the model outputs Experience/Education rows that
 * render as left/right split lines (PDF-safe inline styles).
 */
export const CV_SPLIT_ROW_FORMAT_RULES = `
**Experience — two-line header per job (required):**
- Do NOT use one-line pipes like "Title | Company - dates".
- Immediately after each role's heading block, output these TWO raw HTML lines (copy the structure; replace text only). Use the exact \`style\` attributes so PDF export keeps layout:

<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:8px 0 2px 0;font-size:11px;color:#111;"><span style="flex:1;min-width:0;text-align:left;"><strong>JOB_TITLE_HERE</strong></span><span style="flex-shrink:0;text-align:right;white-space:nowrap;font-weight:400;color:#333;">DATE_RANGE_HERE</span></div>
<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:0 0 8px 0;font-size:11px;color:#333;"><span style="flex:1;min-width:0;text-align:left;color:#1e3a5f;">COMPANY_NAME_HERE</span><span style="flex-shrink:0;text-align:right;font-style:italic;color:#333;">LOCATION_HERE</span></div>

- Then bullet points (- ) for responsibilities as usual.
- For Arabic CVs, use the same HTML structure with Arabic text inside the spans.

**Education — degree row + institution row only (required):**
- Do **not** put language proficiency (**Lang:**, Arabic, English, etc.) in Education rows — languages belong only in the separate **## Languages** section (see below).
- For each qualification, output exactly two HTML rows then optional *Focus* line:

<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:8px 0 2px 0;font-size:11px;color:#111;"><span style="flex:1;min-width:0;text-align:left;"><strong>DEGREE_OR_PROGRAM_NAME</strong></span><span style="flex-shrink:0;text-align:right;white-space:nowrap;font-weight:400;color:#333;">YEAR_OR_DATE_RANGE</span></div>
<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:0 0 4px 0;font-size:11px;color:#333;"><span style="flex:1;min-width:0;text-align:left;color:#1e3a5f;">INSTITUTION_AND_CITY</span><span style="flex-shrink:0;text-align:right;font-weight:400;color:#333;">—</span></div>

- Optional next line: plain Markdown in italics for focus/honors only, e.g. *Focus: Software Engineering, Algorithms, ...*

**Languages — own section (required when the CV lists languages):**
- After **## Education** (and all school entries), add a separate section **## Languages** (Arabic CVs: **## اللغات**).
- Use bullets, one language per line, e.g. \`- **Arabic** — Native\` and \`- **English** — Professional\`.
- Never duplicate this block inside Education HTML.

**Rest of CV (Markdown):**
- # full name (one line)
- ### for job title ONLY — must be a single clean line, max 60 characters, no pipe separators (use em dash — between role and one specialty)
  Good: ### Software Developer — Full-Stack & Mobile Engineering
  Bad: ### Software Developer | Frontend & Mobile Engineering | Clean Code, Debugging, Performance Optimization
- Contact: one or two lines; separate items with a middle dot (·). Icons (phone, email, location, web, LinkedIn, GitHub) are added automatically in the preview — do not use Font Awesome or external icon fonts.
- ## section titles (Summary, Experience, Education, **Languages** as its own section, Skills, etc.)
`;
