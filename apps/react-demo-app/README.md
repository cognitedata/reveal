# React Demo App

This app is served as an example [React]-based application served using frontend-app-server (FAS).

## Run e2e tests with testcafe

End-to-end tests are written and run using the [Testcafe](https://github.com/DevExpress/testcafe) testing framework. They are stored in `/testcafe`.

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
