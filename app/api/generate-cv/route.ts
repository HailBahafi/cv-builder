import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobDescription, templateId, language } = await req.json();

    if (!cvText || !jobDescription) {
      return NextResponse.json(
        { error: "CV text and job description are required" },
        { status: 400 }
      );
    }

    const langInstruction =
      language === "ar"
        ? "اكتب الـ CV باللغة العربية الفصحى بشكل احترافي."
        : "Write the CV in professional English.";

    const prompt = `You are an expert CV writer and career coach. Your task is to rewrite and optimize the provided CV to perfectly match the job description.

${langInstruction}

**Original CV:**
${cvText}

**Job Description:**
${jobDescription}

**Template Style:** ${templateId || "modern"}

**Instructions:**
1. Analyze the job requirements carefully
2. Rewrite the CV to highlight relevant skills and experience
3. Use strong action verbs and quantify achievements where possible
4. Optimize keywords for ATS (Applicant Tracking Systems)
5. Keep the format clean using Markdown:
   - # for name/title
   - ## for section headers (Experience, Education, Skills, etc.)
   - ### for job titles
   - Use **bold** for company names and dates
   - Use bullet points (- ) for responsibilities and achievements
6. Include sections: Summary, Experience, Education, Skills, and any relevant sections from the original
7. Tailor the summary specifically for this job position

Provide ONLY the formatted CV content in Markdown, nothing else.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return NextResponse.json({ cv: content.text });
  } catch (error: unknown) {
    console.error("Generate CV error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate CV";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}