# Visual Regression Tests

Reveal uses visual tests as a form of regression testing and smoke tests.
The underlying stack leverages [playwright](https://playwright.dev/). 

The way it works is that we use [vite dev server](https://vite.dev/guide/cli#vite) to serve the contents of the visual tests (visual tests server) and have an instance of playwright (visual tests automation) play through the different visual tests.

To run the visual tests on your local environment, simply run `pnpm run test:visual` from the `/viewer` directory.

This will initiate a two-step process of hosting the visual tests server and running the visual tests client.
In case you want to run the visual tests multiple times, you can run these processes separately such that you do not have to spin up the server on each run, which will shorten the feedback cycle. To do this, simply run `pnpm run test:visual:server` and `pnpm run test:visual` in two separate terminals. Once the visual tests complete, the test server will still keep running, and you can run the visual test client again. If you want to only test a subset of the visual tests, you can start them in watch mode with `pnpm run test:visual --ui` and then use the standard playwright GUI to filter tests. Note that tests will not auto-run when you change visual tests since the watch mode is only on the test runner, so you will have to trigger a new run manually through the watch GUI.


## Running visual test in browser
Often it can be useful to locally develop against a visual test or simply inspect the result of visual tests.
There are currently multiple ways to do this based on your need.
The simplest way is to start the visual tests server with `pnpm run test:visual:server` and navigate to the hosted location.
You will notice only a blank screen due to not specifying which test should be run.
To specify the visual test to run add the `testfixture` url parameter with the value being the file name (without extension) of the test you want to run (f.ex. `https://localhost:8080/?testfixture=Rendering.VisualTest`).
Changes made to the visual test will automatically rebuild the test server and reload the test.

It is also possible to programatically start a visual test from the blank root page (`https://localhost:8080`) with `window.render` method (f.ex. `window.render('Rendering.VisualTest')`).

For packages in Reveal you might want to create an visual test entrypoint in a `pnpm run start` command.
This can be done by simply specifying and passing environment variable to vite in the command call.


An example script for a package.json would be something like this:
```
"start": "pnpm -w run ws:serve --env testFixture=Rendering.VisualTest.ts", 
```
Where the `testFixture` variable points to whatever you would like the entrypoint to be.

### Loading a specific 3D Model

Visual tests also supports loading different 3d-models than the basic primitives scene.
To load a local model in a visual test, simply specify a `modelUrl` url param that points to the 3d model you wish to use (f.ex. `https://localhost:8080/?testfixture=Rendering.VisualTest&modelUrl=[Path/to/my/3dmodel]`).

If you wish to use a 3D model hosted by [Cognite Data Fusion](https://www.cognite.com/en/product/cognite_data_fusion_industrial_dataops_platform) you first have to fill out a `/viewer/visual-tests/.cdf-env.json` config file with the environment you wish to target (tenant ID and client ID).
Start by making a copy of `/viewer/visual-tests/.cdf-env.example.json` and rename it to `.cdf-env.json`, and then fill out credentials for any projects you want to target.
The file will be git ignored.
This is an example of `.cdf-env.json` with mocked data:

```js
{
  "environments": {
    "cog-3d": {
      "tenantId": "1234-5678-1234-5678",
      "clientId": "9876-5432-9876-5432"
    }
  }
}
```

Once this is done you can specify additional URL parameters to target the specific environment (`env`) as well as the project, model, and revision ID. An example of the full URL will look something like this:

```
https://localhost:8080/?testfixture=Rendering.VisualTest&env=cog-3d&project=3d-test&cluster=greenfield&modelId=123456789&revisionId=987654321
```
Note that for Cognite developers, default values of `env`, `project` and `cluster` have been set to target the `3d-test` project, so only `modelId` and `revisionId` need to be specified when targeting that project like such:
 ```
https://localhost:8080/?testfixture=Rendering.VisualTest&modelId=123456789&revisionId=987654321
```

## Migrating a visual test to WebGPU

Individual visual tests can opt in to `WebGPURenderer` while the rest of the suite continues to run on WebGL. When a test is migrated, its existing baseline PNG is replaced with a WebGPU render.

### Opt in from a test module

Export a `renderer` constant from your `*.VisualTest.ts` file:

```ts
export const renderer = 'webgpu' as const;

export default class MyVisualTest extends SimpleVisualTestFixture {
  // ...
}
```

Tests that omit this export default to `'webgl'`. Only tests based on `SimpleVisualTestFixture` support WebGPU today; `StreamingVisualTestFixture` and `ViewerVisualTestFixture` remain WebGL-only until the production render pipeline is migrated.

Use standard Three.js materials (for example `MeshBasicMaterial`) in WebGPU tests. Custom GLSL `ShaderMaterial` / `RawShaderMaterial` used elsewhere in Reveal is not compatible with `WebGPURenderer`.

### Regenerating baselines after migration

After switching a test to WebGPU, regenerate its baseline:

```sh
pnpm exec playwright test --config=visual-tests/playwright.config.ts --update-snapshots -g "<TestName>"
```

The snapshot path is unchanged (`__image_snapshots__/<TestName>.png`); only the pixel content changes to match the WebGPU output.

### Browser and CI requirements

Playwright launches Chromium with both WebGL (ANGLE + SwiftShader) and WebGPU (Dawn + SwiftShader-Vulkan) enabled. CI installs Mesa software Vulkan (`mesa-vulkan-drivers`) on `ubuntu-latest` so Dawn can acquire a deterministic software adapter.

If WebGPU fails locally:

1. Confirm `navigator.gpu.requestAdapter()` succeeds in the test browser (the suite checks this in `beforeAll`).
2. Inspect `chrome://gpu` in a Chromium instance launched with the same flags as [playwright.config.ts](./playwright.config.ts).
3. On Linux, verify `vulkaninfo --summary` reports a software device such as `llvmpipe`.

## Creating your own Visual Test
Reveal requires no form of registration of visual tests and simply detects a visual test based on the filename suffix similar to how normal unit tests work.
For the testing framework to recognize a visual test it must have the `.VisualTest.ts` suffix, so for example `Colors.VisualTest.ts` is a valid name.
The visual test must have a default export of a class that extends the `VisualTestFixture` interface.
Other than that there are no restrictions placed and successfully doing this will automatically register the visual test to be run using the `pnpm run test:visual` command.

For convenience, there exists base classes that can be used to handle a lot of the common boilerplate code for a visual tests (model loading, instantiating common components and authentication).
Most usecases should be covered by the following abstraction levels:
- SimpleVisualTestFixture: Basic setup with a WebGL or WebGPU renderer (via `export const renderer`), scene, camera etc.
- StreamingVisualTestFixture: Component-level abstraction with CadMaterialManager, UpdateHandler, RenderPipeline etc.
- ViewerVisualTestFixture: API-level abstraction on top of Cognite3DViewer.

When creating new visual tests you should almost always use one of these abstractions.
If they do not cover a certain use-case or you create something that you think could be useful for other tests, consider either adding a new base VisualTestFixture or extend the current ones.
