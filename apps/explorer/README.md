# Explorer App

## Requirements to run and test locally

```
yarn start
```

Use the cluster `greenfield` and your `cognitedata` account as a guest user in the `fusiondevforcognite.onmicrosoft.com` tenant.

Then select the project `atlas-greenfield`

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
