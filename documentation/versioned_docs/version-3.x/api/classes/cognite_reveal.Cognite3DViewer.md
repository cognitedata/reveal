---
id: "cognite_reveal.Cognite3DViewer"
title: "Class: Cognite3DViewer"
sidebar_label: "Cognite3DViewer"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).Cognite3DViewer

## Constructors

### constructor

• **new Cognite3DViewer**(`options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`Cognite3DViewerOptions`](../interfaces/cognite_reveal.Cognite3DViewerOptions.md) |

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:204](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L204)

## Accessors

### cadBudget

• `get` **cadBudget**(): [`CadModelBudget`](../modules/cognite_reveal.md#cadmodelbudget)

Gets the current budget for downloading geometry for CAD models. Note that this
budget is shared between all added CAD models and not a per-model budget.

#### Returns

[`CadModelBudget`](../modules/cognite_reveal.md#cadmodelbudget)

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:158](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L158)

• `set` **cadBudget**(`budget`): `void`

Sets the current budget for downloading geometry for CAD models. Note that this
budget is shared between all added CAD models and not a per-model budget.

#### Parameters

| Name | Type |
| :------ | :------ |
| `budget` | [`CadModelBudget`](../modules/cognite_reveal.md#cadmodelbudget) |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:168](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L168)

___

### cameraManager

• `get` **cameraManager**(): [`CameraManager`](../interfaces/cognite_reveal.CameraManager.md)

#### Returns

[`CameraManager`](../interfaces/cognite_reveal.CameraManager.md)

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:498](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L498)

___

### domElement

• `get` **domElement**(): `HTMLElement`

The DOM element the viewer will insert its rendering canvas into.
The DOM element can be specified in the options when the viewer is created.
If not specified, the DOM element will be created automatically.
The DOM element cannot be changed after the viewer has been created.

#### Returns

`HTMLElement`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:96](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L96)

___

### models

• `get` **models**(): [`CogniteModelBase`](../interfaces/cognite_reveal.CogniteModelBase.md)[]

Gets a list of models currently added to the viewer.

#### Returns

[`CogniteModelBase`](../interfaces/cognite_reveal.CogniteModelBase.md)[]

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:193](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L193)

___

### pointCloudBudget

• `get` **pointCloudBudget**(): [`PointCloudBudget`](../modules/cognite_reveal.md#pointcloudbudget)

Returns the point cloud budget. The budget is shared between all loaded
point cloud models.

#### Returns

[`PointCloudBudget`](../modules/cognite_reveal.md#pointcloudbudget)

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:178](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L178)

• `set` **pointCloudBudget**(`budget`): `void`

Sets the point cloud budget. The budget is shared between all loaded
point cloud models.

#### Parameters

| Name | Type |
| :------ | :------ |
| `budget` | [`PointCloudBudget`](../modules/cognite_reveal.md#pointcloudbudget) |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:186](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L186)

___

### renderer

• `get` **renderer**(): `WebGLRenderer`

Returns the renderer used to produce images from 3D geometry.

#### Returns

`WebGLRenderer`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:103](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L103)

## Methods

### addCadModel

▸ **addCadModel**(`options`): `Promise`\<[`Cognite3DModel`](cognite_reveal.Cognite3DModel.md)\>

Add a new CAD 3D model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](cognite_reveal.Cognite3DViewer.md#fitcameratomodel) to see the model after the model has loaded.

**`example`**
```js
const options = {
modelId:     'COGNITE_3D_MODEL_ID',
revisionId:  'COGNITE_3D_REVISION_ID',
};
viewer.addCadModel(options).then(model => {
viewer.fitCameraToModel(model, 0);
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`AddModelOptions`](../interfaces/cognite_reveal.AddModelOptions.md) |

#### Returns

`Promise`\<[`Cognite3DModel`](cognite_reveal.Cognite3DModel.md)\>

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:594](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L594)

___

### addModel

▸ **addModel**(`options`): `Promise`\<[`CognitePointCloudModel`](cognite_reveal.CognitePointCloudModel.md) \| [`Cognite3DModel`](cognite_reveal.Cognite3DModel.md)\>

Add a new model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](cognite_reveal.Cognite3DViewer.md#fitcameratomodel) to see the model after the model has loaded.

**`example`**
```js
const options = {
modelId:     'COGNITE_3D_MODEL_ID',
revisionId:  'COGNITE_3D_REVISION_ID',
};
viewer.addModel(options).then(model => {
viewer.fitCameraToModel(model, 0);
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`AddModelOptions`](../interfaces/cognite_reveal.AddModelOptions.md) |

#### Returns

`Promise`\<[`CognitePointCloudModel`](cognite_reveal.CognitePointCloudModel.md) \| [`Cognite3DModel`](cognite_reveal.Cognite3DModel.md)\>

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:561](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L561)

___

### addObject3D

▸ **addObject3D**(`object`): `void`

Add a THREE.Object3D to the viewer.

**`example`**
```js
const sphere = new THREE.Mesh(
new THREE.SphereBufferGeometry(),
new THREE.MeshBasicMaterial()
);
viewer.addObject3D(sphere);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `Object3D`\<`Event`\> |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:734](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L734)

