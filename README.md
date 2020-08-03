# Functions UI

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

- clone the Data Studio repository - `git clone https://github.com/cognitedata/functions-ui.git`
- `yarn` -> `yarn start`
- navigate to [dev.fusion.cogniteapp.com](dev.fusion.cogniteapp.com)
- open Console
- in the Console, use `importMapOverrides.enableUI()` command
- click on the `{...}` icon that appeared in the bottom right corner
- find `@cognite/cdf-functions-ui` module name and click on the row including it
- in the override URL, paste `https://localhost:3009/index.js` (port might differ depending on your local settings)
- click `Apply override`
- your local code is now available under the `dev.fusion.cogniteapp.com` address

## Running local copy offline

- clone [CDF-hub](https://github.com/cognitedata/cdf-hub) - `git clone https://github.com/cognitedata/cdf-hub.git`
- `yarn` -> `yarn bootstrap` -> `yarn start`
- clone the Data Studio repository - `git clone https://github.com/cognitedata/functions-ui.git`
- `yarn` -> `yarn start
