---
id: "cognite_reveal.Cognite3DModel"
title: "Class: Cognite3DModel"
sidebar_label: "Cognite3DModel"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).Cognite3DModel

## Hierarchy

- `Object3D`

  ↳ **`Cognite3DModel`**

## Implements

- [`CogniteModelBase`](../interfaces/cognite_reveal.CogniteModelBase.md)
- [`CdfModelNodeCollectionDataProvider`](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md)

## Properties

### modelId

• `Readonly` **modelId**: `number`

The CDF model ID of the model.

#### Implementation of

[CdfModelNodeCollectionDataProvider](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md).[modelId](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md#modelid)

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:57](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L57)

___

### revisionId

• `Readonly` **revisionId**: `number`

The CDF revision ID of the model.

#### Implementation of

[CdfModelNodeCollectionDataProvider](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md).[revisionId](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md#revisionid)

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:61](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L61)

___

### type

• `Readonly` **type**: [`SupportedModelTypes`](../modules/cognite_reveal.md#supportedmodeltypes) = `'cad'`

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[type](../interfaces/cognite_reveal.CogniteModelBase.md#type)

#### Overrides

THREE.Object3D.type

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:26](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L26)

## Accessors

### modelUnit

• `get` **modelUnit**(): ``""`` \| [`WellKnownUnit`](../modules/cognite_reveal.md#wellknownunit)

Returns the unit the coordinates for the model is stored. Returns an empty string
if no unit has been stored.
Note that coordinates in Reveal always are converted to meters using @see \{@link modelUnitToMetersFactor}.

#### Returns

``""`` \| [`WellKnownUnit`](../modules/cognite_reveal.md#wellknownunit)

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:40](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L40)

___

### modelUnitToMetersFactor

• `get` **modelUnitToMetersFactor**(): `number`

Returns the conversion factor that converts from model coordinates to meters. Note that this can
return undefined if the model has been stored in an unsupported unit.

#### Returns

`number`

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:50](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L50)

___

### nodeCount

• `get` **nodeCount**(): `number`

Returns the number of nodes in the model.

#### Returns

`number`

#### Implementation of

[CdfModelNodeCollectionDataProvider](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md).[nodeCount](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md#nodecount)

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:480](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L480)

___

### styledNodeCollections

• `get` **styledNodeCollections**(): \{ `appearance`: [`NodeAppearance`](../modules/cognite_reveal.md#nodeappearance) ; `nodeCollection`: [`NodeCollection`](cognite_reveal.NodeCollection.md)  }[]

Returns all currently registered node collections and associated appearance.

#### Returns

\{ `appearance`: [`NodeAppearance`](../modules/cognite_reveal.md#nodeappearance) ; `nodeCollection`: [`NodeCollection`](cognite_reveal.NodeCollection.md)  }[]

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:123](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L123)

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

**`example`**
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

[packages/cad-model/src/wrappers/Cognite3DModel.ts:154](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L154)

___

### dispose

▸ **dispose**(): `void`

Cleans up used resources.

#### Returns

`void`

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[dispose](../interfaces/cognite_reveal.CogniteModelBase.md#dispose)

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:314](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L314)

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

[packages/cad-model/src/wrappers/Cognite3DModel.ts:339](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L339)

___

### getBoundingBoxByNodeId

▸ **getBoundingBoxByNodeId**(`nodeId`, `box?`): `Promise`\<`Box3`\>

Fetches a bounding box from the CDF by the nodeId.

**`example`**
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

[packages/cad-model/src/wrappers/Cognite3DModel.ts:422](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L422)

___

### getBoundingBoxByTreeIndex

▸ **getBoundingBoxByTreeIndex**(`treeIndex`, `box?`): `Promise`\<`Box3`\>

Determine the bounding box of the node identified by the tree index provided. Note that this
function uses the CDF API to look up the bounding box.

**`example`**
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

[packages/cad-model/src/wrappers/Cognite3DModel.ts:456](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L456)

___

### getCameraConfiguration

▸ **getCameraConfiguration**(): [`CameraConfiguration`](../modules/cognite_reveal.md#cameraconfiguration)

Retrieves the camera position and target stored for the model. Typically this
is used to store a good starting position for a model. Returns `undefined` if there
isn't any stored camera configuration for the model.

#### Returns

[`CameraConfiguration`](../modules/cognite_reveal.md#cameraconfiguration)

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[getCameraConfiguration](../interfaces/cognite_reveal.CogniteModelBase.md#getcameraconfiguration)

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:386](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L386)

___

### getDefaultNodeAppearance

▸ **getDefaultNodeAppearance**(): [`NodeAppearance`](../modules/cognite_reveal.md#nodeappearance)

Gets the default appearance for nodes that are not styled using
[assignStyledNodeCollection](cognite_reveal.Cognite3DModel.md#assignstylednodecollection).

#### Returns

[`NodeAppearance`](../modules/cognite_reveal.md#nodeappearance)

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:116](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L116)

___

### getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`, `restrictToMostGeometry?`): `Box3`

Determines the full bounding box of the model.

**`example`**
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

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[getModelBoundingBox](../interfaces/cognite_reveal.CogniteModelBase.md#getmodelboundingbox)

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:370](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L370)

___

### getModelTransformation

▸ **getModelTransformation**(`out?`): `Matrix4`

Gets transformation matrix of the model.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `out?` | `Matrix4` | Preallocated `THREE.Matrix4` (optional). |

#### Returns

`Matrix4`

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[getModelTransformation](../interfaces/cognite_reveal.CogniteModelBase.md#getmodeltransformation)

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:402](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L402)

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

[packages/cad-model/src/wrappers/Cognite3DModel.ts:323](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L323)

___

### iterateNodesByTreeIndex

▸ **iterateNodesByTreeIndex**(`action`): `Promise`\<`void`\>

Iterates over all nodes in the model and applies the provided action to each node (identified by tree index).
The passed action is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
applied until promise is resolved (iteration is done).

**`example`**
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

[packages/cad-model/src/wrappers/Cognite3DModel.ts:473](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L473)

___

### iterateSubtreeByTreeIndex

▸ **iterateSubtreeByTreeIndex**(`treeIndex`, `action`): `Promise`\<`void`\>

Iterates over all nodes in a subtree of the model and applies the provided action to each node
(identified by tree index). The provided node is included in the visited set.  The passed action
is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
applied until promise is resolved (iteration is done).

**`example`**
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

[packages/cad-model/src/wrappers/Cognite3DModel.ts:500](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L500)

___

### mapBoxFromCdfToModelCoordinates

▸ **mapBoxFromCdfToModelCoordinates**(`box`, `out?`): `Box3`

Maps from a 3D position in "CDF space" to coordinates in "ThreeJS model space".
This is necessary because CDF has a right-handed Z-up coordinate system while ThreeJS
uses a right-hand Y-up coordinate system. This function also accounts for transformation
applied to the model.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `box` | `Box3` | The box in CDF model coordinates. |
| `out?` | `Box3` | Optional preallocated buffer for storing the result. May be same input as `box`. |

#### Returns

`Box3`

Transformed box.

#### Implementation of

[CdfModelNodeCollectionDataProvider](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md).[mapBoxFromCdfToModelCoordinates](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md#mapboxfromcdftomodelcoordinates)

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:302](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L302)

___

### mapBoxFromModelToCdfCoordinates

▸ **mapBoxFromModelToCdfCoordinates**(`box`, `out?`): `Box3`

Maps from a 3D position in "ThreeJS model space" to coordinates in "CDF space".
This is necessary because CDF has a right-handed Z-up coordinate system while ThreeJS
uses a right-hand Y-up coordinate system. This function also accounts for transformation
applied to the model.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `box` | `Box3` | The box in ThreeJS/model coordinates. |
| `out?` | `Box3` | Optional preallocated buffer for storing the result. May be same input as `box`. |

#### Returns

`Box3`

Transformed box.

#### Implementation of

[CdfModelNodeCollectionDataProvider](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md).[mapBoxFromModelToCdfCoordinates](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md#mapboxfrommodeltocdfcoordinates)

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:284](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L284)

___

### mapFromCdfToModelCoordinates

▸ **mapFromCdfToModelCoordinates**(`p`, `out?`): `Vector3`

Maps a position retrieved from the CDF API (e.g. 3D node information) to
coordinates in "ThreeJS model space". This is necessary because CDF has a right-handed
Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | `Vector3` | The CDF coordinate to transform. |
| `out?` | `Vector3` | Optional preallocated buffer for storing the result. May be `p`. |

#### Returns

`Vector3`

Transformed position.

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:248](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L248)

___

### mapNodeIdToTreeIndex

▸ **mapNodeIdToTreeIndex**(`nodeId`): `Promise`\<`number`\>

Maps a single node ID to tree index. This is useful when you e.g. have a
node ID from an asset mapping and want to highlight the given asset using
[mapNodeIdsToTreeIndices](cognite_reveal.Cognite3DModel.md#mapnodeidstotreeindices) is recommended for better performance when
mapping multiple IDs.

**`throws`** If an invalid/non-existant node ID is provided the function throws an error.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeId` | `number` | A Node ID to map to a tree index. |

#### Returns

`Promise`\<`number`\>

TreeIndex of the provided node.

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:528](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L528)

___

### mapNodeIdsToTreeIndices

▸ **mapNodeIdsToTreeIndices**(`nodeIds`): `Promise`\<`number`[]\>

Maps a list of Node IDs to tree indices. This function is useful when you have
a list of nodes, e.g. from Asset Mappings, that you want to highlight, hide,
color etc in the viewer.

**`throws`** If an invalid/non-existant node ID is provided the function throws an error.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeIds` | `number`[] | List of node IDs to map to tree indices. |

#### Returns

`Promise`\<`number`[]\>

A list of tree indices corresponing to the elements in the input.

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:514](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L514)

___

### mapPositionFromModelToCdfCoordinates

▸ **mapPositionFromModelToCdfCoordinates**(`p`, `out?`): `Vector3`

Maps from a 3D position in "ThreeJS model space" (e.g. a ray intersection coordinate)
to coordinates in "CDF space". This is necessary because CDF has a right-handed
Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.
This function also accounts for transformation applied to the model.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | `Vector3` | The ThreeJS coordinate to transform. |
| `out?` | `Vector3` | Optional preallocated buffer for storing the result. May be `p`. |

#### Returns

`Vector3`

Transformed position.

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:266](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L266)

___

### mapTreeIndexToNodeId

▸ **mapTreeIndexToNodeId**(`treeIndex`): `Promise`\<`number`\>

Maps a single tree index to node ID for use with the API. If you have multiple
tree indices to map, [mapNodeIdsToTreeIndices](cognite_reveal.Cognite3DModel.md#mapnodeidstotreeindices) is recommended for better
performance.

**`throws`** If an invalid/non-existent node ID is provided the function throws an error.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | A tree index to map to a Node ID. |

#### Returns

`Promise`\<`number`\>

TreeIndex of the provided node.

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:554](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L554)

___

### mapTreeIndicesToNodeIds

▸ **mapTreeIndicesToNodeIds**(`treeIndices`): `Promise`\<`number`[]\>

Maps a list of tree indices to node IDs for use with the Cognite SDK.
This function is useful if you have a list of tree indices, e.g. from
[Cognite3DModel.iterateSubtreeByTreeIndex](cognite_reveal.Cognite3DModel.md#iteratesubtreebytreeindex), and want to perform
some operations on these nodes using the SDK.

**`throws`** If an invalid tree index is provided the function throws an error.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndices` | `number`[] | Tree indices to map to node IDs. |

#### Returns

`Promise`\<`number`[]\>

A list of node IDs corresponding to the elements of the input.

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:542](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L542)

___

### removeAllStyledNodeCollections

▸ **removeAllStyledNodeCollections**(): `void`

Removes all styled collections, resetting the appearance of all nodes to the
default appearance.

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:186](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L186)

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

[packages/cad-model/src/wrappers/Cognite3DModel.ts:225](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L225)

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

[packages/cad-model/src/wrappers/Cognite3DModel.ts:234](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L234)

___

### setDefaultNodeAppearance

▸ **setDefaultNodeAppearance**(`appearance`): `void`

Sets the default appearance for nodes that are not styled using
[assignStyledNodeCollection](cognite_reveal.Cognite3DModel.md#assignstylednodecollection). Updating the default style can be an
expensive operation, so use with care.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `appearance` | [`NodeAppearance`](../modules/cognite_reveal.md#nodeappearance) | Default node appearance. |

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:108](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L108)

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

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[setModelTransformation](../interfaces/cognite_reveal.CogniteModelBase.md#setmodeltransformation)

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:394](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L394)

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

[packages/cad-model/src/wrappers/Cognite3DModel.ts:200](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L200)

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

[packages/cad-model/src/wrappers/Cognite3DModel.ts:211](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L211)

___

### unassignStyledNodeCollection

▸ **unassignStyledNodeCollection**(`nodeCollection`): `void`

Removes styling for previously added styled collection, resetting the style to the default (or
the style imposed by other styled collections).

**`throws`** Error if node collection isn't assigned to the model.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [`NodeCollection`](cognite_reveal.NodeCollection.md) | Node collection previously added using [assignStyledNodeCollection](cognite_reveal.Cognite3DModel.md#assignstylednodecollection). |

#### Returns

`void`

#### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:172](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L172)
