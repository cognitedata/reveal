# DSHubLite

[JupyterLite](https://github.com/jupyterlite/jupyterlite) is a JupyterLab distribution that **runs entirely in the browser** built
from the ground-up using JupyterLab components and extensions. DSHubLite is Cognite's modified version, with preinstalled Cognite SDK and soon tutorial notebooks.

## ⚡ Status ⚡

It comes with preinstalled Cognite SDK, patched so it works in the JupyterLite environment. You can try it out at https://cognitedata.github.io/dshublite

## Local Development 🛠

- Starting the app locally: `yarn nx serve notebook`
- Navigate to `https://localhost:3015/index.js` in order to "approve the code" for use in the browser.
- Navigate to [dev.fusion.cogniteapp.com](https://dev.fusion.cogniteapp.com/)
- Open Console
- In the Console, use `importMapOverrides.enableUI()` command
- Click on the `{...}` icon that appeared in the bottom right corner
- Find `@cognite/cdf-ui-notebook` module name and click on the row including it
- In the override URL, paste `https://localhost:3015/index.js` (port might differ depending on your local settings)
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

- PRs cannot be too small ([read more](https://docs.google.com/presentation/d/1Fu2WiTqQYsqFwid5CXd7-E0CZZbOeJPEMWHgquM2dHA/edit#slide=id.p)).

## Additional Information 📚

- [Fronted Development Guidelines](https://cognitedata.atlassian.net/wiki/spaces/VIS/pages/3336437858/Frontend+Development+Guidelines)
- [Fusion Wiki](https://cognitedata.atlassian.net/wiki/spaces/DET/pages/3334374461/Fusion+frontend+development+WIKI)
