import OpenAI from "openai";

/** Lazy client so `next build` does not require OPENAI_API_KEY at compile/prerender time. */
export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}
