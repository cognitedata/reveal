# fusion-shell

This app is the entry point for the CDF (Cognite Data Fusion) front-end.

**Short summary**
It's a microfrontend architecture that uses [Single SPA](https://github.com/single-spa/single-spa) to render it's sub-apps.

This app is basically the "shell" for loading and unloading sub-apps in addition to render:
- Redirect page
- Login page
- Navigation (top bar, menu, profile page)

[Single-SPA](https://single-spa.js.org/) is a framework for developing micro-frontends. It uses SystemJS to load and bundle sub-apps.

The idea is to devide the app into smaller sub-apps and be able to build, deploy and load them individually.

# Development

Use one of the following commands to run the fusion-shell locally:
- `nx serve fusion-shell`
- `nx preview fusion-shell`

## Working on the host application

Important config files can be found here:

- `src/appManifestData.json` - JSON file that contains information about all sub-apps, hosting location and routes.
- `index.html` - Includes the base import map containing react, react-dom and single-spa.
- `vite.config.ts` - Runs scripts during development and build to generate import maps for all sub-apps.

### Where can I find the configs from cdf-hub in fusion-shell?

For fusion-shell, we combined several apps into one (navigation, root-config, root-page...etc.).

**To add a new sub-app**
Now everything is on one place, just edit `src/appManifestData.json` file and append/edit your app.

For example:

```JSON
{
  "key": "cdf-vision-subapp",
  "appName": "@cognite/cdf-vision-subapp",
  "hosting": {
    "staging": "https://cdf-vision-staging.web.app",
    "preview": "https://cdf-vision-preview.web.app",
    "production": "https://cdf-vision-prod.web.app"
  },
  "routes": [ { "route": "/:tenantName/vision" } ]
}
```

**key** - your app name key, used for registering your app, naming folders...etc.
**appName** - your app name/package name or previously `resolveToKey` that is used to reference and load the app on runtime
**hosting** - control for which env you will load which app. Example for single branch strategy it will always point to `prod`
**routes** - register the routes you want to use to load your app.

### Build host app

Run `nx build fusion-shell`.

The build command will also build & bundle the libraries cdf-sdk-singleton and cdf-route-tracker. See `project.json` for more info.

## Working on sub-apps

### How to test or preview your sub-app

[Youtube guide](https://www.youtube.com/watch?v=vjjcuIxqIzY&list=PLLUD8RtHvsAOhtHnyGx57EYXoaNsxGrTU&index=4)

1. Use https://dev.fusion.cogniteapp.com or fusion-shell locally through (`nx serve fusion-shell`)
2. Open devtools
3. In the console type: `importMapOverrides.enableUI()` (This sets some variables in localstorage)
4. On the bottom right click the "{...}"-button
5. Select your micro-frontend that you want to override.
6. Type in "https://localhost:3000/<your-micro-frontend-js-bundle.name>.js
7. Refresh the browser

Enjoy!

# Running and testing app locally

## Serving the host app

To serve the host app, just run `nx serve fusion-shell`.
Check out `project.json` for other configurations.

# Deployments

Deployments is done through Spinnaker. Jenkins will build a dockerimage containing fusion-shell, and subapps will be loaded runtime directly from their hosting URL (e.g. Firebase). The same docker image is used across all environments, and nginx is serving a different import map depending on which environment is in use.

## Sub-Applications

- [cdf-ui-extractor-downloads](/apps/extractor-downloads)
- [cdf-ui-raw-explorer](/apps/raw-explorer)
- [cdf-ui-transformations](/apps/transformations)
- [cdf-ui-3d-management](/apps/3d-management)
- [cdf-ui-extraction-pipelines](https://github.com/cognitedata/cdf-ui-extraction-pipelines)
- [cdf-ui-entity-matching](/apps/extraction-pipelines)
- [cdf-ui-interactive-diagrams](/apps/interactive-diagrams)
- [cdf-ui-vision](/apps/vision)
- [cdf-ui-document-search](/apps/cdf-document-search)
- [cdf-ui-data-exploration](/apps/data-exploration)
- [platypus](/apps/platypus)
- [cdf-ui-templates](https://github.com/cognitedata/cdf-ui-templates)
- [cdf-ui-functions](/apps/functions-ui)
- [cdf-ui-charts](/apps/charts)
- [cdf-ui-access-management](/apps/access-management)
- [cdf-ui-data-catalog](/apps/data-catalog)
- [cdf-ui-onboard-infield](https://github.com/cognitedata/cdf-ui-onboard-infield)
- [cdf-ui-dashboard-sessions](https://github.com/cognitedata/cdf-ui-dashboard-sessions)

## How to deploy your micro frontend

Each sub-app will be bundled with webpack and should be uploaded to firebase.
The map can be found in the Jenkins file on root.

### Revert a deployment

The host app uses virtual paths to resolve the sub-app files. They are served directly from Firebase.
To revert, go to firebase console and revert the deployment directly from there.

# E2E tests

E2E tests are running on CI where we have the clientId and clientSecret as repository secrets available so that we can get access token.
The token is fetched before cypress tests are started and is valid for the whole session. The code is here:
`apps/fusion-shell-e2e/cypress.config.ts`

After we get the access token, we are injecting a global function (testAuthOverrides) to the window object. This function later is used by the `cdf-sdk-sigleton` and it is returning the token mentioned from above.
The code for that is here:
`apps/fusion-shell-e2e/src/support/injectToken.ts`

If you want to run cypress test locally, you will need to get hold of a clientId/ClientSecret pair.

Get the clientId/ClientSecret from `cog-dss` (data science team, ask someone from data-exploration to send you an invite). use [this guide](../platypus-cdf-cli/LOGIN.md) to create clientId/ClientSecret

After this step, you can run cypress. This is the command that is executed on CI
`DATA_EXPLORER_CLIENT_ID=<your-client-id> DATA_EXPLORER_CLIENT_SECRET=<your-client-secret> nx run fusion-shell-e2e:e2e:ci --watch`
