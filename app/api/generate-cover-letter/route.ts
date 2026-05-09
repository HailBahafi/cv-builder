import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ARABIC_CV_NAME_RULES, ARABIC_CV_PLACE_RULES } from "@/lib/cvArabicNameRules";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobDescription, language } = await req.json();

    const langInstruction =
      language === "ar"
        ? "اكتب خطاب التقديم باللغة العربية الفصحى."
        : "Write the cover letter in professional English.";

    const arabicExtraBlock =
      language === "ar" ? `\n${ARABIC_CV_NAME_RULES}\n${ARABIC_CV_PLACE_RULES}\n` : "";

    const prompt = `You are an expert career coach. Write a compelling, personalized cover letter based on the CV and job description provided.

${langInstruction}
${arabicExtraBlock}
**CV Summary:**
${cvText.substring(0, 2000)}

**Job Description:**
${jobDescription}

**Instructions:**
1. Open with a strong, attention-grabbing first paragraph
2. Highlight 2-3 key achievements that match the job requirements
3. Show genuine enthusiasm for the role and company
4. Close with a clear call to action
5. Keep it concise: 3-4 paragraphs maximum
6. Use professional but warm tone
7. Format in Markdown with clear paragraphs
8. If the job description requires **Java, Python, or C++** (or similar) and the candidate has those **only academically** (per the CV), not as primary professional stack, add **ONE** sentence in **paragraph 2 or 3** along these lines (adjust languages to match truthfully): *"My academic background in [languages] further supports my ability to work across diverse technical requirements and adapt to new language environments quickly."* Never fabricate professional experience with those languages.

Provide ONLY the cover letter content, nothing else.`;

    const response = await client.responses.create({
      model: "gpt-5.5",
      reasoning: { effort: "medium" },
      input: [{ role: "user", content: prompt }],
      max_output_tokens: 1500,
    });

    const text = response.output_text;
    if (!text) throw new Error("Empty response from model");

    return NextResponse.json({ coverLetter: text });
  } catch (error: unknown) {
    console.error("Generate cover letter error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate cover letter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}