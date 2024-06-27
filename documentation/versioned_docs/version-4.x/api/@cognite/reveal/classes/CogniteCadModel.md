# Class: CogniteCadModel

Provides metadata needed to get asset mappings for a CDF 3D model

## Implements

- [`CdfModelNodeCollectionDataProvider`](../interfaces/CdfModelNodeCollectionDataProvider.md)

## Properties

### modelId

> `readonly` **modelId**: `number`

The CDF model ID of the model.

#### Implementation of

[`CdfModelNodeCollectionDataProvider`](../interfaces/CdfModelNodeCollectionDataProvider.md) . [`modelId`](../interfaces/CdfModelNodeCollectionDataProvider.md#modelid)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:77](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L77)

***

### revisionId

> `readonly` **revisionId**: `number`

The CDF revision ID of the model.

#### Implementation of

[`CdfModelNodeCollectionDataProvider`](../interfaces/CdfModelNodeCollectionDataProvider.md) . [`revisionId`](../interfaces/CdfModelNodeCollectionDataProvider.md#revisionid)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:81](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L81)

***

### type

> `readonly` **type**: [`SupportedModelTypes`](../type-aliases/SupportedModelTypes.md) = `'cad'`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:28](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L28)

## Accessors

### modelUnit

> `get` **modelUnit**(): `""` \| [`WellKnownUnit`](../type-aliases/WellKnownUnit.md)

Returns the unit the coordinates for the model is stored. Returns an empty string
if no unit has been stored.
Note that coordinates in Reveal always are converted to meters using [CogniteCadModel.modelUnitToMetersFactor](CogniteCadModel.md#modelunittometersfactor).

#### Returns

`""` \| [`WellKnownUnit`](../type-aliases/WellKnownUnit.md)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:42](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L42)

***

### modelUnitToMetersFactor

> `get` **modelUnitToMetersFactor**(): `undefined` \| `number`

Returns the conversion factor that converts from model coordinates to meters. Note that this can
return undefined if the model has been stored in an unsupported unit.

#### Returns

`undefined` \| `number`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:52](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L52)

***

### nodeCount

> `get` **nodeCount**(): `number`

Returns the number of nodes in the model.

#### Returns

`number`

#### Implementation of

[`CdfModelNodeCollectionDataProvider`](../interfaces/CdfModelNodeCollectionDataProvider.md) . [`nodeCount`](../interfaces/CdfModelNodeCollectionDataProvider.md#nodecount)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:541](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L541)

***

### styledNodeCollections

> `get` **styledNodeCollections**(): `object`[]

Returns all currently registered node collections and associated appearance.

#### Returns

`object`[]

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:144](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L144)

***

### visible

> `get` **visible**(): `boolean`

Returns the model visibility.

> `set` **visible**(`value`): `void`

Sets the model visibility.

#### Example

```js
model.visible = false
```

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:70](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L70)

## Methods

### assignStyledNodeCollection()

> **assignStyledNodeCollection**(`nodeCollection`, `appearance`, `importance`): `void`

Customizes rendering style for a set of nodes, e.g. to highlight, hide
or color code a set of 3D objects. This allows for custom look and feel
of the 3D model which is useful to highlight certain parts or to
color code the 3D model based on information (e.g. coloring the 3D model
by construction status).

The [NodeCollection](NodeCollection.md) can be updated dynamically and the rendered nodes will be
updated automatically as the styling changes. The appearance of the style nodes
cannot be changed.

When nodes are in several styled sets, the style is combined in the order
the sets were added, i.e. styled sets added late can overwrite styled sets added
early.

If the `nodeCollection` provided already has an assigned style, this style will
be replaced with style provided.

#### Parameters

• **nodeCollection**: [`NodeCollection`](NodeCollection.md)

Dynamic set of nodes to apply the provided appearance to.

• **appearance**: [`NodeAppearance`](../type-aliases/NodeAppearance.md)

Appearance to style the provided set with.

