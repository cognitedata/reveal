# copilot

This is the Copilot "wrapper" subapp for Fusion.

This wrapper largely just provides a mounting point for the [`copilot-core`](../../libs/copilot-core/README.md) which also contains the main code for the UI, business logic and communication between applications.

To have the copilot feature on Fusion, you would also need to have this feature flag enabled for your project (`userId IN [xxx]`) here https://unleash-apps.cognite.ai/projects/default/features/COGNITE_COPILOT.

## Running application in fusion

1. Start local development server
   ```
   nx serve copilot
   ```
2. Navigate to [dev.fusion.cogniteapp.com](dev.fusion.cogniteapp.com)
3. Run `importMapOverrides.enableUI()` in the console
4. Click the <img width="32" valign="bottom" src="https://user-images.githubusercontent.com/6615090/165697621-dc80186c-2bdc-4f1c-90a1-d7ab4f985efc.png"> button that appears in the bottom right corner
5. Find `@cognite/cdf-copilot` module name and click on the row including it
6. Override using `https://localhost:3012/index.js` (port might differ depending on your local settings)
7. Click `Apply override` and refresh ✨

## Running application against mock server

1. Start your app by passing the configuration parameter
   ```
   NODE_ENV=mock nx serve copilot --configuration mock
   ```
2. Start the mock server `nx serve mock-server`
3. Open browser on `https://localhost:3012/test-app`

## Troubleshooting

### I get "Refused to load the script `https://localhost:3012/index.js"` error when I apply a subapp override

1.  Open `https://localhost:3012/index.js` in a new tab.
2.  Ignore the security warning and click “Proceed to site”.
3.  Go back to dev.fusion.cogniteapp.com and refresh 🔄

To avoid doing this multiple times, enable this flag on Chrome:
[chrome://flags/#allow-insecure-localhost](chrome://flags/#allow-insecure-localhost)

## Testing

```
nx test copilot
```

## Internationalization with Locize in Fusion

Follow the guide [here](https://cognitedata.atlassian.net/wiki/spaces/CE/pages/3519545557/Internationalization+with+Locize+in+Fusion)