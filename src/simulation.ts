import { db } from "./db";

const API_ENDPOINT =
  Bun.env.API_ENDPOINT ?? "https://stab.feuerwehr-coesfeld.dev";

export async function parseAlarmFromCache(file: any) {
  const hash = "12998425549868934417"; // await getHash(file);
  const cachedAlarm = db.alarm_cache[hash];
  if (!cachedAlarm) {
    return null;
  }

  const expandedVehicles = cachedAlarm.vehicles.map((frn) => {
    const vehicle = db.vehicles.find((v) => v.frn === frn);
    if (!vehicle) {
      console.warn(`Vehicle with FRN ${frn} not found in database.`);
      return null;
    }

    const spawn_location = db.locations.find(
      (loc) => loc.name === vehicle.spawn_point,
    );
    if (!spawn_location) {
      console.warn(
        `Spawn location ${vehicle.spawn_point} for vehicle ${frn} not found in database.`,
      );
      return null;
    }

    const spawn_coords = spawn_location.coords
      .split(",")
      .map((coord) => parseFloat(coord.trim()));

    return {
      ...vehicle,
      spawn_coords,
    };
  });

  console.log("Expanded vehicles from cache:", expandedVehicles);

  return {
    vehicles: expandedVehicles,
    location: cachedAlarm.location,
  };
}

const file = await Bun.file(
  "./data/input/Alarmschreiben Bayern - für Stabsrahmenübung 11.04.24.pdf",
).text();
await parseAlarmFromCache(file);

export type AlarmVehicle = NonNullable<
  NonNullable<
    Awaited<ReturnType<typeof parseAlarmFromCache>>
  >["vehicles"][number]
>;

export async function sendVehiclesToApi(
  vehicle: AlarmVehicle[],
  target: [number, number],
) {
  const existingVehicles: {
    name: string;
  }[] = (await fetch(`${API_ENDPOINT}/vehicles`).then((res) =>
    res.json(),
  )) as any;

  for (const v of vehicle) {
    if (existingVehicles.some((ev: any) => ev.name === v.frn)) {
      console.log(`Vehicle with FRN ${v.frn} already exists in API, skipping.`);
      continue;
    }

    const vehicle = {
      id: Bun.randomUUIDv7(),
      name: v.frn,
      organization: v.organization,
      vehicleType: v.vehicleType,
      tacticalIcon: v.symbol.replace(".svg", ""),
      position: {
        latitude: v.spawn_coords[0],
        longitude: v.spawn_coords[1],
      },
      speedKph: 60 + Math.floor(Math.random() * 40),
      strength: {
        seniorCommanders: 1,
        commanders: 1,
        leaders: 0,
        crew: 10,
      },
      parentUnitId: null,
    };

    console.log(`Sending vehicle ${vehicle.name} to API...`);

    await fetch(`${API_ENDPOINT}/vehicles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vehicle),
    });
  }
}
