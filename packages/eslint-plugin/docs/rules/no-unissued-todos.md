# `no-unissued-todos`

Make sure all TODO's in the code have a reference to a ticket in Jira, else these comments tend to just get forgotten.

## Usage:

Standard:

```
    "@cognite/no-unissued-todos": "error"
```

Change to a new project pattern:

```
    "@cognite/no-unissued-todos": [
      "error",
      { "issuePattern": "\\(((PROJECT)-[0-9]+)\\)" }
    ]
```
