# Document Search UI

This repo hosts the document classifiers frontend for the Unstructured Search API.

## Requirements

Configure your environment as described on [this Confluence page](https://cognitedata.atlassian.net/wiki/spaces/COG/pages/711950382/Nvm+npm+node+setup). This will give you the `nvm`, `npm` and `yarn` commands.

We currently use node version `12.19.0`. Ensure you are using this version by doing:

```
nvm install 12.19.0
nvm use 12.19.0
```

## Useful commands

### Build and run

```js
yarn
yarn start
```

### Testing

```js
yarn test
yarn test:once:unittests      # non-interactive, single run
```

## Running locally

The Document Search UI can be run locally, using [dev.fusion.cogniteapp.com](https://dev.fusion.cogniteapp.com). In order to enable this, perform the following steps:

1. Run the document search microfrontend locally with `yarn start`
2. Visit [https://localhost:3016/index.js](https://localhost:3016/index.js) and accept the certificate.
3. Navigate to [dev.fusion.cogniteapp.com](https://dev.fusion.cogniteapp.com) with your browser.
4. Open the console and run `importMapOverrides.enableUI()`.
5. Open the `Import Map Overrides` overlay by pressing the `{...}` button that has appeared in the bottom right corner of the page.
6. Press `Add new module`
7. Enter Module Name: `@cognite/cdf-document-search-ui`
8. Enter Override URL: `https://localhost:3016/index.js`
9. Press `Apply override`
10. Edit the url bar in the browser, and add `/documents` at the end of the path. Example: if you are using the `unstructured-search` tenant, the full url should be: `https://dev.fusion.cogniteapp.com/unstructured-search/documents?env=greenfield`

## Deploying

When you have merged your PR, and the CD jenkins has run successfully, there are a couple more steps that need to be done before your change becomes visible in fusion:

1. Trigger this build: https://cd.jenkins.cognite.ai/job/cognitedata-cd/job/cdf-hub/job/master/ This will make your change visible on https://staging.fusion.cognite.com, but not on https://fusion.cognite.com
2. To deploy the change to production, approve this pipeline: https://spinnaker.cognite.ai/#/applications/fusion-app/executions

## Questions?

Head on over to our Slack channel at [#topic-document-search](https://cognitedata.slack.com/archives/CKY04V4CA).
