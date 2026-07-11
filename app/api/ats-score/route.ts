import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai";

interface AtsResult {
  score: number;
  matched: string[];
  missing: string[];
  suggestions: string[];
  summary: string;
}

/** Pulls the first balanced JSON object out of a model response. */
function extractJson(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobDescription, language } = await req.json();

    if (!cvText || !jobDescription) {
      return NextResponse.json(
        { error: "CV text and job description are required" },
        { status: 400 },
      );
    }

    const langNote =
      language === "ar"
        ? "Write the `summary` and `suggestions` values in Arabic. Keep keyword strings in the language they appear in the job description."
        : "Write the `summary` and `suggestions` values in English.";

    const prompt = `You are an ATS (Applicant Tracking System) analyzer. Compare the CV against the job description and score how well the CV would perform in an automated keyword/skills screening for THIS specific job.

${langNote}

**JOB DESCRIPTION:**
${jobDescription}

**CANDIDATE CV:**
${cvText}

Analyze:
1. Extract the important hard skills, tools, qualifications, and repeated keywords from the job description.
2. Determine which of those appear (exactly or as a clear synonym) in the CV — these are "matched".
3. Determine which are absent from the CV — these are "missing".
4. Give an integer "score" from 0-100 reflecting overall ATS match (keyword coverage, relevance, titles alignment).
5. Provide 3-6 concrete, actionable "suggestions" to raise the score WITHOUT fabricating experience (e.g. surface a real skill in the Skills section, mirror the job's exact phrasing for a tool the candidate already uses).

Respond with ONLY a JSON object, no markdown, in exactly this shape:
{"score": <int 0-100>, "matched": ["..."], "missing": ["..."], "suggestions": ["..."], "summary": "<one or two sentence overall assessment>"}`;

    const text = await generateText(prompt, 3000, "low");

    const json = extractJson(text);
    if (!json) throw new Error("Could not parse ATS analysis");

    const parsed = JSON.parse(json) as Partial<AtsResult>;
    const result: AtsResult = {
      score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
      matched: Array.isArray(parsed.matched) ? parsed.matched.filter((s) => typeof s === "string") : [],
      missing: Array.isArray(parsed.missing) ? parsed.missing.filter((s) => typeof s === "string") : [],
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter((s) => typeof s === "string")
        : [],
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("ATS score error:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze ATS score";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
