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
- `@cognite/reveal` requires new output file formats. See [Preparing models](#preparing-models-for-use) below for details.

## API changes

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
Notice that all functions are async, and the action that you pass is not applied immediately.
A single model can have millions of nodes. That's why the iteration functions call the passed action step by step.
You can see it in action in our [node visiting example](./examples/node-visiting.mdx) where colors are applied gradually to nodes.

- `Cognite3DModel.iterateNodes(action: (nodeId, treeIndex) => void): Promise<boolean>` has been replaced by `iterateNodesByTreeIndex(action: (treeIndex) => void): Promise<void>`. Returns promise which resolves once iteration has done. 
- `Cognite3DModel.iterateSubtree(nodeId, action: (nodeId, treeIndex) => void, treeIndex?, subtreeSize?)` has been replaced by `iterateSubtreeByTreeIndex(treeIndex, action: (treeIndex) => void): Promise<number>`. Returns promise which resolves once iteration has done.

## Accessing node information and mapping between node IDs and tree indices

Reveal supports accessing information about 3D nodes through the [Cognite SDK](https://cognitedata.github.io/cognite-sdk-js/classes/revisions3dapi.html). However, the SDK identifies nodes by node ID, not tree index. It might be necessary to map between the two concepts. The following functions provide such functionality: 
- `async Cognite3DModel.mapNodeIdToTreeIndex(nodeId)`
- `async Cognite3DModel.mapNodeIdsToTreeIndices(nodeIds)`
- `async Cognite3DModel.mapTreeIndexToNodeId(treeIndex)`
- `async Cognite3DModel.mapTreeIndicesToNodeIds(treeIndices)` 

Note that the operation requires communication with CDF servers and should be kept at a minimum. It's recommended to use the functions that accepts a list of nodes to map whenever possible. Batching requests is recommended to achieve the best performance.

Access to node information such as name, bounding box and properties/attributes is done through the [3D revision API](https://cognitedata.github.io/cognite-sdk-js/classes/revisions3dapi.html), specifically:

- [`list3DNodes`](https://cognitedata.github.io/cognite-sdk-js/classes/revisions3dapi.html#list3dnodes) for retrieving a set of nodes using a filter
- [`list3DNodeAncestors`](https://cognitedata.github.io/cognite-sdk-js/classes/revisions3dapi.html#list3dnodeancestors) for retrieving ancestors of a specific node
- [`retrieve3DNodes`](https://cognitedata.github.io/cognite-sdk-js/classes/revisions3dapi.html#retrieve3dnodes) for retrieving a set of nodes identified by their node ids

The API for accessing node information has not changed `@cognite/3d-viewer`, but since Reveal now uses tree indices explicit mapping tree index to node ID is necessary.

## Working with asset mappings

[3D Asset Mappings](https://docs.cognite.com/api/v1/#tag/3D-Asset-Mapping) enables mapping 3D nodes to [assets](https://docs.cognite.com/api/v1/#tag/Assets). A mapping is a link from `assetId` to `nodeId`, so to use these with Reveal it's necessary to [map these to tree indices](#accessing-node-information-and-mapping-between-node-ids-and-tree-indices).

## Ray picking and intersection for handling click events

In `@cognite/3d-viewer` `Cognite3dViewer.getIntersectionFromPixel` optionally accepts a `model`-argument to restrict the result to a single model. Support for this has been removed 
in `@cognite/reveal`. Previously `getIntersectionFromPixel` would return a struct with both `nodeId` and `treeIndex`. Now this has been changed to only include `treeIndex` (to 
determine `nodeId` use `async Cognite3DModel.mapNodeId(nodeId)`).

## Other differences

There are a few other noticeable changes from `@cognite/3d-viewer` and `@cognite/reveal`:

- `@cognite/3d-viewer` supports local caching to reduce the time to load previously opened 3D models. Currently, this is not supported by `@cognite/reveal`, but the need for such functionality is reduced by adding streaming capabilities.
- In `@cognite/3d-viewer` `Cognite3DViewer.addModel(...)` will always return a `Cognite3DModel`. In `@cognite/reveal` this function might also return a `CognitePointCloudModel`. To explicitly add a CAD model or point cloud model use `Cognite3DViewer.addCadModel(...)` or `Cognite3DViewer.addPointCloudModel(...)`
- `Cognite3DViewer.loadCameraFromModel(...)`] has been added for loading camera settings from CDF when available.

## Preparing models

`@cognite/reveal` requires new output file formats which means that 3D models that have been converted before June 2020 might need reconversion. To determine if a model needs reconversion, the [listModelRevisionOutputs API endpoint](https://docs.cognite.com/api/v1/#operation/list3dModelOutputs) can be used with URL parameter `format=reveal-directory`. This can be done using the SDK, e.g.:
```jsx
// Switch these with your project/model identifier
const project = 'publicdata';
const modelId = 4715379429968321;
const revisionId = 5688854005909501; 

// Prepare a SDK client and authenticate
const sdk = new CogniteClient({ appId: 'cognite.reveal.docs.IsModelCompatible' });
sdk.loginWithOAuth({ project });
await sdk.authenticate();

// Request a list of formats
const url = `https://api.cognitedata.com/api/v1/projects/${project}/3d/models/${modelId}/revisions/${revisionId}/outputs`;
const response = await sdk.get(url, { params: { format: 'reveal-directory' } });

// Determine if there's compatible outputs
const hasCompatibleOutputs = response.data.items.length > 0;
alert(`Is model compatible with @cognite/reveal: ${hasCompatibleOutputs}`);
```

Or by using `curl` (requires a [Cognite API key or access token](https://docs.cognite.com/dev/guides/iam/authentication.html#api-keys)):

```bash
> curl "https://api.cognitedata.com/api/v1/projects/$PROJECT/3d/models/$MODELID/revisions/$REVISIONID/outputs?format=reveal-directory" --header 'api-key: $APIKEY'

{
  "items": [
    {
      "format": "reveal-directory",
      "version": 8,
      "blobId": 42723775736403107
    }
  ]
}
```
where `PROJECT`, `MODELID`, `REVISIONID` and `APIKEY` must be set in the environment variables. If the model isn't compatible the response will be an empty list, i.e.
```bash
{
  "items": []
}
```

If the model isn't compatible with `@cognite/reveal`, it must be reprocessed. This can be done by [uploading a new revision in Cognite Data Fusion](https://docs.cognite.com/cdf/3d/guides/3dmodels_upload.html). When uploading a new revision, asset mappings must be recreated. If the node hierarchy in the new revision is identical to the previous model node IDs should be identical and the asset mappings can be copied from one revision to the other by using the [get3DMappings](https://docs.cognite.com/api/v1/#operation/get3DMappings) and [create3DMappings](https://docs.cognite.com/api/v1/#operation/create3DMappings) API endpoints.

Another alternative is to use the experimental 'reprocess' endpoint which generates new model outputs for a 3D model and is less intrusive than uploading a new revision. Since this endpoint is experimental it's not publicly exposed in the API yet. Please contact [lars.moastuen@cognite.com](mailto:lars.moastuen@cognite.com) if you want to explore this option.
