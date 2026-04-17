import { glob } from "glob/raw";
import { PDFParse } from "pdf-parse";

const files = await glob("data/input/*.pdf", {
  ignore: ["node_modules/**"],
});

export async function parsePDF(file: ArrayBuffer) {
  const parser = new PDFParse({ data: file });
  const text = await parser.getText();
  return text.text;
}

for (const file of files) {
  const data = await Bun.file(file).arrayBuffer();

  const text = await parsePDF(data);

  // save the extracted text to a file
  await Bun.write(
    `data/extracted/${file.split("/").pop()?.replace(".pdf", ".txt")}`,
    text,
  );
}
