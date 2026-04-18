import { Hono } from "hono";
import { parsePDF } from "./parse";
import { extractUnits } from "./units";
import { extractPointsOfInterest } from "./poi";
import {
  parseAlarmFromCache,
  sendTargetToApi,
  sendVehiclesToApi,
} from "./simulation";

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

app.post("/alarm", async (c) => {
  const parsedAlarm = await parseAlarmFromCache("foo");
  console.log("Parsed Alarm from cache:", parsedAlarm);
  //TODO: actually parse the file and get the hash, then look up in cache

  // await new Promise((resolve) => setTimeout(resolve, 3000));

  await sendVehiclesToApi(
    parsedAlarm?.vehicles! as any,
    parsedAlarm?.location.coords
      .split(",")
      .map((coord) => parseFloat(coord.trim())) as any,
  );

  await sendVehiclesToApi(
    parsedAlarm?.vehicles! as any,
    parsedAlarm?.location.coords
      .split(",")
      .map((coord) => parseFloat(coord.trim())) as any,
  );

  await sendTargetToApi(
    parsedAlarm?.location.coords
      .split(",")
      .map((coord) => parseFloat(coord.trim())) as any,
  );

  return c.json({ success: true });
});

export default app;