• **importance**: `number` = `0`

The importance of this style. Can be used to manually order the order of styles, this can avoid the order of adding styles affecting the outcome. Optional and defaults to 0.

#### Returns

`void`

#### Example

```js
model.setDefaultNodeAppearance({ rendererGhosted: true });
const visibleNodes = new TreeIndexNodeCollection(someTreeIndices);
model.assignStyledNodeCollection(visibleSet, { rendererGhosted: false });
```

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:176](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L176)

***

### dispose()

> **dispose**(): `void`

Cleans up used resources.

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:317](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L317)

***

### getAncestorTreeIndices()

> **getAncestorTreeIndices**(`treeIndex`, `generation`): `Promise` \<[`NumericRange`](NumericRange.md)\>

Determines the tree index range of a subtree of an ancestor of the provided
node defined by a tree index.

#### Parameters

• **treeIndex**: `number`

Tree index of node to find ancestor tree index range for.

• **generation**: `number`

What "generation" to find. 0 is the node itself,
1 means parent, 2 means grandparent etc. If the node doesn't have as many
ancestors, the root of the model is returned. This can be determined by checking
that the range returned includes 0.

#### Returns

`Promise` \<[`NumericRange`](NumericRange.md)\>

Tree index range of the subtree spanned by the ancestor at the
"generation" specified, or the root.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:341](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L341)

***

### getBoundingBoxByNodeId()

> **getBoundingBoxByNodeId**(`nodeId`, `box`?): `Promise`\<`Box3`\>

Fetches a bounding box from the CDF by the nodeId.

#### Parameters

• **nodeId**: `number`

• **box?**: `Box3`

Optional. Used to write result to.

#### Returns

`Promise`\<`Box3`\>

#### Example

```js
const box = new THREE.Box3()
const nodeId = 100500;
await model.getBoundingBoxByNodeId(nodeId, box);
// box now has the bounding box
```
```js
// the following code does the same
const box = await model.getBoundingBoxByNodeId(nodeId);
```

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:471](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L471)

***

### getBoundingBoxByTreeIndex()

> **getBoundingBoxByTreeIndex**(`treeIndex`, `box`?): `Promise`\<`Box3`\>

Determine the bounding box of the node identified by the tree index provided. Note that this
function uses the CDF API to look up the bounding box.

#### Parameters

• **treeIndex**: `number`

Tree index of the node to find bounding box for.

• **box?**: `Box3`

Optional preallocated container to hold the bounding box.

#### Returns

`Promise`\<`Box3`\>

#### Example

```js
const box = new THREE.Box3()
const treeIndex = 42;
await model.getBoundingBoxByTreeIndex(treeIndex, box);
// box now has the bounding box
```
```js
// the following code does the same
const box = await model.getBoundingBoxByTreeIndex(treeIndex);
```

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:517](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L517)

***

### getBoundingBoxesByNodeIds()

> **getBoundingBoxesByNodeIds**(`nodeIds`): `Promise`\<`Box3`[]\>

Fetches a bounding box from the CDF by a list of nodeIds.

#### Parameters

• **nodeIds**: `number`[]

#### Returns

`Promise`\<`Box3`[]\>

#### Example

```js
const box = await model.getBoundingBoxByNodeIds([158239, 192837]);
```

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:486](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L486)

***

### getCameraConfiguration()

> **getCameraConfiguration**(): `undefined` \| [`CameraConfiguration`](../type-aliases/CameraConfiguration.md)

Retrieves the camera position and target stored for the model. Typically this
is used to store a good starting position for a model. Returns `undefined` if there
isn't any stored camera configuration for the model.

#### Returns

`undefined` \| [`CameraConfiguration`](../type-aliases/CameraConfiguration.md)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:388](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L388)

***

### getCdfToDefaultModelTransformation()

> **getCdfToDefaultModelTransformation**(`out`?): `Matrix4`

