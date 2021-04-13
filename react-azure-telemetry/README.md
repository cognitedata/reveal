# @cognite/react-azure-telemetry

This Component provides telemetry to Azure Application Insights

[What is Application Insights?](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)

## Installation

```sh
yarn add @cognite/react-azure-telemetry
```

## Setup

You need to get an `instrumentationKey` to enable this.

Steps:

1. Add yourself to [contributers](https://github.com/cognitedata/terraform-azure/blob/master/az-cognitedata-experiments/authorization/main.tf)
2. Log into portal and create a new Application Insights instance [here](https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/microsoft.insights%2Fcomponents)
3. Take the Instrumentation Key from the overview

## Usage

Note: make sure you render this inside your Router

```sh
import { AzureTelemetryProvider } from '@cognite/react-azure-telemetry'
```

Then wrap your app with:

```
<Router history={history}>
  <AzureTelemetryProvider
    instrumentationKey={instrumentationKey}
  >
    {children}
  </AzureTelemetryProvider>
</Router>
```
