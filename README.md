# Fusion

[![Confluence](https://img.shields.io/badge/Confluence-blue)](https://cog.link/devx)
[![codecov](https://codecov.io/gh/cognitedata/fusion/branch/master/graph/badge.svg?token=ClP7PLfMI8)](https://codecov.io/gh/cognitedata/fusion)

This monorepository provides centralized management of Cognite Data Fusion Platform applications and reusable packages.

## Setup

First, Install Nx with npm:

Make sure the nx is on version 13.x.x!

`npm install -g nx`

Then you can install the node_modules by running

```
yarn
```

_Note: If you're on an Apple M1 machine, make sure your Node version is >= 16_

## CI/CD

_We use GitHub Actions for our CI and CD_

### Deployment

To deploy the application from CD pipeline to firebase hosting, you need to add the following to the project.json file:

```
"release": {
  "releaseStrategy": "multi-branch" // or "single-branch"
}
```

By default this will deploy the app to the `fusion-217032465111` firebase project and `cdf-${app-name}-${environment}` firebase site.

If you want to deploy to a different firebase project or site, you can add the following to the project.json file:

```
"release": {
  "firebaseProjectId": "fbhosting-217032465111",
  "firebaseSite": "cognite-flexible-data-explorer"
}
```

### Preview

By default the CI pipeline will _`lint`_, _`test`_ and _`build`_ **app** and **storybook**. Preview links will be created for the app and storybook build.

If tour app is a fusion subapp you need to add the following to the project.json file:

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

# Platypus App

You can find the code under `apps/platypus`.

## Running Platypus locally

For development, you can use either `development` or `fusion` environments. The default environment is `development`, which runs the app standalone outside of the CDF Fusion platform app. To use this environment, run:

```
yarn
yarn start
```

### How to run Platypus app in Fusion app

You can run the app as part of the Fusion UI (CDF Fusion platform app). This is the best way to test and verify your app, however, it doesn't provide the best experience for developing locally. For instance there is no HMR (hot module replacement).

To use it, first serve your bundle locally by running `yarn start fusion`.

Your bundle should now be hosted at https://localhost:3000/index.js. You can go there to verify. A bunch of javascript should show up.

Then show it in unified CDF UI by following these steps:

- Go to [https://cog-appdev.dev.fusion.cogniteapp.com/](https://cog-appdev.dev.fusion.cogniteapp.com/)
- Open devtools
- In the console type: `importMapOverrides.enableUI()` (This sets some variables in localstorage)
- On the bottom right click the "{...}"-button
- Select @cognite/cdf-solutions-ui
- Type in "https://localhost:3000/index.js"
- Refresh the browser

Voila!

## Running Platypus app against mock environment

You can run platypus as standalone application against mock server. This means that the app will be running as any other regular CRA application, however the requests to cdf will be mocked and instead will be sent to mock server.

How to use the mock environment:

- Run the app with `yarn start mock`
- Run mock server `nx serve mock-server`
- Open app as regularly you do on [https://localhost:3000/platypus](https://localhost:3000/platypus)
- Everything should be there and working

## Toggling DMS versions

The app will use the DMS V2 API by default. To use the DMS V3 API in local development, set the following in local storage: `ls.USE_FDM_V3: true`

## Additional commands

To build:

`nx build platypus`

To test:

`nx test platypus`

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

# E2E Testing

We use cypress to run our e2e test suite. To run them from the terminal using a headless browser, make sure the mock server is running, and then from another terminal window, run:

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

# Deploying to Fusion and all what you need to know

After your PR was merged on `master` and the subapp is released, to see the changes on any environment of Fusion, a build of cdf-ui-hub's master branch should be triggered.

### To trigger the deployment:

1. Go to [`cdf-ui-hub` on Jenkins CD](https://cd.jenkins.cognite.ai/blue/organizations/jenkins/cognitedata-cd%2Fcdf-ui-hub/branches).
2. Locate the `master` branch and click the `Run ▶️` button.
3. After the build is successful, the changes automatically will take effect on `dev.fusion.cogniteapp.com` and `next-release.fusion.cognite.com` if the new version matches the corresponding import maps.
4. To deploy to the production environment `fusion.cognite.com`, go to `staging.fusion.cognite.com` to verify that your changes work properly.
5. If everything looks alright, go to [Spinnaker](https://spinnaker.cognite.ai/#/applications/fusion-app/executions).
6. Locate the `deploy-fusion-app-prod` pipeline and verify the build by clicking `Continue`.

> For a more detailed explanation of this step, see the step-by-step guide [here](https://cognitedata.atlassian.net/wiki/spaces/CE/pages/3758588022/...deploy+a+new+sub-app+version+to+production).

### Useful links

Jenkins CD for `cdf-ui-hub`
[cdf-ui-hub cd](https://cd.jenkins.cognite.ai/job/cognitedata-cd/job/cdf-hub/job/master/)

To monitor Jenkins pipeline activity
[cdf-ui-hub Jenkins pipelines](https://cd.jenkins.cognite.ai/blue/organizations/jenkins/cognitedata-cd%2Fcdf-ui-hub/activity)

Spinnaker
[Spinnaker](https://spinnaker.cognite.ai/#/applications/fusion-app/executions)

CDF UI HUB Versions map. If you want to lock your app to a specific version, open a PR here:
[CDF UI HUB Prod Versions map](https://github.com/cognitedata/cdf-ui-hub/blob/master/packages/fas-apps/config/prod.fas-apps.import-map.json)
[CDF UI HUB Versions map](https://github.com/cognitedata/cdf-ui-hub/tree/master/packages/fas-apps/config)

Firebase database with versions for each app. We are keeping all the versions for all apps on firebase.
You can see them here, just filter using the name of your app:
[Cognite App Server Firebase Database](https://console.firebase.google.com/u/0/project/cognite-app-server/firestore/data/~2Fapps~2Fcdf-solutions-ui~2Freleases)

#### Troubleshooting

- I can not see my latest changes on dev.fusion or next-release

First verify you are previewing the correct deployment. Check the autogenerated number from your Jenkins PR.
For example, open Jenkins and find the version or folder where your build was uploaded. Should be something like `frontend-app-server-cognitedata-production/name-of-the-app/v.a32c74bc75a493b61e2e2cf5aeddc8f130ed5f63/`. Open your app in fusion and compare if the version that was served is the same as the one from your PR.
If not, then follow the steps above.

- I want to lock my app to a specific version
  See above `CDF UI HUB Versions map`.You will need to open a PR and specify which version you want to use.
  If you need to see the available versions from your app, check the `Cognite App Server Firebase Database` link.