Gets transformation from CDF space to ThreeJS space,
which includes any additional "default" transformations assigned to this model.
Does not include any custom transformations set by [CogniteCadModel.setModelTransformation](CogniteCadModel.md#setmodeltransformation)

#### Parameters

• **out?**: `Matrix4`

Preallocated `THREE.Matrix4` (optional)

#### Returns

`Matrix4`

#### Implementation of

[`CdfModelNodeCollectionDataProvider`](../interfaces/CdfModelNodeCollectionDataProvider.md) . [`getCdfToDefaultModelTransformation`](../interfaces/CdfModelNodeCollectionDataProvider.md#getcdftodefaultmodeltransformation)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:431](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L431)

***

### getDefaultNodeAppearance()

> **getDefaultNodeAppearance**(): [`NodeAppearance`](../type-aliases/NodeAppearance.md)

Gets the default appearance for nodes that are not styled using
[CogniteCadModel.assignStyledNodeCollection](CogniteCadModel.md#assignstylednodecollection).

#### Returns

[`NodeAppearance`](../type-aliases/NodeAppearance.md)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:137](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L137)

***

### getModelBoundingBox()

> **getModelBoundingBox**(`outBoundingBox`?, `restrictToMostGeometry`?): `Box3`

Determines the full bounding box of the model.

#### Parameters

• **outBoundingBox?**: `Box3`

Optional. Used to write result to.

• **restrictToMostGeometry?**: `boolean`

Optional. When true, returned bounds are restricted to
where most of the geometry is located. This is useful for models that have junk geometry
located far from the "main" model. Added in version 1.3.0.

#### Returns

`Box3`

Model bounding box.

#### Example

```js
const boundingBox = new THREE.Box3()
model.getModelBoundingBox(boundingBox);
// boundingBox now has the bounding box
```
```js
// the following code does the same
const boundingBox = model.getModelBoundingBox();
```

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:372](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L372)

***

### getModelClippingPlanes()

> **getModelClippingPlanes**(): `Plane`[]

Get the clipping planes for this model.

#### Returns

`Plane`[]

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:421](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L421)

***

### getModelTransformation()

> **getModelTransformation**(`out`?): `Matrix4`

Gets transformation matrix that has previously been set with [CogniteCadModel.setModelTransformation](CogniteCadModel.md#setmodeltransformation).

#### Parameters

• **out?**: `Matrix4`

Preallocated `THREE.Matrix4` (optional).

#### Returns

`Matrix4`

#### Implementation of

[`CdfModelNodeCollectionDataProvider`](../interfaces/CdfModelNodeCollectionDataProvider.md) . [`getModelTransformation`](../interfaces/CdfModelNodeCollectionDataProvider.md#getmodeltransformation)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:406](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L406)

***

### getSubtreeTreeIndices()

> **getSubtreeTreeIndices**(`treeIndex`): `Promise` \<[`NumericRange`](NumericRange.md)\>

Determines the range of tree indices for a given subtree.

#### Parameters

• **treeIndex**: `number`

Index of the root of the subtree to get the index range for.

#### Returns

`Promise` \<[`NumericRange`](NumericRange.md)\>

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:325](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L325)

***

### iterateNodesByTreeIndex()

> **iterateNodesByTreeIndex**(`action`): `Promise`\<`void`\>

Iterates over all nodes in the model and applies the provided action to each node (identified by tree index).
The passed action is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
applied until promise is resolved (iteration is done).

#### Parameters

• **action**

Function that will be called with a treeIndex argument.

#### Returns

`Promise`\<`void`\>

Promise that is resolved once the iteration is done.

#### Example

```js
const logIndex = (treeIndex) => console.log(treeIndex);
await model.iterateNodesByTreeIndex(logIndex); // 0, 1, 2, ...
```

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:534](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L534)

***

### iterateSubtreeByTreeIndex()

> **iterateSubtreeByTreeIndex**(`treeIndex`, `action`): `Promise`\<`void`\>

