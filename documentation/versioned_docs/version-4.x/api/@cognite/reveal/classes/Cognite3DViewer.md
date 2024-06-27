# Class: Cognite3DViewer

## Constructors

### new Cognite3DViewer()

> **new Cognite3DViewer**(`options`): [`Cognite3DViewer`](Cognite3DViewer.md)

#### Parameters

• **options**: [`Cognite3DViewerOptions`](../interfaces/Cognite3DViewerOptions.md)

#### Returns

[`Cognite3DViewer`](Cognite3DViewer.md)

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:259](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L259)

## Accessors

### cadBudget

> `get` **cadBudget**(): [`CadModelBudget`](../type-aliases/CadModelBudget.md)

Gets the current budget for downloading geometry for CAD models. Note that this
budget is shared between all added CAD models and not a per-model budget.

> `set` **cadBudget**(`budget`): `void`

Sets the current budget for downloading geometry for CAD models. Note that this
budget is shared between all added CAD models and not a per-model budget.

#### Parameters

• **budget**: [`CadModelBudget`](../type-aliases/CadModelBudget.md)

#### Returns

[`CadModelBudget`](../type-aliases/CadModelBudget.md)

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:213](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L213)

***

### cameraManager

> `get` **cameraManager**(): [`CameraManager`](../interfaces/CameraManager.md)

#### Returns

[`CameraManager`](../interfaces/CameraManager.md)

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:664](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L664)

***

### canvas

> `get` **canvas**(): `HTMLCanvasElement`

Returns the rendering canvas, the DOM element where the renderer draws its output.

#### Returns

`HTMLCanvasElement`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:125](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L125)

***

### domElement

> `get` **domElement**(): `HTMLElement`

The DOM element the viewer will insert its rendering canvas into.
The DOM element can be specified in the options when the viewer is created.
If not specified, the DOM element will be created automatically.
The DOM element cannot be changed after the viewer has been created.

#### Returns

`HTMLElement`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:135](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L135)

***

### models

> `get` **models**(): [`CogniteModel`](../type-aliases/CogniteModel.md)[]

Gets a list of models currently added to the viewer.

#### Returns

[`CogniteModel`](../type-aliases/CogniteModel.md)[]

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:248](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L248)

***

### pointCloudBudget

> `get` **pointCloudBudget**(): [`PointCloudBudget`](../type-aliases/PointCloudBudget.md)

Returns the point cloud budget. The budget is shared between all loaded
point cloud models.

> `set` **pointCloudBudget**(`budget`): `void`

Sets the point cloud budget. The budget is shared between all loaded
point cloud models.

#### Parameters

• **budget**: [`PointCloudBudget`](../type-aliases/PointCloudBudget.md)

#### Returns

[`PointCloudBudget`](../type-aliases/PointCloudBudget.md)

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:233](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L233)

***

### renderParameters

> `get` **renderParameters**(): [`RenderParameters`](../type-aliases/RenderParameters.md)

Returns parameters of THREE.WebGLRenderer used by the viewer.

#### Returns

[`RenderParameters`](../type-aliases/RenderParameters.md)

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:142](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L142)

## Methods

### add360ImageSet()

#### add360ImageSet(datasource, dataModelIdentifier)

> **add360ImageSet**(`datasource`, `dataModelIdentifier`): `Promise` \<[`Image360Collection`](../interfaces/Image360Collection.md)\>

Adds a set of 360 images to the scene from the /datamodels API in Cognite Data Fusion.

##### Parameters

• **datasource**: `"datamodels"`

The data data source which holds the references to the 360 image sets.

• **dataModelIdentifier**: [`Image360DataModelIdentifier`](../type-aliases/Image360DataModelIdentifier.md)

The search parameters to apply when querying Cognite Datamodels that contains the 360 images.

##### Returns

`Promise` \<[`Image360Collection`](../interfaces/Image360Collection.md)\>

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:837](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L837)

#### add360ImageSet(datasource, eventFilter, add360ImageOptions)

> **add360ImageSet**(`datasource`, `eventFilter`, `add360ImageOptions`?): `Promise` \<[`Image360Collection`](../interfaces/Image360Collection.md)\>

Adds a set of 360 images to the scene from the /events API in Cognite Data Fusion.

##### Parameters

• **datasource**: `"events"`

The CDF data source which holds the references to the 360 image sets.

