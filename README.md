# Platypus (codename)

[![Confluence](https://img.shields.io/badge/Confluence-blue)](https://cog.link/devx)
[![codecov](https://codecov.io/gh/cognitedata/platypus/branch/master/graph/badge.svg?token=ClP7PLfMI8)](https://codecov.io/gh/cognitedata/platypus)

Our aim is to make it easier for application developer to develop app by reducing cost, friction and learning curve for them. Codename Platypus will help us achieve the same.

## Setup

First, Install Nx with npm:

Make sure the nx is on version 13.x.x!

```
npm install -g nx
```

Then you can install the node_modules by running

```
yarn
```

_Note: If you're on an Apple M1 machine, make sure your Node version is >= 16_

## Authentication

### UI (quick-start)

Make sure you have access to the `cogniteappdev.onmicrosoft.com` tenant. If not, as #topic-appdev` and someone can add you.

After, visit the staging [URL](http://platypus.staging.cogniteapp.com) and click `Advance Azure options` and enter `cogniteappdev.onmicrosoft.com` as Azure Tenant ID and press **Login with Microsoft Azure** button, after that you will be taken to a page where you need to select **Platypus** as the project and login.

### CLI

See the detailed section for authentication for [more info](./apps/platypus-cdf-cli/LOGIN.md)

## NX CLI

NX provides CLI for developing different types of applications and different tools. These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Please read more about how to use the NX CLI here:
https://nx.dev/l/r/getting-started/nx-cli

If you don't want to bother and learn all the commands and you are using VsCode, you can install their extension `Nx Console` and have nice UI from where you can do everything.

### Usefull CLI commands

To run/serve any app, just run:

`nx serve name-of-the-app`

To test any app/library:

`nx test name-of-the-app`

To build the app/library:

`nx build name-of-the-app`

The output can be found in the `dist` folder.

# Platypus App

You can find the code under `apps/platypus`.

## Running Platypus locally

For development, you can use either `development` or `fusion` environments.
The default environment is `development`. To use this environment, just run `yarn start`.

To run:

`nx serve platypus`

To build:

`nx build platypus`

To test:

`nx test platypus`

## How to run Platypus app in Fusion app

You can run app as part of the Fusion UI (CDF Fusion platform app).
This is the best way to test and verify you app, however, it doesn't provide the best experience for developing locally.

To use it, First serve your bundle locally by running `yarn start fusion` or `yarn start fusion platypus`.

MAKE SURE YOURE USING NODE v14!!!!
(some bug with the `cdf-utilities` requiremnet...)

```
yarn
yarn start
```

Your bundle should now be hosted at https://localhost:3000/index.js. You can go there to verify. A bunch of javascript should show up.

Then show it in unified CDF UI by following these steps:

Go to [https://cog-appdev.next-release.fusion.cognite.com/](https://cog-appdev.next-release.fusion.cognite.com/)
Open devtools
In the console type: `importMapOverrides.enableUI()` (This sets some variables in localstorage)
On the bottom right click the "{...}"-button
Select @cognite/cdf-solutions-ui
Type in "https://localhost:3000/index.js"
Refresh the browser

Voila!

## Running Platypus app against mock environment

You can run platypus as standalone application against mock server. This means that the app will be running as any other regular CRA application, however the requests to cdf will be mocked and instead will be sent to mock server.

How to use the mock environment:

- Run the app with `yarn start mock`
- Run mock server `nx serve mock-server`
- Open app as regularly you do on [https://localhost:3000/platypus](https://localhost:3000/platypus)
- Everything should be there and working

# Running Preview Server in PR

A link it is going to be generated into each pull request with dynamic link that will allow you to live preview your changes.
The link it will be something like this:
https://next-release.fusion.cognite.com/?externalOverride=@cognite/cdf-solutions-ui&overrideUrl=https://platypus-123.fusion-preview.preview.cogniteapp.com/index.js

Once you click on it, you will be asked to enter a domain. Use `cog-appdev`.
Once you are logged in, just click on solutions from dashboard and you should be able to see platypus app.

Breakdown:

- next-release - server where the app is running
- externalOverride - overrides the `signle-spa` import mapping to load the file from `overrideUrl`
- overrideUrl - url where your compiled js files are deployed

# Platypus CLI

Read more [here](./apps/platypus-cdf-cli/README.md)

# Mock Server

We have developed a mock server that can be used for local development and used for running E2E tests.

Read more [here](./apps/mock-server/README.md) how to use it.

To run, use following command:
`nx serve mock-server`

Server will be running on following URL: http://localhost:4002

If you want to pass CLI arguments using nx serve, you can use `--args=` and pass the args that you want.

Example:
`nx serve mock-server --args="./data-provider.js --config=./mock-server-config.js --port=4001"`

To run Platypus using the mock server, start the mock server and then run:

`yarn start mock platypus`

# E2E Testing

We use cypress to run our e2e test suite. To run them from the terminal using a headless browser, make sure the mock server is running, and then from another terminal window, run:

`nx run platypus-e2e:e2e`

To run them in the Cypress GUI:

`nx run platypus-e2e:e2e --watch`

You can optionally run the e2e tests using the `Nx Console` VSCode extension by clicking to run `e2e` and then choosing the `platypus-e2e` project.

## Setup for M1 machines

If you're on an Apple M1 machine, you need to do a bit of extra setup to get Cypress to run using Rosetta 2. You can follow [these instructions](https://www.cypress.io/blog/2021/01/20/running-cypress-on-the-apple-m1-silicon-arm-architecture-using-rosetta-2/) and then use the above commands from your terminal running Rosetta.
