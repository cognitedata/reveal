# Cognite Charts

Code for `charts.cogniteapp.com` and related domains.

## Workflows

Workflows are made up of several nodes. Each node contains its own function.

## Backend

See [cognitedata/charts-functions-dsp](https://github.com/cognitedata/charts-functions-dsp)

### Using a custom calculation backend

Add `backendServiceBaseUrl` query param to the URL to use a custom calculation backend.
eg. `https://charts.staging.cogniteapp.com/fusion?backendServiceBaseUrl=http://localhost:5000`
