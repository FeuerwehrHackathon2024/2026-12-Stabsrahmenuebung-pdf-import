type Fahrzeuge = {
  frn: string; // Florian Ottobrunn 40/2
  organization: string; // Florian / Kater / Heros /
  spawn_point: string; // Ottobrunn
  strength: string; // Format: VF / ZF / UF / Trupp example: "0/1/0/0" (0 VF, 1 ZF, 0 UF, 0 Trupp)
  vehicleType: string; // Format: LF, RW, ELW, etc. example: "LF"
  symbol: string; // Format: "Bundeswehr_Fahrzeuge/Kraftfahrzeug"
};

type Location = {
  name: string; // Ottobrunn
  coords: string; // "48.06035391754033, 11.667955132795134"
};

type Alarm = {
  vehicles: string[];
  location: Location;
};

type Db = {
  vehicles: Fahrzeuge[];
  locations: Location[];
  alarm_cache: {
    [hash: string]: Alarm;
  };
};

export let db: Db;
export async function loadDb() {
  const dbContent = await Bun.file("./db.json").text();
  db = JSON.parse(dbContent);
}
export async function saveDb() {
  await Bun.write("./db.json", JSON.stringify(db, null, 2));
}
await loadDb();
