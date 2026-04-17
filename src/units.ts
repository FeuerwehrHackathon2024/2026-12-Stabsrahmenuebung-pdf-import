import ollama from "ollama";
import { expandAbbreviationsInFreeformText } from "./abbreviations";
import { completion } from "./llm";

const systemPrompt = await Bun.file("./prompts/system.md").text();
const unitExtractionPrompt = await Bun.file(
  "./prompts/unit_extraction.md",
).text();

export async function extractUnits(markdown: string) {
  const response = await completion([
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: unitExtractionPrompt.replace("{{content}}", markdown),
    },
  ]);
  console.log("Raw response from model:", response);
  const { units } = JSON.parse(response);
  console.log("Extracted unit names:", units);
  const expandedUnitNames = units.map(expandAbbreviationsInFreeformText);
  return expandedUnitNames;
}
