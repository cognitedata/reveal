# Reveal viewer

## Install

...

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

## Local development

To run the test project on a local server:

```bash
npm run serve
```

Important: Node version 10 is necessary for wasm-pack to work.

## Coordinate systems

The data served from Cognite Data Fusion is in a right-handed coordinate system with Z up,
X to the right and Y pointing into the screen.

In Three.js, which is supported by the Reveal viewer, the coordinate system is right-handed with
Y up, X to the right and Z pointing out of the screen.

### Conversion between the different coordinate systems

The policy in this repository is to stick with the CDF coordinate system in any code that is not
viewer-specific.
For viewer-specific code, the conversion should happen as early as possible.

# Code Example

```typescript
const wrapper = document.createElement('div');
const wrapperStyle = wrapper.style;
wrapperStyle.position = 'fixed';
wrapperStyle.width = '800px';
wrapperStyle.height = '600px';
document.body.appendChild(wrapper);

const appId = 'com.cognite.reveal.example';
const client = new CogniteClient({ appId });
client.loginWithOAuth({ project: 'publicdata' });

const viewer = new Cognite3DViewer({ sdk: client, domElement: wrapper });
viewer.addModel({ modelId: 4715379429968321, revisionId: 5688854005909501 });

```

# API Reference

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
> Get the x, y, z vector of the viewer's camera position

> `setCameraPosition(`position: THREE.Vector3`)`: void;<br>
> Set the x, y, z vector of the viewer's camera position

> `getCameraTarget()`: THREE.Vector3;<br>
> Get the x, y, z vector of the viewer's camera pivot point?

> `setCameraTarget(`target: THREE.Vector3`)`: void;<br>
> Set the x, y, z vector of the viewer's camera pivot point?

> `fitCameraToModel(`model: CogniteModelBase, duration?: number`)`: void;<br>
> Change camera parameters in regards to model

> `fitCameraToBoundingBox(`box: THREE.Box3, duration?: number, radiusFactor?: number`)`: void;<br>
> Change camera parameters in regards to bounding box

**Utilities**
> `setSlicingPlanes(`slicingPlanes: THREE.Plane[]`)`: void;<br>
> Set the slicing planes for visible culling

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
>

**Hints**
> `renderHints()`: CadRenderHints;<br>
>

> `renderHints(`hints: CadRenderHints`)`: void;<br>
>

> `loadingHints()`: CadLoadingHints;<br>
>

> `renderHints(`hints: CadLoadingHints`)`: void;<br>
>

**Bounding Box**
> `getBoundingBox(`nodeId?: number, box?: THREE.Box3`)`: THREE.Box3;<br>
>

> async `getBoundingBoxFromApi(`nodeId: number, box?: THREE.Box3`)`: Promise\<THREE.Box3\>;<br>
>

> `getModelBoundingBox()`: THREE.Box3;<br>
>

**Visibility**
> async `showNode(`nodeId: number`)`: Promise\<void\>;<br>
>

> async `hideNode(`nodeId: number, makeGray?: boolean`)`: Promise\<void\>;<br>
>

> `showAllNodes()`: void;<br>
>

> `hideAllNodes(`makeGray?: boolean`)`: void;<br>
>

**Color**
> async `getNodeColor(`nodeId: number`)`: Promise\<Color\>;<br>
>

> async `setNodeColor(`nodeId: number, r: number, g: number, b: number`)`: Promise\<void\>;<br>
>

> async `resetNodeColor(`nodeId: number`)`: Promise\<void\>;<br>
>

**Selection**

> `selectNode(`_nodeId: number`)`: void;<br>
>

> `deselectNode(`_nodeId: number`)`: void;<br>
>

> `deselectAllNodes()`: void;<br>
>

**Utilities**
> `tryGetNodeId(`treeIndex: number`)`: number | undefined;<br>
>

> `getSubtreeNodeIds(`_nodeId: number, _subtreeSize?: number`)`: Promise\<number[]\>;<br>
>

> `updateNodeIdMaps(`sector: { lod: string; data: Sector | SectorQuads }`)`: void;<br>
>


> `iterateNodes(`_action: (nodeId: number, treeIndex?: number) => void`)`: void;<br>
>

> `iterateSubtree(`_nodeId: number, _action: (nodeId: number, treeIndex?: number) => void, _treeIndex?: number, _subtreeSize?: number`)`: Promise\<boolean\>;<br>
>

**Cleanup**
> `dispose()`: void;<br>
>
