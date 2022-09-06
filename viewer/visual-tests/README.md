# Visual Regression Tests

Reveal uses visual tests as a form of regression testing and smoke tests.
The underlying stack leverages [puppeteer](https://www.npmjs.com/package/puppeteer) and [jest](https://www.npmjs.com/package/jest). 

The way it works is that we use [webpack-dev-server](https://www.npmjs.com/package/webpack-dev-server) to serve the contents of the visual tests (visual tests server) and have an instance of jest (visual tests client) play through the different visual tests using puppeteer.

To run the visual tests on your local environment, simply run `yarn run test:visual` from the `/viewer` directory.

This will initiate a two-step process of hosting the visual tests server and running the visual tests client.
In case you want to run the visual tests multiple times, you can run these processes separately such that you do not have to spin up the server on each run, which will shorten the feedback cycle. To do this, simply run `yarn run test:visual:server` and `yarn run test:visual:client` in two separate terminals. Once the visual tests complete, the test server will still keep running, and you can run the visual test client again. If you want to only test a subset of the visual tests, you can start them in watch mode with `yarn run test:visual:client --watch` and then use the standard jest terminal GUI to filter tests. Note that tests will not auto-run when you change visual tests since the watch mode is only on the test runner, so you will have to trigger a new run manually through the jest watch GUI.


## Running visual test in browser
Often it can be useful to locally develop against a visual test or simply inspect the result of visual tests.
There are currently multiple ways to do this based on your need.
The simplest way is to start the visual tests server with `yarn run test:visual:server` and navigate to the hosted location.
You will notice only a blank screen due to not specifying which test should be run.
To specify the visual test to run add the `testfixture` url parameter with the value being the file name (without extension) of the test you want to run (f.ex. `https://localhost:8080/?testfixture=Rendering.VisualTest`).
Changes made to the visual test will automatically rebuild the test server and reload the test.

It is also possible to programatically start a visual test from the blank root page (`https://localhost:8080`) with `window.render` method (f.ex. `window.render('Rendering.VisualTest')`).

For packages in Reveal you might want to create an visual test entrypoint in a `yarn start` command.
This can be done by simply specifying and environment variable to webpack.
An example script for a package.json would be something like this:
```
"start": "yarn ws:serve --env testFixture=Rendering.VisualTest.ts", 
```
Where the `testFixture` variable points to whatever you would like the entrypoint to be.

### Loading a specific 3D Model

Visual tests also supports loading different 3d-models than the basic primitives scene.
To load a local model in a visual test, simply specify a `modelUrl` url param that points to the 3d model you wish to use (f.ex. `https://localhost:8080/?testfixture=Rendering.VisualTest&modelUrl=[Path/to/my/3dmodel]`).

If you wish to use a 3D model hosted by [Cognite Data Fusion](https://www.cognite.com/en/product/cognite_data_fusion_industrial_dataops_platform) you first have to fill out the `/viewer/visual-tests/.cdf-environments.json` config file with the environment you wish to target (tenant ID and client ID).
Once this is done you can specify additional URL parameters to target the specific environment (`env`) as well as the project, model, and revision ID. An example of the full URL will look something like this:

```
https://localhost:8080/?testfixture=Rendering.VisualTest&env=cog-3d&project=3d-test&cluster=greenfield&modelId=123456789&revisionId=987654321
```
Note that for Cognite developers, default values of `env`, `project` and `cluster` have been set to target the `3d-test` project, so only `modelId` and `revisionId` need to be specified when targeting that project like such:
 ```
https://localhost:8080/?testfixture=Rendering.VisualTest&modelId=123456789&revisionId=987654321
```

## Creating your own Visual Test
Reveal requires no form of registration of visual tests and simply detects a visual test based on the filename suffix similar to how normal unit tests work.
For the testing framework to recognize a visual test it must have the `.VisualTest.ts` suffix, so for example `Colors.VisualTest.ts` is a valid name.
The visual test must have a default export of a class that extends the `VisualTestFixture` interface.
Other than that there are no restrictions placed and successfully doing this will automatically register the visual test to be run using the `yarn run test:visual` command.

For convenience, there exists base classes that can be used to handle a lot of the common boilerplate code for a visual tests (model loading, instantiating common components and authentication).
Most usecases should be covered by the following abstraction levels:
- SimpleVisualTestFixture: Basic setup with a WebGLRenderer, scene, camera etc.
- StreamingVisualTestFixture: Component-level abstraction with CadMaterialManager, UpdateHandler, RenderPipeline etc.
- ViewerVisualTestFixture: API-level abstraction on top of Cognite3DViewer.

When creating new visual tests you should almost always use one of these abstractions.
If they do not cover a certain use-case or you create something that you think could be useful for other tests, concider either adding a new base VisualTestFixture or extend the current ones.

