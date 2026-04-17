import OpenAI from "openai";

const BASE_URL = Bun.env.OPENAI_API_BASE_URL || "http://localhost:11434/v1";
const API_KEY = Bun.env.OPENAI_API_KEY || "do";
const MODEL_NAME = Bun.env.OPENAI_MODEL_NAME || "llama3:8b-instruct-q4_K_M";

console.log("Using OpenAI API base URL:", BASE_URL);
console.log("Using Model:", MODEL_NAME);

const client = new OpenAI({
  baseURL: BASE_URL,
  apiKey: API_KEY,
});

export async function completion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
): Promise<string> {
  const response = await client.chat.completions.create({
    model: MODEL_NAME,
    messages,
    stream: false,
    response_format: {
      type: "json_object",
    },
  });

  return response.choices[0]!.message.content!;
}
