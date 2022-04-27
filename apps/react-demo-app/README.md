# React Demo App

This app is served as an example [React]-based application served using frontend-app-server (FAS).

## Unit tests - Jest

Unit tests in React Demo App are using Jest and testing-library/react.

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

Copy react-demo-app-e2e-azure-dev.jwk-key.json from Lastpass -> Shared Demo App into the file:
private-keys/react-demo-app-e2e-azure-dev.jwk-key.json

If your app was created with the generator, you need to create a new e2e key instead following the main [README](https://github.com/cognitedata/applications#running-e2e-tests-on-jenkins)

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

#### Batch cypress testing

One special thing about this rule is that your cypress folder has to contain:

- a `plugin.ts` file that serves your build files
- a `tsconfig.json` for your cypress base config

```bazel
cypress_batch_test(
    name = "base_name_for_every_tests",
    build_src = ":my_build_target",
    # Insert as many globs here as you want runs of your tests
    cypress_files = [
        glob(["cypress/folder1/*.spec.ts"]),
        glob(["cypress/folder2/*.spec.ts"]),
        glob(["cypress/folder3/*.spec.ts"]),
        glob([
            "cypress/folder4/*.spec.ts,
            "cypress/folder5/*.spec.ts,
        "]),
    ],
    cypress_folder = "cypress",
    # Every files needed for all your cypress tests (like utils)
    global_cypress_files = FILES,
    # Make sure your starting port does not interfere with existing ones in other apps
    starting_port = 12111,
)
```

In the event that your test files needs to import a local package and not from npm, you will need to add
an alias to the webpack config of cypress into your `plugin.ts`

```javascript
import path from 'path';

import webpackPreprocessor from '@cypress/webpack-preprocessor';

module.exports = (on, config) => {
  // ...
  const options = webpackPreprocessor.defaultOptions;
  options.webpackOptions.resolve = {
    alias: {
      '@cognite': path.resolve('./packages'),
    },
  };

  on('file:preprocessor', webpackPreprocessor(options));
  // ...
};
```
