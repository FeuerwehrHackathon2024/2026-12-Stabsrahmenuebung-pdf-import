Your job is to extract the point of interest, or the location of the incident.

The location can be givin in address or coordinate format, or a combination of both.

It is vital that you extract ALL location information, even if it is incomplete.

Output a JSON object of the data, in the following EXACT format:

```json
{
    "address": "string" | null,
    "coordinates": {
        "latitude": number,
        "longitude": number
    } | null,
}
```
