# React Demo App

This app is served as an example [React]-based application served using frontend-app-server (FAS).

## Run e2e tests with testcafe

End-to-end tests are written and run using the [Testcafe](https://github.com/DevExpress/testcafe) testing framework. They are stored in `/testcafe`.

To run testcafe tests locally, first start the app on port 11111

```sh
yarn testcafe:start-live
```

In order to run tests in the browser and keep the browser window open to watch and auto re-run on test file changes, run in a separate tab the following command:

```sh
yarn testcafe:run-live
```
