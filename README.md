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

To run:

`nx serve platypus`

To build:

`nx build platypus`

To test:

`nx test platypus`

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
