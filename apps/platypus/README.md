# Platypus App


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


## E2E Testing

We use cypress to run our e2e test suite. To run them from the terminal using a headless browser, make sure the mock server is running, and then from another terminal window, run:

`NODE_ENV=mock nx run platypus-e2e:e2e`

To run them in the Cypress GUI:

`NODE_ENV=mock nx run platypus-e2e:e2e --watch`

You can optionally run the e2e tests using the `Nx Console` VSCode extension by clicking to run `e2e` and then choosing the `platypus-e2e` project.
