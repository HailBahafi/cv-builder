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
- **Sentence 3:** Academic foundation in required languages (**Java / Python / C++** when the job requires them and the candidate's CV supports it academically). Do **not** claim professional use of those languages unless the original CV states it.

### STEP 3 — Experience (every position)
- Preserve **company names**, **employment dates**, and **official position titles** exactly as in the original CV. You may rephrase bullet wording for clarity and ATS alignment, but do not change facts, employers, or date ranges.
- Rewrite bullets using vocabulary from the job where it matches real work (e.g. **software solutions**, **development frameworks**, **version control**, **functionality, performance, and reliability**) — including for roles similar in scope to **Madar** in the original CV when that reflects what the candidate actually did.
- If the job requires **debugging** and/or **problem-solving**, include **at least one bullet per job position** that naturally uses **"debugging and problem-solving"** or **"root-cause analysis"**, only if consistent with the candidate's real work.
- **CleanLife (if this employer appears in the original CV):** Preserve and strengthen the existing debugging / complex-issue work. Prefer the job's exact language, e.g.: *"Applied debugging and problem-solving techniques to resolve complex frontend and mobile issues across browsers, devices, and application states."* — only if that reflects content already in the original CV; never invent responsibilities.

### STEP 4 — Skills
- Lead with skills and programming languages the job lists as required, in truthful order from the candidate's CV (e.g. **Java, Python, C++** first under Programming Languages when the job requires them and the candidate has them).
- Do not list skills the candidate does not possess.

### STEP 5 — Education
- Explicitly surface relevant coursework when supported by the original CV (e.g. **Java, Python, C++, Algorithms, Data Structures**) when those align with job requirements.
- **Never** embed spoken-language proficiency (**Lang:**, Arabic/English levels, etc.) inside Education HTML rows. Put all languages in a separate **## Languages** section (after Education, before Skills), with one bullet per language and proficiency level.

### STEP 5b — Languages (separate section)
- If the candidate lists languages, output **## Languages** (or **## اللغات** for Arabic CVs) as its own section — not merged with Education. Use one bullet per language with proficiency (e.g. \`- **English** — Professional\`).

### STEP 6 — Projects and other sections
- Reframe using job vocabulary where it matches real outcomes. Preserve all factual content.

### CRITICAL RULES
1. Never fabricate experience, skills, companies, dates, or achievements.
2. Never change **company names** or **employment dates**.
3. Keep **official job titles** in Experience exactly as in the original CV.
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
