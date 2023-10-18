# Context UI P&ID

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

- clone the Context UI P&ID repository - `git clone https://github.com/cognitedata/context-ui-pnid.git`
- `yarn` -> `yarn start`
- navigate to [dev.fusion.cogniteapp.com](dev.fusion.cogniteapp.com)
- open Console
- in the Console, use `importMapOverrides.enableUI()` command
- click on the `{...}` icon that appeared in the bottom right corner
- find `@cognite/cdf-context-ui-pnid` module name and click on the row including it
- in the override URL, paste `https://localhost:3017/index.js` (port might differ depending on your local settings)
- click `Apply override`
- your local code is now available under the `dev.fusion.cogniteapp.com` address

## Running application in fusion

1. Start local development server
   ```
   nx serve interactive-diagrams
   ```
2. Navigate to [dev.fusion.cogniteapp.com](dev.fusion.cogniteapp.com)
3. Run `importMapOverrides.enableUI()` in the console
4. Click the <img width="32" valign="bottom" src="https://user-images.githubusercontent.com/6615090/165697621-dc80186c-2bdc-4f1c-90a1-d7ab4f985efc.png"> button that appears in the bottom right corner
5. Find `@cognite/cdf-context-ui-pnid` module name and click on the row including it
6. Override using `https://localhost:3010/index.js` (port might differ depending on your local settings)
7. Click `Apply override` and refresh ✨

## Running local copy offline

- clone [CDF-hub](https://github.com/cognitedata/cdf-hub) - `git clone https://github.com/cognitedata/cdf-hub.git`
- `yarn` -> `yarn bootstrap` -> `yarn start`
- clone the Context UI P&ID repository - `git clone https://github.com/cognitedata/context-ui-pnid.git`
- `yarn` -> `yarn start

## Running the preview

```
cdf-ui-cli -pr -b cdf-hub-dev -p @cognite/cdf-context-ui-pnid -o index.js -d ./build
```

## E2E Testing

Read [Setup](https://github.com/cognitedata/fusion#setup-1) for setup the credentials.

### Run the tests

To run the platypus e2e tests from the terminal using a headless browser, make sure the [mock server is running](https://github.com/cognitedata/fusion#run-the-tests), and then from another terminal window, run:

`nx run interactive-diagrams:e2e`

To run them in the Cypress GUI:

`nx run interactive-diagrams:e2e --watch`

You can optionally run the e2e tests using the `Nx Console` VSCode extension by clicking to run `e2e` and then choosing the `interactive-diagrams` project.

## Help

If you have any questions related to frontend development, please join us in [#frontend] and ask away!
If you have any questions related to fusion development, please join us in [#cdf-ui-devs] and ask away!

[React](https://reactjs.org/)

[React testing library](https://testing-library.com/docs/react-testing-library/intro)

[Wiki; all you need to know about unified cdf ui](https://cog.link/cdf-frontend-wiki)

[Core cdf ui repo](https://github.com/cognitedata/cdf-hub)

[#frontend slack channel](https://cognitedata.slack.com/archives/C6KNJCEEA)

[Create repo page](https://github.com/organizations/cognitedata/repositories/new)
