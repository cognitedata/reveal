# Explorer App

```
yarn start
```

Use the cluster `greenfield` and your `cognitedata` account as a guest user in the `fusiondevforcognite.onmicrosoft.com` tenant.

Then select the project `atlas-greenfield`

## How to ingest

### Models

1. Send a POST request to `https://greenfield.cognitedata.com/api/v1/projects/atlas-greenfield/datamodelstorage/definitions/apply` with the models

### Ingesting Data

1. Go to `fusion.cognite.com`
2. Click on `Manage staged data`
3. Create a database called `cognite-office-explorer`
4. Upload information to it through `.csv`
5. Upload and run the necessarry transfomrations (see [Google Drive] (https://drive.google.com/drive/folders/1bluuJ1TVCq1wuIOnIgQrmwJmN01Ad74n?usp=sharing) or the `#cognite-office-explorer` slack channel for transformations)

Note: Watch (Friyay Demo)[https://drive.google.com/file/d/1BsLVOndR53GAzeV6QmbHTH4viKpKD9xW/view?usp=sharing] for further details on ingestion

### Setting up GraphQL server

1. Download the repo (schema-demo) [https://github.com/cognitedata/schema-demo]
2. Modify the Bearer token as needed to run `yarn deploy`
3. Run `yarn deploy`

Note: You can grab a valid Bearer token form a network request on `fusion.cognite.com`

## Unit tests - Jest

Unit tests in Explorer App are using Jest and testing-library/react.

```sh
yarn test                                           # To run all tests in watch mode
yarn test file.test.ts                              # Run test from a file
yarn test someDirectory                             # Run tests from a specific directory
yarn test ./some/file.test.ts -t "Name of a test"   # Run a specific test from a file
yarn test:debug                                     # Run tests in band
yarn test:coverage                                  # Run tests with coverage report
```

The CI uses the `react_scripts_test` rule which takes longer as it performs a build internally

## e2e tests

End-to-end tests can be written with [Cypress](https://github.com/cypress-io/cypress)

### Run e2e tests with cypress

Tests are are stored in `/cypress`.

To run cypress tests locally:

1. Start the app

```sh
yarn start
```

2. Run Cypress tests

```sh
yarn cypress:run-live
```

Note: if you want to run just one cypress file, you can do that like this:

```sh
yarn cypress:run-live cypress/Comments.spec.ts
```
