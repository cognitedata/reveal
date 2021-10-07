# React Demo App

This app is served as an example [React]-based application served using frontend-app-server (FAS).

## e2e tests

End-to-end tests can be written with either [Testcafe](https://github.com/DevExpress/testcafe) or [Cypress](https://github.com/cypress-io/cypress)

### Run e2e tests with testcafe

Tests are are stored in `/testcafe`.

To run testcafe tests locally:

1. Start the app

```sh
yarn start
```

2. Run Testcafe tests

```sh
yarn testcafe:run-live
```

Note: if you want to run just one testcafe file, you can do that like this:

```sh
yarn testcafe:run-live comments
```

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
