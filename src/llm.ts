import OpenAI from "openai";

const BASE_URL = Bun.env.OPENAI_API_BASE_URL || "http://localhost:11434/v1";
const API_KEY = Bun.env.OPENAI_API_KEY || "do";
const MODEL_NAME = Bun.env.OPENAI_MODEL_NAME || "llama3:8b-instruct-q4_K_M";

const BASIC_AUTH_USER = Bun.env.OPENAI_USER || "user";
const BASIC_AUTH_PASS = Bun.env.OPENAI_PASS || "pass";

console.log("Using OpenAI API base URL:", BASE_URL);
console.log("Using Model:", MODEL_NAME);

function getBasicAuthHeader(user: string, pass: string): `Basic ${string}` {
  const credentials = `${user}:${pass}`;
  const encoded = btoa(credentials);
  return `Basic ${encoded}`;
}

const client = new OpenAI({
  baseURL: BASE_URL,
  apiKey: API_KEY,
  defaultHeaders: {
    Authorization: getBasicAuthHeader(BASIC_AUTH_USER, BASIC_AUTH_PASS),
  },
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
