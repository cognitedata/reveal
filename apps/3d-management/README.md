# CDF 3D Management

This repo contains the "3D Models" app. You can see it by navigating to [http://fusion.cognite.com/:tenantName/3d-models](http://fusion.cognite.com/publicdata/3d-models).

Previously known as [console/glados](https://github.com/cognitedata/console) subapp.

## Local development

1. Clone repo.
1. Install dependencies with `yarn`.
1. Run dev server with `yarn start`.
1. Navigate to [dev.fusion.cogniteapp.com](https://dev.fusion.cogniteapp.com/3ddemo/3d-models) and apply the override as described [here](https://cognitedata.atlassian.net/wiki/spaces/ManagementConsole/pages/1561985275/CDF+frontend+development+WIKI+https+cog.link+cdf-frontend-wiki#I-am-developing-my-micro-frontend-locally.-What-do-I-do?).

## Deploying to production, staging and development

Production ([fusion.cognite.com](fusion.cognite.com/)), staging ([next-release.fusion.cognite.com](https://next-release.fusion.cognite.com/)) and development ([dev.fusion.cogniteapp.com](https://dev.fusion.cogniteapp.com/)) versions of the Fusion are controlled by configurations in [cdf-hub on Github](https://github.com/cognitedata/cdf-hub), but separate configuration files for production and staging.

1. Bump version in [package.json](./package.json) according to Semver and create a PR. See [this Stackexchange answer](https://softwareengineering.stackexchange.com/a/255201) for guidance on versioning for apps.
1. Get someone to review PR and merge to master.
1. Wait for [Jenkins](https://cd.jenkins.cognite.ai/blue/organizations/jenkins/cognitedata-cd%2Fcdf-3d-management/activity) to finish build after merge
1. Update the `cdf-3d-management`-entry of the respective configuration under [packages/fas-apps/config](https://github.com/cognitedata/cdf-hub/tree/master/packages/fas-apps/config) to match version.
1. Create PR, merge - after merge the change should be automatically deployed to the respective environment(s).
1. For production release only:
    1. Manually verify that the build works at https://staging.fusion.cognite.com/
    1. Manually promote release in [Spinnaker](https://spinnaker.cognite.ai/#/applications/fusion-app/executions?pipeline=deploy-fusion-app-prod) (for the relevant build, hover the orange indicator and select Continue) 

Note! The configuration uses Semver ranges, so if you deploy new versions of the cdf-3d-management applications they should automatically be released to the respective environment if updated versions is within the supported range. See [Semver calculator](https://jubianchi.github.io/semver-check/#/) to test if versions are compatible.

More details available on [Wiki](https://cognitedata.atlassian.net/wiki/spaces/DET/pages/3334374461/Fusion+frontend+development+WIKI). Note however that the instructions are out-of-date and not always correct.

