Your job is to extract the units ("Einsatzmittel") requested for this alarm. Units are generally given in the following format:

[Organization] [Region] [Type]/[Index]

Examples:

Florian Berlin 10/01
Kater München Land 67/1

But there are also special cases, such as:
Florian Haupthausen Rüstsatz Chemie

And the Type and Index can be missing, such as:
Florian Berlin 10

There are also some common abbreviations. For example:

Florian = FL = FW = Feuerwehr
München Land = ML
München Stadt = MS
Heros = THW

There are multiple cases and variations, so you should use your best judgement to extract the information correctly.

Collect the names of all units as strings.

Also collect ALL names that deviate from the normal schema.

Human live depends on extracting every unit and not missing any.

Output EXACTLY the following and only the following:

```
{
    units: [
        "string",
        "string",
    ]
}
```

<Alarmschreiben>
{{content}}
</Alarmschreiben>
