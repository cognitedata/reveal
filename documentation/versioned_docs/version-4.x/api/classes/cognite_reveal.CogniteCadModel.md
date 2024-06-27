---
id: "cognite_reveal.CogniteCadModel"
title: "Class: CogniteCadModel"
sidebar_label: "CogniteCadModel"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).CogniteCadModel

Provides metadata needed to get asset mappings for a CDF 3D model

## Implements

- [`CdfModelNodeCollectionDataProvider`](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md)

## Properties

### modelId

• `Readonly` **modelId**: `number`

The CDF model ID of the model.

#### Implementation of

[CdfModelNodeCollectionDataProvider](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md).[modelId](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md#modelid)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:75](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L75)

___

### revisionId

• `Readonly` **revisionId**: `number`

The CDF revision ID of the model.

#### Implementation of

[CdfModelNodeCollectionDataProvider](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md).[revisionId](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md#revisionid)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:79](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L79)

___

### type

• `Readonly` **type**: [`SupportedModelTypes`](../modules/cognite_reveal.md#supportedmodeltypes) = `'cad'`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:26](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L26)

## Accessors

### modelUnit

• `get` **modelUnit**(): ``""`` \| [`WellKnownUnit`](../modules/cognite_reveal.md#wellknownunit)

Returns the unit the coordinates for the model is stored. Returns an empty string
if no unit has been stored.
Note that coordinates in Reveal always are converted to meters using [modelUnitToMetersFactor](cognite_reveal.CogniteCadModel.md#modelunittometersfactor).

#### Returns

``""`` \| [`WellKnownUnit`](../modules/cognite_reveal.md#wellknownunit)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:40](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L40)

___

### modelUnitToMetersFactor

• `get` **modelUnitToMetersFactor**(): `undefined` \| `number`

Returns the conversion factor that converts from model coordinates to meters. Note that this can
return undefined if the model has been stored in an unsupported unit.

#### Returns

`undefined` \| `number`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:50](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L50)

___

### nodeCount

• `get` **nodeCount**(): `number`

Returns the number of nodes in the model.

#### Returns

`number`

#### Implementation of

[CdfModelNodeCollectionDataProvider](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md).[nodeCount](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md#nodecount)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:458](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L458)

___

### styledNodeCollections

• `get` **styledNodeCollections**(): \{ `appearance`: [`NodeAppearance`](../modules/cognite_reveal.md#nodeappearance) ; `nodeCollection`: [`NodeCollection`](cognite_reveal.NodeCollection.md)  }[]

Returns all currently registered node collections and associated appearance.

#### Returns

\{ `appearance`: [`NodeAppearance`](../modules/cognite_reveal.md#nodeappearance) ; `nodeCollection`: [`NodeCollection`](cognite_reveal.NodeCollection.md)  }[]

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:127](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L127)

___

### visible

• `get` **visible**(): `boolean`

Returns the model visibility.

#### Returns

`boolean`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:68](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L68)

• `set` **visible**(`value`): `void`

Sets the model visibility.

**`Example`**

```js
model.visible = false
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:61](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L61)

## Methods

### assignStyledNodeCollection

▸ **assignStyledNodeCollection**(`nodeCollection`, `appearance`): `void`

Customizes rendering style for a set of nodes, e.g. to highlight, hide
or color code a set of 3D objects. This allows for custom look and feel
of the 3D model which is useful to highlight certain parts or to
color code the 3D model based on information (e.g. coloring the 3D model
by construction status).

The [NodeCollection](cognite_reveal.NodeCollection.md) can be updated dynamically and the rendered nodes will be
updated automatically as the styling changes. The appearance of the style nodes
cannot be changed.

When nodes are in several styled sets, the style is combined in the order
the sets were added, i.e. styled sets added late can overwrite styled sets added
early.

If the `nodeCollection` provided already has an assigned style, this style will
be replaced with style provided.

**`Example`**

```js
model.setDefaultNodeAppearance({ rendererGhosted: true });
const visibleNodes = new TreeIndexNodeCollection(someTreeIndices);
model.assignStyledNodeCollection(visibleSet, { rendererGhosted: false });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [`NodeCollection`](cognite_reveal.NodeCollection.md) | Dynamic set of nodes to apply the provided appearance to. |
| `appearance` | [`NodeAppearance`](../modules/cognite_reveal.md#nodeappearance) | Appearance to style the provided set with. |

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:158](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L158)

___

### dispose

▸ **dispose**(): `void`

Cleans up used resources.

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:247](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L247)

___

### getAncestorTreeIndices

▸ **getAncestorTreeIndices**(`treeIndex`, `generation`): `Promise`\<[`NumericRange`](cognite_reveal.NumericRange.md)\>

Determines the tree index range of a subtree of an ancestor of the provided
node defined by a tree index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | Tree index of node to find ancestor tree index range for. |
| `generation` | `number` | What "generation" to find. 0 is the node itself, 1 means parent, 2 means grandparent etc. If the node doesn't have as many ancestors, the root of the model is returned. This can be determined by checking that the range returned includes 0. |

#### Returns

`Promise`\<[`NumericRange`](cognite_reveal.NumericRange.md)\>

Tree index range of the subtree spanned by the ancestor at the
"generation" specified, or the root.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:271](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L271)

___

### getBoundingBoxByNodeId

▸ **getBoundingBoxByNodeId**(`nodeId`, `box?`): `Promise`\<`Box3`\>

Fetches a bounding box from the CDF by the nodeId.

**`Example`**

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

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeId` | `number` |  |
| `box?` | `Box3` | Optional. Used to write result to. |

#### Returns

`Promise`\<`Box3`\>

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:399](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L399)

___

### getBoundingBoxByTreeIndex

▸ **getBoundingBoxByTreeIndex**(`treeIndex`, `box?`): `Promise`\<`Box3`\>

Determine the bounding box of the node identified by the tree index provided. Note that this
function uses the CDF API to look up the bounding box.

**`Example`**

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

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | Tree index of the node to find bounding box for. |
| `box?` | `Box3` | Optional preallocated container to hold the bounding box. |

#### Returns

`Promise`\<`Box3`\>

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:434](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L434)

___

### getCameraConfiguration

▸ **getCameraConfiguration**(): `undefined` \| [`CameraConfiguration`](../modules/cognite_reveal.md#cameraconfiguration)

Retrieves the camera position and target stored for the model. Typically this
is used to store a good starting position for a model. Returns `undefined` if there
isn't any stored camera configuration for the model.

#### Returns

`undefined` \| [`CameraConfiguration`](../modules/cognite_reveal.md#cameraconfiguration)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:318](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L318)

___

### getCdfToDefaultModelTransformation

▸ **getCdfToDefaultModelTransformation**(`out?`): `Matrix4`

Gets transformation from CDF space to ThreeJS space,
which includes any additional "default" transformations assigned to this model.
Does not include any custom transformations set by [setModelTransformation](cognite_reveal.CogniteCadModel.md#setmodeltransformation)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `out?` | `Matrix4` | Preallocated `THREE.Matrix4` (optional) |

#### Returns

`Matrix4`

#### Implementation of

[CdfModelNodeCollectionDataProvider](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md).[getCdfToDefaultModelTransformation](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md#getcdftodefaultmodeltransformation)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:359](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L359)

___

### getDefaultNodeAppearance

▸ **getDefaultNodeAppearance**(): [`NodeAppearance`](../modules/cognite_reveal.md#nodeappearance)

Gets the default appearance for nodes that are not styled using
[assignStyledNodeCollection](cognite_reveal.CogniteCadModel.md#assignstylednodecollection).

#### Returns

[`NodeAppearance`](../modules/cognite_reveal.md#nodeappearance)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:120](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L120)

___

### getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`, `restrictToMostGeometry?`): `Box3`

Determines the full bounding box of the model.

**`Example`**

```js
const box = new THREE.Box3()
model.getModelBoundingBox(box);
// box now has the bounding box
```
```js
// the following code does the same
const box = model.getModelBoundingBox();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `outBbox?` | `Box3` | Optional. Used to write result to. |
| `restrictToMostGeometry?` | `boolean` | Optional. When true, returned bounds are restricted to where most of the geometry is located. This is useful for models that have junk geometry located far from the "main" model. Added in version 1.3.0. |

#### Returns

`Box3`

Model bounding box.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:302](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L302)

___

### getModelClippingPlanes

▸ **getModelClippingPlanes**(): `Plane`[]

Get the clipping planes for this model.

#### Returns

`Plane`[]

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:349](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L349)

___

### getModelTransformation

▸ **getModelTransformation**(`out?`): `Matrix4`

Gets transformation matrix that has previously been set with [setModelTransformation](cognite_reveal.CogniteCadModel.md#setmodeltransformation).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `out?` | `Matrix4` | Preallocated `THREE.Matrix4` (optional). |

#### Returns

`Matrix4`

#### Implementation of

[CdfModelNodeCollectionDataProvider](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md).[getModelTransformation](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md#getmodeltransformation)

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:334](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L334)

___

### getSubtreeTreeIndices

▸ **getSubtreeTreeIndices**(`treeIndex`): `Promise`\<[`NumericRange`](cognite_reveal.NumericRange.md)\>

Determines the range of tree indices for a given subtree.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | Index of the root of the subtree to get the index range for. |

#### Returns

`Promise`\<[`NumericRange`](cognite_reveal.NumericRange.md)\>

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:255](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L255)

___

### iterateNodesByTreeIndex

▸ **iterateNodesByTreeIndex**(`action`): `Promise`\<`void`\>

Iterates over all nodes in the model and applies the provided action to each node (identified by tree index).
The passed action is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
applied until promise is resolved (iteration is done).

**`Example`**

```js
const logIndex = (treeIndex) => console.log(treeIndex);
await model.iterateNodesByTreeIndex(logIndex); // 0, 1, 2, ...
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `action` | (`treeIndex`: `number`) => `void` | Function that will be called with a treeIndex argument. |

#### Returns

`Promise`\<`void`\>

Promise that is resolved once the iteration is done.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:451](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L451)

___

### iterateSubtreeByTreeIndex

▸ **iterateSubtreeByTreeIndex**(`treeIndex`, `action`): `Promise`\<`void`\>

Iterates over all nodes in a subtree of the model and applies the provided action to each node
(identified by tree index). The provided node is included in the visited set.  The passed action
is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
applied until promise is resolved (iteration is done).

**`Example`**

```js
// make a subtree to be gray
await model.iterateNodesByTreeIndex(treeIndex => {
  model.setNodeColorByTreeIndex(treeIndex, 127, 127, 127);
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | Tree index of the top parent of the subtree. |
| `action` | (`treeIndex`: `number`) => `void` | Function that will be called with a treeIndex argument. |

#### Returns

`Promise`\<`void`\>

Promise that is resolved once the iteration is done.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:478](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L478)

___

### mapBoxFromCdfToModelCoordinates

▸ **mapBoxFromCdfToModelCoordinates**(`box`, `out?`): `Box3`

Map bounding box from CDF to model space, taking the model's custom transformation into account

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `box` | `Box3` | Box to compute transformation from |
| `out` | `Box3` | Optional pre-allocated box |

#### Returns

`Box3`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:378](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L378)

___

### mapNodeIdToTreeIndex

▸ **mapNodeIdToTreeIndex**(`nodeId`): `Promise`\<`number`\>

Maps a single node ID to tree index. This is useful when you e.g. have a
node ID from an asset mapping and want to highlight the given asset using
[mapNodeIdsToTreeIndices](cognite_reveal.CogniteCadModel.md#mapnodeidstotreeindices) is recommended for better performance when
mapping multiple IDs.

**`Throws`**

If an invalid/non-existant node ID is provided the function throws an error.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeId` | `number` | A Node ID to map to a tree index. |

#### Returns

`Promise`\<`number`\>

TreeIndex of the provided node.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:506](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L506)

___

### mapNodeIdsToTreeIndices

▸ **mapNodeIdsToTreeIndices**(`nodeIds`): `Promise`\<`number`[]\>

Maps a list of Node IDs to tree indices. This function is useful when you have
a list of nodes, e.g. from Asset Mappings, that you want to highlight, hide,
color etc in the viewer.

**`Throws`**

If an invalid/non-existant node ID is provided the function throws an error.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeIds` | `number`[] | List of node IDs to map to tree indices. |

#### Returns

`Promise`\<`number`[]\>

A list of tree indices corresponing to the elements in the input.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:492](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L492)

___

### mapPointFromCdfToModelCoordinates

▸ **mapPointFromCdfToModelCoordinates**(`point`, `out?`): `Vector3`

Map point from CDF to model space, taking the model's custom transformation into account

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `point` | `Vector3` | Point to compute transformation from |
| `out` | `Vector3` | Optional pre-allocated point |

#### Returns

`Vector3`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:368](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L368)

___

### mapTreeIndexToNodeId

▸ **mapTreeIndexToNodeId**(`treeIndex`): `Promise`\<`number`\>

Maps a single tree index to node ID for use with the API. If you have multiple
tree indices to map, [mapNodeIdsToTreeIndices](cognite_reveal.CogniteCadModel.md#mapnodeidstotreeindices) is recommended for better
performance.

**`Throws`**

If an invalid/non-existent node ID is provided the function throws an error.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | A tree index to map to a Node ID. |

#### Returns

`Promise`\<`number`\>

TreeIndex of the provided node.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:532](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L532)

___

### mapTreeIndicesToNodeIds

▸ **mapTreeIndicesToNodeIds**(`treeIndices`): `Promise`\<`number`[]\>

Maps a list of tree indices to node IDs for use with the Cognite SDK.
This function is useful if you have a list of tree indices, e.g. from
[iterateSubtreeByTreeIndex](cognite_reveal.CogniteCadModel.md#iteratesubtreebytreeindex), and want to perform
some operations on these nodes using the SDK.

**`Throws`**

If an invalid tree index is provided the function throws an error.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndices` | `number`[] | Tree indices to map to node IDs. |

#### Returns

`Promise`\<`number`[]\>

A list of node IDs corresponding to the elements of the input.

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:520](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L520)

___

### removeAllStyledNodeCollections

▸ **removeAllStyledNodeCollections**(): `void`

Removes all styled collections, resetting the appearance of all nodes to the
default appearance.

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:190](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L190)

___

### resetNodeTransform

▸ **resetNodeTransform**(`treeIndices`): `void`

Resets the transformation for the nodes given.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndices` | [`NumericRange`](cognite_reveal.NumericRange.md) | Tree indices of the nodes to reset transforms for. |

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:229](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L229)

___

### resetNodeTransformByTreeIndex

▸ **resetNodeTransformByTreeIndex**(`treeIndex`, `applyToChildren?`): `Promise`\<`number`\>

Remove override transform of the node by tree index.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `treeIndex` | `number` | `undefined` |
| `applyToChildren` | `boolean` | `true` |

#### Returns

`Promise`\<`number`\>

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:238](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L238)

___

### setDefaultNodeAppearance

▸ **setDefaultNodeAppearance**(`appearance`): `void`

Sets the default appearance for nodes that are not styled using
[assignStyledNodeCollection](cognite_reveal.CogniteCadModel.md#assignstylednodecollection). Updating the default style can be an
expensive operation, so use with care.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `appearance` | [`NodeAppearance`](../modules/cognite_reveal.md#nodeappearance) | Default node appearance. |

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:112](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L112)

___

### setModelClippingPlanes

▸ **setModelClippingPlanes**(`clippingPlanes`): `void`

Sets the clipping planes for this model. They will be combined with the
global clipping planes.

#### Parameters

| Name | Type |
| :------ | :------ |
| `clippingPlanes` | `Plane`[] |

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:342](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L342)

___

### setModelTransformation

▸ **setModelTransformation**(`matrix`): `void`

Sets transformation matrix of the model. This overrides the current transformation.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `matrix` | `Matrix4` | Transformation matrix. |

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:326](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L326)

___

### setNodeTransform

▸ **setNodeTransform**(`treeIndices`, `transformMatrix`): `void`

Apply a transformation matrix to the tree indices given, changing
rotation, scale and/or position.

Note that setting multiple transformations for the same
node isn't supported and might lead to undefined results.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndices` | [`NumericRange`](cognite_reveal.NumericRange.md) | Tree indices of nodes to apply the transformation to. |
| `transformMatrix` | `Matrix4` | Transformation to apply. |

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:204](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L204)

___

### setNodeTransformByTreeIndex

▸ **setNodeTransformByTreeIndex**(`treeIndex`, `transform`, `applyToChildren?`): `Promise`\<`number`\>

Set override transform of the node by tree index.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `treeIndex` | `number` | `undefined` |
| `transform` | `Matrix4` | `undefined` |
| `applyToChildren` | `boolean` | `true` |

#### Returns

`Promise`\<`number`\>

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:215](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L215)

___

### unassignStyledNodeCollection

▸ **unassignStyledNodeCollection**(`nodeCollection`): `void`

Removes styling for previously added styled collection, resetting the style to the default (or
the style imposed by other styled collections).

**`Throws`**

Error if node collection isn't assigned to the model.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [`NodeCollection`](cognite_reveal.NodeCollection.md) | Node collection previously added using [assignStyledNodeCollection](cognite_reveal.CogniteCadModel.md#assignstylednodecollection). |

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/CogniteCadModel.ts:176](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-model/src/wrappers/CogniteCadModel.ts#L176)
