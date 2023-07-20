# fusion-shell

![fusion architecture](tools/docs/cdf-architecture-diagram.png)

This repository is the entry point for the CDF (Cognite Data Fusion) front-end.

**Short summary**
It's a microfrontend hybrid architecture that uses [Single SPA](https://github.com/single-spa/single-spa) and [Module Federation](https://webpack.js.org/concepts/module-federation/).

The `SingleSPA` part is to support loading older/legacy sub-apps and `Module Federation` to load the new updated sub-apps.

It's basically a "shell" for managing the rest of the front-ends we call sub-applications.
Having them separate means we can develop these sub-applications in isolation.

`SingleSPA` is a framework for developing micro-frontends. It uses SystemJS to load and bundle sub-apps, usually requires custom webpack config to get things running.
`Module Federation` is a concept based on software modularity. It involves the division of software into smaller, independent modules that can be connected together to create powerful, scalable applications.

The idea is to devide the app into smaller sub-apps and be able to build, deploy and load them individually.

# Development

A good starting point to understand how the current solution works is to read the architecture document on Confluence.

You can read more here:
https://cognitedata.atlassian.net/wiki/spaces/CE/pages/3613917310/Fusion+as+a+unified+Platform+UI

The current solution is developed to support deployments to both `fusion.cognite.com` and `apps.cognite.com/cdf`. Fusion one is deprecated and will be removed in near future.

## Working on the host application

If you need to work on a part of the app that is using single-spa, here are the most important files for single-spa:

- `src/app/single-spa` - folder that contains everything related for single-spa
- `src/import-map.json` - JSON file that contains import map for core libs like react, sdk-singleton...etc.
- `src/sub-apps-import-map.json` - JSON file that contains import map for sub-apps. This is a manifest file, the actual file is generated on compile time/on fly. It points to a virtual file paths that are resolved by a proxy server.

### Build host app

Run `nx run fusion-shell:build:<configuraion-target>` ex `nx run fusion-shell:build:staging`.

The build command for the host app includes several custom steps:

- `build` command is called, which calls `internal-build`, `build cdf-sdk-singleton` as SystemJS package and `fusion-post-build.sh` which does post-build processing
- `internal-build` does the regular app build using the webpack config and sets public path and assets path depending if the build is for fusion or cdf
- `fusion-post-build.sh` copies the build from sdk-singleton, route-tracker..etc into the `dist/apps/fusion-shell/assets/dependencies/@cognite` folder. Those are SystemJS libs needed for SingleSPA stuff
  - Additionally, it generates updated `import-map.json` and `sub-apps-import-map.json` files with the corect paths

## Working on sub-apps

Each sub-app is going to be different and it really depends if the sub-app uses single-spa or module federation.

### Building a subapp with Create React App

- With rescripts we can adjust the webpack config slightly to support the output to match single-spa

Example:
[DEMO REPO](https://github.com/cognitedata/unified-cdf-ui-demo-app)

### How to test or preview your sub-app

[Youtube guide](https://www.youtube.com/watch?v=vjjcuIxqIzY&list=PLLUD8RtHvsAOhtHnyGx57EYXoaNsxGrTU&index=4)

1. Use https://dev.fusion.cogniteapp.com/
2. Open devtools
3. In the console type: `importMapOverrides.enableUI()` (This sets some variables in localstorage)
4. On the bottom right click the "{...}"-button
5. Select your micro-frontend that you want to override.
6. Type in "https://localhost:3000/<your-micro-frontend-js-bundle.name>.js
7. Refresh the browser

Enjoy!

# Running and testing app locally

## Serving the host app

To serve the host app, just run `nx serve fusion-shell --configuration=<desired-config>`.
This will run the app completley in isolation and will proxy the API calls to mock server.

You can also serve the app against mock environment.

1. Start the mock server `nx serve mock-server`
2. Start the app using mock env `nx serve fusion-shell --configuration=mock`
3. Navigate to `https://localhost:8080/cdf/platypus?cluster=greenfield.cognitedata.com&organization=cog-appdev`

`Note: When running locally, we are configuring the proxy for the sub-apps in the webpack-dev-server. This is the same proxy for firebase functions when app is deplyed on prod/staging`

## Serving the build

If you want preview and test the build from `staging, preview, prod` environments

1. Run `nx run fusion-shell:serve-static` - this will build the app first and then run local server
2. Navigate to `http://localhost:8080/cdf/platypus?cluster=greenfield.cognitedata.com&organization=cog-appdev`

`Note: API requests will be forwarded to mock server or you need to login to test the API calls`

## Firebase functions and emulators

For fusion-shell, we are using firebase functions (cdfProxy) for proxying the calls to sub-apps.
The goal that we want to achieve is to be able to deploy sub-apps without redeploying host-app and serve them from firebase.
The proxy is needed because we need to serve the scripts and static files from same domain and also we don't want to expose the firebase domain for sub-apps.

To test locally how the app is going to work in firebase follow this steps:

- Install `firebase-tools` globally
- Build fusion shell `nx build fusion-shell`
- Login to firebase `firebase login` (optional)
- Edit firebase.json and change "hosting->site" to `"public": "../../dist/apps/fusion-shell",`
- Run `firebase emulators:start` and open http://localhost:8080/cdf/platypus in browser

# Deployments

## Environments

We are supporting fusion and unified sign-in environments.

**Fusion environments**

| Env Name     | Env file location                                                                    | URL                                                                 |
| ------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| dev          | `apps/fusion-shell/src/environments/fusion/dev/environment.dev.ts`                   | [dev.fusion.cogniteapp.com](https://dev.fusion.cogniteapp.com)      |
| next-release | `apps/fusion-shell/src/environments/fusion/next-release/environment.next-release.ts` | [next-release.cognite.com](https://next-release.fusion.cognite.com) |
| staging      | `apps/fusion-shell/src/environments/fusion/next-release/environment.next-release.ts` | [staging.fusion.cognite.com](https://staging.fusion.cognite.com)    |
| production   | `apps/fusion-shell/src/environments/fusion/production/environment.prod.ts`           | [fusion.cognite.com](https://fusion.cognite.com)                    |

**Unifed Signin environments**

| Env Name   | Env file location                                                                       | URL                                                              |
| ---------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| staging    | `apps/fusion-shell/src/environments/unified-signin/next-release/environment.staging.ts` | [apps-staging.cognite.com](https://apps-staging.cognite.com/cdf) |
| preview    | `apps/fusion-shell/src/environments/unified-signin/preview/environment.preview.ts`      | [apps-preview.cognite.com](https://apps-preview.cognite.com/cdf) |
| production | `apps/fusion-shell/src/environments/unified-signin/production/environment.prod.ts`      | [apps.cognite.com](https://apps.cognite.com/cdf)                 |

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
