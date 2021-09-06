
<a name="readmemd"></a>

@cognite/reveal / [Modules](#modulesmd)

`@cognite/reveal` has two modules:
- [@cognite/reveal](#module-cognitereveal) is the main module and has the main entry point of Reveal, [`Cognite3DViewer`](#class-cognite3dviewer). CAD models are represented by [`Cognite3DModel`](#class-cognite3dmodel) and points clouds by [`CognitePointCloudModel`](#class-cognitepointcloudmodel).
- [@congite/reveal/tools](#module-cogniterevealtools) contains a set of tools, e.g. [`AxisViewTool`](#class-axisviewtool), [`GeomapTool`](#class-geomaptool), [`ExplodedViewTool`](#class-explodedviewtool) and [`HtmlOverlayTool`](#class-htmloverlaytool) that works with `Cognite3DViewer`.

# Classes


<a name="classes_cognite_revealassetnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / AssetNodeCollection

## Class: AssetNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).AssetNodeCollection

Represents a set of nodes associated with an [asset in Cognite Fusion](https://docs.cognite.com/api/v1/#tag/Assets)
linked to the 3D model using [asset mappings](https://docs.cognite.com/api/v1/#tag/3D-Asset-Mapping). A node
is considered to be part of an asset if it has a direct asset mapping or if one of its ancestors has an asset mapping
to the asset.

### Hierarchy

- [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd)

  ↳ **AssetNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken)
- [isLoading](#isloading)

#### Methods

- [clear](#clear)
- [executeFilter](#executefilter)
- [getFilter](#getfilter)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [serialize](#serialize)

### Constructors

#### constructor

• **new AssetNodeCollection**(`client`, `model`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `client` | `default` |
| `model` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) |

##### Overrides

NodeCollectionBase.constructor

##### Defined in

[viewer/src/datamodels/cad/styling/AssetNodeCollection.ts:28](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/AssetNodeCollection.ts#L28)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"AssetNodeCollection"``

##### Defined in

[viewer/src/datamodels/cad/styling/AssetNodeCollection.ts:22](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/AssetNodeCollection.ts#L22)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L26)

___

#### isLoading

• `get` **isLoading**(): `boolean`

Returns true when the set currently is running an operation
for loading the full set of nodes contained by the set.

##### Returns

`boolean`

##### Defined in

[viewer/src/datamodels/cad/styling/AssetNodeCollection.ts:37](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/AssetNodeCollection.ts#L37)

### Methods

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[clear](#clear)

##### Defined in

[viewer/src/datamodels/cad/styling/AssetNodeCollection.ts:95](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/AssetNodeCollection.ts#L95)

___

#### executeFilter

▸ **executeFilter**(`filter`): `Promise`<void\>

Updates the node collection to hold nodes associated with the asset given, or
assets within the bounding box or all assets associated with the 3D model.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | `Object` |  |
| `filter.assetId?` | `number` | ID of a single [asset](https://docs.cognite.com/dev/concepts/resource_types/assets.html) (optional) |
| `filter.boundingBox?` | `Box3` | When provided, only assets within the provided bounds will be included in the filter. |

##### Returns

`Promise`<void\>

##### Defined in

[viewer/src/datamodels/cad/styling/AssetNodeCollection.ts:48](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/AssetNodeCollection.ts#L48)

___

#### getFilter

▸ **getFilter**(): `any`

##### Returns

`any`

##### Defined in

[viewer/src/datamodels/cad/styling/AssetNodeCollection.ts:91](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/AssetNodeCollection.ts#L91)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[getIndexSet](#getindexset)

##### Defined in

[viewer/src/datamodels/cad/styling/AssetNodeCollection.ts:102](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/AssetNodeCollection.ts#L102)

___

#### off

▸ **off**(`event`, `listener`): `void`

Unsubscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[off](#off)

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:43](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L43)

___

#### on

▸ **on**(`event`, `listener`): `void`

Subscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[on](#on)

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:34](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L34)

___

#### serialize

▸ **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[serialize](#serialize)

##### Defined in

[viewer/src/datamodels/cad/styling/AssetNodeCollection.ts:106](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/AssetNodeCollection.ts#L106)


<a name="classes_cognite_revealboundingboxclippermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / BoundingBoxClipper

## Class: BoundingBoxClipper

[@cognite/reveal](#modules_cognite_revealmd).BoundingBoxClipper

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Accessors

- [clippingPlanes](#clippingplanes)
- [intersection](#intersection)
- [maxX](#maxx)
- [maxY](#maxy)
- [maxZ](#maxz)
- [minX](#minx)
- [minY](#miny)
- [minZ](#minz)

### Constructors

#### constructor

• **new BoundingBoxClipper**(`box?`, `intersection?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `box?` | `Box3` |
| `intersection?` | `boolean` |

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:17](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L17)

### Accessors

#### clippingPlanes

• `get` **clippingPlanes**(): `Plane`[]

##### Returns

`Plane`[]

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:115](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L115)

___

#### intersection

• `get` **intersection**(): `boolean`

##### Returns

`boolean`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:84](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L84)

• `set` **intersection**(`value`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `boolean` |

##### Returns

`void`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:79](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L79)

___

#### maxX

• `get` **maxX**(): `number`

##### Returns

`number`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:57](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L57)

• `set` **maxX**(`x`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |

##### Returns

`void`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:52](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L52)

___

#### maxY

• `get` **maxY**(): `number`

##### Returns

`number`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:66](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L66)

• `set` **maxY**(`y`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `y` | `number` |

##### Returns

`void`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:61](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L61)

___

#### maxZ

• `get` **maxZ**(): `number`

##### Returns

`number`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:75](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L75)

• `set` **maxZ**(`z`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `z` | `number` |

##### Returns

`void`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:70](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L70)

___

#### minX

• `get` **minX**(): `number`

##### Returns

`number`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:30](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L30)

• `set` **minX**(`x`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |

##### Returns

`void`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:25](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L25)

___

#### minY

• `get` **minY**(): `number`

##### Returns

`number`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:39](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L39)

• `set` **minY**(`y`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `y` | `number` |

##### Returns

`void`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:34](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L34)

___

#### minZ

• `get` **minZ**(): `number`

##### Returns

`number`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:48](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L48)

• `set` **minZ**(`z`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `z` | `number` |

##### Returns

`void`

##### Defined in

[viewer/src/utilities/BoundingBoxClipper.ts:43](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/BoundingBoxClipper.ts#L43)


<a name="classes_cognite_revealcognite3dmodelmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / Cognite3DModel

## Class: Cognite3DModel

[@cognite/reveal](#modules_cognite_revealmd).Cognite3DModel

### Hierarchy

- `Object3D`

  ↳ **Cognite3DModel**

### Implements

- [CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd)

### Table of contents

#### Properties

- [modelId](#modelid)
- [revisionId](#revisionid)
- [type](#type)

#### Accessors

- [nodeCount](#nodecount)

#### Methods

- [assignStyledNodeCollection](#assignstylednodecollection)
- [dispose](#dispose)
- [getBoundingBoxByNodeId](#getboundingboxbynodeid)
- [getBoundingBoxByTreeIndex](#getboundingboxbytreeindex)
- [getCameraConfiguration](#getcameraconfiguration)
- [getDefaultNodeAppearance](#getdefaultnodeappearance)
- [getModelBoundingBox](#getmodelboundingbox)
- [getModelTransformation](#getmodeltransformation)
- [getSubtreeTreeIndices](#getsubtreetreeindices)
- [iterateNodesByTreeIndex](#iteratenodesbytreeindex)
- [iterateSubtreeByTreeIndex](#iteratesubtreebytreeindex)
- [mapBoxFromModelToCdfCoordinates](#mapboxfrommodeltocdfcoordinates)
- [mapFromCdfToModelCoordinates](#mapfromcdftomodelcoordinates)
- [mapNodeIdToTreeIndex](#mapnodeidtotreeindex)
- [mapNodeIdsToTreeIndices](#mapnodeidstotreeindices)
- [mapPositionFromModelToCdfCoordinates](#mappositionfrommodeltocdfcoordinates)
- [mapTreeIndexToNodeId](#maptreeindextonodeid)
- [mapTreeIndicesToNodeIds](#maptreeindicestonodeids)
- [removeAllStyledNodeCollections](#removeallstylednodecollections)
- [resetNodeTransform](#resetnodetransform)
- [resetNodeTransformByTreeIndex](#resetnodetransformbytreeindex)
- [setDefaultNodeAppearance](#setdefaultnodeappearance)
- [setModelTransformation](#setmodeltransformation)
- [setNodeTransform](#setnodetransform)
- [setNodeTransformByTreeIndex](#setnodetransformbytreeindex)
- [unassignStyledNodeCollection](#unassignstylednodecollection)

### Properties

#### modelId

• `Readonly` **modelId**: `number`

The CDF model ID of the model.

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:45](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L45)

___

#### revisionId

• `Readonly` **revisionId**: `number`

The CDF revision ID of the model.

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:49](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L49)

___

#### type

• `Readonly` **type**: [SupportedModelTypes](#supportedmodeltypes) = 'cad'

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[type](#type)

##### Overrides

THREE.Object3D.type

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:28](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L28)

### Accessors

#### nodeCount

• `get` **nodeCount**(): `number`

Returns the number of nodes in the model.

##### Returns

`number`

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:370](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L370)

### Methods

#### assignStyledNodeCollection

▸ **assignStyledNodeCollection**(`nodeCollection`, `appearance`): `void`

Customizes rendering style for a set of nodes, e.g. to highlight, hide
or color code a set of 3D objects. This allows for custom look and feel
of the 3D model which is useful to highlight certain parts or to
color code the 3D model based on information (e.g. coloring the 3D model
by construction status).

The [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd) can be updated dynamically and the rendered nodes will be
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

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd) | Dynamic set of nodes to apply the provided appearance to. |
| `appearance` | [NodeAppearance](#nodeappearance) | Appearance to style the provided set with. |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:125](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L125)

___

#### dispose

▸ **dispose**(): `void`

Cleans up used resources.

##### Returns

`void`

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[dispose](#dispose)

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:224](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L224)

___

#### getBoundingBoxByNodeId

▸ **getBoundingBoxByNodeId**(`nodeId`, `box?`): `Promise`<Box3\>

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

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeId` | `number` |  |
| `box?` | `Box3` | Optional. Used to write result to. |

##### Returns

`Promise`<Box3\>

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:307](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L307)

___

#### getBoundingBoxByTreeIndex

▸ **getBoundingBoxByTreeIndex**(`treeIndex`, `box?`): `Promise`<Box3\>

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

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | Tree index of the node to find bounding box for. |
| `box?` | `Box3` | Optional preallocated container to hold the bounding box. |

##### Returns

`Promise`<Box3\>

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:346](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L346)

___

#### getCameraConfiguration

▸ **getCameraConfiguration**(): `undefined` \| [CameraConfiguration](#cameraconfiguration)

Retrieves the camera position and target stored for the model. Typically this
is used to store a good starting position for a model. Returns `undefined` if there
isn't any stored camera configuration for the model.

##### Returns

`undefined` \| [CameraConfiguration](#cameraconfiguration)

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[getCameraConfiguration](#getcameraconfiguration)

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:271](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L271)

___

#### getDefaultNodeAppearance

▸ **getDefaultNodeAppearance**(): [NodeAppearance](#nodeappearance)

Gets the default appearance for nodes that are not styled using
[assignStyledNodeCollection](#assignstylednodecollection).

##### Returns

[NodeAppearance](#nodeappearance)

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:94](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L94)

___

#### getModelBoundingBox

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

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `outBbox?` | `Box3` | Optional. Used to write result to. |
| `restrictToMostGeometry?` | `boolean` | Optional. When true, returned bounds are restricted to where most of the geometry is located. This is useful for models that have junk geometry located far from the "main" model. Added in version 1.3.0. |

##### Returns

`Box3`

Model bounding box.

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[getModelBoundingBox](#getmodelboundingbox)

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:255](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L255)

___

#### getModelTransformation

▸ **getModelTransformation**(`out?`): `Matrix4`

Gets transformation matrix of the model.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `out?` | `Matrix4` | Preallocated `THREE.Matrix4` (optional). |

##### Returns

`Matrix4`

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[getModelTransformation](#getmodeltransformation)

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:287](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L287)

___

#### getSubtreeTreeIndices

▸ **getSubtreeTreeIndices**(`treeIndex`): `Promise`<[NumericRange](#classes_cognite_revealnumericrangemd)\>

Determines the range of tree indices for a given subtree.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | Index of the root of the subtree to get the index range for. |

##### Returns

`Promise`<[NumericRange](#classes_cognite_revealnumericrangemd)\>

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:232](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L232)

___

#### iterateNodesByTreeIndex

▸ **iterateNodesByTreeIndex**(`action`): `Promise`<void\>

Iterates over all nodes in the model and applies the provided action to each node (identified by tree index).
The passed action is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
applied until promise is resolved (iteration is done).

**`example`**
```js
const logIndex = (treeIndex) => console.log(treeIndex);
await model.iterateNodesByTreeIndex(logIndex); // 0, 1, 2, ...
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `action` | (`treeIndex`: `number`) => `void` | Function that will be called with a treeIndex argument. |

##### Returns

`Promise`<void\>

Promise that is resolved once the iteration is done.

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:363](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L363)

___

#### iterateSubtreeByTreeIndex

▸ **iterateSubtreeByTreeIndex**(`treeIndex`, `action`): `Promise`<void\>

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

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | Tree index of the top parent of the subtree. |
| `action` | (`treeIndex`: `number`) => `void` | Function that will be called with a treeIndex argument. |

##### Returns

`Promise`<void\>

Promise that is resolved once the iteration is done.

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:390](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L390)

___

#### mapBoxFromModelToCdfCoordinates

▸ **mapBoxFromModelToCdfCoordinates**(`box`, `out?`): `Box3`

Maps from a 3D position in "ThreeJS model space" to coordinates in "CDF space".
This is necessary because CDF has a right-handed Z-up coordinate system while ThreeJS
uses a right-hand Y-up coordinate system. This function also accounts for transformation
applied to the model.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `box` | `Box3` | The box in ThreeJS/model coordinates. |
| `out?` | `Box3` | Optional preallocated buffer for storing the result. May be `box`. |

##### Returns

`Box3`

Transformed box.

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:212](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L212)

___

#### mapFromCdfToModelCoordinates

▸ **mapFromCdfToModelCoordinates**(`p`, `out?`): `Vector3`

Maps a position retrieved from the CDF API (e.g. 3D node information) to
coordinates in "ThreeJS model space". This is necessary because CDF has a right-handed
Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | `Vector3` | The CDF coordinate to transform. |
| `out?` | `Vector3` | Optional preallocated buffer for storing the result. May be `p`. |

##### Returns

`Vector3`

Transformed position.

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:176](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L176)

___

#### mapNodeIdToTreeIndex

▸ **mapNodeIdToTreeIndex**(`nodeId`): `Promise`<number\>

Maps a single node ID to tree index. This is useful when you e.g. have a
node ID from an asset mapping and want to highlight the given asset using
[mapNodeIdsToTreeIndices](#mapnodeidstotreeindices) is recommended for better performance when
mapping multiple IDs.

**`throws`** If an invalid/non-existant node ID is provided the function throws an error.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeId` | `number` | A Node ID to map to a tree index. |

##### Returns

`Promise`<number\>

TreeIndex of the provided node.

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:445](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L445)

___

#### mapNodeIdsToTreeIndices

▸ **mapNodeIdsToTreeIndices**(`nodeIds`): `Promise`<number[]\>

Maps a list of Node IDs to tree indices. This function is useful when you have
a list of nodes, e.g. from Asset Mappings, that you want to highlight, hide,
color etc in the viewer.

**`throws`** If an invalid/non-existant node ID is provided the function throws an error.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeIds` | `number`[] | List of node IDs to map to tree indices. |

##### Returns

`Promise`<number[]\>

A list of tree indices corresponing to the elements in the input.

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:431](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L431)

___

#### mapPositionFromModelToCdfCoordinates

▸ **mapPositionFromModelToCdfCoordinates**(`p`, `out?`): `Vector3`

Maps from a 3D position in "ThreeJS model space" (e.g. a ray intersection coordinate)
to coordinates in "CDF space". This is necessary because CDF has a right-handed
Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.
This function also accounts for transformation applied to the model.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | `Vector3` | The ThreeJS coordinate to transform. |
| `out?` | `Vector3` | Optional preallocated buffer for storing the result. May be `p`. |

##### Returns

`Vector3`

Transformed position.

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:194](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L194)

___

#### mapTreeIndexToNodeId

▸ **mapTreeIndexToNodeId**(`treeIndex`): `Promise`<number\>

Maps a single tree index to node ID for use with the API. If you have multiple
tree indices to map, [mapNodeIdsToTreeIndices](#mapnodeidstotreeindices) is recommended for better
performance.

**`throws`** If an invalid/non-existant node ID is provided the function throws an error.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | A tree index to map to a Node ID. |

##### Returns

`Promise`<number\>

TreeIndex of the provided node.

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:471](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L471)

___

#### mapTreeIndicesToNodeIds

▸ **mapTreeIndicesToNodeIds**(`treeIndices`): `Promise`<number[]\>

Maps a list of tree indices to node IDs for use with the Cognite SDK.
This function is useful if you have a list of tree indices, e.g. from
[Cognite3DModel.iterateSubtreeByTreeIndex](#iteratesubtreebytreeindex), and want to perform
some operations on these nodes using the SDK.

**`throws`** If an invalid tree index is provided the function throws an error.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndices` | `number`[] | Tree indices to map to node IDs. |

##### Returns

`Promise`<number[]\>

A list of node IDs corresponding to the elements of the input.

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:459](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L459)

___

#### removeAllStyledNodeCollections

▸ **removeAllStyledNodeCollections**(): `void`

Removes all styled collections, resetting the appearance of all nodes to the
default appearance.

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:143](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L143)

___

#### resetNodeTransform

▸ **resetNodeTransform**(`treeIndices`): `void`

Resets the transformation for the nodes given.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndices` | [NumericRange](#classes_cognite_revealnumericrangemd) | Tree indices of the nodes to reset transforms for. |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:164](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L164)

___

#### resetNodeTransformByTreeIndex

▸ **resetNodeTransformByTreeIndex**(`treeIndex`, `applyToChildren?`): `Promise`<number\>

Remove override transform of the node by tree index.

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `treeIndex` | `number` | `undefined` |
| `applyToChildren` | `boolean` | true |

##### Returns

`Promise`<number\>

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:416](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L416)

___

#### setDefaultNodeAppearance

▸ **setDefaultNodeAppearance**(`appearance`): `void`

Sets the default appearance for nodes that are not styled using
[assignStyledNodeCollection](#assignstylednodecollection). Updating the default style can be an
expensive operation, so use with care.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `appearance` | [NodeAppearance](#nodeappearance) | Default node appearance. |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:86](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L86)

___

#### setModelTransformation

▸ **setModelTransformation**(`matrix`): `void`

Sets transformation matrix of the model. This overrides the current transformation.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `matrix` | `Matrix4` | Transformation matrix. |

##### Returns

`void`

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[setModelTransformation](#setmodeltransformation)

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:279](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L279)

___

#### setNodeTransform

▸ **setNodeTransform**(`treeIndices`, `transformMatrix`): `void`

Apply a transformation matrix to the tree indices given, changing
rotation, scale and/or position.

Note that setting multiple transformations for the same
node isn't supported and might lead to undefined results.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndices` | [NumericRange](#classes_cognite_revealnumericrangemd) | Tree indices of nodes to apply the transformation to. |
| `transformMatrix` | `Matrix4` | Transformation to apply. |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:156](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L156)

___

#### setNodeTransformByTreeIndex

▸ **setNodeTransformByTreeIndex**(`treeIndex`, `transform`, `applyToChildren?`): `Promise`<number\>

Set override transform of the node by tree index.

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `treeIndex` | `number` | `undefined` |
| `transform` | `Matrix4` | `undefined` |
| `applyToChildren` | `boolean` | true |

##### Returns

`Promise`<number\>

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:401](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L401)

___

#### unassignStyledNodeCollection

▸ **unassignStyledNodeCollection**(`nodeCollection`): `void`

Removes styling for previously added styled collection, resetting the style to the default (or
the style imposed by other styled collections).

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd) | Node collection previously added using [assignStyledNodeCollection](#assignstylednodecollection). |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DModel.ts:135](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DModel.ts#L135)


<a name="classes_cognite_revealcognite3dviewermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / Cognite3DViewer

## Class: Cognite3DViewer

[@cognite/reveal](#modules_cognite_revealmd).Cognite3DViewer

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Accessors

- [cadBudget](#cadbudget)
- [cameraControls](#cameracontrols)
- [cameraControlsEnabled](#cameracontrolsenabled)
- [domElement](#domelement)
- [models](#models)
- [renderer](#renderer)

#### Methods

- [addCadModel](#addcadmodel)
- [addModel](#addmodel)
- [addObject3D](#addobject3d)
- [addPointCloudModel](#addpointcloudmodel)
- [addUiObject](#adduiobject)
- [determineModelType](#determinemodeltype)
- [disableKeyboardNavigation](#disablekeyboardnavigation)
- [dispose](#dispose)
- [enableKeyboardNavigation](#enablekeyboardnavigation)
- [fitCameraToBoundingBox](#fitcameratoboundingbox)
- [fitCameraToModel](#fitcameratomodel)
- [requestRedraw](#requestRedraw)
- [getCamera](#getcamera)
- [getCameraPosition](#getcameraposition)
- [getCameraTarget](#getcameratarget)
- [getIntersectionFromPixel](#getintersectionfrompixel)
- [getScene](#getscene)
- [getScreenshot](#getscreenshot)
- [getVersion](#getversion)
- [getViewState](#getviewstate)
- [loadCameraFromModel](#loadcamerafrommodel)
- [off](#off)
- [on](#on)
- [removeModel](#removemodel)
- [removeObject3D](#removeobject3d)
- [removeUiObject](#removeuiobject)
- [setBackgroundColor](#setbackgroundcolor)
- [setCameraPosition](#setcameraposition)
- [setCameraTarget](#setcameratarget)
- [setSlicingPlanes](#setslicingplanes)
- [setViewState](#setviewstate)
- [worldToScreen](#worldtoscreen)
- [isBrowserSupported](#isbrowsersupported)

### Constructors

#### constructor

• **new Cognite3DViewer**(`options`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [Cognite3DViewerOptions](#interfaces_cognite_revealcognite3dvieweroptionsmd) |

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:193](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L193)

### Accessors

#### cadBudget

• `get` **cadBudget**(): [CadModelBudget](#cadmodelbudget)

Gets the current budget for downloading geometry for CAD models. Note that this
budget is shared between all added CAD models and not a per-model budget.

##### Returns

[CadModelBudget](#cadmodelbudget)

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:165](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L165)

• `set` **cadBudget**(`budget`): `void`

Sets the current budget for downloading geometry for CAD models. Note that this
budget is shared between all added CAD models and not a per-model budget.

##### Parameters

| Name | Type |
| :------ | :------ |
| `budget` | [CadModelBudget](#cadmodelbudget) |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:175](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L175)

___

#### cameraControls

• `get` **cameraControls**(): `default`

Gets the camera controller. See https://www.npmjs.com/package/@cognite/three-combo-controls
for documentation. Note that by default the `minDistance` setting of the controls will
be automatic. This can be disabled using [Cognite3DViewerOptions.automaticControlsSensitivity](#automaticcontrolssensitivity).

##### Returns

`default`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:840](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L840)

___

#### cameraControlsEnabled

• `get` **cameraControlsEnabled**(): `boolean`

Gets whether camera controls through mouse, touch and keyboard are enabled.

##### Returns

`boolean`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:847](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L847)

• `set` **cameraControlsEnabled**(`enabled`): `void`

Sets whether camera controls through mouse, touch and keyboard are enabled.
This can be useful to e.g. temporarily disable navigation when manipulating other
objects in the scene or when implementing a "cinematic" viewer.

##### Parameters

| Name | Type |
| :------ | :------ |
| `enabled` | `boolean` |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:856](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L856)

___

#### domElement

• `get` **domElement**(): `HTMLElement`

The DOM element the viewer will insert its rendering canvas into.
The DOM element can be specified in the options when the viewer is created.
If not specified, the DOM element will be created automatically.
The DOM element cannot be changed after the viewer has been created.

##### Returns

`HTMLElement`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:93](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L93)

___

#### models

• `get` **models**(): [CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd)[]

Gets a list of models currently added to the viewer.

##### Returns

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd)[]

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:184](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L184)

___

#### renderer

• `get` **renderer**(): `WebGLRenderer`

Returns the renderer used to produce images from 3D geometry.

##### Returns

`WebGLRenderer`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:100](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L100)

### Methods

#### addCadModel

▸ **addCadModel**(`options`): `Promise`<[Cognite3DModel](#classes_cognite_revealcognite3dmodelmd)\>

Add a new CAD 3D model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](#fitcameratomodel) to see the model after the model has loaded.

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

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [AddModelOptions](#interfaces_cognite_revealaddmodeloptionsmd) |

##### Returns

`Promise`<[Cognite3DModel](#classes_cognite_revealcognite3dmodelmd)\>

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:490](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L490)

___

#### addModel

▸ **addModel**(`options`): `Promise`<[Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) \| [CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd)\>

Add a new model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](#fitcameratomodel) to see the model after the model has loaded.

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

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [AddModelOptions](#interfaces_cognite_revealaddmodeloptionsmd) |

##### Returns

`Promise`<[Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) \| [CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd)\>

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:463](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L463)

___

#### addObject3D

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

##### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `Object3D` |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:645](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L645)

___

#### addPointCloudModel

▸ **addPointCloudModel**(`options`): `Promise`<[CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd)\>

Add a new pointcloud 3D model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](#fitcameratomodel) to see the model after the model has loaded.

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

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [AddModelOptions](#interfaces_cognite_revealaddmodeloptionsmd) |

##### Returns

`Promise`<[CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd)\>

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:540](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L540)

___

#### addUiObject

▸ **addUiObject**(`object`, `screenPos`, `size`): `void`

Add an object that will be considered a UI object. It will be rendered in the last stage and with orthographic projection.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `object` | `Object3D` |  |
| `screenPos` | `Vector2` | Screen space position of object (in pixels). |
| `size` | `Vector2` | Pixel width and height of the object. |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:685](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L685)

___

#### determineModelType

▸ **determineModelType**(`modelId`, `revisionId`): `Promise`<``""`` \| [SupportedModelTypes](#supportedmodeltypes)\>

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

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `modelId` | `number` | The model's id. |
| `revisionId` | `number` | The model's revision id. |

##### Returns

`Promise`<``""`` \| [SupportedModelTypes](#supportedmodeltypes)\>

Empty string if type is not supported.

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:622](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L622)

___

#### disableKeyboardNavigation

▸ **disableKeyboardNavigation**(): `void`

Disables camera movement by pressing WASM or arrows keys.

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:959](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L959)

___

#### dispose

▸ **dispose**(): `void`

Dispose of WebGL resources. Can be used to free up memory when the viewer is no longer in use.

**`see`** [https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects](https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects)
```ts
// Viewer is no longer in use, free up memory
viewer.dispose();
```.

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:290](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L290)

___

#### enableKeyboardNavigation

▸ **enableKeyboardNavigation**(): `void`

Allows to move camera with WASM or arrows keys.

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:952](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L952)

___

#### fitCameraToBoundingBox

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

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `box` | `Box3` | `undefined` | The bounding box in world space. |
| `duration?` | `number` | `undefined` | The duration of the animation moving the camera. Set this to 0 (zero) to disable animation. |
| `radiusFactor` | `number` | 2 | The ratio of the distance from camera to center of box and radius of the box. |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:922](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L922)

___

#### fitCameraToModel

▸ **fitCameraToModel**(`model`, `duration?`): `void`

Move camera to a place where the 3D model is visible.
It uses the bounding box of the 3D model and calls [Cognite3DViewer.fitCameraToBoundingBox](#fitcameratoboundingbox).

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

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `model` | [CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd) | The 3D model. |
| `duration?` | `number` | The duration of the animation moving the camera. Set this to 0 (zero) to disable animation. |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:898](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L898)

___

#### requestRedraw

▸ **requestRedraw**(): `void`

Typically used when you perform some changes and can't see them unless you move camera.
To fix this requestRedraw might be used.

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:945](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L945)

___

#### getCamera

▸ **getCamera**(): `PerspectiveCamera`

**`obvious`**

##### Returns

`PerspectiveCamera`

The THREE.Camera used for rendering.

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:760](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L760)

___

#### getCameraPosition

▸ **getCameraPosition**(): `Vector3`

**`obvious`**

##### Returns

`Vector3`

Camera's position in world space.

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:776](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L776)

___

#### getCameraTarget

▸ **getCameraTarget**(): `Vector3`

**`obvious`**

##### Returns

`Vector3`

Camera's target in world space.

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:787](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L787)

___

#### getIntersectionFromPixel

▸ **getIntersectionFromPixel**(`offsetX`, `offsetY`, `options?`): `Promise`<``null`` \| [Intersection](#intersection)\>

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

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `offsetX` | `number` | X coordinate in pixels (relative to the domElement). |
| `offsetY` | `number` | Y coordinate in pixels (relative to the domElement). |
| `options?` | [IntersectionFromPixelOptions](#interfaces_cognite_revealintersectionfrompixeloptionsmd) | Options to control the behaviour of the intersection operation. Optional (new in 1.3.0). |

##### Returns

`Promise`<``null`` \| [Intersection](#intersection)\>

A promise that if there was an intersection then return the intersection object - otherwise it
         returns `null` if there were no intersections.

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:1088](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L1088)

___

#### getScene

▸ **getScene**(): `Scene`

**`obvious`**

##### Returns

`Scene`

The THREE.Scene used for rendering.

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:768](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L768)

___

#### getScreenshot

▸ **getScreenshot**(`width?`, `height?`): `Promise`<string\>

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

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `width` | `number` | Width of the final image. Default is current canvas size. |
| `height` | `number` | Height of the final image. Default is current canvas size. |

##### Returns

`Promise`<string\>

A [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) of the image ('image/png').

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:1030](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L1030)

___

#### getVersion

▸ **getVersion**(): `string`

Returns reveal version installed.

##### Returns

`string`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:278](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L278)

___

#### getViewState

▸ **getViewState**(): `ViewerState`

Gets the current viewer state which includes the camera pose as well as applied styling.

##### Returns

`ViewerState`

JSON object containing viewer state.

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:427](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L427)

___

#### loadCameraFromModel

▸ **loadCameraFromModel**(`model`): `void`

Attempts to load the camera settings from the settings stored for the
provided model. See [https://docs.cognite.com/api/v1/#operation/get3DRevision](https://docs.cognite.com/api/v1/#operation/get3DRevision)
and [https://docs.cognite.com/api/v1/#operation/update3DRevisions](https://docs.cognite.com/api/v1/#operation/update3DRevisions) for
information on how this setting is retrieved and stored. This setting can
also be changed through the 3D models management interface in Cognite Fusion.
If no camera configuration is stored in CDF, [Cognite3DViewer.fitCameraToModel](#fitcameratomodel)
is used as a fallback.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `model` | [CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd) | The model to load camera settings from. |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:870](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L870)

___

#### off

▸ **off**(`event`, `callback`): `void`

**`example`**
```js
viewer.off('click', onClick);
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"click"`` \| ``"hover"`` |
| `callback` | [PointerEventDelegate](#pointereventdelegate) |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:385](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L385)

▸ **off**(`event`, `callback`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` |
| `callback` | [CameraChangeDelegate](#camerachangedelegate) |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:386](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L386)

▸ **off**(`event`, `callback`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"sceneRendered"`` |
| `callback` | [SceneRenderedDelegate](#scenerendereddelegate) |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:387](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L387)

▸ **off**(`event`, `callback`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `callback` | [DisposedDelegate](#disposeddelegate) |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:388](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L388)

___

#### on

▸ **on**(`event`, `callback`): `void`

Triggered when the viewer is disposed. Listeners should clean up any
resources held and remove the reference to the viewer.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `callback` | [DisposedDelegate](#disposeddelegate) |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:318](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L318)

▸ **on**(`event`, `callback`): `void`

**`example`**
```js
const onClick = (event) => { console.log(event.offsetX, event.offsetY) };
viewer.on('click', onClick);
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"click"`` \| ``"hover"`` |
| `callback` | [PointerEventDelegate](#pointereventdelegate) |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:327](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L327)

▸ **on**(`event`, `callback`): `void`

**`example`**
```js
viewer.on('cameraChange', (position, target) => {
  console.log('Camera changed: ', position, target);
});
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` |
| `callback` | [CameraChangeDelegate](#camerachangedelegate) |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:336](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L336)

▸ **on**(`event`, `callback`): `void`

Event that is triggered immediatly after the scene has been rendered.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"sceneRendered"`` | Metadata about the rendering frame. |
| `callback` | [SceneRenderedDelegate](#scenerendereddelegate) | Callback to trigger when the event occurs. |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:342](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L342)

___

#### removeModel

▸ **removeModel**(`model`): `void`

Removes a model that was previously added using [Cognite3DViewer.addModel](#addmodel),
[Cognite3DViewer.addCadModel](#addcadmodel) or [Cognite3DViewer.addPointCloudModel](#addpointcloudmodel)
.

##### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) \| [CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd) |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:571](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L571)

___

#### removeObject3D

▸ **removeObject3D**(`object`): `void`

Remove a THREE.Object3D from the viewer.

**`example`**
```js
const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(), new THREE.MeshBasicMaterial());
viewer.addObject3D(sphere);
viewer.removeObject3D(sphere);
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `Object3D` |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:666](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L666)

___

#### removeUiObject

▸ **removeUiObject**(`object`): `void`

Removes the UI object from the viewer.

##### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `Object3D` |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:694](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L694)

___

#### setBackgroundColor

▸ **setBackgroundColor**(`color`): `void`

Sets the color used as the clear color of the renderer.

##### Parameters

| Name | Type |
| :------ | :------ |
| `color` | `Color` |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:704](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L704)

___

#### setCameraPosition

▸ **setCameraPosition**(`position`): `void`

**`obvious`**

**`example`**
```js
// store position, target
const position = viewer.getCameraPosition();
const target = viewer.getCameraTarget();
// restore position, target
viewer.setCameraPosition(position);
viewer.setCameraTarget(target);
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `position` | `Vector3` | Position in world space. |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:807](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L807)

___

#### setCameraTarget

▸ **setCameraTarget**(`target`): `void`

Set camera's target.

**`example`**
```js
// store position, target
const position = viewer.getCameraPosition();
const target = viewer.getCameraTarget();
// restore position, target
viewer.setCameraPosition(position);
viewer.setCameraTarget(target);
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `Vector3` | Target in world space. |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:828](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L828)

___

#### setSlicingPlanes

▸ **setSlicingPlanes**(`slicingPlanes`): `void`

Sets per-pixel slicing planes. Pixels behind any of the planes will be sliced away.

**`example`**
```js
// Hide pixels with values less than 0 in the x direction
const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
viewer.setSlicingPlanes([plane]);
```
```js
// Hide pixels with values greater than 20 in the x direction
 const plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 20);
viewer.setSlicingPlanes([plane]);
```
```js
// Hide pixels with values less than 0 in the x direction or greater than 0 in the y direction
const xPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
const yPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
viewer.setSlicingPlanes([xPlane, yPlane]);
```
```js
// Hide pixels behind an arbitrary, non axis-aligned plane
 const plane = new THREE.Plane(new THREE.Vector3(1.5, 20, -19), 20);
viewer.setSlicingPlanes([plane]);
```
```js
// Disable slicing planes
 viewer.setSlicingPlanes([]);
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `slicingPlanes` | `Plane`[] | The planes to use for slicing. |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:742](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L742)

___

#### setViewState

▸ **setViewState**(`state`): `void`

Restores camera settings from the state provided, and clears all current styled
node collections and applies the `state` object.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | `ViewerState` | Viewer state retrieved from [Cognite3DViewer.getViewState](#getviewstate). |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:436](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L436)

___

#### worldToScreen

▸ **worldToScreen**(`point`, `normalize?`): ``null`` \| `Vector2`

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

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `point` | `Vector3` | World space coordinate. |
| `normalize?` | `boolean` | Optional. If true, coordinates are normalized into [0,1]. If false, the values are in the range [0, <canvas_size>). |

##### Returns

``null`` \| `Vector2`

Returns 2D coordinates if the point is visible on screen, or `null` if object is outside screen.

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:997](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L997)

___

#### isBrowserSupported

▸ `Static` **isBrowserSupported**(): ``true``

For now it just always returns true.

**`see`** Https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#Browser_compatibility.

##### Returns

``true``

##### Defined in

[viewer/src/public/migration/Cognite3DViewer.ts:83](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/Cognite3DViewer.ts#L83)


<a name="classes_cognite_revealcognitepointcloudmodelmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / CognitePointCloudModel

## Class: CognitePointCloudModel

[@cognite/reveal](#modules_cognite_revealmd).CognitePointCloudModel

### Hierarchy

- `Object3D`

  ↳ **CognitePointCloudModel**

### Implements

- [CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd)

### Table of contents

#### Properties

- [modelId](#modelid)
- [revisionId](#revisionid)
- [type](#type)

#### Accessors

- [pointBudget](#pointbudget)
- [pointColorType](#pointcolortype)
- [pointShape](#pointshape)
- [pointSize](#pointsize)

#### Methods

- [dispose](#dispose)
- [getCameraConfiguration](#getcameraconfiguration)
- [getClasses](#getclasses)
- [getModelBoundingBox](#getmodelboundingbox)
- [getModelTransformation](#getmodeltransformation)
- [hasClass](#hasclass)
- [isClassVisible](#isclassvisible)
- [setClassVisible](#setclassvisible)
- [setModelTransformation](#setmodeltransformation)

### Properties

#### modelId

• `Readonly` **modelId**: `number`

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:19](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L19)

___

#### revisionId

• `Readonly` **revisionId**: `number`

The modelId of the point cloud model in Cognite Data Fusion.

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:23](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L23)

___

#### type

• `Readonly` **type**: [SupportedModelTypes](#supportedmodeltypes) = 'pointcloud'

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[type](#type)

##### Overrides

THREE.Object3D.type

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:18](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L18)

### Accessors

#### pointBudget

• `get` **pointBudget**(): `number`

Returns the current budget measured in number of points.

##### Returns

`number`

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:139](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L139)

• `set` **pointBudget**(`count`): `void`

The point budget limits the number of points loaded and rendered at any given time,
which helps to adapt performance requirements to the capabilities of different hardware.
Recommended values are between 500.000  and 10.000.000.

##### Parameters

| Name | Type |
| :------ | :------ |
| `count` | `number` |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:148](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L148)

___

#### pointColorType

• `get` **pointColorType**(): [PotreePointColorType](#enums_cognite_revealpotreepointcolortypemd)

Determines how points currently are colored.

##### Returns

[PotreePointColorType](#enums_cognite_revealpotreepointcolortypemd)

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:155](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L155)

• `set` **pointColorType**(`type`): `void`

Specifies how points are colored.

**`default`** PotreePointColorType.Rgb

**`example`**
```js
model.pointColorType = PotreePointColorType.Rgb
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [PotreePointColorType](#enums_cognite_revealpotreepointcolortypemd) |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:167](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L167)

___

#### pointShape

• `get` **pointShape**(): [PotreePointShape](#enums_cognite_revealpotreepointshapemd)

Sets the point shape of each rendered point in the point cloud.

**`default`** `PotreePointShape.Circle`

**`see`** [PotreePointShape](#enums_cognite_revealpotreepointshapemd).

##### Returns

[PotreePointShape](#enums_cognite_revealpotreepointshapemd)

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:191](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L191)

• `set` **pointShape**(`shape`): `void`

Gets the point shape of each rendered point in the point cloud.

**`see`** [PotreePointShape](#enums_cognite_revealpotreepointshapemd).

##### Parameters

| Name | Type |
| :------ | :------ |
| `shape` | [PotreePointShape](#enums_cognite_revealpotreepointshapemd) |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:199](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L199)

___

#### pointSize

• `get` **pointSize**(): `number`

Returns the size of each rendered point in the point cloud.

##### Returns

`number`

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:174](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L174)

• `set` **pointSize**(`size`): `void`

Sets the size of each rendered point in the point cloud.

**`default`** `1`

##### Parameters

| Name | Type |
| :------ | :------ |
| `size` | `number` |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:182](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L182)

### Methods

#### dispose

▸ **dispose**(): `void`

Used to clean up memory.

##### Returns

`void`

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[dispose](#dispose)

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:48](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L48)

___

#### getCameraConfiguration

▸ **getCameraConfiguration**(): `undefined` \| [CameraConfiguration](#cameraconfiguration)

Retrieves the camera position and target stored for the model. Typically this
is used to store a good starting position for a model. Returns `undefined` if there
isn't any stored camera configuration for the model.

##### Returns

`undefined` \| [CameraConfiguration](#cameraconfiguration)

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[getCameraConfiguration](#getcameraconfiguration)

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:76](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L76)

___

#### getClasses

▸ **getClasses**(): `number`[]

Returns a list of sorted classification codes present in the model.

##### Returns

`number`[]

A sorted list of classification codes from the model.

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:132](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L132)

___

#### getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`): `Box3`

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

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `outBbox?` | `Box3` | Optional. Used to write result to. |

##### Returns

`Box3`

Model's bounding box.

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[getModelBoundingBox](#getmodelboundingbox)

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:67](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L67)

___

#### getModelTransformation

▸ **getModelTransformation**(`out?`): `Matrix4`

Gets transformation matrix of the model.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `out?` | `Matrix4` | Preallocated `THREE.Matrix4` (optional). |

##### Returns

`Matrix4`

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[getModelTransformation](#getmodeltransformation)

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:92](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L92)

___

#### hasClass

▸ **hasClass**(`pointClass`): `boolean`

Returns true if the model has values with the given classification class.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` | ASPRS classification class code. Either one of the well known classes from [WellKnownAsprsPointClassCodes](#enums_cognite_revealwellknownasprspointclasscodesmd) or a number for user defined classes. |

##### Returns

`boolean`

True if model has values in the class given.

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:124](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L124)

___

#### isClassVisible

▸ **isClassVisible**(`pointClass`): `boolean`

Determines if points from a given class are visible.

**`throws`** Error if the model doesn't have the class given.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` | ASPRS classification class code. Either one of the well known classes from [WellKnownAsprsPointClassCodes](#enums_cognite_revealwellknownasprspointclasscodesmd) or a number for user defined classes. |

##### Returns

`boolean`

True if points from the given class will be visible.

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:114](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L114)

___

#### setClassVisible

▸ **setClassVisible**(`pointClass`, `visible`): `void`

Sets a visible filter on points of a given class.

**`throws`** Error if the model doesn't have the class given.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` | ASPRS classification class code. Either one of the well known classes from [WellKnownAsprsPointClassCodes](#enums_cognite_revealwellknownasprspointclasscodesmd) or a number for user defined classes. |
| `visible` | `boolean` | Boolean flag that determines if the point class type should be visible or not. |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:103](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L103)

___

#### setModelTransformation

▸ **setModelTransformation**(`transformationMatrix`): `void`

Sets transformation matrix of the model. This overrides the current transformation.

##### Parameters

| Name | Type |
| :------ | :------ |
| `transformationMatrix` | `Matrix4` |

##### Returns

`void`

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[setModelTransformation](#setmodeltransformation)

##### Defined in

[viewer/src/public/migration/CognitePointCloudModel.ts:84](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CognitePointCloudModel.ts#L84)


<a name="classes_cognite_revealindexsetmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / IndexSet

## Class: IndexSet

[@cognite/reveal](#modules_cognite_revealmd).IndexSet

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [rootNode](#rootnode)

#### Accessors

- [count](#count)

#### Methods

- [add](#add)
- [addRange](#addrange)
- [clear](#clear)
- [clone](#clone)
- [contains](#contains)
- [differenceWith](#differencewith)
- [forEachRange](#foreachrange)
- [hasIntersectionWith](#hasintersectionwith)
- [intersectWith](#intersectwith)
- [invertedRanges](#invertedranges)
- [remove](#remove)
- [removeRange](#removerange)
- [toIndexArray](#toindexarray)
- [toPlainSet](#toplainset)
- [toRangeArray](#torangearray)
- [unionWith](#unionwith)

### Constructors

#### constructor

• **new IndexSet**(`values?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `values?` | `Iterable`<number\> |

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:11](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L11)

• **new IndexSet**(`values?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `values?` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:13](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L13)

### Properties

#### rootNode

• `Optional` **rootNode**: `IndexNode`

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:11](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L11)

### Accessors

#### count

• `get` **count**(): `number`

##### Returns

`number`

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:68](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L68)

### Methods

#### add

▸ **add**(`index`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

##### Returns

`void`

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:33](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L33)

___

#### addRange

▸ **addRange**(`range`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

`void`

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:39](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L39)

___

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:201](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L201)

___

#### clone

▸ **clone**(): [IndexSet](#classes_cognite_revealindexsetmd)

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:205](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L205)

___

#### contains

▸ **contains**(`index`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

##### Returns

`boolean`

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:60](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L60)

___

#### differenceWith

▸ **differenceWith**(`otherSet`): [IndexSet](#classes_cognite_revealindexsetmd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [IndexSet](#classes_cognite_revealindexsetmd) |

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:133](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L133)

___

#### forEachRange

▸ **forEachRange**(`visitor`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `visitor` | (`range`: [NumericRange](#classes_cognite_revealnumericrangemd)) => `void` |

##### Returns

`void`

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:27](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L27)

___

#### hasIntersectionWith

▸ **hasIntersectionWith**(`otherSet`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [IndexSet](#classes_cognite_revealindexsetmd) \| `Set`<number\> |

##### Returns

`boolean`

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:143](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L143)

___

#### intersectWith

▸ **intersectWith**(`otherSet`): [IndexSet](#classes_cognite_revealindexsetmd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [IndexSet](#classes_cognite_revealindexsetmd) |

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:161](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L161)

___

#### invertedRanges

▸ **invertedRanges**(): [NumericRange](#classes_cognite_revealnumericrangemd)[]

##### Returns

[NumericRange](#classes_cognite_revealnumericrangemd)[]

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:105](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L105)

___

#### remove

▸ **remove**(`index`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

##### Returns

`void`

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:47](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L47)

___

#### removeRange

▸ **removeRange**(`range`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

`void`

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:52](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L52)

___

#### toIndexArray

▸ **toIndexArray**(): `number`[]

##### Returns

`number`[]

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:84](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L84)

___

#### toPlainSet

▸ **toPlainSet**(): `Set`<number\>

##### Returns

`Set`<number\>

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:98](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L98)

___

#### toRangeArray

▸ **toRangeArray**(): [NumericRange](#classes_cognite_revealnumericrangemd)[]

##### Returns

[NumericRange](#classes_cognite_revealnumericrangemd)[]

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:76](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L76)

___

#### unionWith

▸ **unionWith**(`otherSet`): [IndexSet](#classes_cognite_revealindexsetmd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [IndexSet](#classes_cognite_revealindexsetmd) |

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Defined in

[viewer/src/utilities/indexset/IndexSet.ts:121](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/indexset/IndexSet.ts#L121)


<a name="classes_cognite_revealintersectionnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / IntersectionNodeCollection

## Class: IntersectionNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).IntersectionNodeCollection

Node collection that is the intersection between a set of underlying node collections.

### Hierarchy

- `CombineNodeCollectionBase`

  ↳ **IntersectionNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken)
- [isLoading](#isloading)

#### Methods

- [add](#add)
- [clear](#clear)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [remove](#remove)
- [serialize](#serialize)

### Constructors

#### constructor

• **new IntersectionNodeCollection**(`nodeCollections?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollections?` | [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd)[] |

##### Overrides

CombineNodeCollectionBase.constructor

##### Defined in

[viewer/src/datamodels/cad/styling/IntersectionNodeCollection.ts:14](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/IntersectionNodeCollection.ts#L14)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"IntersectionNodeCollection"``

##### Defined in

[viewer/src/datamodels/cad/styling/IntersectionNodeCollection.ts:14](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/IntersectionNodeCollection.ts#L14)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L26)

___

#### isLoading

• `get` **isLoading**(): `boolean`

**`override`**

##### Returns

`boolean`

##### Defined in

[viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts:65](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts#L65)

### Methods

#### add

▸ **add**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd) |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.add

##### Defined in

[viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts:24](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts#L24)

___

#### clear

▸ **clear**(): `void`

Clears all underlying node collections.

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.clear

##### Defined in

[viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts:44](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts#L44)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

**`override`**

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Inherited from

CombineNodeCollectionBase.getIndexSet

##### Defined in

[viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts:57](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts#L57)

___

#### off

▸ **off**(`event`, `listener`): `void`

Unsubscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.off

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:43](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L43)

___

#### on

▸ **on**(`event`, `listener`): `void`

Subscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.on

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:34](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L34)

___

#### remove

▸ **remove**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd) |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.remove

##### Defined in

[viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts:30](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts#L30)

___

#### serialize

▸ **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Overrides

CombineNodeCollectionBase.serialize

##### Defined in

[viewer/src/datamodels/cad/styling/IntersectionNodeCollection.ts:20](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/IntersectionNodeCollection.ts#L20)


<a name="classes_cognite_revealinvertednodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / InvertedNodeCollection

## Class: InvertedNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).InvertedNodeCollection

Node collection that inverts the result from another node collection.

### Hierarchy

- [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd)

  ↳ **InvertedNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken)
- [isLoading](#isloading)

#### Methods

- [clear](#clear)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [serialize](#serialize)

### Constructors

#### constructor

• **new InvertedNodeCollection**(`model`, `innerSet`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) |
| `innerSet` | [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd) |

##### Overrides

NodeCollectionBase.constructor

##### Defined in

[viewer/src/datamodels/cad/styling/InvertedNodeCollection.ts:17](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/InvertedNodeCollection.ts#L17)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"InvertedNodeCollection"``

##### Defined in

[viewer/src/datamodels/cad/styling/InvertedNodeCollection.ts:13](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/InvertedNodeCollection.ts#L13)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L26)

___

#### isLoading

• `get` **isLoading**(): `boolean`

Returns true when the set currently is running an operation
for loading the full set of nodes contained by the set.

##### Returns

`boolean`

##### Defined in

[viewer/src/datamodels/cad/styling/InvertedNodeCollection.ts:30](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/InvertedNodeCollection.ts#L30)

### Methods

#### clear

▸ **clear**(): `void`

Not supported.

**`throws`** Always throws an error.

##### Returns

`void`

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[clear](#clear)

##### Defined in

[viewer/src/datamodels/cad/styling/InvertedNodeCollection.ts:52](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/InvertedNodeCollection.ts#L52)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[getIndexSet](#getindexset)

##### Defined in

[viewer/src/datamodels/cad/styling/InvertedNodeCollection.ts:34](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/InvertedNodeCollection.ts#L34)

___

#### off

▸ **off**(`event`, `listener`): `void`

Unsubscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[off](#off)

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:43](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L43)

___

#### on

▸ **on**(`event`, `listener`): `void`

Subscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[on](#on)

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:34](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L34)

___

#### serialize

▸ **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[serialize](#serialize)

##### Defined in

[viewer/src/datamodels/cad/styling/InvertedNodeCollection.ts:45](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/InvertedNodeCollection.ts#L45)


<a name="classes_cognite_revealnodeappearanceprovidermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / NodeAppearanceProvider

## Class: NodeAppearanceProvider

[@cognite/reveal](#modules_cognite_revealmd).NodeAppearanceProvider

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Accessors

- [isLoading](#isloading)

#### Methods

- [applyStyles](#applystyles)
- [assignStyledNodeCollection](#assignstylednodecollection)
- [clear](#clear)
- [off](#off)
- [on](#on)
- [unassignStyledNodeCollection](#unassignstylednodecollection)

### Constructors

#### constructor

• **new NodeAppearanceProvider**()

### Accessors

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts:113](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts#L113)

### Methods

#### applyStyles

▸ **applyStyles**(`applyCb`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `applyCb` | `ApplyStyleDelegate` |

##### Returns

`void`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts:97](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts#L97)

___

#### assignStyledNodeCollection

▸ **assignStyledNodeCollection**(`nodeCollection`, `appearance`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd) |
| `appearance` | [NodeAppearance](#nodeappearance) |

##### Returns

`void`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts:65](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts#L65)

___

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts:104](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts#L104)

___

#### off

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts:49](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts#L49)

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"loadingStateChanged"`` |
| `listener` | (`isLoading`: `boolean`) => `void` |

##### Returns

`void`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts:50](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts#L50)

___

#### on

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts:33](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts#L33)

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"loadingStateChanged"`` |
| `listener` | (`isLoading`: `boolean`) => `void` |

##### Returns

`void`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts:34](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts#L34)

___

#### unassignStyledNodeCollection

▸ **unassignStyledNodeCollection**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd) |

##### Returns

`void`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts:85](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeAppearanceProvider.ts#L85)


<a name="classes_cognite_revealnodecollectionbasemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / NodeCollectionBase

## Class: NodeCollectionBase

[@cognite/reveal](#modules_cognite_revealmd).NodeCollectionBase

Abstract class for implementing a set of nodes to be styled.

### Hierarchy

- **NodeCollectionBase**

  ↳ [PropertyFilterNodeCollection](#classes_cognite_revealpropertyfilternodecollectionmd)

  ↳ [SinglePropertyFilterNodeCollection](#classes_cognite_revealsinglepropertyfilternodecollectionmd)

  ↳ [TreeIndexNodeCollection](#classes_cognite_revealtreeindexnodecollectionmd)

  ↳ [AssetNodeCollection](#classes_cognite_revealassetnodecollectionmd)

  ↳ [InvertedNodeCollection](#classes_cognite_revealinvertednodecollectionmd)

### Table of contents

#### Accessors

- [classToken](#classtoken)
- [isLoading](#isloading)

#### Methods

- [clear](#clear)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [serialize](#serialize)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L26)

___

#### isLoading

• `Abstract` `get` **isLoading**(): `boolean`

Returns true when the set currently is running an operation
for loading the full set of nodes contained by the set.

##### Returns

`boolean`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:52](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L52)

### Methods

#### clear

▸ `Abstract` **clear**(): `void`

Clears the set, making it empty.

##### Returns

`void`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:62](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L62)

___

#### getIndexSet

▸ `Abstract` **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

Returns the [IndexSet](#classes_cognite_revealindexsetmd) that holds the tree indices
of the nodes contained by the set.

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:57](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L57)

___

#### off

▸ **off**(`event`, `listener`): `void`

Unsubscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:43](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L43)

___

#### on

▸ **on**(`event`, `listener`): `void`

Subscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:34](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L34)

___

#### serialize

▸ `Abstract` **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:71](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L71)


<a name="classes_cognite_revealnotsupportedinmigrationwrappererrormd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / NotSupportedInMigrationWrapperError

## Class: NotSupportedInMigrationWrapperError

[@cognite/reveal](#modules_cognite_revealmd).NotSupportedInMigrationWrapperError

### Hierarchy

- `Error`

  ↳ **NotSupportedInMigrationWrapperError**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [message](#message)
- [name](#name)
- [stack](#stack)

### Constructors

#### constructor

• **new NotSupportedInMigrationWrapperError**(`message?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

##### Overrides

Error.constructor

##### Defined in

[viewer/src/public/migration/NotSupportedInMigrationWrapperError.ts:10](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/NotSupportedInMigrationWrapperError.ts#L10)

### Properties

#### message

• **message**: `string`

##### Inherited from

Error.message

##### Defined in

documentation/node_modules/typescript/lib/lib.es5.d.ts:974

___

#### name

• **name**: `string`

##### Inherited from

Error.name

##### Defined in

documentation/node_modules/typescript/lib/lib.es5.d.ts:973

___

#### stack

• `Optional` **stack**: `string`

##### Inherited from

Error.stack

##### Defined in

documentation/node_modules/typescript/lib/lib.es5.d.ts:975


<a name="classes_cognite_revealnumericrangemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / NumericRange

## Class: NumericRange

[@cognite/reveal](#modules_cognite_revealmd).NumericRange

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [count](#count)
- [from](#from)
- [toInclusive](#toinclusive)

#### Methods

- [contains](#contains)
- [equal](#equal)
- [forEach](#foreach)
- [intersectionWith](#intersectionwith)
- [intersects](#intersects)
- [intersectsOrCoinciding](#intersectsorcoinciding)
- [isInside](#isinside)
- [str](#str)
- [toArray](#toarray)
- [union](#union)
- [values](#values)
- [createFromInterval](#createfrominterval)

### Constructors

#### constructor

• **new NumericRange**(`from`, `count`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `from` | `number` |
| `count` | `number` |

##### Defined in

[viewer/src/utilities/NumericRange.ts:8](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L8)

### Properties

#### count

• `Readonly` **count**: `number`

##### Defined in

[viewer/src/utilities/NumericRange.ts:7](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L7)

___

#### from

• `Readonly` **from**: `number`

##### Defined in

[viewer/src/utilities/NumericRange.ts:6](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L6)

___

#### toInclusive

• `Readonly` **toInclusive**: `number`

##### Defined in

[viewer/src/utilities/NumericRange.ts:8](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L8)

### Methods

#### contains

▸ **contains**(`value`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

##### Returns

`boolean`

##### Defined in

[viewer/src/utilities/NumericRange.ts:38](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L38)

___

#### equal

▸ **equal**(`other`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `other` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

`boolean`

##### Defined in

[viewer/src/utilities/NumericRange.ts:34](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L34)

___

#### forEach

▸ **forEach**(`action`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `action` | (`value`: `number`) => `void` |

##### Returns

`void`

##### Defined in

[viewer/src/utilities/NumericRange.ts:72](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L72)

___

#### intersectionWith

▸ **intersectionWith**(`range`): `undefined` \| [NumericRange](#classes_cognite_revealnumericrangemd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

`undefined` \| [NumericRange](#classes_cognite_revealnumericrangemd)

##### Defined in

[viewer/src/utilities/NumericRange.ts:50](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L50)

___

#### intersects

▸ **intersects**(`range`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

`boolean`

##### Defined in

[viewer/src/utilities/NumericRange.ts:42](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L42)

___

#### intersectsOrCoinciding

▸ **intersectsOrCoinciding**(`range`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

`boolean`

##### Defined in

[viewer/src/utilities/NumericRange.ts:46](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L46)

___

#### isInside

▸ **isInside**(`range`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

`boolean`

##### Defined in

[viewer/src/utilities/NumericRange.ts:61](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L61)

___

#### str

▸ **str**(): `string`

##### Returns

`string`

##### Defined in

[viewer/src/utilities/NumericRange.ts:78](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L78)

___

#### toArray

▸ **toArray**(): `number`[]

##### Returns

`number`[]

##### Defined in

[viewer/src/utilities/NumericRange.ts:30](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L30)

___

#### union

▸ **union**(`range`): [NumericRange](#classes_cognite_revealnumericrangemd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

[NumericRange](#classes_cognite_revealnumericrangemd)

##### Defined in

[viewer/src/utilities/NumericRange.ts:65](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L65)

___

#### values

▸ **values**(): `Generator`<number, any, unknown\>

##### Returns

`Generator`<number, any, unknown\>

##### Defined in

[viewer/src/utilities/NumericRange.ts:24](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L24)

___

#### createFromInterval

▸ `Static` **createFromInterval**(`from`, `toInclusive`): [NumericRange](#classes_cognite_revealnumericrangemd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `from` | `number` |
| `toInclusive` | `number` |

##### Returns

[NumericRange](#classes_cognite_revealnumericrangemd)

##### Defined in

[viewer/src/utilities/NumericRange.ts:20](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/NumericRange.ts#L20)


<a name="classes_cognite_revealpropertyfilternodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / PropertyFilterNodeCollection

## Class: PropertyFilterNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).PropertyFilterNodeCollection

Represents a set of nodes that has matching node properties to a provided filter. Note that
a node is considered to match if it or a [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd) ancestors match the filter.

### Hierarchy

- [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd)

  ↳ **PropertyFilterNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken)
- [isLoading](#isloading)

#### Methods

- [clear](#clear)
- [executeFilter](#executefilter)
- [getFilter](#getfilter)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [serialize](#serialize)

### Constructors

#### constructor

• **new PropertyFilterNodeCollection**(`client`, `model`, `options?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `client` | `default` |
| `model` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) |
| `options` | `PropertyFilterNodeCollectionOptions` |

##### Overrides

NodeCollectionBase.constructor

##### Defined in

[viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts:42](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts#L42)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"PropertyFilterNodeCollection"``

##### Defined in

[viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts:34](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts#L34)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L26)

___

#### isLoading

• `get` **isLoading**(): `boolean`

Returns true when the set currently is running an operation
for loading the full set of nodes contained by the set.

##### Returns

`boolean`

##### Defined in

[viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts:52](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts#L52)

### Methods

#### clear

▸ **clear**(): `void`

Clears the node collection and interrupts any ongoing operations.

##### Returns

`void`

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[clear](#clear)

##### Defined in

[viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts:107](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts#L107)

___

#### executeFilter

▸ **executeFilter**(`filter`): `Promise`<void\>

Populates the node collection with nodes matching the provided filter. This will replace
the current nodes held by the filter.

**`example`**
```
set.executeFilter({ 'PDMS': { 'Module': 'AQ550' }});
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | `Object` | A filter for matching node properties. |

##### Returns

`Promise`<void\>

##### Defined in

[viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts:65](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts#L65)

___

#### getFilter

▸ **getFilter**(): `Object`

##### Returns

`Object`

##### Defined in

[viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts:101](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts#L101)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[getIndexSet](#getindexset)

##### Defined in

[viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts:115](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts#L115)

___

#### off

▸ **off**(`event`, `listener`): `void`

Unsubscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[off](#off)

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:43](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L43)

___

#### on

▸ **on**(`event`, `listener`): `void`

Subscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[on](#on)

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:34](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L34)

___

#### serialize

▸ **serialize**(): `Object`

##### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `options` | `Object` |
| `options.requestPartitions` | `number` |
| `state` | `Object` |
| `token` | `string` |

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[serialize](#serialize)

##### Defined in

[viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts:119](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/PropertyFilterNodeCollection.ts#L119)


<a name="classes_cognite_revealsinglepropertyfilternodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / SinglePropertyFilterNodeCollection

## Class: SinglePropertyFilterNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).SinglePropertyFilterNodeCollection

Node collection that filters nodes based on a node property from a list of values, similarly to how
`SELECT ... IN (...)` works. This is useful when looking up nodes based on a list of identifiers,
nodes within a set of areas or systems. The node set is optimized for matching with properties with
a large number of values (i.e. thousands).

**`experimental`** This is an experimental feature that might be changed or removed, and changes
in minor releases might cause breaking changes.

### Hierarchy

- [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd)

  ↳ **SinglePropertyFilterNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken)
- [isLoading](#isloading)

#### Methods

- [clear](#clear)
- [executeFilter](#executefilter)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [serialize](#serialize)

### Constructors

#### constructor

• **new SinglePropertyFilterNodeCollection**(`client`, `model`, `options?`)

Construct a new node set.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `default` | {@link CogniteClient} authenticated to the project the model is loaded from. |
| `model` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) | CAD model. |
| `options` | `PropertyFilterNodeCollectionOptions` |  |

##### Overrides

NodeCollectionBase.constructor

##### Defined in

[viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts:39](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts#L39)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"SinglePropertyNodeCollection"``

##### Defined in

[viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts#L27)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L26)

___

#### isLoading

• `get` **isLoading**(): `boolean`

Returns true when the set currently is running an operation
for loading the full set of nodes contained by the set.

##### Returns

`boolean`

##### Defined in

[viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts:54](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts#L54)

### Methods

#### clear

▸ **clear**(): `void`

Clears the node set and interrupts any ongoing operations.

##### Returns

`void`

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[clear](#clear)

##### Defined in

[viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts:109](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts#L109)

___

#### executeFilter

▸ **executeFilter**(`propertyCategory`, `propertyKey`, `propertyValues`): `Promise`<void\>

Execute filter asynchronously, replacing any existing filter active. When {@link propertyValues}
contains more than 1000 elements, the operation will be split into multiple batches that
are executed in parallel. Note that when providing a {@link PropertyFilterNodeCollectionOptions.requestPartitions}
during construction of the node set, the total number of batches will be requestPartitions*numberOfBatches.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `propertyCategory` | `string` | Node property category, e.g. `'PDMS'`. |
| `propertyKey` | `string` | Node property key, e.g. `':FU'`. |
| `propertyValues` | `string`[] | Lookup values, e.g. `["AR100APG539","AP500INF534","AP400INF553", ...]` |

##### Returns

`Promise`<void\>

##### Defined in

[viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts:68](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts#L68)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[getIndexSet](#getindexset)

##### Defined in

[viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts:117](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts#L117)

___

#### off

▸ **off**(`event`, `listener`): `void`

Unsubscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[off](#off)

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:43](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L43)

___

#### on

▸ **on**(`event`, `listener`): `void`

Subscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[on](#on)

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:34](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L34)

___

#### serialize

▸ **serialize**(): `Object`

##### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `options` | `Object` |
| `options.requestPartitions` | `number` |
| `state` | `Object` |
| `state.propertyCategory` | `string` |
| `state.propertyKey` | `string` |
| `state.propertyValues` | `string`[] |
| `token` | `string` |

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[serialize](#serialize)

##### Defined in

[viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts:127](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/SinglePropertyFilterNodeCollection.ts#L127)


<a name="classes_cognite_revealtreeindexnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / TreeIndexNodeCollection

## Class: TreeIndexNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).TreeIndexNodeCollection

Node collection that holds a set of nodes defined by a set of tree indices.

### Hierarchy

- [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd)

  ↳ **TreeIndexNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken)
- [isLoading](#isloading)

#### Methods

- [clear](#clear)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [serialize](#serialize)
- [updateSet](#updateset)

### Constructors

#### constructor

• **new TreeIndexNodeCollection**(`treeIndexSet?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndexSet?` | [IndexSet](#classes_cognite_revealindexsetmd) |

##### Overrides

NodeCollectionBase.constructor

##### Defined in

[viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts:14](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts#L14)

• **new TreeIndexNodeCollection**(`treeIndices?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndices?` | `Iterable`<number\> |

##### Overrides

NodeCollectionBase.constructor

##### Defined in

[viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts:16](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts#L16)

• **new TreeIndexNodeCollection**(`treeIndexRange?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndexRange?` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Overrides

NodeCollectionBase.constructor

##### Defined in

[viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts:17](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts#L17)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"TreeIndexNodeCollection"``

##### Defined in

[viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts:12](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts#L12)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L26)

___

#### isLoading

• `get` **isLoading**(): `boolean`

Returns true when the set currently is running an operation
for loading the full set of nodes contained by the set.

##### Returns

`boolean`

##### Defined in

[viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts:47](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts#L47)

### Methods

#### clear

▸ **clear**(): `void`

Sets this set to hold an empty set.

##### Returns

`void`

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[clear](#clear)

##### Defined in

[viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts:38](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts#L38)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[getIndexSet](#getindexset)

##### Defined in

[viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts:43](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts#L43)

___

#### off

▸ **off**(`event`, `listener`): `void`

Unsubscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[off](#off)

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:43](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L43)

___

#### on

▸ **on**(`event`, `listener`): `void`

Subscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[on](#on)

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:34](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L34)

___

#### serialize

▸ **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Overrides

[NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd).[serialize](#serialize)

##### Defined in

[viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts:51](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts#L51)

___

#### updateSet

▸ **updateSet**(`treeIndices`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndices` | [IndexSet](#classes_cognite_revealindexsetmd) |

##### Returns

`void`

##### Defined in

[viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts:30](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/TreeIndexNodeCollection.ts#L30)


<a name="classes_cognite_revealunionnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / UnionNodeCollection

## Class: UnionNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).UnionNodeCollection

Node collection that takes the set union of multiple node collections.

### Hierarchy

- `CombineNodeCollectionBase`

  ↳ **UnionNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken)
- [isLoading](#isloading)

#### Methods

- [add](#add)
- [clear](#clear)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [remove](#remove)
- [serialize](#serialize)

### Constructors

#### constructor

• **new UnionNodeCollection**(`nodeCollections?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollections?` | [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd)[] |

##### Overrides

CombineNodeCollectionBase.constructor

##### Defined in

[viewer/src/datamodels/cad/styling/UnionNodeCollection.ts:13](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/UnionNodeCollection.ts#L13)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"UnionNodeCollection"``

##### Defined in

[viewer/src/datamodels/cad/styling/UnionNodeCollection.ts:13](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/UnionNodeCollection.ts#L13)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L26)

___

#### isLoading

• `get` **isLoading**(): `boolean`

**`override`**

##### Returns

`boolean`

##### Defined in

[viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts:65](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts#L65)

### Methods

#### add

▸ **add**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd) |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.add

##### Defined in

[viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts:24](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts#L24)

___

#### clear

▸ **clear**(): `void`

Clears all underlying node collections.

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.clear

##### Defined in

[viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts:44](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts#L44)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

**`override`**

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Inherited from

CombineNodeCollectionBase.getIndexSet

##### Defined in

[viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts:57](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts#L57)

___

#### off

▸ **off**(`event`, `listener`): `void`

Unsubscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.off

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:43](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L43)

___

#### on

▸ **on**(`event`, `listener`): `void`

Subscribe a listener to events about the set changing, i.e.
when nodes are added or removed to the set.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.on

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:34](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L34)

___

#### remove

▸ **remove**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd) |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.remove

##### Defined in

[viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts:30](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/CombineNodeCollectionBase.ts#L30)

___

#### serialize

▸ **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Overrides

CombineNodeCollectionBase.serialize

##### Defined in

[viewer/src/datamodels/cad/styling/UnionNodeCollection.ts:19](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/UnionNodeCollection.ts#L19)


<a name="classes_cognite_reveal_toolsaxisviewtoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / AxisViewTool

## Class: AxisViewTool

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).AxisViewTool

### Hierarchy

- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **AxisViewTool**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [dispose](#dispose)
- [off](#off)

### Constructors

#### constructor

• **new AxisViewTool**(`viewer`, `config?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd) |
| `config?` | [AxisBoxConfig](#axisboxconfig) |

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[viewer/src/tools/AxisView/AxisViewTool.ts:40](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/AxisView/AxisViewTool.ts#L40)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[viewer/src/tools/AxisView/AxisViewTool.ts:62](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/AxisView/AxisViewTool.ts#L62)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[viewer/src/tools/Cognite3DViewerToolBase.ts:38](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/Cognite3DViewerToolBase.ts#L38)


<a name="classes_cognite_reveal_toolscognite3dviewertoolbasemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / Cognite3DViewerToolBase

## Class: Cognite3DViewerToolBase

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).Cognite3DViewerToolBase

Base class for tools attaching to a {@see Cognite3DViewer}.

<a name="classes_cognite_reveal_toolsgeomaptoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / GeomapTool

## Class: GeomapTool

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).GeomapTool

### Hierarchy

- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **GeomapTool**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [dispose](#dispose)
- [off](#off)

### Constructors

#### constructor

• **new GeomapTool**(`viewer`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd) |

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[viewer/src/tools/Geomap/GeomapTool.ts:57](https://github.com/cognitedata/reveal/blob/pramodcog/tools-geomap/viewer/core/src/tools/Geomap/GeomapTool.ts#L57)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[viewer/src/tools/Geomap/GeomapTool.ts:95](https://github.com/cognitedata/reveal/blob/pramodcog/tools-geomap/viewer/core/src/tools/Geomap/GeomapTool.ts#L95)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[viewer/src/tools/Cognite3DViewerToolBase.ts:38](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/Cognite3DViewerToolBase.ts#L38)


<a name="classes_cognite_reveal_toolscognite3dviewertoolbasemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / Cognite3DViewerToolBase

## Class: Cognite3DViewerToolBase

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).Cognite3DViewerToolBase

Base class for tools attaching to a {@see Cognite3DViewer}.

### Hierarchy

- **Cognite3DViewerToolBase**

  ↳ [HtmlOverlayTool](#classes_cognite_reveal_toolshtmloverlaytoolmd)

  ↳ [ExplodedViewTool](#classes_cognite_reveal_toolsexplodedviewtoolmd)

  ↳ [DebugCameraTool](#classes_cognite_reveal_toolsdebugcameratoolmd)

  ↳ [AxisViewTool](#classes_cognite_reveal_toolsaxisviewtoolmd)

  ↳ [GeomapTool](#classes_cognite_reveal_toolsgeomaptoolmd)

  ↳ [DebugLoadedSectorsTool](#classes_cognite_reveal_toolsdebugloadedsectorstoolmd)

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [dispose](#dispose)
- [off](#off)

### Constructors

#### constructor

• **new Cognite3DViewerToolBase**()

### Methods

#### dispose

▸ **dispose**(): `void`

Disposes the element and triggeres the 'disposed' event before clearing the list
of dipose-listeners.

##### Returns

`void`

##### Defined in

[viewer/src/tools/Cognite3DViewerToolBase.ts:53](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/Cognite3DViewerToolBase.ts#L53)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Defined in

[viewer/src/tools/Cognite3DViewerToolBase.ts:38](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/Cognite3DViewerToolBase.ts#L38)


<a name="classes_cognite_reveal_toolsdebugcameratoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / DebugCameraTool

## Class: DebugCameraTool

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).DebugCameraTool

### Hierarchy

- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **DebugCameraTool**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [dispose](#dispose)
- [hideCameraHelper](#hidecamerahelper)
- [off](#off)
- [showCameraHelper](#showcamerahelper)

### Constructors

#### constructor

• **new DebugCameraTool**(`viewer`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd) |

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[viewer/src/tools/DebugCameraTool.ts:18](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/DebugCameraTool.ts#L18)

### Methods

#### dispose

▸ **dispose**(): `void`

Removes all elements and detaches from the viewer.

**`override`**

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[viewer/src/tools/DebugCameraTool.ts:32](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/DebugCameraTool.ts#L32)

___

#### hideCameraHelper

▸ **hideCameraHelper**(): `void`

##### Returns

`void`

##### Defined in

[viewer/src/tools/DebugCameraTool.ts:43](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/DebugCameraTool.ts#L43)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[viewer/src/tools/Cognite3DViewerToolBase.ts:38](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/Cognite3DViewerToolBase.ts#L38)

___

#### showCameraHelper

▸ **showCameraHelper**(): `void`

##### Returns

`void`

##### Defined in

[viewer/src/tools/DebugCameraTool.ts:37](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/DebugCameraTool.ts#L37)


<a name="classes_cognite_reveal_toolsdebugloadedsectorstoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / DebugLoadedSectorsTool

## Class: DebugLoadedSectorsTool

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).DebugLoadedSectorsTool

### Hierarchy

- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **DebugLoadedSectorsTool**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [dispose](#dispose)
- [off](#off)
- [setOptions](#setoptions)
- [showSectorBoundingBoxes](#showsectorboundingboxes)

### Constructors

#### constructor

• **new DebugLoadedSectorsTool**(`viewer`, `options?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd) |
| `options` | [DebugLoadedSectorsToolOptions](#debugloadedsectorstooloptions) |

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[viewer/src/tools/DebugLoadedSectorsTool.ts:27](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/DebugLoadedSectorsTool.ts#L27)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[viewer/src/tools/DebugLoadedSectorsTool.ts:48](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/DebugLoadedSectorsTool.ts#L48)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[viewer/src/tools/Cognite3DViewerToolBase.ts:38](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/Cognite3DViewerToolBase.ts#L38)

___

#### setOptions

▸ **setOptions**(`options`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [DebugLoadedSectorsToolOptions](#debugloadedsectorstooloptions) |

##### Returns

`void`

##### Defined in

[viewer/src/tools/DebugLoadedSectorsTool.ts:37](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/DebugLoadedSectorsTool.ts#L37)

___

#### showSectorBoundingBoxes

▸ **showSectorBoundingBoxes**(`model`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) |

##### Returns

`void`

##### Defined in

[viewer/src/tools/DebugLoadedSectorsTool.ts:52](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/DebugLoadedSectorsTool.ts#L52)


<a name="classes_cognite_reveal_toolsexplodedviewtoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / ExplodedViewTool

## Class: ExplodedViewTool

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).ExplodedViewTool

### Hierarchy

- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **ExplodedViewTool**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Accessors

- [readyPromise](#readypromise)

#### Methods

- [dispose](#dispose)
- [expand](#expand)
- [off](#off)
- [reset](#reset)

### Constructors

#### constructor

• **new ExplodedViewTool**(`treeIndex`, `cadModel`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndex` | `number` |
| `cadModel` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) |

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[viewer/src/tools/ExplodedViewTool.ts:15](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/ExplodedViewTool.ts#L15)

### Accessors

#### readyPromise

• `get` **readyPromise**(): `Promise`<void\>

##### Returns

`Promise`<void\>

##### Defined in

[viewer/src/tools/ExplodedViewTool.ts:13](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/ExplodedViewTool.ts#L13)

### Methods

#### dispose

▸ **dispose**(): `void`

Disposes the element and triggeres the 'disposed' event before clearing the list
of dipose-listeners.

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[viewer/src/tools/Cognite3DViewerToolBase.ts:53](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/Cognite3DViewerToolBase.ts#L53)

___

#### expand

▸ **expand**(`expandRadius`): `Promise`<void\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `expandRadius` | `number` |

##### Returns

`Promise`<void\>

##### Defined in

[viewer/src/tools/ExplodedViewTool.ts:26](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/ExplodedViewTool.ts#L26)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[viewer/src/tools/Cognite3DViewerToolBase.ts:38](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/Cognite3DViewerToolBase.ts#L38)

___

#### reset

▸ **reset**(): `void`

##### Returns

`void`

##### Defined in

[viewer/src/tools/ExplodedViewTool.ts:43](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/ExplodedViewTool.ts#L43)


<a name="classes_cognite_reveal_toolshtmloverlaytoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / HtmlOverlayTool

## Class: HtmlOverlayTool

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).HtmlOverlayTool

Manages HTMLoverlays for {@see Cognite3DViewer}. Attaches HTML elements to a
3D position and updates it's position/visibility as user moves the camera. This is
useful to create HTML overlays to highlight information about key positions in the 3D model.

Attached elements *must* have CSS style 'position: absolute'. It's also recommended
in most cases to have styles 'pointerEvents: none' and 'touchAction: none' to avoid
interfering with 3D navigation. Consider also applying 'transform: translate(-50%, -50%)'
to anchor the center of the element rather than the top-left corner. In some cases the
`zIndex`-attribute is necessary for the element to appear on top of the viewer.

**`example`**
```js
const el = document.createElement('div');
el.style.position = 'absolute'; // Required!
// Anchor to center of element
el.style.transform = 'translate(-50%, -50%)';
// Avoid being target for events
el.style.pointerEvents = 'none;
el.style.touchAction = 'none';
// Render in front of other elements
el.style.zIndex = 10;

el.style.color = 'red';
el.innerHtml = '<h1>Overlay</h1>';

const overlayTool = new HtmlOverlayTool(viewer);
overlayTool.add(el, new THREE.Vector3(10, 10, 10));
// ...
overlayTool.remove(el);
// or, to remove all attached elements
overlayTool.clear();

// detach the tool from the viewer
overlayTool.dispose();
```

### Hierarchy

- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **HtmlOverlayTool**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [add](#add)
- [clear](#clear)
- [dispose](#dispose)
- [forceUpdate](#forceupdate)
- [off](#off)
- [remove](#remove)

### Constructors

#### constructor

• **new HtmlOverlayTool**(`viewer`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd) |

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[viewer/src/tools/HtmlOverlayTool.ts:91](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/HtmlOverlayTool.ts#L91)

### Methods

#### add

▸ **add**(`htmlElement`, `position3D`, `options?`): `void`

Registers a HTML overlay that will be updated on rendering.

##### Parameters

| Name | Type |
| :------ | :------ |
| `htmlElement` | `HTMLElement` |
| `position3D` | `Vector3` |
| `options` | [HtmlOverlayOptions](#htmloverlayoptions) |

##### Returns

`void`

##### Defined in

[viewer/src/tools/HtmlOverlayTool.ts:121](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/HtmlOverlayTool.ts#L121)

___

#### clear

▸ **clear**(): `void`

Removes all attached HTML overlay elements.

##### Returns

`void`

##### Defined in

[viewer/src/tools/HtmlOverlayTool.ts:158](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/HtmlOverlayTool.ts#L158)

___

#### dispose

▸ **dispose**(): `void`

Removes all elements and detaches from the viewer.

**`override`**

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[viewer/src/tools/HtmlOverlayTool.ts:107](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/HtmlOverlayTool.ts#L107)

___

#### forceUpdate

▸ **forceUpdate**(): `void`

Updates positions of all overlays. This is automatically managed and there
shouldn't be any reason to trigger this unless the attached elements are
modified externally.

##### Returns

`void`

##### Defined in

[viewer/src/tools/HtmlOverlayTool.ts:170](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/HtmlOverlayTool.ts#L170)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[viewer/src/tools/Cognite3DViewerToolBase.ts:38](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/Cognite3DViewerToolBase.ts#L38)

___

#### remove

▸ **remove**(`htmlElement`): `void`

Removes a overlay and removes it from the DOM.

##### Parameters

| Name | Type |
| :------ | :------ |
| `htmlElement` | `HTMLElement` |

##### Returns

`void`

##### Defined in

[viewer/src/tools/HtmlOverlayTool.ts:146](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/HtmlOverlayTool.ts#L146)

# Enums


<a name="enums_cognite_revealantialiasingmodemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / AntiAliasingMode

## Enumeration: AntiAliasingMode

[@cognite/reveal](#modules_cognite_revealmd).AntiAliasingMode

Anti-aliasing modes supported by Reveal.

### Table of contents

#### Enumeration members

- [FXAA](#fxaa)
- [NoAA](#noaa)

### Enumeration members

#### FXAA

• **FXAA** = 1

Fast-approximate anti-aliasing (FXAA) (1).

##### Defined in

[viewer/src/public/types.ts:21](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L21)

___

#### NoAA

• **NoAA** = 0

No anti-aliasing (0).

##### Defined in

[viewer/src/public/types.ts:17](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L17)


<a name="enums_cognite_revealnodeoutlinecolormd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / NodeOutlineColor

## Enumeration: NodeOutlineColor

[@cognite/reveal](#modules_cognite_revealmd).NodeOutlineColor

### Table of contents

#### Enumeration members

- [Black](#black)
- [Blue](#blue)
- [Cyan](#cyan)
- [Green](#green)
- [NoOutline](#nooutline)
- [Orange](#orange)
- [Red](#red)
- [White](#white)

### Enumeration members

#### Black

• **Black** = 2

##### Defined in

[viewer/src/datamodels/cad/NodeAppearance.ts:8](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/NodeAppearance.ts#L8)

___

#### Blue

• **Blue** = 4

##### Defined in

[viewer/src/datamodels/cad/NodeAppearance.ts:10](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/NodeAppearance.ts#L10)

___

#### Cyan

• **Cyan** = 3

##### Defined in

[viewer/src/datamodels/cad/NodeAppearance.ts:9](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/NodeAppearance.ts#L9)

___

#### Green

• **Green** = 5

##### Defined in

[viewer/src/datamodels/cad/NodeAppearance.ts:11](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/NodeAppearance.ts#L11)

___

#### NoOutline

• **NoOutline** = 0

##### Defined in

[viewer/src/datamodels/cad/NodeAppearance.ts:6](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/NodeAppearance.ts#L6)

___

#### Orange

• **Orange** = 7

##### Defined in

[viewer/src/datamodels/cad/NodeAppearance.ts:13](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/NodeAppearance.ts#L13)

___

#### Red

• **Red** = 6

##### Defined in

[viewer/src/datamodels/cad/NodeAppearance.ts:12](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/NodeAppearance.ts#L12)

___

#### White

• **White** = 1

##### Defined in

[viewer/src/datamodels/cad/NodeAppearance.ts:7](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/NodeAppearance.ts#L7)


<a name="enums_cognite_revealpotreepointcolortypemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / PotreePointColorType

## Enumeration: PotreePointColorType

[@cognite/reveal](#modules_cognite_revealmd).PotreePointColorType

### Table of contents

#### Enumeration members

- [Classification](#classification)
- [Depth](#depth)
- [Height](#height)
- [Intensity](#intensity)
- [LevelOfDetail](#levelofdetail)
- [PointIndex](#pointindex)
- [Rgb](#rgb)

### Enumeration members

#### Classification

• **Classification**

Indicates whether a point is part of some class of objects.
Classes are mapped to colors.

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:35](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L35)

___

#### Depth

• **Depth**

Shows the distance from current camera with color gradient

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:17](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L17)

___

#### Height

• **Height**

Height, or elevation, mapped to a color with a gradient.

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:20](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L20)

___

#### Intensity

• **Intensity**

Indicates the strength of the backscattered signal in a laser scan.

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:38](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L38)

___

#### LevelOfDetail

• **LevelOfDetail**

Calculated during rendering.
It is equal to the level of the most detailed visible node in a region

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:29](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L29)

___

#### PointIndex

• **PointIndex**

Specifies the order in which points were captured from a single beam.

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:23](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L23)

___

#### Rgb

• **Rgb**

Describes the observed real-world color of a point.

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:14](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L14)


<a name="enums_cognite_revealpotreepointshapemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / PotreePointShape

## Enumeration: PotreePointShape

[@cognite/reveal](#modules_cognite_revealmd).PotreePointShape

### Table of contents

#### Enumeration members

- [Circle](#circle)
- [Square](#square)

### Enumeration members

#### Circle

• **Circle**

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:8](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L8)

___

#### Square

• **Square**

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:9](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L9)


<a name="enums_cognite_revealpotreepointsizetypemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / PotreePointSizeType

## Enumeration: PotreePointSizeType

[@cognite/reveal](#modules_cognite_revealmd).PotreePointSizeType

### Table of contents

#### Enumeration members

- [Adaptive](#adaptive)
- [Fixed](#fixed)

### Enumeration members

#### Adaptive

• **Adaptive**

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:42](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L42)

___

#### Fixed

• **Fixed**

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:43](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L43)


<a name="enums_cognite_revealssaosamplequalitymd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / SsaoSampleQuality

## Enumeration: SsaoSampleQuality

[@cognite/reveal](#modules_cognite_revealmd).SsaoSampleQuality

SSAO rendering quality modes supported by Reveal.

### Table of contents

#### Enumeration members

- [Default](#default)
- [High](#high)
- [Medium](#medium)
- [None](#none)
- [VeryHigh](#veryhigh)

### Enumeration members

#### Default

• **Default** = 32

##### Defined in

[viewer/src/public/types.ts:32](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L32)

___

#### High

• **High** = 64

##### Defined in

[viewer/src/public/types.ts:29](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L29)

___

#### Medium

• **Medium** = 32

##### Defined in

[viewer/src/public/types.ts:28](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L28)

___

#### None

• **None** = 1

##### Defined in

[viewer/src/public/types.ts:31](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L31)

___

#### VeryHigh

• **VeryHigh** = 128

##### Defined in

[viewer/src/public/types.ts:30](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L30)


<a name="enums_cognite_revealwellknownasprspointclasscodesmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / WellKnownAsprsPointClassCodes

## Enumeration: WellKnownAsprsPointClassCodes

[@cognite/reveal](#modules_cognite_revealmd).WellKnownAsprsPointClassCodes

ASPRS well known point class types.

**`see`** [http://www.asprs.org/wp-content/uploads/2019/03/LAS_1_4_r14.pdf](http://www.asprs.org/wp-content/uploads/2019/03/LAS_1_4_r14.pdf) (page 30)

### Table of contents

#### Enumeration members

- [BridgeDeck](#bridgedeck)
- [Building](#building)
- [Created](#created)
- [Default](#default)
- [Ground](#ground)
- [HighNoise](#highnoise)
- [HighVegetation](#highvegetation)
- [IgnoredGround](#ignoredground)
- [LowPoint](#lowpoint)
- [LowVegetation](#lowvegetation)
- [MedVegetation](#medvegetation)
- [OverheadStructure](#overheadstructure)
- [Rail](#rail)
- [ReservedOrBridgeDeck](#reservedorbridgedeck)
- [ReservedOrHighPoint](#reservedorhighpoint)
- [RoadSurface](#roadsurface)
- [Snow](#snow)
- [TemporalExclusion](#temporalexclusion)
- [TransmissionTower](#transmissiontower)
- [Unclassified](#unclassified)
- [UserDefinableOffset](#userdefinableoffset)
- [Water](#water)
- [WireConductor](#wireconductor)
- [WireGuard](#wireguard)
- [WireStructureConnector](#wirestructureconnector)

### Enumeration members

#### BridgeDeck

• **BridgeDeck** = 17

Note that [WellKnownAsprsPointClassCodes.ReservedOrBridgeDeck](#reservedorbridgedeck) has been used
historically.

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:100](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L100)

___

#### Building

• **Building** = 6

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:65](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L65)

___

#### Created

• **Created** = 0

Created, never classified.

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:59](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L59)

___

#### Default

• **Default** = -1

Special value for all other classes. Some point in Potree might be in this class

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:55](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L55)

___

#### Ground

• **Ground** = 2

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:61](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L61)

___

#### HighNoise

• **HighNoise** = 18

High point, or "high noise".
Note that [WellKnownAsprsPointClassCodes.ReservedOrHighPoint](#reservedorhighpoint) has been used
historically.

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:106](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L106)

___

#### HighVegetation

• **HighVegetation** = 5

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:64](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L64)

___

#### IgnoredGround

• **IgnoredGround** = 20

E.g. breakline proximity.

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:114](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L114)

___

#### LowPoint

• **LowPoint** = 7

Low point, typically "low noise".

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:69](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L69)

___

#### LowVegetation

• **LowVegetation** = 3

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:62](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L62)

___

#### MedVegetation

• **MedVegetation** = 4

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:63](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L63)

___

#### OverheadStructure

• **OverheadStructure** = 19

E.g. conveyors, mining equipment, traffic lights.

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:110](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L110)

___

#### Rail

• **Rail** = 10

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:76](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L76)

___

#### ReservedOrBridgeDeck

• **ReservedOrBridgeDeck** = 12

In previous revisions of LAS this was "Bridge deck", but in more recent
revisions this value is reserved.

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:82](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L82)

___

#### ReservedOrHighPoint

• **ReservedOrHighPoint** = 8

In previous revisions of LAS this was High point ("high noise"), in more recent
revisions this value is reserved.

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:74](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L74)

___

#### RoadSurface

• **RoadSurface** = 11

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:77](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L77)

___

#### Snow

• **Snow** = 21

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:115](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L115)

___

#### TemporalExclusion

• **TemporalExclusion** = 22

Features excluded due to changes over time between data sources – e.g., water
levels, landslides, permafrost

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:120](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L120)

___

#### TransmissionTower

• **TransmissionTower** = 15

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:91](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L91)

___

#### Unclassified

• **Unclassified** = 1

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:60](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L60)

___

#### UserDefinableOffset

• **UserDefinableOffset** = 64

First user definable class identifier (64).
Values up to and including 63 are reserved

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:126](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L126)

___

#### Water

• **Water** = 9

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:75](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L75)

___

#### WireConductor

• **WireConductor** = 14

Wire conductor (phase).

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:90](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L90)

___

#### WireGuard

• **WireGuard** = 13

Wire guard shield.

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:86](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L86)

___

#### WireStructureConnector

• **WireStructureConnector** = 16

Wire-structure connector (e.g. insulator).

##### Defined in

[viewer/src/datamodels/pointcloud/types.ts:95](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/pointcloud/types.ts#L95)


<a name="enums_cognite_reveal_toolscornermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / Corner

## Enumeration: Corner

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).Corner

A corner of the viewer.

### Table of contents

#### Enumeration members

- [BottomLeft](#bottomleft)
- [BottomRight](#bottomright)
- [TopLeft](#topleft)
- [TopRight](#topright)

### Enumeration members

#### BottomLeft

• **BottomLeft** = 2

##### Defined in

[viewer/src/tools/AxisView/types.ts:100](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/AxisView/types.ts#L100)

___

#### BottomRight

• **BottomRight** = 3

##### Defined in

[viewer/src/tools/AxisView/types.ts:101](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/AxisView/types.ts#L101)

___

#### TopLeft

• **TopLeft** = 1

##### Defined in

[viewer/src/tools/AxisView/types.ts:99](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/AxisView/types.ts#L99)

___

#### TopRight

• **TopRight** = 0

##### Defined in

[viewer/src/tools/AxisView/types.ts:98](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/AxisView/types.ts#L98)

# Interfaces


<a name="interfaces_cognite_revealaddmodeloptionsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / AddModelOptions

## Interface: AddModelOptions

[@cognite/reveal](#modules_cognite_revealmd).AddModelOptions

### Table of contents

#### Properties

- [geometryFilter](#geometryfilter)
- [localPath](#localpath)
- [modelId](#modelid)
- [onComplete](#oncomplete)
- [orthographicCamera](#orthographiccamera)
- [revisionId](#revisionid)

### Properties

#### geometryFilter

• `Optional` **geometryFilter**: [GeometryFilter](#interfaces_cognite_revealgeometryfiltermd)

##### Defined in

[viewer/src/public/migration/types.ts:137](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L137)

___

#### localPath

• `Optional` **localPath**: `string`

##### Defined in

[viewer/src/public/migration/types.ts:136](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L136)

___

#### modelId

• **modelId**: `number`

##### Defined in

[viewer/src/public/migration/types.ts:133](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L133)

___

#### onComplete

• `Optional` **onComplete**: () => `void`

##### Type declaration

▸ (): `void`

###### Returns

`void`

##### Defined in

[viewer/src/public/migration/types.ts:139](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L139)

___

#### orthographicCamera

• `Optional` **orthographicCamera**: `boolean`

##### Defined in

[viewer/src/public/migration/types.ts:138](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L138)

___

#### revisionId

• **revisionId**: `number`

##### Defined in

[viewer/src/public/migration/types.ts:134](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L134)


<a name="interfaces_cognite_revealcadmodelmetadatamd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / CadModelMetadata

## Interface: CadModelMetadata

[@cognite/reveal](#modules_cognite_revealmd).CadModelMetadata

### Table of contents

#### Properties

- [blobUrl](#bloburl)
- [cameraConfiguration](#cameraconfiguration)
- [geometryClipBox](#geometryclipbox)
- [inverseModelMatrix](#inversemodelmatrix)
- [modelMatrix](#modelmatrix)
- [scene](#scene)

### Properties

#### blobUrl

• `Readonly` **blobUrl**: `string`

URL of the model. This is a unique identifier.

##### Defined in

[viewer/src/datamodels/cad/CadModelMetadata.ts:13](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/CadModelMetadata.ts#L13)

___

#### cameraConfiguration

• `Optional` `Readonly` **cameraConfiguration**: [CameraConfiguration](#cameraconfiguration)

Camera configuration stored in CDF (if any).

##### Defined in

[viewer/src/datamodels/cad/CadModelMetadata.ts:37](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/CadModelMetadata.ts#L37)

___

#### geometryClipBox

• `Readonly` **geometryClipBox**: ``null`` \| `Box3`

If not null, geometry outside this box might be clipped
away to avoid representing unused geometry. Will typically
be used with geometry filters where only a part of the model
is loaded.

##### Defined in

[viewer/src/datamodels/cad/CadModelMetadata.ts:20](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/CadModelMetadata.ts#L20)

___

#### inverseModelMatrix

• `Readonly` **inverseModelMatrix**: `Matrix4`

Inverse of {@see modelMatrix}.

##### Defined in

[viewer/src/datamodels/cad/CadModelMetadata.ts:29](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/CadModelMetadata.ts#L29)

___

#### modelMatrix

• `Readonly` **modelMatrix**: `Matrix4`

Matrix transforming from coordinates of the model to ThreeJS
coordinates.

##### Defined in

[viewer/src/datamodels/cad/CadModelMetadata.ts:25](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/CadModelMetadata.ts#L25)

___

#### scene

• `Readonly` **scene**: `SectorScene`

Description of the tree structure holding geometry.

##### Defined in

[viewer/src/datamodels/cad/CadModelMetadata.ts:33](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/CadModelMetadata.ts#L33)


<a name="interfaces_cognite_revealcognite3dvieweroptionsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / Cognite3DViewerOptions

## Interface: Cognite3DViewerOptions

[@cognite/reveal](#modules_cognite_revealmd).Cognite3DViewerOptions

### Table of contents

#### Properties

- [antiAliasingHint](#antialiasinghint)
- [automaticCameraNearFar](#automaticcameranearfar)
- [automaticControlsSensitivity](#automaticcontrolssensitivity)
- [domElement](#domelement)
- [enableEdges](#enableedges)
- [logMetrics](#logmetrics)
- [onLoading](#onloading)
- [renderTargetOptions](#rendertargetoptions)
- [renderer](#renderer)
- [sdk](#sdk)
- [ssaoQualityHint](#ssaoqualityhint)

### Properties

#### antiAliasingHint

• `Optional` **antiAliasingHint**: ``"disabled"`` \| ``"fxaa"`` \| ``"msaa2+fxaa"`` \| ``"msaa4+fxaa"`` \| ``"msaa8+fxaa"`` \| ``"msaa16+fxaa"`` \| ``"msaa2"`` \| ``"msaa4"`` \| ``"msaa8"`` \| ``"msaa16"``

Hints Reveal to use a given anti-aliasing technique.

Fast approximate anti-aliasing (FXAA) is a fast technique that will remove some, but not all aliasing effects. See
https://en.wikipedia.org/wiki/Fast_approximate_anti-aliasing.

Multi-sampling anti-aliasinbg (MSAA) is a technique for taking multiple samples per pixel to avoid aliasing effects.
This mode requires WebGL 2. See https://www.khronos.org/opengl/wiki/Multisampling.

The combined modes will apply both MSAA and FXAA anti-aliasing and yields the best visual result.

When using the MSAA modes combined with FXAA Reveal will fall back to FXAA on WebGL 1. There is no fallback for the
"plain" MSAA modes on WebGL 1.

Currently the default mode is FXAA, but this is subject to change.

##### Defined in

[viewer/src/public/migration/types.ts:92](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L92)

___

#### automaticCameraNearFar

• `Optional` **automaticCameraNearFar**: `boolean`

When false, camera near and far planes will not be updated automatically (defaults to true).
This can be useful when you have custom content in the 3D view and need to better
control the view frustum.

When automatic camera near/far planes are disabled, you are responsible for setting
this on your own.

**`example`**
```
viewer.camera.near = 0.1;
viewer.camera.far = 1000.0;
viewer.camera.updateProjectionMatrix();
```

##### Defined in

[viewer/src/public/migration/types.ts:62](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L62)

___

#### automaticControlsSensitivity

• `Optional` **automaticControlsSensitivity**: `boolean`

When false, the sensitivity of the camera controls will not be updated automatically.
This can be useful to better control the sensitivity of the 3D navigation.

When not set, control the sensitivity of the camera using `viewer.cameraControls.minDistance`
and `viewer.cameraControls.maxDistance`.

##### Defined in

[viewer/src/public/migration/types.ts:71](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L71)

___

#### domElement

• `Optional` **domElement**: `HTMLElement`

An existing DOM element that we will render canvas into.

##### Defined in

[viewer/src/public/migration/types.ts:38](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L38)

___

#### enableEdges

• `Optional` **enableEdges**: `boolean`

Enables / disables visualizing the edges of geometry. Defaults to true.

##### Defined in

[viewer/src/public/migration/types.ts:113](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L113)

___

#### logMetrics

• `Optional` **logMetrics**: `boolean`

Send anonymous usage statistics.

##### Defined in

[viewer/src/public/migration/types.ts:41](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L41)

___

#### onLoading

• `Optional` **onLoading**: [OnLoadingCallback](#onloadingcallback)

Callback to download stream progress.

##### Defined in

[viewer/src/public/migration/types.ts:116](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L116)

___

#### renderTargetOptions

• `Optional` **renderTargetOptions**: `Object`

Render to offscreen buffer instead of canvas.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `autoSetSize?` | `boolean` |
| `target` | `WebGLRenderTarget` |

##### Defined in

[viewer/src/public/migration/types.ts:46](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L46)

___

#### renderer

• `Optional` **renderer**: `WebGLRenderer`

Renderer used to visualize model (optional).

##### Defined in

[viewer/src/public/migration/types.ts:74](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L74)

___

#### sdk

• **sdk**: `default`

Initialized connection to CDF used to load data.

##### Defined in

[viewer/src/public/migration/types.ts:35](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L35)

___

#### ssaoQualityHint

• `Optional` **ssaoQualityHint**: ``"disabled"`` \| ``"medium"`` \| ``"high"`` \| ``"veryhigh"``

Hints the renderer of the quality it should aim for for screen space ambient occlusion,
an effect creating shadows and that gives the rendered image more depth.

##### Defined in

[viewer/src/public/migration/types.ts:108](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L108)


<a name="interfaces_cognite_revealcognitemodelbasemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / CogniteModelBase

## Interface: CogniteModelBase

[@cognite/reveal](#modules_cognite_revealmd).CogniteModelBase

### Implemented by

- [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd)
- [CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd)

### Table of contents

#### Properties

- [type](#type)

#### Methods

- [dispose](#dispose)
- [getCameraConfiguration](#getcameraconfiguration)
- [getModelBoundingBox](#getmodelboundingbox)
- [getModelTransformation](#getmodeltransformation)
- [setModelTransformation](#setmodeltransformation)

### Properties

#### type

• `Readonly` **type**: [SupportedModelTypes](#supportedmodeltypes)

##### Defined in

[viewer/src/public/migration/CogniteModelBase.ts:13](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CogniteModelBase.ts#L13)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/CogniteModelBase.ts:14](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CogniteModelBase.ts#L14)

___

#### getCameraConfiguration

▸ **getCameraConfiguration**(): `undefined` \| [CameraConfiguration](#cameraconfiguration)

##### Returns

`undefined` \| [CameraConfiguration](#cameraconfiguration)

##### Defined in

[viewer/src/public/migration/CogniteModelBase.ts:16](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CogniteModelBase.ts#L16)

___

#### getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`, `restrictToMostGeometry?`): `Box3`

##### Parameters

| Name | Type |
| :------ | :------ |
| `outBbox?` | `Box3` |
| `restrictToMostGeometry?` | `boolean` |

##### Returns

`Box3`

##### Defined in

[viewer/src/public/migration/CogniteModelBase.ts:15](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CogniteModelBase.ts#L15)

___

#### getModelTransformation

▸ **getModelTransformation**(`out?`): `Matrix4`

##### Parameters

| Name | Type |
| :------ | :------ |
| `out?` | `Matrix4` |

##### Returns

`Matrix4`

##### Defined in

[viewer/src/public/migration/CogniteModelBase.ts:18](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CogniteModelBase.ts#L18)

___

#### setModelTransformation

▸ **setModelTransformation**(`matrix`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | `Matrix4` |

##### Returns

`void`

##### Defined in

[viewer/src/public/migration/CogniteModelBase.ts:17](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/CogniteModelBase.ts#L17)


<a name="interfaces_cognite_revealgeometryfiltermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / GeometryFilter

## Interface: GeometryFilter

[@cognite/reveal](#modules_cognite_revealmd).GeometryFilter

### Table of contents

#### Properties

- [boundingBox](#boundingbox)
- [isBoundingBoxInModelCoordinates](#isboundingboxinmodelcoordinates)

### Properties

#### boundingBox

• `Optional` **boundingBox**: `Box3`

The bounds to load geometry within. By default this box is in CDF coordinate space which
will be transformed into coordinates relative to the model using the the model transformation
which can be specified using [the CDF API](https://docs.cognite.com/api/v1/#operation/update3DRevisions),
or set in [Cognite Fusion](https://fusion.cognite.com/).

**`see`** [isBoundingBoxInModelCoordinates](#isboundingboxinmodelcoordinates).

##### Defined in

[viewer/src/public/types.ts:115](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L115)

___

#### isBoundingBoxInModelCoordinates

• `Optional` **isBoundingBoxInModelCoordinates**: `boolean`

When set, the geometry filter [boundingBox](#boundingbox) will be considered to be in "Reveal/ThreeJS space".
Rather than CDF space which is the default. When using Reveal space, the model transformation
which can be specified using [the CDF API](https://docs.cognite.com/api/v1/#operation/update3DRevisions),
or set in [Cognite Fusion](https://fusion.cognite.com/).

##### Defined in

[viewer/src/public/types.ts:123](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L123)


<a name="interfaces_cognite_revealintersectionfrompixeloptionsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / IntersectionFromPixelOptions

## Interface: IntersectionFromPixelOptions

[@cognite/reveal](#modules_cognite_revealmd).IntersectionFromPixelOptions

Options to control how [Cognite3DViewer.getIntersectionFromPixel](#getintersectionfrompixel) behaves.

### Table of contents

#### Properties

- [pointIntersectionThreshold](#pointintersectionthreshold)

### Properties

#### pointIntersectionThreshold

• `Optional` **pointIntersectionThreshold**: `number`

Threshold (in meters) for how close a point must be an intersection
ray for it to be considered an intersection for point clouds. Defaults
to 0.05.

##### Defined in

[viewer/src/public/migration/types.ts:265](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L265)


<a name="modulesmd"></a>

[@cognite/reveal](#readmemd) / Modules

# @cognite/reveal

## Table of contents

### Modules

- [@cognite/reveal](#modules_cognite_revealmd)
- [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd)

# Modules


<a name="modules_cognite_revealmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / @cognite/reveal

## Module: @cognite/reveal

### Table of contents

#### Enumerations

- [AntiAliasingMode](#enums_cognite_revealantialiasingmodemd)
- [NodeOutlineColor](#enums_cognite_revealnodeoutlinecolormd)
- [PotreePointColorType](#enums_cognite_revealpotreepointcolortypemd)
- [PotreePointShape](#enums_cognite_revealpotreepointshapemd)
- [PotreePointSizeType](#enums_cognite_revealpotreepointsizetypemd)
- [SsaoSampleQuality](#enums_cognite_revealssaosamplequalitymd)
- [WellKnownAsprsPointClassCodes](#enums_cognite_revealwellknownasprspointclasscodesmd)

#### Classes

- [AssetNodeCollection](#classes_cognite_revealassetnodecollectionmd)
- [BoundingBoxClipper](#classes_cognite_revealboundingboxclippermd)
- [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd)
- [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd)
- [CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd)
- [IndexSet](#classes_cognite_revealindexsetmd)
- [IntersectionNodeCollection](#classes_cognite_revealintersectionnodecollectionmd)
- [InvertedNodeCollection](#classes_cognite_revealinvertednodecollectionmd)
- [NodeAppearanceProvider](#classes_cognite_revealnodeappearanceprovidermd)
- [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd)
- [NotSupportedInMigrationWrapperError](#classes_cognite_revealnotsupportedinmigrationwrappererrormd)
- [NumericRange](#classes_cognite_revealnumericrangemd)
- [PropertyFilterNodeCollection](#classes_cognite_revealpropertyfilternodecollectionmd)
- [SinglePropertyFilterNodeCollection](#classes_cognite_revealsinglepropertyfilternodecollectionmd)
- [TreeIndexNodeCollection](#classes_cognite_revealtreeindexnodecollectionmd)
- [UnionNodeCollection](#classes_cognite_revealunionnodecollectionmd)

#### Interfaces

- [AddModelOptions](#interfaces_cognite_revealaddmodeloptionsmd)
- [CadModelMetadata](#interfaces_cognite_revealcadmodelmetadatamd)
- [Cognite3DViewerOptions](#interfaces_cognite_revealcognite3dvieweroptionsmd)
- [CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd)
- [GeometryFilter](#interfaces_cognite_revealgeometryfiltermd)
- [IntersectionFromPixelOptions](#interfaces_cognite_revealintersectionfrompixeloptionsmd)

#### Type aliases

- [CadIntersection](#cadintersection)
- [CadLoadingHints](#cadloadinghints)
- [CadModelBudget](#cadmodelbudget)
- [CameraChangeDelegate](#camerachangedelegate)
- [CameraConfiguration](#cameraconfiguration)
- [Color](#color)
- [DisposedDelegate](#disposeddelegate)
- [EdgeDetectionParameters](#edgedetectionparameters)
- [Intersection](#intersection)
- [LoadingStateChangeListener](#loadingstatechangelistener)
- [NodeAppearance](#nodeappearance)
- [NodeCollectionDescriptor](#nodecollectiondescriptor)
- [NodeCollectionSerializationContext](#nodecollectionserializationcontext)
- [OnLoadingCallback](#onloadingcallback)
- [PointCloudIntersection](#pointcloudintersection)
- [PointerEventDelegate](#pointereventdelegate)
- [RenderOptions](#renderoptions)
- [RevealOptions](#revealoptions)
- [SceneRenderedDelegate](#scenerendereddelegate)
- [SerializedNodeCollection](#serializednodecollection)
- [SsaoParameters](#ssaoparameters)
- [SupportedModelTypes](#supportedmodeltypes)
- [TypeName](#typename)

#### Variables

- [DefaultNodeAppearance](#defaultnodeappearance)
- [defaultRenderOptions](#defaultrenderoptions)
- [revealEnv](#revealenv)

#### Functions

- [registerCustomNodeCollectionType](#registercustomnodecollectiontype)

### Type aliases

#### CadIntersection

Ƭ **CadIntersection**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `distanceToCamera` | `number` | Distance from the camera to the intersection. |
| `model` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) | The model that was intersected. |
| `point` | `THREE.Vector3` | Coordinate of the intersection. |
| `treeIndex` | `number` | Tree index of the intersected 3D node. |
| `type` | ``"cad"`` | The intersection type. |

##### Defined in

[viewer/src/public/migration/types.ts:142](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L142)

___

#### CadLoadingHints

Ƭ **CadLoadingHints**: `Object`

Hints that are used to modify how CAD sectors are loaded.

**`property`** `suspendLoading` - disables loading of sectors.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `suspendLoading?` | `boolean` |

##### Defined in

[viewer/src/datamodels/cad/CadLoadingHints.ts:9](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/CadLoadingHints.ts#L9)

___

#### CadModelBudget

Ƭ **CadModelBudget**: `Object`

Represents a measurement of how much geometry can be loaded.

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `geometryDownloadSizeBytes` | `number` | Number of bytes of the geometry that must be downloaded. |
| `highDetailProximityThreshold` | `number` | Sectors within this distance from the camera will always be loaded in high details. |
| `maximumNumberOfDrawCalls` | `number` | Estimated maximum number of WebGL draw calls to download geometry for. Draw calls are very important for the framerate. |

##### Defined in

[viewer/src/public/migration/types.ts:236](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L236)

___

#### CameraChangeDelegate

Ƭ **CameraChangeDelegate**: (`position`: `THREE.Vector3`, `target`: `THREE.Vector3`) => `void`

##### Type declaration

▸ (`position`, `target`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `position` | `THREE.Vector3` |
| `target` | `THREE.Vector3` |

###### Returns

`void`

##### Defined in

[viewer/src/public/migration/types.ts:211](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L211)

___

#### CameraConfiguration

Ƭ **CameraConfiguration**: `Object`

Represents a camera configuration, consisting of a camera position and target.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `position` | `THREE.Vector3` |
| `target` | `THREE.Vector3` |

##### Defined in

[viewer/src/utilities/types.ts:62](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/utilities/types.ts#L62)

___

#### Color

Ƭ **Color**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `b` | `number` |
| `g` | `number` |
| `r` | `number` |

##### Defined in

[viewer/src/public/migration/types.ts:14](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L14)

___

#### DisposedDelegate

Ƭ **DisposedDelegate**: () => `void`

Delegate for disposal events.

##### Type declaration

▸ (): `void`

###### Returns

`void`

##### Defined in

[viewer/src/public/migration/types.ts:216](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L216)

___

#### EdgeDetectionParameters

Ƭ **EdgeDetectionParameters**: `Object`

Edge detection parameters supported by Reveal.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `enabled` | `boolean` |

##### Defined in

[viewer/src/public/types.ts:38](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L38)

___

#### Intersection

Ƭ **Intersection**: [CadIntersection](#cadintersection) \| [PointCloudIntersection](#pointcloudintersection)

##### Defined in

[viewer/src/public/migration/types.ts:192](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L192)

___

#### LoadingStateChangeListener

Ƭ **LoadingStateChangeListener**: (`loadingState`: `LoadingState`) => `any`

Handler for events about data being loaded.

##### Type declaration

▸ (`loadingState`): `any`

###### Parameters

| Name | Type |
| :------ | :------ |
| `loadingState` | `LoadingState` |

###### Returns

`any`

##### Defined in

[viewer/src/public/types.ts:129](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L129)

___

#### NodeAppearance

Ƭ **NodeAppearance**: `Object`

Type for defining node appearance profiles to style a 3D CAD model.

**`see`** [DefaultNodeAppearance](#defaultnodeappearance)

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `color?` | [`number`, `number`, `number`] | Overrides the default color of the node. |
| `outlineColor?` | [NodeOutlineColor](#enums_cognite_revealnodeoutlinecolormd) | When set, an outline is drawn around the node to make it stand out. |
| `renderGhosted?` | `boolean` | When set to true, the node is rendered ghosted, i.e. transparent with a fixed color. This has no effect if [renderInFront](#renderinfront) is `true`. |
| `renderInFront?` | `boolean` | When set to true, the node is rendered in front of all other nodes even if it's occluded. Note that this take precedence over [renderGhosted](#renderghosted). |
| `visible?` | `boolean` | Overrides the visibility of the node. |

##### Defined in

[viewer/src/datamodels/cad/NodeAppearance.ts:20](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/NodeAppearance.ts#L20)

___

#### NodeCollectionDescriptor

Ƭ **NodeCollectionDescriptor**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `options?` | `any` |
| `state` | `any` |
| `token` | [TypeName](#typename) |

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionDeserializer.ts:22](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionDeserializer.ts#L22)

___

#### NodeCollectionSerializationContext

Ƭ **NodeCollectionSerializationContext**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `client` | `CogniteClient` |
| `model` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) |

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionDeserializer.ts:21](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionDeserializer.ts#L21)

___

#### OnLoadingCallback

Ƭ **OnLoadingCallback**: (`itemsLoaded`: `number`, `itemsRequested`: `number`, `itemsCulled`: `number`) => `void`

##### Type declaration

▸ (`itemsLoaded`, `itemsRequested`, `itemsCulled`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `itemsLoaded` | `number` |
| `itemsRequested` | `number` |
| `itemsCulled` | `number` |

###### Returns

`void`

##### Defined in

[viewer/src/public/migration/types.ts:28](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L28)

___

#### PointCloudIntersection

Ƭ **PointCloudIntersection**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `distanceToCamera` | `number` | Distance from the camera to the intersection. |
| `model` | [CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd) | The model that was intersected. |
| `point` | `THREE.Vector3` | Tree index of the intersected 3D node. |
| `pointIndex` | `number` | The index of the point that was intersected. |
| `type` | ``"pointcloud"`` | The intersection type. |

##### Defined in

[viewer/src/public/migration/types.ts:165](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L165)

___

#### PointerEventDelegate

Ƭ **PointerEventDelegate**: (`event`: { `offsetX`: `number` ; `offsetY`: `number`  }) => `void`

##### Type declaration

▸ (`event`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Object` |
| `event.offsetX` | `number` |
| `event.offsetY` | `number` |

###### Returns

`void`

##### Defined in

[viewer/src/public/migration/types.ts:204](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L204)

___

#### RenderOptions

Ƭ **RenderOptions**: `Object`

Options and hints for how the Reveal viewer applies rendering effects.

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `antiAliasing?` | [AntiAliasingMode](#enums_cognite_revealantialiasingmodemd) | Anti-aliasing mode used to avoid aliasing effects in the rendered view. |
| `edgeDetectionParameters?` | [EdgeDetectionParameters](#edgedetectionparameters) | Determines the parameters used for visualizing edges of the geometry. |
| `multiSampleCountHint?` | `number` | When provided, Reveal will use multi-sampling to reduce aliasing effects when WebGL 2 is available. Ignored if using WebGL 1. |
| `ssaoRenderParameters?` | [SsaoParameters](#ssaoparameters) | Determines the parameters used for ambient occlusion heuristic shading. |

##### Defined in

[viewer/src/public/types.ts:63](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L63)

___

#### RevealOptions

Ƭ **RevealOptions**: `Object`

**`property`** logMetrics Might be used to disable usage statistics.

**`property`** nodeAppearanceProvider Style node by tree-index.

**`property`** internal Internals are for internal usage only (like unit-testing).

##### Type declaration

| Name | Type |
| :------ | :------ |
| `internal?` | `Object` |
| `internal.parseCallback?` | (`parsed`: { `data`: `SectorGeometry` \| `SectorQuads` ; `lod`: `string`  }) => `void` |
| `internal.sectorCuller?` | `SectorCuller` |
| `logMetrics?` | `boolean` |
| `renderOptions?` | [RenderOptions](#renderoptions) |

##### Defined in

[viewer/src/public/types.ts:98](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L98)

___

#### SceneRenderedDelegate

Ƭ **SceneRenderedDelegate**: (`event`: { `camera`: `THREE.PerspectiveCamera` ; `frameNumber`: `number` ; `renderTime`: `number` ; `renderer`: `THREE.WebGLRenderer`  }) => `void`

##### Type declaration

▸ (`event`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Object` |
| `event.camera` | `THREE.PerspectiveCamera` |
| `event.frameNumber` | `number` |
| `event.renderTime` | `number` |
| `event.renderer` | `THREE.WebGLRenderer` |

###### Returns

`void`

##### Defined in

[viewer/src/public/migration/types.ts:223](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/migration/types.ts#L223)

___

#### SerializedNodeCollection

Ƭ **SerializedNodeCollection**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `options?` | `any` |
| `state` | `any` |
| `token` | `string` |

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionBase.ts:9](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionBase.ts#L9)

___

#### SsaoParameters

Ƭ **SsaoParameters**: `Object`

Screen-space ambient occlusion parameters supported by Reveal.

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `depthCheckBias` | `number` | Applied bias when depth testing to reduce output noise. |
| `sampleRadius` | `number` | Maximum length of sample vector. |
| `sampleSize` | [SsaoSampleQuality](#enums_cognite_revealssaosamplequalitymd) | Quality (Number of samples) to estimate occlusion factor. |

##### Defined in

[viewer/src/public/types.ts:45](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L45)

___

#### SupportedModelTypes

Ƭ **SupportedModelTypes**: ``"pointcloud"`` \| ``"cad"``

##### Defined in

[viewer/src/datamodels/base/SupportedModelTypes.ts:4](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/base/SupportedModelTypes.ts#L4)

___

#### TypeName

Ƭ **TypeName**: `string`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionDeserializer.ts:20](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionDeserializer.ts#L20)

### Variables

#### DefaultNodeAppearance

• `Const` **DefaultNodeAppearance**: `Object`

A set of default node appearances used in Reveal.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `Default` | `Object` |
| `Default.outlineColor` | [NodeOutlineColor](#enums_cognite_revealnodeoutlinecolormd) |
| `Default.renderGhosted` | `boolean` |
| `Default.renderInFront` | `boolean` |
| `Default.visible` | `boolean` |
| `Ghosted` | [NodeAppearance](#nodeappearance) |
| `Hidden` | [NodeAppearance](#nodeappearance) |
| `Highlighted` | `Object` |
| `Highlighted.color?` | [`number`, `number`, `number`] |
| `Highlighted.outlineColor?` | [NodeOutlineColor](#enums_cognite_revealnodeoutlinecolormd) |
| `Highlighted.renderGhosted?` | `boolean` |
| `Highlighted.renderInFront?` | `boolean` |
| `Highlighted.visible?` | `boolean` |
| `InFront` | [NodeAppearance](#nodeappearance) |
| `Outlined` | [NodeAppearance](#nodeappearance) |

##### Defined in

[viewer/src/datamodels/cad/NodeAppearance.ts:72](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/NodeAppearance.ts#L72)

___

#### defaultRenderOptions

• `Const` **defaultRenderOptions**: `Required`<[RenderOptions](#renderoptions)\>

Defaults for {@ref RevealRenderOptions}.

##### Defined in

[viewer/src/public/types.ts:86](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/public/types.ts#L86)

___

#### revealEnv

• `Const` **revealEnv**: `Object`

Used to specify custom url for worker/wasm files
in cases when you need the latest local files or CDN is blocked by CSP.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `publicPath` | `string` |

##### Defined in

[viewer/src/revealEnv.ts:9](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/revealEnv.ts#L9)

### Functions

#### registerCustomNodeCollectionType

▸ **registerCustomNodeCollectionType**<T\>(`nodeCollectionType`, `deserializer`): `void`

##### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T`: [NodeCollectionBase](#classes_cognite_revealnodecollectionbasemd)<T\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollectionType` | [TypeName](#typename) |
| `deserializer` | (`descriptor`: [NodeCollectionDescriptor](#nodecollectiondescriptor), `context`: [NodeCollectionSerializationContext](#nodecollectionserializationcontext)) => `Promise`<T\> |

##### Returns

`void`

##### Defined in

[viewer/src/datamodels/cad/styling/NodeCollectionDeserializer.ts:141](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/datamodels/cad/styling/NodeCollectionDeserializer.ts#L141)


<a name="modules_cognite_reveal_toolsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / @cognite/reveal/tools

## Module: @cognite/reveal/tools

### Table of contents

#### Enumerations

- [Corner](#enums_cognite_reveal_toolscornermd)

#### Classes

- [AxisViewTool](#classes_cognite_reveal_toolsaxisviewtoolmd)
- [GeomapTool](#classes_cognite_reveal_toolsgeomaptoolmd)
- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)
- [DebugCameraTool](#classes_cognite_reveal_toolsdebugcameratoolmd)
- [DebugLoadedSectorsTool](#classes_cognite_reveal_toolsdebugloadedsectorstoolmd)
- [ExplodedViewTool](#classes_cognite_reveal_toolsexplodedviewtoolmd)
- [HtmlOverlayTool](#classes_cognite_reveal_toolshtmloverlaytoolmd)

#### Type aliases

- [AbsolutePosition](#absoluteposition)
- [AxisBoxCompassConfig](#axisboxcompassconfig)
- [AxisBoxConfig](#axisboxconfig)
- [AxisBoxFaceConfig](#axisboxfaceconfig)
- [DebugLoadedSectorsToolOptions](#debugloadedsectorstooloptions)
- [HtmlOverlayOptions](#htmloverlayoptions)
- [RelativePosition](#relativeposition)

### Type aliases

#### AbsolutePosition

Ƭ **AbsolutePosition**: `Object`

Absolute position in pixels.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `xAbsolute` | `number` |
| `yAbsolute` | `number` |

##### Defined in

[viewer/src/tools/AxisView/types.ts:47](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/AxisView/types.ts#L47)

___

#### AxisBoxCompassConfig

Ƭ **AxisBoxCompassConfig**: `Object`

Configuration of the compass.

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `fontColor?` | `THREE.Color` | - |
| `fontSize?` | `number` | - |
| `labelDelta?` | `number` | Offset in radians of the orientation indicator. |
| `ringLabel?` | `string` | Label of the orientation indicator. Defaults to 'N' for north. |
| `tickColor?` | `THREE.Color` | - |

##### Defined in

[viewer/src/tools/AxisView/types.ts:79](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/AxisView/types.ts#L79)

___

#### AxisBoxConfig

Ƭ **AxisBoxConfig**: `Object`

Configuration of [AxisViewTool](#classes_cognite_reveal_toolsaxisviewtoolmd).

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `animationSpeed?` | `number` | How long the camera animation lasts when clicking a face of the orientation box. |
| `compass?` | [AxisBoxCompassConfig](#axisboxcompassconfig) | Configuration of the compass "base" of the tool. |
| `faces?` | `Object` | Configuration for each of the faces of the orientation box. Note that Reveal uses a right-handed Y up coordinate system, which might differ from the original model space. To account for this, you might want to reassign labels of the faces. |
| `faces.xNegativeFace?` | [AxisBoxFaceConfig](#axisboxfaceconfig) | - |
| `faces.xPositiveFace?` | [AxisBoxFaceConfig](#axisboxfaceconfig) | - |
| `faces.yNegativeFace?` | [AxisBoxFaceConfig](#axisboxfaceconfig) | - |
| `faces.yPositiveFace?` | [AxisBoxFaceConfig](#axisboxfaceconfig) | - |
| `faces.zNegativeFace?` | [AxisBoxFaceConfig](#axisboxfaceconfig) | - |
| `faces.zPositiveFace?` | [AxisBoxFaceConfig](#axisboxfaceconfig) | - |
| `position?` | [AbsolutePosition](#absoluteposition) \| [RelativePosition](#relativeposition) | Position, either absolute or relative. |
| `size?` | `number` | Size in pixels of the axis tool. |

##### Defined in

[viewer/src/tools/AxisView/types.ts:10](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/AxisView/types.ts#L10)

___

#### AxisBoxFaceConfig

Ƭ **AxisBoxFaceConfig**: `Object`

Configuration of each face of the orientation box.

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `faceColor?` | `THREE.Color` | - |
| `fontColor?` | `THREE.Color` | - |
| `fontSize?` | `number` | - |
| `label?` | `string` | Label of the respective face, e.g. 'X' or 'Right'. |
| `outlineColor?` | `THREE.Color` | - |
| `outlineSize?` | `number` | - |

##### Defined in

[viewer/src/tools/AxisView/types.ts:64](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/AxisView/types.ts#L64)

___

#### DebugLoadedSectorsToolOptions

Ƭ **DebugLoadedSectorsToolOptions**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `colorBy?` | ``"depth"`` \| ``"lod"`` \| ``"loadedTimestamp"`` |
| `leafsOnly?` | `boolean` |
| `showDetailedSectors?` | `boolean` |
| `showDiscardedSectors?` | `boolean` |
| `showSimpleSectors?` | `boolean` |

##### Defined in

[viewer/src/tools/DebugLoadedSectorsTool.ts:15](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/DebugLoadedSectorsTool.ts#L15)

___

#### HtmlOverlayOptions

Ƭ **HtmlOverlayOptions**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `positionUpdatedCallback?` | `HtmlOverlayPositionUpdatedDelegate` |

##### Defined in

[viewer/src/tools/HtmlOverlayTool.ts:19](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/HtmlOverlayTool.ts#L19)

___

#### RelativePosition

Ƭ **RelativePosition**: `Object`

Relative position from a corner of the viewer
and a given padding.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `corner` | [Corner](#enums_cognite_reveal_toolscornermd) |
| `padding` | `THREE.Vector2` |

##### Defined in

[viewer/src/tools/AxisView/types.ts:56](https://github.com/cognitedata/reveal/blob/d0fe97f8/viewer/src/tools/AxisView/types.ts#L56)
