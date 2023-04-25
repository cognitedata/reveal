# CDF 3D Management

This repo contains the "3D Models" app. You can see it by navigating to [http://fusion.cognite.com/:tenantName/3d-models](http://fusion.cognite.com/publicdata/3d-models).

Previously known as [console/glados](https://github.com/cognitedata/console) subapp.

## Development environment setup

### Local desktop

To set up a full local development environment on your machine, please read setup instructions for frontend development here: <https://cognitedata.atlassian.net/wiki/spaces/AD/pages/147424318/The+Definitive+Onboarding+Guide+for+Application+Developers>

### Devcontainer

An alternative is to use a devcontainer environment for this repo in VSCode. This can be loaded either locally in Docker (<https://code.visualstudio.com/docs/devcontainers/containers>), or in Github Codespaces (<https://docs.github.com/en/codespaces/overview>).
On Codespaces the machine configuration should be 4 cores and 8 GB of memory, or more.

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
