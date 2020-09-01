---
id: migration-guide
title: Migrating from @cognite/3d-viewer
hide_title: true
description: This page describes the differences between Reveal viewer and @cognite/3d-viewer, which is an older version of Reveal with similar functionality. 
---

# Migrating from [@cognite/3d‑viewer](https://www.npmjs.com/package/@cognite/3d-viewer)

`@cognite/3d-viewer` is an older version of Reveal that has similar functionality to this package. However, some important differences caused us to switch the package name to `@cognite/reveal`.

- `@cognite/3d-viewer` downloads all geometry when a model is loaded. This causes higher initial loading time, but potentially increases the performance once the data has been loaded. It also limits the size of the models that can be loaded. The new version, `@cognite/reveal`, is based on "streaming geometry" which downloads necessary geometry within a budget as the camera moved. This enables support for very complex 3D models and reduces the initial loading time.
- `@cognite/3d-viewer` supports styling 3D nodes by node ID. In `@cognite/reveal` the recommended approach is to use tree indices instead. See [Styling nodes](#styling-nodes) for more information. For an introduction to the differences between these concepts, see [Concepts](./concepts.md). The new component supports [mapping between the two identifiers](#accessing-node-information-and-mapping-between-node-ids-and-tree-indices) when necessary.
- `@cognite/reveal` supports styling a 3D node and all it's children in one operation. In `@cognite/3d-viewer` it's necessary to iterate over all children and manually apply the same change to all nodes.
- `@cognite/reveal` supports point cloud models. This is not supported in `@cognite/3d-viewer`.

The APIs are very similar and the functionality provided in `@cognite/reveal` should feel familiar. There are several operations supported in `@cognite/3d-viewer` which isn't supported by `@cognite/reveal`, but these have been replaced by alternatives that should provide similar functionality.

## Styling nodes

In `@cognite/3d-viewer`, there are several functions for manipulating the styling of 3D nodes. These functions identify nodes by their node IDs. In `@cognite/reveal` similar functions exist, but these identify the nodes by their tree indices. It's therefor necessary to migrate to the new functions.

### Coloring nodes

- `Cognite3DModel.setNodeColor(nodeId, r, g, b)` has been replaced by `setNodeColorByTreeIndex(treeIndex, r, g, b, applyToChildren?)`
- `Cognite3DModel.resetNodeColor(nodeId)` has been replaced by `resetNodeColorByTreeIndex(treeIndex, applyToChildren?)`
- `Cognite3DModel.getNodeColor(nodeId)` is no longer supported
- `Cognite3DModel.resetAllNodeColors()` has been added to the API

The new functions identify nodes by tree index rather than node ID. It also supports applying the same color to all children of the identified node. Note that the functions identifying nodes by node ID will work, but will be slower and use is not recommended.

### Selecting/highlighting nodes

- `Cognite3DModel.selectNode(nodeId)` has been replaced by `selectNodeByTreeIndex(treeIndex, applyToChildren?)`
- `Cognite3DModel.deselectNode(nodeId)` has been replaced by `deselectNodeByTreeIndex(treeIndex, applyToChildren?)`
- `Cognite3DModel.deselectAllNodes()` works equally in both components

The new functions identify nodes by tree index rather than node ID. It also supports selecting/highlighting all children of the identified node. Note that the functions identifying nodes by node ID will work, but will be slower and use is not recommended.

### Controlling node visibility

- `Cognite3DModel.showNode(nodeId)` has been replaced by `showNodeByTreeIndex(treeIndex, applyToChildren?)`
- `Cognite3DModel.hideNode(nodeId)` has been replaced by `hideNodeByTreeIndex(treeIndex, applyToChildren?)`
- `Cognite3DModel.showAllNodes()` works equally in both components
- `Cognite3DModel.hideAllNodes(makeGray?)` doesn't support setting `makeGray` any longer

The new functions identify nodes by tree index rather than node ID. It also supports showing/hiding all children of the identified node. Note that the functions identifying nodes by node ID will work, but will be slower and use is not recommended.

## Node visitor functions

Reveal has functions for iterating over nodes, either all nodes in a 3D model or a subtree of a parent node.

- `Cognite3DModel.iterateNodes(action: (nodeId, treeIndex) => void): Promise<boolean>` has been replaced by `iterateNodesByTreeIndex(action: (treeIndex) => void): Promise<number>`. Returns number of visited nodes.
- `Cognite3DModel.iterateSubtree(nodeId, action: (nodeId, treeIndex) => void, treeIndex?, subtreeSize?)` has been replaced by `iterateSubtreeByTreeIndex(treeIndex, action: (treeIndex) => void): Promise<number>`. Returns the number of visited nodes.

## Accessing node information and mapping between node IDs and tree indices

Reveal supports accessing information about 3D nodes through the [Cognite SDK](https://cognitedata.github.io/cognite-sdk-js/classes/revisions3dapi.html). However, the SDK identifies nodes by node ID, not tree index. It might be necessary to map between the two concepts. `async Cognite3DModel.mapNodeIdsToTreeIndices(nodeIds)` and `async Cognite3DModel.mapTreeIndicesToNodeIds(treeIndices)` provides such functionality. Note that the operation requires communication with CDF servers and should be kept at a minimum. If possible the calls should be batched to achieve the best performance.

Access to node information such as name, bounding box and properties/attributes is done through the [3D revision API](https://cognitedata.github.io/cognite-sdk-js/classes/revisions3dapi.html), specifically:

- [`list3DNodes`](https://cognitedata.github.io/cognite-sdk-js/classes/revisions3dapi.html#list3dnodes) for retrieving a set of nodes using a filter
- [`list3DNodeAncestors`](https://cognitedata.github.io/cognite-sdk-js/classes/revisions3dapi.html#list3dnodeancestors) for retrieving ancestors of a specific node
- [`retrieve3DNodes`](https://cognitedata.github.io/cognite-sdk-js/classes/revisions3dapi.html#retrieve3dnodes) for retrieving a set of nodes identified by their node ids

This is not changed from `@cognite/3d-viewer`.

## Working with asset mappings

[3D Asset Mappings](https://docs.cognite.com/api/v1/#tag/3D-Asset-Mapping) enables mapping 3D nodes to [assets](https://docs.cognite.com/api/v1/#tag/Assets). A mapping is a link from `assetId` to `nodeId`, so to use these with Reveal it's necessary to map these to tree indices using `async Cognite3DModel.mapNodeIdsToTreeIndices(nodeIds)`.

## Ray picking and intersection for handling click events

In `@cognite/3d-viewer` `Cognite3dViewer.getIntersectionFromPixel` optionally accepts a `model`-argument to restrict the result to a single model. Support for this has been removed in `@cognite/reveal`.

## Other differences

There are a few other noticeable changes from `@cognite/3d-viewer` and `@cognite/reveal`:

- `@cognite/3d-viewer` supports local caching to reduce the time to load previously opened 3D models. Currently, this is not supported by `@cognite/reveal`, but the need for such functionality is reduced by adding streaming capabilities.
- In `@cognite/3d-viewer` `Cognite3DViewer.addModel(...)` will always return a `Cognite3DModel`. In `@cognite/reveal` this function might also return a `CognitePointCloudModel`. To explicitly add a CAD model or point cloud model use `Cognite3DViewer.addCadModel(...)` or `Cognite3DViewer.addPointCloudModel(...)`
- [`Cognite3DViewer.loadCameraFromModel(...)`](./API%20Reference.md#loadCameraFromModel) has been added for loading camera settings from CDF when available.