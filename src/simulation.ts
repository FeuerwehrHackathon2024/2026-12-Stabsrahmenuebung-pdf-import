import { db } from "./db";

const API_ENDPOINT = Bun.env.API_ENDPOINT ?? "https://api.exconbos.de";

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

export async function sendTargetToApi(target: [number, number]) {
  const pois = (await fetch(`${API_ENDPOINT}/pois`).then((res) =>
    res.json(),
  )) as {
    features: any[];
  };
  if (
    pois.features.some((poi) => {
      poi.properties?.name === "E-Stelle";
    })
  ) {
    console.log(`POI "Einsatzort" already exists in API, skipping.`);
    return;
  }

  const payload = {
    // id: Bun.randomUUIDv7(),
    geometry: {
      type: "Point",
      coordinates: [target[1], target[0]], // GeoJSON format is [longitude, latitude]
    },
    properties: {
      name: "E-Stelle",
      type: "Einsatzstelle",
      tacticalIcon: "Einrichtungen/Stelle",
      location: "",
      attributes: [],
    },
  };

  console.log(`Sending target ${target} to API...`, payload);

  await fetch(`${API_ENDPOINT}/pois`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then((res) => {
    if (!res.ok) {
      console.error(`Failed to send target to API:`, res.statusText);
    } else {
      console.log(`Target sent successfully.`);
    }
  });
  console.log(`Sent target ${target} to API.`);
}

export async function sendVehiclesToApi(
  vehicle: AlarmVehicle[],
  target: [number, number],
) {
  const existingVehicles: {
    name: string;
    id: string;
  }[] = (await fetch(`${API_ENDPOINT}/vehicles`).then((res) =>
    res.json(),
  )) as any;

  for (const v of vehicle) {
    if (!v) {
      continue;
    }
    let id = Bun.randomUUIDv7();
    const vehicle = {
      id,
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
    if (!existingVehicles.some((ev: any) => ev.name === v.frn)) {
      console.log(`Sending vehicle ${vehicle.name} to API...`);

      await fetch(`${API_ENDPOINT}/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vehicle),
      });
    } else {
      console.log(
        `Vehicle with FRN ${v.frn} already exists in API, skipping. Finding id`,
      );
      const existingVehicle = existingVehicles.find(
        (ev: any) => ev.name === v.frn,
      );
      if (existingVehicle) {
        id = existingVehicle.id;
        console.log(`Found existing vehicle with id ${id}`);
      } else {
        console.warn(
          `Could not find existing vehicle with name ${v.frn}, this should not happen.`,
        );
      }
    }

    console.log(
      "Calculating distance and travel time for vehicle",
      vehicle.position.latitude,
      vehicle.position.longitude,
      target[0],
      target[1],
    );
    const distanceToTarget = calculateDistance(
      vehicle.position.latitude!,
      vehicle.position.longitude!,
      target[0],
      target[1],
    );
    const travelTimeHours = distanceToTarget / (vehicle.speedKph / 60);
    const travelTimeSeconds = travelTimeHours * 60 * 60;

    // between 4 and 8 minutes
    const waitTimeSeconds = (4 + Math.floor(Math.random() * 4)) * 60;

    const tasks = {
      name: "Ausrücken",
      actions: [
        // {
        //   type: "signalEvent",
        //   label: "[Status 2] Einsatzbereit auf Wache",
        // },
        {
          type: "wait",
          durationSeconds: waitTimeSeconds,
        },
        {
          type: "signalEvent",
          label: "[Status 3] Auf Anfahrt",
        },
        {
          type: "moveTo",
          target: {
            latitude: target[0],
            longitude: target[1],
          },
          durationSeconds: Math.floor(travelTimeSeconds),
        },
        {
          type: "signalEvent",
          label: "[Status 4] Am Einsatzort angekommen",
        },
      ],
    };

    console.log(
      `Sending tasks for vehicle ${vehicle.name} to API ${`${API_ENDPOINT}/vehicles/${id}/tasks`}`,
      JSON.stringify(tasks, null, 2),
    );

    await fetch(`${API_ENDPOINT}/vehicles/${id}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tasks),
    }).then((res) => {
      if (!res.ok) {
        console.error(
          `Failed to send tasks for vehicle ${vehicle.name}:`,
          res.statusText,
        );
      } else {
        console.log(`Tasks for vehicle ${vehicle.name} sent successfully.`);
      }
    });
  }
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}
