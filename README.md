# Fusion

[![Confluence](https://img.shields.io/badge/Confluence-blue)](https://cog.link/devx)
[![codecov](https://codecov.io/gh/cognitedata/fusion/branch/master/graph/badge.svg?token=ClP7PLfMI8)](https://codecov.io/gh/cognitedata/fusion)

This monorepository provides centralized management of Cognite Data Fusion Platform applications and reusable packages.

## Setup

First, Install Nx with npm:

Make sure the nx is on version 16.x.x!

`npm install -g nx`

Then you can install the node_modules by running

```
yarn
```

_Note: If you're on an Apple M1 machine, make sure your Node version is >= 16_

## CI/CD

_We use mostly GitHub Actions for our CI and CD but Jenkins is being used to deploy [fusion-shell](./apps/fusion-shell/README.md) to Spinnaker._

### Fusion environments

Fusion have several environments:

- Production (https://fusion.cognite.com)
- Staging (https://staging.fusion.cognite.com)
- Next-release (https://next-release.fusion.cognite.com)
- Dev (https://dev.fusion.cogniteapp.com)
- Preview (https://fusion-pr-preview.cogniteapp.com)

It's useful to understand how these environments differs. Let's understand how next-release works.
We then look into the [jsonnet file](./apps/fusion-shell/manifests/fusion.next-release.jsonnet) which generates the Kubernetes manifest for this environment. We see the following line:

```jsonnet
local subapps_import_map = "/subapps-import-map-preview.json";
```

telling us next-release uses the preview version for all sub-apps.

To understand what that means, we look into [this configuration](./apps/fusion-shell/src/appManifestData.json). Every sub-app has an entry in this file and we can see how we resolve sub-apps for the three environments staging, preview and production.

### Deployment

#### Fusion sub-apps

We use [Firebase Hosting](https://firebase.google.com/docs/hosting) to host sub-apps. To deploy a sub-app from CD pipeline to Firebase, you need to add the following to the project.json file:

```
"pipeline": {
  "releaseStrategy": "single-branch",
  "previewPackageName": "@cognite/cdf-3d-management"
}
```

By default this will deploy the app to the `fusion-217032465111` Firebase project and `cdf-${app-name}-${environment}` Firebase site.

If you want to deploy to a different Firebase project or site, you can add the following to the app's project.json file:

```
"pipeline": {
  "firebaseProjectId": "fbhosting-217032465111",
  "firebaseSite": "cognite-flexible-data-explorer"
}
```

#### Fusion shell

Jenkins CD builds a Docker image for fusion-shell containing **only** the shell application. The deployment of the docker image happens through Cognite's standard Spinnaker setup.

> [!NOTE]  
> Sub-apps are loaded dynamically on runtime from Firebase.

The shell will automatically be rolled out to all Fusion environments except for production. To roll out to production, you would need to go to the [Spinnaker UI](https://spinnaker.cognite.ai/#/applications/fusion-app/executions) and manully promote the deployment to production.

#### Revert a bad deployment

If you want to revert a sub-app, then this should take place in the Firebase UI. See documentation for it [here](https://firebase.google.com/docs/hosting/manage-hosting-resources#roll-back). You would need to be an editor in Firebase. Permission for Firebase is defined [here](https://github.com/cognitedata/terraform/blob/b97fb3bf4d88f24c8a4ba87ea8163cd28c95eed2/cognitedata-production/gcp_fusion_firebase_hosting/project.tf#L58-L80).

Firebase project links:

- [Production](https://console.firebase.google.com/project/fusion-217032465111/hosting/sites)
- [Preview](https://console.firebase.google.com/project/fusion-217032465111-preview/hosting/sites)
- [Staging](https://console.firebase.google.com/project/fusion-217032465111-staging/hosting/sites)

Rolling back a deployment in Firebase will have immediate effect on the corresponding Fusion site (staging, preview, production).

For the fusion-shell, we revert in [Spinnaker](https://spinnaker.cognite.ai/#/applications/fusion-app/executions). Infrastructure could help here if no-one else can help you.

> [!NOTE]  
> Reverting in Firebase & Spinnaker isn't permanent. You still need to fix the bug in Git.

### Preview

By default the CI pipeline will _`lint`_, _`test`_ and _`build`_ **app** and **storybook**. Preview links will be created for the app and storybook build.

If your app is a Fusion subapp you need to add the following to the project.json file:

```
"pipeline": {
  "previewPackageName": "{the package name needed to override systemjs import map}"
}
```

### i18n

To enable pushing i18n keys to `locize` you need to add the following to the project.json file:

```
"pipeline": {
  "i18n": true,
}
```

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

# Running Preview Server in PR

A link it is going to be generated into each pull request with dynamic link that will allow you to live preview your changes.
The link it will be something like this:
https://fusion-pr-preview.cogniteapp.com/?externalOverride=@cognite/cdf-solutions-ui&overrideUrl=https://platypus-123.fusion-preview.preview.cogniteapp.com/index.js

Once you are logged in, just click on solutions from dashboard and you should be able to see platypus app.

Breakdown:

- fusion-pr-preview.cogniteapp.com - server where the app is running dedicated for PR previews
- externalOverride - overrides the `signle-spa` import mapping to load the file from `overrideUrl`
- overrideUrl - url where your compiled SystemJS file is deployed

# Testing your app production build locally

If you ever need to debug the production/staging build before is being deployed on fusion locally, here are the steps how to do it:

- Install `http-server` globally
- build the app locally `yarn build preview platypus` (platypus is the name of the app)
- Copy SSL certificates - you can use the ones in mock server/src/
- Navigate to `build` folder and run the app `http-server --ssl -C server.crt -K server.key --cors`
- Finally, just add the override in fusion

# Platypus CLI

Read more [here](./apps/platypus-cdf-cli/README.md)

# Mock Server

We have developed a mock server that can be used for local development and used for running E2E tests.

Read more [here](./apps/mock-server/README.md) how to use it or serach on confluence.

To run, use following command:
`nx serve mock-server`

Server will be running on following URL: http://localhost:4002

If you want to pass CLI arguments using nx serve, you can use `--args=` and pass the args that you want.

Example:
`nx serve mock-server --args="./data-provider.js --config=./mock-server-config.js --port=4001"`

To run Platypus using the mock server, start the mock server and then run:

`yarn start mock platypus`

# Storybook testing

As described in [UI Testing at Cognite](https://cognitedata.atlassian.net/wiki/spaces/GA/pages/4055597906/UI+Testing+at+Cognite), we use Storybook to develop components and run interaction tests. To use Storybook's interactions UI and run tests, a project needs some configuration in Nx. You can run the following Nx command to help with the setup:

```sh
nx g @nx/react:storybook-configuration project-name --interactionTests=true
```

This will add Storybook setup to your project if you don't already have it, and it will add test-related targets to your project's `project.json` if you already have Storybook enabled but not tests. After running that command, ensure the following:

- you have `@storybook/addon-interactions` in the `addons` array in `<project-name>/.storybook/main.ts`
- you have the following targets defined in your project's `project.json`: `storybook`, `build-storybook`, `static-storybook`, `test-storybook`

You can look at `simint` as an example: https://github.com/cognitedata/fusion/blob/master/apps/simint/project.json

Tests can be written in each story as part of the `play` function, as documented [here](https://storybook.js.org/docs/react/writing-tests/interaction-testing). When you start up Storybook locally, you can see the test runs in the Storybook UI in the interactions tab.

To run tests on the command line, you'll need to run storybook in one terminal (`yarn nx storybook project-name`) and run the tests in another terminal (`yarn nx test-storybook project-name`). Alternatively, you can serve a static storybook (`yarn nx static-storybook project-name`) build and run the tests against that.

# E2E Testing

We use cypress to run our e2e test suite. e2e tests for a project are typically in a separate e2e project, for example `simint` tests are in `simint-e2e`. Tests run against a live project and there are two ways of authenticating, namely with a **user** token or a **client** token. The user token will more closely mimic a real user accessing the application and doesn't need as much mocking as the client token, but you'll need to use the `e2e-greenfield` project in this case since it is set up without two factor authentication. To test against other projects, you can use a client token. With a client token you may have to mock any calls that fetch user data ([example](apps/simint/src/hooks/useUserInfo.ts)).

## Setup

### With user token

If using a user token, you'll need the follow env vars set in your e2e project's `project.json` as part of the e2e target ([example](apps/charts-e2e/project.json)):

```json
{
  "ORG": "cog-e2e",
  "PROJECT": "e2e-greenfield",
  "CLUSTER": "greenfield.cognitedata.com",
  "IDP_INTERNAL_ID": "09f375ff-13b6-4d58-95fd-869b098d4808"
}
```

Next, do the following:

- Set `COG_E2E_AAD_USERNAME_1` and `COG_E2E_AAD_PASSWORD_1` in a `.env.local` file in the e2e project folder. Reach out to someone in `#topic-testing` if you need these.
- Ensure you export those variables as well as `targetAppPackageName` in `e2e-project-name/src/config.ts` ([example](apps/charts-e2e/src/config.ts)).
- Use `loginWithAADUserCredentials` in your `e2e-project-name/src/support/e2e.ts` ([example](apps/industry-canvas-ui-e2e/src/support/e2e.ts))

_Note: You can find the IDP Internal ID here https://github.com/cognitedata/domain-login-configuration-service/blob/main/data/idps.json, or by right clicking and inspecting the sign in button on the login page, which has an attribute `data-testid`._

### With client token

If using a client token, you'll need to choose a project to test against and set the follow env vars set in your e2e project's `project.json` as part of the e2e target ([example](apps/simint-e2e/project.json)):

```json
{
  "ORG": "your org",
  "PROJECT": "your project",
  "CLUSTER": "your cluster",
  "TENANT": "your tenant"
}
```

Next, do the following:

- Set a client ID and secret in a `.env.local` file in the e2e project folder. If you're testing against a project already used by another e2e test project, you can use the client ID and secret that are already in Github secrets. If you're testing against a new project, you'll need to have the client ID and secret added to Github secrets with unique names and use the same names in your `.env.local`. Reach out to someone in `#topic-testing` for assistance in setting the secrets in Github.
- Ensure you export those variables in `e2e-project-name/src/config.ts` ([example](apps/simint-e2e/src/config.ts)).
- Use `loginWithAADClientCredentials` in your `e2e-project-name/src/support/e2e.ts` ([example](apps/simint-e2e/src/support/e2e.ts))

## Run the tests

To run the tests locally, first serve a local instance of `fusion-shell`:

```sh
yarn nx run fusion-shell:preview:production
```

Then, in another terminal, run the e2e test target for your e2e project:

```sh
# for example: yarn nx e2e simint-e2e
yarn nx e2e project-name
```

That command will run the e2e tests headlessly against the locally running fusion shell (`https://local.cognite.ai:4200/`) but with an override using your locally served project's bundle (e.g. `https://localhost:3000/index.js`). To run the tests in headed mode, i.e. in the Cypress UI, run the above command with `--watch`.

## Platypus e2e tests

To run the platypus e2e tests from the terminal using a headless browser, make sure the mock server is running, and then from another terminal window, run:

`NODE_ENV=mock nx run platypus-e2e:e2e`

To run them in the Cypress GUI:

`NODE_ENV=mock nx run platypus-e2e:e2e --watch`

You can optionally run the e2e tests using the `Nx Console` VSCode extension by clicking to run `e2e` and then choosing the `platypus-e2e` project.

### Deploy a NPM library

You will have to update the `project.json` file for your library and add an executor which will be picked up by the Jenkins pipeline, consider that you will only get the package deployed when you change the version in the `package.json` file.

Inside the project.json file you should add an entry like this in the targets object:

```
"npm": {
      "executor": "nx:run-commands",
      "dependsOn": ["build"],
      "options": {
        "outputPath": "{--- outputPath. i.e: dist/libs/shared/myLib  ----}",
        "commands": ["./scripts/npm.sh"]
      }
    },
```

## Setup for M1 machines

If you're on an Apple M1 machine, you need to do a bit of extra setup to get Cypress to run using Rosetta 2. You can follow [these instructions](https://www.cypress.io/blog/2021/01/20/running-cypress-on-the-apple-m1-silicon-arm-architecture-using-rosetta-2/) and then use the above commands from your terminal running Rosetta.
