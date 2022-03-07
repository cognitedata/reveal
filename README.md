[![Storybook](https://github.com/storybookjs/brand/blob/master/badge/badge-storybook.svg)](http://www.chromatic.com/library?appId=61a0daa593486a003a8f7f81) [![CodeQL](https://github.com/cognitedata/cognite-charts/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/cognitedata/cognite-charts/actions/workflows/codeql-analysis.yml) [![Build Status](https://cd.jenkins.cognite.ai/job/cognitedata-cd/job/cognite-charts/job/master/badge/icon)](https://cd.jenkins.cognite.ai/job/cognitedata-cd/job/cognite-charts/job/master/) [![codecov](https://codecov.io/gh/cognitedata/cognite-charts/branch/master/graph/badge.svg?token=AZUYP4ALUF)](https://codecov.io/gh/cognitedata/cognite-charts)

# Cognite Charts

Charts is a product that delivers powerful, no-code exeprience to perform industrial data analytics, troubleshooting and root cause analysis.

## Access the product

- Production - https://charts.cogniteapp.com
- Staging - https://charts.staging.cogniteapp.com

## Product Documentation

Do you want to know more about Charts? Here you can have a list of resources:

- [Charts in Confluence](https://cognitedata.atlassian.net/wiki/spaces/PI/pages/3151659142/Charts)
- [Charts Customer Onboarding](https://cognitedata.atlassian.net/wiki/spaces/PI/pages/2947317901/Charts+onboarding)
- [Charts Sales Materials](https://cognitedata.atlassian.net/wiki/spaces/PI/pages/3148218379/Charts+-+Sales+Marketing+Materials)

## Important Links

- Ask for help in our channel in slack [#help-charts](https://cognitedata.slack.com/archives/C01TVBJTHNK)
- See our roadmap in [Productboard](https://cognite.productboard.com/roadmap/3427775-charts-team-sprint-planning)
- See the project progress in [Jira](https://cognitedata.atlassian.net/browse/CHART)

## Calculation Backend

The low-code calculations in Charts are dependant on the Calculation Backend. See more on the [backend repo](https://github.com/cognitedata/calculations-backend)

## Product FAQ

### Can you support {name of the operation} calculation in charts?

Feel free to add new calculation possibilities in charts through our [Industrial Data Science Library](https://github.com/cognitedata/indsl)

### How can I use charts with my own private functions?

As long as you comply with the same OpenAPI definition for the [calculation backend](#calculation-backend), you can add the `backendServiceBaseUrl` query param to the URL to use a custom backend.

Ex. `https://charts.staging.cogniteapp.com/fusion?backendServiceBaseUrl=http://localhost:5000/v2.1`

# Development

Welcome as a Chart developer! Here you will make sure all info is available so you can do a fast onbarding. If something is missing, please [edit this file](https://github.com/cognitedata/cognite-charts/edit/master/README.md), and commit it.

## Requirements

You will need:

- Google Chrome
- nvm
- Node.js v14
- Yarn
- Access to a CDF project - Talk to the Product Manager
- Access to our private NPM org - Talk to the Tech Lead

(Optional) In order to work with translations in Locize or Mixpanel tracking, you need to add a `.env.development.local` with the following contents according to your need:

```
REACT_APP_LOCIZE_API_KEY=<Talk to your Tech Lead for the Key>
REACT_APP_MIXPANEL_TOKEN=<Talk to your Tech Lead for the Token>
```

- For translation - access to Locize project - Talk to the Tech Lead

## Running the application

```
$ yarn install
$ yarn start
```

The server will run over HTTPS (https://localhost:3000), which is required in order to have the authentication working. You probably need to allow HTTPS from localhost in Chrome. You can enable from [this link](chrome://flags/#allow-insecure-localhost)

In the development environment, the application will connect to the staging [storage in firebase](#storage) and the staging backend.

## UI Components Development

All stateless components of the application are being exposed as stories and you can see them on [this link](http://www.chromatic.com/library?appId=61a0daa593486a003a8f7f81).
We use Chromatic as our visual testing runner. It builds and compares story content visually so you can identify visual regressions easily.

How to open the Storybook locally for development? As simply as it is:

```
$ yarn storybook
```

## Running Tests

In order to execute unit tests you should run:

```
yarn test
```

For E2E tests using cypress you use the folliwng command to open cypress

```
yarn cy
```

In order to only execute the tests without a GUI (Like in a CI), the you run:

```
yarn cy:ci
```

## Storage

The data stored in Charts is currently on Firebase and can be accessed for administration purposes on the following clusters:

| Name                 | Cluster                   | GCP/Azure | Dev/Prod | Production                                                                                    | Staging                                                                                        |
| -------------------- | ------------------------- | --------- | -------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Europe 1 (Google)    | `europe-west1-1`          | GCP       | Prod     | [Console](https://console.firebase.google.com/project/cognitedata-production-charts/overview) | [Console](https://console.firebase.google.com/project/cognitedata-development-charts/overview) |
| Europe 2 (Microsoft) | `westeurope-1`            | Azure     | Prod     | [Console](https://console.firebase.google.com/project/westeurope-1-charts-prod/overview)      |                                                                                                |
| Asia 1               | `asia-northeast1-1`       | GCP       | Prod     | [Console](https://console.firebase.google.com/project/charts-983055760582/overview)           | [Console](https://console.firebase.google.com/project/charts-983055760582-staging/overview)    |
| US East 1            | `az-eastus-1`             | Azure     | Prod     | [Console](https://console.firebase.google.com/project/az-eastus-1-charts-prod/overview)       | [Console](https://console.firebase.google.com/project/az-eastus-1-charts-stg/overview)         |
| BP North Europe      | `bp-northeurope`          | Azure     | Prod     | [Console](https://console.firebase.google.com/project/bp-northeurope-charts-prod/overview)    | [Console](https://console.firebase.google.com/project/bp-northeurope-charts-stg/overview)      |
| OMV                  | `omv`                     | GCP       | Prod     | [Console](https://console.firebase.google.com/project/charts-637116228329/overview)           | [Console](https://console.firebase.google.com/project/charts-637116228329-staging/overview)    |
| PGS                  | `pgs`                     | GCP       | Prod     | [Console](https://console.firebase.google.com/project/charts-250195914375/overview)           | [Console](https://console.firebase.google.com/project/charts-250195914375-staging/overview)    |
| Power NO (Google)    | `power-no`                | GCP       | Prod     | [Console](https://console.firebase.google.com/project/charts-749713754370/overview)           | [Console](https://console.firebase.google.com/project/charts-749713754370-staging/overview)    |
| Power NO (Microsoft) | `az-power-no-northeurope` | Azure     | Prod     | [Console](https://console.firebase.google.com/project/az-power-no-ne-charts-prod/overview)    | [Console](https://console.firebase.google.com/project/az-power-no-ne-charts-stg/overview)      |
| Statnett             | `statnett`                | GCP       | Prod     | [Console](https://console.firebase.google.com/project/charts-599195345790/overview)           | [Console](https://console.firebase.google.com/project/charts-599195345790-staging/overview)    |
| Greenfield           | `greenfield`              | GCP       | Dev      | [Console](https://console.firebase.google.com/project/charts-510606338073/overview)           | [Console](https://console.firebase.google.com/project/charts-510606338073-staging/overview)    |
| Bluefield            | `bluefield`               | Azure     | Dev      | [Console](https://console.firebase.google.com/project/bluefield-charts-prod/overview)         | [Console](https://console.firebase.google.com/project/bluefield-charts-stg/overview)           |
| Azure Dev            | `azure-dev`               | Azure     | Dev      | [Console](https://console.firebase.google.com/project/azure-dev-charts-prod/overview)         | [Console](https://console.firebase.google.com/project/azure-dev-charts-stg/overview)           |

## Important Links

- [Sentry](https://sentry.io/organizations/cognite/issues/?project=5509609) for our current bugs
- [Mixpanel](https://eu.mixpanel.com/project/2257491/view/2804763/app/dashboards#id=1088355) for our usage metrics
- [Jenkins CI](https://ci.jenkins.cognite.ai/blue/organizations/jenkins/cognitedata-ci%2Fcognite-charts/) for pipelines in Pull Requests
- [Jenkins CD](https://cd.jenkins.cognite.ai/blue/organizations/jenkins/cognitedata-cd%2Fcognite-charts/branches/) for deployment pipelines
  - `master` branch deploys to staging
  - `release-*` branch deploys to production
- [Chromatic CI](https://www.chromatic.com/builds?appId=61a0daa593486a003a8f7f81) for Visual Tests

## Development FAQ

### I cannot run the application!

Try to clean your `node_modules` folder (`rm -rf ./node_modules`) and run `yarn install` again.

### During a `yarn install` I'm getting a 404 NOT FOUND!

You don't have access to our `@cognite` organization in NPM. Check if you meet all [requirements](#requirements)