• **eventFilter**

The metadata filter to apply when querying events that contains the 360 images.

• **add360ImageOptions?**: [`AddImage360Options`](../type-aliases/AddImage360Options.md)

Options for behaviours when adding 360 images.

##### Returns

`Promise` \<[`Image360Collection`](../interfaces/Image360Collection.md)\>

##### Example

```js
const eventFilter = { site_id: "12345" };
await viewer.add360ImageSet('events', eventFilter);
```

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:852](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L852)

***

### addCadModel()

> **addCadModel**(`options`): `Promise` \<[`CogniteCadModel`](CogniteCadModel.md)\>

Add a new CAD 3D model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](Cognite3DViewer.md#fitcameratomodel) to see the model after the model has loaded.

#### Parameters

• **options**: [`AddModelOptions`](../interfaces/AddModelOptions.md)

#### Returns

`Promise` \<[`CogniteCadModel`](CogniteCadModel.md)\>

#### Example

```js
const options = {
modelId:     'COGNITE_3D_MODEL_ID',
revisionId:  'COGNITE_3D_REVISION_ID',
};
viewer.addCadModel(options).then(model => {
viewer.fitCameraToModel(model, 0);
});
```

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:759](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L759)

***

### addCustomObject()

> **addCustomObject**(`customObject`): `void`

**`Beta`**

Add a CustomObject to the viewer.

#### Parameters

• **customObject**: [`ICustomObject`](../interfaces/ICustomObject.md)

#### Returns

`void`

#### Example

```js
const sphere = new THREE.Mesh(
new THREE.SphereGeometry(),
new THREE.MeshBasicMaterial()
);
const customObject = CustomObject(sphere);
customObject.isPartOfBoundingBox = false;
viewer.addCustomObject(customObject);
```

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1078](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1078)

***

### addModel()

> **addModel**(`options`): `Promise` \<[`CogniteModel`](../type-aliases/CogniteModel.md)\>

Add a new model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](Cognite3DViewer.md#fitcameratomodel) to see the model after the model has loaded.

#### Parameters

• **options**: [`AddModelOptions`](../interfaces/AddModelOptions.md)

#### Returns

`Promise` \<[`CogniteModel`](../type-aliases/CogniteModel.md)\>

#### Example

```js
const options = {
modelId:     'COGNITE_3D_MODEL_ID',
revisionId:  'COGNITE_3D_REVISION_ID',
};
viewer.addModel(options).then(model => {
viewer.fitCameraToModel(model, 0);
});
```

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:717](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L717)

***

### addObject3D()

> **addObject3D**(`object`): `void`

Add a THREE.Object3D to the viewer.

#### Parameters

• **object**: `Object3D`\<`Object3DEventMap`\>

#### Returns

`void`

#### Example

```js
const sphere = new THREE.Mesh(
new THREE.SphereGeometry(),
new THREE.MeshBasicMaterial()
);
viewer.addObject3D(sphere);
```

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1052](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1052)

***

### addPointCloudModel()

> **addPointCloudModel**(`options`): `Promise` \<[`CognitePointCloudModel`](CognitePointCloudModel.md)\>

Add a new pointcloud 3D model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](Cognite3DViewer.md#fitcameratomodel) to see the model after the model has loaded.

#### Parameters

• **options**: [`AddModelOptions`](../interfaces/AddModelOptions.md)

#### Returns

`Promise` \<[`CognitePointCloudModel`](CognitePointCloudModel.md)\>

#### Example

```js
const options = {
modelId:     'COGNITE_3D_MODEL_ID',
revisionId:  'COGNITE_3D_REVISION_ID',
};
viewer.addPointCloudModel(options).then(model => {
viewer.fitCameraToModel(model, 0);
});
```

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:803](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L803)

***

### createCustomObjectIntersectInput()

> **createCustomObjectIntersectInput**(`pixelCoords`): [`CustomObjectIntersectInput`](CustomObjectIntersectInput.md)

**`Beta`**

Creates and initialize a CustomObjectIntersectInput to be used by CustomObject.intersectIfCloser method.

#### Parameters

• **pixelCoords**: `Vector2`

A Vector2 containing pixel coordinates relative to the 3D viewer.

#### Returns

[`CustomObjectIntersectInput`](CustomObjectIntersectInput.md)

