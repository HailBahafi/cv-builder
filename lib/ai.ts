import { getOpenAI } from "@/lib/openai";

export type AiProvider = "openai" | "gemini";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type GenerateOptions = {
  system?: string;
  messages: ChatMessage[];
  maxOutputTokens: number;
  reasoningEffort?: "low" | "medium" | "high";
};

/** Reads AI_PROVIDER from env; falls back to whichever API key is configured. */
export function getAiProvider(): AiProvider {
  const configured = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (configured === "openai" || configured === "gemini") return configured;

  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  if (process.env.GEMINI_API_KEY?.trim()) return "gemini";

  throw new Error(
    "No AI provider configured. Set OPENAI_API_KEY or GEMINI_API_KEY (and optionally AI_PROVIDER) in .env",
  );
}

const GEMINI_MODEL = "gemini-flash-latest";

async function generateWithGemini(opts: GenerateOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(opts.system ? { systemInstruction: { parts: [{ text: opts.system }] } } : {}),
        contents: opts.messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: opts.maxOutputTokens,
          // Disable "thinking" — its tokens otherwise eat into maxOutputTokens and can
          // truncate the visible answer before it's fully written.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    },
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${errBody || res.statusText}`);
  }

  const data = await res.json();
  const candidate = data?.candidates?.[0];
  const text =
    candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  if (!text) {
    const reason = candidate?.finishReason ? ` (finishReason: ${candidate.finishReason})` : "";
    throw new Error(`Empty response from Gemini${reason}`);
  }
  return text;
}

async function generateWithOpenAi(opts: GenerateOptions): Promise<string> {
  const response = await getOpenAI().responses.create({
    model: "gpt-5.5",
    reasoning: { effort: opts.reasoningEffort ?? "medium" },
    ...(opts.system ? { instructions: opts.system } : {}),
    input: opts.messages,
    max_output_tokens: opts.maxOutputTokens,
  });

  const text = response.output_text;
  if (!text) throw new Error("Empty response from model");
  return text;
}

/** Provider-agnostic chat generation. Picks OpenAI or Gemini based on AI_PROVIDER / configured keys. */
export async function generateChat(opts: GenerateOptions): Promise<string> {
  const provider = getAiProvider();
  return provider === "gemini" ? generateWithGemini(opts) : generateWithOpenAi(opts);
}

/** Convenience wrapper for single-turn prompts. */
export async function generateText(
  prompt: string,
  maxOutputTokens: number,
  reasoningEffort?: "low" | "medium" | "high",
): Promise<string> {
  return generateChat({ messages: [{ role: "user", content: prompt }], maxOutputTokens, reasoningEffort });
}