___

### addPointCloudModel

▸ **addPointCloudModel**(`options`): `Promise`\<[`CognitePointCloudModel`](cognite_reveal.CognitePointCloudModel.md)\>

Add a new pointcloud 3D model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](cognite_reveal.Cognite3DViewer.md#fitcameratomodel) to see the model after the model has loaded.

**`example`**
```js
const options = {
modelId:     'COGNITE_3D_MODEL_ID',
revisionId:  'COGNITE_3D_REVISION_ID',
};
viewer.addPointCloudModel(options).then(model => {
viewer.fitCameraToModel(model, 0);
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`AddModelOptions`](../interfaces/cognite_reveal.AddModelOptions.md) |

#### Returns

`Promise`\<[`CognitePointCloudModel`](cognite_reveal.CognitePointCloudModel.md)\>

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:622](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L622)

___

### determineModelType

▸ **determineModelType**(`modelId`, `revisionId`): `Promise`\<``""`` \| [`SupportedModelTypes`](../modules/cognite_reveal.md#supportedmodeltypes)\>

Use to determine of which type the model is.

**`example`**
```typescript
const viewer = new Cognite3DViewer(...);
const type = await viewer.determineModelType(options.modelId, options.revisionId)
let model: Cognite3DModel | CognitePointCloudModel
switch (type) {
  case 'cad':
    model = await viewer.addCadModel(options);
    break;
  case 'pointcloud':
    model = await viewer.addPointCloudModel(options);
    break;
  default:
    throw new Error('Model is not supported');
}
viewer.fitCameraToModel(model);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `modelId` | `number` | The model's id. |
| `revisionId` | `number` | The model's revision id. |

#### Returns

`Promise`\<``""`` \| [`SupportedModelTypes`](../modules/cognite_reveal.md#supportedmodeltypes)\>

Empty string if type is not supported.

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:701](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L701)

___

### dispose

▸ **dispose**(): `void`

Dispose of WebGL resources. Can be used to free up memory when the viewer is no longer in use.

**`see`** [https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects](https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects)
```ts
// Viewer is no longer in use, free up memory
viewer.dispose();
```.

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:340](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L340)

___

### fitCameraToBoundingBox

▸ **fitCameraToBoundingBox**(`box`, `duration?`, `radiusFactor?`): `void`

Move camera to a place where the content of a bounding box is visible to the camera.

**`example`**
```js
// Fit camera to bounding box over 500 milliseconds
viewer.fitCameraToBoundingBox(boundingBox, 500);
```
```js
// Fit camera to bounding box instantaneously
viewer.fitCameraToBoundingBox(boundingBox, 0);
```
```js
// Place the camera closer to the bounding box
viewer.fitCameraToBoundingBox(boundingBox, 500, 2);
```

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `box` | `Box3` | `undefined` | The bounding box in world space. |
| `duration?` | `number` | `undefined` | The duration of the animation moving the camera. Set this to 0 (zero) to disable animation. |
| `radiusFactor` | `number` | `2` | The ratio of the distance from camera to center of box and radius of the box. |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:902](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L902)

___

### fitCameraToModel

▸ **fitCameraToModel**(`model`, `duration?`): `void`

