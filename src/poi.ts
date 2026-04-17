import { completion } from "./llm";

const poiPrompt = await Bun.file("./prompts/poi.md").text();
const systemPrompt = await Bun.file("./prompts/system.md").text();

export async function extractPointsOfInterest(markdown: string) {
  const response = await completion([
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: poiPrompt.replace("{{content}}", markdown),
    },
  ]);
  console.log("Raw response from model:", response);
  const parsedResponse = JSON.parse(response);
  return parsedResponse;
}
