import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { validator } from "hono/validator";
import z from "zod";
import { parsePDF } from "./parse";
import { extractUnits } from "./units";
import { extractPointsOfInterest } from "./poi";

const app = new Hono();

app.post(
  "/parse",
  //   zValidator(
  //     "form",
  //     z.object({
  //       file: z.file(),
  //     }),
  //   ),
  async (c) => {
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!(file instanceof File)) {
      return c.text("File is required", 400);
    }

    const data = await file.arrayBuffer();

    const parsedText = await parsePDF(data);

    const [units, location] = await Promise.all([
      extractUnits(parsedText),
      extractPointsOfInterest(parsedText),
    ]);

    return c.json({ units, location } as any);
  },
);

export default app;
