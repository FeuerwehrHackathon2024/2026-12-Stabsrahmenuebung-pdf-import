# Alarmschreiben Parser

## `POST /parse` - Parses the given "Alarmschreiben" and returns structured data.

### Request Body

Post a pdf file containing the "Alarmschreiben" (alarm letter) to this endpoint. The file should be sent as form-data with the key "file".

### Response

```json
HTTP 200 OK
{
    "units": [
        "Florian Berlin 10/01",
        "Kater München Land 67/1",
        "..."
    ],
    "location": {
        "address": "",
        "coordinates": {
            "latitude": null,
            "longitude": null
        }
    }
}
```

## Environment Variables

| Variable Name       | Description                                                                         | Default Value               | Required |
| ------------------- | ----------------------------------------------------------------------------------- | --------------------------- | -------- |
| `PORT`              | The port on which the server will listen.                                           | `3000`                      | No       |
| `NODE_ENV`          | The environment in which the server is running (e.g., "development", "production"). | `development`               | No       |
| `OPENAI_BASE_URL`   | The base URL for the OpenAI API.                                                    | `http://localhost:11434/v1` | No       |
| `OPENAI_API_KEY`    | The API key for authenticating with the OpenAI API.                                 | None                        | No       |
| `OPENAI_MODEL_NAME` | The name of the OpenAI model to use for processing.                                 | `llama3:8b-instruct-q4_K_M` | No       |
