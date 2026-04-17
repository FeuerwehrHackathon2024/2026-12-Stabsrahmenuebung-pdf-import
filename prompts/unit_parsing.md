Your job is to parse the units ("Einsatzmittel") requested for this alarm. Most units are generally given in the following format:

[Organization] [Region] [Type]/[Index]

Examples:

Florian Berlin 10/01
Kater München Land 67/1

But there are also special cases, such as:
Florian Haupthausen Rüstsatz Chemie
Leitstelle Florian München Land 3
Kreisbrandmeister München Land 1/5 (KBM)

Parts of the names can be abbreviated or alternative names can be used.

## Common abbreviations:

For Heros: THW, Technisches Hilfswerk
For Florian: FL, FW, Feuerwehr
For München Land: ML
For München Stadt: MS

There are multiple cases and variations, so you should use your best judgement to extract the information correctly.

This is how to parse unit names:

```json
// Example unit name: "Florian Berlin 10/01"
{
  "raw": "Florian Berlin 10/01",
  "organization": "Florian",
  "region": "Berlin",
  "type": "10",
  "index": "01",
  "special": null
}

// Example unit name: "Florian Haupthausen Rüstsatz Chemie"
{
  "raw": "Florian Haupthausen Rüstsatz Chemie",
  "organization": "Florian",
  "region": "Haupthausen",
  "type": null,
  "index": null,
  "special": "Rüstsatz Chemie"
}

// Example unit name: "Florian Ottobrunn"
{
  "raw": "Florian Ottobrunn",
  "organization": "Florian",
  "region": "Ottobrunn",
  "type": null,
  "index": null,
  "special": null
}
```

Output should be the following and only the following:

```
[
    {
        "raw": "string",
        "organization": "Florian" | "Kater" | "Heros" | other
        "region": "string",
        "type": "number" | null,
        "index": "number" | null,
        "special": "string" | null
    },
]
```

<Alarmschreiben>
{{units}}
</Alarmschreiben>
