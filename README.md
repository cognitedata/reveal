# Data Exploration

## Running locally

1. Start local development server
   ```
   yarn
   yarn start
   ```
2. Navigate to [dev.fusion.cogniteapp.com](dev.fusion.cogniteapp.com)
3. Run `importMapOverrides.enableUI()` in the console
4. Click the <img width="32" valign="bottom" src="https://user-images.githubusercontent.com/6615090/165697621-dc80186c-2bdc-4f1c-90a1-d7ab4f985efc.png"> button that appears in the bottom right corner
5. Find `@cognite/cdf-data-exploration` module name and click on the row including it
6. Override using `https://localhost:3010/index.js` (port might differ depending on your local settings)
7. Click `Apply override` and refresh ✨

## Troubleshooting

### I get "Refused to load the script `https://localhost:3010/index.js"` error when I apply a subapp override

1.  Open `https://localhost:3010/index.js` in a new tab.
2.  Ignore the security warning and click “Proceed to site”.
3.  Go back to dev.fusion.cogniteapp.com and refresh 🔄

To avoid doing this multiple times, enable this flag on Chrome:
[chrome://flags/#allow-insecure-localhost](chrome://flags/#allow-insecure-localhost)

## Testing

```js
yarn test
```

For non-interactive single run:

```js
yarn test:once
```

## Releasing a new version to Fusion

The release process is documented on the [How to release](https://cognitedata.atlassian.net/wiki/spaces/DEGEXP/pages/3830743065/How+to+release) page
