# Document Search UI

This repo hosts the Admin UI frontend for the Unstructured Search API.

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
2. Navigate to [dev.fusion.cogniteapp.com](https://dev.fusion.cogniteapp.com) with your browser.
3. Open the console and run `importMapOverrides.enableUI()`.
4. Open the `Import Map Overrides` overlay by pressing the `{...}` button that has appeared in the bottom right corner of the page.
5. Press `Add new module`
6. Enter Module Name: `@cognite/cdf-document-search-ui`
7. Enter Override URL: `https://localhost:3016/index.js`
8. Press `Apply override`
9. Edit the url bar in the browser, and add `/documents` at the end of the path. Example: if you are using the `unstructured-search` tenant, the full url should be: `https://dev.fusion.cogniteapp.com/unstructured-search/documents?env=greenfield`
