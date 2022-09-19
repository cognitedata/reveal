# Data Exploration

## Running locally

- Start local development server
  ```
  yarn
  yarn start
  ```
- Navigate to [dev.fusion.cogniteapp.com](dev.fusion.cogniteapp.com)
- Run `importMapOverrides.enableUI()` in the console
- Click the <img width="32" valign="bottom" src="https://user-images.githubusercontent.com/6615090/165697621-dc80186c-2bdc-4f1c-90a1-d7ab4f985efc.png"> button that appears in the bottom right corner
- Find `@cognite/cdf-data-exploration` module name and click on the row including it
- Override using `https://localhost:3010/index.js` (port might differ depending on your local settings)
- Click `Apply override` and refresh ✨

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

## Releasing a new version

Merging to `master` branch will automatically trigger a release of the subapp. After that is completed successfully, you need to trigger a CD build [here](https://cd.jenkins.cognite.ai/job/cognitedata-cd/job/cdf-hub/job/master/) for changes to take effect on fusion.cognite.com.

If you are releasing a new version of the subapp (ie. version in `package.json` has been updated), make sure the import map for the environment ([staging](https://github.com/cognitedata/cdf-hub/blob/master/packages/fas-apps/config/staging.fas-apps.import-map.json) or [production](https://github.com/cognitedata/cdf-hub/blob/master/packages/fas-apps/config/prod.fas-apps.import-map.json)) matches the version you want to release. If not, you need to update the version with a PR in cdf-hub repo to deploy your changes.

[Example PR (staging)](https://github.com/cognitedata/cdf-hub/pull/1471) • [Example PR (production)](https://github.com/cognitedata/cdf-hub/pull/1488)

Production releases are performed in two steps. After the deployment is triggered on the master branch CD (via a pull request or on Jenkins manually as mentioned above), the changes will be directly deployed to staging.fusion.cognite.com. fusion.cognite.com will only be updated after you press the manual OK in [Spinnaker](https://spinnaker.cognite.ai/#/applications/fusion-app-prod/executions).
