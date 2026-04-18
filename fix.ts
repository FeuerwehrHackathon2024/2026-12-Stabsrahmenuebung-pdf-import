const input = await Bun.file("input.txt").text();
const lines = input.split("\n");
const done = lines
  .filter((line) => line.includes("svg"))
  .map((line) => line.replace(`.\\svg\\default\\`, ""));
await Bun.write("output.txt", done.join("\n"));
