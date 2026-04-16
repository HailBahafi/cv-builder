import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobDescription, language } = await req.json();

    const langInstruction =
      language === "ar"
        ? "اكتب خطاب التقديم باللغة العربية الفصحى."
        : "Write the cover letter in professional English.";

    const prompt = `You are an expert career coach. Write a compelling, personalized cover letter based on the CV and job description provided.

${langInstruction}

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

Provide ONLY the cover letter content, nothing else.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return NextResponse.json({ coverLetter: content.text });
  } catch (error: unknown) {
    console.error("Generate cover letter error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate cover letter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}