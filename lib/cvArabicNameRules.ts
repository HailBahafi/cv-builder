/**
 * Arabic-output CVs: full name in Arabic script on # line; places in Arabic.
 */
export const ARABIC_CV_NAME_RULES = `
### Personal name (Arabic CV — Arabic script on \`#\`)
- When the CV is **in Arabic**, the **full name on the \`#\` line must be written in Arabic letters** (correct transliteration from the Latin name in the source), **not** left in English. The whole document header reads as Arabic except phone numbers, emails, and URLs which stay as needed.
- **Transliteration, not meaning translation:** write how the name sounds in Arabic for official use.
- **Hail Bahafi** → **# هايل باحفي** (required shape). **Wrong:** هيل بحافي — the first name needs **هايل** (ha + alif + y + l), not **هيل**.
- If the source already has the name in Arabic on \`#\`, keep it and only fix clear typos (e.g. هيل → هايل when the Latin source is Hail).
- **Cover letter in Arabic:** sign with the **same Arabic spelling** as the CV \`#\` line.
`;

/** Cities, countries, on-site/remote — must be Arabic when CV output is Arabic. */
export const ARABIC_CV_PLACE_RULES = `
### Cities, countries, and work arrangement (Arabic CV output)
- Do **not** leave English city/country lines or English HR tags in Arabic sections. Translate into clear Modern Standard Arabic.
- Example: **"Riyadh, Saudi Arabia (On-site)"** → **الرياض، المملكة العربية السعودية (حضوري)** (or equivalent natural phrasing).
- Map common terms: **On-site / on-site** → **حضوري** or **في الموقع**; **Remote** → **عن بُعد**; **Hybrid** → **هجين** / **عمل هجين** as fits the sentence.
- Apply in Experience **location** (italic right cell in HTML rows), Education lines, Summary, bullets, and contact **address** text — **not** email domains, URLs, or phone numbers.
- **Company names** keep official spelling unless the source CV already uses a known Arabic legal name.
`;
