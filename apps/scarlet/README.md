# Cognite Scarlet

This app is served as an example [React]-based application served using frontend-app-server (FAS).

## Unit tests - Jest

Unit tests in Cognite Scarlet are using Jest and testing-library/react.

```sh
yarn test                                           # To run all tests in watch mode
yarn test file.test.ts                              # Run test from a file
yarn test someDirectory                             # Run tests from a specific directory
yarn test ./some/file.test.ts -t "Name of a test"   # Run a specific test from a file
yarn test:debug                                     # Run tests in band
yarn test:coverage                                  # Run tests with coverage report
```

The CI uses the `vite_test` rule which takes longer as it performs a build internally

## Requirements to run and test locally

Copy scarlet-e2e-azure-dev.jwk-key.json from Lastpass -> Shared Demo App into the file:
private-keys/scarlet-e2e-azure-dev.jwk-key.json

If your app was created with the generator, you need to create a new e2e key instead following the main [README](https://github.com/cognitedata/applications#running-e2e-tests-on-jenkins)