A CustomObjectIntersectInput ready to use.

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1518](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1518)

***

### determineModelType()

> **determineModelType**(`modelId`, `revisionId`): `Promise`\<`""` \| [`SupportedModelTypes`](../type-aliases/SupportedModelTypes.md)\>

Use to determine of which type the model is.

#### Parameters

• **modelId**: `number`

The model's id.

• **revisionId**: `number`

The model's revision id.

#### Returns

`Promise`\<`""` \| [`SupportedModelTypes`](../type-aliases/SupportedModelTypes.md)\>

Empty string if type is not supported.

#### Example

```typescript
const viewer = new Cognite3DViewer(...);
const type = await viewer.determineModelType(options.modelId, options.revisionId)
let model: CogniteModel
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

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1010](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1010)

***

### dispose()

> **dispose**(): `void`

Dispose of WebGL resources. Can be used to free up memory when the viewer is no longer in use.

#### Returns

`void`

#### See

[https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects](https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects)
```js
// Viewer is no longer in use, free up memory
viewer.dispose();
```

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:447](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L447)

***

### enter360Image()

> **enter360Image**(`image360`, `revision`?): `Promise`\<`void`\>

Enter visualization of a 360 image.

#### Parameters

• **image360**: [`Image360`](../interfaces/Image360.md)

The 360 image to enter.

• **revision?**: [`Image360Revision`](../interfaces/Image360Revision.md)

The image revision to use. If not provided the newest revision will be shown.

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:927](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L927)

***

### exit360Image()

> **exit360Image**(): `void`

Exit visualization of the 360 image.

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:937](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L937)

***

### fitCameraToBoundingBox()

> **fitCameraToBoundingBox**(`box`, `duration`?, `radiusFactor`?): `void`

Move camera to a place where the content of a bounding box is visible to the camera.

#### Parameters

• **box**: `Box3`

The bounding box in world space.

• **duration?**: `number`

The duration of the animation moving the camera. Set this to 0 (zero) to disable animation.

• **radiusFactor?**: `number` = `2`

The ratio of the distance from camera to center of box and radius of the box.

#### Returns

`void`

#### Example

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

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1303](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1303)

***

### fitCameraToModel()

> **fitCameraToModel**(`model`, `duration`?): `void`

Move camera to a place where the 3D model is visible.
It uses the bounding box of the 3D model and calls [Cognite3DViewer.fitCameraToBoundingBox](Cognite3DViewer.md#fitcameratoboundingbox).

#### Parameters

• **model**: [`CogniteModel`](../type-aliases/CogniteModel.md)

The 3D model.

• **duration?**: `number`

The duration of the animation moving the camera. Set this to 0 (zero) to disable animation.

#### Returns

`void`

#### Example

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

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1258](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1258)

***

### fitCameraToModels()

> **fitCameraToModels**(`models`?, `duration`?, `restrictToMostGeometry`?): `void`

Move camera to a place where a set of 3D models are visible.

#### Parameters

• **models?**: [`CogniteModel`](../type-aliases/CogniteModel.md)[]

Optional 3D models to focus the camera on. If no models are provided the camera will fit to all models.

• **duration?**: `number`

The duration of the animation moving the camera. Set this to 0 (zero) to disable animation.

• **restrictToMostGeometry?**: `boolean` = `false`

If true, attempt to remove junk geometry from the boundingBox to allow setting a good camera position.

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1269](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1269)

***

### get360AnnotationIntersectionFromPixel()

> **get360AnnotationIntersectionFromPixel**(`offsetX`, `offsetY`): `Promise`\<`null` \| [`Image360AnnotationIntersection`](../type-aliases/Image360AnnotationIntersection.md)\>

Check for intersections with 360 annotations through the given pixel.
Similar to [Cognite3DViewer.getIntersectionFromPixel](Cognite3DViewer.md#getintersectionfrompixel), but checks 360 image annotations
instead of models.

#### Parameters

• **offsetX**: `number`

• **offsetY**: `number`

#### Returns

`Promise`\<`null` \| [`Image360AnnotationIntersection`](../type-aliases/Image360AnnotationIntersection.md)\>

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1635](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1635)

***

### get360ImageCollections()

> **get360ImageCollections**(): [`Image360Collection`](../interfaces/Image360Collection.md)[]

Returns a list of added 360 image collections.

#### Returns

[`Image360Collection`](../interfaces/Image360Collection.md)[]

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:891](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L891)

***

### getActive360ImageInfo()

> **getActive360ImageInfo**(): `undefined` \| [`Image360WithCollection`](../type-aliases/Image360WithCollection.md)

Returns the currently entered 360 image.

#### Returns

`undefined` \| [`Image360WithCollection`](../type-aliases/Image360WithCollection.md)

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:898](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L898)

***

### getAnyIntersectionFromPixel()

> **getAnyIntersectionFromPixel**(`pixelCoords`, `options`?): `Promise`\<`undefined` \| [`AnyIntersection`](../type-aliases/AnyIntersection.md)\>

**`Beta`**

Raycasting model(s) for finding where the ray intersects with all models, including custom objects.

#### Parameters

• **pixelCoords**: `Vector2`

Pixel coordinate in pixels (relative to the domElement).

• **options?**

• **options.predicate?**

Check whether a CustomObject should be intersected.

• **options.stopOnHitting360Icon?**: `boolean`

#### Returns

`Promise`\<`undefined` \| [`AnyIntersection`](../type-aliases/AnyIntersection.md)\>

A promise that if there was an intersection then return the intersection object - otherwise it
returns `null` if there were no intersections.

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1576](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1576)

***

### ~~getClippingPlanes()~~

> **getClippingPlanes**(): `Plane`[]

Returns the current active global clipping planes.

#### Returns

`Plane`[]

#### Deprecated

Use [Cognite3DViewer.getGlobalClippingPlanes](Cognite3DViewer.md#getglobalclippingplanes) instead.

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1201](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1201)

***

### getGlobalClippingPlanes()

> **getGlobalClippingPlanes**(): `Plane`[]

Returns the current active global clipping planes.

#### Returns

`Plane`[]

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1208](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1208)

***

### getIntersectionFromPixel()

> **getIntersectionFromPixel**(`offsetX`, `offsetY`): `Promise`\<`null` \| [`Intersection`](../type-aliases/Intersection.md)\>

Raycasting model(s) for finding where the ray intersects with the model.

#### Parameters

• **offsetX**: `number`

X coordinate in pixels (relative to the domElement).

• **offsetY**: `number`

Y coordinate in pixels (relative to the domElement).

#### Returns

`Promise`\<`null` \| [`Intersection`](../type-aliases/Intersection.md)\>

A promise that if there was an intersection then return the intersection object - otherwise it
returns `null` if there were no intersections.

#### See

[https://en.wikipedia.org/wiki/Ray_casting](https://en.wikipedia.org/wiki/Ray_casting) For more details on Ray casting.

#### Examples

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

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1559](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1559)

***

### getNormalizedPixelCoordinates()

> **getNormalizedPixelCoordinates**(`pixelCoords`): `Vector2`

Converts a pixel coordinate to normalized device coordinate (in range [-1, 1]).

#### Parameters

• **pixelCoords**: `Vector2`

A Vector2 containing pixel coordinates relative to the 3D viewer.

#### Returns

`Vector2`

A Vector2 containing the normalized device coordinate (in range [-1, 1]).

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1499](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1499)

***

### getPixelCoordinatesFromEvent()

> **getPixelCoordinatesFromEvent**(`event`): `Vector2`

Determines clicked or touched pixel coordinate as offset.

#### Parameters

• **event**: `PointerEvent` \| `WheelEvent`

An PointerEvent or WheelEvent.

#### Returns

`Vector2`

A Vector2 containing pixel coordinates relative to the 3D viewer.

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1508](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1508)

***

### getSceneBoundingBox()

> **getSceneBoundingBox**(): `Box3`

**`Beta`**

Returns the union of all bounding boxes in reveal, including custom objects.

#### Returns

`Box3`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1216](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1216)

***

### getScreenshot()

> **getScreenshot**(`width`, `height`, `includeUI`): `Promise`\<`string`\>

Take a screenshot from the current camera position. When drawing UI, only the viewer DOM element and its children will be included in the image.
The DOM is scaled to fit any provided resolution, and as a result some elements can be positioned incorrectly in regards to the 3D render.

`html2canvas` is used to draw UI and this has some limitations on what CSS properties it is able to render. See [the html2canvas documentation](https://html2canvas.hertzen.com/documentation) for details.

#### Parameters

• **width**: `number` = `...`

Width of the final image. Default is current canvas size.

• **height**: `number` = `...`

Height of the final image. Default is current canvas size.

• **includeUI**: `boolean` = `true`

If false the screenshot will include only the rendered 3D. Default is true.

#### Returns

`Promise`\<`string`\>

A [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) of the image ('image/png').

#### Example

```js
// Take a screenshot with custom resolution
const url = await viewer.getScreenshot(1920, 1080);
```
```js
// Add a screenshot with resolution of the canvas to the page
const url = await viewer.getScreenshot();
const image = document.createElement('img');
image.src = url;
document.body.appendChild(image);
```

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1397](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1397)

***

### getVersion()

> **getVersion**(): `string`

Returns reveal version installed.

#### Returns

`string`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:420](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L420)

***

### getViewState()

> **getViewState**(): [`ViewerState`](../type-aliases/ViewerState.md)

Gets the current viewer state which includes the camera pose as well as applied styling.

#### Returns

[`ViewerState`](../type-aliases/ViewerState.md)

JSON object containing viewer state.

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:681](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L681)

***

### loadCameraFromModel()

> **loadCameraFromModel**(`model`): `void`

Attempts to load the camera settings from the settings stored for the
provided model. See [https://docs.cognite.com/api/v1/#operation/get3DRevision](https://docs.cognite.com/api/v1/#operation/get3DRevision)
and [https://docs.cognite.com/api/v1/#operation/update3DRevisions](https://docs.cognite.com/api/v1/#operation/update3DRevisions) for
information on how this setting is retrieved and stored. This setting can
also be changed through the 3D models management interface in Cognite Fusion.
If no camera configuration is stored in CDF, [Cognite3DViewer.fitCameraToModel](Cognite3DViewer.md#fitcameratomodel)
is used as a fallback.

#### Parameters

• **model**: [`CogniteModel`](../type-aliases/CogniteModel.md)

The model to load camera settings from.

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1230](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1230)

***

### off()

Remove event listener from the viewer.
Call [Cognite3DViewer.on](Cognite3DViewer.md#on) to add event listener.

#### Param

#### Param

#### off(event, callback)

> **off**(`event`, `callback`): `void`

##### Parameters

• **event**: `"click"` \| `"hover"`

• **callback**: [`PointerEventDelegate`](../type-aliases/PointerEventDelegate.md)

##### Returns

`void`

##### Example

```js
viewer.off('click', onClick);
```

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:583](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L583)

#### off(event, callback)

> **off**(`event`, `callback`): `void`

##### Parameters

• **event**: `"cameraChange"`

• **callback**: [`CameraChangeDelegate`](../type-aliases/CameraChangeDelegate.md)

##### Returns

`void`

##### Example

```js
viewer.off('cameraChange', onCameraChange);
```

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:590](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L590)

#### off(event, callback)

> **off**(`event`, `callback`): `void`

##### Parameters

• **event**: `"cameraStop"`

• **callback**: [`CameraStopDelegate`](../type-aliases/CameraStopDelegate.md)

##### Returns

`void`

##### Example

```js
viewer.off('cameraStop', onCameraStop);
```

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:597](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L597)

#### off(event, callback)

> **off**(`event`, `callback`): `void`

Unsubscribe the 'beforeSceneRendered'-event previously subscribed with [Cognite3DViewer.on](Cognite3DViewer.md#on).

##### Parameters

• **event**: `"beforeSceneRendered"`

• **callback**: [`BeforeSceneRenderedDelegate`](../type-aliases/BeforeSceneRenderedDelegate.md)

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:601](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L601)

#### off(event, callback)

> **off**(`event`, `callback`): `void`

##### Parameters

• **event**: `"sceneRendered"`

• **callback**: [`SceneRenderedDelegate`](../type-aliases/SceneRenderedDelegate.md)

##### Returns

`void`

##### Example

```js
viewer.off('sceneRendered', updateStats);
```

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:608](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L608)

#### off(event, callback)

> **off**(`event`, `callback`): `void`

##### Parameters

• **event**: `"disposed"`

• **callback**: [`DisposedDelegate`](../type-aliases/DisposedDelegate.md)

##### Returns

`void`

##### Example

```js
viewer.off('disposed', clearAll);
```

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:615](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L615)

***

### on()

Add event listener to the viewer.
Call [Cognite3DViewer.off](Cognite3DViewer.md#off) to remove an event listener.

#### Param

#### Param

#### on(event, callback)

> **on**(`event`, `callback`): `void`

Triggered when the viewer is disposed. Listeners should clean up any
resources held and remove the reference to the viewer.

##### Parameters

• **event**: `"disposed"`

• **callback**: [`DisposedDelegate`](../type-aliases/DisposedDelegate.md)

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:490](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L490)

#### on(event, callback)

> **on**(`event`, `callback`): `void`

##### Parameters

• **event**: `"click"` \| `"hover"`

• **callback**: [`PointerEventDelegate`](../type-aliases/PointerEventDelegate.md)

##### Returns

`void`

##### Example

```js
const onClick = (event) => { console.log(event.offsetX, event.offsetY) };
viewer.on('click', onClick);
```

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:499](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L499)

#### on(event, callback)

> **on**(`event`, `callback`): `void`

##### Parameters

• **event**: `"cameraChange"`

• **callback**: [`CameraChangeDelegate`](../type-aliases/CameraChangeDelegate.md)

##### Returns

`void`

##### Example

```js
viewer.on('cameraChange', (position, target) => {
  console.log('Camera changed: ', position, target);
});
```

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:508](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L508)

#### on(event, callback)

> **on**(`event`, `callback`): `void`

##### Parameters

• **event**: `"cameraStop"`

• **callback**: [`CameraStopDelegate`](../type-aliases/CameraStopDelegate.md)

##### Returns

`void`

##### Example

```js
viewer.on('cameraStop', () => {
  console.log('Camera stopped');
});
```

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:517](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L517)

#### on(event, callback)

> **on**(`event`, `callback`): `void`

Event that is triggered immediately before the scene is rendered.

##### Parameters

• **event**: `"beforeSceneRendered"`

Metadata about the rendering frame.

• **callback**: [`BeforeSceneRenderedDelegate`](../type-aliases/BeforeSceneRenderedDelegate.md)

Callback to trigger when event occurs.

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:523](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L523)

#### on(event, callback)

> **on**(`event`, `callback`): `void`

Event that is triggered immediately after the scene has been rendered.

##### Parameters

• **event**: `"sceneRendered"`

Metadata about the rendering frame.

• **callback**: [`SceneRenderedDelegate`](../type-aliases/SceneRenderedDelegate.md)

Callback to trigger when the event occurs.

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:529](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L529)

***

### remove360ImageSet()

> **remove360ImageSet**(`imageCollection`): `void`

Removes a previously added 360 image collection from the viewer.

#### Parameters

• **imageCollection**: [`Image360Collection`](../interfaces/Image360Collection.md)

Collection to remove.

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:918](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L918)

***

### ~~remove360Images()~~

> **remove360Images**(...`image360Entities`): `Promise`\<`void`\>

Remove a set of 360 images.

#### Parameters

• ...**image360Entities**: [`Image360`](../interfaces/Image360.md)[]

#### Returns

`Promise`\<`void`\>

#### Deprecated

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:907](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L907)

***

### removeCustomObject()

> **removeCustomObject**(`customObject`): `void`

**`Beta`**

Remove a CustomObject from the viewer.

#### Parameters

• **customObject**: [`ICustomObject`](../interfaces/ICustomObject.md)

#### Returns

`void`

#### Example

```js
const sphere = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
const customObject = CustomObject(sphere);
viewer.addCustomObject(sphere);
viewer.removeCustomObject(sphere);
```

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1121](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1121)

***

### removeModel()

> **removeModel**(`model`): `void`

Removes a model that was previously added using [Cognite3DViewer.addModel](Cognite3DViewer.md#addmodel),
[Cognite3DViewer.addCadModel](Cognite3DViewer.md#addcadmodel) or [Cognite3DViewer.addPointCloudModel](Cognite3DViewer.md#addpointcloudmodel)
.

#### Parameters

• **model**: [`CogniteModel`](../type-aliases/CogniteModel.md)

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:950](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L950)

***

### removeObject3D()

> **removeObject3D**(`object`): `void`

Remove a THREE.Object3D from the viewer.

#### Parameters

• **object**: `Object3D`\<`Object3DEventMap`\>

#### Returns

`void`

#### Example

```js
const sphere = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
viewer.addObject3D(sphere);
viewer.removeObject3D(sphere);
```

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1100](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1100)

***

### requestRedraw()

> **requestRedraw**(): `void`

Typically used when you perform some changes and can't see them unless you move camera.

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1310](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1310)

***

### setBackgroundColor()

> **setBackgroundColor**(`backgroundColor`): `void`

Sets the color used as the clear color of the renderer.

#### Parameters

• **backgroundColor**

• **backgroundColor.alpha?**: `number`

• **backgroundColor.color?**: `Color`

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1138](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1138)

***

### setCameraManager()

> **setCameraManager**(`cameraManager`): `void`

Sets the active camera manager instance for current Cognite3Dviewer.

#### Parameters

• **cameraManager**: [`CameraManager`](../interfaces/CameraManager.md)

Camera manager instance.

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:672](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L672)

***

### ~~setClippingPlanes()~~

> **setClippingPlanes**(`clippingPlanes`): `void`

Sets per-pixel clipping planes. Pixels behind any of the planes will be sliced away.

#### Parameters

• **clippingPlanes**: `Plane`[]

#### Returns

`void`

#### Deprecated

Use [Cognite3DViewer.setGlobalClippingPlanes](Cognite3DViewer.md#setglobalclippingplanes) instead.

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1193](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1193)

***

### setGlobalClippingPlanes()

> **setGlobalClippingPlanes**(`clippingPlanes`): `void`

Sets per-pixel clipping planes. Pixels behind any of the planes will be sliced away.

#### Parameters

• **clippingPlanes**: `Plane`[]

The planes to use for clipping.

#### Returns

`void`

#### Example

```js
// Hide pixels with values less than 0 in the x direction
const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
viewer.setGlobalClippingPlanes([plane]);
```
```js
// Hide pixels with values greater than 20 in the x direction
 const plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 20);
