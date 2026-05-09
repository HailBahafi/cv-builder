import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { CV_SPLIT_ROW_FORMAT_RULES } from "@/lib/cvMarkdownFormat";
import { normalizeMarkdownHeadline } from "@/lib/extractCvTitle";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message, currentCV, currentCoverLetter, history, language } = await req.json();

    const langInstruction =
      language === "ar"
        ? "أجب باللغة العربية وحافظ على محتوى الـ CV بالعربية."
        : "Respond in English and maintain the CV content in English.";

    const systemPrompt = `You are an expert CV writing assistant. You help users refine and improve their CV and cover letter.

${langInstruction}

**Current CV:**
${currentCV}

**Current Cover Letter:**
${currentCoverLetter || "Not generated yet"}

When the user asks to modify something:
1. If they want to edit the CV, respond with the COMPLETE updated CV in Markdown prefixed with [CV_UPDATE]
2. If they want to edit the cover letter, respond with the COMPLETE updated cover letter prefixed with [COVER_UPDATE]
3. If they just ask a question, answer conversationally without any prefix
4. You can update both by including both prefixes

Whenever you output a full CV inside [CV_UPDATE], follow these layout rules exactly:
${CV_SPLIT_ROW_FORMAT_RULES}
For the \`###\` headline: max 60 characters, single line, no pipe characters; use format **[Role] — [One specialty]** only.

Always be helpful and professional. Maintain all formatting in Markdown except where raw HTML is required above for Experience/Education rows.`;

    const messages = [
      ...(history || []),
      { role: "user" as const, content: message },
    ];

    const completion = await client.responses.create({
      model: "gpt-5.5",
      reasoning: { effort: "low" },
      instructions: systemPrompt,
      input: messages,
      max_output_tokens: 3000,
    });

    const text = completion.output_text;
    if (!text) throw new Error("Empty response from model");
    let updatedCV = null;
    let updatedCoverLetter = null;
    let chatResponse = text;

    if (text.includes("[CV_UPDATE]")) {
      const parts = text.split("[CV_UPDATE]");
      chatResponse = parts[0].trim();
      const cvPart = parts[1];
      if (cvPart.includes("[COVER_UPDATE]")) {
        const cvParts = cvPart.split("[COVER_UPDATE]");
        updatedCV = normalizeMarkdownHeadline(cvParts[0].trim());
        updatedCoverLetter = cvParts[1].trim();
      } else {
        updatedCV = normalizeMarkdownHeadline(cvPart.trim());
      }
    }

    if (!text.includes("[CV_UPDATE]") && text.includes("[COVER_UPDATE]")) {
      const parts = text.split("[COVER_UPDATE]");
      chatResponse = parts[0].trim();
      updatedCoverLetter = parts[1].trim();
    }

    if (!chatResponse) {
      chatResponse = updatedCV
        ? "تم تحديث الـ CV بنجاح ✓"
        : updatedCoverLetter
          ? "تم تحديث خطاب التقديم بنجاح ✓"
          : "تم التعديل";
    }

    return NextResponse.json({
      response: chatResponse,
      updatedCV,
      updatedCoverLetter,
    });
  } catch (error: unknown) {
    console.error("Chat error:", error);
    const messageText =
      error instanceof Error ? error.message : "Failed to process chat";
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
