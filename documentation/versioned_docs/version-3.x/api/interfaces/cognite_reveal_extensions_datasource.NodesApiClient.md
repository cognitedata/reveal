---
id: "cognite_reveal_extensions_datasource.NodesApiClient"
title: "Interface: NodesApiClient"
sidebar_label: "NodesApiClient"
custom_edit_url: null
---

[@cognite/reveal/extensions/datasource](../modules/cognite_reveal_extensions_datasource.md).NodesApiClient

Client for retrieving metadata information about CAD nodes.

## Methods

### determineNodeAncestorsByNodeId

▸ **determineNodeAncestorsByNodeId**(`modelId`, `revisionId`, `nodeId`, `generation`): `Promise`\<\{ `subtreeSize`: `number` ; `treeIndex`: `number`  }\>

Determine ancestor subtree span of a given node. If the node doesn't have an
ancestor at the generation given, the span of the root node is returned.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `modelId` | `number` | ID of 3D model |
| `revisionId` | `number` | ID of 3D model revision |
| `nodeId` | `number` | Node ID of node |
| `generation` | `number` | Generation to retrieve (0 means node itself, 1 is parent, 2 grand-parent etc). |

#### Returns

`Promise`\<\{ `subtreeSize`: `number` ; `treeIndex`: `number`  }\>

#### Defined in

[packages/nodes-api/src/NodesApiClient.ts:51](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/nodes-api/src/NodesApiClient.ts#L51)

___

### determineTreeIndexAndSubtreeSizesByNodeIds

▸ **determineTreeIndexAndSubtreeSizesByNodeIds**(`modelId`, `revisionId`, `nodeIds`): `Promise`\<\{ `subtreeSize`: `number` ; `treeIndex`: `number`  }[]\>

Determines tree index and subtreeSize (i.e. span of the subtree a node is parent
of) given a set of node IDs.

#### Parameters

| Name | Type |
| :------ | :------ |
| `modelId` | `number` |
| `revisionId` | `number` |
| `nodeIds` | `number`[] |

#### Returns

`Promise`\<\{ `subtreeSize`: `number` ; `treeIndex`: `number`  }[]\>

#### Defined in

[packages/nodes-api/src/NodesApiClient.ts:37](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/nodes-api/src/NodesApiClient.ts#L37)

___

### getBoundingBoxesByNodeIds

▸ **getBoundingBoxesByNodeIds**(`modelId`, `revisionId`, `nodeIds`): `Promise`\<`Box3`[]\>

Determines the bounds of the individual nodes provided. Note that the returned
boxes will be in "CDF coordinates" and not transformed using
the model transformation for the given model.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `modelId` | `number` | ID of 3D model |
| `revisionId` | `number` | ID of 3D model revision |
| `nodeIds` | `number`[] | Node IDs of nodes |

#### Returns

`Promise`\<`Box3`[]\>

#### Defined in

[packages/nodes-api/src/NodesApiClient.ts:67](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/nodes-api/src/NodesApiClient.ts#L67)

___

### mapNodeIdsToTreeIndices

▸ **mapNodeIdsToTreeIndices**(`modelId`, `revisionId`, `nodeIds`): `Promise`\<`number`[]\>

Maps a set of "node IDs" that identify nodes, to the respective
"tree indexes".

#### Parameters

| Name | Type |
| :------ | :------ |
| `modelId` | `number` |
| `revisionId` | `number` |
| `nodeIds` | `number`[] |

#### Returns

`Promise`\<`number`[]\>

#### Defined in

[packages/nodes-api/src/NodesApiClient.ts:27](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/nodes-api/src/NodesApiClient.ts#L27)

___

### mapTreeIndicesToNodeIds

▸ **mapTreeIndicesToNodeIds**(`modelId`, `revisionId`, `treeIndices`): `Promise`\<`number`[]\>

Maps a set of "tree indexes" that identify nodes, to the respective
"node IDs".

#### Parameters

| Name | Type |
| :------ | :------ |
| `modelId` | `number` |
| `revisionId` | `number` |
| `treeIndices` | `number`[] |

#### Returns

`Promise`\<`number`[]\>

#### Defined in

[packages/nodes-api/src/NodesApiClient.ts:17](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/nodes-api/src/NodesApiClient.ts#L17)
