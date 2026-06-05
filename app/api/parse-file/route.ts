import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10 MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = file.name.toLowerCase();
    let text = "";

    if (name.endsWith(".pdf")) {
      // Dynamic import to avoid build issues
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (name.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Please use PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from file. Please try a different format." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: text.trim() });
  } catch (error: unknown) {
    console.error("Parse file error:", error);
    const message = error instanceof Error ? error.message : "Failed to parse file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}