# Reveal viewer

Documentation for the latest version is available at [https://cognitedata.github.io/reveal-docs/docs](https://cognitedata.github.io/reveal-docs/docs). Documentation for the next release is available from [https://cognitedata.github.io/reveal-docs/docs/next/](https://cognitedata.github.io/reveal-docs/docs/next/).

The documentation has a bunch of [live examples](https://cognitedata.github.io/reveal-docs/docs/examples/cad-basic).
---

## Code Example

```typescript
import { Cognite3DViewer } from "@cognite/reveal";
import { CogniteClient, CogniteAuthentication } from "@cognite/sdk";

const appId = "com.cognite.reveal.example";
const client = new CogniteClient({
  appId,
  project,
  getToken
});

async function start() {
  await client.authenticate();

  const viewer = new Cognite3DViewer({
    sdk: client,
    domElement: document.querySelector("#your-element-for-viewer")
  });
  viewer.addModel({ modelId: 4715379429968321, revisionId: 5688854005909501 });
}

const project = "publicdata";
const legacyInstance = new CogniteAuthentication({
  project,
});

const getToken = async () => {
  await legacyInstance.handleLoginRedirect();
  let token = await legacyInstance.getCDFToken();
  if (token) {
    return token.accessToken;
  }
  token = await legacyInstance.login({ onAuthenticate: "REDIRECT" });
  if (token) {
    return token.accessToken;
  }
  throw new Error("authentication error");
};

start();
```

## Installation

```bash
npm install @cognite/reveal @cognite/sdk three@<version>
```

Please find the correct version of ThreeJS in the release documentation on Github. We only guarantee support for the exact ThreeJS version specified there.

See [our documentation](https://cognitedata.github.io/reveal-docs/docs/examples/cad-basic) for usage.

## Prerequisites

For development, you will need to install [Node](https://nodejs.org/en/download/), [Yarn](https://yarnpkg.com/getting-started/install) and [Rust+Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html).

Run `yarn` in the viewer

## Local Packages
The Reveal viewer is structured using local packages.
This allows you to test features in isolation and constrain the dependencies with logical barriers between features.
Packages are located in the `/packages/` subfolder.
There is no enforced structure of the packages and their layout and content will vary depending on what the package exposes to the rest of the system.
Dependencies that are located in the `viewer/package.json` will be shared and are accessible by any package without having to explicitly declare a dependency in the respective package's `package.json`.
Any external dependency (e.g. `lodash`, `threejs`, etc.) must be declared in the root `package.json` such that they will be properly installed by users that consume the `Reveal` NPM package.

### Creating a local package
Create a new folder under the `/packages/` folder, e.g. `/packages/[MY-PACKAGE-NAME]` and include a package with the following structure:

```json
{
  "name": "@reveal/[MY-PACKAGE-NAME]",
  "private": true,
  "main": "index.ts",
}
```

Technically the `private: true` field can be omitted but it is highly recommended such that one does not accidentally publish the local package to NPM with the `npm publish` command.
The `index.ts` should include any types, functions and/or classes you wish to expose to consumers of this package. You should also create a `README.md` file for your package that explains its intent and any information that is needed to use the package.

If your package depends on another local package, it must be explicitly declared as a dependency:
```json
{
  "name": "@reveal/[MY-PACKAGE-NAME]",
  "private": true,
  "main": "index.ts",
  "dependencies": {
    "@reveal/[SOME-LOCAL-PACKAGE]": "workspace:*"
  }
}
```
The `workspace` keyword declares that the dependency is a local package and should never be fetched from NPM.
And the `':*'` syntax means that it should just grab any version available. See [this](https://yarnpkg.com/features/workspaces) for more documentation on yarn workspaces.

If you want to add Rust/Webassembly code to a package, you can add the following script in `package.json`:

```json
{
  "scripts": {
    "run-wasm-pack": "yarn run ws:update-cargo-index && wasm-pack"
  }
}
```
and let the Cargo crate reside in `<package-name>/wasm`.
Then the crate will automatically be built and tested by the `build` and `test` scripts in the workspace root respectively.
The `ws:update-cargo-index` step ensures that the local `crates.io` index has been updated before running build.
Otherwise, the index update will be executed in a quiet manner, and the command may appear to hang for several minutes.

When writing tests in Rust, the tests must be annotated with the `#[wasm_bindgen_test]` attribute, instead of the conventional `#[test]`, and `wasm-bindgen-test` must be added as a (dev-)dependency. All tests are run as part of the normal `yarn test` script in the root folder, but can also be run manually with e.g. `wasm-pack test --chrome --headless` in the relevant `wasm` folder.

It is also possible to run and test a local package in isolation from the rest of Reveal.
Convenience functionality has been created to make this easy.
Add the following script to your package's `package.json`:
```json
{
  "scripts": {
    "test": "yarn ws:test --config ./../../jest.config.js"
  }
}
```
Running `yarn run test` will run all tests in your package that resolves the `*.test.*` regex pattern.

To run a test app that includes your package (and any dependencies), create a `/app/` subfolder in your package that includes an `index.ts` file.
Add the following script to your package's `package.json`:
```json
{
  "scripts": {
    "start": "yarn ws:start"
  }
}
```

Running the command `yarn start` will host a localhost site with a template HTML that includes the `/app/index.ts` script that has been transpiled to javascript.
To see an example of this check out the `packages/camera-manager` package.

## API Extractor

The `viewer/reveal.api.md` file contains a description of the public API of Reveal. In the CI pipeline, the `reveal.api.md` file is checked to be up-to-date by API extractor.

In order to update this file locally, run `yarn run update-api` *after* having run the build script. This will update the API file with any changes, which should be added and committed in the same PR.

## Debugging

### Worker source maps

When bundling source maps with inlined web workers, the bundle size grows huge. Therefore source maps for workers are disabled by default. In order to add source maps to workers, pass `--env workerSourceMaps=true` to the `yarn build` script.

## Creating and running visual tests

Visual test files must be on the format `visual-tests/SomeTest.VisualTest.ts`. See one of the existing tests
for example on how to create a test.

Visual tests can be run from `viewer/` using `yarn test:visual`. This will run all visual tests. You can also
run a single test by using `yarn test:visual -- -t="SomeTest"` (will run all tests with "SomeTest" in the name). Note that arguments only will be passed to the client, to pass arguments to the server you will need to manually start the server and client separately.

For more information about visual tests, see [visual-tests/README.md](visual-tests/README.md).

### Recommended package folder structure
    ├── app                   # Runnable app
    │ └──index.ts             # Entry point for runnable app
    ├── src                   # Source code for package
    ├── wasm                  # Rust/Webassembly source code for package
    ├── test                  # Automated tests
    ├── package.json          # Package declaration
    ├── index.ts              # Entry point for package
    └── README.md             # Readme