Iterates over all nodes in a subtree of the model and applies the provided action to each node
(identified by tree index). The provided node is included in the visited set.  The passed action
is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
applied until promise is resolved (iteration is done).

#### Parameters

• **treeIndex**: `number`

Tree index of the top parent of the subtree.

• **action**

Function that will be called with a treeIndex argument.

#### Returns

`Promise`\<`void`\>

Promise that is resolved once the iteration is done.

#### Example

```js
// make a subtree to be gray
await model.iterateNodesByTreeIndex(treeIndex => {
  model.setNodeColorByTreeIndex(treeIndex, 127, 127, 127);
});
```

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:561](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L561)

***

### mapBoxFromCdfToModelCoordinates()

> **mapBoxFromCdfToModelCoordinates**(`box`, `out`): `Box3`

Map bounding box from CDF to model space, taking the model's custom transformation into account

#### Parameters

• **box**: `Box3`

Box to compute transformation from

• **out**: `Box3` = `...`

Optional pre-allocated box

#### Returns

`Box3`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:450](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L450)

***

### mapNodeIdToTreeIndex()

> **mapNodeIdToTreeIndex**(`nodeId`): `Promise`\<`number`\>

Maps a single node ID to tree index. This is useful when you e.g. have a
node ID from an asset mapping and want to highlight the given asset using
[CogniteCadModel.mapNodeIdsToTreeIndices](CogniteCadModel.md#mapnodeidstotreeindices) is recommended for better performance when
mapping multiple IDs.

#### Parameters

• **nodeId**: `number`

A Node ID to map to a tree index.

#### Returns

`Promise`\<`number`\>

TreeIndex of the provided node.

#### Throws

If an invalid/non-existant node ID is provided the function throws an error.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:589](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L589)

***

### mapNodeIdsToTreeIndices()

> **mapNodeIdsToTreeIndices**(`nodeIds`): `Promise`\<`number`[]\>

Maps a list of Node IDs to tree indices. This function is useful when you have
a list of nodes, e.g. from Asset Mappings, that you want to highlight, hide,
color etc in the viewer.

#### Parameters

• **nodeIds**: `number`[]

List of node IDs to map to tree indices.

#### Returns

`Promise`\<`number`[]\>

A list of tree indices corresponing to the elements in the input.

#### Throws

If an invalid/non-existant node ID is provided the function throws an error.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:575](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L575)

***

### mapPointFromCdfToModelCoordinates()

> **mapPointFromCdfToModelCoordinates**(`point`, `out`): `Vector3`

Map point from CDF to model space, taking the model's custom transformation into account

#### Parameters

• **point**: `Vector3`

Point to compute transformation from

• **out**: `Vector3` = `...`

Optional pre-allocated point

#### Returns

`Vector3`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:440](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L440)

***

### mapTreeIndexToNodeId()

> **mapTreeIndexToNodeId**(`treeIndex`): `Promise`\<`number`\>

Maps a single tree index to node ID for use with the API. If you have multiple
tree indices to map, [CogniteCadModel.mapNodeIdsToTreeIndices](CogniteCadModel.md#mapnodeidstotreeindices) is recommended for better
performance.

#### Parameters

• **treeIndex**: `number`

A tree index to map to a Node ID.

#### Returns

`Promise`\<`number`\>

TreeIndex of the provided node.

#### Throws

If an invalid/non-existent node ID is provided the function throws an error.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:615](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L615)

***

### mapTreeIndicesToNodeIds()

> **mapTreeIndicesToNodeIds**(`treeIndices`): `Promise`\<`number`[]\>

Maps a list of tree indices to node IDs for use with the Cognite SDK.
This function is useful if you have a list of tree indices, e.g. from
[CogniteCadModel.iterateSubtreeByTreeIndex](CogniteCadModel.md#iteratesubtreebytreeindex), and want to perform
some operations on these nodes using the SDK.

#### Parameters

• **treeIndices**: `number`[]

Tree indices to map to node IDs.

#### Returns

`Promise`\<`number`[]\>

A list of node IDs corresponding to the elements of the input.

#### Throws

If an invalid tree index is provided the function throws an error.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:603](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L603)

