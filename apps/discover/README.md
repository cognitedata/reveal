![Discover Logo](public/discover_with_text.png)

---

[![codecov](https://codecov.io/gh/cognitedata/discover/branch/staging/graph/badge.svg?token=wxX2Li0qIL)](https://codecov.io/gh/cognitedata/discover)

# Prerequisites

Clone the repo:

```sh
git clone https://github.com/cognitedata/applications.git
```

Move to the right folder and get ready to start:

```sh
cd applications/apps/discover && yarn
```

# Development

Starting the app locally on azure-dev cluster

```sh
yarn start:a
```

Starting the app locally on bluefield cluster

```sh
yarn start:b
```

Starting with a different cluster

```sh
REACT_APP_CLUSTER=<cluster_name> yarn start
```

To edit the code with the linting rules working, open VSCode from the current directory:

```sh
code .
```

See details in Configuration.md document.

# Automated Testing

We use Jest for running automated unit tests. TestCafé is used for end-to-end
tests. Both of these will be run in the Jenkins Pipeline after pushing to a
branch.

For help writing testcafe you can check the [examples](https://github.com/DevExpress/testcafe-examples/blob/master/README.md).

## User identities

When running locally, we get the git email and use that as the user id in the token.

When on CI, get generate a UUID.

## Unit tests - Jest

Unit tests in Discover are using Jest and testing-library/react.

```sh
yarn test                                           # To run all tests in watch mode
yarn test file.test.ts                              # Run test from a file
yarn test someDirectory                             # Run tests from a specific directory
yarn test ./some/file.test.ts -t "Name of a test"   # Run a specific test from a file
yarn test:debug                                     # Run tests in band
yarn test:coverage                                  # Run tests with coverage report
```

## Running E2E tests manually

We have two test systems at the moment. So you can run them in two modes. But we are trying to transition to Cypress.

### Start server

0. Get the PK from last-pass for the testing project. Put it in the Discover `private-keys` folder as `discover-e2e-<CLUSTER>.jwk-key.json`

1. Then start your test server:

(Make sure you always do this for azure-dev or bluefield)

| Cluster   | Project (fakeIdp)      | Command            |
| --------- | ---------------------- | ------------------ |
| bluefield | discover-e2e-bluefield | `sh yarn start:b ` |
| bluefield | discover-dev-bluefield | `sh yarn start:c ` |
| azure-dev | discover-e2e-azure-dev | `sh yarn start:a ` |

### Cypress: Run tests

NOTE: to run on different clusters, change this file:

- `apps/discover/cypress/support/constants.ts`

#### Start Cypress dashboard (Practical for local development)

```shell
yarn cypress:open
```

#### Run live Cypress tests through bazel (dev mode)

```shell
yarn cypress
```

Run specific tests:

- `yarn cypress --spec "**/documents/name-of-the-file.js"` to run one specific file
- `yarn cypress --spec "**/documents/**"` to run all files inside a directory

To stop the Cypress window from closing after a finished test, use the `--no-exit` flag.
Cypress has many other run options, they can be found here: https://docs.cypress.io/guides/guides/command-line#Options

#### Run Cypress tests (CI mode)

INFO:
This command is used by Jenkins but can be executed locally too.
Before executing in please comment out the "REACT_APP_MIXPANEL_TOKEN" in the BUILD.bazel file as that token is used to measure performance on staging

```shell
yarn cypress:ci
```

### Testcafe: Run tests

`sh yarn testcafe ` or `sh yarn testcafe --fixture-meta page=savedSearches` for specific test

For linux:

```sh
yarn testcafe:linux --fixture-meta page=savedSearches
```

### How to ingest data into the test tenants

Checkout: https://github.com/cognitedata/fusion-demo-data

For development:

```
yarn send --project discover-e2e-azure-dev --cluster azure-dev --generateToken -x infield
```

Only run this after tests are ready as this is the project our CI uses:

```
yarn send --project discover-e2e-bluefield --cluster bluefield --generateToken -x infield
```

Make sure you have the PK in the `private-keys` folder.

For the demo project `discover-test-bluefield` that uses AAD, that is a bit different:

```
yarn send --wdl --project discover-test-bluefield --cluster bluefield --clientCreds '{ "client_id": "be51de09-e15c-4992-8390-b2ed6ee69f27", "client_secret": "get from lastpass", "scope": "https://bluefield.cognitedata.com/.default", "tenant_id": "b0a7758b-37a5-4176-a263-6f9b5e8b6b05" }' -x infield
```

### Generating Access Tokens for discover-e2e-bluefield tenant

```sh
yarn getToken
```

In the getToken.mjs file you can change cluster and different roles for the generated token.

In the file we generate two different tokens, one _accessToken_ and an _idToken_.
For both tokens we specify the group which defines the roles/permissions the generated token has.
The default value is 'defaultGroup', if you need only read access then change that to "readGroup",
if you need write access change it to "writeGroup".
To make CDF requests as the discover-e2e-bluefield tenant we only need the accessToken.

### Misc

Useful info: [Supported browsers](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/browsers/browser-support.html), [Page model](https://devexpress.github.io/testcafe/documentation/recipes/extract-reusable-test-code/use-page-model.html)

Known bug: [Firefox cannot display maps](https://bugzilla.mozilla.org/show_bug.cgi?id=1375585)

### Testcafe logging

To enable extra logging in tests, do something like this:

```
import { logNetworkLoggerResults, getNetworkLogger, logErrors } from '../../utils';

const logger = getNetworkLogger();

fixture('My test page')
  .afterEach(() => //      <-- log chrome logs
    logErrors({ log: true, warn: true, info: true, error: true })
  )
  .requestHooks(logger); // <-- log network requests
```

Then in the test:

```
  logNetworkLoggerResults(logger);
```

### Troubleshooting

#### Errors

| Error message                            | Fix                                                                                                                                                |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gyp: No Xcode or CLT version detected!` | [Follow these steps](https://medium.com/flawless-app-stories/gyp-no-xcode-or-clt-version-detected-macos-catalina-anansewaa-38b536389e8d)           |
| `Yarn cannot find ...........`           | <ol><li>Did you run `npm login`?</li><li>Are you [added](https://github.com/cognitedata/terraform-npm/blob/master/cogniters.tf) here?</li></ol>    |
| `iBazel ........... permission denied`   | Workaround until fixed: Run `bazel clean --expunge`. If that doesn't work, delete `/private/var/tmp/_bazel_***` and run the expunge command after. |

#### Local debugging

If you have trouble with the 'Fake IdP', you can run it locally and see if there are any issues:

```sh
./scripts/startIdP.sh
```

and then try and manually query it:

```
curl -X POST --data '{"fakeApplicationId": "1f860e84-7353-4533-a088-8fbe3228400f", "groups": ["defaultGroup"], "project": "discover-e2e-bluefield"}' -H 'Content-Type: application/json' http://localhost:8200/login/token
```

#### Cannot find container

If it cannot find the container, try and login with the [gcloud utils](https://cloud.google.com/container-registry/docs/advanced-authentication#gcloud-helper):

```
gcloud auth login
gcloud auth configure-docker eu.gcr.io
```

#### Still cannot find container

If you still cannot get the container, try building and running the image locally.

`https://github.com/cognitedata/application-services/blob/master/services/fake-idp/package.json#L11`

`services/fake-idp` in the `application-services` repo run:

```sh
export PRIVATE_KEY=<<contents of your private key>>
export IDP_CLUSTER=bluefield
export IDP_TOKEN_ID=discover-e2e
export IDP_USER_ID=123
yarn run:docker
```

#### Container out of sync

If the container is a bit old, check if there were any changes:

```
docker pull eu.gcr.io/cognitedata/fake-idp:latest
```

#### Bazel not found error

```
.husky/pre-commit: 6: bazel: not found
husky - pre-commit hook exited with code 127 (error)
```

Try `bazel version`,

If result: `bazel: command not found`,
Try,

Install Bazelisk and Bazel watcher (ibazel) globally:

```
npm install -g @bazel/bazelisk
yarn global add @bazel/ibazel
```

#### Permission denied while installing global packages

Could get `Error: EACCES: permission denied, access '/usr/local/lib/node_modules'`

It is not encouraged to install `node` or `npm` using `apt-get`. If you already have uninstall them `apt-get remove` and reinstall using `nvm`. [3rd option of this guide](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)

After that try installing global package again.

## Running E2E tests in the Docker container

The end to end tests have two parts (which are in two docker files).
The application server (hosting the site) and the tests that run against them.

Setup the [network](https://docs.docker.com/network/network-tutorial-standalone)

```
docker network create --driver bridge discover
```

Build the app in testcafe mode (for discover-e2e-bluefield)

```
COGNITE_API_KEY=xxx___API_KEY___xxx ./scripts/build.sh testcafe
```

Build server:

```
docker build -t discover-smoke-test:latest -f ./scripts/docker/Dockerfile .
```

Start server:

```
docker rm discover-testcafe-server
docker run -p 3000:3000 --env CDF_CLUSTER=ew1 --name discover-testcafe-server --network discover discover-smoke-test:latest
```

Build runner:

```
docker build -t discover-smoke-test-runner:latest -f ./scripts/docker/Dockerfile-runner .
```

Start runner: (eg: with just feedback:general enabled)

```
docker rm discover-testcafe-runner
docker run -e BASE_URL=discover-testcafe-server:3000 -e META='--fixture-meta page=feedback:general' --name discover-testcafe-runner --network discover discover-smoke-test-runner:latest
```

### Extras 0: Remove any old registered containers:

```
docker container stop discover-testcafe-server discover-testcafe-runner
docker rm discover-testcafe-server discover-testcafe-runner
```

### Extras 1: Debug a built container:

Debug from the build:

```
docker ps -a | grep discover-smoke-test
docker commit THE_CONTAINER_ID debug/testcafe
docker run -it --rm --entrypoint sh debug/testcafe
```

Use `ip addr show` to check the ip inside a container.
Use `docker network inspect discover` to check which contains are attached to the network

### Extras 2: Debug a running container:

```
docker ps
```

and:

```
docker exec -it THE_CONTAINER_ID sh
```

### Extras 3: How to debug these containers:

You don't have to run both containers. Just run one, and run the other part locally.

Note: the build of the app that the server hosts, needs to have the REACT_APP_API_KEY set BEFORE the build is run, since that env var is baked into `process.env`.

## Running [discover-api service](https://github.com/cognitedata/application-services/tree/master/services/discover-api) locally

1. Set `localDiscover` variable `true` in src/constants/app.ts file in discover.
2. Clone the [application services](https://github.com/cognitedata/application-services) repository.
3. Go through the README section in application services.

# PR Process

1. Commit (frequently) in your branch following the [commit conventions](https://www.conventionalcommits.org/en/v1.0.0/) (i.e., CC standard with
   feat:, fix:, chore:, etc).
2. Upon pushing to the remote branch, tests are automatically executed with _Husky_ (pre-commit-hook); though, it is
   recommended to follow "_running unit tests_" once-a-while during development. 2. `error Command failed with exit code 1.` --> Make sure you have Java JDK installed on your PC - version 14 should be sufficient.
3. Push to upstream: `git push --set-upstream origin YOUR_BRANCH` (manually) or `gh pr create` [(easy way)](https://github.com/cli/cli).
4. Copy the Github link (or browse your way) to the PR.
5. Review the file changes and preferably(!) comment the link to match the Jira task the PR resolves! Example: `https://cognitedata.atlassian.net/browse/PP-<ISSUE_ID>` OR `PP-<ISSUE_ID>` [(easy way)](https://docs.github.com/en/enterprise/2.19/user/github/administering-a-repository/configuring-autolinks-to-reference-external-resources).
6. Finally, create a pull request and add **discover** as reviewers!

# Storing Secret Keys

Files or code where keys are exposed should never(!) be commited to the Github repository!

If you are an avid `git add .` or `git commit -am` user (perfectly fine), we recommend that you place your keys in a **.json** file and put it safely into the _service-account_ directory found in the root of this project.

## Further Reading

For further reading, we kindly refer you to our [Internal Developer's Info](https://cognitedata.atlassian.net/wiki/spaces/PP/pages/1740505228/Internal+team+developer+s+info) at Confluence.

# Deployment

## Build

To create a production optimized build run "yarn build", the build is optimized, the files are minified and its ready for deployment.
The result of the build is located in the ./build folder. The content of the build folder may now be copied to any static served website.

```sh
yarn build
```

You can then inspect it with:

```sh
yarn analyze
```

and:

```sh
yarn bundlesize
```

## Deployment

The deployment is handle by our CI/CD pipeline and is described in the infrastructure part.

# Configuration

## Environment variables - (note: generally config should be stored in Sidecar)

Optional: Add your own local .env file named .env.local to override files when doing local development (it's ignored by git in .gitignore).

Here is a short description of the fields in the .env file.

```sh
PORT                            # Port the webapp should run on. - This should only be used in the .local file for local development.
HTTPS                           # Whether to use Https or not. - This should only be used in the .local file for local development.
REACT_APP_ENABLE_RENDER_LOGGING # log react re-renders in the console
REACT_APP_ENABLE_REDUX_LOGGER   #
BROWSER                         # true or false to open browser on `yarn start`
```

# Structure

    .
    ├── .storybook                          # Storybook configuration files.
    ├── documentation                       # Documentation files.
    ├── public                              # Public files which is included in the build (e.g favicon).
    │    ├── sidecar.js                     # App config, auto populated by the server when hosted
    ├── src                                 ## Source files
    │    ├── components                     ## All reusable / common components are placed here.
    │    ├── icons                          ## Icons used in the app.
    │    ├── images                         ## Images used in the app.
    │    ├── pages
    |    |     ├── unauthorized             ### (OLD - deprecated) Entry point for Unauthorized users.
    |    |     └── authorized               ### Entry point for Authorized users.
    |    |     |     ├── admin              #### All pages and components that are specific to the admin panel.

    |    ├── modules                        ### Ducks modules
    |    |     ├── MODULE NAME
    |    |     |     ├── reducer.ts         #### Reducer for this module
    |    |     |     ├── types.ts           #### Model of the state and the action types
    |    |     |     ├── selector.ts        #### Access the state of this module
    |    |     |     ├── actions.ts         #### Connects services and dispatches
    |    |     |     ├── service.ts         #### API calls
    |    |     |     ├── helpers.ts         #### Other generic logic for this module
    │    ├── utils                          ## All services are put here.
    │    ├── App.js                         ## App main page
    │    ├── Content.js                     ## Main layout file for Authorized app.
    │    ├── index.css                      ## General css style for the app, generally do NOT use this
    │    ├── index.js                       ## Entry point.
    │    ├── serviceWorker.js               ## Service worker setup file.
    │    └── setupTests.js                  ## Jest Setup file.
    │
    ├── testcafe                            # E2E testing
    ├── Dockerfile                          # E2E testing container
    └── README.md
