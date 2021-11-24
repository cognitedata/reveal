# React Demo App

This app is served as an example [React]-based application served using frontend-app-server (FAS).

## Requirements to run and test locally

Copy react-demo-app-e2e-azure-dev.jwk-key.json from Lastpass -> Shared Demo App into the file:
private-keys/react-demo-app-e2e-azure-dev.jwk-key.json

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

#### Batch testcafe testing

```bazel
copy_to_bin(
    name = "copy_main_testcafe_files",
    # Every files needed for all your testcafe tests (like utils)
    srcs = FILES,
)

testcafe_batch_test(
    name = "base_name_for_every_tests",
    # folder name to store artifacts during CI run
    app_name = "app-name",
    # command line arguments to run testcafe
    args = ARGS,
    data = TESTCAFE_DEPS + [
        ":my_build_target",
        ":copy_main_testcafe_files",
    ],
    # Path to your script serving your build files
    serve_script = "./scripts/testcafe-bazel-serve.sh",
    # Make sure your starting port does not interfere with existing ones in other apps
    starting_port = 11111,
    # Insert as many globs here as you want runs of your tests
    testcafe_files = [
        glob(["testcafe/folder1/*.spec.ts"]),
        glob(["testcafe/folder2/*.spec.ts"]),
        glob(["testcafe/folder3/*.spec.ts"]),
        glob([
            "testcafe/folder4/*.spec.ts,
            "testcafe/folder5/*.spec.ts,
        "]),
    ],
)
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