Move camera to a place where the 3D model is visible.
It uses the bounding box of the 3D model and calls [Cognite3DViewer.fitCameraToBoundingBox](cognite_reveal.Cognite3DViewer.md#fitcameratoboundingbox).

**`example`**
```js
// Fit camera to model
viewer.fitCameraToModel(model);
```
```js
// Fit camera to model over 500 milliseconds
viewer.fitCameraToModel(model, 500);
```
```js
// Fit camera to model instantly
viewer.fitCameraToModel(model, 0);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `model` | [`CogniteModelBase`](../interfaces/cognite_reveal.CogniteModelBase.md) | The 3D model. |
| `duration?` | `number` | The duration of the animation moving the camera. Set this to 0 (zero) to disable animation. |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:878](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L878)

___

### getCamera

▸ **getCamera**(): `PerspectiveCamera`

**`obvious`**

#### Returns

`PerspectiveCamera`

The THREE.Camera used for rendering.

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:828](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L828)

___

### getClippingPlanes

▸ **getClippingPlanes**(): `Plane`[]

Returns the current active clipping planes.

#### Returns

`Plane`[]

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:820](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L820)

___

### getIntersectionFromPixel

▸ **getIntersectionFromPixel**(`offsetX`, `offsetY`): `Promise`\<[`Intersection`](../modules/cognite_reveal.md#intersection)\>

Raycasting model(s) for finding where the ray intersects with the model.

**`see`** [https://en.wikipedia.org/wiki/Ray_casting](https://en.wikipedia.org/wiki/Ray_casting).

**`example`** For CAD model
```js
const offsetX = 50 // pixels from the left
const offsetY = 100 // pixels from the top
const intersection = await viewer.getIntersectionFromPixel(offsetX, offsetY);
if (intersection) // it was a hit
  console.log(
  'You hit model ', intersection.model,
  ' at the node with tree index ', intersection.treeIndex,
  ' at this exact point ', intersection.point
  );
```

**`example`** For point cloud
```js
const offsetX = 50 // pixels from the left
const offsetY = 100 // pixels from the top
const intersection = await viewer.getIntersectionFromPixel(offsetX, offsetY);
if (intersection) // it was a hit
  console.log(
  'You hit model ', intersection.model,
  ' at the point index ', intersection.pointIndex,
  ' at this exact point ', intersection.point
  );
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `offsetX` | `number` | X coordinate in pixels (relative to the domElement). |
| `offsetY` | `number` | Y coordinate in pixels (relative to the domElement). |

#### Returns

`Promise`\<[`Intersection`](../modules/cognite_reveal.md#intersection)\>

A promise that if there was an intersection then return the intersection object - otherwise it
returns `null` if there were no intersections.

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1047](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1047)

▸ **getIntersectionFromPixel**(`offsetX`, `offsetY`, `options`): `Promise`\<[`Intersection`](../modules/cognite_reveal.md#intersection)\>

**`deprecated`** Since 3.1 options argument have no effect.

#### Parameters

| Name | Type |
| :------ | :------ |
| `offsetX` | `number` |
| `offsetY` | `number` |
| `options` | [`IntersectionFromPixelOptions`](../interfaces/cognite_reveal.IntersectionFromPixelOptions.md) |

#### Returns

`Promise`\<[`Intersection`](../modules/cognite_reveal.md#intersection)\>

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1051](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1051)

___

### getScene

▸ **getScene**(): `Scene`

**`obvious`**

#### Returns

`Scene`

The THREE.Scene used for rendering.

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:836](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L836)

___

### getScreenshot

▸ **getScreenshot**(`width?`, `height?`): `Promise`\<`string`\>

Take screenshot from the current camera position.

**`example`**
```js
// Take a screenshot with custom resolution
const url = await viewer.getScreenshot(1920, 1080);
```
```js
// Add a screenshot with resolution of the canvas to the page
const url = await viewer.getScreenshot();
const image = document.createElement('img');
image.src = url;
document.body.appendChild(url);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `width` | `number` | Width of the final image. Default is current canvas size. |
| `height` | `number` | Height of the final image. Default is current canvas size. |

#### Returns

`Promise`\<`string`\>

A [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) of the image ('image/png').

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:989](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L989)

___

### getVersion

▸ **getVersion**(): `string`

Returns reveal version installed.

#### Returns

`string`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:313](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L313)

___

### getViewState

▸ **getViewState**(): [`ViewerState`](../modules/cognite_reveal.md#viewerstate)

Gets the current viewer state which includes the camera pose as well as applied styling.

#### Returns

[`ViewerState`](../modules/cognite_reveal.md#viewerstate)

JSON object containing viewer state.

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:525](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L525)

___

### loadCameraFromModel

▸ **loadCameraFromModel**(`model`): `void`

Attempts to load the camera settings from the settings stored for the
provided model. See [https://docs.cognite.com/api/v1/#operation/get3DRevision](https://docs.cognite.com/api/v1/#operation/get3DRevision)
and [https://docs.cognite.com/api/v1/#operation/update3DRevisions](https://docs.cognite.com/api/v1/#operation/update3DRevisions) for
information on how this setting is retrieved and stored. This setting can
also be changed through the 3D models management interface in Cognite Fusion.
If no camera configuration is stored in CDF, [Cognite3DViewer.fitCameraToModel](cognite_reveal.Cognite3DViewer.md#fitcameratomodel)
is used as a fallback.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `model` | [`CogniteModelBase`](../interfaces/cognite_reveal.CogniteModelBase.md) | The model to load camera settings from. |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:850](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L850)

___

### off

▸ **off**(`event`, `callback`): `void`

Remove event listener from the viewer.
Call [Cognite3DViewer.on](cognite_reveal.Cognite3DViewer.md#on) to add event listener.

**`example`**
```js
viewer.off('click', onClick);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"click"`` \| ``"hover"`` |
| `callback` | [`PointerEventDelegate`](../modules/cognite_reveal.md#pointereventdelegate) |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:442](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L442)

▸ **off**(`event`, `callback`): `void`

Remove event listener from the viewer.
Call [Cognite3DViewer.on](cognite_reveal.Cognite3DViewer.md#on) to add event listener.

**`example`**
```js
viewer.off('cameraChange', onCameraChange);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` |
| `callback` | [`CameraChangeDelegate`](../modules/cognite_reveal.md#camerachangedelegate) |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:449](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L449)

▸ **off**(`event`, `callback`): `void`

Remove event listener from the viewer.
Call [Cognite3DViewer.on](cognite_reveal.Cognite3DViewer.md#on) to add event listener.

**`example`**
```js
viewer.off('sceneRendered', updateStats);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"sceneRendered"`` |
| `callback` | [`SceneRenderedDelegate`](../modules/cognite_reveal.md#scenerendereddelegate) |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:456](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L456)

▸ **off**(`event`, `callback`): `void`

Remove event listener from the viewer.
Call [Cognite3DViewer.on](cognite_reveal.Cognite3DViewer.md#on) to add event listener.

**`example`**
```js
viewer.off('disposed', clearAll);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `callback` | [`DisposedDelegate`](../modules/cognite_reveal.md#disposeddelegate) |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:463](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L463)

___

### on

▸ **on**(`event`, `callback`): `void`

Triggered when the viewer is disposed. Listeners should clean up any
resources held and remove the reference to the viewer.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `callback` | [`DisposedDelegate`](../modules/cognite_reveal.md#disposeddelegate) |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:375](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L375)

▸ **on**(`event`, `callback`): `void`

Add event listener to the viewer.
Call [Cognite3DViewer.off](cognite_reveal.Cognite3DViewer.md#off) to remove an event listener.

**`example`**
```js
const onClick = (event) => { console.log(event.offsetX, event.offsetY) };
viewer.on('click', onClick);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"click"`` \| ``"hover"`` |
| `callback` | [`PointerEventDelegate`](../modules/cognite_reveal.md#pointereventdelegate) |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:384](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L384)

▸ **on**(`event`, `callback`): `void`

Add event listener to the viewer.
Call [Cognite3DViewer.off](cognite_reveal.Cognite3DViewer.md#off) to remove an event listener.

**`example`**
```js
viewer.on('cameraChange', (position, target) => {
  console.log('Camera changed: ', position, target);
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` |
| `callback` | [`CameraChangeDelegate`](../modules/cognite_reveal.md#camerachangedelegate) |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:393](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L393)

▸ **on**(`event`, `callback`): `void`

Event that is triggered immediatly after the scene has been rendered.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"sceneRendered"`` | Metadata about the rendering frame. |
| `callback` | [`SceneRenderedDelegate`](../modules/cognite_reveal.md#scenerendereddelegate) | Callback to trigger when the event occurs. |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:399](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L399)

___

### removeModel

▸ **removeModel**(`model`): `void`

Removes a model that was previously added using [Cognite3DViewer.addModel](cognite_reveal.Cognite3DViewer.md#addmodel),
[Cognite3DViewer.addCadModel](cognite_reveal.Cognite3DViewer.md#addcadmodel) or [Cognite3DViewer.addPointCloudModel](cognite_reveal.Cognite3DViewer.md#addpointcloudmodel)
.

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [`CogniteModelBase`](../interfaces/cognite_reveal.CogniteModelBase.md) |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:643](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L643)

___

### removeObject3D

▸ **removeObject3D**(`object`): `void`

Remove a THREE.Object3D from the viewer.

**`example`**
```js
const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(), new THREE.MeshBasicMaterial());
viewer.addObject3D(sphere);
viewer.removeObject3D(sphere);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `Object3D`\<`Event`\> |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:755](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L755)

___

### requestRedraw

▸ **requestRedraw**(): `void`

Typically used when you perform some changes and can't see them unless you move camera.

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:909](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L909)

___

### setBackgroundColor

▸ **setBackgroundColor**(`color`): `void`

Sets the color used as the clear color of the renderer.

#### Parameters

| Name | Type |
| :------ | :------ |
| `color` | `Color` |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:772](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L772)

___

### setCameraManager

▸ **setCameraManager**(`cameraManager`, `cameraStateUpdate?`): `void`

Sets camera manager instance for current Cognite3Dviewer.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `cameraManager` | [`CameraManager`](../interfaces/cognite_reveal.CameraManager.md) | `undefined` | Camera manager instance. |
| `cameraStateUpdate` | `boolean` | `true` | Whether to set current camera state to new camera manager. |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:507](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L507)

___

### setClippingPlanes

▸ **setClippingPlanes**(`clippingPlanes`): `void`

Sets per-pixel clipping planes. Pixels behind any of the planes will be sliced away.

**`example`**
```js
// Hide pixels with values less than 0 in the x direction
const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
viewer.setClippingPlanes([plane]);
```
```js
// Hide pixels with values greater than 20 in the x direction
 const plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 20);
viewer.setClippingPlanes([plane]);
```
```js
// Hide pixels with values less than 0 in the x direction or greater than 0 in the y direction
const xPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
const yPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
viewer.setClippingPlanes([xPlane, yPlane]);
```
```js
// Hide pixels behind an arbitrary, non axis-aligned plane
 const plane = new THREE.Plane(new THREE.Vector3(1.5, 20, -19), 20);
viewer.setClippingPlanes([plane]);
```
```js
// Disable clipping planes
 viewer.setClippingPlanes([]);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clippingPlanes` | `Plane`[] | The planes to use for clipping. |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:812](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L812)

___

### setLogLevel

▸ **setLogLevel**(`level`): `void`

Sets the log level. Used for debugging.
Defaults to 'none' (which is identical to 'silent').

#### Parameters

| Name | Type |
| :------ | :------ |
| `level` | ``"error"`` \| ``"debug"`` \| ``"trace"`` \| ``"info"`` \| ``"warn"`` \| ``"silent"`` \| ``"none"`` |

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:322](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L322)

___

### setViewState

▸ **setViewState**(`state`): `Promise`\<`void`\>

Restores camera settings from the state provided, and clears all current styled
node collections and applies the `state` object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [`ViewerState`](../modules/cognite_reveal.md#viewerstate) | Viewer state retrieved from [Cognite3DViewer.getViewState](cognite_reveal.Cognite3DViewer.md#getviewstate). |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:535](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L535)

___

### worldToScreen

▸ **worldToScreen**(`point`, `normalize?`): `Vector2`

Convert a point in world space to its coordinates in the canvas. This can be used to place HTML objects near 3D objects on top of the 3D viewer.

**`see`** [https://www.w3schools.com/graphics/canvas_coordinates.asp](https://www.w3schools.com/graphics/canvas_coordinates.asp).

**`example`**
```js
const boundingBoxCenter = new THREE.Vector3();
// Find center of bounding box in world space
model.getBoundingBox(nodeId).getCenter(boundingBoxCenter);
// Screen coordinates of that point
const screenCoordinates = viewer.worldToScreen(boundingBoxCenter);
```
```js
const boundingBoxCenter = new THREE.Vector3();
// Find center of bounding box in world space
model.getBoundingBox(nodeId).getCenter(boundingBoxCenter);
// Screen coordinates of that point normalized in the range [0,1]
const screenCoordinates = viewer.worldToScreen(boundingBoxCenter, true);
```
```js
const boundingBoxCenter = new THREE.Vector3();
// Find center of bounding box in world space
model.getBoundingBox(nodeId).getCenter(boundingBoxCenter);
// Screen coordinates of that point
const screenCoordinates = viewer.worldToScreen(boundingBoxCenter);
if (screenCoordinates == null) {
  // Object not visible on screen
} else {
  // Object is visible on screen
}
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `point` | `Vector3` | World space coordinate. |
| `normalize?` | `boolean` | Optional. If true, coordinates are normalized into [0,1]. If false, the values are in the range [0, \<canvas_size>). |

#### Returns

`Vector2`

Returns 2D coordinates if the point is visible on screen, or `null` if object is outside screen.

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:947](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L947)

___

### isBrowserSupported

▸ `Static` **isBrowserSupported**(): ``true``

For now it just always returns true.

**`see`** Https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#Browser_compatibility.

#### Returns

``true``

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:86](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L86)
