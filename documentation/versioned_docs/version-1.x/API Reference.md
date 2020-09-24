
<a name="readmemd"></a>

[@cognite/reveal](#readmemd)

# @cognite/reveal

## Index

### Modules

* ["Cognite3DModel"](#modules_cognite3dmodel_md)
* ["Cognite3DViewer"](#modules_cognite3dviewer_md)
* ["CogniteModelBase"](#modules_cognitemodelbase_md)
* ["CognitePointCloudModel"](#modules_cognitepointcloudmodel_md)
* ["NodeIdAndTreeIndexMaps"](#modules_nodeidandtreeindexmaps_md)
* ["NotSupportedInMigrationWrapperError"](#modules_notsupportedinmigrationwrappererror_md)
* ["RenderController"](#modules_rendercontroller_md)
* ["types"](#modules_types_md)

# Classes


<a name="classes_cognite3dmodel_cognite3dmodelmd"></a>

[@cognite/reveal](#readmemd) › ["Cognite3DModel"](#modules_cognite3dmodel_md) › [Cognite3DModel](#classes_cognite3dmodel_cognite3dmodelmd)

## Class: Cognite3DModel

Represents a single 3D CAD model loaded from CDF.

**`module`** @cognite/reveal

### Hierarchy

* Object3D

  ↳ **Cognite3DModel**

### Implements

* [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd)

### Index

#### Properties

* [modelId](#modelid)
* [revisionId](#revisionid)
* [type](#type)

#### Accessors

* [loadingHints](#loadinghints)
* [renderHints](#renderhints)

#### Methods

* [deselectAllNodes](#deselectallnodes)
* [deselectNode](#deselectnode)
* [deselectNodeByTreeIndex](#deselectnodebytreeindex)
* [dispose](#dispose)
* [getBoundingBox](#getboundingbox)
* [getBoundingBoxByNodeId](#getboundingboxbynodeid)
* [getBoundingBoxByTreeIndex](#getboundingboxbytreeindex)
* [getCameraConfiguration](#getcameraconfiguration)
* [getModelBoundingBox](#getmodelboundingbox)
* [getNodeColor](#getnodecolor)
* [getSubtreeNodeIds](#getsubtreenodeids)
* [getSubtreeTreeIndices](#getsubtreetreeindices)
* [hideAllNodes](#hideallnodes)
* [hideNode](#hidenode)
* [hideNodeByTreeIndex](#hidenodebytreeindex)
* [iterateNodes](#iteratenodes)
* [iterateNodesByTreeIndex](#iteratenodesbytreeindex)
* [iterateSubtree](#iteratesubtree)
* [iterateSubtreeByTreeIndex](#iteratesubtreebytreeindex)
* [mapFromCdfToModelCoordinates](#mapfromcdftomodelcoordinates)
* [mapNodeIdToTreeIndex](#mapnodeidtotreeindex)
* [mapNodeIdsToTreeIndices](#mapnodeidstotreeindices)
* [mapPositionFromModelToCdfCoordinates](#mappositionfrommodeltocdfcoordinates)
* [mapTreeIndexToNodeId](#maptreeindextonodeid)
* [mapTreeIndicesToNodeIds](#maptreeindicestonodeids)
* [resetAllNodeColors](#resetallnodecolors)
* [resetNodeColor](#resetnodecolor)
* [resetNodeColorByTreeIndex](#resetnodecolorbytreeindex)
* [selectNode](#selectnode)
* [selectNodeByTreeIndex](#selectnodebytreeindex)
* [setNodeColor](#setnodecolor)
* [setNodeColorByTreeIndex](#setnodecolorbytreeindex)
* [showAllNodes](#showallnodes)
* [showNode](#shownode)
* [showNodeByTreeIndex](#shownodebytreeindex)

### Properties

####  modelId

• **modelId**: *number*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:65](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L65)*

The CDF model ID of the model.

___

####  revisionId

• **revisionId**: *number*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:69](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L69)*

The CDF revision ID of the model.

___

####  type

• **type**: *SupportedModelTypes* = "cad"

*Implementation of [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd).[type](#type)*

*Overrides void*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:32](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L32)*

### Accessors

####  loadingHints

• **get loadingHints**(): *CadLoadingHints*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:51](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L51)*

Get settings used for loading pipeline.

**Returns:** *CadLoadingHints*

• **set loadingHints**(`hints`: CadLoadingHints): *void*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:58](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L58)*

Specify settings for loading pipeline.

**Parameters:**

Name | Type |
------ | ------ |
`hints` | CadLoadingHints |

**Returns:** *void*

___

####  renderHints

• **get renderHints**(): *CadRenderHints*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:37](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L37)*

Get settings used for rendering.

**Returns:** *CadRenderHints*

• **set renderHints**(`hints`: CadRenderHints): *void*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:44](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L44)*

Specify settings for rendering.

**Parameters:**

Name | Type |
------ | ------ |
`hints` | CadRenderHints |

**Returns:** *void*

### Methods

####  deselectAllNodes

▸ **deselectAllNodes**(): *void*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:460](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L460)*

Removes selection from all nodes.

**Returns:** *void*

___

####  deselectNode

▸ **deselectNode**(`nodeId`: number): *Promise‹void›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:442](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L442)*

Removes selection from the node by node ID

**Parameters:**

Name | Type |
------ | ------ |
`nodeId` | number |

**Returns:** *Promise‹void›*

___

####  deselectNodeByTreeIndex

▸ **deselectNodeByTreeIndex**(`treeIndex`: number, `applyToChildren`: boolean): *Promise‹number›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:450](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L450)*

Removes selection from the node by tree index

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`treeIndex` | number | - |
`applyToChildren` | boolean | false |

**Returns:** *Promise‹number›*

___

####  dispose

▸ **dispose**(): *void*

*Implementation of [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd)*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:148](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L148)*

Cleans up used resources.

**Returns:** *void*

___

####  getBoundingBox

▸ **getBoundingBox**(`_nodeId?`: undefined | number, `_box?`: THREE.Box3): *Box3*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:169](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L169)*

**`deprecated`** Use [Cognite3DModel.getModelBoundingBox](#getmodelboundingbox) or [Cognite3DModel.getBoundingBoxByTreeIndex](#getboundingboxbytreeindex).

**`throws`** NotSupportedInMigrationWrapperError

**Parameters:**

Name | Type |
------ | ------ |
`_nodeId?` | undefined &#124; number |
`_box?` | THREE.Box3 |

**Returns:** *Box3*

___

####  getBoundingBoxByNodeId

▸ **getBoundingBoxByNodeId**(`nodeId`: number, `box?`: THREE.Box3): *Promise‹Box3›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:235](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L235)*

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

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`nodeId` | number | - |
`box?` | THREE.Box3 | Optional. Used to write result to. |

**Returns:** *Promise‹Box3›*

___

####  getBoundingBoxByTreeIndex

▸ **getBoundingBoxByTreeIndex**(`treeIndex`: number, `box?`: THREE.Box3): *Promise‹Box3›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:275](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L275)*

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

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`treeIndex` | number | Tree index of the node to find bounding box for. |
`box?` | THREE.Box3 | Optional preallocated container to hold the bounding box. |

**Returns:** *Promise‹Box3›*

___

####  getCameraConfiguration

▸ **getCameraConfiguration**(): *[CameraConfiguration](#cameraconfiguration) | undefined*

*Implementation of [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd)*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:200](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L200)*

Retrieves the camera position and target stored for the model. Typically this
is used to store a good starting position for a model. Returns `undefined` if there
isn't any stored camera configuration for the model.

**Returns:** *[CameraConfiguration](#cameraconfiguration) | undefined*

___

####  getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`: THREE.Box3): *Box3*

*Implementation of [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd)*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:190](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L190)*

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

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`outBbox?` | THREE.Box3 | Optional. Used to write result to. |

**Returns:** *Box3*

models bounding box.

___

####  getNodeColor

▸ **getNodeColor**(`_nodeId`: number): *Promise‹[Color](#color)›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:345](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L345)*

Not supported.

**`deprecated`** This function is no longer supported. There is no replacement.

**`throws`** NotSupportedInMigrationWrapperError

**Parameters:**

Name | Type |
------ | ------ |
`_nodeId` | number |

**Returns:** *Promise‹[Color](#color)›*

___

####  getSubtreeNodeIds

▸ **getSubtreeNodeIds**(`_nodeId`: number, `_subtreeSize?`: undefined | number): *Promise‹number[]›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:156](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L156)*

**`deprecated`** 

**`throws`** NotSupportedInMigrationWrapperError

**Parameters:**

Name | Type |
------ | ------ |
`_nodeId` | number |
`_subtreeSize?` | undefined &#124; number |

**Returns:** *Promise‹number[]›*

___

####  getSubtreeTreeIndices

▸ **getSubtreeTreeIndices**(`treeIndex`: number): *Promise‹number[]›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:160](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L160)*

**Parameters:**

Name | Type |
------ | ------ |
`treeIndex` | number |

**Returns:** *Promise‹number[]›*

___

####  hideAllNodes

▸ **hideAllNodes**(`makeGray?`: undefined | false | true): *void*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:510](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L510)*

Hides all nodes in the model.

**`throws`** NotSupportedInMigrationWrapperError if `makeGray` is passed

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`makeGray?` | undefined &#124; false &#124; true | Not supported. |

**Returns:** *void*

___

####  hideNode

▸ **hideNode**(`nodeId`: number, `makeGray?`: undefined | false | true): *Promise‹void›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:527](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L527)*

Hide the node by node ID.
This method is async because nodeId might be not loaded yet.

**`deprecated`** Use [Cognite3DModel.hideNodeByTreeIndex](#hidenodebytreeindex)

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`nodeId` | number | - |
`makeGray?` | undefined &#124; false &#124; true | Not supported yet.  |

**Returns:** *Promise‹void›*

___

####  hideNodeByTreeIndex

▸ **hideNodeByTreeIndex**(`treeIndex`: number, `makeGray?`: undefined | false | true, `applyToChildren`: boolean): *Promise‹number›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:538](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L538)*

Hide the node by tree index.

**`throws`** NotSupportedInMigrationWrapperError if `makeGray` is passed

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`treeIndex` | number | - | - |
`makeGray?` | undefined &#124; false &#124; true | - | Not supported. |
`applyToChildren` | boolean | false | - |

**Returns:** *Promise‹number›*

___

####  iterateNodes

▸ **iterateNodes**(`_action`: function): *void*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:284](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L284)*

**`deprecated`** Use [Cognite3DModel.iterateNodesByTreeIndex](#iteratenodesbytreeindex) instead.

**`throws`** NotSupportedInMigrationWrapperError

**Parameters:**

▪ **_action**: *function*

▸ (`nodeId`: number, `treeIndex?`: undefined | number): *void*

**Parameters:**

Name | Type |
------ | ------ |
`nodeId` | number |
`treeIndex?` | undefined &#124; number |

**Returns:** *void*

___

####  iterateNodesByTreeIndex

▸ **iterateNodesByTreeIndex**(`action`: function): *Promise‹void›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:300](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L300)*

Iterates over all nodes in the model and applies the provided action to each node (identified by tree index).
The passed action is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
applied until promise is resolved (iteration is done).

**`example`** 
```js
const logIndex = (treeIndex) => console.log(treeIndex);
await model.iterateNodesByTreeIndex(logIndex); // 0, 1, 2, ...
```

**Parameters:**

▪ **action**: *function*

Function that will be called with a treeIndex argument.

▸ (`treeIndex`: number): *void*

**Parameters:**

Name | Type |
------ | ------ |
`treeIndex` | number |

**Returns:** *Promise‹void›*

Promise that is resolved once the iteration is done.

___

####  iterateSubtree

▸ **iterateSubtree**(`_nodeId`: number, `_action`: function, `_treeIndex?`: undefined | number, `_subtreeSize?`: undefined | number): *Promise‹boolean›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:308](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L308)*

**`deprecated`** Use [Cognite3DModel.iterateNodesByTreeIndex](#iteratenodesbytreeindex) instead.

**`throws`** NotSupportedInMigrationWrapperError

**Parameters:**

▪ **_nodeId**: *number*

▪ **_action**: *function*

▸ (`nodeId`: number, `treeIndex?`: undefined | number): *void*

**Parameters:**

Name | Type |
------ | ------ |
`nodeId` | number |
`treeIndex?` | undefined &#124; number |

▪`Optional`  **_treeIndex**: *undefined | number*

▪`Optional`  **_subtreeSize**: *undefined | number*

**Returns:** *Promise‹boolean›*

___

####  iterateSubtreeByTreeIndex

▸ **iterateSubtreeByTreeIndex**(`treeIndex`: number, `action`: function): *Promise‹void›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:335](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L335)*

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

**Parameters:**

▪ **treeIndex**: *number*

Tree index of the top parent of the subtree.

▪ **action**: *function*

Function that will be called with a treeIndex argument.

▸ (`treeIndex`: number): *void*

**Parameters:**

Name | Type |
------ | ------ |
`treeIndex` | number |

**Returns:** *Promise‹void›*

Promise that is resolved once the iteration is done.

___

####  mapFromCdfToModelCoordinates

▸ **mapFromCdfToModelCoordinates**(`p`: Vector3, `out?`: THREE.Vector3): *Vector3*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:124](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L124)*

Maps a position retrieved from the CDF API (e.g. 3D node information) to
coordinates in "ThreeJS model space". This is necessary because CDF has a right-handed
Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`p` | Vector3 | The CDF coordinate to transform |
`out?` | THREE.Vector3 | Optional preallocated buffer for storing the result  |

**Returns:** *Vector3*

___

####  mapNodeIdToTreeIndex

▸ **mapNodeIdToTreeIndex**(`nodeId`: CogniteInternalId): *Promise‹number›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:571](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L571)*

Maps a single node ID to tree index. This is useful when you e.g. have a
node ID from an asset mapping and want to highlight the given asset using
[selectNodeByTreeIndex](#selectnodebytreeindex). If you have multiple node IDs to map,
[mapNodeIdsToTreeIndices](#mapnodeidstotreeindices) is recommended for better performance.

**`throws`** If an invalid/non-existant node ID is provided the function throws an error.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`nodeId` | CogniteInternalId | A Node ID to map to a tree index. |

**Returns:** *Promise‹number›*

treeIndex of the provided node.

___

####  mapNodeIdsToTreeIndices

▸ **mapNodeIdsToTreeIndices**(`nodeIds`: CogniteInternalId[]): *Promise‹number[]›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:557](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L557)*

Maps a list of Node IDs to tree indices. This function is useful when you have
a list of nodes, e.g. from Asset Mappings, that you want to highlight, hide,
color etc in the viewer.

**`throws`** If an invalid/non-existant node ID is provided the function throws an error.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`nodeIds` | CogniteInternalId[] | List of node IDs to map to tree indices. |

**Returns:** *Promise‹number[]›*

A list of tree indices corresponing to the elements in the input.

___

####  mapPositionFromModelToCdfCoordinates

▸ **mapPositionFromModelToCdfCoordinates**(`p`: Vector3, `out?`: THREE.Vector3): *Vector3*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:138](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L138)*

Maps from a 3D position in "ThreeJS model space" (e.g. a ray intersection coordinate)
to coordinates in "CDF space". This is necessary because CDF has a right-handed
Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`p` | Vector3 | The ThreeJS coordinate to transform |
`out?` | THREE.Vector3 | Optional preallocated buffer for storing the result  |

**Returns:** *Vector3*

___

####  mapTreeIndexToNodeId

▸ **mapTreeIndexToNodeId**(`treeIndex`: number): *Promise‹CogniteInternalId›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:598](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L598)*

Maps a single tree index to node ID for use with the API. If you have multiple
tree indices to map, [mapNodeIdsToTreeIndices](#mapnodeidstotreeindices) is recommended for better
performance.

**`throws`** If an invalid/non-existant node ID is provided the function throws an error.

**Parameters:**

Name | Type |
------ | ------ |
`treeIndex` | number |

**Returns:** *Promise‹CogniteInternalId›*

treeIndex of the provided node.

___

####  mapTreeIndicesToNodeIds

▸ **mapTreeIndicesToNodeIds**(`treeIndices`: number[]): *Promise‹CogniteInternalId[]›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:585](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L585)*

Maps a list of tree indices to node IDs for use with the Cognite SDK.
This function is useful if you have a list of tree indices, e.g. from
[Cognite3DModel.iterateSubtreeByTreeIndex](#iteratesubtreebytreeindex), and want to perform
some operations on these nodes using the SDK.

**`throws`** If an invalid tree index is provided the function throws an error.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`treeIndices` | number[] | Tree indices to map to node IDs |

**Returns:** *Promise‹CogniteInternalId[]›*

A list of node IDs corresponding to the elements of the inpu

___

####  resetAllNodeColors

▸ **resetAllNodeColors**(): *void*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:411](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L411)*

Restore original colors for all nodes.

**Returns:** *void*

___

####  resetNodeColor

▸ **resetNodeColor**(`nodeId`: number): *Promise‹void›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:392](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L392)*

Set original node color by node ID.
This method is async because node ID might be not loaded yet.

**`deprecated`** [Cognite3DModel.resetNodeColorByTreeIndex](#resetnodecolorbytreeindex)

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`nodeId` | number |   |

**Returns:** *Promise‹void›*

___

####  resetNodeColorByTreeIndex

▸ **resetNodeColorByTreeIndex**(`treeIndex`: number, `applyToChildren`: boolean): *Promise‹number›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:401](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L401)*

Set original node color by tree index.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`treeIndex` | number | - |   |
`applyToChildren` | boolean | false | - |

**Returns:** *Promise‹number›*

___

####  selectNode

▸ **selectNode**(`nodeId`: number): *Promise‹void›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:423](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L423)*

Highlight node by node ID.
This method is async because node ID might be not loaded yet.

**`deprecated`** {@link Use Cognite3DModel.selectNodeByTreeIndex}

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`nodeId` | number |   |

**Returns:** *Promise‹void›*

___

####  selectNodeByTreeIndex

▸ **selectNodeByTreeIndex**(`treeIndex`: number, `applyToChildren`: boolean): *Promise‹number›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:432](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L432)*

Highlight node by tree index.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`treeIndex` | number | - |   |
`applyToChildren` | boolean | false | - |

**Returns:** *Promise‹number›*

___

####  setNodeColor

▸ **setNodeColor**(`nodeId`: number, `r`: number, `g`: number, `b`: number): *Promise‹void›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:358](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L358)*

Set node color by node ID.
This method is async because nodeId might be not loaded yet.

**`deprecated`** Use [Cognite3DModel.setNodeColorByTreeIndex](#setnodecolorbytreeindex)

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`nodeId` | number | - |
`r` | number | Red component (0-255) |
`g` | number | Green component (0-255) |
`b` | number | Blue componenet (0-255)  |

**Returns:** *Promise‹void›*

___

####  setNodeColorByTreeIndex

▸ **setNodeColorByTreeIndex**(`treeIndex`: number, `r`: number, `g`: number, `b`: number, `applyToChildren`: boolean): *Promise‹number›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:372](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L372)*

Update color of a 3D node identified by it's tree index.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`treeIndex` | number | - | Tree index of the node to update |
`r` | number | - | Red component (0-255) |
`g` | number | - | Green component (0-255) |
`b` | number | - | Blue component (0-255) |
`applyToChildren` | boolean | false | When true, the color will be applied to all descendants |

**Returns:** *Promise‹number›*

Promise that resolves to number of nodes affected

___

####  showAllNodes

▸ **showAllNodes**(): *void*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:499](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L499)*

Show all the nodes that were hidden by [Cognite3DModel.hideNodeByTreeIndex](#hidenodebytreeindex),
[Cognite3DModel.hideNode](#hidenode) or [Cognite3DModel.hideAllNodes](#hideallnodes)

**Returns:** *void*

___

####  showNode

▸ **showNode**(`nodeId`: number): *Promise‹void›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:478](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L478)*

Show the node by node ID, that was hidden by [Cognite3DModel.hideNodeByTreeIndex](#hidenodebytreeindex),
[Cognite3DModel.hideNode](#hidenode) or [Cognite3DModel.hideAllNodes](#hideallnodes)
This method is async because nodeId might be not loaded yet.

**`deprecated`** Use [Cognite3DModel.showNodeByTreeIndex](#shownodebytreeindex)

**`example`** 
```js
model.hideAllNodes();
model.showNode(nodeId);
```

**Parameters:**

Name | Type |
------ | ------ |
`nodeId` | number |

**Returns:** *Promise‹void›*

___

####  showNodeByTreeIndex

▸ **showNodeByTreeIndex**(`treeIndex`: number, `applyToChildren`: boolean): *Promise‹number›*

*Defined in [viewer/src/public/migration/Cognite3DModel.ts:488](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DModel.ts#L488)*

Show the node by tree index, that was hidden by [Cognite3DModel.hideNodeByTreeIndex](#hidenodebytreeindex),
[Cognite3DModel.hideNode](#hidenode) or [Cognite3DModel.hideAllNodes](#hideallnodes)

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`treeIndex` | number | - |   |
`applyToChildren` | boolean | false | - |

**Returns:** *Promise‹number›*


<a name="classes_cognite3dviewer_cognite3dviewermd"></a>

[@cognite/reveal](#readmemd) › ["Cognite3DViewer"](#modules_cognite3dviewer_md) › [Cognite3DViewer](#classes_cognite3dviewer_cognite3dviewermd)

## Class: Cognite3DViewer

**`example`** 
```js
const viewer = new Cognite3DViewer({
  noBackground: true,
  sdk: CogniteClient({...})
});
```

**`module`** @cognite/reveal

### Hierarchy

* **Cognite3DViewer**

### Index

#### Constructors

* [constructor](#constructor)

#### Properties

* [domElement](#domelement)

#### Methods

* [addCadModel](#addcadmodel)
* [addModel](#addmodel)
* [addObject3D](#addobject3d)
* [addPointCloudModel](#addpointcloudmodel)
* [clearCache](#clearcache)
* [determineModelType](#determinemodeltype)
* [disableKeyboardNavigation](#disablekeyboardnavigation)
* [dispose](#dispose)
* [enableKeyboardNavigation](#enablekeyboardnavigation)
* [fitCameraToBoundingBox](#fitcameratoboundingbox)
* [fitCameraToModel](#fitcameratomodel)
* [forceRerender](#forcererender)
* [getCamera](#getcamera)
* [getCameraPosition](#getcameraposition)
* [getCameraTarget](#getcameratarget)
* [getIntersectionFromPixel](#getintersectionfrompixel)
* [getScene](#getscene)
* [getScreenshot](#getscreenshot)
* [getVersion](#getversion)
* [loadCameraFromModel](#loadcamerafrommodel)
* [off](#off)
* [on](#on)
* [removeObject3D](#removeobject3d)
* [setBackgroundColor](#setbackgroundcolor)
* [setCameraPosition](#setcameraposition)
* [setCameraTarget](#setcameratarget)
* [setSlicingPlanes](#setslicingplanes)
* [worldToScreen](#worldtoscreen)
* [isBrowserSupported](#static-isbrowsersupported)

### Constructors

####  constructor

\+ **new Cognite3DViewer**(`options`: [Cognite3DViewerOptions](#interfaces_types_cognite3dvieweroptionsmd)): *[Cognite3DViewer](#classes_cognite3dviewer_cognite3dviewermd)*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:115](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L115)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [Cognite3DViewerOptions](#interfaces_types_cognite3dvieweroptionsmd) |

**Returns:** *[Cognite3DViewer](#classes_cognite3dviewer_cognite3dviewermd)*

### Properties

####  domElement

• **domElement**: *HTMLElement*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:66](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L66)*

The DOM element the viewer will insert its rendering canvas into.
The DOM element can be specified in the options when the viewer is created.
If not specified, the DOM element will be created automatically.
The DOM element cannot be changed after the viewer has been created.

### Methods

####  addCadModel

▸ **addCadModel**(`options`: [AddModelOptions](#interfaces_types_addmodeloptionsmd)): *Promise‹[Cognite3DModel](#classes_cognite3dmodel_cognite3dmodelmd)›*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:347](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L347)*

Add a new CAD 3D model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](#fitcameratomodel) to see the model after the model has loaded

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

**Parameters:**

Name | Type |
------ | ------ |
`options` | [AddModelOptions](#interfaces_types_addmodeloptionsmd) |

**Returns:** *Promise‹[Cognite3DModel](#classes_cognite3dmodel_cognite3dmodelmd)›*

___

####  addModel

▸ **addModel**(`options`: [AddModelOptions](#interfaces_types_addmodeloptionsmd)): *Promise‹[Cognite3DModel](#classes_cognite3dmodel_cognite3dmodelmd) | [CognitePointCloudModel](#classes_cognitepointcloudmodel_cognitepointcloudmodelmd)›*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:321](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L321)*

Add a new model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](#fitcameratomodel) to see the model after the model has loaded

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

**Parameters:**

Name | Type |
------ | ------ |
`options` | [AddModelOptions](#interfaces_types_addmodeloptionsmd) |

**Returns:** *Promise‹[Cognite3DModel](#classes_cognite3dmodel_cognite3dmodelmd) | [CognitePointCloudModel](#classes_cognitepointcloudmodel_cognitepointcloudmodelmd)›*

___

####  addObject3D

▸ **addObject3D**(`object`: Object3D): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:493](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L493)*

Add a THREE.Object3D to the viewer

**`example`** 
```js
const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(),
  new THREE.MeshBasicMaterial()
);
viewer.addObject3D(sphere);
```

**Parameters:**

Name | Type |
------ | ------ |
`object` | Object3D |

**Returns:** *void*

___

####  addPointCloudModel

▸ **addPointCloudModel**(`options`: [AddModelOptions](#interfaces_types_addmodeloptionsmd)): *Promise‹[CognitePointCloudModel](#classes_cognitepointcloudmodel_cognitepointcloudmodelmd)›*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:408](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L408)*

Add a new pointcloud 3D model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](#fitcameratomodel) to see the model after the model has loaded

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

**Parameters:**

Name | Type |
------ | ------ |
`options` | [AddModelOptions](#interfaces_types_addmodeloptionsmd) |

**Returns:** *Promise‹[CognitePointCloudModel](#classes_cognitepointcloudmodel_cognitepointcloudmodelmd)›*

___

####  clearCache

▸ **clearCache**(): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:896](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L896)*

**`deprecated`** There is no cache anymore.

**`throws`** [NotSupportedInMigrationWrapperError](#classes_notsupportedinmigrationwrappererror_notsupportedinmigrationwrappererrormd)

**Returns:** *void*

___

####  determineModelType

▸ **determineModelType**(`modelId`: number, `revisionId`: number): *Promise‹SupportedModelTypes | ""›*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:471](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L471)*

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

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`modelId` | number | the model's id |
`revisionId` | number | the model's revision id  |

**Returns:** *Promise‹SupportedModelTypes | ""›*

empty string if type is not supported

___

####  disableKeyboardNavigation

▸ **disableKeyboardNavigation**(): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:750](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L750)*

Disables camera movement by pressing WASM or arrows keys.

**Returns:** *void*

___

####  dispose

▸ **dispose**(): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:215](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L215)*

Dispose of WebGL resources. Can be used to free up memory when the viewer is no longer in use.

**`see`** [https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects](https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects)
```ts
// Viewer is no longer in use, free up memory
viewer.dispose();
```

**Returns:** *void*

___

####  enableKeyboardNavigation

▸ **enableKeyboardNavigation**(): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:743](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L743)*

Allows to move camera with WASM or arrows keys.

**Returns:** *void*

___

####  fitCameraToBoundingBox

▸ **fitCameraToBoundingBox**(`box`: Box3, `duration?`: undefined | number, `radiusFactor`: number): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:713](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L713)*

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

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`box` | Box3 | - | The bounding box in world space |
`duration?` | undefined &#124; number | - | The duration of the animation moving the camera. Set this to 0 (zero) to disable animation. |
`radiusFactor` | number | 2 | The ratio of the distance from camera to center of box and radius of the box |

**Returns:** *void*

___

####  fitCameraToModel

▸ **fitCameraToModel**(`model`: [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd), `duration?`: undefined | number): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:689](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L689)*

Move camera to a place where the 3D model is visible.
It uses the bounding box of the 3D model and calls [Cognite3DViewer.fitCameraToBoundingBox](#fitcameratoboundingbox)

**`examples`** 
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

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`model` | [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd) | The 3D model |
`duration?` | undefined &#124; number | The duration of the animation moving the camera. Set this to 0 (zero) to disable animation. |

**Returns:** *void*

___

####  forceRerender

▸ **forceRerender**(): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:736](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L736)*

Typically used when you perform some changes and can't see them unless you move camera.
To fix this forceRerender might be used.

**Returns:** *void*

___

####  getCamera

▸ **getCamera**(): *Camera*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:580](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L580)*

**Returns:** *Camera*

the THREE.Camera used for rendering.

___

####  getCameraPosition

▸ **getCameraPosition**(): *Vector3*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:594](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L594)*

**Returns:** *Vector3*

camera's position in world space

___

####  getCameraTarget

▸ **getCameraTarget**(): *Vector3*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:604](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L604)*

**Returns:** *Vector3*

camera's target in world space

___

####  getIntersectionFromPixel

▸ **getIntersectionFromPixel**(`offsetX`: number, `offsetY`: number): *null | [Intersection](#interfaces_types_intersectionmd)*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:861](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L861)*

Raycasting model(s) for finding where the ray intersects with the model.

**`see`** [https://en.wikipedia.org/wiki/Ray_casting](https://en.wikipedia.org/wiki/Ray_casting)

**`example`** 
```js
const offsetX = 50 // pixels from the left
const offsetY = 100 // pixels from the top
const intersection = viewer.getIntersectionFromPixel(offsetX, offsetY);
if (intersection) // it was a hit
  console.log(
    'You hit model ', intersection.model,
    ' at the node with id ', intersection.nodeId,
    ' at this exact point ', intersection.point
  );
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`offsetX` | number | X coordinate in pixels (relative to the domElement) |
`offsetY` | number | Y coordinate in pixels (relative to the domElement) |

**Returns:** *null | [Intersection](#interfaces_types_intersectionmd)*

If there was an intersection then return the intersection object - otherwise it returns `null` if there were no intersections.

___

####  getScene

▸ **getScene**(): *Scene*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:587](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L587)*

**Returns:** *Scene*

the THREE.Scene used for rendering.

___

####  getScreenshot

▸ **getScreenshot**(`width`: number, `height`: number): *Promise‹string›*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:821](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L821)*

Take screenshot from the current camera position.

**`examples`** 
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

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`width` | number | this.canvas.width | Width of the final image. Default is current canvas size. |
`height` | number | this.canvas.height | Height of the final image. Default is current canvas size. |

**Returns:** *Promise‹string›*

A [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) of the image ('image/png')

___

####  getVersion

▸ **getVersion**(): *string*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:203](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L203)*

Returns reveal version installed

**Returns:** *string*

___

####  loadCameraFromModel

▸ **loadCameraFromModel**(`model`: [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd)): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:661](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L661)*

Attempts to load the camera settings from the settings stored for the
provided model. See [https://docs.cognite.com/api/v1/#operation/get3DRevision](https://docs.cognite.com/api/v1/#operation/get3DRevision)
and [https://docs.cognite.com/api/v1/#operation/update3DRevisions](https://docs.cognite.com/api/v1/#operation/update3DRevisions) for
information on how this setting is retrieved and stored. This setting can
also be changed through the 3D models management interface in Cognite Fusion.
If no camera configuration is stored in CDF, [Cognite3DViewer.fitCameraToModel](#fitcameratomodel)
is used as a fallback

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`model` | [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd) | The model to load camera settings from.  |

**Returns:** *void*

___

####  off

▸ **off**(`event`: "click" | "hover", `callback`: [PointerEventDelegate](#pointereventdelegate)): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:278](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L278)*

Remove event listener from the viewer
Call [Cognite3DViewer.on](#on) to add event listener

**Parameters:**

Name | Type |
------ | ------ |
`event` | "click" &#124; "hover" |
`callback` | [PointerEventDelegate](#pointereventdelegate) |

**Returns:** *void*

▸ **off**(`event`: "cameraChange", `callback`: [CameraChangeDelegate](#camerachangedelegate)): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:279](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L279)*

Remove event listener from the viewer
Call [Cognite3DViewer.on](#on) to add event listener

**Parameters:**

Name | Type |
------ | ------ |
`event` | "cameraChange" |
`callback` | [CameraChangeDelegate](#camerachangedelegate) |

**Returns:** *void*

___

####  on

▸ **on**(`event`: "click" | "hover", `callback`: [PointerEventDelegate](#pointereventdelegate)): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:247](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L247)*

Add event listener to the viewer.
Call [Cognite3DViewer.off](#off) to remove an event listener

**`example`** 
```js
const onClick = (event) => { console.log(event.offsetX, event.offsetY) };
viewer.on('click', onClick);
```

**Parameters:**

Name | Type |
------ | ------ |
`event` | "click" &#124; "hover" |
`callback` | [PointerEventDelegate](#pointereventdelegate) |

**Returns:** *void*

▸ **on**(`event`: "cameraChange", `callback`: [CameraChangeDelegate](#camerachangedelegate)): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:258](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L258)*

Add event listener to the viewer.
Call [Cognite3DViewer.off](#off) to remove an event listener

**`example`** 
```js
viewer.on('cameraChange', (position, target) => {
  console.log('Camera changed: ', position, target);
});
```

**Parameters:**

Name | Type |
------ | ------ |
`event` | "cameraChange" |
`callback` | [CameraChangeDelegate](#camerachangedelegate) |

**Returns:** *void*

___

####  removeObject3D

▸ **removeObject3D**(`object`: Object3D): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:512](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L512)*

Remove a THREE.Object3D from the viewer

**`example`** 
```js
const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(), new THREE.MeshBasicMaterial());
viewer.addObject3D(sphere);
viewer.removeObject3D(sphere);
```

**Parameters:**

Name | Type |
------ | ------ |
`object` | Object3D |

**Returns:** *void*

___

####  setBackgroundColor

▸ **setBackgroundColor**(`color`: Color): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:528](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L528)*

Sets the color used as the clear color of the renderer.

**Parameters:**

Name | Type |
------ | ------ |
`color` | Color |

**Returns:** *void*

___

####  setCameraPosition

▸ **setCameraPosition**(`position`: Vector3): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:623](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L623)*

**`example`** 
```js
// store position, target
const position = viewer.getCameraPosition();
const target = viewer.getCameraTarget();
// restore position, target
viewer.setCameraPosition(position);
viewer.setCameraTarget(target);
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`position` | Vector3 | Position in world space |

**Returns:** *void*

___

####  setCameraTarget

▸ **setCameraTarget**(`target`: Vector3): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:644](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L644)*

Set camera's target

**`example`** 
```js
// store position, target
const position = viewer.getCameraPosition();
const target = viewer.getCameraTarget();
// restore position, target
viewer.setCameraPosition(position);
viewer.setCameraTarget(target);
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`target` | Vector3 | Target in world space |

**Returns:** *void*

___

####  setSlicingPlanes

▸ **setSlicingPlanes**(`slicingPlanes`: Plane[]): *void*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:566](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L566)*

Sets per-pixel slicing planes. Pixels behind any of the planes will be sliced away.

**`examples`** 
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

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`slicingPlanes` | Plane[] | The planes to use for slicing |

**Returns:** *void*

___

####  worldToScreen

▸ **worldToScreen**(`point`: Vector3, `normalize?`: undefined | false | true): *Vector2 | null*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:788](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L788)*

Convert a point in world space to its coordinates in the canvas. This can be used to place HTML objects near 3D objects on top of the 3D viewer.

**`see`** [https://www.w3schools.com/graphics/canvas_coordinates.asp](https://www.w3schools.com/graphics/canvas_coordinates.asp)

**`examples`** 
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

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`point` | Vector3 | World space coordinate. |
`normalize?` | undefined &#124; false &#124; true | Optional. If true, coordinates are normalized into [0,1]. If false, the values are in the range [0, <canvas_size>). |

**Returns:** *Vector2 | null*

Returns 2D coordinates if the point is visible on screen, or `null` if object is outside screen.

___

#### `Static` isBrowserSupported

▸ **isBrowserSupported**(): *true*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:56](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L56)*

For now it just always returns true.

**`see`** https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#Browser_compatibility

**Returns:** *true*


<a name="classes_cognitepointcloudmodel_cognitepointcloudmodelmd"></a>

[@cognite/reveal](#readmemd) › ["CognitePointCloudModel"](#modules_cognitepointcloudmodel_md) › [CognitePointCloudModel](#classes_cognitepointcloudmodel_cognitepointcloudmodelmd)

## Class: CognitePointCloudModel

Represents a point clouds model loaded from CDF.

**`module`** @cognite/reveal

### Hierarchy

* Object3D

  ↳ **CognitePointCloudModel**

### Implements

* [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd)

### Index

#### Properties

* [modelId](#modelid)
* [revisionId](#revisionid)
* [type](#type)

#### Accessors

* [pointBudget](#pointbudget)
* [pointColorType](#pointcolortype)

#### Methods

* [dispose](#dispose)
* [getCameraConfiguration](#getcameraconfiguration)
* [getModelBoundingBox](#getmodelboundingbox)
* [updateTransformation](#updatetransformation)

### Properties

####  modelId

• **modelId**: *number*

*Defined in [viewer/src/public/migration/CognitePointCloudModel.ts:19](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CognitePointCloudModel.ts#L19)*

___

####  revisionId

• **revisionId**: *number*

*Defined in [viewer/src/public/migration/CognitePointCloudModel.ts:20](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CognitePointCloudModel.ts#L20)*

___

####  type

• **type**: *SupportedModelTypes* = "pointcloud"

*Implementation of [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd).[type](#type)*

*Overrides void*

*Defined in [viewer/src/public/migration/CognitePointCloudModel.ts:18](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CognitePointCloudModel.ts#L18)*

### Accessors

####  pointBudget

• **get pointBudget**(): *number*

*Defined in [viewer/src/public/migration/CognitePointCloudModel.ts:75](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CognitePointCloudModel.ts#L75)*

The point budget limits the number of points loaded and rendered at any given time,
which helps to adapt performance requirements to the capabilities of different hardware.
Recommended values are between 500.000  and 10.000.000.

**Returns:** *number*

• **set pointBudget**(`count`: number): *void*

*Defined in [viewer/src/public/migration/CognitePointCloudModel.ts:84](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CognitePointCloudModel.ts#L84)*

The point budget limits the number of points loaded and rendered at any given time,
which helps to adapt performance requirements to the capabilities of different hardware.
Recommended values are between 500.000  and 10.000.000.

**Parameters:**

Name | Type |
------ | ------ |
`count` | number |

**Returns:** *void*

___

####  pointColorType

• **get pointColorType**(): *PotreePointColorType*

*Defined in [viewer/src/public/migration/CognitePointCloudModel.ts:88](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CognitePointCloudModel.ts#L88)*

**Returns:** *PotreePointColorType*

• **set pointColorType**(`type`: PotreePointColorType): *void*

*Defined in [viewer/src/public/migration/CognitePointCloudModel.ts:99](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CognitePointCloudModel.ts#L99)*

**`see`** {@link PotreePointColorType} for available types

**`example`** 
```js
model.pointColorType = PotreePointColorType.Rgb
```

**Parameters:**

Name | Type |
------ | ------ |
`type` | PotreePointColorType |

**Returns:** *void*

### Methods

####  dispose

▸ **dispose**(): *void*

*Implementation of [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd)*

*Defined in [viewer/src/public/migration/CognitePointCloudModel.ts:35](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CognitePointCloudModel.ts#L35)*

Used to clean up memory.

**Returns:** *void*

___

####  getCameraConfiguration

▸ **getCameraConfiguration**(): *[CameraConfiguration](#cameraconfiguration) | undefined*

*Implementation of [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd)*

*Defined in [viewer/src/public/migration/CognitePointCloudModel.ts:62](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CognitePointCloudModel.ts#L62)*

Retrieves the camera position and target stored for the model. Typically this
is used to store a good starting position for a model. Returns `undefined` if there
isn't any stored camera configuration for the model.

**Returns:** *[CameraConfiguration](#cameraconfiguration) | undefined*

___

####  getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`: THREE.Box3): *Box3*

*Implementation of [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd)*

*Defined in [viewer/src/public/migration/CognitePointCloudModel.ts:53](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CognitePointCloudModel.ts#L53)*

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

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`outBbox?` | THREE.Box3 | Optional. Used to write result to. |

**Returns:** *Box3*

model's bounding box.

___

####  updateTransformation

▸ **updateTransformation**(`matrix`: Matrix4): *void*

*Defined in [viewer/src/public/migration/CognitePointCloudModel.ts:70](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CognitePointCloudModel.ts#L70)*

Apply transformation matrix to the model.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`matrix` | Matrix4 | Matrix to be applied.  |

**Returns:** *void*


<a name="classes_notsupportedinmigrationwrappererror_notsupportedinmigrationwrappererrormd"></a>

[@cognite/reveal](#readmemd) › ["NotSupportedInMigrationWrapperError"](#modules_notsupportedinmigrationwrappererror_md) › [NotSupportedInMigrationWrapperError](#classes_notsupportedinmigrationwrappererror_notsupportedinmigrationwrappererrormd)

## Class: NotSupportedInMigrationWrapperError

Error that is thrown for certain type of functionality that was supported in @cognite/3d-viewer,
but not in @cognite/reveal.

**`module`** @cognite/reveal

### Hierarchy

* [Error](#static-error)

  ↳ **NotSupportedInMigrationWrapperError**

### Index

#### Constructors

* [constructor](#constructor)

#### Properties

* [message](#message)
* [name](#name)
* [stack](#optional-stack)
* [Error](#static-error)

### Constructors

####  constructor

\+ **new NotSupportedInMigrationWrapperError**(`message?`: undefined | string): *[NotSupportedInMigrationWrapperError](#classes_notsupportedinmigrationwrappererror_notsupportedinmigrationwrappererrormd)*

*Defined in [viewer/src/public/migration/NotSupportedInMigrationWrapperError.ts:10](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/NotSupportedInMigrationWrapperError.ts#L10)*

**Parameters:**

Name | Type |
------ | ------ |
`message?` | undefined &#124; string |

**Returns:** *[NotSupportedInMigrationWrapperError](#classes_notsupportedinmigrationwrappererror_notsupportedinmigrationwrappererrormd)*

### Properties

####  message

• **message**: *string*

*Inherited from [NotSupportedInMigrationWrapperError](#classes_notsupportedinmigrationwrappererror_notsupportedinmigrationwrappererrormd).[message](#message)*

Defined in documentation/node_modules/typescript/lib/lib.es5.d.ts:974

___

####  name

• **name**: *string*

*Inherited from [NotSupportedInMigrationWrapperError](#classes_notsupportedinmigrationwrappererror_notsupportedinmigrationwrappererrormd).[name](#name)*

Defined in documentation/node_modules/typescript/lib/lib.es5.d.ts:973

___

#### `Optional` stack

• **stack**? : *undefined | string*

*Inherited from [NotSupportedInMigrationWrapperError](#classes_notsupportedinmigrationwrappererror_notsupportedinmigrationwrappererrormd).[stack](#optional-stack)*

Defined in documentation/node_modules/typescript/lib/lib.es5.d.ts:975

___

#### `Static` Error

▪ **Error**: *ErrorConstructor*

Defined in documentation/node_modules/typescript/lib/lib.es5.d.ts:984

# Interfaces


<a name="interfaces_cognitemodelbase_cognitemodelbasemd"></a>

[@cognite/reveal](#readmemd) › ["CogniteModelBase"](#modules_cognitemodelbase_md) › [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd)

## Interface: CogniteModelBase

Base class for 3D models supported by [Cognite3DViewer](#classes_cognite3dviewer_cognite3dviewermd).

**`module`** @cognite/reveal

### Hierarchy

* **CogniteModelBase**

### Implemented by

* [Cognite3DModel](#classes_cognite3dmodel_cognite3dmodelmd)
* [CognitePointCloudModel](#classes_cognitepointcloudmodel_cognitepointcloudmodelmd)

### Index

#### Properties

* [type](#type)

#### Methods

* [dispose](#dispose)
* [getCameraConfiguration](#getcameraconfiguration)
* [getModelBoundingBox](#getmodelboundingbox)

### Properties

####  type

• **type**: *SupportedModelTypes*

*Defined in [viewer/src/public/migration/CogniteModelBase.ts:13](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CogniteModelBase.ts#L13)*

### Methods

####  dispose

▸ **dispose**(): *void*

*Defined in [viewer/src/public/migration/CogniteModelBase.ts:14](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CogniteModelBase.ts#L14)*

**Returns:** *void*

___

####  getCameraConfiguration

▸ **getCameraConfiguration**(): *[CameraConfiguration](#cameraconfiguration) | undefined*

*Defined in [viewer/src/public/migration/CogniteModelBase.ts:16](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CogniteModelBase.ts#L16)*

**Returns:** *[CameraConfiguration](#cameraconfiguration) | undefined*

___

####  getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`: THREE.Box3): *Box3*

*Defined in [viewer/src/public/migration/CogniteModelBase.ts:15](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/CogniteModelBase.ts#L15)*

**Parameters:**

Name | Type |
------ | ------ |
`outBbox?` | THREE.Box3 |

**Returns:** *Box3*


<a name="interfaces_types_addmodeloptionsmd"></a>

[@cognite/reveal](#readmemd) › ["types"](#modules_types_md) › [AddModelOptions](#interfaces_types_addmodeloptionsmd)

## Interface: AddModelOptions

**`module`** @cognite/reveal

### Hierarchy

* **AddModelOptions**

### Index

#### Properties

* [geometryFilter](#optional-geometryfilter)
* [localPath](#optional-localpath)
* [modelId](#modelid)
* [onComplete](#optional-oncomplete)
* [orthographicCamera](#optional-orthographiccamera)
* [revisionId](#revisionid)

### Properties

#### `Optional` geometryFilter

• **geometryFilter**? : *[GeometryFilter](#interfaces_types_geometryfiltermd)*

*Defined in [viewer/src/public/migration/types.ts:78](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L78)*

___

#### `Optional` localPath

• **localPath**? : *undefined | string*

*Defined in [viewer/src/public/migration/types.ts:77](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L77)*

___

####  modelId

• **modelId**: *number*

*Defined in [viewer/src/public/migration/types.ts:74](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L74)*

___

#### `Optional` onComplete

• **onComplete**? : *undefined | function*

*Defined in [viewer/src/public/migration/types.ts:80](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L80)*

___

#### `Optional` orthographicCamera

• **orthographicCamera**? : *undefined | false | true*

*Defined in [viewer/src/public/migration/types.ts:79](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L79)*

___

####  revisionId

• **revisionId**: *number*

*Defined in [viewer/src/public/migration/types.ts:75](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L75)*


<a name="interfaces_types_cognite3dvieweroptionsmd"></a>

[@cognite/reveal](#readmemd) › ["types"](#modules_types_md) › [Cognite3DViewerOptions](#interfaces_types_cognite3dvieweroptionsmd)

## Interface: Cognite3DViewerOptions

**`module`** @cognite/reveal

### Hierarchy

* **Cognite3DViewerOptions**

### Index

#### Properties

* [domElement](#optional-domelement)
* [enableCache](#optional-enablecache)
* [highlightColor](#optional-highlightcolor)
* [logMetrics](#optional-logmetrics)
* [noBackground](#optional-nobackground)
* [onLoading](#optional-onloading)
* [renderer](#optional-renderer)
* [sdk](#sdk)
* [viewCube](#optional-viewcube)

### Properties

#### `Optional` domElement

• **domElement**? : *HTMLElement*

*Defined in [viewer/src/public/migration/types.ts:32](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L32)*

An existing DOM element that we will render canvas into.

___

#### `Optional` enableCache

• **enableCache**? : *undefined | false | true*

*Defined in [viewer/src/public/migration/types.ts:47](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L47)*

**`deprecated`** and not supported

___

#### `Optional` highlightColor

• **highlightColor**? : *THREE.Color*

*Defined in [viewer/src/public/migration/types.ts:38](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L38)*

**`deprecated`** and ignored

___

#### `Optional` logMetrics

• **logMetrics**? : *undefined | false | true*

*Defined in [viewer/src/public/migration/types.ts:35](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L35)*

Send anonymous usage statistics.

___

#### `Optional` noBackground

• **noBackground**? : *undefined | false | true*

*Defined in [viewer/src/public/migration/types.ts:41](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L41)*

**`deprecated`** and ignored

___

#### `Optional` onLoading

• **onLoading**? : *[OnLoadingCallback](#onloadingcallback)*

*Defined in [viewer/src/public/migration/types.ts:53](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L53)*

Callback to download stream progress

___

#### `Optional` renderer

• **renderer**? : *THREE.WebGLRenderer*

*Defined in [viewer/src/public/migration/types.ts:50](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L50)*

Renderer used to visualize model (optional).

___

####  sdk

• **sdk**: *CogniteClient*

*Defined in [viewer/src/public/migration/types.ts:29](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L29)*

___

#### `Optional` viewCube

• **viewCube**? : *"topleft" | "topright" | "bottomleft" | "bottomright"*

*Defined in [viewer/src/public/migration/types.ts:44](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L44)*

**`deprecated`** and not supported


<a name="interfaces_types_geometryfiltermd"></a>

[@cognite/reveal](#readmemd) › ["types"](#modules_types_md) › [GeometryFilter](#interfaces_types_geometryfiltermd)

## Interface: GeometryFilter

**`module`** @cognite/reveal

### Hierarchy

* **GeometryFilter**

### Index

#### Properties

* [boundingBox](#optional-boundingbox)

### Properties

#### `Optional` boundingBox

• **boundingBox**? : *THREE.Box3*

*Defined in [viewer/src/public/migration/types.ts:67](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L67)*


<a name="interfaces_types_intersectionmd"></a>

[@cognite/reveal](#readmemd) › ["types"](#modules_types_md) › [Intersection](#interfaces_types_intersectionmd)

## Interface: Intersection

Represents the result from {@link Cognite3DViewer.getInterSectionFromPixel}.

**`module`** @cognite/reveal

### Hierarchy

* **Intersection**

### Index

#### Properties

* [model](#model)
* [point](#point)
* [treeIndex](#treeindex)

### Properties

####  model

• **model**: *[Cognite3DModel](#classes_cognite3dmodel_cognite3dmodelmd)*

*Defined in [viewer/src/public/migration/types.ts:88](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L88)*

___

####  point

• **point**: *Vector3*

*Defined in [viewer/src/public/migration/types.ts:90](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L90)*

___

####  treeIndex

• **treeIndex**: *number*

*Defined in [viewer/src/public/migration/types.ts:89](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L89)*

# Modules


<a name="modules_cognite3dmodel_md"></a>

[@cognite/reveal](#readmemd) › ["Cognite3DModel"](#modules_cognite3dmodel_md)

## Module: "Cognite3DModel"

### Index

#### Classes

* [Cognite3DModel](#classes_cognite3dmodel_cognite3dmodelmd)


<a name="modules_cognite3dviewer_md"></a>

[@cognite/reveal](#readmemd) › ["Cognite3DViewer"](#modules_cognite3dviewer_md)

## Module: "Cognite3DViewer"

### Index

#### Classes

* [Cognite3DViewer](#classes_cognite3dviewer_cognite3dviewermd)

#### Type aliases

* [CameraChangeDelegate](#camerachangedelegate)
* [PointerEventDelegate](#pointereventdelegate)

### Type aliases

####  CameraChangeDelegate

Ƭ **CameraChangeDelegate**: *function*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:35](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L35)*

##### Type declaration:

▸ (`position`: Vector3, `target`: Vector3): *void*

**Parameters:**

Name | Type |
------ | ------ |
`position` | Vector3 |
`target` | Vector3 |

___

####  PointerEventDelegate

Ƭ **PointerEventDelegate**: *function*

*Defined in [viewer/src/public/migration/Cognite3DViewer.ts:34](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/Cognite3DViewer.ts#L34)*

##### Type declaration:

▸ (`event`: object): *void*

**Parameters:**

▪ **event**: *object*

Name | Type |
------ | ------ |
`offsetX` | number |
`offsetY` | number |


<a name="modules_cognitemodelbase_md"></a>

[@cognite/reveal](#readmemd) › ["CogniteModelBase"](#modules_cognitemodelbase_md)

## Module: "CogniteModelBase"

### Index

#### Interfaces

* [CogniteModelBase](#interfaces_cognitemodelbase_cognitemodelbasemd)


<a name="modules_cognitepointcloudmodel_md"></a>

[@cognite/reveal](#readmemd) › ["CognitePointCloudModel"](#modules_cognitepointcloudmodel_md)

## Module: "CognitePointCloudModel"

### Index

#### Classes

* [CognitePointCloudModel](#classes_cognitepointcloudmodel_cognitepointcloudmodelmd)


<a name="modules_nodeidandtreeindexmaps_md"></a>

[@cognite/reveal](#readmemd) › ["NodeIdAndTreeIndexMaps"](#modules_nodeidandtreeindexmaps_md)

## Module: "NodeIdAndTreeIndexMaps"




<a name="modules_notsupportedinmigrationwrappererror_md"></a>

[@cognite/reveal](#readmemd) › ["NotSupportedInMigrationWrapperError"](#modules_notsupportedinmigrationwrappererror_md)

## Module: "NotSupportedInMigrationWrapperError"

### Index

#### Classes

* [NotSupportedInMigrationWrapperError](#classes_notsupportedinmigrationwrappererror_notsupportedinmigrationwrappererrormd)


<a name="modules_rendercontroller_md"></a>

[@cognite/reveal](#readmemd) › ["RenderController"](#modules_rendercontroller_md)

## Module: "RenderController"




<a name="modules_types_md"></a>

[@cognite/reveal](#readmemd) › ["types"](#modules_types_md)

## Module: "types"

### Index

#### Interfaces

* [AddModelOptions](#interfaces_types_addmodeloptionsmd)
* [Cognite3DViewerOptions](#interfaces_types_cognite3dvieweroptionsmd)
* [GeometryFilter](#interfaces_types_geometryfiltermd)
* [Intersection](#interfaces_types_intersectionmd)

#### Type aliases

* [CameraConfiguration](#cameraconfiguration)
* [Color](#color)
* [OnLoadingCallback](#onloadingcallback)

### Type aliases

####  CameraConfiguration

Ƭ **CameraConfiguration**: *object*

*Defined in [viewer/src/utilities/types.ts:50](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/utilities/types.ts#L50)*

Represents a camera configuration, consisting of a camera position and target.

##### Type declaration:

* **position**: *Vector3*

* **target**: *Vector3*

___

####  Color

Ƭ **Color**: *object*

*Defined in [viewer/src/public/migration/types.ts:13](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L13)*

**`module`** @cognite/reveal

##### Type declaration:

* **b**: *number*

* **g**: *number*

* **r**: *number*

___

####  OnLoadingCallback

Ƭ **OnLoadingCallback**: *function*

*Defined in [viewer/src/public/migration/types.ts:23](https://github.com/cognitedata/reveal/blob/a10933e/viewer/src/public/migration/types.ts#L23)*

Callback to monitor downloaded requests and progress.
Use OnLoadingCallback instead of onProgress/onComplete.

**`module`** @cognite/reveal

##### Type declaration:

▸ (`itemsDownloaded`: number, `itemsRequested`: number): *void*

**Parameters:**

Name | Type |
------ | ------ |
`itemsDownloaded` | number |
`itemsRequested` | number |
