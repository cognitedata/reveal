---
id: concepts
title: Concepts
description: This page explains some basic concepts implemented by Reveal.
---

This page explains some basic concepts implemented by Reveal.

## CAD model structure

CAD models are typically structured in a tree structure, where larger components or groups of components are located near the root and individual pieces of equipment are located in near the leaf nodes. The hierarchy is defined by the source model and is processed and stored in CDF for efficient lookup and traversal. In Reveal, each of the nodes in the tree is called a "3D node". Each of the 3D nodes can have associated properties defined by the source model. Note that not all 3D nodes will contain geometry - in fact in most models only leaf nodes will contain geometry.

### Tree indices and node IDs

When processing 3D models in CDF, two IDs associated with each 3D node; tree index and node ID.

Tree indices are running numbers starting at 0 at the root 3D node increased by one for each traversed node. Node IDs are generated based on the name and placement in the node hierarchy. Node IDs are considered stable as long as the placement in the hierarchy is unchanged, while tree indices are not. For this reason, [Asset Mappings](https://docs.cognite.com/api/v1/#tag/3D-Asset-Mapping) are based on node IDs.

Reveal provides functionality for mapping between the two concepts by using `Cognite3DModel.mapNodeIdsToTreeIndices` and `Cognite3DModel.mapTreeIndicesToNodeIds`. Note however that these functions can be slow.
