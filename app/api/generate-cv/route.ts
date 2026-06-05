import { NextRequest, NextResponse } from "next/server";
import { ARABIC_CV_NAME_RULES, ARABIC_CV_PLACE_RULES } from "@/lib/cvArabicNameRules";
import { CV_SPLIT_ROW_FORMAT_RULES } from "@/lib/cvMarkdownFormat";
import { normalizeMarkdownHeadline } from "@/lib/extractCvTitle";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobDescription, mode, templateId, language } = await req.json();

    if (!cvText || !jobDescription) {
      return NextResponse.json(
        { error: "CV text and instructions are required" },
        { status: 400 },
      );
    }

    const isEnhance = mode === "enhance";

    const langInstruction =
      language === "ar"
        ? "اكتب الـ CV باللغة العربية الفصحى بشكل احترافي. **سطر الاسم (#) يجب أن يكون بالعربية** (نسخ صوتي صحيح من الاسم اللاتيني في المصدر، وليس الإبقاء على الحروف الإنجليزية في الترويسة)."
        : "Write the CV in professional English.";

    const formatRules = `${CV_SPLIT_ROW_FORMAT_RULES}
   - Use bullet points (- ) under each job for responsibilities and achievements`;

    const arabicExtraBlock =
      language === "ar" ? `\n${ARABIC_CV_NAME_RULES}\n${ARABIC_CV_PLACE_RULES}\n` : "";

    const tailorPrompt = `You are rewriting this candidate's CV to perfectly match a specific job description for maximum ATS score and recruiter impact.

${langInstruction}
${arabicExtraBlock}
**ORIGINAL CV:**
${cvText}

**TARGET JOB DESCRIPTION:**
${jobDescription}

**Template Style:** ${templateId || "modern"}

---

**YOUR TASK — Follow every step precisely:**

### STEP 0 — Clean the header / contact line
The original CV text was extracted from a PDF and the contact line often contains **leftover icon-font junk characters** — stray symbols such as \`+\`, \`#\`, \`§\`, \`ï\`, \`î\`, or other single odd glyphs glued to the front of a contact item. Reconstruct a **clean** contact line:
- Remove any stray leading symbol that is an icon artifact (e.g. \`#d.hailbahafi@gmail.com\` → \`d.hailbahafi@gmail.com\`; \`+Riyadh\` → \`Riyadh\`; \`ïin/hailbahafi\` → \`linkedin.com/in/hailbahafi\`; \`§github.com/HailBahafi\` → \`github.com/HailBahafi\`).
- Keep a real leading \`+\` ONLY when it is an international phone prefix followed by digits (e.g. \`+966 54 713 5339\`).
- Output clean items separated by a middle dot \`·\`: phone · location · email · website · LinkedIn · GitHub. Do NOT add icon characters yourself (the preview adds icons automatically).

### STEP 1 — Analyze the job
Extract from the job description:
- Required hard skills, soft skills, repeated keywords, seniority, and culture signals
- **Job title line (Markdown \`###\`):** Must reflect the **target role name**, not a list of skills. Keep it concise: **[Role Name] — [One specialty or stack]**. Single clean line, **max 60 characters**, **no pipe characters** (use em dash — only).
  - Good: ### Software Developer — Full-Stack & Mobile Engineering
  - Bad: ### Software Developer | Frontend & Mobile Engineering | Clean Code, Debugging, Performance Optimization
- Build a checklist of explicit **Required Qualifications**. Each major required item must appear **at least twice** in the final CV where truthful (for example once in **Skills** and once in **Summary**, **Experience**, **Education**, or **Projects**) — integrate naturally, never keyword stuffing or fabrication.

### STEP 2 — Summary (EXACTLY 3 sentences)
Write **EXACTLY 3 sentences** — no more, no less:
- **Sentence 1:** Years of experience + core stack + alignment with the target role
- **Sentence 2:** Key achievement or specialty most relevant to the job
- **Sentence 3:** Academic foundation in the required technologies the candidate studied but has not used professionally (e.g. **C#, .NET, SQL/databases, Java, Python, C++** when the job requires them and the candidate holds a supporting CS/Engineering degree). Frame it as academic/foundational (e.g. *"with an academic foundation in C#, .NET, and relational databases"*). Do **not** claim professional use unless the original CV states it.

### STEP 3 — Experience (every position) — **REWRITE IS MANDATORY**
- Preserve **company names**, **employment dates**, and **official position titles** exactly as in the original CV. These are facts — never change them.
- **Do NOT copy the original bullets verbatim.** For **every** position, you MUST actively REWRITE each bullet so it mirrors the job description's vocabulary and phrasing — as long as it still truthfully describes work the candidate actually did. Keep the underlying facts; change the wording.
- Take the **Required Qualifications checklist** from STEP 1 and deliberately weave those keywords into the Experience bullets. Each required keyword that truthfully applies to a role should appear in **at least one bullet** of that role (this is where ATS and recruiters weight keywords most — not just the Skills list).
- Use the job's exact terms where they match real work (e.g. **software solutions**, **development frameworks**, **version control**, **functionality, performance, and reliability**) instead of generic synonyms.
- If the job requires **debugging** and/or **problem-solving**, include **at least one bullet per job position** that naturally uses **"debugging and problem-solving"** or **"root-cause analysis"**, only if consistent with the candidate's real work.
- **Guardrail:** rephrasing and keyword-weaving are required, but **never invent** responsibilities, technologies, or outcomes the candidate did not have. If a required keyword does not truthfully fit a role, leave it out of that role rather than fabricating.

### STEP 4 — Skills
- Lead with skills and programming languages the job lists as required, in truthful order from the candidate's CV (e.g. **Java, Python, C++** first under Programming Languages when the job requires them and the candidate has them professionally).
- **Academic & Foundational group (ATS coverage for a degree holder):** When the job requires technical skills that the candidate does NOT have professional experience in, but which are standard topics of the candidate's degree (the original CV shows a **Computer Science / Software Engineering / Computer Engineering** degree) — for example **C#, .NET / .NET Core, SQL & relational databases, Entity Framework / ORMs, OOP, Data Structures, Algorithms** — list them in a clearly-labeled separate group within Skills:
  - English: \`**Academic & Foundational:** C#, .NET Core, SQL, Entity Framework, ...\`
  - Arabic: \`**أساسيات أكاديمية:** ...\`
  - This group exists so the ATS sees the required keywords while staying truthful. **These are academic/foundational knowledge — never present them as professional, core, or primary skills, and never imply work experience with them.** Only include items the degree genuinely covers and the job actually requires.
- Keep the candidate's real professional skills (React, Next.js, Node.js, TypeScript, etc.) as the lead/primary groups; the Academic & Foundational group goes **last** in the Skills section.
- Do not list skills with no basis at all (neither professional nor academic).

### STEP 5 — Education
- Explicitly surface relevant coursework that aligns with the job's requirements when the candidate holds the supporting degree — including the job-required topics covered by a CS/Software/Computer Engineering curriculum (e.g. **C#, .NET, SQL & Databases, Object-Oriented Programming, Algorithms, Data Structures, Java, Python, C++**). Add them to the *Focus:* line so each required keyword also appears in an Education context (reinforces the Academic & Foundational skills above). Keep this truthful to a degree holder; do not claim a course the program would not include.
- **Never** embed spoken-language proficiency (**Lang:**, Arabic/English levels, etc.) inside Education HTML rows. Put all languages in a separate **## Languages** section (after Education, before Skills), with one bullet per language and proficiency level.

### STEP 5b — Languages (separate section)
- If the candidate lists languages, output **## Languages** (or **## اللغات** for Arabic CVs) as its own section — not merged with Education. Use one bullet per language with proficiency (e.g. \`- **English** — Professional\`).

### STEP 6 — Projects and other sections — **REWRITE IS MANDATORY**
- **Do NOT copy the original project descriptions verbatim.** For **every** project, actively REWRITE the description/bullets to mirror the job description's vocabulary and highlight the skills the job asks for — while preserving the factual content (project name, the technologies actually used, real outcomes/metrics).
- Weave the STEP 1 required keywords into project bullets where they truthfully apply (e.g. the frameworks, languages, or practices the job lists and the candidate genuinely used in that project).
- Lead each project with its most job-relevant aspect first.
- **Guardrail:** never add technologies or results the project did not actually involve.

### CRITICAL RULES
1. Never fabricate experience, skills, companies, dates, or achievements.
2. Never change **company names** or **employment dates**.
3. Keep **official job titles** in Experience exactly as in the original CV.
3b. **Experience and Projects bullets MUST be actively rewritten** to incorporate the job's keywords (per STEP 3 and STEP 6) — do not return them unchanged or only lightly touched. Rewrite the wording; preserve the facts.
4. **Completeness:** Output MUST include **every** section from the source CV (Summary, Experience, Education, **Skills** / **## المهارات**, **Languages**, Projects, etc.). Never omit trailing sections to save length — shorten bullets if needed, but do **not** drop Skills or Languages when they exist in the original.
5. ${formatRules}

Output ONLY the complete rewritten CV in Markdown. Nothing else.`;

    const enhancePrompt = `You are an expert CV writer and career coach. Your task is to ENHANCE and IMPROVE the provided CV based on the user's instructions. Do NOT tailor it to any specific job — keep the CV general-purpose while applying the requested improvements.

${langInstruction}
${arabicExtraBlock}
**Original CV:**
${cvText}

**User's Improvement Instructions:**
${jobDescription}

**Template Style:** ${templateId || "modern"}

**Instructions:**
1. Carefully apply the user's requested improvements
2. Strengthen action verbs and quantify achievements where possible
3. Improve clarity, conciseness, and professional tone
4. Keep all factual content (roles, companies, dates, education) exactly as-is — only rewrite wording, structure, and emphasis
5. Do NOT invent new experience, skills, or achievements
6. ${formatRules}
7. Preserve **all** sections from the original CV (including **Skills** / **## المهارات** and **Languages**) — never omit sections at the end of the document.

Provide ONLY the formatted improved CV content in Markdown, nothing else.`;

    const prompt = isEnhance ? enhancePrompt : tailorPrompt;

    const response = await getOpenAI().responses.create({
      model: "gpt-5.5",
      reasoning: { effort: "medium" },
      input: [{ role: "user", content: prompt }],
      max_output_tokens: 12000,
    });

    const text = response.output_text;
    if (!text) throw new Error("Empty response from model");

    const cv = normalizeMarkdownHeadline(text.trim());

    return NextResponse.json({ cv });
  } catch (error: unknown) {
    console.error("Generate CV error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate CV";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
