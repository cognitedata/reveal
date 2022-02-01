# CDF Vision
This repo contains [Vision components](https://cognitedata.atlassian.net/wiki/spaces/VIS/pages/3144089603/WIP+Vision+components+in+Fusion) in Fusion 🚀


## Local Development 🛠
- Clone the repo: `git clone git@github.com:cognitedata/cdf-vision-subapp.git`
- Move to the right folder and get ready to start: `cd cdf-vision-subapp && yarn`
- Starting the app locally: `yarn start`
- Navigate to [dev.fusion.cogniteapp.com](https://dev.fusion.cogniteapp.com/)
- Open Console
- In the Console, use `importMapOverrides.enableUI()` command
- Click on the `{...}` icon that appeared in the bottom right corner
- Find `@cognite/cdf-vision-subapp` module name and click on the row including it
- In the override URL, paste `https://localhost:8000/index.js` (port might differ depending on your local settings)
- Click `Apply override`
- Your local code is now available under the `dev.fusion.cogniteapp.com` address.

Deployments are done via merging to `master`.

More information about the CDF architecture can be found [here](https://cognitedata.atlassian.net/wiki/spaces/DET/pages/3334374461/Fusion+frontend+development+WIKI).

## Testing 🧪

```js
yarn test
```

## Development Guidelines ℹ️

### Pull Requests
* PRs cannot be too small ([read more](https://docs.google.com/presentation/d/1Fu2WiTqQYsqFwid5CXd7-E0CZZbOeJPEMWHgquM2dHA/edit#slide=id.p)).

* Use prefix `[VIS-X]` in PR titles, where `X` is the JIRA ticket number, to automatically link the PR to the relevant JIRA ticket.



## Additional Information 📚
* [Fronted Development Guidelines](https://cognitedata.atlassian.net/wiki/spaces/VIS/pages/3336437858/Frontend+Development+Guidelines)
* [Fusion Wiki](https://cognitedata.atlassian.net/wiki/spaces/DET/pages/3334374461/Fusion+frontend+development+WIKI)
