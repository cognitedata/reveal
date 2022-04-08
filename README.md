# Applications

[![codecov](https://codecov.io/gh/cognitedata/applications/branch/master/graph/badge.svg?token=uzusBZyM8s)](https://codecov.io/gh/cognitedata/applications)

This monorepository provides centralized management of Cognite's applications and reusable packages.

## Setup for local development

This repo uses [Bazel](https://bazel.build/) as a build tool. To get that set up:

1. Install Bazel through [Bazelisk](https://github.com/bazelbuild/bazelisk). This ensures that you always use the version of Bazel specified in `.bazelversion`.
2. Install Bazel watcher (ibazel) globally:
   ```sh
   yarn global add @bazel/ibazel
   ```

If you want to read more details about the Bazel setup, see [bazel.md](https://github.com/cognitedata/application-services/tree/master/bazel.md).

After that you need to install the dependencies with: `yarn --frozen-lockfile`.
If you are not logged in with npm it will fail, so please follow the relevant [guide](https://cognitedata.atlassian.net/wiki/spaces/AD/pages/147424318/The+Definitive+Onboarding+Guide+for+Application+Developers)

### For M1 chips users

To be able to use the repository with an M1 chip you need:

- run iterm/terminal in rosetta mode
- install homebrew under rosetta (if 'which brew' gives you /opt/homebrew/bin, you need to uninstall it)
- install nvm under rosetta
- install node 14 with rosetta nvm
- run `npm install -g yarn`
- run `yarn --frozen-lockfile` at the root of this monorepo
- run `brew install bazelisk`

## Running cypress

To work with cypress, you might have to install some dependencies on your machine.
Please refer to the official [documentation](https://docs.cypress.io/guides/continuous-integration/introduction#Machine-requirements)

## How do I run my application locally?

All the api middleware have a set of scripts defined in their `package.json`.
In order to run a application you need to:

1. `cd` to that application directory
2. run `yarn start`, which will install all the required dependencies for the application and run it

## How do I add a dependency to my application?

This monorepository has a top-level `node_modules` and a top-level `yarn.lock`.
That means that if you want to add a dependency to your application you need to install it at the root level, then you can import it in the normal way in your application or package.
Whenever you've added a dependency and started using it, you need to run `yarn update-helpers` from the directory of your application. This will ensure Bazel appends this dependency to your application dependency tree.

## Creating a new application

To create a new application:

1. Clone this repo
2. run `yarn --frozen-lockfile`
3. run `yarn generate` and follow the prompts
4. To go past the login screen when running `yarn start`, ask someone to share the private keys (in lastpass) for the shared testing projects and put them into the `./private-keys` folder of your app.
5. If it can not find the container, try and login with the gcloud utils:

```
gcloud auth login
gcloud auth configure-docker eu.gcr.io
```

This will spit out all of the boilerplate that you need to have a production-capable [React]-based application at Cognite. It demonstrates best practices, such as:

- Lint setup to use
- Jenkinsfile steps
- TypeScript usage
- Storybook usage
- Testcafe or Cypress
- Folder / component layout
- Authentication workflow

## Importing existing application

1. In this repository set remote to be pointed to the repository you want to import

```sh
git remote add repo-to-import ~/repo-to-import
```

2. Pull changes from the newly established remote

```sh
git pull repo-to-import master --allow-unrelated-histories
```

3. Remove remote

```sh
git remote rm repo-to-import
```

[Here](https://medium.com/@ayushya/move-directory-from-one-repository-to-another-preserving-git-history-d210fa049d4b) is a good article.

## Running e2e tests on Jenkins

E2e tests setup on Jenkins is powered by [Fake IdP](https://github.com/cognitedata/application-services/tree/master/services/fake-idp).
Fake Idp is a docker container running on the side of the Jenkins pipeline responsible for issuing tokens.
In order to be able to run e2e tests your CDF project should support OIDC and be configured against `internal-jwks-host`.
See similar setup explained [here](https://github.com/cognitedata/application-services/tree/27a505c1a9ecdbc156fdd59a6533943e765e1702/services/db-service#how-to-setup-db-service-for-a-new-cluster).
When you have your project available you need to:

1. Ask in #infrastructure to populate `apps-e2e-fake-idp-private-keys` secret with the new key being the name of your project.
2. In `public/sidecar.js` inside `fakeIdp` array object define `name: <projectName>` and `project: <projectName>` parameters which will render a button `Login with Fake IDP (<projectName>)`.
3. Inside your app's cypress role find and click the button above in order to obtain a token.

## Release procedure

Please visit https://cog.link/release-strategies for a release process introduction.

In order to release a new version please follow the steps below:

- Start on a branch you want to release from (most cases is master), make sure it is checked out and up-to-date locally.
- Run the following helper command which will create and push branches.

  `yarn deploy <your-app> <version x.y.z>`

- Add `--no-dry-run` to the above command if you want to actually make the changes. By default, it will just output what would have been changed without performing any of the actual changes.
- This command creates a commit with the updated version in `package.json` on two branches, `bump-version/*` and `release-prefix-*`, pushes them to GitHub, and creates pull requests from the branches into master if you have GitHub CLI set up.
- `bump-version/*` branch - this PR contains only a package.json version bump which we need to check in into the main branch for history purposes, no actual deployment is happening from here.
- `release-prefix-*` branch - that is a PR from where actual deployment will happen but no users will see that until the FAS PR below is merged. The contents of the `release-prefix-*` branch should be automatically published to preview server.
- Create a PR against [FAS](https://github.com/cognitedata/frontend-app-server/blob/master/services/release-configs/src/version-specs/infield.ts) by updating the `versionSpec` to the latest version which can be found on Jenkins.
- When every check is passed squash and merge both `bump-version/*` branch PR and the FAS PR.
- Close (_DO NOT MERGE_) the PR for `release-prefix-*` branch - we will potentially need it later in order to fix bugs for the same release

## Help

If you have any questions, please join us in [#frontend] and ask away!

[react]: https://reactjs.org/
[deployment guide]: https://cognitedata.atlassian.net/wiki/spaces/FAS/pages/1003225162/How+to+deploy+on+Frontend+App+Server+FAS
[#frontend]: https://cognitedata.slack.com/archives/C6KNJCEEA
[create repo page]: https://github.com/organizations/cognitedata/repositories/new
