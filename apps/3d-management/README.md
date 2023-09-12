# CDF 3D Management

This repo contains the "3D Models" app. You can see it by navigating to [http://fusion.cognite.com/:tenantName/3d-models](http://fusion.cognite.com/publicdata/3d-models).

Previously known as [console/glados](https://github.com/cognitedata/console) subapp.

## Development environment setup

### Local desktop

To set up a full local development environment on your machine, please read setup instructions for frontend development here: <https://cognitedata.atlassian.net/wiki/spaces/AD/pages/147424318/The+Definitive+Onboarding+Guide+for+Application+Developers>

### Devcontainer

An alternative is to use a devcontainer environment for this repo in VSCode. This can be loaded either locally in Docker (<https://code.visualstudio.com/docs/devcontainers/containers>), or in Github Codespaces (<https://docs.github.com/en/codespaces/overview>).
On Codespaces the machine configuration should be 4 cores and 8 GB of memory, or more.

To use the devcontainer in local docker setup, the best approach is to clone the repo directly into a container volume.

- Start Docker desktop.
- Start "code" (VSCode) standalone anywhere from your terminal.
- In VSCODE, Press CTRL+Shift+P (Command Palette) and in the quick enter "clone" to locate the "Dev containers: Clone repository in named container volume". Either paste in the github URL for the cdf-ui-3d-management git repo (or a branch), or navigate to it by choosing the "Clone a repository from Github...", and select the repo and branch in the dropdowns. In the "Select the volume for the cloned repository" choose to either create a new named volume or use an existing one if you have already done this earlier. Enter the name of the folder to clone into, just use the suggested default. The repo will be cloned and the dev container will be set up.

## npm setup

Regardless of what dev environment setup you choose above, you need a NPM account, and you need to be logged in to npm. See step 4 under "Account access on the "onboarding guide" link above, for npm account and login instructions.

## Local development

1. Clone repo.
1. Run "npm login" and enter credentials, email and two factor code.
1. Install dependencies with `yarn`.
1. Run dev server with `yarn start`. Take a note of the local address.
1. Open the local address from above in a browser and accept the unsafe certificate.
1. Navigate to [dev.fusion.cogniteapp.com](https://dev.fusion.cogniteapp.com/) and apply the override as described [here](https://cognitedata.atlassian.net/l/cp/4aVs8u9B).

## Deploying to production, staging and development

See the following guide for instructions on how to deploy to production, staging and development environments: https://cognitedata.atlassian.net/wiki/spaces/CE/pages/3893493926/Common+known+issues+and+FAQ

## Features behind feature flags

Some of the 3D management features are hidden behind feature flags. You can read more about adding new feature flags, adding new projects to already existing feature flags etc., in [this guide on Confluence](https://cognitedata.atlassian.net/wiki/spaces/DEGEXP/pages/3721068657/Feature+flags+unleash).

The feature flag for the `Contextualize Editor` under `Upload 3D models` are called `3D_MANAGEMENT_contextualize_editor`.
