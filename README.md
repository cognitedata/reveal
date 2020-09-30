# [Data Exploration](https://cognitedata.github.io/data-exploration/?path=/docs/data-exploration--previewing-resources)

## Using the library

To use the `@cognite/data-exploration` library, check out the [storybook](https://cognitedata.github.io/data-exploration/?path=/docs/data-exploration--previewing-resources).

## Running Locally

```js
yarn
yarn start
```

Deployments are done via merging to `master`

## Testing

```js
yarn test
```

For non-interactive single run:

```js
yarn test:once:unittests
```

## Running local copy online

- clone the Data Studio repository - `git clone https://github.com/cognitedata/data-exploration.git`
- `yarn` -> `yarn start`
- navigate to [dev.fusion.cogniteapp.com](dev.fusion.cogniteapp.com)
- open Console
- in the Console, use `importMapOverrides.enableUI()` command
- click on the `{...}` icon that appeared in the bottom right corner
- find `@cognite/cdf-data-exploration` module name and click on the row including it
- in the override URL, paste `https://localhost:3010/index.js` (port might differ depending on your local settings)
- click `Apply override`
- your local code is now available under the `dev.fusion.cogniteapp.com` address

## Running local copy offline

- clone [CDF-hub](https://github.com/cognitedata/cdf-hub) - `git clone https://github.com/cognitedata/cdf-hub.git`
- `yarn` -> `yarn bootstrap` -> `yarn start`
- clone the Data Studio repository - `git clone https://github.com/cognitedata/data-exploration.git`
- `yarn` -> `yarn start
