import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
   - # for full name only (single line, e.g. # John Doe)
   - ### for job title/subtitle on the very next line (e.g. ### Software Engineer — Frontend Specialist)
   - Contact info as plain paragraphs separated by · (e.g. +1 234 567 · City, Country · email@example.com)
   - ## for section headers only (Summary, Experience, Education, Skills, Projects, etc.)
   - #### for job position titles inside Experience
   - Use **bold** for company names, and put date range right-aligned using em dash (—)
   - Use bullet points (- ) for responsibilities and achievements
6. Include sections: Summary, Experience, Education, Skills, and any relevant sections from the original
7. Tailor the summary specifically for this job position

Provide ONLY the formatted CV content in Markdown, nothing else.`;

    const response = await client.responses.create({
      model: "gpt-5.5",
      reasoning: { effort: "low" },
      input: [{ role: "user", content: prompt }],
      max_output_tokens: 3000,
    });

    const text = response.output_text;
    if (!text) throw new Error("Empty response from model");

    return NextResponse.json({ cv: text });
  } catch (error: unknown) {
    console.error("Generate CV error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate CV";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}