***

### removeAllStyledNodeCollections()

> **removeAllStyledNodeCollections**(): `void`

Removes all styled collections, resetting the appearance of all nodes to the
default appearance.

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:209](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L209)

***

### resetNodeTransform()

> **resetNodeTransform**(`treeIndices`): `void`

Resets the transformation for the nodes given.

#### Parameters

• **treeIndices**: [`NumericRange`](NumericRange.md)

Tree indices of the nodes to reset transforms for.

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:295](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L295)

***

### resetNodeTransformByTreeIndex()

> **resetNodeTransformByTreeIndex**(`treeIndex`, `applyToChildren`): `Promise`\<`number`\>

Remove override transform of the node by tree index.

#### Parameters

• **treeIndex**: `number`

• **applyToChildren**: `boolean` = `true`

#### Returns

`Promise`\<`number`\>

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:308](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L308)

***

### setDefaultNodeAppearance()

> **setDefaultNodeAppearance**(`appearance`): `void`

Sets the default appearance for nodes that are not styled using
[CogniteCadModel.assignStyledNodeCollection](CogniteCadModel.md#assignstylednodecollection). Updating the default style can be an
expensive operation, so use with care.

#### Parameters

• **appearance**: [`NodeAppearance`](../type-aliases/NodeAppearance.md)

Default node appearance.

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:129](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L129)

***

### setModelClippingPlanes()

> **setModelClippingPlanes**(`clippingPlanes`): `void`

Sets the clipping planes for this model. They will be combined with the
global clipping planes.

#### Parameters

• **clippingPlanes**: `Plane`[]

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:414](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L414)

***

### setModelTransformation()

> **setModelTransformation**(`matrix`): `void`

Sets transformation matrix of the model. This overrides the current transformation.

#### Parameters

• **matrix**: `Matrix4`

Transformation matrix.

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:396](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L396)

***

### setNodeTransform()

> **setNodeTransform**(`treeIndices`, `transformMatrix`, `boundingBox`?, `space`?): `void`

Apply a transformation matrix to the tree indices given, changing
rotation, scale and/or position.

Note that setting multiple transformations for the same
node isn't supported and might lead to undefined results.

#### Parameters

• **treeIndices**: [`NumericRange`](NumericRange.md)

Tree indices of nodes to apply the transformation to.

• **transformMatrix**: `Matrix4`

Transformation to apply.

• **boundingBox?**: `Box3`

Optional bounding box for the nodes before any transformation is applied. If given, it is assumed that all the nodes' geometry fit inside.

• **space?**: `"model"` \| `"world"` = `'world'`

Space to apply the transformation in. Defaults to 'world'.

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:225](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L225)

***

### setNodeTransformByTreeIndex()

> **setNodeTransformByTreeIndex**(`treeIndex`, `transform`, `applyToChildren`, `space`): `Promise`\<`number`\>

Set override transform of the node by tree index.

#### Parameters

• **treeIndex**: `number`

• **transform**: `Matrix4`

• **applyToChildren**: `boolean` = `true`

• **space**: `"model"` \| `"world"` = `'world'`

#### Returns

`Promise`\<`number`\>

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:279](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L279)

***

### unassignStyledNodeCollection()

> **unassignStyledNodeCollection**(`nodeCollection`): `void`

Removes styling for previously added styled collection, resetting the style to the default (or
the style imposed by other styled collections).

#### Parameters

• **nodeCollection**: [`NodeCollection`](NodeCollection.md)

Node collection previously added using [CogniteCadModel.assignStyledNodeCollection](CogniteCadModel.md#assignstylednodecollection).

#### Returns

`void`

#### Throws

Error if node collection isn't assigned to the model.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:195](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L195)