viewer.setGlobalClippingPlanes([plane]);
```
```js
// Hide pixels with values less than 0 in the x direction or greater than 0 in the y direction
const xPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
const yPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
viewer.setGlobalClippingPlanes([xPlane, yPlane]);
```
```js
// Hide pixels behind an arbitrary, non axis-aligned plane
 const plane = new THREE.Plane(new THREE.Vector3(1.5, 20, -19), 20);
viewer.setGlobalClippingPlanes([plane]);
```
```js
// Disable clipping planes
 viewer.setGlobalClippingPlanes([]);
```

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1183](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1183)

***

### setLogLevel()

> **setLogLevel**(`level`): `void`

Sets the log level. Used for debugging.
Defaults to 'none' (which is identical to 'silent').

#### Parameters

• **level**: `"error"` \| `"none"` \| `"debug"` \| `"trace"` \| `"info"` \| `"warn"` \| `"silent"`

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:429](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L429)

***

### setResolutionOptions()

> **setResolutionOptions**(`options`): `void`

Set options to control resolution of the viewer. This includes
settings for max resolution and limiting resolution when moving the camera.

#### Parameters

• **options**: [`ResolutionOptions`](../type-aliases/ResolutionOptions.md)

Options to apply.

#### Returns

`void`

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:407](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L407)

***

### setViewState()

> **setViewState**(`state`): `Promise`\<`void`\>

Restores camera settings from the state provided, and clears all current styled
node collections and applies the `state` object.

#### Parameters

• **state**: [`ViewerState`](../type-aliases/ViewerState.md)

Viewer state retrieved from [Cognite3DViewer.getViewState](Cognite3DViewer.md#getviewstate).

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:691](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L691)

***

### worldToScreen()

> **worldToScreen**(`point`, `normalize`?): `null` \| `Vector2`

Convert a point in world space to its coordinates in the canvas. This can be used to place HTML objects near 3D objects on top of the 3D viewer.

#### Parameters

• **point**: `Vector3`

World space coordinate.

• **normalize?**: `boolean`

Optional. If true, coordinates are normalized into [0,1]. If false, the values are in the range [0, \<canvas_size\>).

#### Returns

`null` \| `Vector2`

Returns 2D coordinates if the point is visible on screen, or `null` if object is outside screen.

#### See

[https://www.w3schools.com/graphics/canvas_coordinates.asp](https://www.w3schools.com/graphics/canvas_coordinates.asp) For details on HTML Canvas Coordinates.

#### Example

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

#### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1348](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1348)
