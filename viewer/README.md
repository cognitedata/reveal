# Reveal viewer

## Code Example

```typescript
import { Cognite3DViewer } from "@cognite/reveal";
import { CogniteClient } from "@cognite/sdk";

const appId = "com.cognite.reveal.example";
const client = new CogniteClient({ appId });

client.loginWithOAuth({ project: "publicdata" });

const viewer = new Cognite3DViewer({
  sdk: client,
  domElement: document.querySelector("#your-element-for-viewer")
});
viewer.addModel({ modelId: 4715379429968321, revisionId: 5688854005909501 });
```

## Installation

```bash
npm install @cognite/reveal
```

### Expose all `*.worker.js` and `*.wasm` files from `@cognite/reveal` 

This library uses web-workers and web-assembly, but it's tricky to bundle them into npm-package. 

That's why you will have to make sure that all `*.worker.js` and `*.wasm` files from `@cognite/reveal` are copied
to your project's output folder. 

#### Create react app

1. Install [react-app-rewired](https://github.com/timarney/react-app-rewired). 
It's required to slightly modify react-scripts from create-react-app without running `eject`

    ```bash
    npm install react-app-rewired --save-dev
    ```
   
1. 'Flip' the existing calls to `react-scripts` in `npm` scripts for start, build and test
 
   ```diff
     /* package.json */
   
     "scripts": {
   -   "start": "react-scripts start",
   +   "start": "react-app-rewired start",
   -   "build": "react-scripts build",
   +   "build": "react-app-rewired build",
   -   "test": "react-scripts test",
   +   "test": "react-app-rewired test",
       "eject": "react-scripts eject"
   }
   ```

1. Install [copy-webpack-plugin](https://webpack.js.org/plugins/copy-webpack-plugin/)
    
   ```bash
    npm install copy-webpack-plugin --save-dev
    ```

1. Create a `config-overrides.js` file in the root directory with the following content

    ```javascript
    const CopyWebpackPlugin = require('copy-webpack-plugin');
    
    const revealSource = 'node_modules/@cognite/reveal';
    
    module.exports = function override(config) {
      if (!config.plugins) {
        // eslint-disable-next-line no-param-reassign
        config.plugins = [];
      }
    
      // that's for 6.x version of webpack-copy-plugin
      // if you use 5.x just put content of patterns into constructor
      // new CopyWebpackPlugin([ /* { from, to } */ ])
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: `${revealSource}/**/*.worker.js`,
              to: '.',
              flatten: true,
            },
            {
              from: `${revealSource}/**/*.wasm`,
              to: '.',
              flatten: true,
            },
          ],
        })
      );
    
      return config;
    };
    ```

1. In your `index.html` file add base location for relative URLs:

    ```html
    <head>
       <base href="/" /> 
    ``` 
   
Now all `*.worker.js` and `*.wasm` files from `@cognite/reveal` should be copied into your output folder when you run build.

#### Non create-react-app based projects

Just make sure that you have `*.worker.js` and `*.wasm` files from `@cognite/reveal` in your output folder.
If you use webpack, you might want to add [copy-webpack-plugin@^5.1.1](https://webpack.js.org/plugins/copy-webpack-plugin/)
in your `webpack.config.js`

```javascript
// webpack.config.js
const revealSource = 'node_modules/@cognite/reveal';

{
  /* ... */
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `${revealSource}/**/*.worker.js`,
          to: '.',
          flatten: true,
        },
        {
          from: `${revealSource}/**/*.wasm`,
          to: '.',
          flatten: true,
        },
      ],
    })
  ]
}
```

### Make sure your server sends `*.wasm` files with `Content-type: application/wasm` header.

Sometimes servers don't have correct MIME type set for wasm files. 
In that case you might notice this message in a browser console when it fetches a `.wasm` file:

> Uncaught (in promise) TypeError: Failed to execute 'compile' on 'WebAssembly': Incorrect response MIME type. Expected 'application/wasm'.

In that case you need to configure your server to set the `Content-type: application/wasm` header for `*.wasm` files. 
If you use the nginx add [types](https://nginx.org/en/docs/http/ngx_http_core_module.html#types) in the config 
or edit the [mime.types file](https://www.nginx.com/resources/wiki/start/topics/examples/full/#mime-types). 

```types
types {
    application/wasm wasm;
}
```


## Coordinate systems

The data served from Cognite Data Fusion is in a right-handed coordinate system with Z up,
X to the right and Y pointing into the screen.

In Three.js, which is supported by the Reveal viewer, the coordinate system is right-handed with
Y up, X to the right and Z pointing out of the screen.

### Conversion between the different coordinate systems

The policy in this repository is to stick with the CDF coordinate system in any code that is not
viewer-specific.
For viewer-specific code, the conversion should happen as early as possible.

# API Reference

The API mostly matches the API of the previous Reveal viewer that can be found at [@cognite/3d-viewer](https://www.npmjs.com/package/@cognite/3d-viewer). See the [API refernece](https://www.npmjs.com/package/@cognite/3d-viewer#api-reference) for details.

## Cognite3DViewer

**Cognite 3D Models**
> `determineModelType(`_modelId: number, revisionId: number`)`: Promise\<SupportedModelTypes\>;<br>
> Determine the type of the model added, CAD or PointCloud

> `addModel(`options: AddModelOptions`)`: Promise\<Cognite3DModel\>;<br>
> Add a CAD model to the viewer

> `addPointCloudModel(`options: AddModelOptions`)`: Promise\<CognitePointCloudModel\>;<br>
> Add a PointCloud model to the viewer

**Custom 3D Models**
> `addObject3D(`_object: THREE.Object3D`)`: void;<br>
> Add a custom THREE Model to the viewer

> `removeObject3D(`_object: THREE.Object3D`)`: void;<br>
> Remove a custom THREE Model from the viewer

**Events**
> `on(`event: 'click' | 'hover', _callback: PointerEventDelegate`)`: void;<br>
> Add a **click** or **hover** mouse event callback

> `on(`event: 'cameraChanged', _callback: CameraChangeDelegate`)`: void;<br>
> Add a **camera changed** event callback

> `off(`event: 'click' | 'hover', _callback: (event: PointerEvent) => void`)`: void;<br>
> Remove a **click** or **hover** mouse event callback

> `off(`event: 'cameraChanged', _callback: (position: THREE.Vector3, target: THREE.Vector3) => void`)`: void;<br>
> Remove a **camera changed** event callback

**Camera**
> `enableKeyboardNavigation()`: void;<br>
> Enables camera navigation with the keyboard<br>
> **W:** Zoom in
> **A:** Pan Left
> **S:** Zoom out
> **D:** Pan Right
> **E:** Pan Upwards?
> **Q:** Pan Downwards?

> `disableKeyboardNavigation()`: void;<br>
> Disables camera navigation with the keyboard

> `getCameraPosition()`: THREE.Vector3;<br>
> Get the camera position.

> `setCameraPosition(`position: THREE.Vector3`)`: void;<br>
> Set the camera position.

> `getCameraTarget()`: THREE.Vector3;<br>
> Get thecamera pivot point.

> `setCameraTarget(`target: THREE.Vector3`)`: void;<br>
> Set the camera pivot point and focal point.

> `fitCameraToModel(`model: CogniteModelBase, duration?: number`)`: void;<br>
> Change camera parameters to fit the view to show an overview of the model provided.

> `fitCameraToBoundingBox(`box: THREE.Box3, duration?: number, radiusFactor?: number`)`: void;<br>
> Change camera parameters to fit the bounding box provided in the view.

**Utilities**
> `setSlicingPlanes(`slicingPlanes: THREE.Plane[]`)`: void;<br>
> Set the slicing planes for visibility culling.

> `worldToScreen(`_point: THREE.Vector3, _normalize?: boolean`)`: THREE.Vector2 | null;<br>
> Transform a 3D position in the viewer into a 2D position on screen

> `getScreenshot(`_width?: number, _height?: number`)`: Promise\<string\>;<br>
> Create a screenshot of the input of the current model

> `getIntersectionFromPixel(`offsetX: number, offsetY: number, _cognite3DModel?: Cognite3DModel`)`: null | Intersection;<br>
> Get intersection data from a 2D screen position.

**Cleanup**
> `dispose()`: void;<br>
> Dispose of references held by the viewer

> `clearCache()`: void;<br>
> @Not Supported


## Cognite3DModel

**Read-only Parameters**
> `type`: SupportedModelTypes;<br>
> Always retuns 'cad'.

**Hints**
> `renderHints()`: CadRenderHints;<br>
> Get the render hints of a model

> `renderHints(`hints: CadRenderHints`)`: void;<br>
> Set the render hints of a model

> `loadingHints()`: CadLoadingHints;<br>
> Get the loading hints of a model

> `renderHints(`hints: CadLoadingHints`)`: void;<br>
> Set the loading hints of a model

**Bounding Box**
> `getBoundingBox(`nodeId?: number, box?: THREE.Box3`)`: THREE.Box3;<br>
> Get the bounding of the entire model, bounding box of node is not supported, use `getBoundingBoxFromCdf()`

> async `getBoundingBoxFromCdf(`nodeId: number, box?: THREE.Box3`)`: Promise\<THREE.Box3\>;<br>
> Get the bounding box of a node.

> `getModelBoundingBox()`: THREE.Box3;<br>
> Get the bounding box of the entire model.

**Visibility**
> async `showNode(`nodeId: number`)`: Promise\<void\>;<br>
> Make a node visible.

> async `hideNode(`nodeId: number, makeGray?: boolean`)`: Promise\<void\>;<br>
> Make a node invisible.

> `showAllNodes()`: void;<br>
> Make all nodes visisble.

> `hideAllNodes(`makeGray?: boolean`)`: void;<br>
> Make all nodes invisible.

**Color**
> async `getNodeColor(`nodeId: number`)`: Promise\<Color\>;<br>
> Get the color of a node.

> async `setNodeColor(`nodeId: number, r: number, g: number, b: number`)`: Promise\<void\>;<br>
> Set the color of a node.

> async `resetNodeColor(`nodeId: number`)`: Promise\<void\>;<br>
> Reset the color of a node.

**Selection**

> `selectNode(`_nodeId: number`)`: void;<br>
> Select a node.

> `deselectNode(`_nodeId: number`)`: void;<br>
> Deselect a node.

> `deselectAllNodes()`: void;<br>
> Deselect all nodes.

**Utilities**
> `tryGetNodeId(`treeIndex: number`)`: number | undefined;<br>
> Get id of node through treeIndex

> `getSubtreeNodeIds(`_nodeId: number, _subtreeSize?: number`)`: Promise\<number[]\>;<br>
> Get node ids of children of a node.

> `iterateNodes(`_action: (nodeId: number, treeIndex?: number) => void`)`: void;<br>
> Iterate through the nodes.

> `iterateSubtree(`_nodeId: number, _action: (nodeId: number, treeIndex?: number) => void, _treeIndex?: number, _subtreeSize?: number`)`: Promise\<boolean\>;<br>
> @Not supported

**Cleanup**
> `dispose()`: void;<br>
>


## CognitePointCloudModel

**Read-only Parameters**
> `type`: SupportedModelTypes;<br>
> Always retuns 'pointcloud'.

**Hints**
> `pointBudget()`: number;<br>
> Get the maximum number of points to load and visualize.

> `pointBudget(`count: number`)`: void;<br>
> Sets the maximum number of points to load.

**Bounding Box**
> `getModelBoundingBox()`: THREE.Box3;<br>
> Returns the full bounding box for the point cloud.

**Cleanup**
> `dispose()`: void;<br>
>
