# Cognite Charts

Code for `charts.cogniteapp.com` and related domains.

## Workflows

Workflows are made up of several nodes. Each node contains its own function.

### Cognite Functions in Workflows

One of the nodes we have made is for Cognite Function support. This is a guide on how to setup your functions to work with workflows.

Requirements:

- Your node must contain the substring `[CHARTS]`.
- Within the .zip file for your function, there must be a file called `cognite-charts-config.json`.

The config file contains the details on the expected inputs and outputs of your function.
The file should look something like this:

```json
{
  "input": [
    {
      "name": "Datapoints",
      "type": "DATAPOINTS",
      "field": "datapoints",
      "pin": true
    },
    {
      "name": "Multiplier",
      "type": "NUMBER",
      "field": "multiplier",
      "pin": false
    }
  ],
  "output": [
    {
      "name": "Datapoints",
      "type": "DATAPOINTS",
      "field": "datapoints"
    }
  ]
}
```

An example of a function using the above config can look like this:

```python
def handle(data):
    m = data["multiplier"]
    return { "datapoints": [{"value": d["value"] * m, "timestamp": d["timestamp"]} for d in data["datapoints"]] }
```

Note that the field property in the config files match the expected data object and output object.
