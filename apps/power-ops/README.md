[![Storybook](https://github.com/storybookjs/brand/blob/master/badge/badge-storybook.svg)](https://www.chromatic.com/library?appId=63469a7e12cb321258899a52)

# Power Marker Operations

> “Our vision is to let data and algorithms drive Power Market Operations, freeing Production Planners, Traders and Analysts to focus on strategy and continuous improvement”

## Access the product

- Production - https://power-ops.cogniteapp.com/
- Staging - https://power-ops.staging.cogniteapp.com/

## Product Documentation

Do you want to know more about Power Ops? Here you can have a list of resources:

- [Confluence](https://cognitedata.atlassian.net/wiki/spaces/PowerOps/overview)

## Important Links

- Ask for help in our channel in slack [#cognite-for-power-markets-core-team](https://cognitedata.slack.com/archives/C02U2QH6W5N)
- See our roadmap in [Productboard](https://cognite.productboard.com/feature-board/4121570-powerops)
- See the project progress in [Jira](https://cognitedata.atlassian.net/browse/POWEROPS)

## Power Ops Backends

The frontend is dependent on the Power Ops API and the Sniffer Service. See more on:

- [Backend](https://github.com/cognitedata/application-services/tree/master/services/power-ops-api)
- [Sniffer](https://github.com/cognitedata/application-services/tree/master/services/sniffer-service)

# Development

Welcome as a developer! Here you will make sure all info is available so you can do a fast onbarding. If something is missing, please [edit this file](https://github.com/cognitedata/applications/edit/master/apps/power-ops/README.md), and commit it.

## Requirements

You will need:

- Google Chrome
- nvm
- Node.js v16
- Yarn
- Access to the CDF projects - Talk to the Product Manager
- Access to our private NPM org - Talk to the Tech Lead

(Optional) In order to work with translations in Locize or Mixpanel tracking, you need to add a `.env.development.local` with the following contents according to your need:

```
REACT_APP_LOCIZE_API_KEY=<Talk to your Tech Lead for the Key>
REACT_APP_MIXPANEL_TOKEN=<Talk to your Tech Lead for the Token>
```

- For translation - access to Locize project - Talk to the Tech Lead

## Running the application

Go to the root of the repo and do:

```sh
yarn install
cd apps/power-ops
yarn install
yarn start
```

The server will run over HTTPS (https://localhost:3000), which is required in order to have the authentication working. You probably need to allow HTTPS from localhost in Chrome. You can enable from [this link](chrome://flags/#allow-insecure-localhost)

## UI Components Development

All stateless components of the application are being exposed as stories and you can see them on [this link](https://www.chromatic.com/library?appId=63469a7e12cb321258899a52).
We use Chromatic as our visual testing runner. It builds and compares story content visually so you can identify visual regressions easily.

How to open the Storybook locally for development? As simply as it is:

```sh
$ cd apps/power-ops
$ yarn storybook
```

## Running Tests

In order to execute unit tests you should run:

```sh
yarn test:bazel
```

## Linting

In order to execute linting tests you should run:

```sh
yarn lint:bazel
```
