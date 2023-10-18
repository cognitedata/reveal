# entity-matching

## Further steps:

https://cognitedata.atlassian.net/wiki/spaces/CE/pages/3682697292/...create+a+new+sub-app#Make-the-app-visible-in-Fusion

## Running application in fusion

1. Start local development server
   ```
   nx serve entity-matching
   ```
2. Navigate to [dev.fusion.cogniteapp.com](dev.fusion.cogniteapp.com)
3. Run `importMapOverrides.enableUI()` in the console
4. Click the <img width="32" valign="bottom" src="https://user-images.githubusercontent.com/6615090/165697621-dc80186c-2bdc-4f1c-90a1-d7ab4f985efc.png"> button that appears in the bottom right corner
5. Find `@cognite/cdf-ui-entity-matching` module name and click on the row including it
6. Override using `https://localhost:3010/index.js` (port might differ depending on your local settings)
7. Click `Apply override` and refresh ✨

## Running application against mock server

1. Start your app by passing the configuration parameter
   ```
   NODE_ENV=mock nx serve entity-matching --configuration mock
   ```
2. Start the mock server `nx serve mock-server`
3. Open browser on `https://localhost:3001/test-app`

## Troubleshooting

### I get "Refused to load the script `https://localhost:3001/index.js"` error when I apply a subapp override

1.  Open `https://localhost:3001/index.js` in a new tab.
2.  Ignore the security warning and click “Proceed to site”.
3.  Go back to dev.fusion.cogniteapp.com and refresh 🔄

To avoid doing this multiple times, enable this flag on Chrome:
[chrome://flags/#allow-insecure-localhost](chrome://flags/#allow-insecure-localhost)

## Testing

```
nx test entity-matching
```

## Internationalization with Locize in Fusion

Follow the guide [here](https://cognitedata.atlassian.net/wiki/spaces/CE/pages/3519545557/Internationalization+with+Locize+in+Fusion)
