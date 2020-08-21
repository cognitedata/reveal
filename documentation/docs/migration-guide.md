---
id: migration-guide
title: Migrating from @cognite/3d-viewer
hide_title: true
---

# Migrating from [@cognite/3d‑viewer](https://www.npmjs.com/package/@cognite/3d-viewer)

`@cognite/3d-viewer` is an older version of Reveal that has similar functionality to this package. However, some important differences caused us to switch the package name:
- `@cognite/reveal` is based on "streaming geometry" which downloads necessary geometry within a budget as the camera moves, while `@cognite/3d-viewer` downloads all geometry up front. This causes higher initial loading time, but potentially increases the performance once the data has been loaded. It also limits the size of the models that can be loaded into view.
- `@cognite/3d-viewer` supports styling 3D nodes by node ID. In `@cognite/reveal` the recommended approach is to use tree indices instead. For an introduction to the differences between these concepts, see [Concepts](./concepts). The new component supports mapping between the two identifiers when necessary.
- `@cognite/reveal` supports styling a 3D node and all it's children in one operation. In `@cognite/3d-viewer` it's necessary to iterate over all children and manually apply the same change to all nodes.
- `@cognite/reveal` supports point cloud models. This is not supported in `@cognite/3d-viewer`.
- `@cognite/3d-viewer` supports local caching to reduce the time to load previously opened 3D models. Currently, this is not supported by `@cognite/reveal`, but the need for such functionality is reduced by adding streaming capabilities.

The APIs are very similar and the functionality provided in `@cognite/reveal` should feel familiar. There are several operations supported in `@cognite/3d-viewer` which isn't supported by `@cognite/reveal`, but these have been replaced by alternatives that should provide similar functionality.

## Styling nodes

In `@cognite/3d-viewer`, there are several functions for manipulating the styling of 3D nodes.

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

### Controlling visibility of nodes

- `Cognite3DModel.showNode(nodeId)` has been replaced by `showNodeByTreeIndex(treeIndex, applyToChildren?)`
- `Cognite3DModel.hideNode(nodeId)` has been replaced by `hideNodeByTreeIndex(treeIndex, applyToChildren?)`
- `Cognite3DModel.showAllNodes()` works equally in both components
- `Cognite3DModel.hideAllNodes(makeGray?)` doesn't support setting `makeGray` any longer

The new functions identify nodes by tree index rather than node ID. It also supports showing/hiding all children of the identified node. Note that the functions identifying nodes by node ID will work, but will be slower and use is not recommended.

## Accessing node information

## Geometry filtering

## Working with asset mappings

**This page is work in progress.**

API is mostly the same, but you don't have all model nodes at once, because streaming is used. 

<!--- TODO: write migration guide --->
<!--- notes:
* Cognite3DViewer.getIntersectionFromPixel doesn't have the model param
* Cognite3DViewer.clearCache is not supported
* Cognite3DViewer.addModel now can return any supported model type, not only cad. For cad use addCadModel
* Cognite3DViewerOptions.onLoading, use OnLoadingCallback instead of onProgress/onComplete.

# Cognite3DModel
* model getBoundingBox doesn't support nodeId parameter - use getBoundingBoxFromCdf 
* hideAllNodes doesn't support makeGray arg
* iterateNodes is not supported
* iterateSubtree is not supported
* getSubtreeNodeIds is not supported
--->
