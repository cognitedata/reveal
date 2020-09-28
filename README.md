# React Demo App

This repository shows how to bootstrap a [React]-based application at Cognite.
It demonstrates best practices, such as:

- Lint setup to use
- Jenkinsfile steps
- TypeScript usage
- Storybook usage
- Testcafe
- Folder / component layout
- ...

## Deploying the app

Please see the [deployment guide] for more information how to actually get this app into production.
(It should be pretty easy!)

## Template repo

This repo is configured as a template, so it's easy to get started.
Simply go to the [create repo page] and select "cognitedata/react-demo-app" as a template.

### Run e2e tests with testcafe

End-to-end tests are written and run using the [Testcafe](https://github.com/DevExpress/testcafe) testing framework. They are stored in `/testcafe`.

To run testcafe tests locally, first start the app on port 11111

```sh
yarn testcafe:start-live
```

In order to run tests in the browser and keep the browser window open to watch and auto re-run on test file changes, run in a separate tab the following command:

```sh
yarn testcafe:run-live
```

## Help

If you have any questions, please join us in [#frontend] and ask away!

[react]: https://reactjs.org/
[deployment guide]: https://cognitedata.atlassian.net/wiki/spaces/FAS/pages/1003225162/How+to+deploy+on+Frontend+App+Server+FAS
[#frontend]: https://cognitedata.slack.com/archives/C6KNJCEEA
[create repo page]: https://github.com/organizations/cognitedata/repositories/new
