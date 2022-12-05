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

Releasing a new version of the subapp to Fusion is done in two steps.

### 1- Releasing a new version of the subapp

Merging to `master` branch will automatically trigger the release of a new version of subapp on FAS. The new version number is determined by the version field in `package.json` with a bumped `patch` version from the last build.

The version number is used to determine what is visible in different environments of Fusion: `dev.fusion.cogniteapp.com` (dev), `next-release.fusion.cognite.com` (staging) and `fusion.cognite.com` (prod). Each environment has its own [import map](https://github.com/cognitedata/cdf-ui-hub/tree/master/packages/fas-apps/config), governing the range of valid versions.

> For a more detailed explanation of this step, see the guide [here](https://cognitedata.atlassian.net/wiki/spaces/CE/pages/3688562771/...version+and+release+sub-app).

### 2- Deploying to Fusion

After the subapp is released, to see the changes on any environment of Fusion, a build of cdf-ui-hub's master branch should be triggered.
1. Go to [`cdf-ui-hub` on Jenkins CD](https://cd.jenkins.cognite.ai/blue/organizations/jenkins/cognitedata-cd%2Fcdf-ui-hub/branches).
2. Locate the `master` branch and click the `Run ▶️` button.
3. After the build is successful, the changes automatically will take effect on `dev.fusion.cogniteapp.com` and `next-release.fusion.cognite.com` if the new version matches the corresponding import maps.
4. To deploy to the production environment `fusion.cognite.com`, go to `staging.fusion.cognite.com` to verify that your changes work properly.
5. If everything looks alright, go to [Spinnaker](https://spinnaker.cognite.ai/#/applications/fusion-app/executions).
6. Locate the `deploy-fusion-app-prod` pipeline and verify the build by clicking `Continue`.

> For a more detailed explanation of this step, see the step-by-step guide [here](https://cognitedata.atlassian.net/wiki/spaces/CE/pages/3758588022/...deploy+a+new+sub-app+version+to+production).
